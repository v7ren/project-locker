"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CenterBreadcrumbBar } from "@/components/center-breadcrumb-bar";
import { TopRightTheme } from "@/components/top-right-theme";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  addDays,
  addMinutes,
  addMonths,
  formatFullDay,
  formatMonthYear,
  formatWeekRange,
  isSameDay,
  isSameMonth,
  monthGridDays,
  startOfDay,
  weekDaysFrom,
} from "@/lib/calendar/date-utils";
import { eventColorCss, userHueCss } from "@/lib/calendar/event-color";
import { displayHourRange, layoutEventsForDayColumn } from "@/lib/calendar/week-layout";
import type { CalendarEventRecord } from "@/lib/team/events-store";
import type { MessageKey } from "@/lib/i18n/messages";
import { useTranslations } from "@/lib/i18n/locale-provider";
import { cn } from "@/lib/utils";

type TeamUser = {
  id: string;
  username: string;
  role: string;
  email: string | null;
  hue: number;
  avatarEmoji: string;
};

type View = "month" | "week" | "day" | "agenda";

type Props = {
  initialUsers: TeamUser[];
  initialSelf: { id: string; role: string; isAdmin: boolean };
  initialEvents: CalendarEventRecord[];
};

function colorForEvent(ev: CalendarEventRecord, userList: TeamUser[]) {
  const first = ev.assignedUserIds[0];
  const u = first ? userList.find((x) => x.id === first) : undefined;
  return u ? userHueCss(u.hue) : eventColorCss(ev.id);
}

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(s: string): string {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

function eventsOverlappingDay(day: Date, events: CalendarEventRecord[]): CalendarEventRecord[] {
  const ds = startOfDay(day);
  const de = addDays(ds, 1);
  return events
    .filter((ev) => {
      const s = new Date(ev.start);
      const e = new Date(ev.end);
      return s < de && e > ds;
    })
    .sort((a, b) => a.start.localeCompare(b.start));
}

const HOUR_PX = 48;
const WEEKDAY_KEYS_MON_FIRST = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export function TeamCalendarApp({ initialUsers, initialSelf, initialEvents }: Props) {
  const { t, locale } = useTranslations();
  const intlLocale = locale === "zh-TW" ? "zh-TW" : "en-US";

  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState(initialUsers);
  const [self, setSelf] = useState(initialSelf);
  const [events, setEvents] = useState(initialEvents);
  const [view, setView] = useState<View>("month");
  const [cursorDate, setCursorDate] = useState(() => new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [assign, setAssign] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  /** Drill-down: pick a calendar day to list all events as blocks before opening one. */
  const [daySheetDay, setDaySheetDay] = useState<Date | null>(null);

  const isAdmin = self.isAdmin;
  const { start: dispStartH, end: dispEndH } = displayHourRange();
  const hoursVisible = dispEndH - dispStartH;
  const gridBodyPx = hoursVisible * HOUR_PX;

  const reload = useCallback(async () => {
    setError(null);
    try {
      const [uRes, cRes] = await Promise.all([
        fetch("/api/team/users", { credentials: "include" }),
        fetch("/api/team/calendar", { credentials: "include" }),
      ]);
      if (!uRes.ok) {
        const j = (await uRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? uRes.statusText);
      }
      if (!cRes.ok) {
        const j = (await cRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? cRes.statusText);
      }
      const uData = (await uRes.json()) as { users: TeamUser[] };
      const cData = (await cRes.json()) as {
        events: CalendarEventRecord[];
        self: { id: string; role: string; isAdmin: boolean };
      };
      setUsers(uData.users);
      setEvents(cData.events);
      setSelf(cData.self);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("teamCal.loadFailed"));
    }
  }, [t]);

  const openNewAt = useCallback((slotStart: Date, slotEnd: Date) => {
    setEditingId(null);
    setTitle("");
    setStart(toDatetimeLocalValue(slotStart.toISOString()));
    setEnd(toDatetimeLocalValue(slotEnd.toISOString()));
    setNotes("");
    setAssign({});
    setDialogOpen(true);
  }, []);

  /** Default one-hour block on a calendar day (local 9:00–10:00) — add as many per day as you need. */
  const openNewOnCalendarDay = useCallback(
    (day: Date) => {
      const ds = startOfDay(day);
      openNewAt(addMinutes(ds, 9 * 60), addMinutes(ds, 10 * 60));
    },
    [openNewAt],
  );

  const openDaySheet = useCallback((day: Date) => {
    setDaySheetDay(startOfDay(day));
  }, []);

  const closeDaySheet = useCallback(() => {
    setDaySheetDay(null);
  }, []);

  const daySheetEvents = useMemo(() => {
    if (!daySheetDay) return [];
    return eventsOverlappingDay(daySheetDay, events);
  }, [daySheetDay, events]);

  const startEdit = useCallback((ev: CalendarEventRecord) => {
    setDaySheetDay(null);
    setEditingId(ev.id);
    setTitle(ev.title);
    setStart(toDatetimeLocalValue(ev.start));
    setEnd(toDatetimeLocalValue(ev.end));
    setNotes(ev.notes);
    const m: Record<string, boolean> = {};
    for (const id of ev.assignedUserIds) m[id] = true;
    setAssign(m);
    setDialogOpen(true);
  }, []);

  const resetFormClose = useCallback(() => {
    setDialogOpen(false);
    setEditingId(null);
    setTitle("");
    setStart("");
    setEnd("");
    setNotes("");
    setAssign({});
  }, []);

  const toggleAssign = useCallback((id: string) => {
    setAssign((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const assignedList = useMemo(
    () => users.filter((u) => assign[u.id]).map((u) => u.id),
    [users, assign],
  );

  const save = useCallback(async () => {
    if (!isAdmin) return;
    setBusy(true);
    setError(null);
    try {
      const startIso = fromDatetimeLocalValue(start);
      const endIso = fromDatetimeLocalValue(end);
      if (!title.trim() || !startIso || !endIso) {
        setError(t("teamCal.validationTitleTime"));
        return;
      }
      if (editingId) {
        const res = await fetch(`/api/team/calendar/${editingId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            start: startIso,
            end: endIso,
            notes,
            assignedUserIds: assignedList,
          }),
        });
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) throw new Error(j.error ?? res.statusText);
      } else {
        const res = await fetch("/api/team/calendar", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            start: startIso,
            end: endIso,
            notes,
            assignedUserIds: assignedList,
          }),
        });
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) throw new Error(j.error ?? res.statusText);
      }
      resetFormClose();
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("teamCal.loadFailed"));
    } finally {
      setBusy(false);
    }
  }, [assignedList, editingId, end, isAdmin, notes, reload, resetFormClose, start, t, title]);

  const remove = useCallback(async () => {
    if (!isAdmin || !editingId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/team/calendar/${editingId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? res.statusText);
      resetFormClose();
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("teamCal.loadFailed"));
    } finally {
      setBusy(false);
    }
  }, [editingId, isAdmin, reload, resetFormClose, t]);

  const monthGrid = useMemo(() => monthGridDays(cursorDate), [cursorDate]);
  const weekDays = useMemo(() => weekDaysFrom(cursorDate), [cursorDate]);

  const toolbarTitle = useMemo(() => {
    if (view === "month") return formatMonthYear(cursorDate, intlLocale);
    if (view === "week") return formatWeekRange(weekDays[0]!, intlLocale);
    if (view === "day") return formatFullDay(cursorDate, intlLocale);
    return t("teamCal.agendaToolbar");
  }, [cursorDate, intlLocale, t, view, weekDays]);

  const goToday = () => setCursorDate(new Date());

  const openBlankEvent = useCallback(() => {
    setDaySheetDay(null);
    const now = new Date();
    openNewAt(now, addMinutes(now, 60));
  }, [openNewAt]);

  const goPrev = () => {
    if (view === "month") setCursorDate((d) => addMonths(d, -1));
    else if (view === "week") setCursorDate((d) => addDays(d, -7));
    else if (view === "day") setCursorDate((d) => addDays(d, -1));
    else setCursorDate((d) => addDays(d, -7));
  };

  const goNext = () => {
    if (view === "month") setCursorDate((d) => addMonths(d, 1));
    else if (view === "week") setCursorDate((d) => addDays(d, 7));
    else if (view === "day") setCursorDate((d) => addDays(d, 1));
    else setCursorDate((d) => addDays(d, 7));
  };

  const agendaChunks = useMemo(() => {
    const from = startOfDay(cursorDate);
    const days: { day: Date; items: CalendarEventRecord[] }[] = [];
    for (let i = 0; i < 56; i++) {
      const day = addDays(from, i);
      const items = eventsOverlappingDay(day, events);
      if (items.length > 0) days.push({ day, items });
    }
    return days;
  }, [cursorDate, events]);

  const handleSlotClick = (day: Date, hour: number, minute: number) => {
    if (!isAdmin) return;
    setDaySheetDay(null);
    const base = startOfDay(day);
    const slotStart = addMinutes(base, hour * 60 + minute);
    const slotEnd = addMinutes(slotStart, 60);
    openNewAt(slotStart, slotEnd);
  };

  const timeColumnLabels = useMemo(() => {
    const out: { label: string; top: number }[] = [];
    for (let h = dispStartH; h < dispEndH; h++) {
      const d = new Date(2000, 0, 1, h, 0, 0, 0);
      out.push({
        label: d.toLocaleTimeString(intlLocale, { hour: "numeric", minute: "2-digit" }),
        top: (h - dispStartH) * HOUR_PX,
      });
    }
    return out;
  }, [dispEndH, dispStartH, intlLocale]);

  const viewBtn = (v: View, label: MessageKey) => (
    <button
      key={v}
      type="button"
      onClick={() => setView(v)}
      className={cn(
        "rounded-md px-3 py-1.5 text-xs font-medium transition sm:text-sm",
        view === v
          ? "bg-white text-zinc-900 shadow dark:bg-zinc-800 dark:text-zinc-50"
          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
      )}
    >
      {t(label)}
    </button>
  );

  return (
    <div className="relative mx-auto flex min-h-full w-full min-w-0 max-w-6xl flex-col gap-4 px-3 py-8 pb-28 sm:gap-6 sm:px-6 sm:py-10">
      <TopRightTheme />
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
          >
            {t("teamCal.backProjects")}
          </Link>
          {isAdmin ? (
            <Link
              href="/team"
              className="text-sm font-medium text-blue-700 underline-offset-4 hover:underline dark:text-blue-300"
            >
              {t("teamCal.teamAdmin")}
            </Link>
          ) : null}
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              isAdmin
                ? "bg-violet-100 text-violet-900 dark:bg-violet-950/80 dark:text-violet-100"
                : "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
            )}
          >
            {isAdmin ? t("teamCal.adminBadge") : t("teamCal.memberBadge")}
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t("teamCal.title")}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("teamCal.subtitle")}</p>
        </div>
      </header>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={goToday}
              className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {t("teamCal.today")}
            </button>
            {isAdmin ? (
              <button
                type="button"
                onClick={openBlankEvent}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                {t("teamCal.newEventCta")}
              </button>
            ) : null}
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label={t("teamCal.prev")}
                onClick={goPrev}
                className="rounded-lg border border-zinc-300 p-1.5 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label={t("teamCal.next")}
                onClick={goNext}
                className="rounded-lg border border-zinc-300 p-1.5 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <h2 className="min-w-0 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {toolbarTitle}
            </h2>
          </div>
          <div className="flex flex-wrap rounded-lg border border-zinc-200 bg-zinc-100/80 p-1 dark:border-zinc-800 dark:bg-zinc-900/80">
            {viewBtn("month", "teamCal.viewMonth")}
            {viewBtn("week", "teamCal.viewWeek")}
            {viewBtn("day", "teamCal.viewDay")}
            {viewBtn("agenda", "teamCal.viewAgenda")}
          </div>
        </div>

        {view === "month" ? (
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800">
                {WEEKDAY_KEYS_MON_FIRST.map((k) => (
                  <div
                    key={k}
                    className="border-l border-zinc-100 py-2 text-center text-xs font-medium uppercase tracking-wide text-zinc-500 first:border-l-0 dark:border-zinc-800 dark:text-zinc-400"
                  >
                    {t(`teamCal.wd.${k}`)}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {monthGrid.map((cell) => {
                  const inMonth = isSameMonth(cell, cursorDate);
                  const today = isSameDay(cell, new Date());
                  const cellEvents = eventsOverlappingDay(cell, events);
                  return (
                    <div
                      key={cell.toISOString()}
                      role="button"
                      tabIndex={0}
                      aria-label={t("teamCal.openDaySheetAria")}
                      onClick={() => openDaySheet(cell)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openDaySheet(cell);
                        }
                      }}
                      className={cn(
                        "min-h-[132px] cursor-pointer rounded-md border-b border-l border-zinc-100 p-1 outline-none first:border-l-0 hover:bg-blue-500/5 focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:border-zinc-800 dark:hover:bg-blue-400/10",
                        !inMonth && "bg-zinc-50/80 dark:bg-zinc-900/40",
                        today && "ring-1 ring-inset ring-blue-400/60 dark:ring-blue-500/50",
                      )}
                    >
                      <div
                        className={cn(
                          "pointer-events-none mb-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium",
                          inMonth ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-500",
                          today && "bg-blue-600 text-white dark:bg-blue-600",
                        )}
                      >
                        {cell.getDate()}
                      </div>
                      <div className="pointer-events-none flex max-h-[min(200px,28vh)] flex-col gap-0.5 overflow-y-auto overscroll-contain pr-0.5">
                        {cellEvents.map((ev) => {
                          const { bg, fg } = colorForEvent(ev, users);
                          return (
                            <div
                              key={ev.id}
                              className="truncate rounded px-1 py-0.5 text-left text-[10px] font-medium leading-tight sm:text-xs"
                              style={{ backgroundColor: bg, color: fg }}
                              title={ev.title}
                            >
                              {ev.title}
                            </div>
                          );
                        })}
                        {cellEvents.length === 0 ? (
                          <span className="mt-1 text-[10px] leading-snug text-zinc-400 dark:text-zinc-500">
                            {t("teamCal.clickDayForSchedule")}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {view === "week" || view === "day" ? (
          <div className="overflow-x-auto">
            <div className="flex min-w-[640px] rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div
                className="relative w-14 shrink-0 border-r border-zinc-200 bg-zinc-50/90 dark:border-zinc-800 dark:bg-zinc-900/60"
                style={{ height: gridBodyPx }}
              >
                {timeColumnLabels.map((row) => (
                  <div
                    key={row.top}
                    className="absolute right-1 text-right text-[10px] leading-none text-zinc-500 dark:text-zinc-400"
                    style={{ top: row.top + 2 }}
                  >
                    {row.label}
                  </div>
                ))}
              </div>
              <div className={cn("flex min-w-0 flex-1", view === "day" && "max-w-md")}>
                {(view === "day" ? [cursorDate] : weekDays).map((day) => {
                  const layouts = layoutEventsForDayColumn(day, events);
                  return (
                    <div
                      key={day.toISOString()}
                      className="relative min-w-0 flex-1 border-l border-zinc-100 first:border-l-0 dark:border-zinc-800"
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label={t("teamCal.openDaySheetAria")}
                        onClick={() => openDaySheet(day)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openDaySheet(day);
                          }
                        }}
                        className={cn(
                          "cursor-pointer border-b border-zinc-100 py-2 text-center outline-none hover:bg-blue-500/10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500/40 dark:border-zinc-800 dark:hover:bg-blue-400/10",
                        )}
                      >
                        <div className="text-[10px] font-medium uppercase text-zinc-500 dark:text-zinc-400">
                          {day.toLocaleDateString(intlLocale, { weekday: "short" })}
                        </div>
                        <div
                          className={cn(
                            "text-sm font-semibold",
                            isSameDay(day, new Date())
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-zinc-900 dark:text-zinc-50",
                          )}
                        >
                          {day.getDate()}
                        </div>
                      </div>
                      <div
                        className="relative border-zinc-100 dark:border-zinc-800"
                        style={{ height: gridBodyPx }}
                      >
                        {Array.from({ length: hoursVisible }, (_, i) => (
                          <button
                            key={i}
                            type="button"
                            disabled={!isAdmin}
                            onClick={() => handleSlotClick(day, dispStartH + i, 0)}
                            className={cn(
                              "absolute left-0 right-0 border-b border-zinc-100 dark:border-zinc-800/80",
                              isAdmin && "cursor-pointer hover:bg-blue-500/5 dark:hover:bg-blue-400/10",
                            )}
                            style={{ top: i * HOUR_PX, height: HOUR_PX }}
                            aria-label={t("teamCal.newEventSlot")}
                          />
                        ))}
                        {layouts.map((L) => {
                          const { bg, fg } = colorForEvent(L.ev, users);
                          const w = 100 / L.laneCount;
                          const left = (100 / L.laneCount) * L.lane;
                          return (
                            <button
                              key={L.ev.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEdit(L.ev);
                              }}
                              className="absolute overflow-hidden rounded border border-white/20 px-1 py-0.5 text-left text-[10px] font-medium leading-tight shadow-sm sm:text-xs"
                              style={{
                                top: `${L.topPct}%`,
                                height: `${L.heightPct}%`,
                                left: `${left}%`,
                                width: `${w}%`,
                                backgroundColor: bg,
                                color: fg,
                                zIndex: 2,
                              }}
                              title={L.ev.title}
                            >
                              <span className="line-clamp-2">{L.ev.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {view === "agenda" ? (
          <div className="max-h-[min(70vh,720px)] space-y-4 overflow-y-auto pr-1">
            {agendaChunks.length === 0 ? (
              <p className="text-sm text-zinc-500">{t("teamCal.noEventsInRange")}</p>
            ) : (
              agendaChunks.map(({ day, items }) => (
                <div key={day.toISOString()}>
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={t("teamCal.openDaySheetAria")}
                    onClick={() => openDaySheet(day)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openDaySheet(day);
                      }
                    }}
                    className="sticky top-0 z-[1] cursor-pointer rounded-md border-b border-zinc-200 bg-white/95 py-1 text-sm font-semibold text-zinc-800 outline-none backdrop-blur hover:bg-zinc-100/90 focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:border-zinc-800 dark:bg-zinc-950/95 dark:text-zinc-100 dark:hover:bg-zinc-900/90"
                  >
                    {formatFullDay(day, intlLocale)}
                  </div>
                  <ul className="mt-2 space-y-2">
                    {items.map((ev) => {
                      const { bg } = colorForEvent(ev, users);
                      return (
                        <li key={ev.id}>
                          <button
                            type="button"
                            onClick={() => startEdit(ev)}
                            className="flex w-full min-w-0 gap-3 rounded-lg border border-zinc-200 p-3 text-left transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/60"
                          >
                            <span
                              className="mt-0.5 h-10 w-1 shrink-0 rounded-full"
                              style={{ backgroundColor: bg }}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-zinc-900 dark:text-zinc-50">{ev.title}</div>
                              <div className="mt-0.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                                {new Date(ev.start).toLocaleTimeString(intlLocale, {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}{" "}
                                –{" "}
                                {new Date(ev.end).toLocaleTimeString(intlLocale, {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>

      <Dialog open={daySheetDay !== null} onOpenChange={(o) => !o && closeDaySheet()}>
        <DialogContent className="max-h-[90vh] max-w-[calc(100vw-1.5rem)] gap-0 overflow-hidden p-0 sm:max-w-xl">
          <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <DialogHeader>
              <DialogTitle>
                {daySheetDay ? formatFullDay(daySheetDay, intlLocale) : "\u00a0"}
              </DialogTitle>
              <DialogDescription>{t("teamCal.daySheetHint")}</DialogDescription>
            </DialogHeader>
          </div>
          <div className="max-h-[min(56vh,520px)] space-y-2 overflow-y-auto px-6 py-4">
            {daySheetEvents.length === 0 ? (
              <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                {t("teamCal.daySheetEmpty")}
              </p>
            ) : (
              daySheetEvents.map((ev) => {
                const { bg } = colorForEvent(ev, users);
                const names = ev.assignedUserIds
                  .map((id) => {
                    const u = users.find((x) => x.id === id);
                    if (!u) return "";
                    const em = u.avatarEmoji.trim();
                    return em ? `${em} ${u.username}` : u.username;
                  })
                  .filter(Boolean)
                  .join(", ");
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => startEdit(ev)}
                    className="flex w-full gap-3 rounded-xl border border-zinc-200 p-4 text-left transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/50"
                  >
                    <span
                      className="mt-1 h-14 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: bg }}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-50">{ev.title}</div>
                      <div className="mt-1 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                        {new Date(ev.start).toLocaleString(intlLocale, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                        {" — "}
                        {new Date(ev.end).toLocaleTimeString(intlLocale, {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                      {names ? (
                        <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{names}</div>
                      ) : null}
                    </div>
                  </button>
                );
              })
            )}
          </div>
          <DialogFooter className="flex flex-col gap-2 border-t border-zinc-200 px-6 py-4 sm:flex-row sm:justify-between dark:border-zinc-800">
            <button
              type="button"
              onClick={closeDaySheet}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
            >
              {t("common.cancel")}
            </button>
            {isAdmin && daySheetDay ? (
              <button
                type="button"
                onClick={() => {
                  const d = daySheetDay;
                  closeDaySheet();
                  openNewOnCalendarDay(d);
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600"
              >
                {t("teamCal.newEventCta")}
              </button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={(o) => !o && resetFormClose()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? t("teamCal.editEvent") : t("teamCal.newEvent")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{t("teamCal.eventTitle")}</span>
              <input
                value={title}
                readOnly={!isAdmin}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{t("teamCal.start")}</span>
                <input
                  type="datetime-local"
                  value={start}
                  readOnly={!isAdmin}
                  onChange={(e) => setStart(e.target.value)}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{t("teamCal.end")}</span>
                <input
                  type="datetime-local"
                  value={end}
                  readOnly={!isAdmin}
                  onChange={(e) => setEnd(e.target.value)}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{t("teamCal.notes")}</span>
              <textarea
                value={notes}
                readOnly={!isAdmin}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("teamCal.assign")}</span>
              <div className="flex flex-wrap gap-2">
                {users.map((u) => (
                  <label
                    key={u.id}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950",
                      isAdmin ? "cursor-pointer" : "cursor-default opacity-90",
                    )}
                  >
                    <input
                      type="checkbox"
                      disabled={!isAdmin}
                      checked={Boolean(assign[u.id])}
                      onChange={() => toggleAssign(u.id)}
                    />
                    {u.username}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {isAdmin && editingId ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void remove()}
                  className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-900 dark:text-red-300"
                >
                  {t("teamCal.delete")}
                </button>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={resetFormClose}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
              >
                {t("common.cancel")}
              </button>
              {isAdmin ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void save()}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                >
                  {busy ? t("teamCal.saving") : t("teamCal.save")}
                </button>
              ) : null}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CenterBreadcrumbBar items={[{ label: t("common.teamCalendar") }]} />
    </div>
  );
}
