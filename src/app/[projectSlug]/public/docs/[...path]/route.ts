import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { isPathPublic } from "@/lib/public-share";
import { encodeDocsPathTrail, segmentsToDocsRelativePath } from "@/lib/doc-paths";
import {
  isSafeRelativeSegments,
  projectExists,
  resolveDocFilePath,
} from "@/lib/projects";

function mimeFor(filename: string): string {
  const n = filename.toLowerCase();
  if (n.endsWith(".pdf")) return "application/pdf";
  if (n.endsWith(".md") || n.endsWith(".markdown")) return "text/markdown";
  if (n.endsWith(".html") || n.endsWith(".htm")) return "text/html";
  if (n.endsWith(".png")) return "image/png";
  if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
  if (n.endsWith(".txt")) return "text/plain; charset=utf-8";
  return "application/octet-stream";
}

type RouteCtx = {
  params: Promise<{ projectSlug: string; path: string[] }>;
};

export async function GET(request: Request, context: RouteCtx) {
  const { projectSlug, path: segments } = await context.params;
  if (!(await projectExists(projectSlug))) {
    return new NextResponse("Not found", { status: 404 });
  }
  if (!isSafeRelativeSegments(segments)) {
    return new NextResponse("Bad path", { status: 400 });
  }

  const rel = segmentsToDocsRelativePath(segments);
  const shareKey = `doc/${rel}`;
  if (!(await isPathPublic(projectSlug, shareKey))) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = await resolveDocFilePath(projectSlug, rel);
  if (!filePath) {
    return new NextResponse("Not found", { status: 404 });
  }

  const buf = await fs.readFile(filePath);
  const basename = path.basename(filePath);
  const lower = basename.toLowerCase();
  const url = new URL(request.url);
  const raw = url.searchParams.get("raw") === "1";

  if ((lower.endsWith(".md") || lower.endsWith(".markdown")) && !raw) {
    const enc = encodeDocsPathTrail(rel);
    const target = new URL(`/${projectSlug}/public/md/${enc}`, url.origin);
    return NextResponse.redirect(target, 307);
  }

  return new NextResponse(buf, {
    headers: {
      "content-type": mimeFor(basename),
      "cache-control": "public, max-age=60",
    },
  });
}
