"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type Employee = { employeeId: string; name: string; departmentName: string; designationName: string; profilePictureUrl?: string; };

const MAIN = process.env.NEXT_PUBLIC_MAIN || "https://chat.swiftandgo.in";
const GATEWAY = process.env.NEXT_PUBLIC_GATEWAY || MAIN;
const URLS = {
  PROFILE: `${MAIN}/employee/me`,
  PROJECT_COUNTS: `${MAIN}/api/projects/counts`,
  TASK_COUNTS: `${MAIN}/api/projects/tasks/status/counts`,
  DEAL_STATS: `${MAIN}/deals/stats`,
  FOLLOWUPS: `${MAIN}/deals/followups/summary`,
  MY_TASKS: `${MAIN}/me/tasks`,
  TIMESHEET_DAY: (d: string) => `${MAIN}/timesheets/me/day?date=${d}`,
  ACTIVITIES: (d: string) => `${MAIN}/employee/attendance/clock/activities?date=${d}`,
  CLOCK_IN: `${GATEWAY}/employee/attendance/clock/in`,
  CLOCK_OUT: `${GATEWAY}/employee/attendance/clock/out`,
};

export default function Dashboard() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true); // single loading state
  const [now, setNow] = useState("");
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [showClockModal, setShowClockModal] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [timelog, setTimelog] = useState({ duration: "0hrs", progress: 0 });
  const [activities, setActivities] = useState<any[]>([]);
  const [form, setForm] = useState({ clockInLocation: "Office Gate A", clockInWorkingFrom: "Office" });

  const [projectsCnt, setProjectsCnt] = useState({ pending: 0, overdue: 0 });
  const [tasksCnt, setTasksCnt] = useState({ pending: 0, overdue: 0 });
  const [dealsCnt, setDealsCnt] = useState({ totalDeals: 0, convertedDeals: 0 });
  const [followUpCnt, setFollowUpCnt] = useState({ pending: 0, upcoming: 0 });

  const fetchedRef = useRef(false);
  const todayIso = new Date().toISOString().slice(0, 10);
  const [selectedDay, setSelectedDay] = useState(todayIso);

  // helpers
  const hhmmss = (d = new Date()) => d.toTimeString().slice(0, 8);
  const pad = (n: number) => n.toString().padStart(2, "0");
  const statusColor = (s = "") =>
    s.includes("Incomplete") ? "bg-red-100 text-red-800 border-red-200" : s === "Doing" ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-yellow-100 text-yellow-800 border-yellow-200";

  // initial fetch (profile, tasks, counts, today's timesheet & activities)
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    (async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("no token");
        const headers = { Authorization: `Bearer ${token}` };
        const [pRes, tRes, prRes, tkRes, dRes, fRes, tsRes, actRes] = await Promise.all([
          fetch(URLS.PROFILE, { headers }),
          fetch(URLS.MY_TASKS, { headers }),
          fetch(URLS.PROJECT_COUNTS, { headers }),
          fetch(URLS.TASK_COUNTS, { headers }),
          fetch(URLS.DEAL_STATS, { headers }),
          fetch(URLS.FOLLOWUPS, { headers }),
          fetch(URLS.TIMESHEET_DAY(todayIso), { headers }),
          fetch(URLS.ACTIVITIES(todayIso), { headers }),
        ]);

        if (pRes.ok) { const p = await pRes.json(); setEmployee({ employeeId: p.employeeId, name: p.name, departmentName: p.departmentName, designationName: p.designationName, profilePictureUrl: p.profilePictureUrl }); }
        if (tRes.ok) { const t = await tRes.json(); setTasks((t || []).map((it: any) => ({ id: it.id, title: it.title, status: it.taskStage?.name || "N/A", dueDate: it.dueDate || "-", priority: it.priority || (it.labels?.[0]?.name ?? "Low") }))); }
        if (prRes.ok) { const pr = await prRes.json(); setProjectsCnt({ pending: pr.pendingCount ?? 0, overdue: pr.overdueCount ?? 0 }); }
        if (tkRes.ok) { const tk = await tkRes.json(); setTasksCnt({ pending: tk.pendingCount ?? 0, overdue: tk.overdueCount ?? 0 }); }
        if (dRes.ok) { const d = await dRes.json(); setDealsCnt({ totalDeals: d.totalDeals ?? 0, convertedDeals: d.convertedDeals ?? 0 }); }
        if (fRes.ok) { const f = await fRes.json(); setFollowUpCnt({ pending: f.pendingCount ?? 0, upcoming: f.upcomingCount ?? 0 }); }
        if (tsRes.ok) { const ts = await tsRes.json(); const mins = ts?.summary?.totalMinutes ?? Math.round((ts?.summary?.totalHours ?? 0) * 60); setTimelog({ duration: `${Math.round(mins/60)}hrs`, progress: mins ? Math.min(100, Math.round((mins / 480) * 100)) : 0 }); }
        if (actRes.ok) { const a = await actRes.json(); setActivities(Array.isArray(a) ? a : []); setIsClockedIn((a || []).some((x: any) => (x.type === "IN" || x.clockInTime) && !x.clockOutTime)); }
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // live clock
  useEffect(() => {
    const id = setInterval(() => setNow(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })), 1000);
    return () => clearInterval(id);
  }, []);

  // load timesheet & activities for given day
  const loadDay = async (iso: string) => {
    try {
      const token = localStorage.getItem("accessToken"); if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      const [tsRes, actRes] = await Promise.all([fetch(URLS.TIMESHEET_DAY(iso), { headers }), fetch(URLS.ACTIVITIES(iso), { headers })]);
      if (tsRes.ok) { const ts = await tsRes.json(); const mins = ts?.summary?.totalMinutes ?? Math.round((ts?.summary?.totalHours ?? 0) * 60); setTimelog({ duration: `${Math.round(mins/60)}hrs`, progress: mins ? Math.min(100, Math.round((mins / 480) * 100)) : 0 }); } else setTimelog({ duration: "0hrs", progress: 0 });
      if (actRes.ok) { const a = await actRes.json(); setActivities(Array.isArray(a) ? a : []); setIsClockedIn((a || []).some((x: any) => (x.type === "IN" || x.clockInTime) && !x.clockOutTime)); } else setActivities([]);
    } catch (e) { console.warn("loadDay", e); }
  };

  useEffect(() => { loadDay(selectedDay); }, [selectedDay]);

  // week dates (Monday..Sunday)
  const weekDates = (refIso: string) => {
    const ref = new Date(refIso); const dayIdx = ref.getDay();
    const monday = new Date(ref); monday.setDate(ref.getDate() - ((dayIdx + 6) % 7));
    return Array.from({ length: 7 }).map((_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d; });
  };

  const handleClockIn = async () => {
    try {
      const token = localStorage.getItem("accessToken"); if (!token) throw new Error("no token");
      const r = await fetch(URLS.CLOCK_IN, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ clockInTime: hhmmss(new Date()), clockInLocation: form.clockInLocation, clockInWorkingFrom: form.clockInWorkingFrom }) });
      if (!r.ok) throw new Error("clock in failed");
      setIsClockedIn(true); setShowClockModal(false); await loadDay(selectedDay);
    } catch (e) { alert(String(e)); }
  };

  const handleClockOut = async () => {
    try {
      const token = localStorage.getItem("accessToken"); if (!token) throw new Error("no token");
      const r = await fetch(URLS.CLOCK_OUT, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ clockOutTime: hhmmss(new Date()), clockOutLocation: form.clockInLocation, clockOutWorkingFrom: form.clockInWorkingFrom }) });
      if (!r.ok) throw new Error("clock out failed");
      setIsClockedIn(false); await loadDay(selectedDay);
    } catch (e) { alert(String(e)); }
  };

  if (loading) return <div className="flex items-center justify-center h-56">Loading…</div>;
  if (!employee) return <div className="p-6 text-muted-foreground">No profile found</div>;

  const Summary = ({ title, a, aLabel, b, bLabel }: any) => (
    <div className="rounded-lg border p-4 bg-white shadow-sm">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="flex items-center justify-between mt-2">
        <div>
          <div className="text-2xl font-bold">{a}</div>
          <div className="text-xs text-muted-foreground">{aLabel}</div>
        </div>
        {b !== undefined && (
          <div className="text-right">
            <div className="text-lg font-semibold text-destructive">{b}</div>
            <div className="text-xs text-muted-foreground">{bLabel}</div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-screen-xl p-6  space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Welcome {employee.name}</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border p-4 flex items-center gap-4 bg-white">
              <div className="h-16 w-16 rounded-full overflow-hidden border">
                {employee.profilePictureUrl ? <img src={employee.profilePictureUrl} alt={employee.name} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">No Img</div>}
              </div>
              <div>
                <div className="font-medium">{employee.name}</div>
                <div className="text-sm text-muted-foreground">{employee.designationName} · {employee.departmentName}</div>
                <div className="text-xs text-muted-foreground mt-1">Employee Code - {employee.employeeId}</div>
              </div>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-2 gap-2">
              <Summary title="Projects" a={pad(projectsCnt.pending)} aLabel="Pending" b={pad(projectsCnt.overdue)} bLabel="Overdue" />
              <Summary title="Tasks" a={pad(tasksCnt.pending)} aLabel="Pending" b={pad(tasksCnt.overdue)} bLabel="Overdue" />
              <Summary title="Follow Ups" a={pad(followUpCnt.pending)} aLabel="Pending" b={pad(followUpCnt.upcoming)} bLabel="Upcoming" />
              <Summary title="Deals" a={pad(dealsCnt.totalDeals)} aLabel="Total Deals" b={pad(dealsCnt.convertedDeals)} bLabel="Converted Deals" />
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-muted-foreground mb-2">{now}<br /><span className="text-xs">Monday</span></div>
          {!isClockedIn ? <Button onClick={() => setShowClockModal(true)}><Clock className="mr-2 h-4 w-4" />Clock In</Button> : <Button onClick={handleClockOut} variant="destructive"><Clock className="mr-2 h-4 w-4" />Clock Out</Button>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardContent>
              <div className="text-lg font-medium mb-3">My Tasks</div>
              <div className="border rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-blue-50"><tr><th className="p-3 text-left">Task #</th><th className="p-3 text-left">Task Name</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Due Date</th></tr></thead>
                  <tbody>
                    {tasks.map((t, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-3">RTA-40</td>
                        <td className="p-3">{t.title ?? t.name}</td>
                        <td className="p-3"><Badge className={`${statusColor(t.status)} border`}>{t.status}</Badge></td>
                        <td className="p-3">{t.dueDate ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2  mt-40 space-y-4">
          <div className="rounded-lg border p-4 bg-white shadow-sm">
            <div className="flex items-centerjustify-between">
              <div className="text-lg font-medium">Week Timelogs</div>
            </div>

            <div className="mt-4  mr-45 flex justify-center gap-4 text-sm">
              {weekDates(selectedDay).map((d) => {
                const iso = d.toISOString().slice(0, 10);
                const selected = iso === selectedDay;
                return (
                  <button key={iso} onClick={() => setSelectedDay(iso)} type="button"
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${selected ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                    {d.toLocaleDateString([], { weekday: "short" }).slice(0, 2)}
                  </button>
                );
              })}
            </div>

            <div className="mt-4">
              <Progress value={timelog.progress} className="h-3" />
              <div className="text-xs text-muted-foreground mt-2">Duration: {timelog.duration}</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Card className="border-0 shadow-sm">
          <CardContent>
            <div className="text-lg font-medium mb-3">Appreciations</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-blue-50"><tr><th className="p-3 text-left">Given To</th><th className="p-3 text-left">Award Name</th><th className="p-3 text-left">Given On</th><th className="p-3 text-left">Action</th></tr></thead>
                <tbody>
                  {[
                    { name: "Riya Sharma", role: "Trainee", award: "Top SDE", date: "20/08/2025" },
                    { name: "Jack Smith", role: "Trainee", award: "Top Assistant Manager", date: "20/08/2025" },
                    { name: "Jack Smith", role: "Trainee", award: "Top Tester", date: "20/08/2025" },
                    { name: "Jack Smith", role: "Trainee", award: "Top UI/UX Designer", date: "20/08/2025" },
                  ].map((r, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-3 flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-muted" /><div><div className="font-medium">{r.name}</div><div className="text-xs text-muted-foreground">{r.role}</div></div></td>
                      <td className="p-3">{r.award}</td>
                      <td className="p-3">{r.date}</td>
                      <td className="p-3">•••</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["Birthdays", "On Leave Today", "On Work From Home Today"].map((t) => (
          <div key={t} className="rounded-lg border p-6 h-40 bg-white shadow-sm text-center">
            <div className="font-medium">{t}</div>
            <div className="text-muted-foreground mt-6">— No Record Found —</div>
          </div>
        ))}
      </div>

      {showClockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg w-[820px] p-6 relative">
            <button className="absolute right-4 top-4 text-xl" onClick={() => setShowClockModal(false)}>✕</button>
            <div className="flex items-center gap-4 mb-4"><Clock /><div className="font-medium">{new Date().toLocaleDateString()} | {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}</div></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded p-4">
                <label className="text-sm text-muted-foreground">Location</label>
                <select value={form.clockInLocation} onChange={(e) => setForm((s) => ({ ...s, clockInLocation: e.target.value }))} className="w-full mt-2 p-2 border rounded">
                  <option>Office Gate A</option>
                  <option>Office Gate B</option>
                </select>
              </div>
              <div className="border rounded p-4">
                <label className="text-sm text-muted-foreground">Working From *</label>
                <select value={form.clockInWorkingFrom} onChange={(e) => setForm((s) => ({ ...s, clockInWorkingFrom: e.target.value }))} className="w-full mt-2 p-2 border rounded">
                  <option>Office</option>
                  <option>Home</option>
                </select>
              </div>
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
