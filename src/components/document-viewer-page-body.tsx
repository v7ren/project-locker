"use client";

import { DocViewer } from "@/components/doc-viewer";
import { PublicSharePanel } from "@/components/public-share-panel";
import { useViewerChromeOptional } from "@/components/viewer-chrome-context";
import { docFileKindFromEncodedRelativePath } from "@/lib/doc-file-kind";
import { formatDocPathForDisplay } from "@/lib/doc-paths";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Props = {
  slug: string;
  relativePath: string;
  fileUrl: string;
  /** Resolved on the server so SSR and the first client paint match (avoids locale hydration issues). */
  rawLabel: string;
  embedNoteLabel: string;
  /** When set, owners see “share as public” controls (not shown on anonymous public viewer pages). */
  shareKey?: string;
  /**
   * Reserved for layouts that need different bottom spacing from the default doc viewer.
   * PDF uses full-height preview; floating breadcrumb/dock sit above the content (`fixed`).
   */
  breadcrumbOnlyBottomInset?: boolean;
  /** Anonymous public document view: no header, raw links, or share UI — content only. */
  readOnlyPublic?: boolean;
};

export function DocumentViewerPageBody({
  slug,
  relativePath,
  fileUrl,
  shareKey,
  breadcrumbOnlyBottomInset = false,
  readOnlyPublic = false,
  rawLabel,
  embedNoteLabel,
}: Props) {
  const viewerChrome = useViewerChromeOptional();
  const hideFloatingUi = Boolean(viewerChrome?.floatingUiHidden);
  const hideHeader = readOnlyPublic || hideFloatingUi;
  const displayName = formatDocPathForDisplay(relativePath);
  const kind = docFileKindFromEncodedRelativePath(relativePath);
  const isPdf = kind === "pdf";

  return (
    <div
      className={cn(
        "flex min-h-0 min-w-0 flex-1 flex-col",
        isPdf && (readOnlyPublic || !hideFloatingUi) && "overflow-hidden",
        readOnlyPublic
          ? "min-h-0 flex-1 overflow-hidden pb-[max(0.5rem,env(safe-area-inset-bottom))]"
          : hideFloatingUi
            ? "pb-[max(0.5rem,env(safe-area-inset-bottom))]"
            : isPdf
              ? "pb-[env(safe-area-inset-bottom)]"
              : breadcrumbOnlyBottomInset
                ? "pb-[env(safe-area-inset-bottom)]"
                : "pm-viewer-pad-b",
        !isPdf && !hideFloatingUi && !readOnlyPublic && "max-sm:pt-1",
      )}
    >
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col",
          isPdf && "bg-white dark:bg-zinc-950",
        )}
      >
        {!hideHeader ? (
          <header
            className={cn(
              "shrink-0 border-b border-zinc-200 dark:border-zinc-800",
              isPdf ? "px-2 py-1.5 sm:px-3" : "px-3 py-2 sm:px-4",
            )}
          >
            <div className="flex min-w-0 items-start justify-between gap-2">
              <h1 className="min-w-0 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {displayName}
              </h1>
              {isPdf ? (
                <Link
                  href={fileUrl}
                  prefetch={false}
                  className="shrink-0 text-[11px] text-zinc-500 underline underline-offset-2 dark:text-zinc-400"
                >
                  {rawLabel}
                </Link>
              ) : null}
            </div>
            {!isPdf ? (
              <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                <Link href={fileUrl} prefetch={false} className="underline underline-offset-2">
                  {rawLabel}
                </Link>{" "}
                {embedNoteLabel}
              </p>
            ) : null}
            {shareKey ? (
              <div className={cn("flex flex-wrap items-center gap-2", isPdf ? "mt-1.5" : "mt-2")}>
                <PublicSharePanel slug={slug} shareKey={shareKey} triggerClassName="text-xs" />
              </div>
            ) : null}
          </header>
        ) : null}
        <DocViewer
          fileUrl={fileUrl}
          kind={kind}
          displayName={displayName}
          immersiveChrome={hideFloatingUi || readOnlyPublic}
        />
      </div>
    </div>
  );
}
