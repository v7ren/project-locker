const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

export type OpenRouterConfig = {
  apiKey: string;
  chatModel: string;
  embeddingModel: string;
  siteUrl: string | undefined;
  appTitle: string | undefined;
};

export function getOpenRouterConfig(): OpenRouterConfig | null {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) return null;
  return {
    apiKey,
    chatModel:
      process.env.OPENROUTER_CHAT_MODEL?.trim() || "openai/gpt-oss-120b:free",
    embeddingModel:
      process.env.OPENROUTER_EMBEDDING_MODEL?.trim() ||
      "openai/text-embedding-3-small",
    siteUrl: process.env.OPENROUTER_SITE_URL?.trim() || undefined,
    appTitle: process.env.OPENROUTER_APP_TITLE?.trim() || undefined,
  };
}

type ChatMessage =
  | {
      role: "system" | "user" | "assistant";
      content: string | null;
      tool_calls?: ToolCall[];
    }
  | {
      role: "tool";
      tool_call_id: string;
      content: string;
    };

type ToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

type ToolDefinition = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

export async function openRouterChatCompletion(params: {
  config: OpenRouterConfig;
  messages: ChatMessage[];
  tools: ToolDefinition[];
  signal?: AbortSignal;
}): Promise<{
  message: {
    role: string;
    content: string | null;
    tool_calls?: ToolCall[];
  };
  finishReason: string | null;
}> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${params.config.apiKey}`,
    "Content-Type": "application/json",
  };
  if (params.config.siteUrl) {
    headers["HTTP-Referer"] = params.config.siteUrl;
  }
  if (params.config.appTitle) {
    headers["X-Title"] = params.config.appTitle;
  }

  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers,
    signal: params.signal,
    body: JSON.stringify({
      model: params.config.chatModel,
      messages: params.messages,
      tools: params.tools,
      tool_choice: "auto",
      temperature: 0.3,
    }),
  });

  const raw = (await res.json()) as {
    error?: { message?: string };
    choices?: Array<{
      finish_reason?: string;
      message?: {
        role?: string;
        content?: string | null;
        tool_calls?: ToolCall[];
      };
    }>;
  };

  if (!res.ok) {
    const msg =
      raw.error?.message ?? `OpenRouter chat error (${res.status})`;
    throw new Error(msg);
  }

  const choice = raw.choices?.[0];
  const message = choice?.message;
  if (!message) {
    throw new Error("OpenRouter returned no message");
  }

  return {
    message: {
      role: message.role ?? "assistant",
      content: message.content ?? null,
      tool_calls: message.tool_calls,
    },
    finishReason: choice?.finish_reason ?? null,
  };
}

/**
 * Streaming variant of the chat completion. Consumes OpenRouter's SSE response and
 * yields per-chunk deltas (text + tool-call fragments) while assembling the final
 * message. Falls back gracefully if `stream` is not supported for the chosen model.
 */
export async function openRouterChatCompletionStream(params: {
  config: OpenRouterConfig;
  messages: ChatMessage[];
  tools: ToolDefinition[];
  signal?: AbortSignal;
  onDelta?: (delta: { text?: string }) => void;
}): Promise<{
  message: {
    role: string;
    content: string | null;
    tool_calls?: ToolCall[];
  };
  finishReason: string | null;
}> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${params.config.apiKey}`,
    "Content-Type": "application/json",
    Accept: "text/event-stream",
  };
  if (params.config.siteUrl) headers["HTTP-Referer"] = params.config.siteUrl;
  if (params.config.appTitle) headers["X-Title"] = params.config.appTitle;

  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers,
    signal: params.signal,
    body: JSON.stringify({
      model: params.config.chatModel,
      messages: params.messages,
      tools: params.tools,
      tool_choice: "auto",
      temperature: 0.3,
      stream: true,
    }),
  });

  if (!res.ok) {
    let msg = `OpenRouter chat error (${res.status})`;
    try {
      const err = (await res.json()) as { error?: { message?: string } };
      if (err.error?.message) msg = err.error.message;
    } catch {
      /* keep default */
    }
    throw new Error(msg);
  }

  const body = res.body;
  if (!body) throw new Error("OpenRouter returned empty streaming body");

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";
  let role: string | undefined;
  let finishReason: string | null = null;

  type PartialToolCall = {
    id?: string;
    type?: "function";
    function: { name: string; arguments: string };
  };
  const toolCallsByIndex = new Map<number, PartialToolCall>();

  const processLine = (raw: string): boolean => {
    const line = raw.trim();
    if (!line) return false;
    if (!line.startsWith("data:")) return false;
    const data = line.slice(5).trim();
    if (data === "[DONE]") return true;
    let obj: {
      choices?: Array<{
        delta?: {
          role?: string;
          content?: string | null;
          tool_calls?: Array<{
            index: number;
            id?: string;
            type?: "function";
            function?: { name?: string; arguments?: string };
          }>;
        };
        finish_reason?: string | null;
      }>;
      error?: { message?: string };
    };
    try {
      obj = JSON.parse(data);
    } catch {
      return false;
    }
    if (obj.error?.message) {
      throw new Error(obj.error.message);
    }
    const choice = obj.choices?.[0];
    if (!choice) return false;
    const delta = choice.delta;
    if (delta?.role) role = delta.role;
    if (typeof delta?.content === "string" && delta.content.length > 0) {
      content += delta.content;
      params.onDelta?.({ text: delta.content });
    }
    if (delta?.tool_calls) {
      for (const part of delta.tool_calls) {
        const existing = toolCallsByIndex.get(part.index) ?? {
          function: { name: "", arguments: "" },
        };
        if (part.id) existing.id = part.id;
        if (part.type) existing.type = part.type;
        if (part.function?.name) {
          existing.function.name += part.function.name;
        }
        if (part.function?.arguments) {
          existing.function.arguments += part.function.arguments;
        }
        toolCallsByIndex.set(part.index, existing);
      }
    }
    if (choice.finish_reason) finishReason = choice.finish_reason;
    return false;
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n");
    buffer = parts.pop() ?? "";
    for (const p of parts) {
      const stop = processLine(p);
      if (stop) {
        try {
          await reader.cancel();
        } catch {
          /* ignore */
        }
        break;
      }
    }
  }
  if (buffer.length > 0) {
    processLine(buffer);
  }

  const toolCalls: ToolCall[] = [];
  const sortedIdx = Array.from(toolCallsByIndex.keys()).sort((a, b) => a - b);
  for (const idx of sortedIdx) {
    const tc = toolCallsByIndex.get(idx);
    if (!tc?.id || !tc.function.name) continue;
    toolCalls.push({
      id: tc.id,
      type: "function",
      function: {
        name: tc.function.name,
        arguments: tc.function.arguments,
      },
    });
  }

  return {
    message: {
      role: role ?? "assistant",
      content: content.length > 0 ? content : null,
      tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
    },
    finishReason,
  };
}

export async function openRouterEmbeddings(params: {
  config: OpenRouterConfig;
  inputs: string[];
}): Promise<number[][]> {
  const { config, inputs } = params;
  if (inputs.length === 0) return [];

  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
  };
  if (config.siteUrl) {
    headers["HTTP-Referer"] = config.siteUrl;
  }
  if (config.appTitle) {
    headers["X-Title"] = config.appTitle;
  }

  const res = await fetch(`${OPENROUTER_BASE}/embeddings`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: config.embeddingModel,
      input: inputs,
    }),
  });

  const raw = (await res.json()) as {
    error?: { message?: string };
    data?: Array<{ embedding: number[]; index: number }>;
  };

  if (!res.ok) {
    const msg =
      raw.error?.message ?? `OpenRouter embeddings error (${res.status})`;
    throw new Error(msg);
  }

  const data = raw.data;
  if (!data?.length) {
    throw new Error("OpenRouter returned no embeddings");
  }

  const sorted = [...data].sort((a, b) => a.index - b.index);
  return sorted.map((d) => d.embedding);
}
