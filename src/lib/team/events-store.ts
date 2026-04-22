import fs from "node:fs/promises";
import { ensureTeamDir, teamEventsFile } from "@/lib/team/paths";

export type CalendarEventRecord = {
  id: string;
  title: string;
  start: string;
  end: string;
  assignedUserIds: string[];
  notes: string;
  createdByUserId: string;
  createdAt: string;
};

type EventsFile = {
  version: 1;
  events: CalendarEventRecord[];
};

let eventsWriteChain: Promise<unknown> = Promise.resolve();

function withEventsLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = eventsWriteChain.then(fn, fn);
  eventsWriteChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readEventsFile(): Promise<EventsFile> {
  await ensureTeamDir();
  const file = teamEventsFile();
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw) as EventsFile;
    if (parsed.version !== 1 || !Array.isArray(parsed.events)) {
      return { version: 1, events: [] };
    }
    return parsed;
  } catch {
    return { version: 1, events: [] };
  }
}

async function writeEventsFile(data: EventsFile): Promise<void> {
  await ensureTeamDir();
  const file = teamEventsFile();
  const tmp = `${file}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 0), "utf8");
  await fs.rename(tmp, file);
}

export async function listCalendarEvents(): Promise<CalendarEventRecord[]> {
  const f = await readEventsFile();
  return [...f.events].sort((a, b) => a.start.localeCompare(b.start));
}

export async function getCalendarEvent(id: string): Promise<CalendarEventRecord | null> {
  const f = await readEventsFile();
  return f.events.find((e) => e.id === id) ?? null;
}

export async function createCalendarEvent(params: {
  title: string;
  start: string;
  end: string;
  assignedUserIds: string[];
  notes: string;
  createdByUserId: string;
}): Promise<CalendarEventRecord> {
  return withEventsLock(async () => {
    const data = await readEventsFile();
    const row: CalendarEventRecord = {
      id: crypto.randomUUID(),
      title: params.title.trim(),
      start: params.start,
      end: params.end,
      assignedUserIds: [...new Set(params.assignedUserIds)],
      notes: params.notes.trim(),
      createdByUserId: params.createdByUserId,
      createdAt: new Date().toISOString(),
    };
    data.events.push(row);
    await writeEventsFile(data);
    return row;
  });
}

export async function updateCalendarEvent(
  id: string,
  patch: Partial<Pick<CalendarEventRecord, "title" | "start" | "end" | "assignedUserIds" | "notes">>,
): Promise<CalendarEventRecord | null> {
  return withEventsLock(async () => {
    const data = await readEventsFile();
    const idx = data.events.findIndex((e) => e.id === id);
    if (idx < 0) return null;
    const cur = data.events[idx]!;
    const next: CalendarEventRecord = {
      ...cur,
      ...(patch.title !== undefined ? { title: patch.title.trim() } : {}),
      ...(patch.start !== undefined ? { start: patch.start } : {}),
      ...(patch.end !== undefined ? { end: patch.end } : {}),
      ...(patch.assignedUserIds !== undefined
        ? { assignedUserIds: [...new Set(patch.assignedUserIds)] }
        : {}),
      ...(patch.notes !== undefined ? { notes: patch.notes.trim() } : {}),
    };
    data.events[idx] = next;
    await writeEventsFile(data);
    return next;
  });
}

export async function deleteCalendarEvent(id: string): Promise<boolean> {
  return withEventsLock(async () => {
    const data = await readEventsFile();
    const before = data.events.length;
    data.events = data.events.filter((e) => e.id !== id);
    if (data.events.length === before) return false;
    await writeEventsFile(data);
    return true;
  });
}
