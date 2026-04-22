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

type AuthMode = "none" | "email" | "username";

type Props = {
  authMode: AuthMode;
  nextPath: string;
  devHints?: string[];
};

export function LoginPageClient({ authMode, nextPath, devHints }: Props) {
  const { t } = useTranslations();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameTab, setUsernameTab] = useState<"register" | "login">("register");
  const [username, setUsername] = useState("");
  const [backupKey, setBackupKey] = useState("");
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteSecret, setInviteSecret] = useState("");
  const [adminAccessUser, setAdminAccessUser] = useState("");
  const [adminAccessKey, setAdminAccessKey] = useState("");
  /** Team username or account email (same as backup-login API `identifier`). */
  const [backupIdentifier, setBackupIdentifier] = useState("");
  /** Email mode: single access key from admin after approval. */
  const [memberAccessKey, setMemberAccessKey] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerOk, setRegisterOk] = useState<string | null>(null);

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

  const usernameAuth = useCallback(
    async (path: "register" | "login") => {
      setError(null);
      setBusy(true);
      try {
        const body: Record<string, string> = { username: username.trim() };
        if (path === "login" && backupKey.trim()) {
          body.key = backupKey.trim();
        }
        const res = await fetch(`/api/auth/username/${path}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          retryAfterSec?: number;
        };
        if (!res.ok) {
          if (res.status === 429 && typeof data.retryAfterSec === "number") {
            setError(t("login.rateLimited", { sec: data.retryAfterSec }));
          } else {
            setError(data.error ?? t("login.genericError"));
          }
          return;
        }
        router.replace(nextPath);
        router.refresh();
      } finally {
        setBusy(false);
      }
    },
    [backupKey, nextPath, router, t, username],
  );

  const redeemInvite = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/invite/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: inviteUsername.trim(),
          inviteKey: inviteSecret.trim(),
        }),
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
  }, [inviteSecret, inviteUsername, nextPath, router, t]);

  const backupLogin = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/backup-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier: backupIdentifier.trim(), key: backupKey.trim() }),
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
  }, [backupIdentifier, backupKey, nextPath, router, t]);

  const adminAccessLogin = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/admin-access-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: adminAccessUser.trim(),
          adminKey: adminAccessKey.trim(),
        }),
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
  }, [adminAccessKey, adminAccessUser, nextPath, router, t]);

  const memberKeyLogin = useCallback(async () => {
    setError(null);
    setRegisterOk(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/key-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ key: memberAccessKey.trim() }),
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
  }, [memberAccessKey, nextPath, router, t]);

  const registerRequest = useCallback(async () => {
    setError(null);
    setRegisterOk(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/register-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: registerUsername.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!res.ok) {
        setError(data.error ?? t("login.genericError"));
        return;
      }
      setRegisterOk(data.message ?? t("login.registerRequestOk"));
      setRegisterUsername("");
    } finally {
      setBusy(false);
    }
  }, [registerUsername, t]);

  const subtitle =
    authMode === "email"
      ? t("login.subtitle")
      : authMode === "username"
        ? t("login.subtitleUsername")
        : t("login.openModeIntro");

  return (
    <div className="relative mx-auto flex min-h-full w-full min-w-0 max-w-md flex-col gap-6 px-4 py-14 pb-28 sm:px-6">
      <TopRightTheme />
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {authMode === "none" ? t("login.openModeTitle") : t("login.title")}
        </h1>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">{subtitle}</p>
        {authMode === "email" ? (
          <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs leading-5 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300">
            {t("login.emailOtpBackupHint")}
          </p>
        ) : null}
      </header>

      {authMode === "none" ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
          {devHints && devHints.length > 0 ? (
            <div>
              <p className="font-medium text-amber-950 dark:text-amber-50">{t("login.hintsHeading")}</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-amber-900/90 dark:text-amber-100/90">
                {devHints.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p>{t("login.openModeIntro")}</p>
          )}
          <Link
            href="/"
            className="mt-3 inline-block text-sm font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-50"
          >
            {t("login.backHome")}
          </Link>
        </div>
      ) : authMode === "username" ? (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 rounded-lg border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-900">
            <button
              type="button"
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                usernameTab === "register"
                  ? "bg-white text-zinc-900 shadow dark:bg-zinc-950 dark:text-zinc-50"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
              onClick={() => setUsernameTab("register")}
            >
              {t("login.tabRegister")}
            </button>
            <button
              type="button"
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                usernameTab === "login"
                  ? "bg-white text-zinc-900 shadow dark:bg-zinc-950 dark:text-zinc-50"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
              onClick={() => setUsernameTab("login")}
            >
              {t("login.tabLogin")}
            </button>
          </div>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void usernameAuth(usernameTab === "register" ? "register" : "login");
            }}
          >
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-zinc-800 dark:text-zinc-200">{t("login.usernameLabel")}</span>
              <input
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("login.usernamePlaceholder")}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none ring-zinc-400/40 focus:border-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500"
              />
            </label>
            {usernameTab === "login" ? (
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{t("login.backupKeyOptional")}</span>
                <input
                  type="password"
                  autoComplete="off"
                  value={backupKey}
                  onChange={(e) => setBackupKey(e.target.value)}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none ring-zinc-400/40 focus:border-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500"
                />
              </label>
            ) : null}
            {error ? (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={busy || !username.trim()}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              {busy
                ? t("login.verifying")
                : usernameTab === "register"
                  ? t("login.submitRegister")
                  : t("login.submitLogin")}
            </button>
          </form>
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
          >
            {t("login.backHome")}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{t("login.adminOtpHeading")}</h2>
            {step === "email" ? (
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
          </section>

          <section className="space-y-2 border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{t("login.memberKeyHeading")}</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("login.memberKeyBody")}</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <input
                type="password"
                autoComplete="off"
                value={memberAccessKey}
                onChange={(e) => setMemberAccessKey(e.target.value)}
                placeholder={t("login.memberKeyPlaceholder")}
                className="min-w-[8rem] flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
              <button
                type="button"
                disabled={busy || !memberAccessKey.trim()}
                onClick={() => void memberKeyLogin()}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                {t("login.memberKeySubmit")}
              </button>
            </div>
          </section>

          <section className="space-y-2 border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{t("login.registerRequestHeading")}</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("login.registerRequestBody")}</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <input
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
                placeholder={t("login.usernamePlaceholder")}
                autoComplete="username"
                className="min-w-[8rem] flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
              <button
                type="button"
                disabled={busy || !registerUsername.trim()}
                onClick={() => void registerRequest()}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-700"
              >
                {t("login.registerRequestSubmit")}
              </button>
            </div>
            {registerOk ? (
              <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status">
                {registerOk}
              </p>
            ) : null}
          </section>
        </div>
      )}
      {authMode === "username" ? (
        <div className="mt-2 space-y-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{t("login.inviteHeading")}</h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <input
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
                placeholder={t("login.inviteUsername")}
                className="min-w-[8rem] flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
              <input
                value={inviteSecret}
                onChange={(e) => setInviteSecret(e.target.value)}
                placeholder={t("login.inviteKey")}
                className="min-w-[8rem] flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
              <button
                type="button"
                disabled={busy || !inviteUsername.trim() || !inviteSecret.trim()}
                onClick={() => void redeemInvite()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {t("login.inviteSubmit")}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{t("login.backupFlowTitle")}</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("login.backupFlowBody")}</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <input
                value={backupIdentifier}
                onChange={(e) => setBackupIdentifier(e.target.value)}
                placeholder={t("login.backupIdentifierPlaceholder")}
                autoComplete="username"
                className="min-w-[8rem] flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
              <input
                type="password"
                value={backupKey}
                onChange={(e) => setBackupKey(e.target.value)}
                placeholder={t("profile.backupKey")}
                autoComplete="current-password"
                className="min-w-[8rem] flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
              <button
                type="button"
                disabled={busy || !backupIdentifier.trim() || !backupKey.trim()}
                onClick={() => void backupLogin()}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-700"
              >
                {t("login.backupSubmit")}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{t("login.adminAccessHeading")}</h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <input
                value={adminAccessUser}
                onChange={(e) => setAdminAccessUser(e.target.value)}
                placeholder={t("login.adminAccessUser")}
                className="min-w-[8rem] flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
              <input
                type="password"
                value={adminAccessKey}
                onChange={(e) => setAdminAccessKey(e.target.value)}
                placeholder={t("login.adminAccessKey")}
                className="min-w-[8rem] flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
              <button
                type="button"
                disabled={busy || !adminAccessUser.trim() || !adminAccessKey.trim()}
                onClick={() => void adminAccessLogin()}
                className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-200 dark:text-zinc-900"
              >
                {t("login.adminAccessSubmit")}
              </button>
            </div>
          </div>
        </div>
      ) : authMode === "email" ? (
        <div className="mt-2 space-y-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{t("login.adminAccessHeading")}</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("login.adminAccessEmailHint")}</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <input
                value={adminAccessUser}
                onChange={(e) => setAdminAccessUser(e.target.value)}
                placeholder={t("login.adminAccessUser")}
                className="min-w-[8rem] flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
              <input
                type="password"
                value={adminAccessKey}
                onChange={(e) => setAdminAccessKey(e.target.value)}
                placeholder={t("login.adminAccessKey")}
                className="min-w-[8rem] flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
              <button
                type="button"
                disabled={busy || !adminAccessUser.trim() || !adminAccessKey.trim()}
                onClick={() => void adminAccessLogin()}
                className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-200 dark:text-zinc-900"
              >
                {t("login.adminAccessSubmit")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
