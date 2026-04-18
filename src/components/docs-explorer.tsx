"use client";

import Link from "next/link";
import { File, FileCode2, FileImage, FileQuestion, FileText } from "lucide-react";
import type { ProjectMeta } from "@/lib/projects";
import { docFileKind } from "@/lib/doc-file-kind";
import {
  documentViewerHref,
  formatDocPathForDisplay,
  markdownWorkspaceHref,
} from "@/lib/doc-paths";
import { useTranslations } from "@/lib/i18n/locale-provider";
import type { MessageKey } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";

function kindLabelKey(kind: ReturnType<typeof docFileKind>): MessageKey {
  switch (kind) {
    case "markdown":
      return "kind.markdown";
    case "pdf":
      return "kind.pdf";
    case "image":
      return "kind.image";
    case "html":
      return "kind.html";
    case "code":
      return "kind.code";
    default:
      return "kind.other";
  }
}

type ProjectDocs = {
  meta: ProjectMeta;
  files: string[];
};

type Props = {
  projects: ProjectDocs[];
  filterSlug: string | null;
};

function kindAccent(kind: ReturnType<typeof docFileKind>): string {
  switch (kind) {
    case "markdown":
      return "from-violet-500/15 to-fuchsia-500/10 dark:from-violet-400/20 dark:to-fuchsia-500/10";
    case "pdf":
      return "from-rose-500/15 to-orange-500/10 dark:from-rose-400/15 dark:to-orange-500/10";
    case "image":
      return "from-sky-500/15 to-cyan-500/10 dark:from-sky-400/15 dark:to-cyan-500/10";
    case "html":
      return "from-emerald-500/15 to-teal-500/10 dark:from-emerald-400/15 dark:to-teal-500/10";
    case "code":
      return "from-amber-500/15 to-yellow-500/10 dark:from-amber-400/15 dark:to-yellow-500/10";
    default:
      return "from-zinc-400/20 to-zinc-300/10 dark:from-zinc-500/20 dark:to-zinc-600/10";
  }
}

function KindIcon({ kind }: { kind: ReturnType<typeof docFileKind> }) {
  const cls = "size-6 text-zinc-700 sm:size-7 dark:text-zinc-200";
  switch (kind) {
    case "markdown":
      return <FileText className={cls} aria-hidden />;
    case "pdf":
      return <File className={cls} aria-hidden />;
    case "image":
      return <FileImage className={cls} aria-hidden />;
    case "html":
      return <FileCode2 className={cls} aria-hidden />;
    case "code":
      return <FileCode2 className={cls} aria-hidden />;
    default:
      return <FileQuestion className={cls} aria-hidden />;
  }
}

export function DocsExplorer({ projects, filterSlug }: Props) {
  const { t } = useTranslations();
  const visible = filterSlug
    ? projects.filter((p) => p.meta.slug === filterSlug)
    : projects;

  if (visible.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center text-sm text-pretty text-zinc-600 sm:px-6 sm:py-16 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
        {filterSlug ? t("explorer.noMatch") : t("explorer.noProjects")}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      {visible.map(({ meta, files }) => (
        <section key={meta.slug} className="scroll-mt-8" id={`project-${meta.slug}`}>
          <div className="mb-4 flex min-w-0 flex-col gap-2 border-b border-zinc-200 pb-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between dark:border-zinc-800">
            <div className="min-w-0">
              <h2 className="text-pretty text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {meta.name}
              </h2>
              <p className="truncate font-mono text-xs text-zinc-500 dark:text-zinc-400">
                /{meta.slug}
              </p>
            </div>
            <Link
              href={`/${meta.slug}/dashboard?tab=docs`}
              prefetch={false}
              className="shrink-0 text-xs font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              {t("explorer.manageDashboard")}
            </Link>
          </div>
          {files.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("explorer.noDocs")}</p>
          ) : (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(7.25rem,1fr))] gap-2 sm:min-w-0 sm:grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] sm:gap-3 md:grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(9rem,1fr))]">
              {files.map((rel) => {
                const kind = docFileKind(rel);
                const href =
                  kind === "markdown"
                    ? markdownWorkspaceHref(meta.slug, rel)
                    : documentViewerHref(meta.slug, rel);
                const baseRaw = rel.includes("/") ? rel.slice(rel.lastIndexOf("/") + 1) : rel;
                const base = formatDocPathForDisplay(baseRaw);
                return (
                  <li key={rel}>
                    <Link
                      href={href}
                      prefetch={false}
                      className="group flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm outline-none ring-zinc-400 transition [aspect-ratio:1/1] hover:border-zinc-300 hover:shadow-md focus-visible:ring-2 sm:rounded-2xl dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-zinc-600"
                    >
                      <div
                        className={cn(
                          "flex min-h-0 flex-1 flex-col items-center justify-center bg-gradient-to-br px-1.5 py-2 sm:px-2",
                          kindAccent(kind),
                        )}
                      >
                        <div className="rounded-lg bg-white/70 p-1.5 shadow-sm sm:rounded-xl sm:p-2 dark:bg-zinc-950/60">
                          <KindIcon kind={kind} />
                        </div>
                      </div>
                      <div className="min-h-0 border-t border-zinc-100 px-1.5 py-1.5 sm:px-2 sm:py-2 dark:border-zinc-800">
                        <p className="line-clamp-2 text-center text-[10px] font-medium leading-tight text-zinc-900 sm:text-[11px] dark:text-zinc-100">
                          {base}
                        </p>
                        <p className="truncate text-center text-[9px] uppercase tracking-wide text-zinc-500 sm:text-[10px] dark:text-zinc-400">
                          {t(kindLabelKey(kind))}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

export function DocsExplorerHeader({
  filterSlug,
  filterName,
}: {
  filterSlug: string | null;
  filterName: string | null;
}) {
  const { t } = useTranslations();
  if (!filterSlug || !filterName) return null;
  return (
    <div className="mb-6 flex min-w-0 flex-col gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 dark:border-zinc-800 dark:bg-zinc-900/50">
      <p className="min-w-0 text-pretty text-sm text-zinc-700 dark:text-zinc-300">
        {t("docsPage.filterBanner", { name: filterName })}
      </p>
      <Link
        href="/docs"
        prefetch={false}
        className="text-xs font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        {t("docsPage.showAll")}
      </Link>
    </div>
  );
}
