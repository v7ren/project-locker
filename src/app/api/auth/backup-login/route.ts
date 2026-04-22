import { NextResponse } from "next/server";
import { getAuthGateMode, getSessionSecret, normalizeAuthEmail } from "@/lib/auth/config";
import {
  cookieBaseOptions,
  SESSION_COOKIE,
  SESSION_TTL_SEC,
  type SessionTokenPayload,
} from "@/lib/auth/cookies";
import { signToken } from "@/lib/auth/signed-token";
import { clientIpFromRequest, rateLimitUsernameAuth } from "@/lib/team/username-auth-rate-limit";
import { resolveTeamUserByNameOrEmail, verifyUserBackupLoginKey } from "@/lib/team/users-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (getAuthGateMode() === "none") {
    return NextResponse.json({ error: "Authentication is disabled" }, { status: 503 });
  }
  const secret = getSessionSecret();
  if (!secret) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 503 });
  }

  const ip = clientIpFromRequest(request);
  const rl = rateLimitUsernameAuth(`backup:${ip}`);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts", retryAfterSec: rl.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const o = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const key = typeof o.key === "string" ? o.key : "";
  const identifierRaw =
    typeof o.identifier === "string"
      ? o.identifier
      : typeof o.username === "string"
        ? o.username
        : typeof o.email === "string"
          ? o.email
          : "";
  const identifier = identifierRaw.trim();
  if (!identifier || !key.trim()) {
    return NextResponse.json(
      { error: "identifier (team username or account email) and backup key required" },
      { status: 400 },
    );
  }

  const user = await resolveTeamUserByNameOrEmail(identifier);
  if (!user || !user.backupLoginKeyHash) {
    return NextResponse.json({ error: "Invalid account or key, or backup key not set yet" }, { status: 401 });
  }
  if (user.memberStatus === "pending") {
    return NextResponse.json({ error: "Account is pending admin approval" }, { status: 403 });
  }
  const ok = await verifyUserBackupLoginKey(user, key);
  if (!ok) {
    return NextResponse.json({ error: "Invalid username or key" }, { status: 401 });
  }

  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SEC;
  const gate = getAuthGateMode();
  let sessionPayload: SessionTokenPayload;
  if (gate === "email" && user.email) {
    sessionPayload = {
      v: 1,
      typ: "session",
      mode: "email",
      email: normalizeAuthEmail(user.email),
      exp,
    };
  } else {
    sessionPayload = {
      v: 1,
      typ: "session",
      mode: "user",
      userId: user.id,
      username: user.username,
      exp,
    };
  }
  const sessionToken = await signToken(secret, sessionPayload);

  const res = NextResponse.json({ ok: true, username: user.username });
  res.cookies.set(SESSION_COOKIE, sessionToken, { ...cookieBaseOptions(), maxAge: SESSION_TTL_SEC });
  return res;
}
