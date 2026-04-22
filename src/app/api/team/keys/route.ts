import { NextResponse } from "next/server";
import { getAuthGateMode } from "@/lib/auth/config";
import { readRequestSession } from "@/lib/auth/request-session";
import { createTeamKey, listTeamKeys } from "@/lib/team/keys-store";
import { canManageTeamAdmin } from "@/lib/team/permissions";
import { getTeamUserForSession } from "@/lib/team/session-bridge";
import type { TeamKeyKind } from "@/lib/team/keys-store";
import type { TeamRole } from "@/lib/team/users-store";

export const runtime = "nodejs";

export async function GET() {
  if (getAuthGateMode() === "none") {
    return NextResponse.json({ error: "Team features require authentication" }, { status: 503 });
  }
  const session = await readRequestSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const self = await getTeamUserForSession(session);
  if (!self || !canManageTeamAdmin(self)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const keys = await listTeamKeys();
  return NextResponse.json({ keys });
}

export async function POST(request: Request) {
  if (getAuthGateMode() === "none") {
    return NextResponse.json({ error: "Team features require authentication" }, { status: 503 });
  }
  const session = await readRequestSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const self = await getTeamUserForSession(session);
  if (!self || !canManageTeamAdmin(self)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const o = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const kind = o.kind === "invite" || o.kind === "redeem" ? (o.kind as TeamKeyKind) : null;
  const label = typeof o.label === "string" ? o.label : "";
  const assignRole =
    o.assignRole === "viewer" || o.assignRole === "member" ? (o.assignRole as TeamRole) : "member";
  const redeemEffect = o.redeemEffect === "promote_to_member" ? "promote_to_member" : "promote_to_member";
  const expiresAtRaw = o.expiresAt;
  let expiresAt: string | null = null;
  if (expiresAtRaw !== null && expiresAtRaw !== undefined) {
    if (typeof expiresAtRaw === "string" && expiresAtRaw.trim()) {
      const ms = Date.parse(expiresAtRaw.trim());
      if (Number.isFinite(ms)) {
        expiresAt = new Date(ms).toISOString();
      }
    }
  }
  const maxUsesRaw = o.maxUses;
  let maxUses: number | null = null;
  if (maxUsesRaw === null || maxUsesRaw === undefined) {
    maxUses = null;
  } else if (typeof maxUsesRaw === "number" && Number.isFinite(maxUsesRaw) && maxUsesRaw >= 1) {
    maxUses = Math.floor(maxUsesRaw);
  }

  if (!kind) {
    return NextResponse.json({ error: "kind must be invite or redeem" }, { status: 400 });
  }

  const created = await createTeamKey({
    kind,
    label,
    assignRole: kind === "invite" ? assignRole : "member",
    redeemEffect,
    expiresAt,
    maxUses,
  });
  if (!created.ok) {
    return NextResponse.json({ error: created.error }, { status: 400 });
  }

  return NextResponse.json({
    key: created.record,
    secret: created.secretPlain,
  });
}
