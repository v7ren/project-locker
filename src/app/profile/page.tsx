import { redirect } from "next/navigation";
import { ProfilePageClient } from "@/components/profile-page-client";
import { getAuthGateMode } from "@/lib/auth/config";
import { readRequestSession } from "@/lib/auth/request-session";
import { getTeamUserForSession } from "@/lib/team/session-bridge";

export default async function ProfilePage() {
  if (getAuthGateMode() === "none") {
    redirect("/");
  }
  const session = await readRequestSession();
  if (!session) {
    redirect("/login?next=/profile");
  }
  const self = await getTeamUserForSession(session);
  if (!self) {
    redirect("/login?next=/profile");
  }
  return <ProfilePageClient showSelfManagedLoginKey={getAuthGateMode() !== "email"} />;
}
