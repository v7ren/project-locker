/** Wrap GFM tables so wide grids scroll horizontally on small viewports. */
export function wrapMarkdownTables(html: string): string {
  return html
    .replace(/<table(\b[^>]*)?>/gi, '<div class="md-tbl-scroll"><table$1>')
    .replace(/<\/table>/gi, "</table></div>");
}
