import fs from "node:fs/promises";
import { ensureTeamDir, teamKeysFile } from "@/lib/team/paths";
import { hashSecret, verifySecret } from "@/lib/team/crypto-key";
import type { TeamRole } from "@/lib/team/users-store";

export type TeamKeyKind = "invite" | "redeem";

export type RedeemEffect = "promote_to_member";

export type TeamKeyRecord = {
  id: string;
  kind: TeamKeyKind;
  label: string;
  tokenHash: string;
  createdAt: string;
  expiresAt: string | null;
  maxUses: number | null;
  uses: number;
  /** New user's role when kind === "invite" */
  assignRole: TeamRole;
  /** For kind === "redeem": applied to the redeeming user */
  redeemEffect: RedeemEffect;
};

type KeysFile = {
  version: 1;
  keys: TeamKeyRecord[];
};

let keysWriteChain: Promise<unknown> = Promise.resolve();

function withKeysLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = keysWriteChain.then(fn, fn);
  keysWriteChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readKeysFile(): Promise<KeysFile> {
  await ensureTeamDir();
  const file = teamKeysFile();
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw) as KeysFile;
    if (parsed.version !== 1 || !Array.isArray(parsed.keys)) {
      return { version: 1, keys: [] };
    }
    return parsed;
  } catch {
    return { version: 1, keys: [] };
  }
}

async function writeKeysFile(data: KeysFile): Promise<void> {
  await ensureTeamDir();
  const file = teamKeysFile();
  const tmp = `${file}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 0), "utf8");
  await fs.rename(tmp, file);
}

export type TeamKeyPublic = Omit<TeamKeyRecord, "tokenHash">;

export async function listTeamKeys(): Promise<TeamKeyPublic[]> {
  const f = await readKeysFile();
  return f.keys.map(({ tokenHash: _t, ...rest }) => rest);
}

export type CreateKeyInput = {
  kind: TeamKeyKind;
  label: string;
  assignRole: TeamRole;
  redeemEffect: RedeemEffect;
  expiresAt: string | null;
  maxUses: number | null;
};

export type CreateKeyResult =
  | { ok: true; record: TeamKeyPublic; secretPlain: string }
  | { ok: false; error: string };

export async function createTeamKey(input: CreateKeyInput): Promise<CreateKeyResult> {
  const secretPlain = `${crypto.randomUUID().replace(/-/g, "")}${crypto.randomUUID().replace(/-/g, "")}`;
  const tokenHash = await hashSecret(secretPlain);
  const row: TeamKeyRecord = {
    id: crypto.randomUUID(),
    kind: input.kind,
    label: input.label.trim() || "Untitled",
    tokenHash,
    createdAt: new Date().toISOString(),
    expiresAt: input.expiresAt,
    maxUses: input.maxUses,
    uses: 0,
    assignRole: input.assignRole,
    redeemEffect: input.redeemEffect,
  };
  return withKeysLock(async () => {
    const data = await readKeysFile();
    data.keys.push(row);
    await writeKeysFile(data);
    const { tokenHash: _t, ...pub } = row;
    return { ok: true, record: pub, secretPlain };
  });
}

export async function deleteTeamKey(id: string): Promise<boolean> {
  return withKeysLock(async () => {
    const data = await readKeysFile();
    const before = data.keys.length;
    data.keys = data.keys.filter((k) => k.id !== id);
    if (data.keys.length === before) return false;
    await writeKeysFile(data);
    return true;
  });
}

/**
 * Team admin shows secrets like `redeem:…` / `invite:…` / `member:…` for copy-paste.
 * Strip that prefix so pasted values still verify.
 */
export function normalizePastedTeamKeySecret(raw: string): string {
  let s = raw.trim();
  const m = /^(invite|redeem|member|admin):\s*(.+)$/i.exec(s);
  if (m?.[2]) return m[2].trim();
  return s;
}

/**
 * Validates invite secret and returns the matching key row (caller applies user creation + increments uses).
 */
export async function findInviteKeyForSecret(secret: string): Promise<
  | { ok: true; key: TeamKeyRecord }
  | { ok: false; error: string }
> {
  const plain = normalizePastedTeamKeySecret(secret);
  const data = await readKeysFile();
  for (const key of data.keys) {
    if (key.kind !== "invite") continue;
    if (await verifySecret(plain, key.tokenHash)) {
      if (key.expiresAt && Date.parse(key.expiresAt) <= Date.now()) {
        return { ok: false, error: "This key has expired." };
      }
      if (key.maxUses !== null && key.uses >= key.maxUses) {
        return { ok: false, error: "This key has no uses left." };
      }
      return { ok: true, key };
    }
  }
  return { ok: false, error: "Invalid invite key." };
}

export async function incrementKeyUses(keyId: string): Promise<void> {
  await withKeysLock(async () => {
    const data = await readKeysFile();
    const k = data.keys.find((x) => x.id === keyId);
    if (k) {
      k.uses += 1;
      await writeKeysFile(data);
    }
  });
}

export type FindRedeemKeyResult =
  | { ok: true; key: TeamKeyRecord }
  | { ok: false; error: string };

export async function findRedeemKeyForSecret(secret: string): Promise<FindRedeemKeyResult> {
  const plain = normalizePastedTeamKeySecret(secret);
  const data = await readKeysFile();
  for (const key of data.keys) {
    if (key.kind !== "redeem") continue;
    if (await verifySecret(plain, key.tokenHash)) {
      if (key.expiresAt && Date.parse(key.expiresAt) <= Date.now()) {
        return { ok: false, error: "This key has expired." };
      }
      if (key.maxUses !== null && key.uses >= key.maxUses) {
        return { ok: false, error: "This key has no uses left." };
      }
      return { ok: true, key };
    }
  }
  for (const key of data.keys) {
    if (key.kind !== "invite") continue;
    if (await verifySecret(plain, key.tokenHash)) {
      return {
        ok: false,
        error:
          "That value matches an invite key. Invite keys are for the login page (new username). This field only accepts redeem keys (create one with kind “Redeem” on Team admin).",
      };
    }
  }
  return { ok: false, error: "Invalid redeem key." };
}
