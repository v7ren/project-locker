import fs from "node:fs/promises";
import path from "node:path";
import { normalizeShareKey } from "@/lib/public-share-urls";
import {
  getDataRoot,
  isDocFile,
  isSafeRelativeSegments,
  readDocFile,
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

export async function isPathPublic(slug: string, key: string): Promise<boolean> {
  const k = normalizeShareKey(key);
  if (!isValidShareKey(k)) return false;
  const { paths } = await readPublicShareManifest(slug);
  return paths.includes(k);
}

export async function canEnablePublicShare(slug: string, key: string): Promise<boolean> {
  const k = normalizeShareKey(key);
  if (!isValidShareKey(k)) return false;
  if (k === "home") {
    return true;
  }
  if (k.startsWith("md/")) {
    const rel = k.slice("md/".length);
    const content = await readDocFile(slug, rel);
    return content !== null;
  }
  if (k.startsWith("doc/")) {
    const rel = k.slice("doc/".length);
    return isDocFile(slug, rel);
  }
  return false;
}

export async function setPathPublic(slug: string, key: string, makePublic: boolean): Promise<void> {
  const k = normalizeShareKey(key);
  if (!isValidShareKey(k)) throw new Error("Invalid key");
  if (makePublic && !(await canEnablePublicShare(slug, k))) {
    throw new Error("Nothing to share at this path");
  }
  const cur = await readPublicShareManifest(slug);
  const set = new Set(cur.paths);
  if (makePublic) set.add(k);
  else set.delete(k);
  await writePublicShareManifest(slug, { paths: [...set] });
}

// Re-export normalize for API route
export { normalizeShareKey } from "@/lib/public-share-urls";
