import { NextResponse } from "next/server";
import { deleteProject, isSafeProjectSlug, projectExists } from "@/lib/projects";

type Ctx = { params: Promise<{ slug: string }> };

export async function DELETE(_request: Request, context: Ctx) {
  const { slug } = await context.params;
  if (!isSafeProjectSlug(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }
  if (!(await projectExists(slug))) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  try {
    await deleteProject(slug);
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
