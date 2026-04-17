"use client";

import { Eye, LayoutTemplate } from "lucide-react";
import { usePathname } from "next/navigation";
import { useViewerChromeOptional } from "@/components/viewer-chrome-context";
import { useTranslations } from "@/lib/i18n/locale-provider";
import { cn } from "@/lib/utils";

function isDashboardPath(pathname: string): boolean {
  return pathname.includes("/dashboard");
}

/** Lark-style two-segment look; single control toggles standard vs focus (whole pill is clickable). */
export function ViewerChromeSegment() {
  const ctx = useViewerChromeOptional();
  const pathname = usePathname() ?? "";
  const { t } = useTranslations();

  if (!ctx || isDashboardPath(pathname)) {
    return null;
  }

  const { floatingUiHidden, toggleFloatingUiHidden } = ctx;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={floatingUiHidden}
      suppressHydrationWarning
      title={floatingUiHidden ? t("viewerUi.showAll") : t("viewerUi.hideAll")}
      aria-label={
        floatingUiHidden
          ? `${t("viewerUi.showAll")} (${t("viewerUi.viewModeToolbar")})`
          : `${t("viewerUi.hideAll")} (${t("viewerUi.viewModeToolbar")})`
      }
      onClick={() => toggleFloatingUiHidden()}
      className="relative z-[1] flex h-9 min-w-[4.75rem] shrink-0 rounded-lg border border-zinc-300/90 bg-white/90 p-[3px] shadow-sm backdrop-blur-sm transition-opacity hover:opacity-95 dark:border-zinc-200/70 dark:bg-zinc-950/90 dark:hover:opacity-95"
    >
      <span
        className={cn(
          "pointer-events-none flex flex-1 items-center justify-center rounded-md px-2 py-1 transition-colors",
          !floatingUiHidden
            ? "bg-zinc-200/95 text-zinc-900 shadow-sm dark:bg-zinc-600/95 dark:text-zinc-50"
            : "text-zinc-500 dark:text-zinc-400",
        )}
        aria-hidden
      >
        <LayoutTemplate className="size-4" strokeWidth={1.75} />
      </span>
      <span
        className={cn(
          "pointer-events-none flex flex-1 items-center justify-center rounded-md px-2 py-1 transition-colors",
          floatingUiHidden
            ? "bg-zinc-200/95 text-zinc-900 shadow-sm dark:bg-zinc-600/95 dark:text-zinc-50"
            : "text-zinc-500 dark:text-zinc-400",
        )}
        aria-hidden
      >
        <Eye className="size-4" strokeWidth={1.75} />
      </span>
    </button>
  );
}
