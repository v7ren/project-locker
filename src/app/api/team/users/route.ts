import { NextResponse } from "next/server";
import { getAuthGateMode } from "@/lib/auth/config";
import { readRequestSession } from "@/lib/auth/request-session";
import { getTeamUserForSession } from "@/lib/team/session-bridge";
import { canManageTeamAdmin, effectiveTeamRole, isViewer } from "@/lib/team/permissions";
import { adminCreateUsernameUser, listTeamUsers, type TeamRole } from "@/lib/team/users-store";

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
  if (!self) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isViewer(self)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await listTeamUsers();
  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      username: u.username,
      role: u.role,
      effectiveRole: effectiveTeamRole(u),
      email: u.email,
      memberStatus: u.memberStatus,
      hasLoginKey: Boolean(u.backupLoginKeyHash),
      hue: u.hue,
      avatarEmoji: u.avatarEmoji,
    })),
    self: {
      id: self.id,
      username: self.username,
      role: self.role,
      effectiveRole: effectiveTeamRole(self),
    },
  });
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
  if (!self) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canManageTeamAdmin(self)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const o = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const username = typeof o.username === "string" ? o.username : "";
  const roleRaw = o.role;
  let role: TeamRole = "member";
  if (roleRaw === "viewer" || roleRaw === "member") {
    role = roleRaw;
  }
  if (!username.trim()) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  const created = await adminCreateUsernameUser(self, username, role);
  if (!created.ok) {
    return NextResponse.json({ error: created.error }, { status: 400 });
  }
  return NextResponse.json({
    user: {
      id: created.user.id,
      username: created.user.username,
      role: created.user.role,
      email: created.user.email,
      memberStatus: created.user.memberStatus,
    },
    revealedMemberLoginKey: created.revealedMemberLoginKey,
  });
}
