"use client";

import type { AiToolStep } from "@/lib/ai-tool-step";
import type {
  AgentStreamLine,
  AgentStreamProgress,
} from "@/lib/ai-chat-stream-events";
import type { MessageKey } from "@/lib/i18n/messages";
import { describeViewerLocation } from "@/lib/viewer-location";
import { Copy, MessageSquare, MessageSquarePlus, Send, Square } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { AiChatMarkdownBody } from "@/components/ai-chat-markdown-body";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RippleButton } from "@/components/ui/ripple-button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n/locale-provider";

type ChatMsg = {
  role: "user" | "assistant";
  content: string;
  steps?: AiToolStep[];
};

function agentProgressLabel(
  t: (key: MessageKey, vars?: Record<string, string | number>) => string,
  p: AgentStreamProgress,
): string {
  if (p.kind === "model") return t("dash.aiPhaseThinking");
  switch (p.tool) {
    case "read_document":
      return t("dash.aiPhaseReadingFile", { path: p.path || "…" });
    case "read_home_page":
      return t("dash.aiPhaseReadingHome", { file: p.file || "…" });
    case "list_documents":
      return t("dash.aiPhaseListingDocs");
    case "list_home_page":
      return t("dash.aiPhaseListingHome");
    case "write_document":
      return t("dash.aiPhaseWritingFile", { path: p.path || "…" });
    case "delete_document":
      return t("dash.aiPhaseDeletingFile", { path: p.path || "…" });
    case "rename_document":
      return t("dash.aiPhaseRenamingFile", {
        from: p.fromPath || "…",
        to: p.toPath || "…",
      });
    case "search_documents":
      return t("dash.aiPhaseSearching");
    case "grep_docs":
      return t("dash.aiPhaseGrepping");
    case "write_home_page":
      return t("dash.aiPhaseWritingHome", { file: p.file || "…" });
    default:
      return t("dash.aiPhaseTool", { tool: p.tool });
  }
}

async function consumeAiChatNdjson(
  res: Response,
  handlers: {
    onProgress: (payload: AgentStreamProgress) => void;
    onDelta: (text: string) => void;
    onDone: (reply: string, steps: AiToolStep[]) => void;
    onError: (message: string) => void;
  },
  invalidLineMessage: string,
): Promise<void> {
  const reader = res.body?.getReader();
  if (!reader) {
    handlers.onError("No response body");
    return;
  }
  const decoder = new TextDecoder();
  let buf = "";
  const dispatch = (raw: string) => {
    const line = raw.trim();
    if (!line) return;
    try {
      const obj = JSON.parse(line) as AgentStreamLine;
      if (obj.type === "progress") handlers.onProgress(obj.payload);
      else if (obj.type === "delta") handlers.onDelta(obj.text);
      else if (obj.type === "done") handlers.onDone(obj.reply, obj.steps);
      else if (obj.type === "error") handlers.onError(obj.message);
    } catch {
      handlers.onError(invalidLineMessage);
    }
  };
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const part of lines) {
      dispatch(part);
    }
  }
  dispatch(buf);
}

