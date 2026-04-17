"use client";

import { ThemeProvider } from "next-themes";
import { SessionProvider, type SessionState } from "@/components/session-provider";
import { LocaleProvider } from "@/lib/i18n/locale-provider";

type Props = { children: React.ReactNode; session?: SessionState };

export function AppThemeProvider({ children, session }: Props) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LocaleProvider>
        <SessionProvider session={session ?? { email: null }}>{children}</SessionProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
