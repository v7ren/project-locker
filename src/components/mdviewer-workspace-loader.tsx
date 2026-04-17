"use client";

import dynamic from "next/dynamic";

const MdViewerWorkspace = dynamic(
  () =>
    import("@/components/mdviewer-workspace").then((m) => m.MdViewerWorkspace),
  {
    ssr: false,
    loading: () => <div className="min-h-[50vh] w-full animate-pulse bg-zinc-100 dark:bg-zinc-900" />,
  },
);

export type MdViewerWorkspaceLoaderProps = {
  slug: string;
  relativePath: string;
  initialContent: string;
  readOnly?: boolean;
  shareKey?: string;
  rawDocHrefBase?: "public";
};

export function MdViewerWorkspaceLoader(props: MdViewerWorkspaceLoaderProps) {
  return <MdViewerWorkspace {...props} />;
}
