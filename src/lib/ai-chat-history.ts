import fs from "node:fs/promises";
import path from "node:path";
import { ragDir } from "@/lib/projects";

export type PersistedChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const LEGACY_CHAT_FILE = "chat-history.json";
const USER_CHAT_SUBDIR = "ai-chat-by-user";
const MAX_MESSAGES = 200;

function isUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id,
  );
}

/** Shared file when auth is off (`userId` null); otherwise one JSON file per team user id. */
function historyPath(slug: string, userId: string | null): string {
  const base = ragDir(slug);
  if (!userId) {
    return path.join(base, LEGACY_CHAT_FILE);
  }
  if (!isUuid(userId)) {
    throw new Error("Invalid chat user id");
  }
  return path.join(base, USER_CHAT_SUBDIR, `${userId}.json`);
}

export type AiChatHistoryScope = {
  /** When null, uses the legacy project-wide file (auth gate `none`). */
  userId: string | null;
};

export async function loadAiChatHistory(
  slug: string,
  scope: AiChatHistoryScope = { userId: null },
): Promise<PersistedChatMessage[]> {
  try {
    const raw = await fs.readFile(historyPath(slug, scope.userId), "utf8");
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
  scope: AiChatHistoryScope = { userId: null },
): Promise<void> {
  const dir = ragDir(slug);
  await fs.mkdir(dir, { recursive: true });
  const file = historyPath(slug, scope.userId);
  await fs.mkdir(path.dirname(file), { recursive: true });
  const trimmed = messages.slice(-MAX_MESSAGES);
  const tmp = `${file}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(trimmed, null, 0), "utf8");
  await fs.rename(tmp, file);
}

/** Remove persisted chat for a project (no-op if file missing). */
export async function clearAiChatHistory(
  slug: string,
  scope: AiChatHistoryScope = { userId: null },
): Promise<void> {
  try {
    await fs.unlink(historyPath(slug, scope.userId));
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw e;
  }
}
