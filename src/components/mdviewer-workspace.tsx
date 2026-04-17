"use client";

import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import DOMPurify from "dompurify";
import { marked } from "marked";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { PublicSharePanel } from "@/components/public-share-panel";
import { useViewerChromeOptional } from "@/components/viewer-chrome-context";
import { formatDocPathForDisplay, publicDocHref } from "@/lib/doc-paths";
import { publicSharedDocServeHref } from "@/lib/public-share-urls";
import { wrapMarkdownTables } from "@/lib/markdown-html";
import { mdViewerEditorThemeExtensions } from "@/lib/mdviewer-editor-codemirror-theme";
import { MDVIEWER_PREVIEW_CSS } from "@/lib/mdviewer-preview-scoped-css";
import { useTranslations } from "@/lib/i18n/locale-provider";
import { cn } from "@/lib/utils";

type Props = {
  slug: string;
  relativePath: string;
  initialContent: string;
  readOnly?: boolean;
  shareKey?: string;
  rawDocHrefBase?: "public";
};

type LayoutMode = "view" | "split" | "edit";

/** Fixed top-center layout chrome — on small screens sits below top-right + left path card. */
const layoutModeBarOuter =
  "pointer-events-none fixed inset-x-0 top-0 z-[255] flex justify-center px-[max(0.75rem,env(safe-area-inset-left))] pt-[max(0.65rem,env(safe-area-inset-top))] pr-[max(0.75rem,env(safe-area-inset-right))] max-sm:top-[8.25rem] max-sm:pt-[max(0.35rem,env(safe-area-inset-top))]";
const layoutModeBarInner =
  "pointer-events-auto flex rounded-2xl border border-zinc-200/45 bg-white/40 p-0.5 text-xs shadow-md backdrop-blur-md dark:border-zinc-500/35 dark:bg-zinc-950/35";

const glassCard =
  "rounded-xl border border-zinc-200/45 bg-white/40 px-3 py-2 text-xs shadow-md backdrop-blur-md dark:border-zinc-500/35 dark:bg-zinc-950/35";

/** Bottom-right: clears bottom breadcrumb + dock on small screens. */
const saveToastOuter =
  "pointer-events-none fixed right-0 z-[259] flex justify-end pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] bottom-[max(1rem,env(safe-area-inset-bottom))] max-sm:bottom-[max(11.75rem,calc(env(safe-area-inset-bottom)+10.5rem))]";

function renderPreviewHtml(md: string): string {
  if (typeof window === "undefined") return "";
  const raw = marked.parse(md, { async: false }) as string;
  return DOMPurify.sanitize(wrapMarkdownTables(raw), { USE_PROFILES: { html: true } });
}

