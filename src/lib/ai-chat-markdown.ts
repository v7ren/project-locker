import DOMPurify from "dompurify";
import { marked } from "marked";
import { wrapMarkdownTables } from "@/lib/markdown-html";

/**
 * Turn `==highlighted phrase==` into `<mark>` (outside fenced ``` blocks only).
 * Matches Obsidian-style highlights; model can use this to draw attention.
 */
export function applyChatHighlights(markdown: string): string {
  const parts = markdown.split(/(```[\s\S]*?```)/g);
  return parts
    .map((part) => {
      if (part.startsWith("```")) return part;
      return part.replace(
        /==([^=\n]+)==/g,
        '<mark class="ai-chat-highlight">$1</mark>',
      );
    })
    .join("");
}

/** Sanitized HTML for in-app AI chat (client-only: requires window/DOMPurify). */
export function renderAiChatMarkdownToHtml(markdown: string): string {
  if (typeof window === "undefined") return "";
  const withHighlights = applyChatHighlights(markdown);
  const raw = marked.parse(withHighlights, { async: false }) as string;
  return DOMPurify.sanitize(wrapMarkdownTables(raw), {
    USE_PROFILES: { html: true },
    ADD_TAGS: ["mark"],
    ADD_ATTR: ["class"],
  });
}
