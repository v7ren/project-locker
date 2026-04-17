const SEND_COOLDOWN_MS = 60_000;
const SEND_WINDOW_MS = 60 * 60 * 1000;
const MAX_SENDS_PER_WINDOW = 8;

const sendTimestamps = new Map<string, number[]>();

export function rateLimitSendOtp(email: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const prev = sendTimestamps.get(email) ?? [];
  const windowed = prev.filter((t) => now - t < SEND_WINDOW_MS);
  const last = windowed[windowed.length - 1];
  if (last !== undefined && now - last < SEND_COOLDOWN_MS) {
    return { ok: false, retryAfterSec: Math.ceil((SEND_COOLDOWN_MS - (now - last)) / 1000) };
  }
  if (windowed.length >= MAX_SENDS_PER_WINDOW) {
    const oldest = windowed[0]!;
    return { ok: false, retryAfterSec: Math.ceil((SEND_WINDOW_MS - (now - oldest)) / 1000) };
  }
  windowed.push(now);
  sendTimestamps.set(email, windowed);
  return { ok: true };
}

const VERIFY_MAX = 10;
const verifyCounts = new Map<string, { n: number; exp: number }>();

export function verifyAttemptKey(email: string, saltB64: string): string {
  return `${email}\n${saltB64}`;
}

export function bumpVerifyFailure(key: string, expMs: number): number {
  const now = Date.now();
  const cur = verifyCounts.get(key);
  if (!cur || cur.exp < now) {
    verifyCounts.set(key, { n: 1, exp: expMs });
    return 1;
  }
  cur.n += 1;
  return cur.n;
}

export function clearVerifyAttempts(key: string): void {
  verifyCounts.delete(key);
}

export function isVerifyLocked(key: string, expMs: number): boolean {
  const cur = verifyCounts.get(key);
  if (!cur) return false;
  if (Date.now() > expMs) return false;
  return cur.n >= VERIFY_MAX;
}
