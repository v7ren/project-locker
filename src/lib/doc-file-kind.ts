import { decodePathSegment } from "@/lib/doc-paths";

export type DocFileKind = "markdown" | "pdf" | "image" | "html" | "code" | "other";

export function docFileKind(relativePath: string): DocFileKind {
  const n = relativePath.toLowerCase();
  if (n.endsWith(".md") || n.endsWith(".markdown")) return "markdown";
  if (n.endsWith(".pdf")) return "pdf";
  if (/\.(png|jpe?g|gif|webp|svg)$/.test(n)) return "image";
  if (n.endsWith(".html") || n.endsWith(".htm")) return "html";
  if (/\.(tsx?|jsx?|json|txt|csv|yml|yaml)$/.test(n)) return "code";
  return "other";
}

/** Decode each path segment first so `%2F`-style names and `%20` still classify like on disk. */
export function docFileKindFromEncodedRelativePath(relativePath: string): DocFileKind {
  const rel = relativePath.trim().replace(/^\/+/, "");
  const joined = rel
    .split("/")
    .map((s) => decodePathSegment(s.trim()))
    .filter(Boolean)
    .join("/");
  return docFileKind(joined);
}

export { publicDocHref } from "@/lib/doc-paths";

