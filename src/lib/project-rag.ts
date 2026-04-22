import fs from "node:fs/promises";
import path from "node:path";
import type { OpenRouterConfig } from "@/lib/openrouter";
import { openRouterEmbeddings } from "@/lib/openrouter";
import {
  deleteDocFile,
  homePageRagPath,
  listDocFiles,
  listHomePageFiles,
  ragDir,
  readDocFile,
  readHomeHtml,
  readHomePageFile,
  readHomeTsx,
  readProjectMeta,
  renameDocFile,
  type HomePageFile,
  writeDocFile,
  writeHomePageFile,
} from "@/lib/projects";

export const RAG_INDEX_VERSION = 1 as const;

export type RagChunk = {
  path: string;
  chunkIndex: number;
  text: string;
  embedding: number[];
  /** Indexed file kind; omitted on older index files (inferred from `path`). */
  source?: "docs" | "home";
};

export type RagSearchScope = "all" | "docs" | "home";

export function inferRagChunkSource(path: string): "docs" | "home" {
  return path.startsWith("home/") ? "home" : "docs";
}

function chunkMatchesScope(c: RagChunk, scope: RagSearchScope): boolean {
  if (scope === "all") return true;
  const src = c.source ?? inferRagChunkSource(c.path);
  return src === scope;
}

export type RagIndexFile = {
  version: typeof RAG_INDEX_VERSION;
  embeddingModel: string;
  updatedAt: string;
  chunks: RagChunk[];
};

const INDEX_FILE = "chunks.json";
const CHUNK_SIZE = 1200;
const CHUNK_OVERLAP = 150;
const EMBED_BATCH = 48;

/** Relative docs paths we embed for semantic search (text-like only). */
export function shouldIndexDocPath(relativePath: string): boolean {
  const n = relativePath.toLowerCase();
  return /\.(?:md|markdown|txt|tsx?|jsx?|json|html?|css|scss|less|mjs|cjs|vue|svelte|rs|go|py|rb|php|sh|bat|ps1|yml|yaml|xml|csv|toml|ini|svg)$/i.test(
    n,
  );
}

/** Indexed virtual paths: docs/* plus `home/custom.html` and `home/custom.tsx`. */
function shouldIndexRagPath(ragPath: string): boolean {
  if (ragPath === "home/custom.html" || ragPath === "home/custom.tsx") {
    return true;
  }
  return shouldIndexDocPath(ragPath);
}

async function readTextForRagPath(
  slug: string,
  ragPath: string,
): Promise<string | null> {
  if (ragPath === "home/custom.html") return readHomeHtml(slug);
  if (ragPath === "home/custom.tsx") return readHomeTsx(slug);
  return readDocFile(slug, ragPath);
}

export function chunkText(raw: string): string[] {
  const s = raw.replace(/\r\n/g, "\n");
  const out: string[] = [];
  let i = 0;
  while (i < s.length) {
    const end = Math.min(i + CHUNK_SIZE, s.length);
    const slice = s.slice(i, end);
    if (slice.trim().length > 0) out.push(slice);
    if (end >= s.length) break;
    i = end - CHUNK_OVERLAP;
  }
  return out;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const x = a[i]!;
    const y = b[i]!;
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom > 0 ? dot / denom : 0;
}

function indexPath(slug: string): string {
  return path.join(ragDir(slug), INDEX_FILE);
}

