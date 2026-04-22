import fs from "node:fs/promises";
import path from "node:path";
import { decodePathSegment } from "@/lib/doc-paths";

export type ProjectMeta = {
  name: string;
  slug: string;
  createdAt: string;
};

/** Project roots: `data/projects` or `PROJECT_DATA_ROOT` (absolute or cwd-relative). */
function resolveProjectsDataRoot(): string {
  const explicit = process.env.PROJECT_DATA_ROOT?.trim();
  if (explicit) {
    return path.isAbsolute(explicit) ? explicit : path.join(process.cwd(), explicit);
  }
  return path.join(process.cwd(), "data", "projects");
}

function dataRoot(): string {
  return resolveProjectsDataRoot();
}

export function getDataRoot(): string {
  return dataRoot();
}

export function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base.length > 0 ? base : "project";
}

const SAFE_PROJECT_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isSafeProjectSlug(slug: string): boolean {
  return (
    slug.length > 0 &&
    slug.length <= 200 &&
    !slug.includes("/") &&
    !slug.includes("\\") &&
    SAFE_PROJECT_SLUG_RE.test(slug)
  );
}

function projectDir(slug: string): string {
  return path.join(dataRoot(), slug);
}

export async function ensureDataRoot(): Promise<void> {
  await fs.mkdir(dataRoot(), { recursive: true });
}

export async function listProjects(): Promise<ProjectMeta[]> {
  await ensureDataRoot();
  const entries = await fs.readdir(dataRoot(), { withFileTypes: true });
  const projects: ProjectMeta[] = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const meta = await readProjectMeta(e.name);
    if (meta) projects.push(meta);
  }
  projects.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return projects;
}

export async function readProjectMeta(
  slug: string,
): Promise<ProjectMeta | null> {
  const file = path.join(projectDir(slug), "project.json");
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as ProjectMeta;
  } catch {
    return null;
  }
}

export async function projectExists(slug: string): Promise<boolean> {
  const meta = await readProjectMeta(slug);
  return meta !== null;
}

export async function createProject(name: string): Promise<ProjectMeta> {
  await ensureDataRoot();
  let slug = slugify(name);
  let n = 2;
  while (await projectExists(slug)) {
    slug = `${slugify(name)}-${n}`;
    n += 1;
  }
  const dir = projectDir(slug);
  await fs.mkdir(path.join(dir, "docs"), { recursive: true });
  await fs.mkdir(path.join(dir, "home"), { recursive: true });
  const meta: ProjectMeta = {
    name: name.trim(),
    slug,
    createdAt: new Date().toISOString(),
  };
  await fs.writeFile(
    path.join(dir, "project.json"),
    JSON.stringify(meta, null, 2),
    "utf8",
  );
  return meta;
}

export async function deleteProject(slug: string): Promise<void> {
  if (!isSafeProjectSlug(slug)) {
    throw new Error("Invalid slug");
  }
  if (!(await projectExists(slug))) {
    throw new Error("Not found");
  }
  await fs.rm(projectDir(slug), { recursive: true, force: true });
}

export function docsDir(slug: string): string {
  return path.join(projectDir(slug), "docs");
}

/** Per-project RAG index and metadata (isolated per slug). */
export function ragDir(slug: string): string {
  return path.join(projectDir(slug), ".rag");
}

export function homeDir(slug: string): string {
  return path.join(projectDir(slug), "home");
}

export function isSafeRelativeSegments(segments: string[]): boolean {
  if (segments.length === 0) return false;
  return segments.every(
    (s) =>
      s.length > 0 &&
      s !== "." &&
      s !== ".." &&
      !s.includes("/") &&
      !s.includes("\\"),
  );
}

export function resolveDocsFile(slug: string, segments: string[]): string {
  return path.join(docsDir(slug), ...segments);
}

function docSegmentMatchesDisk(diskName: string, urlSegment: string): boolean {
  const a = diskName.normalize("NFC");
  const b = urlSegment.normalize("NFC");
  if (a === b) return true;
  const stripWs = (s: string) => s.replace(/\p{White_Space}/gu, "");
  return stripWs(a) === stripWs(b);
}

/** Resolve `docs/` file: exact path, then per-segment NFC / Unicode whitespace-tolerant match. */
export async function resolveDocFilePath(
  slug: string,
  relativePath: string,
): Promise<string | null> {
  const rel = relativePath.trim().replace(/^\/+/, "");
  const segments = rel
    .split("/")
    .map((s) => decodePathSegment(s.trim()))
    .filter(Boolean);
  if (!isSafeRelativeSegments(segments)) return null;

  const full = resolveDocsFile(slug, segments);
  try {
    const st = await fs.stat(full);
    if (st.isFile()) return full;
    return null;
  } catch {
    // fall through to tolerant match
  }

  let dir = docsDir(slug);

  for (let i = 0; i < segments.length; i++) {
    const isLast = i === segments.length - 1;
    let names: string[];
    try {
      names = await fs.readdir(dir);
    } catch {
      return null;
    }
    const match = names.find((n) => docSegmentMatchesDisk(n, segments[i]!));
    if (!match) return null;
    const nextPath = path.join(dir, match);
    if (isLast) {
      try {
        const st = await fs.stat(nextPath);
        return st.isFile() ? nextPath : null;
      } catch {
        return null;
      }
    }
    try {
      const st = await fs.stat(nextPath);
      if (!st.isDirectory()) return null;
    } catch {
      return null;
    }
    dir = nextPath;
  }
  return null;
}

