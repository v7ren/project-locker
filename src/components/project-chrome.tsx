"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { BreadcrumbTrailItem } from "@/components/breadcrumb-trail";
import { CenterBreadcrumbBar } from "@/components/center-breadcrumb-bar";
import { PublicSharePanel } from "@/components/public-share-panel";
import { TopRightTheme } from "@/components/top-right-theme";
import { useViewerChromeOptional } from "@/components/viewer-chrome-context";
import { decodeDocUrlTrail, formatDocPathForDisplay } from "@/lib/doc-paths";
import { useTranslations } from "@/lib/i18n/locale-provider";
import { cn } from "@/lib/utils";

type Props = {
  slug: string;
  name: string;
};

const dockPillOuter =
  "pointer-events-none fixed z-[260] flex max-w-[calc(100vw-1.5rem)] flex-col gap-2";

const dockPillInner =
  "pointer-events-auto flex flex-wrap gap-1.5 rounded-2xl border border-zinc-200/45 bg-white/35 px-2 py-1.5 text-xs shadow-md backdrop-blur-md dark:border-zinc-500/35 dark:bg-zinc-950/25";

function isProjectHomePath(pathname: string, slug: string): boolean {
  const base = `/${slug}`;
  return pathname === base || pathname === `${base}/`;
}

function isPublicViewerPath(pathname: string, slug: string): boolean {
  return (
    pathname === `/${slug}/public` ||
    pathname === `/${slug}/public/` ||
    pathname.startsWith(`/${slug}/public/`)
  );
}

