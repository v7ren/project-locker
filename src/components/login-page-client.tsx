"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { TopRightTheme } from "@/components/top-right-theme";
import type { OtpResendHintCode } from "@/lib/auth/resend-hint";
import type { MessageKey } from "@/lib/i18n/messages";
import { useTranslations } from "@/lib/i18n/locale-provider";

function resendHintMessageKey(code: OtpResendHintCode): MessageKey {
  switch (code) {
    case "resend_testing":
      return "login.resendHintTesting";
    case "resend_from":
      return "login.resendHintFrom";
    case "resend_unknown":
      return "login.resendHintUnknown";
    default: {
      const _exhaustive: never = code;
      return _exhaustive;
    }
  }
}

type Props = {
  authConfigured: boolean;
  nextPath: string;
  setupIssues?: string[];
};

export function LoginPageClient({ authConfigured, nextPath, setupIssues }: Props) {
  const { t } = useTranslations();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCode = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        retryAfterSec?: number;
        detail?: string;
        hintCode?: OtpResendHintCode;
      };
      if (!res.ok) {
        if (res.status === 429 && typeof data.retryAfterSec === "number") {
          setError(t("login.rateLimited", { sec: data.retryAfterSec }));
        } else {
          const parts: string[] = [];
          parts.push(data.error ?? t("login.genericError"));
          if (data.hintCode) {
            parts.push(t(resendHintMessageKey(data.hintCode)));
          }
          if (typeof data.detail === "string" && data.detail.length > 0) {
            parts.push(data.detail);
          }
          setError(parts.join("\n\n"));
        }
        return;
      }
      setStep("code");
    } finally {
      setBusy(false);
    }
  }, [email, t]);

  const verify = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? t("login.genericError"));
        return;
      }
      router.replace(nextPath);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }, [code, nextPath, router, t]);

  return (
    <div className="relative mx-auto flex min-h-full w-full min-w-0 max-w-md flex-col gap-6 px-4 py-14 pb-28 sm:px-6">
      <TopRightTheme />
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t("login.title")}
        </h1>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">{t("login.subtitle")}</p>
      </header>

      {!authConfigured ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
          <p>{t("login.notConfigured")}</p>
          {setupIssues && setupIssues.length > 0 ? (
            <div className="mt-4 border-t border-amber-200/80 pt-3 dark:border-amber-800/60">
              <p className="font-medium text-amber-950 dark:text-amber-50">{t("login.devChecklist")}</p>
              <ul className="mt-2 list-inside list-disc space-y-1 font-mono text-xs text-amber-900/90 dark:text-amber-100/90">
                {setupIssues.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <Link
            href="/"
            className="mt-3 inline-block text-sm font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-50"
          >
            {t("login.backHome")}
          </Link>
        </div>
      ) : step === "email" ? (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void sendCode();
          }}
        >
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-zinc-800 dark:text-zinc-200">{t("login.emailLabel")}</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("login.emailPlaceholder")}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none ring-zinc-400/40 focus:border-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500"
            />
          </label>
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            {busy ? t("login.sending") : t("login.sendCode")}
          </button>
        </form>
      ) : (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void verify();
          }}
        >
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("login.sentHint", { email })}</p>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-zinc-800 dark:text-zinc-200">{t("login.codeLabel")}</span>
            <input
              inputMode="numeric"
              pattern="\d*"
              maxLength={6}
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder={t("login.codePlaceholder")}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-lg tracking-widest text-zinc-900 shadow-sm outline-none ring-zinc-400/40 focus:border-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500"
            />
          </label>
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={busy || code.length !== 6}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              {busy ? t("login.verifying") : t("login.verify")}
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900/60"
              onClick={() => {
                setStep("email");
                setCode("");
                setError(null);
              }}
            >
              {t("login.backToEmail")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
