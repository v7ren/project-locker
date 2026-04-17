import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getAuthEnvConfig, isAllowedEmail, normalizeAuthEmail } from "@/lib/auth/config";
import { cookieBaseOptions, OTP_COOKIE, OTP_TTL_SEC, type OtpTokenPayload } from "@/lib/auth/cookies";
import { generateOtpDigits, hashOtpCode, randomOtpSalt } from "@/lib/auth/otp-node";
import { rateLimitSendOtp } from "@/lib/auth/rate-limit";
import { classifyResendOtpHint, type OtpResendHintCode } from "@/lib/auth/resend-hint";
import { signToken } from "@/lib/auth/signed-token";

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
  const emailRaw =
    typeof body === "object" && body !== null && typeof (body as { email?: unknown }).email === "string"
      ? (body as { email: string }).email
      : "";
  const email = normalizeAuthEmail(emailRaw);
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (!isAllowedEmail(config, email)) {
    return NextResponse.json({ error: "Could not send a code" }, { status: 400 });
  }

  const rl = rateLimitSendOtp(email);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests", retryAfterSec: rl.retryAfterSec },
      { status: 429 },
    );
  }

  const code = generateOtpDigits(6);
  const salt = randomOtpSalt();
  const hash = hashOtpCode(code, salt);
  const exp = Math.floor(Date.now() / 1000) + OTP_TTL_SEC;
  const payload: OtpTokenPayload = {
    v: 1,
    typ: "otp",
    email,
    exp,
    saltB64: salt.toString("base64url"),
    hashB64: hash.toString("base64url"),
  };
  const token = await signToken(config.secret, payload);

  const resend = new Resend(config.resendApiKey);
  const { error } = await resend.emails.send({
    from: config.resendFrom,
    to: email,
    subject: "Your sign-in code",
    text: `Your sign-in code is ${code}\n\nIt expires in ${Math.floor(OTP_TTL_SEC / 60)} minutes. If you did not request this, you can ignore this email.`,
  });

  if (error) {
    console.error("[send-otp] Resend error:", error.message, error.name, error.statusCode);
    const hintCode: OtpResendHintCode = classifyResendOtpHint(error);
    const body: {
      error: string;
      hintCode: OtpResendHintCode;
      detail?: string;
      code?: string;
    } = {
      error: "Could not send email",
      hintCode,
    };
    if (process.env.NODE_ENV === "development") {
      body.detail = error.message;
      body.code = error.name;
    }
    return NextResponse.json(body, { status: 502 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(OTP_COOKIE, token, { ...cookieBaseOptions(), maxAge: OTP_TTL_SEC });
  return res;
}
