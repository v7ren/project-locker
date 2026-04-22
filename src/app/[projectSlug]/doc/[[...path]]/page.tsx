import { DocumentViewerPageBody } from "@/components/document-viewer-page-body";
import { markdownWorkspaceHref, publicDocHref, segmentsToDocsRelativePath } from "@/lib/doc-paths";
import { translate } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  isDocFile,
  isSafeRelativeSegments,
  readProjectMeta,
} from "@/lib/projects";
import { getAuthGateMode } from "@/lib/auth/config";
import { readRequestSession } from "@/lib/auth/request-session";
import { isViewer } from "@/lib/team/permissions";
import { getTeamUserForSession } from "@/lib/team/session-bridge";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: Promise<{ projectSlug: string; path?: string[] }>;
};

export default async function DocumentViewerPage({ params }: Props) {
  const { projectSlug, path: segments = [] } = await params;
  const meta = await readProjectMeta(projectSlug);
  if (!meta) notFound();

  if (segments.length === 0) {
    if (getAuthGateMode() !== "none") {
      const session = await readRequestSession();
      const user = session ? await getTeamUserForSession(session) : null;
      if (user && isViewer(user)) {
        redirect(`/docs?project=${encodeURIComponent(meta.slug)}`);
      }
    }
    redirect(`/${meta.slug}/dashboard?tab=docs`);
  }

  if (!isSafeRelativeSegments(segments)) {
    notFound();
  }

  const relativePath = segmentsToDocsRelativePath(segments);
  const lower = (segments[segments.length - 1] ?? "").toLowerCase();
  if (lower.endsWith(".md") || lower.endsWith(".markdown")) {
    redirect(markdownWorkspaceHref(meta.slug, relativePath));
  }

  if (!(await isDocFile(meta.slug, relativePath))) {
    notFound();
  }

  const fileUrl = publicDocHref(meta.slug, relativePath);
  const locale = await getRequestLocale();

  return (
    <DocumentViewerPageBody
      slug={meta.slug}
      relativePath={relativePath}
      fileUrl={fileUrl}
      shareKey={`doc/${relativePath}`}
      rawLabel={translate(locale, "common.raw")}
      embedNoteLabel={translate(locale, "docPage.embedNote")}
    />
  );
}
