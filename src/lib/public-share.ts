import fs from "node:fs/promises";
import path from "node:path";
import { normalizeShareKey, publicPathForShareKey } from "@/lib/public-share-urls";
import {
  docsDir,
  getDataRoot,
  isDocFile,
  isSafeRelativeSegments,
  readDocFile,
  resolveDocFilePath,
} from "@/lib/projects";

const MANIFEST = "public-share.json";

export type PublicShareManifest = {
  paths: string[];
};

function manifestPath(slug: string): string {
  return path.join(getDataRoot(), slug, MANIFEST);
}

/** Validates `home` | `md/...` | `doc/...` with safe segments. */
export function isValidShareKey(key: string): boolean {
  const k = normalizeShareKey(key);
  if (k === "home") return true;
  if (k.startsWith("md/")) {
    const rest = k.slice("md/".length);
    const seg = rest.split("/").filter(Boolean);
    return seg.length > 0 && isSafeRelativeSegments(seg);
  }
  if (k.startsWith("doc/")) {
    const rest = k.slice("doc/".length);
    const seg = rest.split("/").filter(Boolean);
    return seg.length > 0 && isSafeRelativeSegments(seg);
  }
  return false;
}

export async function readPublicShareManifest(slug: string): Promise<PublicShareManifest> {
  try {
    const raw = await fs.readFile(manifestPath(slug), "utf8");
    const parsed = JSON.parse(raw) as { paths?: unknown };
    if (!parsed || !Array.isArray(parsed.paths)) return { paths: [] };
    const paths = parsed.paths.filter((p): p is string => typeof p === "string").map(normalizeShareKey);
    return { paths: [...new Set(paths)].filter(isValidShareKey) };
  } catch {
    return { paths: [] };
  }
}

export async function writePublicShareManifest(slug: string, manifest: PublicShareManifest): Promise<void> {
  const dir = path.join(getDataRoot(), slug);
  await fs.mkdir(dir, { recursive: true });
  const clean = {
    paths: [...new Set(manifest.paths.map(normalizeShareKey))].filter(isValidShareKey).sort(),
  };
  await fs.writeFile(manifestPath(slug), JSON.stringify(clean, null, 2), "utf8");
}

/**
 * Map a share key to a stable manifest key: `home`, or `doc|md/` + docs-relative path as resolved on disk
 * (fixes NFC/NFD and spelling variants from `resolveDocFilePath`).
 */
async function resolveShareKeyToCanonical(slug: string, key: string): Promise<string | null> {
  const k = normalizeShareKey(key);
  if (k === "home") return "home";
  if (k.startsWith("doc/") || k.startsWith("md/")) {
    const prefix = k.startsWith("doc/") ? "doc" : "md";
    const rest = k.slice(prefix.length + 1);
    if (!rest) return null;
    const full = await resolveDocFilePath(slug, rest);
    if (!full) return null;
    const docsRoot = docsDir(slug);
    const rel = path.relative(docsRoot, full).split(path.sep).join("/");
    if (!rel || rel.startsWith("..")) return null;
    return `${prefix}/${rel}`;
  }
  return null;
}

export async function isPathPublic(slug: string, key: string): Promise<boolean> {
  const k = normalizeShareKey(key);
  if (!isValidShareKey(k)) return false;
  const want = await resolveShareKeyToCanonical(slug, k);
  if (want === null) return false;
  const { paths } = await readPublicShareManifest(slug);
  for (const p of paths) {
    const pc = await resolveShareKeyToCanonical(slug, p);
    if (pc === want) return true;
  }
  return false;
}

export async function canEnablePublicShare(slug: string, key: string): Promise<boolean> {
  const k = normalizeShareKey(key);
  if (!isValidShareKey(k)) return false;
  const canonical = await resolveShareKeyToCanonical(slug, k);
  if (canonical === null) return false;
  if (canonical === "home") {
    return true;
  }
  if (canonical.startsWith("md/")) {
    const rel = canonical.slice("md/".length);
    const content = await readDocFile(slug, rel);
    return content !== null;
  }
  if (canonical.startsWith("doc/")) {
    const rel = canonical.slice("doc/".length);
    return isDocFile(slug, rel);
  }
  return false;
}

/** Pathname (no origin) for a working public viewer URL, using the resolved on-disk doc path. */
export async function publicShareViewerPathForKey(slug: string, rawKey: string): Promise<string | null> {
  const k = normalizeShareKey(rawKey);
  if (!isValidShareKey(k)) return null;
  if (k === "home") return publicPathForShareKey(slug, "home");
  const canonical = await resolveShareKeyToCanonical(slug, k);
  if (canonical === null) return null;
  return publicPathForShareKey(slug, canonical);
}

export async function setPathPublic(slug: string, key: string, makePublic: boolean): Promise<void> {
  const k = normalizeShareKey(key);
  if (!isValidShareKey(k)) throw new Error("Invalid key");
  const canonical = await resolveShareKeyToCanonical(slug, k);
  if (makePublic) {
    if (canonical === null || !(await canEnablePublicShare(slug, k))) {
      throw new Error("Nothing to share at this path");
    }
  }
  const cur = await readPublicShareManifest(slug);
  const set = new Set(cur.paths);
  if (makePublic) {
    set.add(canonical!);
  } else if (canonical !== null) {
    for (const p of [...set]) {
      const pc = await resolveShareKeyToCanonical(slug, p);
      if (pc === canonical || normalizeShareKey(p) === k) {
        set.delete(p);
      }
    }
  } else {
    set.delete(k);
  }
  await writePublicShareManifest(slug, { paths: [...set] });
}

// Re-export normalize for API route
export { normalizeShareKey } from "@/lib/public-share-urls";
