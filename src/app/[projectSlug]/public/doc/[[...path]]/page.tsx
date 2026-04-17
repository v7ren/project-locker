import { DocumentViewerPageBody } from "@/components/document-viewer-page-body";
import { docFileKind } from "@/lib/doc-file-kind";
import { documentViewerHref } from "@/lib/doc-paths";
import { isPathPublic } from "@/lib/public-share";
import { publicSharedDocServeHref } from "@/lib/public-share-urls";
import {
  isDocFile,
  isSafeRelativeSegments,
  readProjectMeta,
} from "@/lib/projects";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: Promise<{ projectSlug: string; path?: string[] }>;
};

export default async function PublicDocumentViewerPage({ params }: Props) {
  const { projectSlug, path: segments = [] } = await params;
  const meta = await readProjectMeta(projectSlug);
  if (!meta) notFound();

  if (segments.length === 0) {
    redirect(`/${meta.slug}/public`);
  }

  if (!isSafeRelativeSegments(segments)) {
    notFound();
  }

  const relativePath = segments.join("/");
  const lower = (segments[segments.length - 1] ?? "").toLowerCase();
  if (lower.endsWith(".md") || lower.endsWith(".markdown")) {
    const enc = relativePath.split("/").map(encodeURIComponent).join("/");
    redirect(`/${meta.slug}/public/md/${enc}`);
  }

  if (!(await isDocFile(meta.slug, relativePath))) {
    notFound();
  }

  const shareKey = `doc/${relativePath}`;
  if (!(await isPathPublic(meta.slug, shareKey))) {
    redirect(documentViewerHref(meta.slug, relativePath));
  }

  const fileUrl = publicSharedDocServeHref(meta.slug, relativePath);
  const kind = docFileKind(relativePath);

  return (
    <DocumentViewerPageBody slug={meta.slug} relativePath={relativePath} fileUrl={fileUrl} kind={kind} />
  );
}
