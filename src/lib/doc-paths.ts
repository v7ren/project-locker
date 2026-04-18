export function decodePathSegment(segment: string): string {
  try {
    return decodeURIComponent(segment.replace(/\+/g, " "));
  } catch {
    return segment;
  }
}

export function segmentsToDocsRelativePath(segments: string[]): string {
  return segments.filter(Boolean).map(decodePathSegment).join("/");
}

export function formatDocPathForDisplay(relativePath: string): string {
  if (!relativePath) return "";
  return relativePath.split("/").map(decodePathSegment).join("/");
}

export function decodeDocUrlTrail(trail: string): string {
  if (!trail) return "";
  return trail.split("/").filter(Boolean).map(decodePathSegment).join("/");
}

export function encodeDocsPathTrail(relativePath: string): string {
  return relativePath
    .split("/")
    .filter(Boolean)
    .map((seg) => encodeURIComponent(decodePathSegment(seg.trim())))
    .join("/");
}

export function publicDocHref(projectSlug: string, relativePath: string): string {
  const enc = encodeDocsPathTrail(relativePath);
  return `/${projectSlug}/docs/${enc}`;
}

export function markdownWorkspaceHref(projectSlug: string, relativePath: string): string {
  const enc = encodeDocsPathTrail(relativePath);
  return `/${projectSlug}/md/${enc}`;
}

export function documentViewerHref(projectSlug: string, relativePath: string): string {
  const enc = encodeDocsPathTrail(relativePath);
  return `/${projectSlug}/doc/${enc}`;
}
