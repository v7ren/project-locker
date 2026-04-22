import { redirect } from "next/navigation";
import { TeamCalendarClient } from "@/components/team-calendar-client";
import { getAuthGateMode } from "@/lib/auth/config";
import { readRequestSession } from "@/lib/auth/request-session";
import { listCalendarEvents } from "@/lib/team/events-store";
import { isEffectiveAdmin, isViewer } from "@/lib/team/permissions";
import { getTeamUserForSession } from "@/lib/team/session-bridge";
import { listTeamUsers } from "@/lib/team/users-store";

export default async function TeamCalendarPage() {
  if (getAuthGateMode() === "none") {
    redirect("/");
  }
  const session = await readRequestSession();
  if (!session) {
    redirect("/login?next=/calendar");
  }
  const self = await getTeamUserForSession(session);
  if (!self) {
    redirect("/login?next=/calendar");
  }
  if (isViewer(self)) {
    redirect("/");
  }
  const [users, events] = await Promise.all([listTeamUsers(), listCalendarEvents()]);
  return (
    <TeamCalendarClient
      initialUsers={users.map((u) => ({
        id: u.id,
        username: u.username,
        role: u.role,
        email: u.email,
        hue: u.hue,
        avatarEmoji: u.avatarEmoji,
      }))}
      initialSelf={{ id: self.id, role: self.role, isAdmin: isEffectiveAdmin(self) }}
      initialEvents={events}
    />
  );
}
