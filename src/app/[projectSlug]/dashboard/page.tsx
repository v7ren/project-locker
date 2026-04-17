import { ProjectDashboardClient } from "@/components/project-dashboard-client";
import { listDocFiles, readHomeTsx, readProjectMeta } from "@/lib/projects";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ projectSlug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function ProjectDashboardPage({ params, searchParams }: Props) {
  const { projectSlug } = await params;
  const { tab } = await searchParams;
  const meta = await readProjectMeta(projectSlug);
  if (!meta) notFound();

  const files = await listDocFiles(projectSlug);
  const tsx = await readHomeTsx(projectSlug);
  const initialTab = tab === "docs" ? "docs" : "home";

  return (
    <ProjectDashboardClient
      meta={meta}
      files={files}
      hasCustomTsx={Boolean(tsx)}
      initialTab={initialTab}
    />
  );
}
