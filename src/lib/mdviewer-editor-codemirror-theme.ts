import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { tags } from "@lezer/highlight";

const lightBg = "var(--background)";
const lightFg = "var(--foreground)";
const lightMuted = "#71717a";
const lightBorder = "#e4e4e7";
const lightLineHi = "#f4f4f5";
const lightSelection = "#d4d4d8";
const lightLink = "#2563eb";

const darkBg = "var(--background)";
const darkFg = "var(--foreground)";
const darkMuted = "#a1a1aa";
const darkBorder = "#3f3f46";
const darkLineHi = "#27272a";
const darkSelection = "#3f3f46";
const darkLink = "#60a5fa";
const darkLinkHover = "#93c5fd";

const mdViewerEditorLightTheme = EditorView.theme(
  {
    "&": { color: lightFg, backgroundColor: lightBg },
    ".cm-scroller": {
      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
      lineHeight: "1.55",
      backgroundColor: lightBg,
      color: lightFg,
    },
    ".cm-content": { caretColor: lightFg, color: lightFg },
    ".cm-line": { color: lightFg },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: lightFg },
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      { backgroundColor: lightSelection },
    ".cm-activeLine": { backgroundColor: lightLineHi },
    ".cm-gutters": {
      backgroundColor: lightBg,
      color: lightMuted,
      border: "none",
      borderRight: `1px solid ${lightBorder}`,
    },
    ".cm-activeLineGutter": { backgroundColor: lightLineHi },
    ".cm-foldPlaceholder": {
      backgroundColor: "transparent",
      border: "none",
      color: lightMuted,
    },
    ".cm-tooltip": {
      border: `1px solid ${lightBorder}`,
      backgroundColor: "#fff",
      color: lightFg,
    },
    ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
      backgroundColor: lightLineHi,
      color: lightFg,
    },
    ".cm-panels": { backgroundColor: lightLineHi, color: lightFg },
    ".cm-searchMatch": { backgroundColor: "rgba(37, 99, 235, 0.2)" },
    ".cm-selectionMatch": { backgroundColor: "rgba(37, 99, 235, 0.1)" },
  },
  { dark: false },
);

const mdViewerEditorDarkTheme = EditorView.theme(
  {
    "&": { color: darkFg, backgroundColor: darkBg },
    ".cm-scroller": {
      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
      lineHeight: "1.55",
      backgroundColor: darkBg,
      color: darkFg,
    },
    ".cm-content": { caretColor: darkFg, color: darkFg },
    ".cm-line": { color: darkFg },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: darkFg },
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      { backgroundColor: darkSelection },
    ".cm-activeLine": { backgroundColor: darkLineHi },
    ".cm-gutters": {
      backgroundColor: darkBg,
      color: "#71717a",
      border: "none",
      borderRight: `1px solid ${darkBorder}`,
    },
    ".cm-activeLineGutter": { backgroundColor: darkLineHi },
    ".cm-foldPlaceholder": {
      backgroundColor: "transparent",
      border: "none",
      color: darkMuted,
    },
    ".cm-tooltip": {
      border: `1px solid ${darkBorder}`,
      backgroundColor: darkLineHi,
      color: darkFg,
    },
    ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
      backgroundColor: darkBorder,
      color: darkFg,
    },
    ".cm-panels": { backgroundColor: darkLineHi, color: darkFg },
    ".cm-searchMatch": { backgroundColor: "rgba(96, 165, 250, 0.22)" },
    ".cm-selectionMatch": { backgroundColor: "rgba(96, 165, 250, 0.1)" },
  },
  { dark: true },
);

const mdViewerEditorLightHighlightSpecs = [
  { tag: tags.heading, fontWeight: "700", color: lightFg },
  { tag: tags.strong, fontWeight: "700" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strikethrough, textDecoration: "line-through", color: lightMuted },
  { tag: tags.link, color: lightLink, textDecoration: "underline" },
  { tag: tags.url, color: "#1d4ed8" },
  { tag: tags.meta, color: lightMuted },
  { tag: tags.comment, color: lightMuted },
  { tag: tags.quote, color: "#52525e", fontStyle: "italic" },
  { tag: tags.monospace, color: lightFg, backgroundColor: lightLineHi, borderRadius: "4px" },
  { tag: tags.keyword, color: "#7c3aed" },
  { tag: tags.string, color: "#0d9488" },
  { tag: tags.labelName, color: lightLink },
  { tag: tags.operator, color: lightMuted },
  { tag: tags.punctuation, color: lightMuted },
  { tag: tags.atom, color: "#b45309" },
  { tag: tags.invalid, color: "#dc2626" },
];

const mdViewerEditorDarkHighlightSpecs = [
  { tag: tags.heading, fontWeight: "700", color: "#f4f4f5" },
  { tag: tags.strong, fontWeight: "700" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strikethrough, textDecoration: "line-through", color: darkMuted },
  { tag: tags.link, color: darkLink, textDecoration: "underline" },
  { tag: tags.url, color: darkLinkHover },
  { tag: tags.meta, color: darkMuted },
  { tag: tags.comment, color: darkMuted },
  { tag: tags.quote, color: darkMuted, fontStyle: "italic" },
  { tag: tags.monospace, color: darkFg, backgroundColor: darkLineHi, borderRadius: "4px" },
  { tag: tags.keyword, color: "#a78bfa" },
  { tag: tags.string, color: "#5eead4" },
  { tag: tags.labelName, color: darkLink },
  { tag: tags.operator, color: darkMuted },
  { tag: tags.punctuation, color: darkMuted },
  { tag: tags.atom, color: "#fdba74" },
  { tag: tags.invalid, color: "#f87171" },
];

const mdViewerEditorLightHighlight = HighlightStyle.define(
  [...mdViewerEditorLightHighlightSpecs],
  { themeType: "light", all: { color: lightFg } },
);

const mdViewerEditorDarkHighlight = HighlightStyle.define(
  [...mdViewerEditorDarkHighlightSpecs],
  { themeType: "dark", all: { color: darkFg } },
);

export function mdViewerEditorThemeExtensions(theme: "light" | "dark") {
  return [
    theme === "dark" ? mdViewerEditorDarkTheme : mdViewerEditorLightTheme,
    syntaxHighlighting(mdViewerEditorLightHighlight),
    syntaxHighlighting(mdViewerEditorDarkHighlight),
  ];
}
