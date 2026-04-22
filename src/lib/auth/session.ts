import { getAuthEnvConfig, getAuthGateMode, getSessionSecret, isAllowedEmail } from "@/lib/auth/config";
import { verifyToken } from "@/lib/auth/signed-token";
import { isValidUsernameShape, normalizeTeamUsername } from "@/lib/team/username-policy";

export type SessionUser =
  | { kind: "email"; email: string }
  | { kind: "user"; userId: string; username: string };

type LooseSessionPayload = {
  v?: number;
  typ?: string;
  exp?: number;
  mode?: "email" | "user";
  email?: string;
  userId?: string;
  username?: string;
};

function isLegacyEmailPayload(p: LooseSessionPayload): boolean {
  return typeof p.email === "string" && p.mode === undefined;
}

export async function readSessionFromTokenValue(
  token: string | undefined,
): Promise<SessionUser | null> {
  if (!token) return null;
  const secret = getSessionSecret();
  if (!secret) return null;

  const payload = await verifyToken<LooseSessionPayload>(secret, token);
  if (!payload || payload.v !== 1 || payload.typ !== "session" || typeof payload.exp !== "number") {
    return null;
  }
  if (Date.now() > payload.exp * 1000) return null;

  const gate = getAuthGateMode();

  if (gate === "email") {
    const config = getAuthEnvConfig();
    if (!config) return null;

    /** Same shape as username gate: backup-login, invite, admin-access issue `mode: "user"` JWTs. */
    if (payload.mode === "user") {
      if (typeof payload.userId !== "string" || typeof payload.username !== "string") return null;
      const userId = payload.userId.trim();
      const username = payload.username.trim();
      if (userId.length < 8 || userId.length > 128) return null;
      const normalized = normalizeTeamUsername(username);
      if (!isValidUsernameShape(normalized)) return null;
      return { kind: "user", userId, username };
    }

    if (payload.mode === "email" || isLegacyEmailPayload(payload)) {
      const email = (payload.email ?? "").trim().toLowerCase();
      if (!email) return null;
      if (!isAllowedEmail(config, email)) return null;
      return { kind: "email", email };
    }
    return null;
  }

  if (gate === "username") {
    if (payload.mode !== "user") return null;
    if (typeof payload.userId !== "string" || typeof payload.username !== "string") return null;
    const userId = payload.userId.trim();
    const username = payload.username.trim();
    if (userId.length < 8 || userId.length > 128) return null;
    const normalized = normalizeTeamUsername(username);
    if (!isValidUsernameShape(normalized)) return null;
    /** Do not import team DB here: this module is used from Edge middleware (`node:fs` unavailable). */
    return { kind: "user", userId, username };
  }

  return null;
}
