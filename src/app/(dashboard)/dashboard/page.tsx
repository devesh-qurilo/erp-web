// Reference: clickable week timelog + existing functionality
"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Employee { employeeId: string; name: string; departmentName: string; designationName: string; profilePictureUrl?: string; }

const MAIN = process.env.NEXT_PUBLIC_MAIN || "https://chat.swiftandgo.in";
const GATEWAY = process.env.NEXT_PUBLIC_GATEWAY || MAIN;

const PROFILE_URL = `${MAIN}/employee/me`;
const ACTIVITIES_URL = (date: string) => `${MAIN}/employee/attendance/clock/activities?date=${date}`;
const PROJECT_COUNTS_URL = `${MAIN}/api/projects/counts`;
const TASK_COUNTS_URL = `${MAIN}/api/projects/tasks/status/counts`;
const DEAL_STATS_URL = `${MAIN}/deals/stats`;
const FOLLOWUPS_URL = `${MAIN}/deals/followups/summary`;
const MY_TASKS_URL = `${MAIN}/me/tasks`;
const TIMESHEET_DAY_URL = (date: string) => `${MAIN}/timesheets/me/day?date=${date}`;
const CLOCK_IN_URL = `${GATEWAY}/employee/attendance/clock/in`;
const CLOCK_OUT_URL = `${GATEWAY}/employee/attendance/clock/out`;

