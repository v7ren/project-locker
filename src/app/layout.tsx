import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { AppThemeProvider } from "@/components/app-theme-provider";
import { SESSION_COOKIE } from "@/lib/auth/cookies";
import { readSessionFromTokenValue } from "@/lib/auth/session";
import {
  canManageTeamAdmin,
  canUseProjectDashboard,
  canUseTeamCalendar,
} from "@/lib/team/permissions";
import { getTeamUserForSession } from "@/lib/team/session-bridge";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Project docs",
  description:
    "For PMs and small teams: per-project Markdown, PDFs, and docs with stable URL paths",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
  let sessionUser: Awaited<ReturnType<typeof readSessionFromTokenValue>> = null;
  try {
    sessionUser = await readSessionFromTokenValue(sessionToken);
  } catch {
    sessionUser = null;
  }

  const teamUser = sessionUser ? await getTeamUserForSession(sessionUser) : null;
  const sessionEmail = sessionUser?.kind === "email" ? sessionUser.email : teamUser?.email ?? null;
  const sessionUsername =
    sessionUser?.kind === "user" ? sessionUser.username : teamUser?.username ?? null;
  const canTeamAdmin = teamUser ? canManageTeamAdmin(teamUser) : false;
  const canTeamCalendar = teamUser ? canUseTeamCalendar(teamUser) : false;
  const canProjectDashboard = teamUser ? canUseProjectDashboard(teamUser) : true;

  const initialLocale = await getRequestLocale();

  return (
    <html
      lang="zh-Hant"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AppThemeProvider
          session={{
            email: sessionEmail,
            username: sessionUsername,
            canTeamAdmin,
            canTeamCalendar,
            canProjectDashboard,
          }}
          initialLocale={initialLocale}
        >
          {children}
        </AppThemeProvider>
      </body>
    </html>
  );
}
