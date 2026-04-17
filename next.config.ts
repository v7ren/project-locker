import type { NextConfig } from "next";

/**
 * Hostnames allowed to load Next dev assets (`/_next/*`, etc.) cross-origin.
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
 *
 * Env:
 * - `NEXT_ALLOWED_DEV_ORIGINS` — comma-separated hosts or full URLs (e.g. `v7ren.xyz` or `https://v7ren.xyz,https://3001.v7ren.xyz`).
 * - If unset, hostnames are also taken from `DOMAIN` when it looks like a URL (same as CORS `DOMAIN`).
 */
function parseAllowedDevOrigins(): string[] | undefined {
  const out = new Set<string>();

  const pushHost = (raw: string) => {
    const t = raw.trim();
    if (!t) return;
    try {
      if (t.includes("://")) {
        out.add(new URL(t).hostname.toLowerCase());
        return;
      }
      const host = t.split("/")[0]?.replace(/:\d+$/, "")?.toLowerCase();
      if (host && host.length > 0) out.add(host);
    } catch {
      /* ignore invalid URL */
    }
  };

  const list = process.env.NEXT_ALLOWED_DEV_ORIGINS?.trim();
  if (list) {
    for (const part of list.split(",")) {
      pushHost(part);
    }
  }

  const domain = process.env.DOMAIN?.trim();
  if (domain) {
    pushHost(domain);
  }

  if (out.size === 0) return undefined;
  return [...out];
}

const allowedDevOrigins = parseAllowedDevOrigins();

const nextConfig: NextConfig = {
  ...(allowedDevOrigins ? { allowedDevOrigins } : {}),
  transpilePackages: ["react-live", "sucrase", "prism-react-renderer", "use-editable"],
};

export default nextConfig;
