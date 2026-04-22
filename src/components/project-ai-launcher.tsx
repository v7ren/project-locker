"use client";

import { MessageSquare, X } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProjectAiChat } from "@/components/project-ai-chat";
import { useTranslations } from "@/lib/i18n/locale-provider";
import { cn } from "@/lib/utils";

export function ProjectAiLauncher({
  slug,
  projectName,
}: {
  slug: string;
  projectName: string;
}) {
  const { t } = useTranslations();
  const [open, setOpen] = useState(false);

  return (
    <>
      {!open ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setOpen(true)}
          className="pointer-events-auto h-11 w-11 shrink-0 rounded-full border-zinc-300 bg-white shadow-sm hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          title={t("ai.fabTitle")}
          aria-label={t("ai.fabTitle")}
          aria-expanded={false}
        >
          <MessageSquare className="h-5 w-5 text-zinc-700 dark:text-zinc-200" aria-hidden />
        </Button>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          hideCloseButton
          overlayClassName="pm-ai-widget-overlay"
          className={cn(
            "pm-ai-widget-panel",
            "fixed left-auto top-auto flex h-[min(600px,calc(100dvh-1.25rem))] max-h-[calc(100dvh-1rem)] w-[min(100vw-1rem,400px)] translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-lg border border-zinc-200 bg-white p-0 shadow-lg outline-none dark:border-zinc-800 dark:bg-zinc-950",
            "right-[max(0.75rem,env(safe-area-inset-right))] bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[271]",
          )}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50/90 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-950">
                <MessageSquare className="h-4 w-4 text-zinc-600 dark:text-zinc-400" aria-hidden />
              </div>
              <div className="min-w-0">
                <DialogTitle className="truncate text-left text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {t("ai.panelTitle", { name: projectName })}
                </DialogTitle>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {t("ai.panelSubtitle")}
                </p>
              </div>
            </div>
            <DialogDescription className="sr-only">
              {t("ai.panelDescription")}
            </DialogDescription>
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                aria-label={t("ai.closePanel")}
              >
                <X className="h-4 w-4" aria-hidden />
              </Button>
            </DialogClose>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white dark:bg-zinc-950">
            <div className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-2">
              <ProjectAiChat slug={slug} embed />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
