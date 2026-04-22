import fs from "node:fs/promises";
import {
  getLockedUsernames,
  isBuiltInReservedUsername,
  normalizeTeamUsername,
  usernameBlockedReason,
  isValidUsernameShape,
} from "@/lib/team/username-policy";
import { ensureTeamDir, teamUsersFile } from "@/lib/team/paths";
import { getAuthEnvConfig, getAuthGateMode, isAllowedEmail, normalizeAuthEmail } from "@/lib/auth/config";
import { hashSecret, randomKeyToken, verifySecret } from "@/lib/team/crypto-key";

export type TeamRole = "member" | "admin" | "viewer";

/** Email-gate: self-serve signups start pending until an admin approves (then get a login key). */
export type MemberStatus = "pending" | "approved";

export type TeamUserRecord = {
  id: string;
  username: string;
  usernameNormalized: string;
  email: string | null;
  role: TeamRole;
  memberStatus: MemberStatus;
  createdAt: string;
  /** 0–360; calendar accent only */
  hue: number;
  /** Shown on calendar (emoji or short text) */
  avatarEmoji: string;
  /** Hashed member / optional admin login key (single-field key login). */
  backupLoginKeyHash: string | null;
  adminAccessKeyHash: string | null;
};

type UsersFile = {
  version: 1 | 2;
  users: unknown[];
};

function clampHue(n: number): number {
  if (!Number.isFinite(n)) return 210;
  const x = Math.round(n) % 360;
  return x < 0 ? x + 360 : x;
}

function migrateUserRow(raw: unknown): TeamUserRecord {
  const o = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  const id = typeof o.id === "string" ? o.id : crypto.randomUUID();
  const username = typeof o.username === "string" ? o.username : "user";
  const usernameNormalized =
    typeof o.usernameNormalized === "string" ? o.usernameNormalized : normalizeTeamUsername(username);
  const email = typeof o.email === "string" ? o.email : null;
  let role: TeamRole = "member";
  if (o.role === "admin" || o.role === "member" || o.role === "viewer") {
    role = o.role;
  }
  let memberStatus: MemberStatus = "approved";
  if (o.memberStatus === "pending") memberStatus = "pending";
  else if (o.memberStatus === "approved") memberStatus = "approved";
  const createdAt = typeof o.createdAt === "string" ? o.createdAt : new Date().toISOString();
  const hue = clampHue(typeof o.hue === "number" ? o.hue : 210);
  const avatarEmoji =
    typeof o.avatarEmoji === "string" ? o.avatarEmoji.slice(0, 8) : "";
  const backupLoginKeyHash =
    typeof o.backupLoginKeyHash === "string" ? o.backupLoginKeyHash : null;
  const adminAccessKeyHash =
    typeof o.adminAccessKeyHash === "string" ? o.adminAccessKeyHash : null;
  return {
    id,
    username,
    usernameNormalized,
    email,
    role,
    memberStatus,
    createdAt,
    hue,
    avatarEmoji,
    backupLoginKeyHash,
    adminAccessKeyHash,
  };
}

function normalizeUsersFile(parsed: UsersFile): { version: 2; users: TeamUserRecord[] } {
  const users = (Array.isArray(parsed.users) ? parsed.users : []).map(migrateUserRow);
  return { version: 2, users };
}

let usersWriteChain: Promise<unknown> = Promise.resolve();

/** Allowlisted email accounts (email OTP) always act as team admins when approved. */
export function teamUserIsAllowlistedOtpAdmin(user: TeamUserRecord): boolean {
  if (getAuthGateMode() !== "email") return false;
  const config = getAuthEnvConfig();
  return Boolean(config && user.email && isAllowedEmail(config, user.email));
}

function actorIsEffectiveAdmin(actor: TeamUserRecord): boolean {
  if (teamUserIsAllowlistedOtpAdmin(actor)) return true;
  return actor.role === "admin";
}

function withUsersLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = usersWriteChain.then(fn, fn);
  usersWriteChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readUsersFile(): Promise<{ version: 2; users: TeamUserRecord[] }> {
  await ensureTeamDir();
  const file = teamUsersFile();
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw) as UsersFile;
    if (!Array.isArray(parsed.users)) {
      return { version: 2, users: [] };
    }
    return normalizeUsersFile(parsed);
  } catch {
    return { version: 2, users: [] };
  }
}

