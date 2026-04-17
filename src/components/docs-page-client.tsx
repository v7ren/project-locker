"use client";

import Link from "next/link";
import { CenterBreadcrumbBar } from "@/components/center-breadcrumb-bar";
import { DocsExplorer, DocsExplorerHeader } from "@/components/docs-explorer";
import { TopRightTheme } from "@/components/top-right-theme";
import type { ProjectMeta } from "@/lib/projects";
import { useTranslations } from "@/lib/i18n/locale-provider";

type ProjectDocs = {
  meta: ProjectMeta;
  files: string[];
};

export function DocsPageClient({
  projects,
  filterSlug,
  filterMeta,
}: {
  projects: ProjectDocs[];
  filterSlug: string | null;
  filterMeta: ProjectMeta | null;
}) {
  const { t } = useTranslations();

  return (
    <div className="relative mx-auto min-h-full w-full min-w-0 max-w-6xl px-4 py-8 pb-28 sm:px-6 sm:py-14">
      <TopRightTheme />

      <header className="mb-8 max-w-2xl sm:mb-10">
        <h1 className="text-balance text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
          {t("docsPage.title")}
        </h1>
        <p className="mt-2 text-pretty text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {t("docsPage.subtitleLead")}{" "}
          <Link
            href="/"
            className="font-medium text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-200"
          >
            {t("common.dashboard")}
          </Link>
          {t("docsPage.subtitleTrail")}
        </p>
      </header>

      {filterMeta ? (
        <DocsExplorerHeader filterSlug={filterMeta.slug} filterName={filterMeta.name} />
      ) : null}

      <DocsExplorer projects={projects} filterSlug={filterSlug} />

      <CenterBreadcrumbBar
        items={[{ label: t("common.projects"), href: "/" }, { label: t("docsPage.title") }]}
      />
    </div>
  );
}
