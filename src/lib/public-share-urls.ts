/** No Node imports — safe for client components. */

export function normalizeShareKey(raw: string): string {
  return raw.trim().replace(/^\/+/, "").replace(/\\/g, "/");
}

export function publicSharedHomeHref(projectSlug: string): string {
  return `/${projectSlug}/public`;
}

export function publicSharedMarkdownHref(projectSlug: string, relativePath: string): string {
  const enc = relativePath.split("/").map(encodeURIComponent).join("/");
  return `/${projectSlug}/public/md/${enc}`;
}

export function publicSharedDocumentViewerHref(projectSlug: string, relativePath: string): string {
  const enc = relativePath.split("/").map(encodeURIComponent).join("/");
  return `/${projectSlug}/public/doc/${enc}`;
}

export function publicSharedDocServeHref(projectSlug: string, relativePath: string): string {
  const enc = relativePath.split("/").map(encodeURIComponent).join("/");
  return `/${projectSlug}/public/docs/${enc}`;
}

export function publicPathForShareKey(projectSlug: string, key: string): string {
  const k = normalizeShareKey(key);
  if (k === "home") return publicSharedHomeHref(projectSlug);
  if (k.startsWith("md/")) return publicSharedMarkdownHref(projectSlug, k.slice("md/".length));
  if (k.startsWith("doc/")) return publicSharedDocumentViewerHref(projectSlug, k.slice("doc/".length));
  return publicSharedHomeHref(projectSlug);
}