export async function listDocFiles(slug: string): Promise<string[]> {
  const root = docsDir(slug);
  try {
    const out: string[] = [];
    async function walk(rel: string): Promise<void> {
      const full = path.join(root, rel);
      const entries = await fs.readdir(full, { withFileTypes: true });
      for (const e of entries) {
        const nextRel = rel ? `${rel}/${e.name}` : e.name;
        if (e.isDirectory()) await walk(nextRel);
        else out.push(nextRel);
      }
    }
    await walk("");
    return out.sort();
  } catch {
    return [];
  }
}

export async function readDocFile(
  slug: string,
  relativePath: string,
): Promise<string | null> {
  const full = await resolveDocFilePath(slug, relativePath);
  if (!full) return null;
  try {
    return await fs.readFile(full, "utf8");
  } catch {
    return null;
  }
}

export async function isDocFile(
  slug: string,
  relativePath: string,
): Promise<boolean> {
  const full = await resolveDocFilePath(slug, relativePath);
  return full !== null;
}

export async function writeDocFile(
  slug: string,
  relativePath: string,
  data: Buffer,
): Promise<void> {
  const segments = relativePath.split("/").filter(Boolean);
  if (!isSafeRelativeSegments(segments)) {
    throw new Error("Invalid path");
  }
  const full = resolveDocsFile(slug, segments);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, data);
}

export async function deleteDocFile(
  slug: string,
  relativePath: string,
): Promise<void> {
  const rel = relativePath.trim().replace(/^\/+/, "");
  const segments = rel.split("/").filter(Boolean);
  if (!isSafeRelativeSegments(segments)) {
    throw new Error("Invalid path");
  }
  const full = resolveDocsFile(slug, segments);
  let stat: Awaited<ReturnType<typeof fs.stat>>;
  try {
    stat = await fs.stat(full);
  } catch {
    throw new Error("Not found");
  }
  if (!stat.isFile()) {
    throw new Error("Not a file");
  }
  await fs.unlink(full);

  const stop = docsDir(slug);
  let dir = path.dirname(full);
  for (;;) {
    if (dir === stop) break;
    const relToStop = path.relative(stop, dir);
    if (relToStop.startsWith("..") || path.isAbsolute(relToStop)) break;
    try {
      const names = await fs.readdir(dir);
      if (names.length > 0) break;
      await fs.rmdir(dir);
      dir = path.dirname(dir);
    } catch {
      break;
    }
  }
}

async function pruneEmptyParentsAfterRemoval(
  slug: string,
  removedFilePath: string,
): Promise<void> {
  const stop = docsDir(slug);
  let dir = path.dirname(removedFilePath);
  for (;;) {
    if (dir === stop) break;
    const relToStop = path.relative(stop, dir);
    if (relToStop.startsWith("..") || path.isAbsolute(relToStop)) break;
    try {
      const names = await fs.readdir(dir);
      if (names.length > 0) break;
      await fs.rmdir(dir);
      dir = path.dirname(dir);
    } catch {
      break;
    }
  }
}

export async function renameDocFile(
  slug: string,
  fromRelative: string,
  toRelative: string,
): Promise<void> {
  const fromRel = fromRelative.trim().replace(/^\/+/, "").replace(/\\/g, "/");
  const toRel = toRelative.trim().replace(/^\/+/, "").replace(/\\/g, "/");
  const fromSeg = fromRel.split("/").filter(Boolean);
  const toSeg = toRel.split("/").filter(Boolean);
  if (!isSafeRelativeSegments(fromSeg) || !isSafeRelativeSegments(toSeg)) {
    throw new Error("Invalid path");
  }
  const fromFull = resolveDocsFile(slug, fromSeg);
  const toFull = resolveDocsFile(slug, toSeg);
  if (fromFull === toFull) return;

  let stat: Awaited<ReturnType<typeof fs.stat>>;
  try {
    stat = await fs.stat(fromFull);
  } catch {
    throw new Error("Not found");
  }
  if (!stat.isFile()) {
    throw new Error("Not a file");
  }

  let destExists = false;
  try {
    await fs.stat(toFull);
    destExists = true;
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err?.code !== "ENOENT") throw e;
  }
  if (destExists) {
    throw new Error("Destination exists");
  }

  await fs.mkdir(path.dirname(toFull), { recursive: true });
  await fs.rename(fromFull, toFull);
  await pruneEmptyParentsAfterRemoval(slug, fromFull);
}

export async function readHomeHtml(slug: string): Promise<string | null> {
  const file = path.join(homeDir(slug), "custom.html");
  try {
    return await fs.readFile(file, "utf8");
  } catch {
    return null;
  }
}

export async function readHomeTsx(slug: string): Promise<string | null> {
  const file = path.join(homeDir(slug), "custom.tsx");
  try {
    return await fs.readFile(file, "utf8");
  } catch {
    return null;
  }
}

/** Public project home files (under `home/`). HTML is served in preference to TSX when both exist. */
export type HomePageFile = "custom.html" | "custom.tsx";

export async function listHomePageFiles(slug: string): Promise<HomePageFile[]> {
  const out: HomePageFile[] = [];
  if ((await readHomeHtml(slug)) !== null) out.push("custom.html");
  if ((await readHomeTsx(slug)) !== null) out.push("custom.tsx");
  return out;
}

export async function readHomePageFile(
  slug: string,
  file: HomePageFile,
): Promise<string | null> {
  if (file === "custom.html") return readHomeHtml(slug);
  return readHomeTsx(slug);
}

export async function writeHomePageFile(
  slug: string,
  file: HomePageFile,
  content: string,
): Promise<void> {
  await fs.mkdir(homeDir(slug), { recursive: true });
  await fs.writeFile(path.join(homeDir(slug), file), content, "utf8");
}

/** Virtual path used in RAG chunks (not a docs path). */
export function homePageRagPath(file: HomePageFile): string {
  return `home/${file}`;
}
