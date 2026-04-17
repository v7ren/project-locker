/** Decode one URL path segment for display (UTF-8 / Chinese); leaves plain segments unchanged. */
function decodePathSegment(segment: string): string {
  try {
    return decodeURIComponent(segment.replace(/\+/g, " "));
  } catch {
    return segment;
  }
}

/** Human-readable docs-relative path for UI (decoded %XX per segment). */
export function formatDocPathForDisplay(relativePath: string): string {
  if (!relativePath) return "";
  return relativePath.split("/").map(decodePathSegment).join("/");
}

/**
 * Decode an encoded URL trail (segments after `/md/` or `/doc/` in the pathname)
 * into a docs-relative path.
 */
export function decodeDocUrlTrail(trail: string): string {
  if (!trail) return "";
  return trail.split("/").filter(Boolean).map(decodePathSegment).join("/");
}

/** Public URL path under `/{slug}/docs/...` with correct encoding per segment. */
export function publicDocHref(projectSlug: string, relativePath: string): string {
  const enc = relativePath.split("/").map(encodeURIComponent).join("/");
  return `/${projectSlug}/docs/${enc}`;
}

/** Split Markdown editor + live preview (MdViewer) under `/{slug}/md/...`. */
export function markdownWorkspaceHref(projectSlug: string, relativePath: string): string {
  const enc = relativePath.split("/").map(encodeURIComponent).join("/");
  return `/${projectSlug}/md/${enc}`;
}

/**
 * In-app viewer (breadcrumbs + nav chrome) for uploaded docs; embeds `/{slug}/docs/...`.
 */
export function documentViewerHref(projectSlug: string, relativePath: string): string {
  const enc = relativePath.split("/").map(encodeURIComponent).join("/");
  return `/${projectSlug}/doc/${enc}`;
}