function BottomRightProjectDock({ slug }: { slug: string }) {
  const viewerChrome = useViewerChromeOptional();
  const { t } = useTranslations();
  const pathname = usePathname() ?? "";
  const onPublic = isPublicViewerPath(pathname, slug);
  const onHome = isProjectHomePath(pathname, slug);
  const hideFloatingChrome = Boolean(viewerChrome?.floatingUiHidden);

  if (onPublic) {
    return null;
  }

  return (
    <div
      className={cn(
        dockPillOuter,
        "bottom-[max(5.75rem,calc(env(safe-area-inset-bottom)+4.75rem))] right-[max(1rem,env(safe-area-inset-right))] max-sm:bottom-[max(7rem,calc(env(safe-area-inset-bottom)+6rem))] items-end",
        hideFloatingChrome && "hidden",
      )}
      aria-live="polite"
    >
      <div
        className={cn(
          dockPillInner,
          "max-w-[min(100vw-2rem,22rem)] flex-col items-stretch gap-2 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-end",
        )}
      >
        <div className="flex flex-wrap justify-end gap-1.5">
          <Link
            href={`/${slug}/dashboard`}
            className="rounded-lg px-2.5 py-1 font-medium text-zinc-800 hover:bg-white/45 dark:text-zinc-100 dark:hover:bg-white/10"
          >
            {t("common.dashboard")}
          </Link>
          <Link
            href={`/docs?project=${encodeURIComponent(slug)}`}
            className="rounded-lg px-2.5 py-1 font-medium text-zinc-800 hover:bg-white/45 dark:text-zinc-100 dark:hover:bg-white/10"
          >
            {t("common.docs")}
          </Link>
        </div>
        {onHome ? (
          <div className="min-w-0 border-t border-zinc-200/50 pt-2 dark:border-zinc-600/40 sm:border-t-0 sm:border-l sm:pl-2 sm:pt-0">
            <PublicSharePanel slug={slug} shareKey="home" triggerClassName="text-xs" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DashboardBreadcrumbInner({ slug, name }: Props) {
  const { t } = useTranslations();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const items: BreadcrumbTrailItem[] =
    tab === "docs"
      ? [
          { label: t("common.projects"), href: "/" },
          { label: name, href: `/${slug}` },
          { label: t("common.dashboard"), href: `/${slug}/dashboard` },
          { label: t("common.docs") },
        ]
      : [
          { label: t("common.projects"), href: "/" },
          { label: name, href: `/${slug}` },
          { label: t("common.dashboard") },
        ];

  return <CenterBreadcrumbBar items={items} />;
}

function DashboardBreadcrumbFallback({ slug, name }: Props) {
  const { t } = useTranslations();
  return (
    <CenterBreadcrumbBar
      items={[
        { label: t("common.projects"), href: "/" },
        { label: name, href: `/${slug}` },
        { label: t("common.dashboard") },
      ]}
    />
  );
}

function DashboardBreadcrumb(props: Props) {
  return (
    <Suspense fallback={<DashboardBreadcrumbFallback {...props} />}>
      <DashboardBreadcrumbInner {...props} />
    </Suspense>
  );
}

function ProjectBreadcrumbLayer({ slug, name }: Props) {
  const { t } = useTranslations();
  const pathname = usePathname() ?? "";
  const onHome = isProjectHomePath(pathname, slug);
  const onDashboard = pathname.includes("/dashboard");
  const onPublic = isPublicViewerPath(pathname, slug);
  const publicRoot = `/${slug}/public`;

  if (onDashboard) {
    return <DashboardBreadcrumb slug={slug} name={name} />;
  }

  const homeItems: BreadcrumbTrailItem[] = [
    { label: t("common.projects"), href: "/" },
    { label: name },
  ];

  if (onHome) {
    return <CenterBreadcrumbBar items={homeItems} />;
  }

  if (onPublic && (pathname === publicRoot || pathname === `${publicRoot}/`)) {
    return (
      <CenterBreadcrumbBar
        items={[
          { label: t("common.projects"), href: "/" },
          { label: name, href: publicRoot },
          { label: t("publicShare.publicBadge") },
        ]}
      />
    );
  }

  const pubMdPrefix = `/${slug}/public/md/`;
  const pubMdIdx = pathname.indexOf(pubMdPrefix);
  if (pubMdIdx !== -1) {
    const rel = decodeDocUrlTrail(pathname.slice(pubMdIdx + pubMdPrefix.length));
    return (
      <CenterBreadcrumbBar
        items={[
          { label: t("common.projects"), href: "/" },
          { label: name, href: publicRoot },
          { label: t("publicShare.publicBadge") },
          { label: formatDocPathForDisplay(rel) },
        ]}
      />
    );
  }

  const pubDocPrefix = `/${slug}/public/doc/`;
  const pubDocIdx = pathname.indexOf(pubDocPrefix);
  if (pubDocIdx !== -1) {
    const rel = decodeDocUrlTrail(pathname.slice(pubDocIdx + pubDocPrefix.length));
    return (
      <CenterBreadcrumbBar
        items={[
          { label: t("common.projects"), href: "/" },
          { label: name, href: publicRoot },
          { label: t("publicShare.publicBadge") },
          { label: formatDocPathForDisplay(rel) },
        ]}
      />
    );
  }

  const mdIdx = pathname.indexOf("/md/");
  if (mdIdx !== -1) {
    const rel = decodeDocUrlTrail(pathname.slice(mdIdx + "/md/".length));
    const mdItems: BreadcrumbTrailItem[] = [
      { label: t("common.projects"), href: "/" },
      { label: name, href: `/${slug}` },
      { label: formatDocPathForDisplay(rel) },
    ];
    return <CenterBreadcrumbBar items={mdItems} />;
  }

  const docIdx = pathname.indexOf("/doc/");
  if (docIdx !== -1) {
    const rel = decodeDocUrlTrail(pathname.slice(docIdx + "/doc/".length));
    const docItems: BreadcrumbTrailItem[] = [
      { label: t("common.projects"), href: "/" },
      { label: name, href: `/${slug}` },
      { label: formatDocPathForDisplay(rel) },
    ];
    return <CenterBreadcrumbBar items={docItems} />;
  }

  const parts = pathname.split("/").filter(Boolean);
  const items: BreadcrumbTrailItem[] = [
    { label: t("common.projects"), href: "/" },
    { label: name, href: `/${slug}` },
  ];
  if (parts.length > 1) {
    items.push({
      label: parts
        .slice(1)
        .map((p) => decodeURIComponent(p))
        .join(" · "),
    });
  }

  return <CenterBreadcrumbBar items={items} />;
}

export function ProjectChrome({ slug, name }: Props) {
  const { t } = useTranslations();
  const pathname = usePathname() ?? "";
  if (isPublicViewerPath(pathname, slug)) {
    return null;
  }
  const onDashboard = pathname.includes("/dashboard");
  const showImmersiveDock = !onDashboard;

  return (
    <>
      <TopRightTheme />

      {onDashboard ? (
        <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-zinc-50/95 pt-[env(safe-area-inset-top)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
          <div className="mx-auto flex w-full min-w-0 max-w-5xl flex-wrap gap-1.5 px-[max(1rem,env(safe-area-inset-left))] py-3 pr-[max(1rem,env(safe-area-inset-right))] text-sm">
            <Link
              href={`/${slug}`}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-zinc-800 hover:bg-white dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              {t("common.home")}
            </Link>
            <Link
              href={`/${slug}/dashboard`}
              className="rounded-lg border border-zinc-900 bg-zinc-900 px-3 py-1.5 font-medium text-white hover:bg-zinc-800 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              {t("common.dashboard")}
            </Link>
            <Link
              href="/"
              className="rounded-lg px-3 py-1.5 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              {t("common.allProjects")}
            </Link>
          </div>
        </header>
      ) : null}

      <ProjectBreadcrumbLayer slug={slug} name={name} />

      {showImmersiveDock ? <BottomRightProjectDock slug={slug} /> : null}
    </>
  );
}
