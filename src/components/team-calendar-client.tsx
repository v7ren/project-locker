"use client";

import { TeamCalendarApp } from "@/components/team-calendar/team-calendar-app";
import type { CalendarEventRecord } from "@/lib/team/events-store";

type TeamUser = {
  id: string;
  username: string;
  role: string;
  email: string | null;
  hue: number;
  avatarEmoji: string;
};

type Props = {
  initialUsers: TeamUser[];
  initialSelf: { id: string; role: string; isAdmin: boolean };
  initialEvents: CalendarEventRecord[];
};

export function TeamCalendarClient(props: Props) {
  return <TeamCalendarApp {...props} />;
}
