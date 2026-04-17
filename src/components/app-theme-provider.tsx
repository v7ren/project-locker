"use client";

import { ThemeProvider } from "next-themes";
import { SessionProvider, type SessionState } from "@/components/session-provider";
import { LocaleProvider } from "@/lib/i18n/locale-provider";
import type { AppLocale } from "@/lib/i18n/messages";

type Props = {
  children: React.ReactNode;
  session?: SessionState;
  /** Resolved on the server (`getRequestLocale`) so the first client render matches SSR. */
  initialLocale: AppLocale;
};

/** pacocoursey/next-themes#387 — React 19 dev warning for inline theme script on client */
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
        <SessionProvider session={session ?? { email: null }}>{children}</SessionProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
