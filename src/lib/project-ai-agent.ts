import type { AiToolStep } from "@/lib/ai-tool-step";
import type { AgentStreamProgress } from "@/lib/ai-chat-stream-events";
import type { OpenRouterConfig } from "@/lib/openrouter";
import { openRouterChatCompletionStream } from "@/lib/openrouter";
import {
  executeProjectAiTool,
  projectAiToolDefinitions,
  syncRagIndexForPaths,
} from "@/lib/project-rag";

export type { AgentStreamProgress } from "@/lib/ai-chat-stream-events";

export type ClientChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const MAX_AGENT_STEPS = 12;
const MAX_MESSAGE_CHARS = 32_000;
const MAX_MESSAGES = 40;

function summarizeToolResult(result: string): string {
  const line = result.split("\n").find((l) => l.trim().length > 0) ?? "";
  const t = line.trim();
  if (t.length > 140) return `${t.slice(0, 137)}…`;
  return t || "(empty)";
}

function throwIfAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }
}

function toolProgressFromArgs(
  name: string,
  args: unknown,
): Extract<AgentStreamProgress, { kind: "tool" }> {
  const parseObj = (): Record<string, unknown> =>
    typeof args === "object" && args !== null && !Array.isArray(args)
      ? (args as Record<string, unknown>)
      : {};
  const o = parseObj();
  switch (name) {
    case "read_document":
    case "write_document":
    case "delete_document":
      return {
        kind: "tool",
        tool: name,
        path: typeof o.path === "string" ? o.path : undefined,
      };
    case "rename_document":
      return {
        kind: "tool",
        tool: name,
        fromPath: typeof o.from_path === "string" ? o.from_path : undefined,
        toPath: typeof o.to_path === "string" ? o.to_path : undefined,
      };
    case "search_documents":
      return {
        kind: "tool",
        tool: name,
        query: typeof o.query === "string" ? o.query : undefined,
      };
    case "grep_docs":
      return {
        kind: "tool",
        tool: name,
        pattern: typeof o.pattern === "string" ? o.pattern : undefined,
      };
    case "read_home_page":
    case "write_home_page":
      return {
        kind: "tool",
        tool: name,
        file: typeof o.file === "string" ? o.file : undefined,
      };
    default:
      return { kind: "tool", tool: name };
  }
}

export type ProjectAiChatParticipant = {
  handle: string;
  email: string | null;
  role: string;
};

export async function runProjectAiAgent(params: {
  slug: string;
  projectName: string;
  config: OpenRouterConfig;
  messages: ClientChatMessage[];
  viewerLocation?: string;
  /** Signed-in team member; shapes tone and who “you” refers to. */
  chatParticipant?: ProjectAiChatParticipant;
  signal?: AbortSignal;
  /** Fires before each model call and before each tool execution (read shows immediately). */
  onProgress?: (p: AgentStreamProgress) => void;
  /** Fires as the model streams the final assistant text. */
  onDelta?: (text: string) => void;
}): Promise<{ reply: string; steps: AiToolStep[] }> {
  const { slug, projectName, config, signal, onProgress, onDelta } = params;
  const tools = projectAiToolDefinitions();
  const steps: AiToolStep[] = [];

  const trimmed = params.messages
    .filter((m) => (m.content?.length ?? 0) > 0)
    .slice(-MAX_MESSAGES)
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content.slice(0, MAX_MESSAGE_CHARS),
    }));

  const loc = params.viewerLocation?.trim();
  const locationBlock =
    loc && loc.length > 0
      ? `\n\nUser’s current place in the app (where they were when they sent this message): ${loc}`
      : "";

  const p = params.chatParticipant;
  const who =
    p != null
      ? (() => {
          const at = p.handle ? `@${p.handle}` : null;
          const mail = p.email?.trim() ? p.email.trim() : null;
          const label = at ?? mail ?? "a team member";
          return `${label} (team role: ${p.role})`;
        })()
      : null;
  const participantBlock =
    who != null
      ? `\n\nYou are replying to ${who}. Prefer direct “you” when addressing them; mention their @handle or email only when it avoids ambiguity.`
      : "";

  const system = `You are a project assistant for "${projectName}" (project slug: ${slug}).
You may only use the provided tools for this project. Docs live under the docs folder (list/read/write/delete/rename).
The public main page for /${slug} is optional custom HTML (custom.html, sandboxed iframe) and/or custom TSX (custom.tsx, live preview); use list_home_page, read_home_page, and write_home_page. If both HTML and TSX exist, HTML is served first.
Do not assume access to other projects.
Use the viewer location below to tailor answers (e.g. if they are on the dashboard Docs tab, they may be editing files; if on the public home URL, they may be checking the live site).${locationBlock}${participantBlock}

Plan briefly, then act. Prefer search_documents for broad topics; use grep_docs for exact tokens, imports, or symbols before opening very large files. Read only what you need and cite paths like \`notes/roadmap.md\` in your answer.
search_documents accepts optional scope: all (default), docs, or home. grep_docs scans raw file lines with a JavaScript RegExp.

When editing custom.tsx: the live preview only supports React + lucide-react (react-live); it does not run on the server. custom.html is sandboxed in an iframe.

Be concise. To highlight critical words, use ==double equals== around them.
If a tool returns an error, adjust and retry or explain the limitation.`;

  type Msg =
    | {
        role: "system" | "user" | "assistant";
        content: string | null;
        tool_calls?: Array<{
          id: string;
          type: "function";
          function: { name: string; arguments: string };
        }>;
      }
    | { role: "tool"; tool_call_id: string; content: string };

  const conv: Msg[] = [
    { role: "system", content: system },
    ...trimmed.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  for (let step = 0; step < MAX_AGENT_STEPS; step++) {
    throwIfAborted(signal);
    onProgress?.({ kind: "model" });
    /**
     * Forward text deltas live. When the step ultimately calls a tool instead
     * of answering, any buffered text was just the model's preamble / thinking,
     * and the client's tool progress events will take over the UI.
     */
    const { message } = await openRouterChatCompletionStream({
      config,
      messages: conv,
      tools,
      signal,
      onDelta: (d) => {
        if (typeof d.text === "string" && d.text.length > 0) {
          onDelta?.(d.text);
        }
      },
    });

    const toolCalls = message.tool_calls;
    if (!toolCalls?.length) {
      const text = (message.content ?? "").trim();
      return { reply: text || "(no response)", steps };
    }

    conv.push({
      role: "assistant",
      content: message.content,
      tool_calls: toolCalls,
    });

    for (const tc of toolCalls) {
      throwIfAborted(signal);
      let args: unknown = {};
      try {
        args = JSON.parse(tc.function.arguments || "{}") as unknown;
      } catch {
        args = {};
      }
      onProgress?.(toolProgressFromArgs(tc.function.name, args));
      const { result, changedPaths } = await executeProjectAiTool({
        slug,
        config,
        name: tc.function.name,
        args,
      });
      const trimmedResult = result.trim();
      steps.push({
        name: tc.function.name,
        ok: !trimmedResult.startsWith("Error:"),
        summary: summarizeToolResult(result),
      });
      if (changedPaths.length > 0) {
        await syncRagIndexForPaths(slug, config, changedPaths);
      }
      conv.push({
        role: "tool",
        tool_call_id: tc.id,
        content: result,
      });
    }
  }

  return {
    reply:
      "Stopped after maximum tool steps. Ask a narrower question or try again.",
    steps,
  };
}
