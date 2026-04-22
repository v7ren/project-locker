import { decodeDocUrlTrail, formatDocPathForDisplay } from "@/lib/doc-paths";

/**
 * One-line description of where the user is in the app (for the project AI system prompt).
 * `projectSlug` is the project this chat is scoped to.
 */
export function describeViewerLocation(
  projectSlug: string,
  pathname: string | null,
  searchParams: Pick<URLSearchParams, "get" | "toString">,
): string {
  const path = pathname ?? "/";
  const norm = path.replace(/\/$/, "") || "/";
  const base = `/${projectSlug}`;
  const query = searchParams.toString();

  const withUrl = (description: string) =>
    query ? `${description} — full URL path+query: ${path}?${query}` : `${description} — path: ${path}`;

  if (norm === `${base}/dashboard` || norm === `${base}/dashboard/`) {
    const tab = searchParams.get("tab");
    const tabLabel =
      tab === "docs"
        ? "Docs (files & Markdown workspace)"
        : tab === "ai"
          ? "AI (project assistant tab)"
          : "Home (upload custom.html / custom.tsx)";
    return withUrl(
      `Project dashboard for “${projectSlug}” — ${tabLabel} tab`,
    );
  }

  if (norm === base || norm === `${base}/`) {
    return withUrl(`Public project home URL for “${projectSlug}” (live site preview)`);
  }

  if (norm.startsWith(`${base}/public`)) {
    if (norm === `${base}/public` || norm === `${base}/public/`) {
      return withUrl(`Public read-only share viewer — landing`);
    }
    const mdPrefix = `${base}/public/md/`;
    const docPrefix = `${base}/public/doc/`;
    if (norm.startsWith(mdPrefix)) {
      const rel = decodeDocUrlTrail(norm.slice(mdPrefix.length));
      return withUrl(
        `Public share viewer — Markdown: ${formatDocPathForDisplay(rel)}`,
      );
    }
    if (norm.startsWith(docPrefix)) {
      const rel = decodeDocUrlTrail(norm.slice(docPrefix.length));
      return withUrl(
        `Public share viewer — document: ${formatDocPathForDisplay(rel)}`,
      );
    }
    return withUrl(`Public share viewer`);
  }

  const mdIdx = path.indexOf("/md/");
  if (mdIdx !== -1 && path.startsWith(base)) {
    const rel = decodeDocUrlTrail(path.slice(mdIdx + "/md/".length));
    return withUrl(
      `Signed-in Markdown editor / preview: ${formatDocPathForDisplay(rel)}`,
    );
  }

  const docIdx = path.indexOf("/doc/");
  if (docIdx !== -1 && path.startsWith(base)) {
    const rel = decodeDocUrlTrail(path.slice(docIdx + "/doc/".length));
    return withUrl(
      `Signed-in document viewer: ${formatDocPathForDisplay(rel)}`,
    );
  }

  if (path.includes(`/${projectSlug}/docs`)) {
    return withUrl(`Published docs listing or file under /${projectSlug}/docs`);
  }

  if (norm === "/docs" || norm.startsWith("/docs")) {
    const proj = searchParams.get("project");
    if (proj === projectSlug) {
      return withUrl(
        `Global documents library (all projects), filtered to this project`,
      );
    }
    return withUrl(`Global documents library page`);
  }

  if (norm === "/login" || norm.startsWith("/login")) {
    return withUrl(`Sign-in page`);
  }

  if (norm === "/" || norm === "") {
    return withUrl(`App home — project list`);
  }

  return withUrl(`App route`);
}
