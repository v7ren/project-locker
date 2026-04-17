import { NextResponse } from "next/server";
import { createProject, listProjects } from "@/lib/projects";

export async function GET() {
  const projects = await listProjects();
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (
    typeof body !== "object" ||
    body === null ||
    typeof (body as { name?: unknown }).name !== "string"
  ) {
    return NextResponse.json({ error: "Expected { name: string }" }, { status: 400 });
  }
  const name = (body as { name: string }).name.trim();
  if (name.length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (name.length > 120) {
    return NextResponse.json({ error: "Name too long" }, { status: 400 });
  }
  const project = await createProject(name);
  return NextResponse.json({ project });
}
