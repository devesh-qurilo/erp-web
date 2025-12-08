"use client";

import React, { useEffect, useMemo, useState } from "react";

type EmployeeItem = {
  employeeId: string;
  name?: string | null;
  profileUrl?: string | null;
  designation?: string | null;
  department?: string | null;
};

type Timesheet = {
  id: number;
  projectShortCode?: string;
  taskId?: number;
  employees?: EmployeeItem[];
  startDate?: string; // "YYYY-MM-DD"
  endDate?: string; // "YYYY-MM-DD"
  startTime?: string; // "HH:MM" or "HH:MM:SS"
  endTime?: string;
  memo?: string | null;
  durationHours?: number;
};

type FullCalendarViewProps = {
  // optional timesheets to render as events (if provided, used as initial/override)
  events?: Timesheet[];
  // optional starting month/year; defaults to current month
  initYear?: number;
  initMonth?: number; // 0-11
  // optional onEventClick
  onEventClick?: (ev: Timesheet) => void;
  // optional override of base API url (if not provided we use the URL you gave)
  apiBaseUrl?: string;
};

function startOfMonth(year: number, month: number) {
  return new Date(year, month, 1);
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function FullCalendarView({
  events = [],
  initYear,
  initMonth,
  onEventClick,
  apiBaseUrl,
}: FullCalendarViewProps) {
  const BASE_URL =
    apiBaseUrl ?? "https://6jnqmj85-80.inc1.devtunnels.ms"; // user-provided base

  const today = new Date();
  const [viewYear, setViewYear] = useState(initYear ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(initMonth ?? today.getMonth()); // 0-indexed

  // internal events state: start with prop if provided, otherwise empty and we'll fetch
  const [eventsState, setEventsState] = useState<Timesheet[]>(events ?? []);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // modal open state for full-page view
  const [isFullPageOpen, setIsFullPageOpen] = useState(false);

  // Keep internal state in sync if parent passes events later/updates them
  useEffect(() => {
    if (events && events.length > 0) {
      setEventsState(events);
    }
  }, [events]);

  // Fetch timesheets from API on mount (only if parent didn't already pass events)
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function loadTimesheets() {
      setLoading(true);
      setError(null);
      try {
        const t = localStorage.getItem("accessToken");
        const res = await fetch(`${BASE_URL}/timesheets`, {
          method: "GET",
          signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${t}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
        }

        const data = (await res.json()) as any[];

        // map API shape to our Timesheet type (best-effort)
        const mapped: Timesheet[] = data.map((d) => {
          // ensure date is YYYY-MM-DD if there's a time portion
          const makeDateOnly = (v?: string | null) =>
            v ? v.split("T")[0].split(" ")[0] : undefined;

          // durationHours may be number already
          const duration =
            typeof d.durationHours === "number"
              ? d.durationHours
              : d.durationHours
              ? Number(d.durationHours)
              : undefined;

          // map employees array if exists
          const emps: EmployeeItem[] | undefined = Array.isArray(d.employees)
            ? d.employees.map((e: any) => ({
                employeeId: e.employeeId,
                name: e.name ?? e.employeeName ?? null,
                profileUrl: e.profileUrl ?? null,
                designation: e.designation ?? null,
                department: e.department ?? null,
              }))
            : d.employeeId
            ? [
                {
                  employeeId: d.employeeId,
                  name: d.employeeName ?? null,
                  profileUrl: d.profileUrl ?? null,
                  designation: d.designation ?? null,
                  department: d.department ?? null,
                },
              ]
            : undefined;

          return {
            id: typeof d.id === "number" ? d.id : Number(d.id),
            projectShortCode: d.projectShortCode ?? d.projectCode ?? d.projectName,
            taskId:
              typeof d.taskId === "number"
                ? d.taskId
                : d.taskId
                ? Number(d.taskId)
                : undefined,
            employees: emps,
            startDate: makeDateOnly(d.startDate ?? d.start_date ?? d.date),
            endDate: makeDateOnly(d.endDate ?? d.end_date ?? d.endDate),
            startTime:
              typeof d.startTime === "string" ? d.startTime.split(".")[0] : d.startTime,
            endTime:
              typeof d.endTime === "string" ? d.endTime.split(".")[0] : d.endTime,
            memo: d.memo ?? null,
            durationHours: duration,
          } as Timesheet;
        });

        setEventsState(mapped);
      } catch (err: any) {
        if (err?.name === "AbortError") {
          // aborted, ignore
        } else {
          setError(err?.message ?? "Unknown error");
        }
      } finally {
        setLoading(false);
      }
    }

    loadTimesheets();

    return () => controller.abort();
  }, [BASE_URL]);

  // Map events by date key "YYYY-MM-DD"
  const eventsByDate = useMemo(() => {
    const map = new Map<string, Timesheet[]>();
    (eventsState || []).forEach((ev) => {
      // prefer startDate; fallback to endDate
      const dateKey = ev.startDate ?? ev.endDate;
      if (!dateKey) return;
      const s = map.get(dateKey) ?? [];
      s.push(ev);
      map.set(dateKey, s);
    });
    return map;
  }, [eventsState]);

  const monthName = useMemo(
    () =>
      startOfMonth(viewYear, viewMonth).toLocaleString(undefined, {
        month: "long",
      }),
    [viewYear, viewMonth]
  );

  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun .. 6 = Sat

  const totalDays = daysInMonth(viewYear, viewMonth);

  // build grid rows (weeks)
  const weeks: Array<Array<{ date?: number; key?: string }>> = useMemo(() => {
    const cells: Array<Array<{ date?: number; key?: string }>> = [];
    let current = 1 - firstDayIndex; // start offset (could be negative)
    while (current <= totalDays) {
      const week: Array<{ date?: number; key?: string }> = [];
      for (let d = 0; d < 7; d++) {
        if (current < 1 || current > totalDays) {
          week.push({ date: undefined, key: `${current}-${d}` });
        } else {
          const key = `${viewYear}-${pad(viewMonth + 1)}-${pad(current)}`;
          week.push({ date: current, key });
        }
        current++;
      }
      cells.push(week);
    }
    return cells;
  }, [viewYear, viewMonth, firstDayIndex, totalDays]);

  const goPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const goNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };
  const goToday = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  // Handle Escape to close full page modal
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && isFullPageOpen) {
        setIsFullPageOpen(false);
      }
    }
    if (isFullPageOpen) {
      document.addEventListener("keydown", onKey);
      // disable body scroll
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onKey);
        document.body.style.overflow = prev;
      };
    }
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [isFullPageOpen]);

  // Render calendar content (so we can reuse inside modal and small card)
  const CalendarContent = ({ stopOpen }: { stopOpen?: boolean }) => {
    return (
      <div
        // if stopOpen is true we prevent the outer click-to-open behaviour by stopping propagation here
        onClick={(e) => stopOpen && e.stopPropagation()}
      >
        <div className="bg-white border rounded-md shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <button
                onClick={goPrev}
                className="px-2 py-1 rounded hover:bg-gray-100"
                aria-label="Previous month"
              >
                ‹
              </button>
              <button
                onClick={goToday}
                className="px-2 py-1 rounded text-sm hover:bg-gray-100"
                aria-label="Today"
              >
                today
              </button>
              <button
                onClick={goNext}
                className="px-2 py-1 rounded hover:bg-gray-100"
                aria-label="Next month"
              >
                ›
              </button>
            </div>

            <div className="text-sm text-gray-600 font-medium">
              {monthName} {viewYear}
            </div>

            <div className="text-sm text-gray-500">
              {/* placeholder for controls (view toggles etc) */}
            </div>
          </div>

          <div className="p-3">
            {/* Simple loading / error indicator */}
            {loading && (
              <div className="mb-2 text-sm text-gray-500">Loading timesheets…</div>
            )}
            {error && <div className="mb-2 text-sm text-red-500">Error: {error}</div>}

            <div className="grid grid-cols-7 gap-0 text-xs text-center text-gray-600 mb-2">
              <div className="py-2 font-medium">Sun</div>
              <div className="py-2 font-medium">Mon</div>
              <div className="py-2 font-medium">Tue</div>
              <div className="py-2 font-medium">Wed</div>
              <div className="py-2 font-medium">Thu</div>
              <div className="py-2 font-medium">Fri</div>
              <div className="py-2 font-medium">Sat</div>
            </div>

            <div className="grid grid-rows-6 gap-0">
              {weeks.map((week, wi) => (
                <div
                  key={wi}
                  className="grid grid-cols-7 border-t"
                  style={{ minHeight: 80 }}
                >
                  {week.map((cell, ci) => {
                    const ds = cell.date;
                    const key = cell.key;
                    const dateKey =
                      ds != null
                        ? `${viewYear}-${pad(viewMonth + 1)}-${pad(ds)}`
                        : null;
                    const dayEvents =
                      dateKey && eventsByDate.has(dateKey)
                        ? eventsByDate.get(dateKey) || []
                        : [];
                    return (
                      <div
                        key={key}
                        className={`p-2 text-sm align-top border-r last:border-r-0 ${
                          ds ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div
                            className={`text-xs font-semibold ${
                              ds &&
                              today.getFullYear() === viewYear &&
                              today.getMonth() === viewMonth &&
                              today.getDate() === ds
                                ? "text-white bg-indigo-600 rounded-full w-6 h-6 flex items-center justify-center"
                                : "text-gray-700"
                            }`}
                            style={{ minWidth: 24 }}
                          >
                            {ds ?? ""}
                          </div>
                        </div>

                        {/* events list (limit to 3, show +n if more) */}
                        <div className="mt-2 space-y-2">
                          {dayEvents.slice(0, 3).map((ev) => (
                            <button
                              key={ev.id}
                              onClick={(e) => {
                                e.stopPropagation(); // important: prevent outer click-to-open
                                onEventClick ? onEventClick(ev) : undefined;
                              }}
                              className="block text-left w-full overflow-hidden whitespace-nowrap text-ellipsis px-2 py-1 rounded text-xs bg-blue-500/90 text-white hover:brightness-95"
                              title={`${ev.memo ?? ""} • ${ev.durationHours ?? 0}h`}
                            >
                              <div className="leading-tight text-xs font-medium">
                                {ev.projectShortCode ?? `Task ${ev.taskId ?? ""}`}
                              </div>
                              <div className="text-[11px] opacity-90">
                                {ev.durationHours ?? 0}h
                              </div>
                            </button>
                          ))}

                          {dayEvents.length > 3 && (
                            <div className="text-[11px] text-gray-500">
                              +{dayEvents.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Compact card — clicking this opens full-page modal */}
      <div
        className="cursor-pointer"
        onClick={() => setIsFullPageOpen(true)}
        role="button"
        aria-label="Open full calendar"
      >
        {/* We pass stopOpen=false so interactive children also work but events stopPropagation where needed */}
        <CalendarContent />
      </div>

      {/* Full-page modal */}
      {isFullPageOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4"
          aria-modal="true"
          role="dialog"
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsFullPageOpen(false)}
          />

          {/* full page container */}
          <div className="relative z-10 w-full h-full bg-white rounded shadow-lg overflow-auto">
            {/* header with close */}
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-20">
              <div className="text-lg font-semibold">
                {monthName} {viewYear}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                  }}
                  className="px-3 py-1 rounded hover:bg-gray-100"
                >
                  Prev
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToday();
                  }}
                  className="px-3 py-1 rounded hover:bg-gray-100"
                >
                  Today
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                  }}
                  className="px-3 py-1 rounded hover:bg-gray-100"
                >
                  Next
                </button>

                <button
                  onClick={() => setIsFullPageOpen(false)}
                  className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                  aria-label="Close calendar"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Calendar body — we pass stopOpen to prevent accidental outer opens/closes */}
            <div className="p-4">
              <CalendarContent stopOpen />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
