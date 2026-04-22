import { NextResponse } from "next/server";
import { getAuthGateMode } from "@/lib/auth/config";
import { readRequestSession } from "@/lib/auth/request-session";
import {
  deleteCalendarEvent,
  getCalendarEvent,
  updateCalendarEvent,
} from "@/lib/team/events-store";
import { isEffectiveAdmin, isViewer } from "@/lib/team/permissions";
import { getTeamUserForSession } from "@/lib/team/session-bridge";
import { listTeamUsers } from "@/lib/team/users-store";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Ctx) {
  if (getAuthGateMode() === "none") {
    return NextResponse.json({ error: "Team features require authentication" }, { status: 503 });
  }
  const session = await readRequestSession();
  const self = session ? await getTeamUserForSession(session) : null;
  if (!self || isViewer(self) || !isEffectiveAdmin(self)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const existing = await getCalendarEvent(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const o = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};

  const patch: {
    title?: string;
    start?: string;
    end?: string;
    notes?: string;
    assignedUserIds?: string[];
  } = {};

  if (typeof o.title === "string") patch.title = o.title;
  if (typeof o.start === "string") patch.start = o.start;
  if (typeof o.end === "string") patch.end = o.end;
  if (typeof o.notes === "string") patch.notes = o.notes;
  if (Array.isArray(o.assignedUserIds)) {
    patch.assignedUserIds = o.assignedUserIds.filter((x): x is string => typeof x === "string");
  }

  if (patch.start !== undefined || patch.end !== undefined) {
    const s = patch.start ?? existing.start;
    const e = patch.end ?? existing.end;
    const t0 = Date.parse(s);
    const t1 = Date.parse(e);
    if (!Number.isFinite(t0) || !Number.isFinite(t1) || t1 <= t0) {
      return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
    }
  }

  if (patch.assignedUserIds) {
    const users = await listTeamUsers();
    const validIds = new Set(users.map((u) => u.id));
    if (!patch.assignedUserIds.every((uid) => validIds.has(uid))) {
      return NextResponse.json({ error: "Unknown user id in assignedUserIds" }, { status: 400 });
    }
  }

  const updated = await updateCalendarEvent(id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ event: updated });
}

export async function DELETE(_request: Request, context: Ctx) {
  if (getAuthGateMode() === "none") {
    return NextResponse.json({ error: "Team features require authentication" }, { status: 503 });
  }
  const session = await readRequestSession();
  const self = session ? await getTeamUserForSession(session) : null;
  if (!self || isViewer(self) || !isEffectiveAdmin(self)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const ok = await deleteCalendarEvent(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
