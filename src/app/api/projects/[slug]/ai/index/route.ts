import { NextResponse } from "next/server";
import { getAuthGateMode } from "@/lib/auth/config";
import { readRequestSession } from "@/lib/auth/request-session";
import { getOpenRouterConfig } from "@/lib/openrouter";
import { loadRagIndex, rebuildProjectRagIndex } from "@/lib/project-rag";
import { projectExists } from "@/lib/projects";
import { canUseProjectAi } from "@/lib/team/permissions";
import { getTeamUserForSession } from "@/lib/team/session-bridge";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug: string }> };

async function blockViewerAi(): Promise<NextResponse | null> {
  if (getAuthGateMode() === "none") return null;
  const session = await readRequestSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await getTeamUserForSession(session);
  if (!user || !canUseProjectAi(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function GET(_request: Request, context: Ctx) {
  const { slug } = await context.params;
  if (!(await projectExists(slug))) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const denied = await blockViewerAi();
  if (denied) return denied;

  const index = await loadRagIndex(slug);
  if (!index) {
    return NextResponse.json({
      indexed: false,
      chunkCount: 0,
      updatedAt: null as string | null,
      embeddingModel: null as string | null,
    });
  }

  return NextResponse.json({
    indexed: true,
    chunkCount: index.chunks.length,
    updatedAt: index.updatedAt,
    embeddingModel: index.embeddingModel,
  });
}

export async function POST(_request: Request, context: Ctx) {
  const { slug } = await context.params;
  if (!(await projectExists(slug))) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const denied = await blockViewerAi();
  if (denied) return denied;

  const config = getOpenRouterConfig();
  if (!config) {
    return NextResponse.json(
      {
        error:
          "AI is not configured. Set OPENROUTER_API_KEY in the environment.",
      },
      { status: 503 },
    );
  }

  try {
    const { chunkCount } = await rebuildProjectRagIndex(slug, config);
    return NextResponse.json({ ok: true, chunkCount });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Index failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