function ProjectAiChatInner({
  slug,
  embed = false,
  viewerLocation,
}: {
  slug: string;
  embed?: boolean;
  viewerLocation: string;
}) {
  const { t } = useTranslations();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [indexStatus, setIndexStatus] = useState<{
    indexed: boolean;
    chunkCount: number;
    updatedAt: string | null;
  } | null>(null);
  const [indexing, setIndexing] = useState(false);
  /** Live status line (thinking / reading file / …) while waiting for the stream. */
  const [activityLabel, setActivityLabel] = useState<string | null>(null);
  /** Streamed assistant text as deltas arrive; flushed to messages on `done`. */
  const [streamingReply, setStreamingReply] = useState<string>("");
  /** Latest streaming text (for `onDone` fallback when server only sent deltas, not final reply). */
  const streamingReplyRef = useRef<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  /** In-flight GET /ai/chat must be aborted before local sends, or it can overwrite state and drop user messages. */
  const historyLoadAbortRef = useRef<AbortController | null>(null);
  /** True while a POST/stream is in flight; GET history must not replace `messages` during this window. */
  const pendingResponseRef = useRef(false);
  /** Always latest `messages` for send payload (avoids stale closure during long tool runs). */
  const messagesRef = useRef<ChatMsg[]>(messages);
  useLayoutEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const loadIndex = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(slug)}/ai/index`);
      const data = (await res.json()) as {
        indexed?: boolean;
        chunkCount?: number;
        updatedAt?: string | null;
        error?: string;
      };
      if (!res.ok) {
        setIndexStatus(null);
        return;
      }
      setIndexStatus({
        indexed: Boolean(data.indexed),
        chunkCount: data.chunkCount ?? 0,
        updatedAt: data.updatedAt ?? null,
      });
    } catch {
      setIndexStatus(null);
    }
  }, [slug]);

  const loadChatHistory = useCallback(async () => {
    historyLoadAbortRef.current?.abort();
    const ac = new AbortController();
    historyLoadAbortRef.current = ac;
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(slug)}/ai/chat`, {
        signal: ac.signal,
      });
      if (ac.signal.aborted) return;
      const data = (await res.json()) as {
        messages?: { role?: string; content?: string }[];
      };
      if (!res.ok) return;
      if (ac.signal.aborted) return;
      const raw = data.messages ?? [];
      const parsed: ChatMsg[] = [];
      for (const m of raw) {
        if (
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string"
        ) {
          parsed.push({ role: m.role, content: m.content });
        }
      }
      if (ac.signal.aborted) return;
      setMessages((prev) => {
        if (pendingResponseRef.current) return prev;
        return parsed;
      });
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
    }
  }, [slug]);

  useEffect(() => {
    void loadIndex();
  }, [loadIndex]);

  useEffect(() => {
    void loadChatHistory();
    return () => {
      historyLoadAbortRef.current?.abort();
    };
  }, [loadChatHistory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending, activityLabel, streamingReply]);

  async function onRebuildIndex() {
    setIndexing(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(slug)}/ai/index`, {
        method: "POST",
      });
      const data = (await res.json()) as { ok?: boolean; chunkCount?: number; error?: string };
      if (!res.ok) {
        setError(data.error ?? t("dash.aiIndexFailed"));
        return;
      }
      await loadIndex();
    } finally {
      setIndexing(false);
    }
  }

  async function onNewChat() {
    if (sending) {
      abortRef.current?.abort();
    }
    historyLoadAbortRef.current?.abort();
    setError(null);
    setMessages([]);
    setActivityLabel(null);
    setStreamingReply("");
    streamingReplyRef.current = "";
    setInput("");
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(slug)}/ai/chat`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? t("dash.aiNewChatFailed"));
      }
    } catch {
      setError(t("dash.aiNewChatFailed"));
    }
  }

  function stopSending() {
    abortRef.current?.abort();
  }

  async function onSend() {
    const text = input.trim();
    if (!text || sending) return;
    pendingResponseRef.current = true;
    historyLoadAbortRef.current?.abort();
    setInput("");
    setError(null);

    const messagesForApi: ChatMsg[] = [
      ...messagesRef.current,
      { role: "user", content: text },
    ];
    setMessages(messagesForApi);
    setStreamingReply("");
    streamingReplyRef.current = "";

    setSending(true);
    setActivityLabel(t("dash.aiPhaseThinking"));
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(slug)}/ai/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: messagesForApi, viewerLocation }),
        signal: ac.signal,
      });
      if (res.status === 429) {
        const data = (await res.json()) as { retryAfterSec?: number };
        const sec = data.retryAfterSec ?? Number.parseInt(res.headers.get("Retry-After") ?? "60", 10);
        const n = Number.isFinite(sec) ? sec : 60;
        setError(t("dash.aiRateLimited", { sec: String(n) }));
        return;
      }
      if (!res.ok) {
        let msg = t("dash.aiError");
        try {
          const data = (await res.json()) as { error?: string };
          if (data.error) msg = data.error;
        } catch {
          /* keep default */
        }
        setError(msg);
        return;
      }
      await consumeAiChatNdjson(
        res,
        {
          onProgress: (payload) => {
            setActivityLabel(agentProgressLabel(t, payload));
          },
          onDelta: (chunk) => {
            streamingReplyRef.current += chunk;
            setStreamingReply(streamingReplyRef.current);
            setActivityLabel(null);
          },
          onDone: (reply, steps) => {
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (
                last?.role === "assistant" &&
                last.content === reply &&
                JSON.stringify(last.steps ?? null) === JSON.stringify(steps ?? null)
              ) {
                return prev;
              }
              return [...prev, { role: "assistant", content: reply, steps }];
            });
            setStreamingReply("");
            streamingReplyRef.current = "";
          },
          onError: (message) => {
            if (message === "Aborted") return;
            setError(message || t("dash.aiError"));
          },
        },
        t("dash.aiError"),
      );
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        return;
      }
      setError(t("dash.aiError"));
    } finally {
      pendingResponseRef.current = false;
      if (abortRef.current === ac) {
        abortRef.current = null;
      }
      setActivityLabel(null);
      setSending(false);
      setStreamingReply("");
      streamingReplyRef.current = "";
    }
  }

  const scrollH = embed
    ? "h-[min(280px,calc(100dvh-13rem))]"
    : "h-[min(400px,calc(100dvh-14rem))]";

  return (
    <div
      className={cn(
        "flex flex-col",
        embed ? "min-h-0 flex-1 gap-3" : "min-h-[420px] gap-4",
      )}
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <p className="min-w-0 flex-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          {indexStatus ? (
            indexStatus.indexed ? (
              <>
                {t("dash.aiIndexStatus", {
                  count: String(indexStatus.chunkCount),
                  time: indexStatus.updatedAt
                    ? new Date(indexStatus.updatedAt).toLocaleString()
                    : "—",
                })}
              </>
            ) : (
              t("dash.aiIndexEmpty")
            )
          ) : (
            t("dash.aiIndexLoading")
          )}
        </p>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void onNewChat()}
            className="shrink-0 gap-1.5"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden />
            {t("dash.aiNewChat")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={indexing}
            onClick={() => void onRebuildIndex()}
            className="shrink-0"
          >
            {indexing ? t("dash.aiIndexing") : t("dash.aiRebuildIndex")}
          </Button>
        </div>
      </div>

      {embed ? null : (
        <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{t("dash.aiHint")}</p>
      )}

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden border-zinc-200/90 shadow-none dark:border-zinc-800",
          embed ? "min-h-[200px]" : "min-h-[260px]",
        )}
      >
        <CardContent className="flex min-h-0 flex-1 flex-col p-0">
          <ScrollArea className={cn("pm-ai-scroll w-full flex-1", scrollH)}>
            <div className="min-w-0 w-full space-y-3 px-4 py-4">
              {messages.length === 0 && !sending ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
                    <MessageSquare className="h-5 w-5" aria-hidden />
                  </div>
                  <p className="max-w-[18rem] text-sm text-zinc-500 dark:text-zinc-400">
                    {t("dash.aiEmpty")}
                  </p>
                </div>
              ) : null}

              {messages.map((m, i) => (
                <div
                  key={`msg-${i}`}
                  className={cn(
                    "flex w-full min-w-0 flex-col gap-1",
                    m.role === "user" ? "items-end" : "items-start",
                  )}
                >
                  <div
                    className={cn(
                      "flex min-w-0 items-center gap-1.5",
                      m.role === "user"
                        ? "w-fit max-w-[min(100%,42rem)] justify-end self-end"
                        : "w-full max-w-[min(100%,18rem)] justify-start sm:max-w-[min(100%,21rem)]",
                    )}
                  >
                    <span
                      className={cn(
                        "select-none text-[11px] font-medium tracking-wide text-zinc-500 dark:text-zinc-400",
                        m.role === "user" ? "text-end" : "text-start",
                      )}
                    >
                      {m.role === "user" ? t("dash.aiRoleUser") : t("dash.aiRoleAssistant")}
                    </span>
                    {m.role === "user" ? (
                      <RippleButton
                        rippleColor="rgb(113 113 122 / 0.4)"
                        duration="500ms"
                        className="inline-flex h-7 w-7 shrink-0 rounded-md border-0 bg-transparent p-0 text-zinc-500 hover:bg-zinc-200/80 hover:text-zinc-800 dark:hover:bg-zinc-700/80 dark:hover:text-zinc-100"
                        aria-label={t("dash.aiCopyYourMessage")}
                        title={t("dash.aiCopyYourMessage")}
                        onClick={() => {
                          void navigator.clipboard.writeText(m.content).catch(() => {
                            /* ignore */
                          });
                        }}
                      >
                        <Copy className="h-3.5 w-3.5" aria-hidden />
                      </RippleButton>
                    ) : null}
                  </div>
                  <div
                    className={cn(
                      "min-w-0 overflow-hidden rounded-md border px-3 py-2.5",
                      m.role === "user"
                        ? "w-fit max-w-[min(100%,42rem)] self-end border-zinc-300 bg-zinc-100 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                        : "w-full max-w-[min(100%,18rem)] sm:max-w-[min(100%,21rem)] border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-950",
                    )}
                  >
                    <AiChatMarkdownBody
                      content={m.content}
                      variant={m.role === "user" ? "user" : "assistant"}
                    />
                    {m.role === "assistant" && m.steps && m.steps.length > 0 ? (
                      <details className="mt-2 border-t border-zinc-200 pt-2 dark:border-zinc-700">
                        <summary className="cursor-pointer list-none text-left text-xs font-medium text-zinc-600 marker:hidden dark:text-zinc-400 [&::-webkit-details-marker]:hidden">
                          {t("dash.aiToolTrace")}
                          <span className="ml-1 text-zinc-400">({m.steps.length})</span>
                        </summary>
                        <ul className="mt-2 space-y-1.5 pl-0 text-xs text-zinc-600 dark:text-zinc-400">
                          {m.steps.map((s, j) => (
                            <li
                              key={`${i}-step-${j}-${s.name}`}
                              className="wrap-break-word border-l-2 border-zinc-200 pl-2 dark:border-zinc-700"
                            >
                              <span className={s.ok ? "text-zinc-700 dark:text-zinc-300" : "text-red-600 dark:text-red-400"}>
                                {s.name}
                              </span>
                              <span className="text-zinc-400"> · </span>
                              <span className="text-zinc-500 dark:text-zinc-500">{s.summary}</span>
                            </li>
                          ))}
                        </ul>
                      </details>
                    ) : null}
                  </div>
                </div>
              ))}

              {sending && streamingReply.length > 0 ? (
                <div className="flex w-full min-w-0 flex-col items-start gap-1">
                  <div className="flex min-w-0 w-full max-w-[min(100%,18rem)] items-center gap-1.5 justify-start sm:max-w-[min(100%,21rem)]">
                    <span className="select-none text-[11px] font-medium tracking-wide text-zinc-500 dark:text-zinc-400">
                      {t("dash.aiRoleAssistant")}
                    </span>
                  </div>
                  <div
                    className="min-w-0 w-full max-w-[min(100%,18rem)] overflow-hidden sm:max-w-[min(100%,21rem)] rounded-md border border-zinc-200 bg-white px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-950"
                    aria-busy
                    aria-live="polite"
                  >
                    <AiChatMarkdownBody content={streamingReply} variant="assistant" />
                  </div>
                </div>
              ) : null}

              {sending && streamingReply.length === 0 ? (
                <div className="flex justify-start">
                  <div
                    className="flex w-full min-w-0 max-w-[min(100%,18rem)] items-center gap-2.5 rounded-md border border-zinc-200 bg-white px-3 py-3 text-sm sm:max-w-[min(100%,21rem)] dark:border-zinc-700 dark:bg-zinc-950"
                    aria-busy
                    aria-label={activityLabel ?? t("dash.aiThinking")}
                  >
                    <span className="flex shrink-0 items-center gap-1 text-zinc-400">
                      <span className="pm-ai-typing-dot h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                      <span className="pm-ai-typing-dot h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                      <span className="pm-ai-typing-dot h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                    </span>
                    <span className="min-w-0 flex-1 wrap-break-word leading-snug text-zinc-600 dark:text-zinc-300">
                      {activityLabel ?? t("dash.aiThinking")}
                    </span>
                  </div>
                </div>
              ) : null}
              <div ref={bottomRef} className="h-px shrink-0" />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="flex shrink-0 items-end gap-2 rounded-lg border border-zinc-200 bg-zinc-50/50 p-1.5 dark:border-zinc-800 dark:bg-zinc-950/50">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void onSend();
            }
          }}
          placeholder={t("dash.aiPlaceholder")}
          rows={embed ? 2 : 3}
          className="min-h-[44px] max-h-[200px] flex-1 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
        {sending ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={stopSending}
            aria-label={t("dash.aiStop")}
            className="shrink-0"
          >
            <Square className="h-4 w-4 fill-current" aria-hidden />
          </Button>
        ) : null}
        <Button
          type="button"
          size="icon"
          disabled={sending || !input.trim()}
          onClick={() => void onSend()}
          aria-label={t("dash.aiSend")}
          className="shrink-0"
        >
          <Send className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}

