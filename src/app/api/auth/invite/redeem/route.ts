import { NextResponse } from "next/server";
import { getAuthGateMode, getSessionSecret } from "@/lib/auth/config";
import {
  cookieBaseOptions,
  SESSION_COOKIE,
  SESSION_TTL_SEC,
} from "@/lib/auth/cookies";
import { signToken } from "@/lib/auth/signed-token";
import { clientIpFromRequest, rateLimitUsernameAuth } from "@/lib/team/username-auth-rate-limit";
import { findInviteKeyForSecret, incrementKeyUses } from "@/lib/team/keys-store";
import { registerInvitedUsernameUser, type TeamRole } from "@/lib/team/users-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (getAuthGateMode() === "none") {
    return NextResponse.json({ error: "Authentication is disabled" }, { status: 503 });
  }
  if (getAuthGateMode() === "email") {
    return NextResponse.json(
      {
        error:
          "Invite links are disabled in email auth mode. Request a username on the login page and wait for an admin to approve you.",
      },
      { status: 410 },
    );
  }
  const secret = getSessionSecret();
  if (!secret) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 503 });
  }

  const ip = clientIpFromRequest(request);
  const rl = rateLimitUsernameAuth(`invite:${ip}`);
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
  const inviteKey = typeof o.inviteKey === "string" ? o.inviteKey : "";
  if (!username.trim() || !inviteKey.trim()) {
    return NextResponse.json({ error: "Username and invite key required" }, { status: 400 });
  }

  const found = await findInviteKeyForSecret(inviteKey.trim());
  if (!found.ok) {
    return NextResponse.json({ error: found.error }, { status: 400 });
  }

  let assignRole: TeamRole = "member";
  if (found.key.assignRole === "viewer") assignRole = "viewer";
  else if (found.key.assignRole === "member") assignRole = "member";
  else assignRole = "member";

  const reg = await registerInvitedUsernameUser(username, assignRole === "viewer" ? "viewer" : "member");
  if (!reg.ok) {
    return NextResponse.json({ error: reg.error }, { status: 400 });
  }

  await incrementKeyUses(found.key.id);

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
