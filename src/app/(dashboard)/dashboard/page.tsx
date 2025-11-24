// Reference screenshot (used): /mnt/data/Screenshot 2025-11-24 123838.png

"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, Calendar, TrendingUp, Users, Target, AlertCircle } from "lucide-react";

interface Employee { employeeId: string; name: string; departmentName: string; designationName: string; profilePictureUrl?: string; }

const MAIN = process.env.NEXT_PUBLIC_MAIN || "https://chat.swiftandgo.in";
const GATEWAY = process.env.NEXT_PUBLIC_GATEWAY || "https://gateway.example"; // replace with real
const PROFILE_URL = `${MAIN}/employee/me`;
const ACTIVITIES_URL = (date: string) => `${MAIN}/employee/attendance/clock/activities?date=${date}`;
const CLOCK_IN_URL = `${GATEWAY}/employee/attendance/clock/in`;
const CLOCK_OUT_URL = `${GATEWAY}/employee/attendance/clock/out`;

export default function Dashboard() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState("");
  const [showClockModal, setShowClockModal] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [form, setForm] = useState({ clockInLocation: "Office Gate A", clockInWorkingFrom: "Office" });
  const fetchedRef = useRef(false);

  const timelogData = { duration: "4hrs", break: "30 mins", progress: 50 };
  const tasks = [
    { id: "RTA-40", name: "Planning", status: "To do", dueDate: "02/08/2025", priority: "Medium" },
    { id: "RTA-41", name: "Testing", status: "Doing", dueDate: "02/08/2025", priority: "High" },
    { id: "RTA-42", name: "Testing", status: "Incomplete", dueDate: "02/08/2025", priority: "Low" },
  ];
  const counts = { projects: { pending: 8, overdue: 4 }, tasks: { pending: 8, overdue: 4 }, deals: { pending: 2, overdue: 0 }, followUps: { pending: 0, overdue: 0 } };

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    (async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("No access token");
        const r = await fetch(PROFILE_URL, { headers: { Authorization: `Bearer ${token}` } });
        if (!r.ok) throw new Error("Failed to fetch profile");
        const d = await r.json();
        setEmployee({ employeeId: d.employeeId, name: d.name, departmentName: d.departmentName, designationName: d.designationName, profilePictureUrl: d.profilePictureUrl });
      } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
      finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    const tick = () => {
      const t = new Date();
      setNow(`${t.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} • ${t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}`);
    };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);

  const loadActivities = async (date = new Date().toISOString().slice(0, 10)) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const r = await fetch(ACTIVITIES_URL(date), { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) return;
      const d = await r.json();
      const arr = Array.isArray(d) ? d : [];
      setActivities(arr);
      setIsClockedIn(arr.some(a => (a.type === "IN" || a.clockInTime) && !a.clockOutTime));
    } catch { /* ignore */ }
  };
  useEffect(() => { loadActivities(); }, []);

  const hhmmss = (date = new Date()) => date.toTimeString().slice(0, 8);

  const handleClockIn = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No token");
      const body = { clockInTime: hhmmss(new Date()), clockInLocation: form.clockInLocation, clockInWorkingFrom: form.clockInWorkingFrom };
      const r = await fetch(CLOCK_IN_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error("Clock in failed");
      setShowClockModal(false); setIsClockedIn(true); await loadActivities();
    } catch (e) { alert(e instanceof Error ? e.message : String(e)); }
  };

  const handleClockOut = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No token");
      const body = { clockOutTime: hhmmss(new Date()), clockOutLocation: form.clockInLocation, clockOutWorkingFrom: form.clockInWorkingFrom };
      const r = await fetch(CLOCK_OUT_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error("Clock out failed");
      setIsClockedIn(false); await loadActivities();
    } catch (e) { alert(e instanceof Error ? e.message : String(e)); }
  };

  if (loading) return <div className="flex justify-center items-center h-[300px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (error) return <div className="text-destructive p-6">{error}</div>;
  if (!employee) return <div className="text-muted-foreground p-6">No profile data available</div>;

  const ProfileCard = () => (
    <div className="rounded-lg border p-4 flex gap-4 items-center bg-white shadow-sm max-w-md">
      <div className="h-16 w-16 rounded-full overflow-hidden border">
        {employee.profilePictureUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={employee.profilePictureUrl} alt={employee.name} className="h-full w-full object-cover" />
        ) : <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">No Img</div>}
      </div>
      <div>
        <div className="font-medium text-base">{employee.name}</div>
        <div className="text-sm text-muted-foreground">{employee.designationName} · {employee.departmentName}</div>
        <div className="text-xs text-muted-foreground mt-1">Employee Code - {employee.employeeId}</div>
      </div>
    </div>
  );

  const statusColor = (s: string) => s === "To do" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : s === "Doing" ? "bg-blue-100 text-blue-800 border-blue-200" : s === "Incomplete" ? "bg-red-100 text-red-800 border-red-200" : "bg-gray-100 text-gray-800 border-gray-200";
  const priorityColor = (p: string) => p === "High" ? "bg-red-500" : p === "Medium" ? "bg-yellow-500" : "bg-green-500";

  return (
    <div className="max-w-screen-xl p-8 space-y-6">
      {/* Header row: title left; clock/time + button top-right (same line) */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Welcome {employee.name}</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground text-right hidden sm:block">{now}</div>
          {!isClockedIn ? <Button onClick={() => setShowClockModal(true)}><Clock className="mr-2 h-4 w-4" />Clock In</Button> : <Button onClick={handleClockOut} variant="destructive"><Clock className="mr-2 h-4 w-4" />Clock Out</Button>}
        </div>
      </div>

      {/* Below header: left profile, right summary cards arranged */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1">
          <ProfileCard />
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-0 shadow-sm bg-white">
            <div className="p-4">
              <div className="text-sm text-muted-foreground">Projects</div>
              <div className="text-2xl font-bold">{counts.projects.pending}</div>
              <div className="text-xs text-muted-foreground mt-1">{counts.projects.overdue > 0 ? `${counts.projects.overdue} overdue` : "All clear"}</div>
            </div>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <div className="p-4">
              <div className="text-sm text-muted-foreground">Tasks</div>
              <div className="text-2xl font-bold">{counts.tasks.pending}</div>
              <div className="text-xs text-muted-foreground mt-1">{counts.tasks.overdue > 0 ? `${counts.tasks.overdue} overdue` : "All clear"}</div>
            </div>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <div className="p-4">
              <div className="text-sm text-muted-foreground">Follow Ups</div>
              <div className="text-2xl font-bold">{counts.followUps.pending}</div>
              <div className="text-xs text-muted-foreground mt-1">{counts.followUps.overdue > 0 ? `${counts.followUps.overdue} overdue` : "All clear"}</div>
            </div>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <div className="p-4">
              <div className="text-sm text-muted-foreground">Deals</div>
              <div className="text-2xl font-bold">{counts.deals.pending}</div>
              <div className="text-xs text-muted-foreground mt-1">{counts.deals.overdue > 0 ? `${counts.deals.overdue} overdue` : "All clear"}</div>
            </div>
          </Card>
        </div>
      </div>

      {/* IMPORTANT: Tasks table on LEFT (lg:col-span-2) and Timelogs on RIGHT (lg:col-span-1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks: occupies left two columns on large screens */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <div className="p-4">
            <div className="flex items-center gap-2 text-lg"><Calendar className="h-5 w-5 text-primary" />My Tasks</div>
            <div className="mt-4">
              <div className="border rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="p-3 text-left">Task #</th>
                      <th className="p-3 text-left">Task Name</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((t, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-3">{t.id}</td>
                        <td className="p-3">{t.name}</td>
                        <td className="p-3"><Badge className={`${statusColor(t.status)} border`}>{t.status}</Badge></td>
                        <td className="p-3">{t.dueDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Card>

        {/* Timelogs: right column */}
        <Card className="lg:col-span-1 border-0 shadow-sm">
          <div className="p-4">
            <div className="flex items-center gap-2 text-lg"><Clock className="h-5 w-5 text-primary" />Week Timelogs</div>
            <div className="flex justify-center gap-3 mt-4 text-sm">{["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d, ix) => <div key={d} className={`w-8 h-8 rounded-full flex items-center justify-center ${ix === 0 ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>{d}</div>)}</div>
            <div className="mt-4">
              <div className="w-full bg-muted h-3 rounded overflow-hidden">
                <div className="h-full bg-primary" style={{ width: "65%" }} />
                <div className="absolute" />
              </div>
              <div className="text-xs text-muted-foreground mt-2">Duration: {timelogData.duration}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Appreciations + small cards */}
      <div className="space-y-6">
        <Card className="border-0 shadow-sm">
          <div className="p-4 text-lg font-medium">Appreciations</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-50"><tr><th className="p-3 text-left">Given To</th><th className="p-3 text-left">Award Name</th><th className="p-3 text-left">Given On</th><th className="p-3 text-left">Action</th></tr></thead>
              <tbody>
                {[
                  { name: "Riya Sharma", role: "Trainee", award: "Top SDE", date: "20/08/2025" },
                  { name: "Jack Smith", role: "Trainee", award: "Top Assistant Manager", date: "20/08/2025" },
                  { name: "Jack Smith", role: "Trainee", award: "Top Tester", date: "20/08/2025" },
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
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["Birthdays", "On Leave Today", "On Work From Home Today"].map((t, i) => (
            <Card key={i} className="h-40 flex items-center justify-center border-0 shadow-sm">
              <CardContent className="text-center"><div className="font-medium">{t}</div><div className="text-muted-foreground mt-3">— No Record Found —</div></CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Clock In modal */}
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

      {/* small activities list */}
      <div>
        <h3 className="text-lg font-medium mb-2">Today's Activities</h3>
        <div className="space-y-2">
          {activities.length === 0 ? <div className="text-sm text-muted-foreground">No activities</div> : activities.map((a, i) => <div key={i} className="p-2 border rounded">{a.type} • {a.time || a.clockInTime || a.clockOutTime} • {a.location}</div>)}
        </div>
      </div>
    </div>
  );
}
      