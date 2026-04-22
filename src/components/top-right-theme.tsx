"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { useSession } from "@/components/session-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { ViewerChromeSegment } from "@/components/viewer-chrome-segment";
import { useViewerChromeOptional } from "@/components/viewer-chrome-context";
import { useTranslations } from "@/lib/i18n/locale-provider";
import { cn } from "@/lib/utils";

export function TopRightTheme() {
  const viewerChrome = useViewerChromeOptional();
  const pathname = usePathname() ?? "";
  const onDashboard = pathname.includes("/dashboard");
  const focusMode = Boolean(viewerChrome?.floatingUiHidden) && !onDashboard;
  const { email, username, canTeamAdmin, canTeamCalendar } = useSession();
  const { t } = useTranslations();
  const router = useRouter();

  return (
    <div className="pointer-events-none fixed right-0 top-0 z-[265] pt-[max(0.35rem,env(safe-area-inset-top))] pr-[max(0.75rem,env(safe-area-inset-right))] sm:pt-2.5 sm:pr-4">
      <div className="pointer-events-auto ml-auto flex w-max max-w-[calc(100vw-1rem)] flex-nowrap items-center justify-end gap-1.5 max-sm:overflow-x-auto max-sm:[scrollbar-width:none] max-sm:[&::-webkit-scrollbar]:hidden sm:max-w-none sm:overflow-visible sm:gap-2">
        {!onDashboard ? <ViewerChromeSegment /> : null}
        <div
          className={cn("flex shrink-0 items-center gap-1.5 sm:gap-2", focusMode && "invisible")}
          aria-hidden={focusMode || undefined}
          inert={focusMode}
        >
          {email || username ? (
            <>
              <Link
                href="/profile"
                className="rounded-md border border-zinc-200 bg-white/90 px-2.5 py-1.5 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-200 dark:hover:bg-zinc-900/80"
              >
                {t("common.profile")}
              </Link>
              {canTeamCalendar ? (
                <Link
                  href="/calendar"
                  className="rounded-md border border-zinc-200 bg-white/90 px-2.5 py-1.5 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-200 dark:hover:bg-zinc-900/80"
                >
                  {t("common.teamCalendar")}
                </Link>
              ) : null}
              {canTeamAdmin ? (
                <Link
                  href="/team"
                  className="rounded-md border border-zinc-200 bg-white/90 px-2.5 py-1.5 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-200 dark:hover:bg-zinc-900/80"
                >
                  {t("common.teamSettings")}
                </Link>
              ) : null}
              <button
                type="button"
                className="rounded-md border border-zinc-200 bg-white/90 px-2.5 py-1.5 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-200 dark:hover:bg-zinc-900/80"
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  router.refresh();
                  window.location.href = "/login";
                }}
              >
                {t("auth.logout")}
              </button>
            </>
          ) : null}
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
