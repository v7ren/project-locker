"use client";

import Link from "next/link";
import { useSession } from "@/components/session-provider";
import { useViewerChromeOptional } from "@/components/viewer-chrome-context";
import { useTranslations } from "@/lib/i18n/locale-provider";
import { cn } from "@/lib/utils";

export function ProjectHomeLanding({
  slug,
  name,
  publicVisitor = false,
}: {
  slug: string;
  name: string;
  publicVisitor?: boolean;
}) {
  const { t } = useTranslations();
  const { canProjectDashboard } = useSession();
  const viewerChrome = useViewerChromeOptional();
  const hideFloatingUi = Boolean(viewerChrome?.floatingUiHidden);

  return (
    <div
      className={cn(
        "mx-auto flex min-h-full w-full min-w-0 max-w-lg flex-col justify-center gap-6 px-4 py-16 sm:gap-8 sm:px-6 sm:py-20",
        hideFloatingUi ? "pb-10 sm:pb-12" : "pb-36 sm:pb-20",
      )}
    >
      <div className="min-w-0">
        <h1 className="text-balance text-2xl font-semibold text-zinc-900 sm:text-3xl dark:text-zinc-50">
          {name}
        </h1>
        <p className="mt-2 text-pretty text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {t("projectHome.subtitle", {
            html: "`custom.html`",
            tsx: "`custom.tsx`",
            docs: `/${slug}/docs/…`,
          })}
        </p>
      </div>
      {publicVisitor ? null : (
        <div className="flex flex-col gap-3 sm:flex-row">
          {canProjectDashboard ? (
            <Link
              href={`/${slug}/dashboard`}
              className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              {t("projectHome.openDashboard")}
            </Link>
          ) : null}
          <Link
            href={
              canProjectDashboard
                ? `/${slug}/dashboard?tab=docs`
                : `/docs?project=${encodeURIComponent(slug)}`
            }
            className="inline-flex items-center justify-center rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            {t("projectHome.docs")}
          </Link>
        </div>
      )}
    </div>
  );
}
