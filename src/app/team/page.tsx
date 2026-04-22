import { redirect } from "next/navigation";
import { TeamAdminDashboard } from "@/components/team-admin-dashboard";
import { getAuthGateMode } from "@/lib/auth/config";
import { readRequestSession } from "@/lib/auth/request-session";
import { canManageTeamAdmin } from "@/lib/team/permissions";
import { getTeamUserForSession } from "@/lib/team/session-bridge";

export default async function TeamAdminPage() {
  if (getAuthGateMode() === "none") {
    redirect("/");
  }
  const session = await readRequestSession();
  if (!session) {
    redirect("/login?next=/team");
  }
  const self = await getTeamUserForSession(session);
  if (!self || !canManageTeamAdmin(self)) {
    redirect("/");
  }
  return <TeamAdminDashboard />;
}
