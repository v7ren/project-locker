import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginPageClient } from "@/components/login-page-client";
import { getAuthGateMode, getAuthGateSetupHints } from "@/lib/auth/config";
import { SESSION_COOKIE } from "@/lib/auth/cookies";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { readSessionFromTokenValue } from "@/lib/auth/session";

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const nextPath = safeNextPath(sp.next);
  const authMode = getAuthGateMode();
  const configured = authMode !== "none";

  if (configured) {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const session = await readSessionFromTokenValue(token);
    if (session) {
      redirect(nextPath);
    }
  }

  const devHints =
    process.env.NODE_ENV === "development" && authMode === "none"
      ? getAuthGateSetupHints()
      : undefined;

  return (
    <LoginPageClient authMode={authMode} nextPath={nextPath} devHints={devHints} />
  );
}
