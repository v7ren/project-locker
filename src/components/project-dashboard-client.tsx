"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DocsWorkspace } from "@/components/docs-workspace";
import { ProjectAiChat } from "@/components/project-ai-chat";
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
  initialTab: "home" | "docs" | "ai";
}) {
  const { t } = useTranslations();
  const router = useRouter();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function onDeleteProject() {
    if (
      !window.confirm(
        t("dash.deleteProjectConfirm", { name: meta.name, slug: meta.slug }),
      )
    ) {
      return;
    }
    setDeleteError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(meta.slug)}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setDeleteError(data.error ?? t("dash.deleteProjectFailed"));
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

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
        <TabLink
          slug={meta.slug}
          tab="ai"
          active={initialTab === "ai"}
          label={t("dash.tabAi")}
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
        ) : initialTab === "docs" ? (
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
        ) : (
          <section id="ai">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {t("dash.aiSectionTitle")}
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {t("dash.aiSectionDesc")}
            </p>
            <div className="mt-6">
              <ProjectAiChat slug={meta.slug} />
            </div>
          </section>
        )}
      </div>

      <section
        className="mt-12 rounded-xl border border-red-200/80 bg-red-50/50 px-4 py-5 sm:px-5 dark:border-red-900/50 dark:bg-red-950/20"
        aria-labelledby="dash-delete-heading"
      >
        <h2
          id="dash-delete-heading"
          className="text-base font-semibold text-red-900 dark:text-red-200"
        >
          {t("dash.deleteSectionTitle")}
        </h2>
        <p className="mt-1 text-sm text-red-800/90 dark:text-red-300/90">
          {t("dash.deleteSectionDesc")}
        </p>
        {deleteError ? (
          <p className="mt-2 text-sm text-red-700 dark:text-red-400">{deleteError}</p>
        ) : null}
        <div className="mt-4">
          <button
            type="button"
            disabled={deleting}
            onClick={() => void onDeleteProject()}
            className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-800 shadow-sm transition hover:bg-red-50 disabled:opacity-60 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100 dark:hover:bg-red-950/70"
          >
            {deleting ? t("dash.deletingProject") : t("dash.deleteProject")}
          </button>
        </div>
      </section>
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
  const href =
    tab === "home"
      ? `/${slug}/dashboard`
      : tab === "ai"
        ? `/${slug}/dashboard?tab=ai`
        : `/${slug}/dashboard?tab=docs`;
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
