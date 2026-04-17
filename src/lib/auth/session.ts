import { getAuthEnvConfig, isAllowedEmail } from "@/lib/auth/config";
import type { SessionTokenPayload } from "@/lib/auth/cookies";
import { verifyToken } from "@/lib/auth/signed-token";

export type SessionUser = { email: string };

export async function readSessionFromTokenValue(
  token: string | undefined,
): Promise<SessionUser | null> {
  if (!token) return null;
  const config = getAuthEnvConfig();
  if (!config) return null;
  const payload = await verifyToken<SessionTokenPayload>(config.secret, token);
  if (!payload || payload.v !== 1 || payload.typ !== "session") return null;
  if (typeof payload.email !== "string" || typeof payload.exp !== "number") return null;
  if (Date.now() > payload.exp * 1000) return null;
  if (!isAllowedEmail(config, payload.email)) return null;
  return { email: payload.email.trim().toLowerCase() };
}
