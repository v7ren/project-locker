import { NextResponse } from "next/server";
import { scheduleProjectRagSync } from "@/lib/ai-rag-sync";
import {
  deleteDocFile,
  isSafeRelativeSegments,
  projectExists,
  renameDocFile,
  writeDocFile,
} from "@/lib/projects";

type Ctx = { params: Promise<{ slug: string }> };

export async function POST(request: Request, context: Ctx) {
  const { slug } = await context.params;
  if (!(await projectExists(slug))) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const { filename, content } = body as { filename?: unknown; content?: unknown };
    if (typeof filename !== "string" || typeof content !== "string") {
      return NextResponse.json(
        { error: "Expected { filename: string, content: string }" },
        { status: 400 },
      );
    }
    const rel = filename.trim().replace(/^\/+/, "");
    const segments = rel.split("/").filter(Boolean);
    if (!isSafeRelativeSegments(segments)) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }
    await writeDocFile(slug, rel, Buffer.from(content, "utf8"));
    scheduleProjectRagSync(slug, [rel.replace(/\\/g, "/")]);
    return NextResponse.json({ ok: true, path: rel });
  }

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file field" }, { status: 400 });
    }
    const override = form.get("path");
    const name =
      typeof override === "string" && override.trim().length > 0
        ? override.trim().replace(/^\/+/, "")
        : file.name.trim().replace(/^\/+/, "");
    const segments = name.split("/").filter(Boolean);
    if (!isSafeRelativeSegments(segments)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }
    const buf = Buffer.from(await file.arrayBuffer());
    await writeDocFile(slug, name, buf);
    scheduleProjectRagSync(slug, [name.replace(/\\/g, "/")]);
    return NextResponse.json({ ok: true, path: name });
  }

  return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });
}

export async function PATCH(request: Request, context: Ctx) {
  const { slug } = await context.params;
  if (!(await projectExists(slug))) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { from, to } = body as { from?: unknown; to?: unknown };
  if (typeof from !== "string" || typeof to !== "string") {
    return NextResponse.json(
      { error: "Expected { from: string, to: string } (docs-relative paths)" },
      { status: 400 },
    );
  }

  try {
    await renameDocFile(slug, from, to);
    const fromNorm = from.trim().replace(/^\/+/, "").replace(/\\/g, "/");
    const toNormPaths = to.trim().replace(/^\/+/, "").replace(/\\/g, "/");
    scheduleProjectRagSync(slug, [fromNorm, toNormPaths]);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Rename failed";
    if (msg === "Not found") {
      return NextResponse.json({ error: "Source file not found" }, { status: 404 });
    }
    if (msg === "Destination exists") {
      return NextResponse.json(
        { error: "A file already exists at the new path" },
        { status: 409 },
      );
    }
    if (msg === "Not a file") {
      return NextResponse.json(
        { error: "Source path is not a file" },
        { status: 400 },
      );
    }
    if (msg === "Invalid path") {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const toNorm = to.trim().replace(/^\/+/, "").replace(/\\/g, "/");
  return NextResponse.json({ ok: true, from: from.trim(), to: toNorm });
}

export async function DELETE(request: Request, context: Ctx) {
  const { slug } = await context.params;
  if (!(await projectExists(slug))) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const pathField = (body as { path?: unknown }).path;
  if (typeof pathField !== "string") {
    return NextResponse.json(
      { error: "Expected { path: string } (docs-relative file path)" },
      { status: 400 },
    );
  }
  const rel = pathField.trim().replace(/^\/+/, "");
  const segments = rel.split("/").filter(Boolean);
  if (!isSafeRelativeSegments(segments)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    await deleteDocFile(slug, rel);
    scheduleProjectRagSync(slug, [rel.replace(/\\/g, "/")]);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Delete failed";
    if (msg === "Not found") {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    if (msg === "Not a file") {
      return NextResponse.json(
        { error: "Path is not a file (delete files one at a time)" },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  return NextResponse.json({ ok: true, path: rel });
}
