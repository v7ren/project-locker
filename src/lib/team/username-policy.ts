function splitList(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[,;\n\r]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0);
}

/** Usernames nobody may register or use via admin create (comma-separated, case-insensitive). */
export function getLockedUsernames(): Set<string> {
  return new Set(splitList(process.env.AUTH_USERNAME_LOCKED));
}

/** Usernames only an admin may assign (self-register rejected; admin creates user via API). */
export function getAdminOnlyUsernames(): Set<string> {
  return new Set(splitList(process.env.AUTH_USERNAME_ADMIN_ONLY));
}

export function normalizeTeamUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Allowed chars: letters, digits, underscore; length 2–32 after trim. */
export function isValidUsernameShape(normalized: string): boolean {
  return /^[a-z0-9_]{2,32}$/.test(normalized);
}

const BUILT_IN_RESERVED = new Set(
  ["admin", "root", "system", "api", "login", "logout", "public", "docs", "calendar", "team", "profile"].map((s) =>
    s.toLowerCase(),
  ),
);

export function isBuiltInReservedUsername(normalized: string): boolean {
  return BUILT_IN_RESERVED.has(normalized);
}

export function usernameBlockedReason(normalized: string): string | null {
  if (!isValidUsernameShape(normalized)) {
    return "Username must be 2–32 characters: letters, digits, or underscore.";
  }
  if (getLockedUsernames().has(normalized)) {
    return "That username is reserved.";
  }
  if (getAdminOnlyUsernames().has(normalized)) {
    return "That username is reserved for admins — ask an admin to create it.";
  }
  if (isBuiltInReservedUsername(normalized)) {
    return "That username is not available.";
  }
  return null;
}
