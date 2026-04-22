import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth/cookies";
import { readSessionFromTokenValue, type SessionUser } from "@/lib/auth/session";

export async function readRequestSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  return readSessionFromTokenValue(cookieStore.get(SESSION_COOKIE)?.value);
}
