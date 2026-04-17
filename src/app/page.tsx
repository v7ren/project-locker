import { HomePageClient } from "@/components/home-page-client";
import { listProjects } from "@/lib/projects";

export default async function Home() {
  const projects = await listProjects();
  return <HomePageClient projects={projects} />;
}
