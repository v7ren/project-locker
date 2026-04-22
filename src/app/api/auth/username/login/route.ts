import { NextResponse } from "next/server";
import { getAuthGateMode, getSessionSecret } from "@/lib/auth/config";
import {
  cookieBaseOptions,
  SESSION_COOKIE,
  SESSION_TTL_SEC,
} from "@/lib/auth/cookies";
import { signToken } from "@/lib/auth/signed-token";
import { clientIpFromRequest, rateLimitUsernameAuth } from "@/lib/team/username-auth-rate-limit";
import { loginUsernameUser, verifyUserBackupLoginKey } from "@/lib/team/users-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (getAuthGateMode() !== "username") {
    return NextResponse.json({ error: "Username sign-in is not enabled" }, { status: 503 });
  }
  const secret = getSessionSecret();
  if (!secret) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 503 });
  }

  const ip = clientIpFromRequest(request);
  const rl = rateLimitUsernameAuth(`login:${ip}`);
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
  const username = typeof o.username === "string" ? o.username : "";
  const key = typeof o.key === "string" ? o.key : "";
  if (!username.trim()) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  const user = await loginUsernameUser(username);
  if (!user) {
    return NextResponse.json({ error: "Unknown username" }, { status: 401 });
  }
  if (user.memberStatus === "pending") {
    return NextResponse.json({ error: "Account is pending admin approval" }, { status: 403 });
  }
  if (user.backupLoginKeyHash) {
    if (!key.trim()) {
      return NextResponse.json({ error: "Backup login key required for this account" }, { status: 401 });
    }
    const ok = await verifyUserBackupLoginKey(user, key);
    if (!ok) {
      return NextResponse.json({ error: "Invalid backup login key" }, { status: 401 });
    }
  }

  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SEC;
  const sessionPayload = {
    v: 1 as const,
    typ: "session" as const,
    mode: "user" as const,
    userId: user.id,
    username: user.username,
    exp,
  };
  const sessionToken = await signToken(secret, sessionPayload);

  const res = NextResponse.json({ ok: true, username: user.username, role: user.role });
  res.cookies.set(SESSION_COOKIE, sessionToken, { ...cookieBaseOptions(), maxAge: SESSION_TTL_SEC });
  return res;
}
