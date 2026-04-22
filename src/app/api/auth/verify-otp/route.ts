import { Buffer } from "node:buffer";
import { NextResponse } from "next/server";
import { getAuthEnvConfig, isAllowedEmail, normalizeAuthEmail } from "@/lib/auth/config";
import { ensureTeamUserFromEmail } from "@/lib/team/users-store";
import {
  cookieBaseOptions,
  OTP_COOKIE,
  SESSION_COOKIE,
  SESSION_TTL_SEC,
  type OtpTokenPayload,
  type SessionTokenPayload,
} from "@/lib/auth/cookies";
import {
  bumpVerifyFailure,
  clearVerifyAttempts,
  isVerifyLocked,
  verifyAttemptKey,
} from "@/lib/auth/rate-limit";
import { verifyOtpCode } from "@/lib/auth/otp-node";
import { signToken, verifyToken } from "@/lib/auth/signed-token";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const config = getAuthEnvConfig();
  if (!config) {
    return NextResponse.json({ error: "Auth is not configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const code =
    typeof body === "object" && body !== null && typeof (body as { code?: unknown }).code === "string"
      ? (body as { code: string }).code.trim().replace(/\s+/g, "")
      : "";
  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "Enter the 6-digit code" }, { status: 400 });
  }

  const otpCookie = request.headers.get("cookie");
  let otpToken: string | undefined;
  if (otpCookie) {
    for (const part of otpCookie.split(";")) {
      const [k, ...rest] = part.trim().split("=");
      if (k === OTP_COOKIE) {
        otpToken = decodeURIComponent(rest.join("="));
        break;
      }
    }
  }
  if (!otpToken) {
    return NextResponse.json({ error: "Request a new code first" }, { status: 400 });
  }

  const payload = await verifyToken<OtpTokenPayload>(config.secret, otpToken);
  if (!payload || payload.v !== 1 || payload.typ !== "otp") {
    const res = NextResponse.json({ error: "Invalid or expired code" }, { status: 401 });
    res.cookies.set(OTP_COOKIE, "", { ...cookieBaseOptions(), maxAge: 0 });
    return res;
  }
  if (typeof payload.email !== "string" || typeof payload.exp !== "number") {
    const res = NextResponse.json({ error: "Invalid or expired code" }, { status: 401 });
    res.cookies.set(OTP_COOKIE, "", { ...cookieBaseOptions(), maxAge: 0 });
    return res;
  }
  if (Date.now() > payload.exp * 1000) {
    const res = NextResponse.json({ error: "Code expired" }, { status: 401 });
    res.cookies.set(OTP_COOKIE, "", { ...cookieBaseOptions(), maxAge: 0 });
    return res;
  }
  const email = normalizeAuthEmail(payload.email);
  if (!isAllowedEmail(config, email)) {
    const res = NextResponse.json({ error: "Invalid or expired code" }, { status: 401 });
    res.cookies.set(OTP_COOKIE, "", { ...cookieBaseOptions(), maxAge: 0 });
    return res;
  }

  const attemptKey = verifyAttemptKey(email, payload.saltB64);
  if (isVerifyLocked(attemptKey, payload.exp * 1000)) {
    const res = NextResponse.json({ error: "Too many attempts" }, { status: 429 });
    res.cookies.set(OTP_COOKIE, "", { ...cookieBaseOptions(), maxAge: 0 });
    clearVerifyAttempts(attemptKey);
    return res;
  }

  let salt: Buffer;
  let expectedHash: Buffer;
  try {
    salt = Buffer.from(payload.saltB64, "base64url");
    expectedHash = Buffer.from(payload.hashB64, "base64url");
  } catch {
    const res = NextResponse.json({ error: "Invalid or expired code" }, { status: 401 });
    res.cookies.set(OTP_COOKIE, "", { ...cookieBaseOptions(), maxAge: 0 });
    return res;
  }

  if (!verifyOtpCode(code, salt, expectedHash)) {
    bumpVerifyFailure(attemptKey, payload.exp * 1000);
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  clearVerifyAttempts(attemptKey);

  await ensureTeamUserFromEmail(email);

  const sessionExp = Math.floor(Date.now() / 1000) + SESSION_TTL_SEC;
  const sessionPayload: SessionTokenPayload = {
    v: 1,
    typ: "session",
    mode: "email",
    email,
    exp: sessionExp,
  };
  const sessionToken = await signToken(config.secret, sessionPayload);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, sessionToken, { ...cookieBaseOptions(), maxAge: SESSION_TTL_SEC });
  res.cookies.set(OTP_COOKIE, "", { ...cookieBaseOptions(), maxAge: 0 });
  return res;
}
