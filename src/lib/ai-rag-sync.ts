import { getOpenRouterConfig } from "@/lib/openrouter";
import { syncRagIndexForPaths } from "@/lib/project-rag";

const DEBOUNCE_MS = 2500;
const timers = new Map<string, ReturnType<typeof setTimeout>>();
const pendingPaths = new Map<string, Set<string>>();

/**
 * Debounced incremental RAG sync after docs/home writes (no OpenRouter key → no-op).
 * Merges paths for the same project slug within one debounce window.
 */
export function scheduleProjectRagSync(slug: string, paths: string[]): void {
  const config = getOpenRouterConfig();
  if (!config || paths.length === 0) return;

  let set = pendingPaths.get(slug);
  if (!set) {
    set = new Set();
    pendingPaths.set(slug, set);
  }
  for (const p of paths) {
    set.add(p.replace(/\\/g, "/"));
  }

  const prev = timers.get(slug);
  if (prev) clearTimeout(prev);

  timers.set(
    slug,
    setTimeout(() => {
      timers.delete(slug);
      const merged = [...(pendingPaths.get(slug) ?? [])];
      pendingPaths.delete(slug);
      if (merged.length === 0) return;
      void syncRagIndexForPaths(slug, config, merged).catch((e) => {
        console.error("[scheduleProjectRagSync]", slug, e);
      });
    }, DEBOUNCE_MS),
  );
}
