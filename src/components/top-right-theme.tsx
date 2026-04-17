"use client";

import { useRouter } from "next/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { useSession } from "@/components/session-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { useViewerChromeOptional } from "@/components/viewer-chrome-context";
import { useTranslations } from "@/lib/i18n/locale-provider";
import { cn } from "@/lib/utils";

export function TopRightTheme() {
  const viewerChrome = useViewerChromeOptional();
  const { email } = useSession();
  const { t } = useTranslations();
  const router = useRouter();

  return (
    <div
      className={cn(
        "pointer-events-none fixed right-3 top-3 z-[260] max-sm:right-[max(0.75rem,env(safe-area-inset-right))] max-sm:top-[max(0.75rem,env(safe-area-inset-top))] sm:right-4 sm:top-4",
        viewerChrome?.floatingUiHidden && "max-sm:hidden",
      )}
    >
      <div className="pointer-events-auto flex max-w-[min(100vw-1rem,20rem)] flex-row flex-wrap items-center justify-end gap-1.5 sm:max-w-none">
        {email ? (
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
        ) : null}
        <LocaleSwitcher />
        <ThemeToggle />
      </div>
    </div>
  );
}
