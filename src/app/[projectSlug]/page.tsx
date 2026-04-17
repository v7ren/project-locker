import { ProjectCustomTsxPreview } from "@/components/project-custom-tsx-preview";
import { ProjectHomeLanding } from "@/components/project-home-landing";
import { readHomeHtml, readHomeTsx, readProjectMeta } from "@/lib/projects";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ projectSlug: string }> };

export default async function ProjectHome({ params }: Props) {
  const { projectSlug } = await params;
  const meta = await readProjectMeta(projectSlug);
  if (!meta) notFound();

  const html = await readHomeHtml(projectSlug);
  const tsx = await readHomeTsx(projectSlug);

  if (html) {
    return (
      <div className="min-h-screen w-full bg-white">
        <iframe
          title="Custom project home"
          sandbox=""
          srcDoc={html}
          className="block min-h-screen w-full border-0 bg-white"
        />
      </div>
    );
  }

  if (tsx) {
    return <ProjectCustomTsxPreview source={tsx} variant="fullscreen" />;
  }

  return <ProjectHomeLanding slug={meta.slug} name={meta.name} />;
}
