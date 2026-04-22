import { NextResponse } from "next/server";
import { getAuthGateMode } from "@/lib/auth/config";
import { readRequestSession } from "@/lib/auth/request-session";
import { createCalendarEvent, listCalendarEvents } from "@/lib/team/events-store";
import { isEffectiveAdmin, isViewer } from "@/lib/team/permissions";
import { getTeamUserForSession } from "@/lib/team/session-bridge";
import { listTeamUsers } from "@/lib/team/users-store";

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
  const events = await listCalendarEvents();
  return NextResponse.json({
    events,
    self: { id: self.id, role: self.role, isAdmin: isEffectiveAdmin(self) },
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
  if (isViewer(self)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!isEffectiveAdmin(self)) {
    return NextResponse.json({ error: "Only admins can create calendar events" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const o = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const title = typeof o.title === "string" ? o.title : "";
  const start = typeof o.start === "string" ? o.start : "";
  const end = typeof o.end === "string" ? o.end : "";
  const notes = typeof o.notes === "string" ? o.notes : "";
  const assignedUserIds = Array.isArray(o.assignedUserIds)
    ? o.assignedUserIds.filter((x): x is string => typeof x === "string")
    : [];

  if (!title.trim()) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }
  if (!start || !end) {
    return NextResponse.json({ error: "start and end (ISO 8601) required" }, { status: 400 });
  }
  const t0 = Date.parse(start);
  const t1 = Date.parse(end);
  if (!Number.isFinite(t0) || !Number.isFinite(t1) || t1 <= t0) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }

  const users = await listTeamUsers();
  const validIds = new Set(users.map((u) => u.id));
  const filtered = assignedUserIds.filter((id) => validIds.has(id));
  if (filtered.length !== assignedUserIds.length) {
    return NextResponse.json({ error: "Unknown user id in assignedUserIds" }, { status: 400 });
  }

  const event = await createCalendarEvent({
    title,
    start,
    end,
    assignedUserIds: filtered,
    notes,
    createdByUserId: self.id,
  });
  return NextResponse.json({ event });
}
