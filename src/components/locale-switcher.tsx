"use client";

import { useLocaleContext } from "@/lib/i18n/locale-provider";
import type { AppLocale } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";

const options: { id: AppLocale; labelKey: "common.langEn" | "common.langZhTw" }[] = [
  { id: "zh-TW", labelKey: "common.langZhTw" },
  { id: "en", labelKey: "common.langEn" },
];

export function LocaleSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useLocaleContext();

  return (
    <div
      className={cn(
        "inline-flex rounded-lg border border-zinc-300/60 bg-white/40 p-0.5 text-xs font-medium shadow-sm backdrop-blur-md dark:border-zinc-600/50 dark:bg-zinc-950/35",
        className,
      )}
      role="group"
      aria-label={locale === "zh-TW" ? "語言" : "Language"}
    >
      {options.map(({ id, labelKey }) => (
        <button
          key={id}
          type="button"
          onClick={() => setLocale(id)}
          className={cn(
            "rounded-md px-2 py-1 transition-colors",
            locale === id
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "text-zinc-700 hover:bg-white/60 dark:text-zinc-300 dark:hover:bg-white/10",
          )}
        >
          {t(labelKey)}
        </button>
      ))}
    </div>
  );
}
