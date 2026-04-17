import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { AppThemeProvider } from "@/components/app-theme-provider";
import { SESSION_COOKIE } from "@/lib/auth/cookies";
import { readSessionFromTokenValue } from "@/lib/auth/session";
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
  description: "Per-project home pages and docs with stable URL paths",
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

  const initialLocale = await getRequestLocale();

  return (
    <html
      lang="zh-Hant"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AppThemeProvider
          session={{ email: sessionUser?.email ?? null }}
          initialLocale={initialLocale}
        >
          {children}
        </AppThemeProvider>
      </body>
    </html>
  );
}
