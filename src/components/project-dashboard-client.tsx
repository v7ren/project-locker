"use client";

import Link from "next/link";
import { DocsWorkspace } from "@/components/docs-workspace";
import { ProjectHomeUpload } from "@/components/project-home-upload";
import { useTranslations } from "@/lib/i18n/locale-provider";

type Meta = { slug: string; name: string };

export function ProjectDashboardClient({
  meta,
  files,
  hasCustomTsx,
  initialTab,
}: {
  meta: Meta;
  files: string[];
  hasCustomTsx: boolean;
  initialTab: "home" | "docs";
}) {
  const { t } = useTranslations();

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl flex-1 px-4 py-6 pb-36 sm:px-6 sm:py-8">
      <div className="mb-6 flex min-w-0 flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
            {t("dash.title")}
          </h1>
          <p className="mt-1 text-pretty text-sm text-zinc-600 dark:text-zinc-400">
            {t("dash.subtitleIntro", { name: meta.name })}
          </p>
          <p className="mt-1 text-pretty text-sm text-zinc-600 dark:text-zinc-400">
            <span>{t("dash.publicHomeLabel")}</span>{" "}
            <Link
              href={`/${meta.slug}`}
              className="font-mono text-xs text-zinc-900 underline dark:text-zinc-100"
            >
              /{meta.slug}
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="flex min-w-0 flex-wrap gap-2 border-b border-zinc-200 pb-3 dark:border-zinc-800">
        <TabLink
          slug={meta.slug}
          tab="home"
          active={initialTab === "home"}
          label={t("dash.tabHome")}
        />
        <TabLink
          slug={meta.slug}
          tab="docs"
          active={initialTab === "docs"}
          label={t("dash.tabDocs")}
        />
      </div>

      <div className="mt-8">
        {initialTab === "home" ? (
          <section id="home">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {t("dash.homeFilesTitle")}
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {t("dash.homeFilesDesc")}
            </p>
            {hasCustomTsx ? (
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                {t("dash.customOnDisk", { file: "custom.tsx" })}{" "}
                <Link className="underline" href={`/${meta.slug}`}>
                  {t("dash.customOnDiskLink")}
                </Link>{" "}
                {t("dash.customOnDiskSuffix")}
              </p>
            ) : null}
            <div className="mt-4">
              <ProjectHomeUpload slug={meta.slug} />
            </div>
          </section>
        ) : (
          <section id="docs">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {t("dash.docsSectionTitle")}
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {t("dash.docsSectionDesc", { path: `/${meta.slug}/docs/…` })}
            </p>
            <div className="mt-6">
              <DocsWorkspace key={files.join("|")} slug={meta.slug} files={files} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function TabLink({
  slug,
  tab,
  active,
  label,
}: {
  slug: string;
  tab: string;
  active: boolean;
  label: string;
}) {
  const href = tab === "home" ? `/${slug}/dashboard` : `/${slug}/dashboard?tab=docs`;
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          : "rounded-lg px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
      }
    >
      {label}
    </Link>
  );
}
