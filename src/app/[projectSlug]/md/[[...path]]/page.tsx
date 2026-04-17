import { MdViewerWorkspaceLoader } from "@/components/mdviewer-workspace-loader";
import { notFound, redirect } from "next/navigation";
import {
  isSafeRelativeSegments,
  readDocFile,
  readProjectMeta,
} from "@/lib/projects";

type Props = {
  params: Promise<{ projectSlug: string; path?: string[] }>;
};

export default async function MarkdownEditorPage({ params }: Props) {
  const { projectSlug, path: segments = [] } = await params;
  const meta = await readProjectMeta(projectSlug);
  if (!meta) notFound();

  if (segments.length === 0) {
    redirect(`/${meta.slug}/dashboard?tab=docs`);
  }

  if (!isSafeRelativeSegments(segments)) {
    notFound();
  }

  const relativePath = segments.join("/");
  const lower = (segments[segments.length - 1] ?? "").toLowerCase();
  if (!lower.endsWith(".md") && !lower.endsWith(".markdown")) {
    notFound();
  }

  const content = await readDocFile(meta.slug, relativePath);
  if (content === null) {
    notFound();
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <MdViewerWorkspaceLoader
        key={relativePath}
        slug={meta.slug}
        relativePath={relativePath}
        initialContent={content}
        shareKey={`md/${relativePath}`}
      />
    </div>
  );
}
