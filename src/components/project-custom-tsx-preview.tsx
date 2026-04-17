"use client";

import dynamic from "next/dynamic";

/**
 * Loads react-live + sucrase only in the browser. Their CommonJS entry uses
 * `require`, which breaks under Turbopack’s RSC/SSR evaluation for sibling
 * routes (e.g. /[slug]/dashboard) when the heavy module is statically linked.
 */
export const ProjectCustomTsxPreview = dynamic(
  () =>
    import("./project-custom-tsx-live").then((m) => m.ProjectCustomTsxPreview),
  {
    ssr: false,
    loading: () => (
      <div
        className="min-h-screen w-full bg-zinc-50 dark:bg-zinc-950"
        aria-hidden
      />
    ),
  },
);
