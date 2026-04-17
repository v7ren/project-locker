"use client";

import { Share2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { normalizeShareKey, publicPathForShareKey } from "@/lib/public-share-urls";
import { useTranslations } from "@/lib/i18n/locale-provider";
import { cn } from "@/lib/utils";

type Props = {
  slug: string;
  shareKey: string;
  /** Compact trigger for tight chrome (e.g. MdViewer doc card). */
  triggerClassName?: string;
};

export function PublicSharePanel({ slug, shareKey, triggerClassName }: Props) {
  const { t } = useTranslations();
  const [open, setOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [linkPath, setLinkPath] = useState(() => publicPathForShareKey(slug, shareKey));

  const refresh = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams({ key: shareKey });
    const res = await fetch(
      `/api/projects/${encodeURIComponent(slug)}/public-share?${q.toString()}`,
    );
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const data = (await res.json()) as {
      paths?: string[];
      isPublic?: boolean;
      viewerPath?: string | null;
    };
    const paths = Array.isArray(data.paths) ? data.paths : [];
    if (typeof data.isPublic === "boolean") {
      setIsPublic(data.isPublic);
    } else {
      const nk = normalizeShareKey(shareKey);
      setIsPublic(paths.some((p) => normalizeShareKey(p) === nk));
    }
    if (typeof data.viewerPath === "string" && data.viewerPath.startsWith("/")) {
      setLinkPath(data.viewerPath);
    } else {
      setLinkPath(publicPathForShareKey(slug, shareKey));
    }
    setLoading(false);
  }, [shareKey, slug]);

  useEffect(() => {
    setLinkPath(publicPathForShareKey(slug, shareKey));
  }, [shareKey, slug]);

  useEffect(() => {
    if (open) {
      setMessage(null);
      void refresh();
    }
  }, [open, refresh]);

  const publicUrl =
    typeof window !== "undefined" ? `${window.location.origin}${linkPath}` : linkPath;

  const copyLink = useCallback(async () => {
    setMessage(null);
    try {
      await navigator.clipboard.writeText(publicUrl);
      setMessage(t("publicShare.copied"));
    } catch {
      setMessage(t("publicShare.copyFailed"));
    }
  }, [publicUrl, t]);

  const setPublic = useCallback(
    async (next: boolean) => {
      setBusy(true);
      setMessage(null);
      try {
        const res = await fetch(`/api/projects/${encodeURIComponent(slug)}/public-share`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: shareKey, public: next }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          paths?: string[];
          isPublic?: boolean;
          viewerPath?: string | null;
        };
        if (!res.ok) {
          setMessage(data.error ?? t("publicShare.toggleFailed"));
          return;
        }
        const paths = Array.isArray(data.paths) ? data.paths : [];
        const pub =
          typeof data.isPublic === "boolean"
            ? data.isPublic
            : paths.some((p) => normalizeShareKey(p) === normalizeShareKey(shareKey));
        setIsPublic(pub);
        if (typeof data.viewerPath === "string" && data.viewerPath.startsWith("/")) {
          setLinkPath(data.viewerPath);
        }
        setMessage(next ? t("publicShare.nowPublic") : t("publicShare.nowPrivate"));
      } finally {
        setBusy(false);
      }
    },
    [shareKey, slug, t],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        type="button"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-2 py-1 text-[10px] font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800",
          triggerClassName,
        )}
      >
        <Share2 className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
        {t("publicShare.shareButton")}
      </DialogTrigger>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <div className="border-b border-zinc-200 px-6 pb-4 pt-6 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle>{t("publicShare.dialogTitle")}</DialogTitle>
            <DialogDescription>{t("publicShare.dialogDescription")}</DialogDescription>
          </DialogHeader>
        </div>
        <div className="space-y-4 px-6 py-4">
          {loading ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("publicShare.loading")}</p>
          ) : isPublic ? (
            <div className="space-y-3">
              <p className="break-all rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 font-mono text-xs leading-snug text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200">
                {publicUrl}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void copyLink()}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
                >
                  {t("publicShare.copyLink")}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void setPublic(false)}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-900 hover:bg-red-100 disabled:opacity-50 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-100 dark:hover:bg-red-950/80"
                >
                  {t("publicShare.revokeButton")}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("publicShare.enableHint")}</p>
              <button
                type="button"
                disabled={busy}
                onClick={() => void setPublic(true)}
                className="w-full rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white sm:w-auto"
              >
                {t("publicShare.enableButton")}
              </button>
            </div>
          )}
          {message ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-300" role="status">
              {message}
            </p>
          ) : null}
        </div>
        <DialogFooter className="border-t border-zinc-200 bg-zinc-50/80 px-6 py-3 dark:border-zinc-800 dark:bg-zinc-900/40">
          <DialogClose asChild>
            <button
              type="button"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              {t("publicShare.closeButton")}
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
