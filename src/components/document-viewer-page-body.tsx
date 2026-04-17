"use client";

import { DocViewer } from "@/components/doc-viewer";
import { PublicSharePanel } from "@/components/public-share-panel";
import type { DocFileKind } from "@/lib/doc-file-kind";
import { formatDocPathForDisplay } from "@/lib/doc-paths";
import { useTranslations } from "@/lib/i18n/locale-provider";
import Link from "next/link";

type Props = {
  slug: string;
  relativePath: string;
  fileUrl: string;
  kind: DocFileKind;
  /** When set, owners see “share as public” controls (not shown on anonymous public viewer pages). */
  shareKey?: string;
};

export function DocumentViewerPageBody({ slug, relativePath, fileUrl, kind, shareKey }: Props) {
  const { t } = useTranslations();
  const displayName = formatDocPathForDisplay(relativePath);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col pm-viewer-pad-b max-sm:pt-1">
      <header className="shrink-0 border-b border-zinc-200 px-3 py-2 dark:border-zinc-800 sm:px-4">
        <h1 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {displayName}
        </h1>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          <Link href={fileUrl} className="underline underline-offset-2">
            {t("docPage.openDirectDocs")}
          </Link>{" "}
          {t("docPage.embedNote")}
        </p>
        {shareKey ? (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <PublicSharePanel slug={slug} shareKey={shareKey} triggerClassName="text-xs" />
          </div>
        ) : null}
      </header>
      <DocViewer fileUrl={fileUrl} kind={kind} displayName={displayName} />
    </div>
  );
}
