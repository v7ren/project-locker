import { readProjectMeta } from "@/lib/projects";
import { notFound, redirect } from "next/navigation";

type Props = { params: Promise<{ projectSlug: string }> };

export default async function ProjectDocsPage({ params }: Props) {
  const { projectSlug } = await params;
  const meta = await readProjectMeta(projectSlug);
  if (!meta) notFound();

  redirect(`/${meta.slug}/dashboard?tab=docs`);
}
