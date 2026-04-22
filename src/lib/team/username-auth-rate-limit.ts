const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 48;
const hits = new Map<string, number[]>();

/** When unset or `0`, username / backup / admin-access login attempts are not rate limited. */
export function isUsernameAuthRateLimitEnabled(): boolean {
  const raw = process.env.AUTH_USERNAME_RATE_LIMIT?.trim();
  if (!raw) return false;
  if (raw === "0" || raw.toLowerCase() === "false" || raw.toLowerCase() === "off") {
    return false;
  }
  return true;
}

function prune(key: string, now: number): number[] {
  return (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
}

export function rateLimitUsernameAuth(
  key: string,
): { ok: true } | { ok: false; retryAfterSec: number } {
  if (!isUsernameAuthRateLimitEnabled()) {
    return { ok: true };
  }
  const now = Date.now();
  const arr = prune(key, now);
  if (arr.length >= MAX_PER_WINDOW) {
    const oldest = arr[0]!;
    return { ok: false, retryAfterSec: Math.ceil((WINDOW_MS - (now - oldest)) / 1000) };
  }
  arr.push(now);
  hits.set(key, arr);
  return { ok: true };
}

export function clientIpFromRequest(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "local";
}
