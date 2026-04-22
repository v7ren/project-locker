import { getAuthGateMode } from "@/lib/auth/config";
import { readRequestSession } from "@/lib/auth/request-session";
import { readProjectMeta } from "@/lib/projects";
import { isViewer } from "@/lib/team/permissions";
import { getTeamUserForSession } from "@/lib/team/session-bridge";
import { notFound, redirect } from "next/navigation";

type Props = { params: Promise<{ projectSlug: string }> };

export default async function ProjectDocsPage({ params }: Props) {
  const { projectSlug } = await params;
  const meta = await readProjectMeta(projectSlug);
  if (!meta) notFound();

  if (getAuthGateMode() !== "none") {
    const session = await readRequestSession();
    const user = session ? await getTeamUserForSession(session) : null;
    if (user && isViewer(user)) {
      redirect(`/docs?project=${encodeURIComponent(meta.slug)}`);
    }
  }

  redirect(`/${meta.slug}/dashboard?tab=docs`);
}
