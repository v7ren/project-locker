"use client";

import { useEffect, useState } from "react";
import { renderAiChatMarkdownToHtml } from "@/lib/ai-chat-markdown";
import { cn } from "@/lib/utils";

export function AiChatMarkdownBody({
  content,
  variant = "assistant",
  className,
}: {
  content: string;
  variant?: "assistant" | "user";
  className?: string;
}) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    setHtml(renderAiChatMarkdownToHtml(content));
  }, [content]);

  return (
    <div
      className={cn(
        "ai-chat-md max-w-full min-w-0 text-left",
        variant === "user" && "ai-chat-md--user inline-block w-max max-w-full",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
      suppressHydrationWarning
    />
  );
}
