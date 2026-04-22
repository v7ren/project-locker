import { NextResponse } from "next/server";
import { getAuthGateMode } from "@/lib/auth/config";
import { readRequestSession } from "@/lib/auth/request-session";
import { canManageTeamAdmin } from "@/lib/team/permissions";
import { getTeamUserForSession } from "@/lib/team/session-bridge";
import {
  adminApprovePendingMember,
  adminPatchUserRecord,
  adminRegenerateMemberLoginKey,
  getTeamUserById,
  type TeamRole,
} from "@/lib/team/users-store";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Ctx) {
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

  const { id } = await context.params;
  const target = await getTeamUserById(id);
  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const o = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};

  const roleRaw = o.role;
  let role: TeamRole | undefined;
  if (roleRaw === "admin" || roleRaw === "member" || roleRaw === "viewer") {
    role = roleRaw;
  }

  const clearAdminAccessKey = o.clearAdminAccessKey === true;
  const newAdminAccessKey =
    typeof o.newAdminAccessKey === "string"
      ? o.newAdminAccessKey
      : o.newAdminAccessKey === null
        ? null
        : undefined;

  const approve = o.approve === true;
  const regenerateMemberLoginKey = o.regenerateMemberLoginKey === true;

  if (approve) {
    const ap = await adminApprovePendingMember(self, id);
    if (!ap.ok) {
      return NextResponse.json({ error: ap.error }, { status: 400 });
    }
    return NextResponse.json({
      user: {
        id: ap.user.id,
        username: ap.user.username,
        role: ap.user.role,
        email: ap.user.email,
        memberStatus: ap.user.memberStatus,
      },
      revealedMemberLoginKey: ap.revealedMemberLoginKey,
    });
  }

  if (regenerateMemberLoginKey) {
    const rg = await adminRegenerateMemberLoginKey(self, id);
    if (!rg.ok) {
      return NextResponse.json({ error: rg.error }, { status: 400 });
    }
    return NextResponse.json({
      user: {
        id: rg.user.id,
        username: rg.user.username,
        role: rg.user.role,
        email: rg.user.email,
        memberStatus: rg.user.memberStatus,
      },
      revealedMemberLoginKey: rg.revealedMemberLoginKey,
    });
  }

  const patch: { role?: TeamRole; clearAdminAccessKey?: boolean } = {};
  if (role !== undefined) patch.role = role;
  if (clearAdminAccessKey) patch.clearAdminAccessKey = true;

  const result = await adminPatchUserRecord(self, id, patch, newAdminAccessKey);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    user: {
      id: result.user.id,
      username: result.user.username,
      role: result.user.role,
      email: result.user.email,
      memberStatus: result.user.memberStatus,
    },
    revealedAdminKey: result.revealedAdminKey,
  });
}
