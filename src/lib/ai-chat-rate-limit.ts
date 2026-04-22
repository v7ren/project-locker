const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 48;

const buckets = new Map<string, number[]>();

function prune(now: number, ts: number[]): number[] {
  return ts.filter((t) => now - t < WINDOW_MS);
}

/**
 * Per (slug + client key) sliding window. Returns ok or retry-after seconds.
 */
export function checkAiChatRateLimit(
  slug: string,
  clientKey: string,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const key = `${slug}\n${clientKey}`;
  const now = Date.now();
  const prev = buckets.get(key) ?? [];
  const windowed = prune(now, prev);
  if (windowed.length >= MAX_REQUESTS) {
    const oldest = windowed[0]!;
    return {
      ok: false,
      retryAfterSec: Math.ceil((WINDOW_MS - (now - oldest)) / 1000),
    };
  }
  windowed.push(now);
  buckets.set(key, windowed);
  return { ok: true };
}

export function clientKeyFromRequest(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) {
    return fwd.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
