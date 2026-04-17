import { NextResponse } from "next/server";
import {
  isPathPublic,
  isValidShareKey,
  normalizeShareKey,
  publicShareViewerPathForKey,
  readPublicShareManifest,
  setPathPublic,
} from "@/lib/public-share";
import { projectExists } from "@/lib/projects";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(request: Request, context: Ctx) {
  const { slug } = await context.params;
  if (!(await projectExists(slug))) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  const manifest = await readPublicShareManifest(slug);
  const key = new URL(request.url).searchParams.get("key");
  if (key && key.trim()) {
    const kt = key.trim();
    return NextResponse.json({
      ...manifest,
      isPublic: await isPathPublic(slug, kt),
      viewerPath: await publicShareViewerPathForKey(slug, kt),
    });
  }
  return NextResponse.json(manifest);
}

export async function POST(request: Request, context: Ctx) {
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
  const { key: keyRaw, public: pub } = body as { key?: unknown; public?: unknown };
  if (typeof keyRaw !== "string" || typeof pub !== "boolean") {
    return NextResponse.json({ error: "Expected { key: string, public: boolean }" }, { status: 400 });
  }
  const key = normalizeShareKey(keyRaw);
  if (!isValidShareKey(key)) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  try {
    await setPathPublic(slug, key, pub);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const paths = (await readPublicShareManifest(slug)).paths;
  return NextResponse.json({
    ok: true,
    paths,
    isPublic: await isPathPublic(slug, key),
    viewerPath: await publicShareViewerPathForKey(slug, key),
  });
}
