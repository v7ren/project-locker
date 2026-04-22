"use client";

import { createContext, useContext } from "react";

export type SessionState = {
  email: string | null;
  username: string | null;
  canTeamAdmin: boolean;
  canTeamCalendar: boolean;
  canProjectDashboard: boolean;
};

const SessionContext = createContext<SessionState>({
  email: null,
  username: null,
  canTeamAdmin: false,
  canTeamCalendar: false,
  canProjectDashboard: true,
});

export function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: SessionState;
}) {
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionState {
  return useContext(SessionContext);
}
