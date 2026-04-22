export type AuthEnvConfig = {
  secret: string;
  allowedEmails: Set<string>;
  resendApiKey: string;
  resendFrom: string;
};

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Loose check so typos like "not-an-email" do not expand the allowlist. */
function looksLikeEmail(local: string): boolean {
  if (local.length < 3 || local.length > 254) return false;
  if (!local.includes("@")) return false;
  const [user, domain] = local.split("@", 2);
  if (!user || !domain || user.length > 64) return false;
  if (!domain.includes(".") && domain !== "localhost") return false;
  if (domain.startsWith(".") || domain.endsWith(".")) return false;
  return true;
}

/**
 * Optional hard cap on how many distinct addresses are kept (first wins, stable order).
 * Unset = no cap. Set e.g. `AUTH_ALLOWLIST_MAX=4` to only trust the first four entries.
 */
function allowlistMaxCount(): number | undefined {
  const raw = process.env.AUTH_ALLOWLIST_MAX?.trim();
  if (!raw) return undefined;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return undefined;
  return Math.min(n, 10_000);
}

/**
 * Parse allowlisted sign-in emails. Supports comma, newline, or semicolon between addresses
 * (handy for `.env` and hosted env multiline values). Dedupes case-insensitively.
 */
export function parseAllowedEmails(raw: string | undefined): Set<string> {
  const out = new Set<string>();
  if (!raw) return out;
  const parts = raw.split(/[,;\n\r]+/);
  const max = allowlistMaxCount();
  for (const part of parts) {
    if (max !== undefined && out.size >= max) break;
    const e = normalizeEmail(part);
    if (!looksLikeEmail(e)) continue;
    out.add(e);
  }
  return out;
}

export function getSessionSecret(): string | null {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret || secret.length < 16) return null;
  return secret;
}

export function getAuthEnvConfig(): AuthEnvConfig | null {
  const secret = getSessionSecret();
  const allowed = parseAllowedEmails(process.env.AUTH_ALLOWED_EMAILS);
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const resendFrom =
    process.env.RESEND_FROM?.trim() ||
    process.env.AUTH_RESEND_FROM?.trim() ||
    "";

  if (!secret) return null;
  if (allowed.size === 0) return null;
  if (!resendApiKey) return null;
  if (!resendFrom) return null;

  return { secret, allowedEmails: allowed, resendApiKey, resendFrom };
}

/**
 * - `none`: no gate (open deployment)
 * - `email`: OTP sign-in for allowlisted emails (requires Resend + allowlist)
 * - `username`: shared secret present but email auth not fully configured — sign-in with username only
 */
export function getAuthGateMode(): "none" | "email" | "username" {
  if (getAuthEnvConfig()) return "email";
  if (getSessionSecret()) return "username";
  return "none";
}

/** Human-readable reasons email OTP auth is disabled. For local debugging only. */
export function getAuthSetupIssues(): string[] {
  const issues: string[] = [];
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) issues.push("AUTH_SECRET is missing or empty");
  else if (secret.length < 16) issues.push("AUTH_SECRET must be at least 16 characters");
  if (parseAllowedEmails(process.env.AUTH_ALLOWED_EMAILS).size === 0) {
    issues.push(
      "AUTH_ALLOWED_EMAILS is missing or has no valid addresses (comma, semicolon, or newline between each)",
    );
  }
  if (!process.env.RESEND_API_KEY?.trim()) issues.push("RESEND_API_KEY is missing or empty");
  const from = process.env.RESEND_FROM?.trim() || process.env.AUTH_RESEND_FROM?.trim();
  if (!from) issues.push("RESEND_FROM (or AUTH_RESEND_FROM) is missing or empty");
  return issues;
}

/** Explains how sign-in will work when the gate is active. */
export function getAuthGateSetupHints(): string[] {
  const mode = getAuthGateMode();
  if (mode === "email") {
    return [
      "Allowlisted emails sign in with OTP; other users register on /login, get approved on /team, then sign in with a member access key.",
    ];
  }
  if (mode === "username") {
    return [
      "Username-only sign-in is enabled (AUTH_SECRET set, email OTP not fully configured).",
      "Users pick a unique username; the first account becomes admin.",
      "Optional: AUTH_USERNAME_LOCKED and AUTH_USERNAME_ADMIN_ONLY (comma-separated names).",
    ];
  }
  return [
    "Open mode: set AUTH_SECRET (16+ chars) for username sign-in, or add AUTH_ALLOWED_EMAILS + Resend for email OTP.",
  ];
}

export function isAllowedEmail(config: AuthEnvConfig, email: string): boolean {
  return config.allowedEmails.has(normalizeEmail(email));
}

export function normalizeAuthEmail(email: string): string {
  return normalizeEmail(email);
}
