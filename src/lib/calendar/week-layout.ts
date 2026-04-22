import type { CalendarEventRecord } from "@/lib/team/events-store";
import { MS_MIN, addMinutes, startOfDay } from "@/lib/calendar/date-utils";

export type WeekEventLayout = {
  ev: CalendarEventRecord;
  topPct: number;
  heightPct: number;
  lane: number;
  laneCount: number;
};

const DISPLAY_START_HOUR = 5;
const DISPLAY_END_HOUR = 22;

function dayWindow(day: Date): { winStart: Date; winEnd: Date; totalMin: number } {
  const winStart = new Date(day);
  winStart.setHours(DISPLAY_START_HOUR, 0, 0, 0);
  const winEnd = new Date(day);
  winEnd.setHours(DISPLAY_END_HOUR, 0, 0, 0);
  const totalMin = (winEnd.getTime() - winStart.getTime()) / MS_MIN;
  return { winStart, winEnd, totalMin };
}

/** Clip event to day, then vertical % inside [DISPLAY_START_HOUR, DISPLAY_END_HOUR). Greedy lane packing. */
export function layoutEventsForDayColumn(
  day: Date,
  events: CalendarEventRecord[],
): WeekEventLayout[] {
  const dayStart = startOfDay(day);
  const dayEnd = addMinutes(dayStart, 24 * 60);
  const { winStart, winEnd, totalMin } = dayWindow(day);

  type Clip = { ev: CalendarEventRecord; s: Date; e: Date };
  const clips: Clip[] = [];
  for (const ev of events) {
    const s = new Date(ev.start);
    const e = new Date(ev.end);
    if (e <= dayStart || s >= dayEnd) continue;
    const cs = s < dayStart ? dayStart : s;
    const ce = e > dayEnd ? dayEnd : e;
    if (ce <= winStart || cs >= winEnd) continue;
    const visS = cs < winStart ? winStart : cs;
    const visE = ce > winEnd ? winEnd : ce;
    clips.push({ ev, s: visS, e: visE });
  }

  clips.sort((a, b) => a.s.getTime() - b.s.getTime());

  const laneEnds: number[] = [];
  const laneOf: number[] = [];

  for (let i = 0; i < clips.length; i++) {
    const c = clips[i]!;
    const startMs = c.s.getTime();
    const endMs = c.e.getTime();
    let lane = -1;
    for (let L = 0; L < laneEnds.length; L++) {
      if (laneEnds[L]! <= startMs) {
        lane = L;
        break;
      }
    }
    if (lane < 0) {
      lane = laneEnds.length;
      laneEnds.push(endMs);
    } else {
      laneEnds[lane] = endMs;
    }
    laneOf[i] = lane;
  }

  const laneCount = Math.max(1, laneEnds.length);

  return clips.map((c, i) => {
    const topMin = (c.s.getTime() - winStart.getTime()) / MS_MIN;
    const durMin = (c.e.getTime() - c.s.getTime()) / MS_MIN;
    return {
      ev: c.ev,
      topPct: (topMin / totalMin) * 100,
      heightPct: Math.max((durMin / totalMin) * 100, 1.2),
      lane: laneOf[i]!,
      laneCount,
    };
  });
}

export function displayHourRange(): { start: number; end: number } {
  return { start: DISPLAY_START_HOUR, end: DISPLAY_END_HOUR };
}
