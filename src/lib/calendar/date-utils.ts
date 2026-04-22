/** Local calendar helpers (Monday-first week, like many Google Calendar locales). */

export const MS_MIN = 60_000;
export const MS_DAY = 24 * 60 * MS_MIN;

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * MS_DAY);
}

export function addMinutes(d: Date, n: number): Date {
  return new Date(d.getTime() + n * MS_MIN);
}

export function addMonths(d: Date, delta: number): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + delta);
  return x;
}

/** Monday 00:00 of the week containing `d` (local). */
export function startOfWeekMonday(d: Date): Date {
  const s = startOfDay(d);
  const day = s.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(s, diff);
}

/** 42 days for month grid: Monday of week that contains the 1st, then 41 more. */
export function monthGridDays(anchorInMonth: Date): Date[] {
  const first = new Date(anchorInMonth.getFullYear(), anchorInMonth.getMonth(), 1);
  const start = startOfWeekMonday(first);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export function weekDaysFrom(weekContaining: Date): Date[] {
  const start = startOfWeekMonday(weekContaining);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** `a` overlaps `[rangeStart, rangeEnd)` (rangeEnd exclusive at ms precision). */
export function rangesOverlap(aStart: Date, aEnd: Date, rangeStart: Date, rangeEnd: Date): boolean {
  return aStart < rangeEnd && aEnd > rangeStart;
}

export function formatMonthYear(d: Date, locale: string): string {
  return d.toLocaleDateString(locale, { month: "long", year: "numeric" });
}

export function formatWeekRange(weekStart: Date, locale: string): string {
  const end = addDays(weekStart, 6);
  const y0 = weekStart.getFullYear();
  const y1 = end.getFullYear();
  const opt: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  if (y0 !== y1) {
    return `${weekStart.toLocaleDateString(locale, { ...opt, year: "numeric" })} – ${end.toLocaleDateString(locale, { ...opt, year: "numeric" })}`;
  }
  return `${weekStart.toLocaleDateString(locale, opt)} – ${end.toLocaleDateString(locale, { ...opt, year: "numeric" })}`;
}

export function formatFullDay(d: Date, locale: string): string {
  return d.toLocaleDateString(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
