"use client";

import { ThemeProvider } from "next-themes";
import { SessionProvider, type SessionState } from "@/components/session-provider";
import { LocaleProvider } from "@/lib/i18n/locale-provider";
import type { AppLocale } from "@/lib/i18n/messages";

type Props = {
  children: React.ReactNode;
  session?: SessionState;
  initialLocale: AppLocale;
};

// `type: application/json` avoids next-themes injecting an inline script that trips React 19 dev checks.
const themeScriptProps =
  typeof window === "undefined" ? undefined : ({ type: "application/json" } as const);

export function AppThemeProvider({ children, session, initialLocale }: Props) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      scriptProps={themeScriptProps}
    >
      <LocaleProvider initialLocale={initialLocale}>
        <SessionProvider
          session={
            session ?? {
              email: null,
              username: null,
              canTeamAdmin: false,
              canTeamCalendar: false,
              canProjectDashboard: true,
            }
          }
        >
          {children}
        </SessionProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
