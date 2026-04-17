"use client";

import { createContext, useContext } from "react";

export type SessionState = { email: string | null };

const SessionContext = createContext<SessionState>({ email: null });

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
