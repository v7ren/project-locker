import { DocsPageClient } from "@/components/docs-page-client";
import { listDocFiles, listProjects, readProjectMeta } from "@/lib/projects";

type Props = {
  searchParams: Promise<{ project?: string }>;
};

export default async function DocsPage({ searchParams }: Props) {
  const raw = (await searchParams).project?.trim() ?? null;
  const projects = await listProjects();
  const filterMeta = raw ? await readProjectMeta(raw) : null;

  const projectDocs = await Promise.all(
    projects.map(async (meta) => ({
      meta,
      files: await listDocFiles(meta.slug),
    })),
  );

  return (
    <DocsPageClient projects={projectDocs} filterSlug={raw} filterMeta={filterMeta} />
  );
}
