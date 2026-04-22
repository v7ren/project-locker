import { NextResponse } from "next/server";
import type { AgentStreamLine } from "@/lib/ai-chat-stream-events";
import { getAuthGateMode } from "@/lib/auth/config";
import { readRequestSession } from "@/lib/auth/request-session";
import {
  clearAiChatHistory,
  loadAiChatHistory,
  saveAiChatHistory,
} from "@/lib/ai-chat-history";
import {
  checkAiChatRateLimit,
  clientKeyFromRequest,
} from "@/lib/ai-chat-rate-limit";
import { getOpenRouterConfig } from "@/lib/openrouter";
import { projectExists, readProjectMeta } from "@/lib/projects";
import {
  runProjectAiAgent,
  type ClientChatMessage,
} from "@/lib/project-ai-agent";
import { canUseProjectAi } from "@/lib/team/permissions";
import { getTeamUserForSession } from "@/lib/team/session-bridge";
import type { TeamUserRecord } from "@/lib/team/users-store";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug: string }> };

type AiChatAccess =
  | { ok: true; user: TeamUserRecord | null; userId: string | null }
  | { ok: false; response: NextResponse };

async function resolveAiChatAccess(): Promise<AiChatAccess> {
  if (getAuthGateMode() === "none") {
    return { ok: true, user: null, userId: null };
  }
  const session = await readRequestSession();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  const user = await getTeamUserForSession(session);
  if (!user || !canUseProjectAi(user)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { ok: true, user, userId: user.id };
}

function isClientMessage(x: unknown): x is ClientChatMessage {
  if (typeof x !== "object" || x === null) return false;
  const o = x as { role?: unknown; content?: unknown };
  if (o.role !== "user" && o.role !== "assistant") return false;
  return typeof o.content === "string";
}

export async function GET(_request: Request, context: Ctx) {
  const { slug } = await context.params;
  if (!(await projectExists(slug))) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  const access = await resolveAiChatAccess();
  if (!access.ok) return access.response;
  const messages = await loadAiChatHistory(slug, { userId: access.userId });
  return NextResponse.json({ messages });
}

export async function POST(request: Request, context: Ctx) {
  const { slug } = await context.params;
  if (!(await projectExists(slug))) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const access = await resolveAiChatAccess();
  if (!access.ok) return access.response;

  const config = getOpenRouterConfig();
  if (!config) {
    return NextResponse.json(
      {
        error:
          "AI is not configured. Set OPENROUTER_API_KEY (and optionally OPENROUTER_CHAT_MODEL / OPENROUTER_EMBEDDING_MODEL) in the environment.",
      },
      { status: 503 },
    );
  }

  const rl = checkAiChatRateLimit(
    slug,
    `${access.userId ?? "anon"}\n${clientKeyFromRequest(request)}`,
  );
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many chat requests", retryAfterSec: rl.retryAfterSec },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSec) },
      },
    );
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

  const rawMessages = (body as { messages?: unknown }).messages;
  const persistHistory = (body as { persistHistory?: unknown }).persistHistory;
  const shouldPersist = persistHistory !== false;

  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    return NextResponse.json(
      { error: "Expected { messages: [{ role, content }, ...] }" },
      { status: 400 },
    );
  }

  const messages: ClientChatMessage[] = [];
  for (const m of rawMessages) {
    if (!isClientMessage(m)) {
      return NextResponse.json(
        {
          error:
            "Each message must be { role: 'user'|'assistant', content: string }",
        },
        { status: 400 },
      );
    }
    messages.push(m);
  }

  const meta = await readProjectMeta(slug);
  const projectName = meta?.name ?? slug;

  const rawLoc = (body as { viewerLocation?: unknown }).viewerLocation;
  const viewerLocation =
    typeof rawLoc === "string" ? rawLoc.trim().slice(0, 2000) : undefined;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (line: AgentStreamLine) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(line)}\n`));
      };
      try {
        const result = await runProjectAiAgent({
          slug,
          projectName,
          config,
          messages,
          viewerLocation:
            viewerLocation && viewerLocation.length > 0 ? viewerLocation : undefined,
          chatParticipant: access.user
            ? {
                handle: access.user.username,
                email: access.user.email,
                role: access.user.role,
              }
            : undefined,
          signal: request.signal,
          onProgress: (payload) => send({ type: "progress", payload }),
          onDelta: (text) => send({ type: "delta", text }),
        });
        const toStore: ClientChatMessage[] = [
          ...messages,
          { role: "assistant", content: result.reply },
        ];
        if (shouldPersist) {
          await saveAiChatHistory(slug, toStore, { userId: access.userId });
        }
        send({ type: "done", reply: result.reply, steps: result.steps });
      } catch (e) {
        const message =
          e instanceof DOMException && e.name === "AbortError"
            ? "Aborted"
            : e instanceof Error
              ? e.message
              : "Chat failed";
        send({ type: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function DELETE(_request: Request, context: Ctx) {
  const { slug } = await context.params;
  if (!(await projectExists(slug))) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  const access = await resolveAiChatAccess();
  if (!access.ok) return access.response;
  try {
    await clearAiChatHistory(slug, { userId: access.userId });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not clear chat";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
