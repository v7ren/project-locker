"use client";

import Link from "next/link";
import type { DocFileKind } from "@/lib/doc-file-kind";
import { useTranslations } from "@/lib/i18n/locale-provider";

type Props = {
  fileUrl: string;
  kind: DocFileKind;
  displayName: string;
};

export function DocViewer({ fileUrl, kind, displayName }: Props) {
  const { t } = useTranslations();
  const commonIframe = (
    <iframe
      title={displayName}
      src={fileUrl}
      className="h-full min-h-[min(70vh,560px)] max-sm:min-h-[min(38vh,280px)] w-full flex-1 border-0 bg-white dark:bg-zinc-950"
    />
  );

  switch (kind) {
    case "pdf":
      return (
        <div className="flex min-h-0 flex-1 flex-col gap-2 px-3 py-3 sm:px-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("docViewer.pdfHint")}</p>
          <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-zinc-200 shadow-sm dark:border-zinc-800">
            {commonIframe}
          </div>
        </div>
      );
    case "image":
      return (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-3 py-6 sm:px-6">
          {/* eslint-disable-next-line @next/next/no-img-element -- dynamic user-uploaded URL */}
          <img
            src={fileUrl}
            alt={displayName}
            className="max-h-[min(75vh,900px)] max-w-full object-contain max-sm:max-h-[min(48dvh,560px)]"
          />
        </div>
      );
    case "html":
      return (
        <div className="flex min-h-0 flex-1 flex-col gap-2 px-3 py-3 sm:px-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("docViewer.htmlHint")}</p>
          <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-zinc-200 shadow-sm dark:border-zinc-800">
            <iframe
              title={displayName}
              src={fileUrl}
              sandbox=""
              className="h-full min-h-[min(70vh,560px)] max-sm:min-h-[min(38vh,280px)] w-full flex-1 border-0 bg-white"
            />
          </div>
        </div>
      );
    case "markdown":
      return (
        <p className="px-4 py-6 text-sm text-zinc-600 dark:text-zinc-400">{t("docViewer.mdHint")}</p>
      );
    case "code":
      return (
        <div className="flex min-h-0 flex-1 flex-col gap-2 px-3 py-3 sm:px-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("docViewer.codeHint")}</p>
          <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-zinc-200 shadow-sm dark:border-zinc-800">
            {commonIframe}
          </div>
        </div>
      );
    case "other":
      return (
        <div className="flex flex-col items-start gap-3 px-4 py-8 sm:px-6">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("docViewer.otherHint")}</p>
          <Link
            href={fileUrl}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            {t("docViewer.openFile")}
          </Link>
        </div>
      );
  }
}
