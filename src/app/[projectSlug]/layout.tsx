import { ProjectChrome } from "@/components/project-chrome";
import { ViewerChromeProvider } from "@/components/viewer-chrome-context";
import { notFound } from "next/navigation";
import { readProjectMeta } from "@/lib/projects";

type Props = {
  children: React.ReactNode;
  params: Promise<{ projectSlug: string }>;
};

export default async function ProjectLayout({ children, params }: Props) {
  const { projectSlug } = await params;
  const meta = await readProjectMeta(projectSlug);
  if (!meta) notFound();

  return (
    <ViewerChromeProvider>
      <div className="flex min-h-full w-full flex-1 flex-col">
        <ProjectChrome slug={meta.slug} name={meta.name} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </ViewerChromeProvider>
  );
}
