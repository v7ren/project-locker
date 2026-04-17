"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  documentViewerHref,
  formatDocPathForDisplay,
  markdownWorkspaceHref,
  publicDocHref,
} from "@/lib/doc-paths";
import { useTranslations } from "@/lib/i18n/locale-provider";

type Props = { slug: string; files: string[] };

function normalizeRelPath(p: string): string {
  return p.trim().replace(/^\/+/, "").replace(/\\/g, "/");
}

export function DocsWorkspace({ slug, files: initial }: Props) {
  const { t } = useTranslations();
  const router = useRouter();
  const [files, setFiles] = useState(initial);
  const [pasteName, setPasteName] = useState("summary.md");
  const [pasteBody, setPasteBody] = useState("# Notes\n\n");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");

  const sorted = useMemo(() => [...files].sort(), [files]);

  async function uploadFile(input: HTMLInputElement) {
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    setBusy(true);
    setStatus(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch(`/api/projects/${slug}/docs`, {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; path?: string };
      if (!res.ok) {
        setStatus(data.error ?? t("docsWs.uploadFailed"));
        return;
      }
      if (data.path) {
        setFiles((prev) => Array.from(new Set([...prev, data.path as string])));
      }
      setStatus(t("docsWs.statusUploaded", { path: data.path ?? file.name }));
    } finally {
      setBusy(false);
    }
  }

  async function removePath(relative: string) {
    if (
      !window.confirm(t("docsWs.confirmDelete", { path: formatDocPathForDisplay(relative) }))
    ) {
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/projects/${slug}/docs`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path: relative }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setStatus(data.error ?? t("docsWs.deleteFailed"));
        return;
      }
      setFiles((prev) => prev.filter((p) => p !== relative));
      if (editingPath === relative) {
        setEditingPath(null);
        setRenameDraft("");
      }
      setStatus(t("docsWs.statusDeleted", { path: formatDocPathForDisplay(relative) }));
    } finally {
      setBusy(false);
    }
  }

  async function pasteMarkdown(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/projects/${slug}/docs`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ filename: pasteName, content: pasteBody }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; path?: string };
      if (!res.ok) {
        setStatus(data.error ?? t("docsWs.saveFailed"));
        return;
      }
      if (data.path) {
        setFiles((prev) => Array.from(new Set([...prev, data.path as string])));
      }
      setStatus(t("docsWs.statusSavedMd", { path: data.path ?? pasteName }));
    } finally {
      setBusy(false);
    }
  }

  function startRename(rel: string) {
    setEditingPath(rel);
    setRenameDraft(rel);
    setStatus(null);
  }

  function cancelRename() {
    setEditingPath(null);
    setRenameDraft("");
  }

  async function commitRename(from: string) {
    const to = normalizeRelPath(renameDraft);
    if (!to) {
      setStatus(t("docsWs.pathEmpty"));
      return;
    }
    if (to === from) {
      cancelRename();
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/projects/${slug}/docs`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ from, to }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        to?: string;
      };
      if (!res.ok) {
        setStatus(data.error ?? t("docsWs.renameFailed"));
        return;
      }
      const newPath = typeof data.to === "string" ? data.to : to;
      setFiles((prev) =>
        [...new Set([...prev.filter((p) => p !== from), newPath])].sort(),
      );
      setStatus(t("docsWs.statusRenamed", { path: formatDocPathForDisplay(newPath) }));
      cancelRename();
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-6 sm:gap-8">
      <section className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
        <form
          onSubmit={pasteMarkdown}
          className="flex min-w-0 flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {t("docsWs.pasteTitle")}
          </h2>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {t("docsWs.pathLabel")}
            <input
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={pasteName}
              onChange={(ev) => setPasteName(ev.target.value)}
              placeholder={t("docsWs.pathPlaceholder")}
              required
            />
          </label>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {t("docsWs.contentLabel")}
            <textarea
              className="mt-1 min-h-40 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-xs leading-relaxed dark:border-zinc-700 dark:bg-zinc-900"
              value={pasteBody}
              onChange={(ev) => setPasteBody(ev.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="self-start rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {busy ? t("docsWs.saving") : t("docsWs.saveMd")}
          </button>
        </form>

        <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {t("docsWs.uploadTitle")}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {t("docsWs.uploadDesc", { path: `/${slug}/docs/…` })}
          </p>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:text-zinc-50 dark:ring-zinc-800">
            <input
              type="file"
              className="hidden"
              disabled={busy}
              onChange={(e) => void uploadFile(e.target)}
            />
            {busy ? t("docsWs.working") : t("docsWs.chooseFile")}
          </label>
          <button
            type="button"
            className="self-start text-xs text-zinc-600 underline dark:text-zinc-400"
            onClick={() => router.refresh()}
          >
            {t("docsWs.reloadList")}
          </button>
        </div>
      </section>

      {status ? (
        <p className="text-sm text-zinc-700 dark:text-zinc-300">{status}</p>
      ) : null}

      <section>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {t("docsWs.publishedTitle")}
        </h2>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          {t("docsWs.publishedHelp", {
            raw: "?raw=1",
            docs: "/docs/",
            edit: t("docsWs.editPath"),
            docsFolder: "docs/",
          })}
        </p>
        {sorted.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">{t("docsWs.noFiles")}</p>
        ) : (
          <ul className="mt-4 divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
            {sorted.map((f) => {
              const isMd =
                f.toLowerCase().endsWith(".md") ||
                f.toLowerCase().endsWith(".markdown");
              const openHref = isMd
                ? markdownWorkspaceHref(slug, f)
                : documentViewerHref(slug, f);
              const rawHref = `${publicDocHref(slug, f)}?raw=1`;
              const display = formatDocPathForDisplay(f);
              const isEditing = editingPath === f;

              return (
                <li
                  key={f}
                  className="flex min-w-0 flex-col gap-3 px-3 py-3 sm:flex-row sm:items-start sm:justify-between sm:px-4"
                >
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                        <label className="min-w-0 flex-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                          {t("docsWs.pathUnderDocs")}
                          <input
                            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                            value={renameDraft}
                            onChange={(ev) => setRenameDraft(ev.target.value)}
                            disabled={busy}
                            autoFocus
                            onKeyDown={(ev) => {
                              if (ev.key === "Enter") {
                                ev.preventDefault();
                                void commitRename(f);
                              }
                              if (ev.key === "Escape") cancelRename();
                            }}
                          />
                        </label>
                        <div className="flex shrink-0 flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void commitRename(f)}
                            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
                          >
                            {t("docsWs.save")}
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={cancelRename}
                            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 dark:border-zinc-600 dark:text-zinc-200"
                          >
                            {t("common.cancel")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={openHref}
                        prefetch={false}
                        className="group block min-w-0 rounded-lg text-zinc-900 outline-none ring-zinc-400 focus-visible:ring-2 dark:text-zinc-50"
                      >
                        <span className="text-pretty text-sm font-medium leading-snug underline decoration-zinc-300 underline-offset-2 group-hover:decoration-zinc-500 dark:decoration-zinc-600">
                          {display}
                        </span>
                        <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                          {isMd ? t("docsWs.openMd") : t("docsWs.openViewer")}
                        </span>
                      </Link>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 text-xs">
                    {isMd && !isEditing ? (
                      <Link
                        href={rawHref}
                        prefetch={false}
                        className="rounded-md border border-zinc-200 px-2 py-1 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                      >
                        {t("docsWs.rawMd")}
                      </Link>
                    ) : null}
                    {!isEditing ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => startRename(f)}
                        className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                      >
                        {t("docsWs.editPath")}
                      </button>
                    ) : null}
                    {!isEditing ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void removePath(f)}
                        className="rounded-md border border-red-200 bg-white px-2 py-1 text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/60 dark:bg-zinc-950 dark:text-red-400 dark:hover:bg-red-950/40"
                      >
                        {t("docsWs.delete")}
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
