"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/components/session-provider";
import { TopRightTheme } from "@/components/top-right-theme";
import { RippleButton } from "@/components/ui/ripple-button";
import { useTranslations } from "@/lib/i18n/locale-provider";

type UserPayload = {
  id: string;
  username: string;
  role: string;
  email: string | null;
  hue: number;
  avatarEmoji: string;
  hasBackupLoginKey: boolean;
};

type ProfileProps = {
  /** When false (email auth), login keys are issued by admins only — hide backup key UI. */
  showSelfManagedLoginKey: boolean;
};

export function ProfilePageClient({ showSelfManagedLoginKey }: ProfileProps) {
  const { t } = useTranslations();
  const { canTeamCalendar } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserPayload | null>(null);
  const [hue, setHue] = useState(210);
  const [avatarEmoji, setAvatarEmoji] = useState("");
  const [backupKey, setBackupKey] = useState("");
  const [backupDirty, setBackupDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [copyMsg, setCopyMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  /** Plain key from PATCH generateBackupLoginKey; shown once until dismissed. */
  const [revealedGeneratedBackup, setRevealedGeneratedBackup] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/profile", { credentials: "include" });
    const j = (await res.json().catch(() => ({}))) as { error?: string; user?: UserPayload };
    if (!res.ok) throw new Error(j.error ?? res.statusText);
    if (!j.user) throw new Error("No profile");
    setUser(j.user);
    setHue(j.user.hue);
    setAvatarEmoji(j.user.avatarEmoji);
    setBackupKey("");
    setBackupDirty(false);
  }, []);

  useEffect(() => {
    void load().catch((e) => setError(e instanceof Error ? e.message : "?"));
  }, [load]);

  const save = async () => {
    setBusy(true);
    setError(null);
    setOkMsg(null);
    try {
      const body: Record<string, unknown> = { hue, avatarEmoji };
      if (backupDirty) {
        body.backupLoginKey = backupKey.trim() === "" ? null : backupKey;
      }
      const res = await fetch("/api/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? res.statusText);
      setOkMsg(t("common.saved"));
      await load();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "?");
    } finally {
      setBusy(false);
    }
  };

  const generateBackupKey = async () => {
    setBusy(true);
    setError(null);
    setOkMsg(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generateBackupLoginKey: true }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        error?: string;
        generatedBackupLoginKey?: string;
      };
      if (!res.ok) throw new Error(j.error ?? res.statusText);
      if (typeof j.generatedBackupLoginKey === "string" && j.generatedBackupLoginKey.length > 0) {
        setRevealedGeneratedBackup(j.generatedBackupLoginKey);
      }
      setOkMsg(t("profile.generateBackupKeyDone"));
      await load();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "?");
    } finally {
      setBusy(false);
    }
  };

  if (!user) {
    return (
      <div className="px-4 py-14">
        <TopRightTheme />
        <p className="text-sm text-zinc-600">{error ?? "…"}</p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex min-h-full w-full min-w-0 max-w-lg flex-col gap-6 px-4 py-10 pb-28 sm:px-6">
      <TopRightTheme />
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/" className="font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400">
            {t("teamCal.backProjects")}
          </Link>
          {canTeamCalendar ? (
            <Link
              href="/calendar"
              className="font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
            >
              {t("teamAdmin.backCalendar")}
            </Link>
          ) : null}
        </div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{t("profile.title")}</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("profile.subtitle")}</p>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900/50">
          <div className="font-medium text-zinc-800 dark:text-zinc-200">{t("profile.teamUsername")}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300">{user.username}</span>
            <RippleButton
              rippleColor="rgb(82 82 91 / 0.35)"
              duration="550ms"
              className="rounded-md border border-zinc-300 bg-zinc-50/80 px-2 py-0.5 text-xs font-medium text-zinc-800 shadow-sm hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900/50 dark:text-zinc-200 dark:hover:bg-zinc-800/80"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(user.username);
                  setCopyMsg(t("profile.copiedUsername"));
                  setTimeout(() => setCopyMsg(null), 2000);
                } catch {
                  setCopyMsg(null);
                }
              }}
            >
              {t("profile.copyUsername")}
            </RippleButton>
            {copyMsg ? <span className="text-xs text-emerald-700 dark:text-emerald-400">{copyMsg}</span> : null}
          </div>
          <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">{t("profile.teamUsernameHelp")}</p>
        </div>
        <p className="text-xs text-zinc-500">
          {user.role}
          {user.email ? ` · ${user.email}` : ""}
        </p>
      </header>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      {okMsg ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status">
          {okMsg}
        </p>
      ) : null}

      {showSelfManagedLoginKey && revealedGeneratedBackup ? (
        <div
          className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950/40"
          role="status"
        >
          <p className="font-medium text-amber-950 dark:text-amber-100">{t("profile.generatedBackupWarn")}</p>
          <pre className="mt-2 max-h-32 overflow-auto rounded border border-amber-200/80 bg-white/80 p-2 font-mono text-xs break-all text-zinc-900 dark:border-amber-900/50 dark:bg-zinc-950 dark:text-zinc-100">
            {revealedGeneratedBackup}
          </pre>
          <div className="mt-3 flex flex-wrap gap-2">
            <RippleButton
              rippleColor="rgb(251 191 36 / 0.45)"
              duration="550ms"
              className="rounded-md border border-amber-400/80 bg-amber-50/80 px-2 py-1 text-xs font-medium text-amber-950 shadow-sm hover:bg-amber-100/90 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-100 dark:hover:bg-amber-900/40"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(revealedGeneratedBackup);
                  setCopyMsg(t("profile.copiedGeneratedBackup"));
                  setTimeout(() => setCopyMsg(null), 2000);
                } catch {
                  setCopyMsg(null);
                }
              }}
            >
              {t("profile.copyGeneratedBackup")}
            </RippleButton>
            <button
              type="button"
              className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium dark:border-zinc-600"
              onClick={() => setRevealedGeneratedBackup(null)}
            >
              {t("profile.dismissGeneratedBackup")}
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">{t("profile.hue")}</span>
          <input
            type="range"
            min={0}
            max={359}
            value={hue}
            onChange={(e) => setHue(Number.parseInt(e.target.value, 10))}
            className="w-full"
          />
          <span className="font-mono text-xs text-zinc-500">{hue}</span>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">{t("profile.avatar")}</span>
          <input
            value={avatarEmoji}
            onChange={(e) => setAvatarEmoji(e.target.value.slice(0, 8))}
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        {showSelfManagedLoginKey ? (
          <div className="flex flex-col gap-1 text-sm">
            <span className="font-medium">{t("profile.backupKey")}</span>
            <input
              type="password"
              autoComplete="new-password"
              value={backupKey}
              onInput={() => setBackupDirty(true)}
              onChange={(e) => {
                setBackupKey(e.target.value);
                setBackupDirty(true);
              }}
              placeholder={user.hasBackupLoginKey ? "••••••••" : ""}
              className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <span className="text-xs text-zinc-500">{t("profile.backupHint")}</span>
            <button
              type="button"
              disabled={busy}
              onClick={() => void generateBackupKey()}
              className="mt-1 w-fit rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium dark:border-zinc-600"
            >
              {t("profile.generateBackupKeyBtn")}
            </button>
          </div>
        ) : (
          <p className="text-xs text-zinc-500">{t("profile.emailModeKeyHint")}</p>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => void save()}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          {busy ? t("common.saving") : t("profile.save")}
        </button>
      </div>
    </div>
  );
}
