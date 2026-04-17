"use client";

import { useTranslations } from "@/lib/i18n/locale-provider";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { slug: string };

export function ProjectHomeUpload({ slug }: Props) {
  const { t } = useTranslations();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch(`/api/projects/${slug}/home`, {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; savedAs?: string };
      if (!res.ok) {
        setMessage(data.error ?? t("upload.failed"));
        return;
      }
      setMessage(t("upload.savedAs", { name: data.savedAs ?? "file" }));
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-w-0 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm sm:p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
      <p className="font-medium text-zinc-900 dark:text-zinc-50">{t("upload.replaceTitle")}</p>
      <p className="mt-1 text-pretty text-zinc-600 dark:text-zinc-400">{t("upload.replaceDesc")}</p>
      <label className="mt-3 flex w-full min-w-0 cursor-pointer flex-wrap items-center gap-2 rounded-lg bg-white px-3 py-2.5 text-sm font-medium text-zinc-900 shadow-sm ring-1 ring-zinc-200 hover:bg-zinc-50 sm:inline-flex sm:w-auto dark:bg-zinc-950 dark:text-zinc-50 dark:ring-zinc-800 dark:hover:bg-zinc-900">
        <input
          type="file"
          accept=".html,.htm,.tsx,.jsx"
          className="hidden"
          disabled={busy}
          onChange={onChange}
        />
        {busy ? t("upload.uploading") : t("upload.choose")}
      </label>
      {message ? (
        <p className="mt-2 text-xs text-zinc-700 dark:text-zinc-300">{message}</p>
      ) : null}
    </div>
  );
}