function ProjectAiChatSuspenseFallback({ embed }: { embed?: boolean }) {
  const { t } = useTranslations();
  const scrollH = embed
    ? "h-[min(280px,calc(100dvh-13rem))]"
    : "h-[min(400px,calc(100dvh-14rem))]";
  return (
    <div
      className={cn(
        "flex flex-col",
        embed ? "min-h-0 flex-1 gap-3" : "min-h-[420px] gap-4",
      )}
      aria-busy
      aria-label={t("publicShare.loading")}
    >
      <div className="h-4 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <Card
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden border-zinc-200/90 shadow-none dark:border-zinc-800",
          embed ? "min-h-[200px]" : "min-h-[260px]",
        )}
      >
        <CardContent className="flex min-h-0 flex-1 flex-col items-center justify-center p-6">
          <div className={cn("w-full", scrollH)}>
            <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
              <span className="flex shrink-0 items-center gap-1 text-zinc-400">
                <span className="pm-ai-typing-dot h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                <span className="pm-ai-typing-dot h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                <span className="pm-ai-typing-dot h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
              </span>
              {t("publicShare.loading")}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="h-12 shrink-0 rounded-lg border border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-950/50" />
    </div>
  );
}

function ProjectAiChatWithSearch({
  slug,
  embed,
  pathname,
}: {
  slug: string;
  embed?: boolean;
  pathname: string;
}) {
  const searchParams = useSearchParams();
  const loc = describeViewerLocation(slug, pathname, searchParams);
  return <ProjectAiChatInner slug={slug} embed={embed} viewerLocation={loc} />;
}

export function ProjectAiChat({
  slug,
  embed = false,
}: {
  slug: string;
  embed?: boolean;
}) {
  const pathname = usePathname() ?? "/";
  return (
    <Suspense fallback={<ProjectAiChatSuspenseFallback embed={embed} />}>
      <ProjectAiChatWithSearch slug={slug} embed={embed} pathname={pathname} />
    </Suspense>
  );
}
