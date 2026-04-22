import { NextResponse } from "next/server";
import { getAuthGateMode } from "@/lib/auth/config";
import { readRequestSession } from "@/lib/auth/request-session";
import { deleteTeamKey } from "@/lib/team/keys-store";
import { canManageTeamAdmin } from "@/lib/team/permissions";
import { getTeamUserForSession } from "@/lib/team/session-bridge";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: Ctx) {
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
  const ok = await deleteTeamKey(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
