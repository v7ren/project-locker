import { DocumentViewerPageBody } from "@/components/document-viewer-page-body";
import { docFileKind } from "@/lib/doc-file-kind";
import { markdownWorkspaceHref, publicDocHref } from "@/lib/doc-paths";
import {
  isDocFile,
  isSafeRelativeSegments,
  readProjectMeta,
} from "@/lib/projects";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: Promise<{ projectSlug: string; path?: string[] }>;
};

export default async function DocumentViewerPage({ params }: Props) {
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
  if (lower.endsWith(".md") || lower.endsWith(".markdown")) {
    redirect(markdownWorkspaceHref(meta.slug, relativePath));
  }

  if (!(await isDocFile(meta.slug, relativePath))) {
    notFound();
  }

  const fileUrl = publicDocHref(meta.slug, relativePath);
  const kind = docFileKind(relativePath);

  return (
    <DocumentViewerPageBody
      slug={meta.slug}
      relativePath={relativePath}
      fileUrl={fileUrl}
      kind={kind}
      shareKey={`doc/${relativePath}`}
    />
  );
}
