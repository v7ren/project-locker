import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { scheduleProjectRagSync } from "@/lib/ai-rag-sync";
import { homeDir, homePageRagPath, projectExists } from "@/lib/projects";

type Ctx = { params: Promise<{ slug: string }> };

export async function POST(request: Request, context: Ctx) {
  const { slug } = await context.params;
  if (!(await projectExists(slug))) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Use multipart/form-data with field file" },
      { status: 415 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file field" }, { status: 400 });
  }

  const lower = file.name.toLowerCase();
  let target: string;
  if (lower.endsWith(".html") || lower.endsWith(".htm")) {
    target = "custom.html";
  } else if (lower.endsWith(".tsx") || lower.endsWith(".jsx")) {
    target = "custom.tsx";
  } else {
    return NextResponse.json(
      { error: "Upload an .html/.htm or .tsx/.jsx file" },
      { status: 400 },
    );
  }

  const dir = homeDir(slug);
  await fs.mkdir(dir, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, target), buf);
  scheduleProjectRagSync(slug, [
    homePageRagPath(target === "custom.html" ? "custom.html" : "custom.tsx"),
  ]);
  return NextResponse.json({ ok: true, savedAs: target });
}
