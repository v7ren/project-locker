import { NextResponse } from "next/server";
import { getAuthGateMode, getSessionSecret } from "@/lib/auth/config";
import {
  cookieBaseOptions,
  SESSION_COOKIE,
  SESSION_TTL_SEC,
} from "@/lib/auth/cookies";
import { signToken } from "@/lib/auth/signed-token";
import { clientIpFromRequest, rateLimitUsernameAuth } from "@/lib/team/username-auth-rate-limit";
import { registerUsernameUser } from "@/lib/team/users-store";

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
  const rl = rateLimitUsernameAuth(`reg:${ip}`);
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
  const username =
    typeof body === "object" && body !== null && typeof (body as { username?: unknown }).username === "string"
      ? (body as { username: string }).username
      : "";
  if (!username.trim()) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  const reg = await registerUsernameUser(username);
  if (!reg.ok) {
    return NextResponse.json({ error: reg.error }, { status: 400 });
  }

  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SEC;
  const sessionPayload = {
    v: 1 as const,
    typ: "session" as const,
    mode: "user" as const,
    userId: reg.user.id,
    username: reg.user.username,
    exp,
  };
  const sessionToken = await signToken(secret, sessionPayload);

  const res = NextResponse.json({ ok: true, username: reg.user.username, role: reg.user.role });
  res.cookies.set(SESSION_COOKIE, sessionToken, { ...cookieBaseOptions(), maxAge: SESSION_TTL_SEC });
  return res;
}
