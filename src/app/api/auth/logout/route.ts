import { NextResponse } from "next/server";
import { cookieBaseOptions, SESSION_COOKIE } from "@/lib/auth/cookies";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { ...cookieBaseOptions(), maxAge: 0 });
  return res;
}
