"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { TopRightTheme } from "@/components/top-right-theme";
import { RippleButton } from "@/components/ui/ripple-button";
import { useTranslations } from "@/lib/i18n/locale-provider";

type TeamUserRow = {
  id: string;
  username: string;
  role: string;
  effectiveRole: string;
  email: string | null;
  memberStatus: string;
  hasLoginKey: boolean;
};

type KeyRow = {
  id: string;
  kind: string;
  label: string;
  createdAt: string;
  expiresAt: string | null;
  maxUses: number | null;
  uses: number;
  assignRole: string;
  redeemEffect: string;
};

function randomAccessKey(): string {
  const a = new Uint8Array(24);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function TeamAdminDashboard() {
  const { t } = useTranslations();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<TeamUserRow[]>([]);
  const [keys, setKeys] = useState<KeyRow[]>([]);
  const [busy, setBusy] = useState(false);

  const [newUsername, setNewUsername] = useState("");
  const [newRole, setNewRole] = useState<"member" | "viewer">("member");

  const [keyKind, setKeyKind] = useState<"invite" | "redeem">("invite");
  const [keyLabel, setKeyLabel] = useState("");
  const [keyInviteRole, setKeyInviteRole] = useState<"member" | "viewer">("member");
  const [keyExpires, setKeyExpires] = useState("");
  const [keyMaxUses, setKeyMaxUses] = useState("");
  const [lastSecret, setLastSecret] = useState<string | null>(null);
  const [secretCopyMsg, setSecretCopyMsg] = useState<string | null>(null);

  const [redeemLocal, setRedeemLocal] = useState("");

  const [impUser, setImpUser] = useState("");
  const [impKey, setImpKey] = useState("");

  const load = useCallback(async () => {
    setError(null);
    const [uRes, kRes] = await Promise.all([
      fetch("/api/team/users", { credentials: "include" }),
      fetch("/api/team/keys", { credentials: "include" }),
    ]);
    if (!uRes.ok) {
      const j = (await uRes.json().catch(() => ({}))) as { error?: string };
      throw new Error(j.error ?? uRes.statusText);
    }
    if (!kRes.ok) {
      const j = (await kRes.json().catch(() => ({}))) as { error?: string };
      throw new Error(j.error ?? kRes.statusText);
    }
    const uData = (await uRes.json()) as { users: TeamUserRow[] };
    const kData = (await kRes.json()) as { keys: KeyRow[] };
    setUsers(uData.users);
    setKeys(kData.keys);
  }, []);

  useEffect(() => {
    void load().catch((e) => setError(e instanceof Error ? e.message : "?"));
  }, [load]);

  const saveRole = async (id: string, role: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/team/users/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? res.statusText);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "?");
    } finally {
      setBusy(false);
    }
  };

  const setAccessKey = async (id: string, plain: string | null, clear?: boolean) => {
    setBusy(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {};
      if (clear) body.clearAdminAccessKey = true;
      else if (plain !== null) body.newAdminAccessKey = plain;
      const res = await fetch(`/api/team/users/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string; revealedAdminKey?: string | null };
      if (!res.ok) throw new Error(j.error ?? res.statusText);
      if (j.revealedAdminKey) {
        setLastSecret(`admin:${j.revealedAdminKey}`);
      } else {
        setLastSecret(null);
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "?");
    } finally {
      setBusy(false);
    }
  };

  const createUser = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/team/users", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername.trim(), role: newRole }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string; revealedMemberLoginKey?: string };
      if (!res.ok) throw new Error(j.error ?? res.statusText);
      if (typeof j.revealedMemberLoginKey === "string" && j.revealedMemberLoginKey.length > 0) {
        setLastSecret(`member:${j.revealedMemberLoginKey}`);
      }
      setNewUsername("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "?");
    } finally {
      setBusy(false);
    }
  };

  const approveUser = async (id: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/team/users/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approve: true }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string; revealedMemberLoginKey?: string };
      if (!res.ok) throw new Error(j.error ?? res.statusText);
      if (typeof j.revealedMemberLoginKey === "string") {
        setLastSecret(`member:${j.revealedMemberLoginKey}`);
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "?");
    } finally {
      setBusy(false);
    }
  };

  const newMemberAccessKey = async (id: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/team/users/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regenerateMemberLoginKey: true }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string; revealedMemberLoginKey?: string };
      if (!res.ok) throw new Error(j.error ?? res.statusText);
      if (typeof j.revealedMemberLoginKey === "string") {
        setLastSecret(`member:${j.revealedMemberLoginKey}`);
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "?");
    } finally {
      setBusy(false);
    }
  };

  const createKey = async () => {
    setBusy(true);
    setError(null);
    try {
      const expMs = keyExpires.trim() === "" ? NaN : Date.parse(keyExpires);
      const expiresAt = Number.isFinite(expMs) ? new Date(expMs).toISOString() : null;
      const maxUsesRaw = keyMaxUses.trim() === "" ? null : Number.parseInt(keyMaxUses, 10);
      const maxUses =
        maxUsesRaw !== null && Number.isFinite(maxUsesRaw) && maxUsesRaw >= 1 ? maxUsesRaw : null;
      const res = await fetch("/api/team/keys", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: keyKind,
          label: keyLabel.trim() || "key",
          assignRole: keyKind === "invite" ? keyInviteRole : "member",
          redeemEffect: "promote_to_member",
          expiresAt,
          maxUses,
        }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string; secret?: string };
      if (!res.ok) throw new Error(j.error ?? res.statusText);
      if (typeof j.secret === "string") {
        setLastSecret(`${keyKind}:${j.secret}`);
      }
      setKeyLabel("");
      setKeyExpires("");
      setKeyMaxUses("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "?");
    } finally {
      setBusy(false);
    }
  };

  const deleteKey = async (id: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/team/keys/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? res.statusText);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "?");
    } finally {
      setBusy(false);
    }
  };

  const applyRedeem = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/redeem", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redeemKey: redeemLocal.trim() }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? res.statusText);
      setRedeemLocal("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "?");
    } finally {
      setBusy(false);
    }
  };

  const adminAccessLogin = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/admin-access-login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: impUser.trim(), adminKey: impKey.trim() }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? res.statusText);
      router.replace("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "?");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative mx-auto flex min-h-full w-full min-w-0 max-w-3xl flex-col gap-8 px-4 py-10 pb-28 sm:px-6">
      <TopRightTheme />
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/" className="font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400">
            {t("teamCal.backProjects")}
          </Link>
          <Link
            href="/calendar"
            className="font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
          >
            {t("teamAdmin.backCalendar")}
          </Link>
          <Link
            href="/profile"
            className="font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
          >
            {t("common.profile")}
          </Link>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{t("teamAdmin.title")}</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("teamAdmin.subtitle")}</p>
      </header>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {lastSecret ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          <p className="font-medium">{t("teamAdmin.secretOnce")}</p>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all font-mono text-xs">{lastSecret}</pre>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <RippleButton
              rippleColor="rgb(251 191 36 / 0.45)"
              duration="550ms"
              className="rounded-md border border-amber-400/80 bg-amber-50/80 px-2 py-1 text-xs font-medium text-amber-950 shadow-sm hover:bg-amber-100/90 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-100 dark:hover:bg-amber-900/40"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(lastSecret);
                  setSecretCopyMsg(t("teamAdmin.copiedSecret"));
                  setTimeout(() => setSecretCopyMsg(null), 2000);
                } catch {
                  setSecretCopyMsg(null);
                }
              }}
            >
              {t("teamAdmin.copySecret")}
            </RippleButton>
            {secretCopyMsg ? (
              <span className="text-xs text-emerald-700 dark:text-emerald-400">{secretCopyMsg}</span>
            ) : null}
          </div>
        </div>
      ) : null}

      <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{t("teamAdmin.usersHeading")}</h2>
        <div className="flex flex-wrap gap-2">
          <input
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder={t("teamAdmin.createUserLabel")}
            className="min-w-[10rem] flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as "member" | "viewer")}
            className="rounded-lg border border-zinc-300 bg-white px-2 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="member">{t("teamAdmin.roleMember")}</option>
            <option value="viewer">{t("teamAdmin.roleViewer")}</option>
          </select>
          <button
            type="button"
            disabled={busy || !newUsername.trim()}
            onClick={() => void createUser()}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            {t("teamAdmin.createUserBtn")}
          </button>
        </div>
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {users.map((u) => {
            const isLikelyAllowlistAdmin = Boolean(u.email) && u.role === "admin";
            return (
              <li key={u.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-medium text-zinc-900 dark:text-zinc-50">{u.username}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {u.email ?? "—"} · {u.role} ({u.effectiveRole})
                    {u.memberStatus === "pending"
                      ? ` · ${t("teamAdmin.memberStatusPending")}`
                      : ` · ${t("teamAdmin.memberStatusApproved")}`}
                    {u.hasLoginKey ? ` · ${t("teamAdmin.hasLoginKey")}` : ""}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {u.memberStatus === "pending" ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void approveUser(u.id)}
                      className="rounded-lg bg-emerald-700 px-2 py-1.5 text-xs font-medium text-white dark:bg-emerald-600"
                    >
                      {t("teamAdmin.approveUserBtn")}
                    </button>
                  ) : null}
                  {u.memberStatus === "approved" && !isLikelyAllowlistAdmin ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void newMemberAccessKey(u.id)}
                      className="rounded-lg border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-700"
                    >
                      {t("teamAdmin.newMemberAccessKeyBtn")}
                    </button>
                  ) : null}
                  <select
                    defaultValue={u.role}
                    disabled={busy || isLikelyAllowlistAdmin}
                    onChange={(e) => void saveRole(u.id, e.target.value)}
                    className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                  >
                    <option value="admin">admin</option>
                    <option value="member">{t("teamAdmin.roleMember")}</option>
                    <option value="viewer">{t("teamAdmin.roleViewer")}</option>
                  </select>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void setAccessKey(u.id, randomAccessKey(), false)}
                    className="rounded-lg border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-700"
                  >
                    {t("teamAdmin.accessKeyBtn")}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void setAccessKey(u.id, null, true)}
                    className="rounded-lg border border-red-200 px-2 py-1.5 text-xs text-red-800 dark:border-red-900 dark:text-red-200"
                  >
                    {t("teamAdmin.clearAccessKey")}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("teamAdmin.accessKeyHint")}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("teamAdmin.memberLoginKeyHint")}</p>
      </section>

      <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{t("teamAdmin.keysHeading")}</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs">
            <span>{t("teamAdmin.keyLabel")}</span>
            <input
              value={keyLabel}
              onChange={(e) => setKeyLabel(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span>Kind</span>
            <select
              value={keyKind}
              onChange={(e) => setKeyKind(e.target.value as "invite" | "redeem")}
              className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="invite">{t("teamAdmin.keyKindInvite")}</option>
              <option value="redeem">{t("teamAdmin.keyKindRedeem")}</option>
            </select>
          </label>
          {keyKind === "invite" ? (
            <label className="flex flex-col gap-1 text-xs sm:col-span-2">
              <span>{t("teamAdmin.roleMember")} / {t("teamAdmin.roleViewer")}</span>
              <select
                value={keyInviteRole}
                onChange={(e) => setKeyInviteRole(e.target.value as "member" | "viewer")}
                className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="member">{t("teamAdmin.roleMember")}</option>
                <option value="viewer">{t("teamAdmin.roleViewer")}</option>
              </select>
            </label>
          ) : null}
          <label className="flex flex-col gap-1 text-xs">
            <span>{t("teamAdmin.expiresOptional")}</span>
            <input
              type="datetime-local"
              value={keyExpires}
              onChange={(e) => setKeyExpires(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span>{t("teamAdmin.maxUsesOptional")}</span>
            <input
              value={keyMaxUses}
              onChange={(e) => setKeyMaxUses(e.target.value)}
              inputMode="numeric"
              className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void createKey()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
        >
          {t("teamAdmin.createKeyBtn")}
        </button>
        <ul className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
          {keys.map((k) => (
            <li key={k.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span>
                <span className="font-mono text-xs text-zinc-500">{k.kind}</span> {k.label} · uses {k.uses}
                {k.maxUses !== null ? ` / ${k.maxUses}` : ""}
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => void deleteKey(k.id)}
                className="text-xs text-red-600 dark:text-red-400"
              >
                {t("teamAdmin.deleteKey")}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{t("teamAdmin.redeemKeyHeading")}</h2>
        <div className="flex flex-wrap gap-2">
          <input
            value={redeemLocal}
            onChange={(e) => setRedeemLocal(e.target.value)}
            placeholder="redeem key"
            className="min-w-[12rem] flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="button"
            disabled={busy || !redeemLocal.trim()}
            onClick={() => void applyRedeem()}
            className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-white dark:bg-zinc-200 dark:text-zinc-900"
          >
            {t("teamAdmin.redeemKeyBtn")}
          </button>
        </div>
      </section>

      <section className="space-y-2 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{t("teamAdmin.impersonateHeading")}</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <input
            value={impUser}
            onChange={(e) => setImpUser(e.target.value)}
            placeholder={t("login.adminAccessUser")}
            className="min-w-[8rem] flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <input
            value={impKey}
            onChange={(e) => setImpKey(e.target.value)}
            placeholder={t("login.adminAccessKey")}
            className="min-w-[8rem] flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="button"
            disabled={busy || !impUser.trim() || !impKey.trim()}
            onClick={() => void adminAccessLogin()}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            {t("login.adminAccessSubmit")}
          </button>
        </div>
        <Link href="/login" className="text-xs text-blue-600 underline dark:text-blue-400">
          {t("teamAdmin.impersonateBtn")}
        </Link>
      </section>
    </div>
  );
}
