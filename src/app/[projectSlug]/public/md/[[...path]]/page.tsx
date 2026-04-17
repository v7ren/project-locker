import { MdViewerWorkspaceLoader } from "@/components/mdviewer-workspace-loader";
import { isPathPublic } from "@/lib/public-share";
import { markdownWorkspaceHref, segmentsToDocsRelativePath } from "@/lib/doc-paths";
import { notFound, redirect } from "next/navigation";
import {
  isSafeRelativeSegments,
  readDocFile,
  readProjectMeta,
} from "@/lib/projects";

type Props = {
  params: Promise<{ projectSlug: string; path?: string[] }>;
};

export default async function PublicMarkdownPage({ params }: Props) {
  const { projectSlug, path: segments = [] } = await params;
  const meta = await readProjectMeta(projectSlug);
  if (!meta) notFound();

  if (segments.length === 0) {
    redirect(`/${meta.slug}/public`);
  }

  if (!isSafeRelativeSegments(segments)) {
    notFound();
  }

  const relativePath = segmentsToDocsRelativePath(segments);
  const lower = (relativePath.split("/").pop() ?? "").toLowerCase();
  if (!lower.endsWith(".md") && !lower.endsWith(".markdown")) {
    notFound();
  }

  const shareKey = `md/${relativePath}`;
  if (!(await isPathPublic(meta.slug, shareKey))) {
    redirect(markdownWorkspaceHref(meta.slug, relativePath));
  }

  const content = await readDocFile(meta.slug, relativePath);
  if (content === null) {
    notFound();
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <MdViewerWorkspaceLoader
        key={`public-${relativePath}`}
        slug={meta.slug}
        relativePath={relativePath}
        initialContent={content}
        readOnly
        rawDocHrefBase="public"
      />
    </div>
  );
}
