"use client";

import { useTranslations } from "@/lib/i18n/locale-provider";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateProjectDialog() {
  const { t } = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = (await res.json()) as {
        project?: { slug: string };
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? t("createProject.error"));
        return;
      }
      if (data.project?.slug) {
        setOpen(false);
        setName("");
        router.push(`/${data.project.slug}`);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
      >
        {t("createProject.cta")}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 p-0 pt-8 sm:items-center sm:p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="max-h-[min(90dvh,calc(100svh-2rem))] w-full max-w-md overflow-y-auto rounded-t-2xl border border-zinc-200 bg-white p-5 shadow-lg sm:rounded-xl sm:p-6 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {t("createProject.title")}
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {t("createProject.subtitle", { example: "/acme-roadmap" })}
            </p>
            <form onSubmit={onSubmit} className="mt-4 space-y-3">
              <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {t("createProject.nameLabel")}
                <input
                  autoFocus
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  value={name}
                  onChange={(ev) => setName(ev.target.value)}
                  placeholder={t("createProject.placeholder")}
                  required
                />
              </label>
              {error ? (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              ) : null}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  onClick={() => setOpen(false)}
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  {loading ? t("common.creating") : t("common.create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
