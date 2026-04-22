import { NextResponse } from "next/server";
import { getAuthGateMode, getSessionSecret, normalizeAuthEmail } from "@/lib/auth/config";
import {
  cookieBaseOptions,
  SESSION_COOKIE,
  SESSION_TTL_SEC,
  type SessionTokenPayload,
} from "@/lib/auth/cookies";
import { signToken } from "@/lib/auth/signed-token";
import { normalizePastedTeamKeySecret } from "@/lib/team/keys-store";
import { clientIpFromRequest, rateLimitUsernameAuth } from "@/lib/team/username-auth-rate-limit";
import { findApprovedUserByMemberLoginKeyPlain, teamUserIsAllowlistedOtpAdmin } from "@/lib/team/users-store";

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
  const rl = rateLimitUsernameAuth(`keylogin:${ip}`);
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
  const key = typeof o.key === "string" ? normalizePastedTeamKeySecret(o.key) : "";
  if (!key) {
    return NextResponse.json({ error: "Access key required" }, { status: 400 });
  }

  const user = await findApprovedUserByMemberLoginKeyPlain(key);
  if (!user) {
    return NextResponse.json({ error: "Invalid or unknown access key" }, { status: 401 });
  }

  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SEC;
  const gate = getAuthGateMode();
  let sessionPayload: SessionTokenPayload;
  if (gate === "email" && user.email && teamUserIsAllowlistedOtpAdmin(user)) {
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
