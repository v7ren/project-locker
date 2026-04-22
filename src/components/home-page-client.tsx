"use client";

import Link from "next/link";
import { CenterBreadcrumbBar } from "@/components/center-breadcrumb-bar";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { TopRightTheme } from "@/components/top-right-theme";
import { useTranslations } from "@/lib/i18n/locale-provider";

type Project = { slug: string; name: string };

export function HomePageClient({
  projects,
  showTeamCalendar,
  showTeamAdmin,
  showProjectDashboard,
}: {
  projects: Project[];
  showTeamCalendar: boolean;
  showTeamAdmin: boolean;
  showProjectDashboard: boolean;
}) {
  const { t } = useTranslations();

  return (
    <div className="relative mx-auto flex min-h-full w-full min-w-0 max-w-3xl flex-col gap-6 px-4 py-10 pb-28 sm:gap-8 sm:px-6 sm:py-14">
      <TopRightTheme />
      <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
            {t("home.title")}
          </h1>
          <p className="mt-1 max-w-xl text-pretty text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {t("home.subtitle", {
              dash: "/your-slug/dashboard",
              docExample: "/your-slug/docs/notes.md",
            })}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end sm:self-end">
          {showTeamCalendar ? (
            <Link
              href="/calendar"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900/60"
            >
              {t("common.teamCalendar")}
            </Link>
          ) : null}
          {showTeamAdmin ? (
            <Link
              href="/team"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900/60"
            >
              {t("common.teamSettings")}
            </Link>
          ) : null}
          <CreateProjectDialog />
        </div>
      </header>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-10 text-center text-sm text-pretty text-zinc-600 sm:px-10 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
          {t("home.empty", { create: t("createProject.cta") })}
        </div>
      ) : (
        <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
          {projects.map((p) => (
            <li
              key={p.slug}
              className="flex min-w-0 flex-col divide-zinc-200 sm:flex-row sm:divide-x dark:divide-zinc-800"
            >
              <Link
                href={`/${p.slug}`}
                className="flex min-w-0 flex-1 flex-col gap-0.5 px-4 py-4 transition hover:bg-zinc-50 dark:hover:bg-zinc-900/60 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="min-w-0 truncate font-medium text-zinc-900 dark:text-zinc-50">
                  {p.name}
                </span>
                <span className="shrink-0 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                  /{p.slug}
                </span>
              </Link>
              {showProjectDashboard ? (
                <Link
                  href={`/${p.slug}/dashboard`}
                  className="flex min-h-[44px] items-center justify-center border-t border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900 sm:w-36 sm:border-t-0 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-100"
                >
                  {t("home.dashboard")}
                </Link>
              ) : (
                <Link
                  href={`/docs?project=${encodeURIComponent(p.slug)}`}
                  className="flex min-h-[44px] items-center justify-center border-t border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900 sm:w-36 sm:border-t-0 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-100"
                >
                  {t("common.docs")}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="pointer-events-none fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-[200]">
        <Link
          href="/docs"
          className="pointer-events-auto inline-flex rounded-2xl border border-zinc-200/45 bg-white/35 px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-md backdrop-blur-md hover:bg-white/50 dark:border-zinc-500/35 dark:bg-zinc-950/25 dark:text-zinc-100 dark:hover:bg-white/10"
        >
          {t("common.browseDocs")}
        </Link>
      </div>
      <CenterBreadcrumbBar items={[{ label: t("common.projects") }]} />
    </div>
  );
}
