import fs from "node:fs/promises";
import path from "node:path";
import { ragDir } from "@/lib/projects";

export type PersistedChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const CHAT_FILE = "chat-history.json";
const MAX_MESSAGES = 200;

function historyPath(slug: string): string {
  return path.join(ragDir(slug), CHAT_FILE);
}

export async function loadAiChatHistory(
  slug: string,
): Promise<PersistedChatMessage[]> {
  try {
    const raw = await fs.readFile(historyPath(slug), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: PersistedChatMessage[] = [];
    for (const m of parsed) {
      if (typeof m !== "object" || m === null) continue;
      const role = (m as { role?: unknown }).role;
      const content = (m as { content?: unknown }).content;
      if (
        (role === "user" || role === "assistant") &&
        typeof content === "string" &&
        content.length > 0
      ) {
        out.push({ role, content });
      }
    }
    return out.slice(-MAX_MESSAGES);
  } catch {
    return [];
  }
}

export async function saveAiChatHistory(
  slug: string,
  messages: PersistedChatMessage[],
): Promise<void> {
  const dir = ragDir(slug);
  await fs.mkdir(dir, { recursive: true });
  const trimmed = messages.slice(-MAX_MESSAGES);
  const file = historyPath(slug);
  const tmp = `${file}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(trimmed, null, 0), "utf8");
  await fs.rename(tmp, file);
}

/** Remove persisted chat for a project (no-op if file missing). */
export async function clearAiChatHistory(slug: string): Promise<void> {
  try {
    await fs.unlink(historyPath(slug));
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw e;
  }
}
