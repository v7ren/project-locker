"use client";

import Link from "next/link";
import type { DocFileKind } from "@/lib/doc-file-kind";
import { useTranslations } from "@/lib/i18n/locale-provider";
import { pdfIframeSrc } from "@/lib/pdf-iframe-src";
import { cn } from "@/lib/utils";

type Props = {
  fileUrl: string;
  kind: DocFileKind;
  displayName: string;
  immersiveChrome?: boolean;
};

export function DocViewer({ fileUrl, kind, displayName, immersiveChrome = false }: Props) {
  const { t } = useTranslations();
  const im = immersiveChrome;

  const iframeFull = (
    <iframe
      title={displayName}
      src={fileUrl}
      referrerPolicy="strict-origin-when-cross-origin"
      className={cn(
        "w-full flex-1 border-0 bg-white dark:bg-zinc-950",
        im ? "min-h-0 h-full" : "h-full min-h-[min(70vh,560px)] max-sm:min-h-[min(38vh,280px)]",
      )}
    />
  );

  switch (kind) {
    case "pdf":
      return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white dark:bg-zinc-950">
          {/* PDF iframe min-height vs flex: absolute fill keeps layout inside the slot */}
          <div className="relative min-h-0 w-full flex-1 overflow-hidden bg-white dark:bg-zinc-950">
            <iframe
              title={displayName}
              src={pdfIframeSrc(fileUrl)}
              referrerPolicy="strict-origin-when-cross-origin"
              className="absolute inset-0 box-border h-full min-h-0 w-full border-0 bg-white dark:bg-zinc-950"
            />
          </div>
        </div>
      );
    case "image":
      return (
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col items-center justify-center",
            im ? "p-0" : "gap-3 px-3 py-6 sm:px-6",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- dynamic user-uploaded URL */}
          <img
            src={fileUrl}
            alt={displayName}
            className={cn(
              "max-w-full object-contain",
              im ? "h-full max-h-full min-h-0 w-full flex-1" : "max-h-[min(75vh,900px)] max-sm:max-h-[min(48dvh,560px)]",
            )}
          />
        </div>
      );
    case "html":
      return im ? (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white dark:bg-zinc-950">
          <iframe
            title={displayName}
            src={fileUrl}
            sandbox=""
            referrerPolicy="strict-origin-when-cross-origin"
            className="min-h-0 h-full w-full flex-1 border-0 bg-white"
          />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-2 px-3 py-3 sm:px-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("docViewer.htmlHint")}</p>
          <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-zinc-200 shadow-sm dark:border-zinc-800">
            <iframe
              title={displayName}
              src={fileUrl}
              sandbox=""
              referrerPolicy="strict-origin-when-cross-origin"
              className="h-full min-h-[min(70vh,560px)] max-sm:min-h-[min(38vh,280px)] w-full flex-1 border-0 bg-white"
            />
          </div>
        </div>
      );
    case "markdown":
      return im ? (
        <div className="min-h-0 flex-1 bg-background" aria-hidden />
      ) : (
        <p className="px-4 py-6 text-sm text-zinc-600 dark:text-zinc-400">{t("docViewer.mdHint")}</p>
      );
    case "code":
      return im ? (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white dark:bg-zinc-950">{iframeFull}</div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-2 px-3 py-3 sm:px-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("docViewer.codeHint")}</p>
          <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-zinc-200 shadow-sm dark:border-zinc-800">
            {iframeFull}
          </div>
        </div>
      );
    case "other":
      return im ? (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white dark:bg-zinc-950">
          <iframe
            title={displayName}
            src={fileUrl}
            referrerPolicy="strict-origin-when-cross-origin"
            className="min-h-0 h-full w-full flex-1 border-0 bg-white dark:bg-zinc-950"
          />
        </div>
      ) : (
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
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}