export default function Dashboard() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState("");
  const [showClockModal, setShowClockModal] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [form, setForm] = useState({ clockInLocation: "Office Gate A", clockInWorkingFrom: "Office" });
  const [tasks, setTasks] = useState<any[]>([]);
  const [timelogData, setTimelogData] = useState({ duration: "0hrs", progress: 0 });
  const [selectedDay, setSelectedDay] = useState<string>(new Date().toISOString().slice(0, 10)); // ISO date selected (YYYY-MM-DD)

  const fetchedRef = useRef(false);
  const fetchedCountsRef = useRef(false);

  // summary states
  const [projectCounts, setProjectCounts] = useState({ pending: 0, overdue: 0 });
  const [taskCounts, setTaskCounts] = useState({ pending: 0, overdue: 0 });
  const [dealCounts, setDealCounts] = useState({ totalDeals: 0, convertedDeals: 0 });
  const [followUpSummary, setFollowUpSummary] = useState({ pending: 0, upcoming: 0 });

  // helper
  const hhmmss = (d = new Date()) => d.toTimeString().slice(0, 8);

  const statusColor = (s: string) =>
    s === "To do" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
    s === "Doing" ? "bg-blue-100 text-blue-800 border-blue-200" :
    s && s.toLowerCase().includes("complete") ? "bg-green-100 text-green-800 border-green-200" :
    "bg-gray-100 text-gray-800 border-gray-200";

  // load profile, tasks, counts, timesheet for today & activities (only once)
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    (async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("no token");
        const headers = { Authorization: `Bearer ${token}` };
        const today = new Date().toISOString().slice(0, 10);

        // parallel fetches
        const [pRes, myTasksRes, prRes, tkRes, dRes, fRes, tsRes, actRes] = await Promise.all([
          fetch(PROFILE_URL, { headers }),
          fetch(MY_TASKS_URL, { headers }),
          fetch(PROJECT_COUNTS_URL, { headers }),
          fetch(TASK_COUNTS_URL, { headers }),
          fetch(DEAL_STATS_URL, { headers }),
          fetch(FOLLOWUPS_URL, { headers }),
          fetch(TIMESHEET_DAY_URL(today), { headers }),
          fetch(ACTIVITIES_URL(today), { headers }),
        ]);

        if (pRes.ok) { const p = await pRes.json(); setEmployee({ employeeId: p.employeeId, name: p.name, departmentName: p.departmentName, designationName: p.designationName, profilePictureUrl: p.profilePictureUrl }); }
        if (myTasksRes.ok) { const t = await myTasksRes.json(); setTasks((t || []).map((it: any) => ({ id: it.id, title: it.title || it.name, status: it.taskStage?.name || it.status || "N/A", dueDate: it.dueDate || "-", priority: it.priority || (it.labels?.[0]?.name ?? "Low") }))); }

        if (prRes.ok) { const pr = await prRes.json(); setProjectCounts({ pending: pr.pendingCount ?? 0, overdue: pr.overdueCount ?? 0 }); }
        if (tkRes.ok) { const tk = await tkRes.json(); setTaskCounts({ pending: tk.pendingCount ?? 0, overdue: tk.overdueCount ?? 0 }); }
        if (dRes.ok) { const d = await dRes.json(); setDealCounts({ totalDeals: d.totalDeals ?? 0, convertedDeals: d.convertedDeals ?? 0 }); }
        if (fRes.ok) { const f = await fRes.json(); setFollowUpSummary({ pending: f.pendingCount ?? 0, upcoming: f.upcomingCount ?? 0 }); }

        if (tsRes.ok) { const ts = await tsRes.json(); const mins = ts?.summary?.totalMinutes ?? Math.round((ts?.summary?.totalHours ?? 0) * 60); setTimelogData({ duration: `${Math.round(mins/60)}hrs`, progress: mins > 0 ? Math.min(100, Math.round((mins/480)*100)) : 0 }); }
        if (actRes.ok) { const a = await actRes.json(); setActivities(Array.isArray(a) ? a : []); setIsClockedIn((a || []).some((x:any) => (x.type === "IN" || x.clockInTime) && !x.clockOutTime)); }
      } catch (e) {
        console.warn("initial fetch error", e);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // live clock only
  useEffect(() => {
    const tick = () => setNow(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }));
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);

  // load timesheet & activities for selected day
  const loadTimesheetForDay = async (isoDate: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      const [tsRes, actRes] = await Promise.all([
        fetch(TIMESHEET_DAY_URL(isoDate), { headers }),
        fetch(ACTIVITIES_URL(isoDate), { headers }),
      ]);
      if (tsRes.ok) {
        const ts = await tsRes.json();
        const mins = ts?.summary?.totalMinutes ?? Math.round((ts?.summary?.totalHours ?? 0) * 60);
        setTimelogData({ duration: `${Math.round(mins/60)}hrs`, progress: mins > 0 ? Math.min(100, Math.round((mins/480)*100)) : 0 });
      } else {
        setTimelogData({ duration: "0hrs", progress: 0 });
      }
      if (actRes.ok) {
        const a = await actRes.json();
        setActivities(Array.isArray(a) ? a : []);
        setIsClockedIn((a || []).some((x:any) => (x.type === "IN" || x.clockInTime) && !x.clockOutTime));
      } else {
        setActivities([]);
      }
    } catch (e) { console.warn("loadTimesheetForDay error", e); }
  };

  // when selectedDay changes, load that day's timesheet
  useEffect(() => { loadTimesheetForDay(selectedDay); }, [selectedDay]);

  // compute week Dates (Monday..Sunday for the week containing selectedDay)
  const weekDates = (() => {
    const nowDate = new Date(selectedDay);
    const dayIdx = nowDate.getDay(); // 0=Sun..6=Sat
    // compute Monday
    const diffToMon = ((dayIdx + 6) % 7); // number of days to subtract to get Monday
    const monday = new Date(nowDate);
    monday.setDate(nowDate.getDate() - diffToMon);
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  })();

  // clock in/out handlers (unchanged behavior)
  const handleClockIn = async () => {
    try {
      const token = localStorage.getItem("accessToken"); if (!token) throw new Error("no token");
      const body = { clockInTime: hhmmss(new Date()), clockInLocation: form.clockInLocation, clockInWorkingFrom: form.clockInWorkingFrom };
      const r = await fetch(CLOCK_IN_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error("clock in failed");
      setShowClockModal(false); setIsClockedIn(true);
      await loadTimesheetForDay(selectedDay);
    } catch (e) { alert(String(e)); }
  };

  const handleClockOut = async () => {
    try {
      const token = localStorage.getItem("accessToken"); if (!token) throw new Error("no token");
      const body = { clockOutTime: hhmmss(new Date()), clockOutLocation: form.clockInLocation, clockOutWorkingFrom: form.clockInWorkingFrom };
      const r = await fetch(CLOCK_OUT_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error("clock out failed");
      setIsClockedIn(false);
      await loadTimesheetForDay(selectedDay);
    } catch (e) { alert(String(e)); }
  };

  if (loading) return <div className="flex justify-center items-center h-[200px]">Loading…</div>;
  if (!employee) return <div className="p-6 text-muted-foreground">No profile</div>;

  const SummaryCard = ({ title, a, aLabel, aColor, b, bLabel, bColor }:
    { title: string; a: number | string; aLabel?: string; aColor?: string; b?: number | string; bLabel?: string; bColor?: string }) => (
    <Card className="border-0 shadow-sm bg-white">
      <div className="p-4">
        <div className="text-sm text-muted-foreground mb-2">{title}</div>
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-2xl font-bold ${aColor ?? "text-primary"}`}>{a}</div>
            {aLabel && <div className="text-xs text-muted-foreground mt-1">{aLabel}</div>}
          </div>
          {b !== undefined && (
            <div className="text-right">
              <div className={`text-lg font-semibold ${bColor ?? "text-destructive"}`}>{b}</div>
              {bLabel && <div className="text-xs text-muted-foreground mt-1">{bLabel}</div>}
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="max-w-screen-xl p-8 space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Welcome {employee.name}</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">{now}</div>
          {!isClockedIn ? <Button onClick={() => setShowClockModal(true)}><Clock className="mr-2 h-4 w-4" />Clock In</Button> : <Button onClick={handleClockOut} variant="destructive"><Clock className="mr-2 h-4 w-4" />Clock Out</Button>}
        </div>
      </div>

      {/* profile + summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="rounded-lg border p-4 flex gap-4 items-center bg-white shadow-sm">
            <div className="h-16 w-16 rounded-full overflow-hidden border">
              {employee.profilePictureUrl ? <img src={employee.profilePictureUrl} alt={employee.name} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">No Img</div>}
            </div>
            <div>
              <div className="font-medium text-base">{employee.name}</div>
              <div className="text-sm text-muted-foreground">{employee.designationName} · {employee.departmentName}</div>
              <div className="text-xs text-muted-foreground mt-1">Employee Code - {employee.employeeId}</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <SummaryCard title="Projects" a={projectCounts.pending.toString().padStart(2,'0')} aLabel="Pending" aColor="text-blue-600" b={projectCounts.overdue.toString().padStart(2,'0')} bLabel="Overdue" bColor="text-red-500" />
          <SummaryCard title="Tasks" a={taskCounts.pending.toString().padStart(2,'0')} aLabel="Pending" aColor="text-blue-600" b={taskCounts.overdue.toString().padStart(2,'0')} bLabel="Overdue" bColor="text-red-500" />
          <SummaryCard title="Follow Ups" a={followUpSummary.pending.toString().padStart(2,'0')} aLabel="Pending" aColor="text-blue-600" b={followUpSummary.upcoming.toString().padStart(2,'0')} bLabel="Upcoming" bColor="text-green-600" />
          <SummaryCard title="Deals" a={dealCounts.totalDeals.toString().padStart(2,'0')} aLabel="Total Deals" aColor="text-blue-600" b={dealCounts.convertedDeals.toString().padStart(2,'0')} bLabel="Converted Deals" bColor="text-green-600" />
        </div>
      </div>

      {/* tasks left, timelogs right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <div className="p-4">
              <div className="flex items-center gap-2 text-lg"><Calendar className="h-5 w-5 text-primary" />My Tasks</div>
              <div className="mt-4 border rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-blue-50"><tr><th className="p-3 text-left">Task #</th><th className="p-3 text-left">Task Name</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Due Date</th></tr></thead>
                  <tbody>
                    {tasks.map((t, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-3">{t.id}</td>
                        <td className="p-3">{t.title}</td>
                        <td className="p-3"><Badge className={`${statusColor(t.status)} border`}>{t.status}</Badge></td>
                        <td className="p-3">{t.dueDate ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="border-0 shadow-sm">
            <div className="p-4">
              <div className="flex items-center gap-2 text-lg"><Clock className="h-5 w-5 text-primary" />Week Timelogs</div>

              {/* --- Clickable week days (Mon..Sun for selectedDay's week) --- */}
              <div className="flex justify-center gap-3 mt-4 text-sm" role="tablist" aria-label="Week days">
                {weekDates.map((d) => {
                  const iso = d.toISOString().slice(0,10);
                  const isSelected = iso === selectedDay;
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => setSelectedDay(iso)}
                      className={`w-10 h-10 rounded-full flex flex-col items-center justify-center focus:outline-none transition ${
                        isSelected ? "bg-primary text-white ring-2 ring-primary/50" : "bg-muted text-muted-foreground"
                      }`}
                      aria-pressed={isSelected}
                      title={d.toLocaleDateString()}
                    >
                      <span className="text-xs font-medium">{d.toLocaleDateString([], { weekday: "short" }).slice(0,2)}</span>
                      <span className="text-[11px] mt-0.5">{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4">
                <div className="w-full bg-muted h-3 rounded overflow-hidden relative">
                  <div className="h-full bg-primary" style={{ width: `${timelogData.progress}%` }} />
                </div>
                <div className="text-xs text-muted-foreground mt-2">Duration: {timelogData.duration}</div>

                {/* small activities list for selectedDay */}
                <div className="mt-3">
                  <div className="text-sm font-medium mb-2">Activities</div>
                  <div className="space-y-2">
                    {activities.length === 0 ? <div className="text-xs text-muted-foreground">No activities</div> :
                      activities.map((a,i) => <div key={i} className="text-xs p-2 border rounded">{a.type ?? (a.clockInTime ? 'Clock' : 'Activity')} • {a.time ?? a.clockInTime ?? a.clockOutTime} • {a.location ?? a.clockInLocation ?? '-'}</div>)
                    }
                  </div>
                </div>

              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Appreciations */}
      <div className="space-y-6">
        <Card className="border-0 shadow-sm">
          <div className="p-4 text-lg font-medium">Appreciations</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-50"><tr><th className="p-3 text-left">Given To</th><th className="p-3 text-left">Award Name</th><th className="p-3 text-left">Given On</th><th className="p-3 text-left">Action</th></tr></thead>
              <tbody>{[{name:"Riya Sharma",role:"Trainee",award:"Top SDE",date:"20/08/2025"},{name:"Jack Smith",role:"Trainee",award:"Top Tester",date:"20/08/2025"}].map((r,i)=>(<tr key={i} className="border-b"><td className="p-3 flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-muted" /><div><div className="font-medium">{r.name}</div><div className="text-xs text-muted-foreground">{r.role}</div></div></td><td className="p-3">{r.award}</td><td className="p-3">{r.date}</td><td className="p-3">•••</td></tr>))}</tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Clock modal (unchanged) */}
      {showClockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg w-[820px] p-6 relative">
            <button className="absolute right-4 top-4 text-xl" onClick={() => setShowClockModal(false)}>✕</button>
            <div className="flex items-center gap-4 mb-4"><Clock /><div className="font-medium">{new Date().toLocaleDateString()} | {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}</div></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="border rounded p-4">
                  <label className="text-sm text-muted-foreground">Location</label>
                  <select value={form.clockInLocation} onChange={e => setForm(s => ({ ...s, clockInLocation: e.target.value }))} className="w-full mt-2 p-2 border rounded">
                    <option>Office Gate A</option>
                    <option>Office Gate B</option>
                  </select>
                  <label className="text-sm text-muted-foreground mt-4 block">Working From *</label>
                  <select value={form.clockInWorkingFrom} onChange={e => setForm(s => ({ ...s, clockInWorkingFrom: e.target.value }))} className="w-full mt-2 p-2 border rounded">
                    <option>Office</option>
                    <option>Home</option>
                  </select>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button className="px-4 py-2 border rounded" onClick={() => setShowClockModal(false)}>Cancel</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleClockIn}>Clock In</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
