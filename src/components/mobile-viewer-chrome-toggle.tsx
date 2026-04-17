"use client";

import { useViewerChromeOptional } from "@/components/viewer-chrome-context";
import { useTranslations } from "@/lib/i18n/locale-provider";
import { cn } from "@/lib/utils";

/** Small-screen control to hide or show fixed floating chrome (nav, theme, editor bars). */
export function MobileViewerChromeToggle() {
  const ctx = useViewerChromeOptional();
  const { t } = useTranslations();

  if (!ctx) {
    return null;
  }

  const { floatingUiHidden, toggleFloatingUiHidden } = ctx;

  return (
    <button
      type="button"
      aria-pressed={floatingUiHidden}
      onClick={toggleFloatingUiHidden}
      className={cn(
        "fixed z-[270] hidden max-sm:flex rounded-full border border-zinc-200/80 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-zinc-800 shadow-md backdrop-blur-md dark:border-zinc-600/80 dark:bg-zinc-950/90 dark:text-zinc-100",
        floatingUiHidden
          ? "right-[max(0.75rem,env(safe-area-inset-right))] top-[max(0.65rem,env(safe-area-inset-top))]"
          : "right-[max(0.75rem,env(safe-area-inset-right))] top-[max(4.35rem,calc(env(safe-area-inset-top)+3.5rem))]",
      )}
    >
      {floatingUiHidden ? t("viewerUi.showAll") : t("viewerUi.hideAll")}
    </button>
  );
}
