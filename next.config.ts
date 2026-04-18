import type { NextConfig } from "next";

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