export async function loadRagIndex(slug: string): Promise<RagIndexFile | null> {
  const file = indexPath(slug);
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw) as RagIndexFile;
    if (parsed.version !== RAG_INDEX_VERSION || !Array.isArray(parsed.chunks)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function saveRagIndex(slug: string, index: RagIndexFile): Promise<void> {
  const dir = ragDir(slug);
  await fs.mkdir(dir, { recursive: true });
  const file = indexPath(slug);
  const tmp = `${file}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(index), "utf8");
  await fs.rename(tmp, file);
}

async function embedBatches(
  config: OpenRouterConfig,
  texts: string[],
): Promise<number[][]> {
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += EMBED_BATCH) {
    const batch = texts.slice(i, i + EMBED_BATCH);
    const vectors = await openRouterEmbeddings({ config, inputs: batch });
    out.push(...vectors);
  }
  return out;
}

export async function rebuildProjectRagIndex(
  slug: string,
  config: OpenRouterConfig,
): Promise<{ chunkCount: number }> {
  const meta = await readProjectMeta(slug);
  if (!meta) {
    throw new Error("Project not found");
  }

  const files = await listDocFiles(slug);
  const toIndex = files.filter(shouldIndexDocPath);
  const pieces: {
    path: string;
    chunkIndex: number;
    text: string;
    source: "docs" | "home";
  }[] = [];

  for (const rel of toIndex) {
    const text = await readDocFile(slug, rel);
    if (text === null) continue;
    if (text.length > 800_000) continue;
    const chunks = chunkText(text);
    chunks.forEach((t, chunkIndex) => {
      pieces.push({ path: rel, chunkIndex, text: t, source: "docs" });
    });
  }

  const homePairs: { path: string; text: string }[] = [];
  const html = await readHomeHtml(slug);
  if (html) {
    homePairs.push({ path: homePageRagPath("custom.html"), text: html });
  }
  const tsx = await readHomeTsx(slug);
  if (tsx) {
    homePairs.push({ path: homePageRagPath("custom.tsx"), text: tsx });
  }
  for (const { path: hpath, text: htext } of homePairs) {
    if (htext.length > 800_000) continue;
    const chunks = chunkText(htext);
    chunks.forEach((t, chunkIndex) => {
      pieces.push({ path: hpath, chunkIndex, text: t, source: "home" });
    });
  }

  const texts = pieces.map((p) => p.text);
  const embeddings =
    texts.length > 0 ? await embedBatches(config, texts) : [];

  const chunks: RagChunk[] = pieces.map((p, i) => ({
    path: p.path,
    chunkIndex: p.chunkIndex,
    text: p.text,
    embedding: embeddings[i]!,
    source: p.source,
  }));

  const index: RagIndexFile = {
    version: RAG_INDEX_VERSION,
    embeddingModel: config.embeddingModel,
    updatedAt: new Date().toISOString(),
    chunks,
  };
  await saveRagIndex(slug, index);
  return { chunkCount: chunks.length };
}

/** After agent or API mutates docs, keep vectors aligned without full rebuild. */
export async function syncRagIndexForPaths(
  slug: string,
  config: OpenRouterConfig,
  changedPaths: string[],
): Promise<void> {
  if (changedPaths.length === 0) return;
  const unique = [...new Set(changedPaths.map((p) => p.replace(/\\/g, "/")))];
  let base =
    (await loadRagIndex(slug)) ??
    ({
      version: RAG_INDEX_VERSION,
      embeddingModel: config.embeddingModel,
      updatedAt: new Date().toISOString(),
      chunks: [],
    } satisfies RagIndexFile);

  base.chunks = base.chunks.filter((c) => !unique.includes(c.path));

  const pieces: {
    path: string;
    chunkIndex: number;
    text: string;
    source: "docs" | "home";
  }[] = [];
  for (const rel of unique) {
    if (!shouldIndexRagPath(rel)) continue;
    const text = await readTextForRagPath(slug, rel);
    if (text === null) continue;
    if (text.length > 800_000) continue;
    const parts = chunkText(text);
    const source = inferRagChunkSource(rel);
    parts.forEach((t, chunkIndex) => {
      pieces.push({ path: rel, chunkIndex, text: t, source });
    });
  }

  if (pieces.length === 0) {
    base.embeddingModel = config.embeddingModel;
    base.updatedAt = new Date().toISOString();
    await saveRagIndex(slug, base);
    return;
  }

  const texts = pieces.map((p) => p.text);
  const embeddings = await embedBatches(config, texts);
  const newChunks: RagChunk[] = pieces.map((p, i) => ({
    path: p.path,
    chunkIndex: p.chunkIndex,
    text: p.text,
    embedding: embeddings[i]!,
    source: p.source,
  }));

  base.chunks = [...base.chunks, ...newChunks];
  base.embeddingModel = config.embeddingModel;
  base.updatedAt = new Date().toISOString();
  await saveRagIndex(slug, base);
}

export async function ragSemanticSearch(
  slug: string,
  config: OpenRouterConfig,
  query: string,
  topK: number,
  scope: RagSearchScope = "all",
): Promise<
  Array<{ path: string; text: string; score: number; source: "docs" | "home" }>
> {
  const q = query.trim();
  if (!q) return [];

  const index = await loadRagIndex(slug);
  if (!index || index.chunks.length === 0) {
    return [];
  }

  const [qVec] = await openRouterEmbeddings({ config, inputs: [q] });
  if (!qVec) return [];

  const filtered = index.chunks.filter((c) => chunkMatchesScope(c, scope));
  const scored = filtered.map((c) => {
    const source = c.source ?? inferRagChunkSource(c.path);
    return {
      path: c.path,
      text: c.text,
      score: cosineSimilarity(qVec, c.embedding),
      source,
    };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

export function projectAiToolDefinitions(): Array<{
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}> {
  return [
    {
      type: "function",
      function: {
        name: "list_documents",
        description:
          "List all document file paths under this project’s docs folder (relative paths).",
        parameters: { type: "object", properties: {}, additionalProperties: false },
      },
    },
    {
      type: "function",
      function: {
        name: "read_document",
        description:
          "Read the full text of a document under docs. Use a path from list_documents.",
        parameters: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Docs-relative path, e.g. notes.md or sub/readme.md",
            },
          },
          required: ["path"],
          additionalProperties: false,
        },
      },
    },
    {
      type: "function",
      function: {
        name: "write_document",
        description:
          "Create or overwrite a document under docs. Parent folders are created as needed.",
        parameters: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Docs-relative file path",
            },
            content: {
              type: "string",
              description: "Full file contents as UTF-8 text",
            },
          },
          required: ["path", "content"],
          additionalProperties: false,
        },
      },
    },
    {
      type: "function",
      function: {
        name: "delete_document",
        description: "Delete a single file under docs (not a directory).",
        parameters: {
          type: "object",
          properties: {
            path: { type: "string", description: "Docs-relative file path" },
          },
          required: ["path"],
          additionalProperties: false,
        },
      },
    },
    {
      type: "function",
      function: {
        name: "rename_document",
        description: "Rename or move a file under docs to a new relative path.",
        parameters: {
          type: "object",
          properties: {
            from_path: {
              type: "string",
              description: "Current docs-relative path",
            },
            to_path: {
              type: "string",
              description: "New docs-relative path",
            },
          },
          required: ["from_path", "to_path"],
          additionalProperties: false,
        },
      },
    },
    {
      type: "function",
      function: {
        name: "search_documents",
        description:
          "Semantic search over indexed project docs and/or the public home page (home/custom.html, home/custom.tsx). Use scope to limit results. Rebuild the index from the dashboard if results are empty.",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Natural language query",
            },
            top_k: {
              type: "integer",
              description: "Number of chunks to return (1–12)",
            },
            scope: {
              type: "string",
              enum: ["all", "docs", "home"],
              description:
                "all = docs + home page sources; docs = docs folder only; home = custom.html / custom.tsx only",
            },
          },
          required: ["query"],
          additionalProperties: false,
        },
      },
    },
    {
      type: "function",
      function: {
        name: "grep_docs",
        description:
          "Regex search across line-oriented text in docs and/or home page files (raw content, not embeddings). Use for exact symbols, imports, or strings; pair with read_document for full context.",
        parameters: {
          type: "object",
          properties: {
            pattern: {
              type: "string",
              description: "JavaScript RegExp pattern (e.g. import\\\\s+React or TODO)",
            },
            scope: {
              type: "string",
              enum: ["all", "docs", "home"],
              description: "Which files to scan",
            },
            case_insensitive: {
              type: "boolean",
              description: "If true (default), use case-insensitive matching",
            },
            max_results: {
              type: "integer",
              description: "Max lines to return (1–80)",
            },
          },
          required: ["pattern"],
          additionalProperties: false,
        },
      },
    },
    {
      type: "function",
      function: {
        name: "list_home_page",
        description:
          "List which public home page files exist (custom.html and/or custom.tsx under the project home). If both exist, HTML is shown on the main URL first.",
        parameters: { type: "object", properties: {}, additionalProperties: false },
      },
    },
    {
      type: "function",
      function: {
        name: "read_home_page",
        description:
          "Read the full source of the project’s main page file: custom.html (sandboxed iframe) or custom.tsx (live React preview).",
        parameters: {
          type: "object",
          properties: {
            file: {
              type: "string",
              enum: ["custom.html", "custom.tsx"],
              description: "Which home file to read",
            },
          },
          required: ["file"],
          additionalProperties: false,
        },
      },
    },
    {
      type: "function",
      function: {
        name: "write_home_page",
        description:
          "Create or overwrite custom.html or custom.tsx for the project’s public home URL. Only these two filenames are allowed.",
        parameters: {
          type: "object",
          properties: {
            file: {
              type: "string",
              enum: ["custom.html", "custom.tsx"],
              description: "Target file",
            },
            content: {
              type: "string",
              description: "Full file contents as UTF-8 text",
            },
          },
          required: ["file", "content"],
          additionalProperties: false,
        },
      },
    },
  ];
}

async function grepProjectDocs(
  slug: string,
  args: Record<string, unknown>,
): Promise<string> {
  const pattern = typeof args.pattern === "string" ? args.pattern : "";
  if (!pattern.trim()) {
    return "Error: missing pattern";
  }
  const scopeRaw = args.scope;
  let scope: RagSearchScope = "all";
  if (scopeRaw === "docs" || scopeRaw === "home") {
    scope = scopeRaw;
  } else if (scopeRaw === "all" || scopeRaw === undefined) {
    scope = "all";
  }
  const ci = args.case_insensitive !== false;
  let max = 40;
  const mr = args.max_results;
  if (typeof mr === "number" && Number.isFinite(mr)) {
    max = Math.floor(mr);
  } else if (typeof mr === "string" && mr.trim() !== "") {
    const n = Number.parseInt(mr, 10);
    if (Number.isFinite(n)) max = n;
  }
  max = Math.min(80, Math.max(1, max));

  let re: RegExp;
  try {
    re = new RegExp(pattern, ci ? "i" : "");
  } catch {
    return "Error: invalid regex pattern";
  }

  const lines: string[] = [];
  let count = 0;

  const tryLine = (file: string, lineNum: number, line: string) => {
    if (count >= max) return;
    re.lastIndex = 0;
    if (re.test(line)) {
      const trimmed = line.length > 240 ? `${line.slice(0, 240)}…` : line;
      lines.push(`${file}:${lineNum}:${trimmed}`);
      count++;
    }
  };

  if (scope === "all" || scope === "docs") {
    const files = await listDocFiles(slug);
    for (const rel of files) {
      if (count >= max) break;
      if (!shouldIndexDocPath(rel)) continue;
      const text = await readDocFile(slug, rel);
      if (text === null) continue;
      const fileLines = text.split(/\r?\n/);
      for (let i = 0; i < fileLines.length; i++) {
        if (count >= max) break;
        tryLine(rel, i + 1, fileLines[i]!);
      }
    }
  }

  if ((scope === "all" || scope === "home") && count < max) {
    const homeFiles: { path: string; get: () => Promise<string | null> }[] = [
      { path: homePageRagPath("custom.html"), get: () => readHomeHtml(slug) },
      { path: homePageRagPath("custom.tsx"), get: () => readHomeTsx(slug) },
    ];
    for (const hf of homeFiles) {
      if (count >= max) break;
      const text = await hf.get();
      if (!text) continue;
      const fileLines = text.split(/\r?\n/);
      for (let i = 0; i < fileLines.length; i++) {
        if (count >= max) break;
        tryLine(hf.path, i + 1, fileLines[i]!);
      }
    }
  }

  if (lines.length === 0) {
    return "(no matches)";
  }
  return lines.join("\n");
}

const MAX_READ_CHARS = 100_000;

export async function executeProjectAiTool(params: {
  slug: string;
  config: OpenRouterConfig;
  name: string;
  args: unknown;
}): Promise<{ result: string; changedPaths: string[] }> {
  const { slug, config, name } = params;
  const changedPaths: string[] = [];

  const parseObj = (): Record<string, unknown> =>
    typeof params.args === "object" && params.args !== null && !Array.isArray(params.args)
      ? (params.args as Record<string, unknown>)
      : {};

  try {
    switch (name) {
      case "list_documents": {
        const files = await listDocFiles(slug);
        if (files.length === 0) {
          return { result: "(no documents yet)", changedPaths };
        }
        return { result: files.join("\n"), changedPaths };
      }
      case "read_document": {
        const o = parseObj();
        const p = typeof o.path === "string" ? o.path.trim() : "";
        if (!p) {
          return { result: "Error: missing path", changedPaths };
        }
        const text = await readDocFile(slug, p);
        if (text === null) {
          return { result: `Error: file not found or not readable: ${p}`, changedPaths };
        }
        if (text.length > MAX_READ_CHARS) {
          return {
            result: `${text.slice(0, MAX_READ_CHARS)}\n\n… [truncated, ${text.length} chars total]`,
            changedPaths,
          };
        }
        return { result: text, changedPaths };
      }
      case "write_document": {
        const o = parseObj();
        const rel = typeof o.path === "string" ? o.path.trim() : "";
        const content = typeof o.content === "string" ? o.content : "";
        if (!rel) {
          return { result: "Error: missing path", changedPaths };
        }
        await writeDocFile(slug, rel, Buffer.from(content, "utf8"));
        changedPaths.push(rel.replace(/\\/g, "/"));
        return { result: `OK: wrote ${rel} (${content.length} chars)`, changedPaths };
      }
      case "delete_document": {
        const o = parseObj();
        const rel = typeof o.path === "string" ? o.path.trim() : "";
        if (!rel) {
          return { result: "Error: missing path", changedPaths };
        }
        await deleteDocFile(slug, rel);
        changedPaths.push(rel.replace(/\\/g, "/"));
        return { result: `OK: deleted ${rel}`, changedPaths };
      }
      case "rename_document": {
        const o = parseObj();
        const from = typeof o.from_path === "string" ? o.from_path.trim() : "";
        const to = typeof o.to_path === "string" ? o.to_path.trim() : "";
        if (!from || !to) {
          return { result: "Error: need from_path and to_path", changedPaths };
        }
        await renameDocFile(slug, from, to);
        changedPaths.push(from.replace(/\\/g, "/"), to.replace(/\\/g, "/"));
        return { result: `OK: renamed ${from} → ${to}`, changedPaths };
      }
      case "list_home_page": {
        const files = await listHomePageFiles(slug);
        if (files.length === 0) {
          return {
            result:
              "No custom home page on disk. Upload custom.html or custom.tsx from the project dashboard (Home tab), or use write_home_page to create one.",
            changedPaths,
          };
        }
        const note =
          files.includes("custom.html") && files.includes("custom.tsx")
            ? "Both exist: the main URL serves custom.html first (TSX is ignored until HTML is removed)."
            : files.includes("custom.html")
              ? "Main URL serves sandboxed HTML."
              : "Main URL serves live TSX preview.";
        return { result: `Present: ${files.join(", ")}\n${note}`, changedPaths };
      }
      case "read_home_page": {
        const o = parseObj();
        const raw = typeof o.file === "string" ? o.file.trim() : "";
        if (raw !== "custom.html" && raw !== "custom.tsx") {
          return { result: "Error: file must be custom.html or custom.tsx", changedPaths };
        }
        const file = raw as HomePageFile;
        const text = await readHomePageFile(slug, file);
        if (text === null) {
          return { result: `Error: ${file} not found`, changedPaths };
        }
        if (text.length > MAX_READ_CHARS) {
          return {
            result: `${text.slice(0, MAX_READ_CHARS)}\n\n… [truncated, ${text.length} chars total]`,
            changedPaths,
          };
        }
        return { result: text, changedPaths };
      }
      case "write_home_page": {
        const o = parseObj();
        const raw = typeof o.file === "string" ? o.file.trim() : "";
        const content = typeof o.content === "string" ? o.content : "";
        if (raw !== "custom.html" && raw !== "custom.tsx") {
          return { result: "Error: file must be custom.html or custom.tsx", changedPaths };
        }
        const file = raw as HomePageFile;
        await writeHomePageFile(slug, file, content);
        changedPaths.push(homePageRagPath(file));
        return {
          result: `OK: wrote ${file} (${content.length} chars). Rebuild search index if you rely on semantic search.`,
          changedPaths,
        };
      }
      case "search_documents": {
        const o = parseObj();
        const q = typeof o.query === "string" ? o.query.trim() : "";
        const rawTop = o.top_k;
        let topK = 8;
        if (typeof rawTop === "number" && Number.isFinite(rawTop)) {
          topK = Math.floor(rawTop);
        } else if (typeof rawTop === "string" && rawTop.trim() !== "") {
          const n = Number.parseInt(rawTop, 10);
          if (Number.isFinite(n)) topK = n;
        }
        topK = Math.min(12, Math.max(1, topK));
        if (!q) {
          return { result: "Error: empty query", changedPaths };
        }
        const scopeRaw = o.scope;
        let searchScope: RagSearchScope = "all";
        if (scopeRaw === "docs" || scopeRaw === "home" || scopeRaw === "all") {
          searchScope = scopeRaw;
        }
        const hits = await ragSemanticSearch(
          slug,
          config,
          q,
          topK,
          searchScope,
        );
        if (hits.length === 0) {
          return {
            result:
              "No indexed chunks found. Build the search index from the project dashboard (AI tab), then try again.",
            changedPaths,
          };
        }
        const lines = hits.map(
          (h, i) =>
            `[${i + 1}] score=${h.score.toFixed(4)} source=${h.source} path=${h.path}\n${h.text}`,
        );
        return { result: lines.join("\n\n---\n\n"), changedPaths };
      }
      case "grep_docs": {
        const o = parseObj();
        const result = await grepProjectDocs(slug, o);
        return { result, changedPaths };
      }
      default:
        return { result: `Error: unknown tool ${name}`, changedPaths };
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { result: `Error: ${msg}`, changedPaths };
  }
}
