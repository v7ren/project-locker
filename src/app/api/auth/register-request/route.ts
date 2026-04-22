import { NextResponse } from "next/server";
import { getAuthGateMode } from "@/lib/auth/config";
import { clientIpFromRequest, rateLimitUsernameAuth } from "@/lib/team/username-auth-rate-limit";
import { createPendingMemberRegistration } from "@/lib/team/users-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (getAuthGateMode() !== "email") {
    return NextResponse.json({ error: "Registration is not available in this auth mode" }, { status: 503 });
  }

  const ip = clientIpFromRequest(request);
  const rl = rateLimitUsernameAuth(`regreq:${ip}`);
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

  const reg = await createPendingMemberRegistration(username);
  if (!reg.ok) {
    return NextResponse.json({ error: reg.error }, { status: 400 });
  }
  return NextResponse.json({
    ok: true,
    username: reg.username,
    message: "Request submitted. An admin must approve your account before you can sign in with an access key.",
  });
}
