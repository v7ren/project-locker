"use client";

import type { BreadcrumbTrailItem } from "@/components/breadcrumb-trail";
import { BreadcrumbTrail } from "@/components/breadcrumb-trail";
import { useViewerChromeOptional } from "@/components/viewer-chrome-context";
import { cn } from "@/lib/utils";

type Props = {
  items: BreadcrumbTrailItem[];
};

export function CenterBreadcrumbBar({ items }: Props) {
  const viewerChrome = useViewerChromeOptional();

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-[260] flex justify-center px-[max(0.75rem,env(safe-area-inset-left))] py-[max(0.75rem,env(safe-area-inset-bottom))] pr-[max(0.75rem,env(safe-area-inset-right))] sm:px-4 sm:py-4",
        viewerChrome?.floatingUiHidden && "max-sm:hidden",
      )}
    >
      <div className="pointer-events-auto w-full max-w-[min(100vw-1.5rem,32rem)] min-w-0 rounded-full border border-zinc-200/45 bg-white/35 px-2.5 py-1.5 shadow-md backdrop-blur-md sm:px-3 dark:border-zinc-500/35 dark:bg-zinc-950/25">
        <BreadcrumbTrail items={items} />
      </div>
    </div>
  );
}
