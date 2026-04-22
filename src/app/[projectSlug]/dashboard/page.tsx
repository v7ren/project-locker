import { ProjectDashboardClient } from "@/components/project-dashboard-client";
import { getAuthGateMode } from "@/lib/auth/config";
import { readRequestSession } from "@/lib/auth/request-session";
import { listDocFiles, readHomeTsx, readProjectMeta } from "@/lib/projects";
import { isViewer } from "@/lib/team/permissions";
import { getTeamUserForSession } from "@/lib/team/session-bridge";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: Promise<{ projectSlug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function ProjectDashboardPage({ params, searchParams }: Props) {
  const { projectSlug } = await params;
  const { tab } = await searchParams;
  const meta = await readProjectMeta(projectSlug);
  if (!meta) notFound();

  if (getAuthGateMode() !== "none") {
    const session = await readRequestSession();
    const user = session ? await getTeamUserForSession(session) : null;
    if (user && isViewer(user)) {
      redirect(`/${meta.slug}`);
    }
  }

  const files = await listDocFiles(projectSlug);
  const tsx = await readHomeTsx(projectSlug);
  const initialTab =
    tab === "docs" ? "docs" : tab === "ai" ? "ai" : "home";

  return (
    <ProjectDashboardClient
      meta={meta}
      files={files}
      hasCustomTsx={Boolean(tsx)}
      initialTab={initialTab}
    />
  );
}
