"use client";

import dynamic from "next/dynamic";

// Client-only: react-live / sucrase rely on `require` and must stay off the RSC graph.
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