export function MdViewerWorkspace({
  slug,
  relativePath,
  initialContent,
  readOnly = false,
  shareKey,
  rawDocHrefBase,
}: Props) {
  const { t } = useTranslations();
  const viewerChrome = useViewerChromeOptional();
  const hideFloatingMobile = Boolean(viewerChrome?.floatingUiHidden);
  const { resolvedTheme } = useTheme();
  const [value, setValue] = useState(initialContent);
  const [lastSaved, setLastSaved] = useState(initialContent);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("view");
  const [panelDir, setPanelDir] = useState<"horizontal" | "vertical">("horizontal");
  const [saveToastPhase, setSaveToastPhase] = useState<"hidden" | "visible" | "leaving">("hidden");
  const saveToastTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const dirty = value !== lastSaved;
  const rawHref =
    rawDocHrefBase === "public"
      ? `${publicSharedDocServeHref(slug, relativePath)}?raw=1`
      : `${publicDocHref(slug, relativePath)}?raw=1`;
  const previewHtml = useMemo(() => renderPreviewHtml(value), [value]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setPanelDir(mq.matches ? "horizontal" : "vertical");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (readOnly) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty, readOnly]);

  const clearSaveToastTimers = useCallback(() => {
    for (const t of saveToastTimers.current) {
      clearTimeout(t);
    }
    saveToastTimers.current = [];
  }, []);

  const showSaveToast = useCallback(() => {
    clearSaveToastTimers();
    setSaveToastPhase("visible");
    saveToastTimers.current.push(
      setTimeout(() => setSaveToastPhase("leaving"), 2000),
      setTimeout(() => {
        setSaveToastPhase("hidden");
        clearSaveToastTimers();
      }, 2550),
    );
  }, [clearSaveToastTimers]);

  useEffect(() => () => clearSaveToastTimers(), [clearSaveToastTimers]);

  const save = useCallback(async () => {
    if (readOnly) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/projects/${slug}/docs`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ filename: relativePath, content: value }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setStatus(data.error ?? t("mdViewer.saveFailed"));
        return;
      }
      setLastSaved(value);
      showSaveToast();
    } finally {
      setBusy(false);
    }
  }, [readOnly, slug, relativePath, value, showSaveToast, t]);

  useEffect(() => {
    if (readOnly) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        void save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [readOnly, save]);

  const extensions = useMemo(() => {
    const base = [markdown(), EditorView.lineWrapping];
    if (readOnly) {
      base.push(EditorState.readOnly.of(true), EditorView.editable.of(false));
    }
    const surface = resolvedTheme === "dark" ? "dark" : "light";
    return [...base, ...mdViewerEditorThemeExtensions(surface)];
  }, [readOnly, resolvedTheme]);

  const displayName = formatDocPathForDisplay(relativePath);

  const layoutTabs = useMemo(
    () =>
      [
        { id: "view" as const, label: t("mdViewer.view") },
        { id: "split" as const, label: t("mdViewer.split") },
        { id: "edit" as const, label: t("mdViewer.edit") },
      ] as const,
    [t],
  );

  const renderEditor = (splitChrome: boolean) => (
    <div
      className={cn(
        "flex h-full min-h-[280px] flex-col border-zinc-200/80 bg-background dark:border-zinc-800/80",
        splitChrome && "lg:border-r",
      )}
    >
      <CodeMirror
        value={value}
        height="100%"
        theme="none"
        className="min-h-0 flex-1 overflow-auto text-sm [&_.cm-editor]:min-h-[280px] [&_.cm-editor]:h-full [&_.cm-scroller]:min-h-[280px]"
        extensions={extensions}
        onChange={readOnly ? undefined : setValue}
        editable={!readOnly}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: !readOnly,
          syntaxHighlighting: false,
        }}
      />
    </div>
  );

  const renderPreview = (splitChrome: boolean) => (
    <div
      className={cn(
        "mdviewer-preview flex h-full min-h-[280px] flex-1 flex-col overflow-auto border-transparent bg-background",
        splitChrome && "lg:border-l",
      )}
    >
      <article
        className="md-main px-3 py-3 sm:px-4 max-sm:pb-4"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: previewHtml }}
      />
    </div>
  );

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-background">
      <style dangerouslySetInnerHTML={{ __html: MDVIEWER_PREVIEW_CSS }} />

      <div
        className={cn(
          "pointer-events-none fixed left-0 top-0 z-[254] flex max-w-[min(100%,18rem)] flex-col px-[max(0.75rem,env(safe-area-inset-left))] pt-[max(0.65rem,env(safe-area-inset-top))] pr-2 max-sm:max-w-[min(100%,16rem)]",
          hideFloatingMobile && "max-sm:hidden",
        )}
        aria-label={t("mdViewer.docCardAria")}
      >
        <div
          className={cn(
            glassCard,
            "pointer-events-auto min-w-0 max-sm:max-h-[min(34vh,15.5rem)] max-sm:overflow-y-auto max-sm:overscroll-contain",
          )}
        >
          <h1 className="truncate text-[11px] font-semibold leading-snug text-zinc-900 sm:text-xs dark:text-zinc-50">
            {displayName}
          </h1>
          {readOnly ? (
            <p className="mt-1 text-[10px] font-medium text-emerald-800 dark:text-emerald-300">
              {t("publicShare.readOnlyBadge")}
            </p>
          ) : (
            <p className="mt-1 text-[10px] leading-snug text-zinc-600 dark:text-zinc-300">
              {t("common.saveShortcut")}
            </p>
          )}
          {!readOnly && busy ? (
            <p className="mt-1.5 text-[10px] font-medium text-zinc-600 dark:text-zinc-400">{t("common.saving")}</p>
          ) : !readOnly && dirty ? (
            <p className="mt-1.5 text-[10px] font-medium text-amber-800 dark:text-amber-300">
              {t("common.unsavedChanges")}
            </p>
          ) : null}
          <Link
            href={rawHref}
            className="mt-2 inline-block text-[10px] font-medium text-zinc-700 underline-offset-2 hover:underline dark:text-zinc-200"
          >
            {t("common.raw")}
          </Link>
          {shareKey && !readOnly ? (
            <div className="mt-2">
              <PublicSharePanel slug={slug} shareKey={shareKey} />
            </div>
          ) : null}
        </div>
      </div>

      {!readOnly ? (
        <div className={cn(layoutModeBarOuter, hideFloatingMobile && "max-sm:hidden")} aria-live="polite">
          <nav className={layoutModeBarInner} aria-label={t("mdViewer.layoutAria")}>
            {layoutTabs.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setLayoutMode(id)}
                className={cn(
                  "rounded-[10px] px-3 py-1.5 font-medium transition-colors",
                  layoutMode === id
                    ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-600 hover:bg-white/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100",
                )}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      ) : null}

      {!readOnly && saveToastPhase !== "hidden" ? (
        <div className={cn(saveToastOuter, hideFloatingMobile && "max-sm:hidden")} aria-live="polite">
          <div
            className={cn(
              glassCard,
              "pointer-events-none px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-lg transition-[transform,opacity] duration-[550ms] ease-out dark:text-zinc-100",
              saveToastPhase === "leaving" && "translate-x-[min(140%,24rem)] opacity-0",
            )}
          >
            {t("common.saved")}
          </div>
        </div>
      ) : null}

      {!readOnly && status ? (
        <p className="shrink-0 border-b border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {status}
        </p>
      ) : null}

      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col min-h-[calc(100svh-11rem)]",
          hideFloatingMobile ? "max-sm:min-h-[calc(100svh-0.5rem)]" : "max-sm:min-h-[calc(100svh-6rem)]",
          readOnly ? "pm-mdviewer-pad-t-readonly" : "pm-mdviewer-pad-t",
          "pm-viewer-pad-b",
        )}
      >
        {(() => {
          switch (layoutMode) {
            case "view":
              return <div className="flex min-h-0 flex-1 flex-col">{renderPreview(false)}</div>;
            case "edit":
              return <div className="flex min-h-0 flex-1 flex-col">{renderEditor(false)}</div>;
            case "split":
              return (
                <Group
                  orientation={panelDir}
                  className="flex min-h-0 flex-1 [--separator-color:theme(colors.zinc.300)] dark:[--separator-color:theme(colors.zinc.700)]"
                >
                  <Panel defaultSize="50%" minSize="25%" className="min-h-0 min-w-0">
                    {renderEditor(true)}
                  </Panel>
                  <Separator className="relative z-10 w-2 shrink-0 bg-zinc-200/80 hover:bg-zinc-400 active:bg-zinc-500 lg:w-1.5 dark:bg-zinc-700 dark:hover:bg-zinc-500" />
                  <Panel defaultSize="50%" minSize="25%" className="min-h-0 min-w-0">
                    {renderPreview(true)}
                  </Panel>
                </Group>
              );
            default: {
              const _exhaustive: never = layoutMode;
              return _exhaustive;
            }
          }
        })()}
      </div>
    </div>
  );
}
