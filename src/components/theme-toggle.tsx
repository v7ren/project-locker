"use client";

import { useTranslations } from "@/lib/i18n/locale-provider";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { t } = useTranslations();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useIsClient();

  if (!mounted) {
    return (
      <div
        className={cn(
          "h-9 w-[7.5rem] shrink-0 rounded-lg bg-zinc-200/40 backdrop-blur-sm dark:bg-zinc-800/35",
          className,
        )}
        aria-hidden
      />
    );
  }

  const cycle = () => {
    if (theme === "system") setTheme("light");
    else if (theme === "light") setTheme("dark");
    else setTheme("system");
  };

  const label =
    theme === "system"
      ? `${t("theme.system")} (${resolvedTheme === "dark" ? t("theme.dark") : t("theme.light")})`
      : theme === "dark"
        ? t("theme.dark")
        : t("theme.light");

  return (
    <button
      type="button"
      onClick={cycle}
      title={t("theme.cycleTitle", { label })}
      className={cn(
        "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-zinc-300/60 bg-white/40 px-2.5 text-xs font-medium text-zinc-800 shadow-sm backdrop-blur-md hover:bg-white/55 dark:border-zinc-600/50 dark:bg-zinc-950/35 dark:text-zinc-100 dark:hover:bg-zinc-950/50",
        className,
      )}
    >
      <span className="tabular-nums" aria-hidden>
        {theme === "system" ? "◐" : theme === "dark" ? "◑" : "○"}
      </span>
      <span className="max-w-[5.5rem] truncate">{label}</span>
    </button>
  );
}
