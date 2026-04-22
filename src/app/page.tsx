import { HomePageClient } from "@/components/home-page-client";
import { getAuthGateMode } from "@/lib/auth/config";
import { readRequestSession } from "@/lib/auth/request-session";
import { listProjects } from "@/lib/projects";
import { canManageTeamAdmin, canUseProjectDashboard, canUseTeamCalendar } from "@/lib/team/permissions";
import { getTeamUserForSession } from "@/lib/team/session-bridge";

export default async function Home() {
  const projects = await listProjects();
  const gate = getAuthGateMode();
  let showTeamCalendar = false;
  let showTeamAdmin = false;
  let showProjectDashboard = true;
  if (gate !== "none") {
    const session = await readRequestSession();
    const teamUser = session ? await getTeamUserForSession(session) : null;
    if (teamUser) {
      showTeamCalendar = canUseTeamCalendar(teamUser);
      showTeamAdmin = canManageTeamAdmin(teamUser);
      showProjectDashboard = canUseProjectDashboard(teamUser);
    } else {
      showTeamCalendar = true;
      showTeamAdmin = false;
      showProjectDashboard = true;
    }
  }
  return (
    <HomePageClient
      projects={projects}
      showTeamCalendar={showTeamCalendar}
      showTeamAdmin={showTeamAdmin}
      showProjectDashboard={showProjectDashboard}
    />
  );
}
