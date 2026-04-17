import { DocumentViewerPageBody } from "@/components/document-viewer-page-body";
import { documentViewerHref, segmentsToDocsRelativePath } from "@/lib/doc-paths";
import { translate } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { publicSharedMarkdownHref } from "@/lib/public-share-urls";
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

  const relativePath = segmentsToDocsRelativePath(segments);
  const lower = (relativePath.split("/").pop() ?? "").toLowerCase();
  if (lower.endsWith(".md") || lower.endsWith(".markdown")) {
    redirect(publicSharedMarkdownHref(meta.slug, relativePath));
  }

  if (!(await isDocFile(meta.slug, relativePath))) {
    notFound();
  }

  const shareKey = `doc/${relativePath}`;
  if (!(await isPathPublic(meta.slug, shareKey))) {
    redirect(documentViewerHref(meta.slug, relativePath));
  }

  const fileUrl = publicSharedDocServeHref(meta.slug, relativePath);
  const locale = await getRequestLocale();

  return (
    <DocumentViewerPageBody
      slug={meta.slug}
      relativePath={relativePath}
      fileUrl={fileUrl}
      readOnlyPublic
      rawLabel={translate(locale, "common.raw")}
      embedNoteLabel={translate(locale, "docPage.embedNote")}
    />
  );
}