async function writeUsersFile(data: { version: 2; users: TeamUserRecord[] }): Promise<void> {
  await ensureTeamDir();
  const file = teamUsersFile();
  const tmp = `${file}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 0), "utf8");
  await fs.rename(tmp, file);
}

export async function listTeamUsers(): Promise<TeamUserRecord[]> {
  const f = await readUsersFile();
  return [...f.users];
}

export async function getTeamUserById(id: string): Promise<TeamUserRecord | null> {
  const f = await readUsersFile();
  return f.users.find((u) => u.id === id) ?? null;
}

export async function getTeamUserByEmail(email: string): Promise<TeamUserRecord | null> {
  const e = normalizeAuthEmail(email);
  const f = await readUsersFile();
  return f.users.find((u) => u.email && normalizeAuthEmail(u.email) === e) ?? null;
}

export async function getTeamUserByUsernameNormalized(
  normalized: string,
): Promise<TeamUserRecord | null> {
  const f = await readUsersFile();
  return f.users.find((u) => u.usernameNormalized === normalized) ?? null;
}

function uniqueUsernameFromLocalPart(base: string, taken: Set<string>): string {
  const clean = base
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 32);
  const root = (clean.length >= 2 ? clean : `user_${clean}`).slice(0, 32) || "user";
  if (!taken.has(root)) return root;
  for (let i = 1; i < 10_000; i++) {
    const suffix = `_${i}`;
    const cut = root.slice(0, Math.max(2, 32 - suffix.length));
    const candidate = `${cut}${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${root}_${Date.now()}`;
}

export type EnsureTeamUserFromEmailResult = {
  user: TeamUserRecord;
  /** A new row was inserted (first OTP sign-in for this allowlisted email). */
  created: boolean;
};

/**
 * Ensures a team row exists for an OTP email user (allowlist only).
 * Allowlisted admins sign in with email OTP only (no member login key required).
 */
export async function ensureTeamUserFromEmail(email: string): Promise<EnsureTeamUserFromEmailResult> {
  const normalizedEmail = normalizeAuthEmail(email);
  return withUsersLock(async () => {
    const data = await readUsersFile();
    const existing = data.users.find(
      (u) => u.email && normalizeAuthEmail(u.email) === normalizedEmail,
    );
    if (existing) {
      let dirty = false;
      if (existing.role !== "admin") {
        existing.role = "admin";
        dirty = true;
      }
      if (existing.memberStatus !== "approved") {
        existing.memberStatus = "approved";
        dirty = true;
      }
      if (dirty) await writeUsersFile(data);
      return { user: existing, created: false };
    }

    const taken = new Set(data.users.map((u) => u.usernameNormalized));
    const local = normalizedEmail.split("@")[0] ?? "user";
    const username = uniqueUsernameFromLocalPart(local, taken);
    const usernameNormalized = normalizeTeamUsername(username);
    const row: TeamUserRecord = {
      id: crypto.randomUUID(),
      username,
      usernameNormalized,
      email: normalizedEmail,
      role: "admin",
      memberStatus: "approved",
      createdAt: new Date().toISOString(),
      hue: 210,
      avatarEmoji: "",
      backupLoginKeyHash: null,
      adminAccessKeyHash: null,
    };
    data.users.push(row);
    await writeUsersFile(data);
    return { user: row, created: true };
  });
}

export type RegisterUsernameResult =
  | { ok: true; user: TeamUserRecord }
  | { ok: false; error: string };

export async function registerUsernameUser(rawUsername: string): Promise<RegisterUsernameResult> {
  const usernameNormalized = normalizeTeamUsername(rawUsername);
  const block = usernameBlockedReason(usernameNormalized);
  if (block) return { ok: false, error: block };

  return withUsersLock(async () => {
    const data = await readUsersFile();
    if (data.users.some((u) => u.usernameNormalized === usernameNormalized)) {
      return { ok: false, error: "That username is already taken." };
    }
    const role: TeamRole = data.users.length === 0 ? "admin" : "member";
    const row: TeamUserRecord = {
      id: crypto.randomUUID(),
      username: rawUsername.trim(),
      usernameNormalized,
      email: null,
      role,
      memberStatus: "approved",
      createdAt: new Date().toISOString(),
      hue: 210,
      avatarEmoji: "",
      backupLoginKeyHash: null,
      adminAccessKeyHash: null,
    };
    data.users.push(row);
    await writeUsersFile(data);
    return { ok: true, user: row };
  });
}

export type AdminCreateUsernameUserResult =
  | { ok: true; user: TeamUserRecord; revealedMemberLoginKey: string }
  | { ok: false; error: string };

export async function adminCreateUsernameUser(
  actor: TeamUserRecord,
  rawUsername: string,
  role: TeamRole = "member",
): Promise<AdminCreateUsernameUserResult> {
  if (!actorIsEffectiveAdmin(actor)) {
    return { ok: false, error: "Only admins can create users this way." };
  }
  if (role === "admin") {
    return { ok: false, error: "Cannot assign admin role when creating a user." };
  }
  const usernameNormalized = normalizeTeamUsername(rawUsername);
  if (!isValidUsernameShape(usernameNormalized)) {
    return { ok: false, error: "Username must be 2–32 characters: letters, digits, or underscore." };
  }
  if (getLockedUsernames().has(usernameNormalized)) {
    return { ok: false, error: "That username is reserved (locked)." };
  }
  if (isBuiltInReservedUsername(usernameNormalized)) {
    return { ok: false, error: "That username is not available." };
  }

  return withUsersLock(async () => {
    const data = await readUsersFile();
    if (data.users.some((u) => u.usernameNormalized === usernameNormalized)) {
      return { ok: false, error: "That username is already taken." };
    }
    const plain = randomKeyToken();
    const backupLoginKeyHash = await hashSecret(plain);
    const row: TeamUserRecord = {
      id: crypto.randomUUID(),
      username: rawUsername.trim(),
      usernameNormalized,
      email: null,
      role,
      memberStatus: "approved",
      createdAt: new Date().toISOString(),
      hue: 210,
      avatarEmoji: "",
      backupLoginKeyHash,
      adminAccessKeyHash: null,
    };
    data.users.push(row);
    await writeUsersFile(data);
    return { ok: true, user: row, revealedMemberLoginKey: plain };
  });
}

export type RegisterInvitedResult =
  | { ok: true; user: TeamUserRecord }
  | { ok: false; error: string };

/** Creates a username account from an invite key (role member or viewer only). */
export async function registerInvitedUsernameUser(
  rawUsername: string,
  role: "member" | "viewer",
): Promise<RegisterInvitedResult> {
  const usernameNormalized = normalizeTeamUsername(rawUsername);
  const block = usernameBlockedReason(usernameNormalized);
  if (block) return { ok: false, error: block };

  return withUsersLock(async () => {
    const data = await readUsersFile();
    if (data.users.some((u) => u.usernameNormalized === usernameNormalized)) {
      return { ok: false, error: "That username is already taken." };
    }
    const row: TeamUserRecord = {
      id: crypto.randomUUID(),
      username: rawUsername.trim(),
      usernameNormalized,
      email: null,
      role,
      memberStatus: "approved",
      createdAt: new Date().toISOString(),
      hue: 210,
      avatarEmoji: "",
      backupLoginKeyHash: null,
      adminAccessKeyHash: null,
    };
    data.users.push(row);
    await writeUsersFile(data);
    return { ok: true, user: row };
  });
}

export type PendingRegistrationResult =
  | { ok: true; username: string }
  | { ok: false; error: string };

/** Public self-serve signup (email auth mode): pending until an admin approves. */
export async function createPendingMemberRegistration(rawUsername: string): Promise<PendingRegistrationResult> {
  if (getAuthGateMode() !== "email") {
    return { ok: false, error: "Registration is only available when email authentication is enabled." };
  }
  const usernameNormalized = normalizeTeamUsername(rawUsername);
  const block = usernameBlockedReason(usernameNormalized);
  if (block) return { ok: false, error: block };

  return withUsersLock(async () => {
    const data = await readUsersFile();
    if (data.users.some((u) => u.usernameNormalized === usernameNormalized)) {
      return { ok: false, error: "That username is already taken." };
    }
    const row: TeamUserRecord = {
      id: crypto.randomUUID(),
      username: rawUsername.trim(),
      usernameNormalized,
      email: null,
      role: "member",
      memberStatus: "pending",
      createdAt: new Date().toISOString(),
      hue: 210,
      avatarEmoji: "",
      backupLoginKeyHash: null,
      adminAccessKeyHash: null,
    };
    data.users.push(row);
    await writeUsersFile(data);
    return { ok: true, username: row.username };
  });
}

/** Match a single pasted access key against approved users (timing-safe verify per candidate). */
export async function findApprovedUserByMemberLoginKeyPlain(plain: string): Promise<TeamUserRecord | null> {
  const trimmed = plain.trim();
  if (!trimmed) return null;
  const users = await listTeamUsers();
  for (const u of users) {
    if (u.memberStatus !== "approved") continue;
    if (!u.backupLoginKeyHash) continue;
    if (await verifySecret(trimmed, u.backupLoginKeyHash)) return u;
  }
  return null;
}

export type AdminMemberKeyRevealResult =
  | { ok: true; user: TeamUserRecord; revealedMemberLoginKey: string }
  | { ok: false; error: string };

export async function adminApprovePendingMember(
  actor: TeamUserRecord,
  targetId: string,
): Promise<AdminMemberKeyRevealResult> {
  if (!actorIsEffectiveAdmin(actor)) {
    return { ok: false, error: "Only admins can approve members." };
  }
  return withUsersLock(async () => {
    const data = await readUsersFile();
    const u = data.users.find((x) => x.id === targetId);
    if (!u) return { ok: false, error: "User not found." };
    if (teamUserIsAllowlistedOtpAdmin(u)) {
      return { ok: false, error: "Cannot approve an allowlisted admin account." };
    }
    if (u.memberStatus !== "pending") {
      return { ok: false, error: "This user is not pending approval." };
    }
    const plain = randomKeyToken();
    u.backupLoginKeyHash = await hashSecret(plain);
    u.memberStatus = "approved";
    await writeUsersFile(data);
    return { ok: true, user: u, revealedMemberLoginKey: plain };
  });
}

export async function adminRegenerateMemberLoginKey(
  actor: TeamUserRecord,
  targetId: string,
): Promise<AdminMemberKeyRevealResult> {
  if (!actorIsEffectiveAdmin(actor)) {
    return { ok: false, error: "Only admins can rotate member keys." };
  }
  return withUsersLock(async () => {
    const data = await readUsersFile();
    const u = data.users.find((x) => x.id === targetId);
    if (!u) return { ok: false, error: "User not found." };
    if (teamUserIsAllowlistedOtpAdmin(u)) {
      return { ok: false, error: "Allowlisted admins sign in with email OTP only." };
    }
    if (u.memberStatus !== "approved") {
      return { ok: false, error: "Approve the user before issuing a login key." };
    }
    const plain = randomKeyToken();
    u.backupLoginKeyHash = await hashSecret(plain);
    await writeUsersFile(data);
    return { ok: true, user: u, revealedMemberLoginKey: plain };
  });
}

export async function verifyUserBackupLoginKey(user: TeamUserRecord, plain: string): Promise<boolean> {
  return verifySecret(plain, user.backupLoginKeyHash);
}

export async function verifyUserAdminAccessKey(user: TeamUserRecord, plain: string): Promise<boolean> {
  return verifySecret(plain, user.adminAccessKeyHash);
}

export async function setSelfProfileFields(
  userId: string,
  patch: { hue?: number; avatarEmoji?: string },
): Promise<TeamUserRecord | null> {
  return withUsersLock(async () => {
    const data = await readUsersFile();
    const u = data.users.find((x) => x.id === userId);
    if (!u) return null;
    if (patch.hue !== undefined) u.hue = clampHue(patch.hue);
    if (patch.avatarEmoji !== undefined) u.avatarEmoji = patch.avatarEmoji.trim().slice(0, 8);
    await writeUsersFile(data);
    return u;
  });
}

export async function setSelfBackupLoginKey(
  userId: string,
  plain: string | null,
): Promise<TeamUserRecord | null> {
  return withUsersLock(async () => {
    const data = await readUsersFile();
    const u = data.users.find((x) => x.id === userId);
    if (!u) return null;
    if (plain === null || plain.trim() === "") {
      u.backupLoginKeyHash = null;
    } else {
      u.backupLoginKeyHash = await hashSecret(plain.trim());
    }
    await writeUsersFile(data);
    return u;
  });
}

/** Replaces backup key with a new random secret; returns plaintext once (not persisted). */
export async function generateRandomSelfBackupLoginKey(
  userId: string,
): Promise<{ user: TeamUserRecord; plain: string } | null> {
  return withUsersLock(async () => {
    const data = await readUsersFile();
    const u = data.users.find((x) => x.id === userId);
    if (!u) return null;
    const plain = randomKeyToken();
    u.backupLoginKeyHash = await hashSecret(plain);
    await writeUsersFile(data);
    return { user: u, plain };
  });
}

export async function promoteUserToMember(userId: string): Promise<TeamUserRecord | null> {
  return withUsersLock(async () => {
    const data = await readUsersFile();
    const u = data.users.find((x) => x.id === userId);
    if (!u) return null;
    if (u.role === "viewer") u.role = "member";
    await writeUsersFile(data);
    return u;
  });
}

export type AdminPatchUserInput = {
  role?: TeamRole;
  /** When true, clears admin access key */
  clearAdminAccessKey?: boolean;
};

export type AdminSetAccessKeyResult =
  | { ok: true; user: TeamUserRecord; revealedAdminKey: string | null }
  | { ok: false; error: string };

export async function adminPatchUserRecord(
  actor: TeamUserRecord,
  targetId: string,
  patch: AdminPatchUserInput,
  newAdminAccessPlain?: string | null,
): Promise<AdminSetAccessKeyResult> {
  if (!actorIsEffectiveAdmin(actor)) {
    return { ok: false, error: "Only admins can update users." };
  }
  if (actor.id === targetId && patch.role === "viewer") {
    return { ok: false, error: "You cannot demote yourself to viewer." };
  }

  return withUsersLock(async () => {
    const data = await readUsersFile();
    const u = data.users.find((x) => x.id === targetId);
    if (!u) return { ok: false, error: "User not found." };

    let revealed: string | null = null;

    if (patch.role !== undefined) {
      if (getAuthGateMode() === "email") {
        if (patch.role === "admin" && !teamUserIsAllowlistedOtpAdmin(u)) {
          return { ok: false, error: "In email auth mode, only allowlisted email accounts can be admins." };
        }
        if (teamUserIsAllowlistedOtpAdmin(u) && patch.role !== "admin") {
          return { ok: false, error: "Allowlisted admin accounts cannot change role." };
        }
      }
      u.role = patch.role;
    }
    if (patch.clearAdminAccessKey) {
      u.adminAccessKeyHash = null;
    }
    if (newAdminAccessPlain !== undefined) {
      if (newAdminAccessPlain === null || newAdminAccessPlain.trim() === "") {
        u.adminAccessKeyHash = null;
        revealed = null;
      } else {
        revealed = newAdminAccessPlain.trim();
        u.adminAccessKeyHash = await hashSecret(revealed);
      }
    }

    await writeUsersFile(data);
    return { ok: true, user: u, revealedAdminKey: revealed };
  });
}

export async function loginUsernameUser(rawUsername: string): Promise<TeamUserRecord | null> {
  const usernameNormalized = normalizeTeamUsername(rawUsername);
  if (!usernameNormalized) return null;
  const f = await readUsersFile();
  return f.users.find((u) => u.usernameNormalized === usernameNormalized) ?? null;
}

/** Team username, or sign-in email that matches a team row (for backup / admin-access login). */
export async function resolveTeamUserByNameOrEmail(raw: string): Promise<TeamUserRecord | null> {
  const s = raw.trim();
  if (!s) return null;
  if (s.includes("@")) {
    return getTeamUserByEmail(normalizeAuthEmail(s));
  }
  return loginUsernameUser(s);
}
