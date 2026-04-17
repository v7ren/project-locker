/**
 * Scoped styles for live Markdown preview in MdViewer.
 * Targets `.mdviewer-preview` so rules do not leak to the app shell.
 */
export const MDVIEWER_PREVIEW_CSS = `
.mdviewer-preview {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: clamp(0.9375rem, 0.88rem + 0.35vw, 1.0625rem);
  line-height: 1.6;
  color: var(--foreground);
  background: var(--background);
  min-height: 100%;
}
.mdviewer-preview *, .mdviewer-preview *::before, .mdviewer-preview *::after { box-sizing: border-box; }
.mdviewer-preview .md-main {
  width: min(52rem, 100%);
  margin-inline: auto;
  min-width: 0;
}
.mdviewer-preview .md-main > *:first-child { margin-top: 0; }
.mdviewer-preview .md-main > *:last-child { margin-bottom: 0; }
.mdviewer-preview h1 {
  font-size: clamp(1.5rem, 1.2rem + 1.5vw, 2.125rem);
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 1.75em 0 0.5em;
}
.mdviewer-preview h2 {
  font-size: clamp(1.25rem, 1.05rem + 0.9vw, 1.625rem);
  line-height: 1.25;
  font-weight: 650;
  margin: 1.5em 0 0.45em;
  padding-bottom: 0.2em;
  border-bottom: 1px solid #e4e4e7;
}
.mdviewer-preview h3 { font-size: clamp(1.1rem, 1rem + 0.45vw, 1.25rem); font-weight: 600; margin: 1.35em 0 0.4em; }
.mdviewer-preview h4, .mdviewer-preview h5, .mdviewer-preview h6 { font-size: 1em; font-weight: 600; margin: 1.2em 0 0.35em; }
.mdviewer-preview p { margin: 0.85em 0; max-width: 65ch; text-wrap: pretty; }
.mdviewer-preview ul, .mdviewer-preview ol { margin: 0.85em 0; padding-left: 1.35em; max-width: 65ch; }
.mdviewer-preview li { margin: 0.35em 0; }
.mdviewer-preview li > ul, .mdviewer-preview li > ol { margin: 0.35em 0; }
.mdviewer-preview blockquote {
  margin: 1em 0;
  padding: 0.5em 0 0.5em clamp(0.75rem, 2vw, 1rem);
  border-left: 4px solid #d4d4d8;
  color: #3f3f46;
  max-width: 65ch;
}
.mdviewer-preview blockquote p { max-width: none; }
.mdviewer-preview hr { border: 0; border-top: 1px solid #e4e4e7; margin: 2rem 0; }
.mdviewer-preview a { color: #2563eb; text-underline-offset: 0.15em; word-break: break-word; }
.mdviewer-preview a:hover { color: #1d4ed8; }
.mdviewer-preview img, .mdviewer-preview video, .mdviewer-preview svg { max-width: 100%; height: auto; }
.mdviewer-preview pre, .mdviewer-preview code {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.88em;
  background: #f4f4f5;
  border-radius: 6px;
}
.mdviewer-preview code { padding: 0.15em 0.4em; word-break: break-word; }
.mdviewer-preview pre {
  padding: clamp(0.65rem, 2vw, 1rem);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  max-width: 100%;
  line-height: 1.5;
}
.mdviewer-preview pre code { background: transparent; padding: 0; font-size: inherit; word-break: normal; white-space: pre; }
.mdviewer-preview .md-tbl-scroll {
  margin: 1.25rem 0;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 8px;
  border: 1px solid #d4d4d8;
  background: #fff;
}
.mdviewer-preview table {
  width: max-content;
  min-width: 100%;
  border-collapse: collapse;
  font-size: clamp(0.8125rem, 0.76rem + 0.2vw, 0.9375em);
  line-height: 1.45;
}
.mdviewer-preview thead { border-bottom: 2px solid #a1a1aa; }
.mdviewer-preview th, .mdviewer-preview td {
  border: 1px solid #d4d4d8;
  padding: clamp(0.35rem, 1.2vw, 0.55rem) clamp(0.45rem, 1.8vw, 0.75rem);
  vertical-align: top;
  text-align: left;
  word-break: break-word;
  hyphens: auto;
}
.mdviewer-preview th { font-weight: 600; background: #f4f4f5; white-space: nowrap; }
.mdviewer-preview tbody tr:nth-child(even) td { background: #fafafa; }
.mdviewer-preview tbody tr:hover td { background: #f4f4f5; }
@media (max-width: 480px) {
  .mdviewer-preview th { white-space: normal; }
}
html.dark .mdviewer-preview {
  color: var(--foreground);
  background: var(--background);
}
html.dark .mdviewer-preview h2 { border-bottom-color: #3f3f46; }
html.dark .mdviewer-preview blockquote { border-left-color: #52525e; color: #a1a1aa; }
html.dark .mdviewer-preview hr { border-top-color: #3f3f46; }
html.dark .mdviewer-preview a { color: #60a5fa; }
html.dark .mdviewer-preview a:hover { color: #93c5fd; }
html.dark .mdviewer-preview pre, html.dark .mdviewer-preview code { background: #27272a; }
html.dark .mdviewer-preview .md-tbl-scroll { border-color: #52525e; background: var(--background); }
html.dark .mdviewer-preview th, html.dark .mdviewer-preview td { border-color: #52525e; }
html.dark .mdviewer-preview th { background: #27272a; }
html.dark .mdviewer-preview thead { border-bottom-color: #71717a; }
html.dark .mdviewer-preview tbody tr:nth-child(even) td { background: #27272a; }
html.dark .mdviewer-preview tbody tr:hover td { background: #3f3f46; }
`.trim();
