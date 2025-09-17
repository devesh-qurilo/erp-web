"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  List,
  Calendar,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Table,
  Trash2,
} from "lucide-react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

type Timesheet = {
  code: string;
  task: string;
  project: string;
  employee: string;
  role: string;
  avatar: string;
  startTime: string;
  endTime: string;
  hours: string;
  earnings: string;
};

const initialData: Timesheet[] = Array.from({ length: 20 }, (_, i) => ({
  code: "RTA-40",
  task: "Task Name",
  project: "Project Name",
  employee: "Jack Smith",
  role: "Trainee",
  avatar: "https://i.pravatar.cc/40?img=3",
  startTime: "02/08/2025 11:00 AM",
  endTime: "02/08/2025 01:00 PM",
  hours: "2h",
  earnings: "$375.00",
}));

// ---- Weekly Timesheet Types ----
type TaskRow = {
  id: number;
  task: string;
  hours: { [day: string]: number };
};

const weekDays = [
  { key: "mon", label: "MONDAY", date: "15 SEP" },
  { key: "tue", label: "TUESDAY", date: "16 SEP" },
  { key: "wed", label: "WEDNESDAY", date: "17 SEP" },
  { key: "thu", label: "THURSDAY", date: "18 SEP" },
  { key: "fri", label: "FRIDAY", date: "19 SEP" },
  { key: "sat", label: "SATURDAY", date: "20 SEP" },
  { key: "sun", label: "SUNDAY", date: "21 SEP" },
];

export default function TimesheetPage() {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [view, setView] = useState("list");
  const [selectedEmployee, setSelectedEmployee] = useState<Timesheet | null>(
    null
  );
  const perPage = 9;

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleDateClick = (info: any) => {
    setSelectedDate(info.dateStr); // capture clicked date
  };

  // ---- Weekly Timesheet State ----
  const [rows, setRows] = useState<TaskRow[]>([{ id: 1, task: "", hours: {} }]);

  const addRow = () =>
    setRows([...rows, { id: Date.now(), task: "", hours: {} }]);
  const removeRow = (id: number) => setRows(rows.filter((r) => r.id !== id));
  const updateTask = (id: number, task: string) =>
    setRows(rows.map((r) => (r.id === id ? { ...r, task } : r)));
  const updateHours = (id: number, day: string, value: number) =>
    setRows(
      rows.map((r) =>
        r.id === id ? { ...r, hours: { ...r.hours, [day]: value } } : r
      )
    );
  const totalPerDay = (day: string) =>
    rows.reduce((sum, r) => sum + (r.hours[day] || 0), 0);
  const totalPerRow = (row: TaskRow) =>
    weekDays.reduce((sum, d) => sum + (row.hours[d.key] || 0), 0);

  // ✅ Filtering
  const filtered = data.filter((t) => {
    const matchesSearch =
      t.task.toLowerCase().includes(search.toLowerCase()) ||
      t.project.toLowerCase().includes(search.toLowerCase()) ||
      t.employee.toLowerCase().includes(search.toLowerCase());

    const matchesEmployee =
      employeeFilter === "All" || t.employee === employeeFilter;

    const matchesDept =
      departmentFilter === "All" || t.role === departmentFilter;

    return matchesSearch && matchesEmployee && matchesDept;
  });

  // ✅ Pagination
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // ✅ Add new log
  const addLog = () => {
    const newEntry: Timesheet = {
      code: "RTA-41",
      task: "New Task",
      project: "New Project",
      employee: "Taylor Reed",
      role: "Developer",
      avatar: "https://i.pravatar.cc/40?img=5",
      startTime: "03/08/2025 09:00 AM",
      endTime: "03/08/2025 11:00 AM",
      hours: "2h",
      earnings: "$420.00",
    };
    setData([newEntry, ...data]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="p-6 border-b bg-white shadow-sm flex justify-between items-center">
        <h1 className="text-2xl font-bold">Timesheet</h1>
        <button className="p-2 rounded hover:bg-gray-100">
          <Filter size={18} />
        </button>
      </div>

      {/* Filters + Actions */}
      <div className="p-4 bg-white border-b flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Start Date to End Date"
          className="border px-3 py-2 rounded text-sm"
        />
        <select
          value={employeeFilter}
          onChange={(e) => setEmployeeFilter(e.target.value)}
          className="border px-3 py-2 rounded text-sm"
        >
          <option value="All">Employee: All</option>
          <option value="Jack Smith">Jack Smith</option>
          <option value="Taylor Reed">Taylor Reed</option>
        </select>
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="border px-3 py-2 rounded text-sm"
        >
          <option value="All">Department: All</option>
          <option value="Trainee">Trainee</option>
          <option value="Developer">Developer</option>
        </select>

        <button
          onClick={addLog}
          className="ml-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Log Time
        </button>

        {/* Search + View Toggle */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="relative">
            <Search className="absolute left-2 top-2 text-gray-400" size={16} />
            <input
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-7 pr-2 py-1 border rounded text-sm"
            />
          </div>
          <button
            onClick={() => setView("list")}
            className={`p-2 rounded ${
              view === "list" ? "bg-gray-200" : "hover:bg-gray-100"
            }`}
          >
            <List size={18} />
          </button>

          <button
            onClick={() => setView("calendar")}
            className={`p-2 rounded ${
              view === "calendar" ? "bg-gray-200" : "hover:bg-gray-100"
            }`}
          >
            <Calendar size={18} />
          </button>
          <button
            onClick={() => setView("weekly")}
            className={`p-2 rounded ${
              view === "weekly" ? "bg-gray-200" : "hover:bg-gray-100"
            }`}
          >
            <Table size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* ---------------- LIST VIEW ---------------- */}
        {view === "list" && (
          <div className="bg-white rounded-2xl shadow-md border overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-blue-50 text-left">
                <tr>
                  <th className="p-2 border">Code</th>
                  <th className="p-2 border">Task</th>
                  <th className="p-2 border">Employee</th>
                  <th className="p-2 border">Start Time</th>
                  <th className="p-2 border">End Time</th>
                  <th className="p-2 border">Total Hours</th>
                  <th className="p-2 border">Earnings</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((t, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-50 border-t cursor-pointer"
                    onClick={() => {
                      setSelectedEmployee(t);
                      setView("employee timelog");
                    }}
                  >
                    <td className="p-2 border">{t.code}</td>
                    <td className="p-2 border">
                      {t.task}
                      <div className="text-xs text-gray-500">{t.project}</div>
                    </td>
                    <td className="p-2 border flex items-center gap-2">
                      <img
                        src={t.avatar}
                        className="w-8 h-8 rounded-full border"
                        alt="avatar"
                      />
                      <div>
                        <div className="font-medium">{t.employee}</div>
                        <div className="text-xs text-gray-500">{t.role}</div>
                      </div>
                    </td>
                    <td className="p-2 border">{t.startTime}</td>
                    <td className="p-2 border">{t.endTime}</td>
                    <td className="p-2 border">{t.hours}</td>
                    <td className="p-2 border">{t.earnings}</td>
                    <td className="p-2 border text-center">
                      <button className="p-2 rounded hover:bg-gray-100">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-between items-center p-3 text-sm text-gray-600">
              <div>Result per page: {perPage}</div>
              <div>
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded disabled:opacity-50"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded disabled:opacity-50"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- CALENDAR VIEW ---------------- */}
        {view === "calendar" && (
          <div className="bg-white p-6 rounded-xl shadow">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              dateClick={handleDateClick}
              events={[
                { title: "01hr 00mins", date: "2025-08-28" },
                { title: "02hrs 00mins", date: "2025-08-29" },
                { title: "04hrs 00mins", date: "2025-08-06" },
                { title: "04hrs 00mins", date: "2025-08-09" },
                { title: "01hr 00mins", date: "2025-08-15" },
              ]}
            />

            {selectedDate && (
              <div className="mt-6 p-4 border rounded shadow text-left">
                <h2 className="text-lg font-semibold">
                  Details for {selectedDate}
                </h2>
                <p className="text-gray-600">
                  Show logs or allow adding tasks here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ---------------- EMPLOYEE TIMELOG VIEW ---------------- */}
        {view === "employee timelog" && selectedEmployee && (
          <div className="bg-white p-6 rounded-xl shadow">
            <button
              onClick={() => setView("list")}
              className="mb-4 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              ← Back
            </button>

            <div className="flex items-center gap-4 border-b pb-4 mb-4">
              <img
                src={selectedEmployee.avatar}
                alt="avatar"
                className="w-12 h-12 rounded-full border"
              />
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedEmployee.employee}
                </h2>
                <p className="text-gray-500">{selectedEmployee.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 border rounded-lg">
                <p className="text-gray-500 text-sm">Total Hours</p>
                <p className="text-lg font-semibold">
                  {selectedEmployee.hours}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-gray-500 text-sm">Earnings</p>
                <p className="text-lg font-semibold">
                  {selectedEmployee.earnings}
                </p>
              </div>
            </div>

            <h3 className="font-semibold mb-2">Time Logs</h3>
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Code</th>
                  <th className="p-2 border">Task</th>
                  <th className="p-2 border">Project</th>
                  <th className="p-2 border">Start</th>
                  <th className="p-2 border">End</th>
                  <th className="p-2 border">Hours</th>
                  <th className="p-2 border">Earnings</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border">{selectedEmployee.code}</td>
                  <td className="p-2 border">{selectedEmployee.task}</td>
                  <td className="p-2 border">{selectedEmployee.project}</td>
                  <td className="p-2 border">{selectedEmployee.startTime}</td>
                  <td className="p-2 border">{selectedEmployee.endTime}</td>
                  <td className="p-2 border">{selectedEmployee.hours}</td>
                  <td className="p-2 border">{selectedEmployee.earnings}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ---------------- WEEKLY TIMESHEET VIEW ---------------- */}
        {view === "weekly" && (
          <div className="bg-white rounded-2xl shadow-md border p-4">
            <div className="flex justify-center items-center mb-4">
              <button className="p-2 hover:bg-gray-200 rounded">
                <ChevronLeft size={18} />
              </button>
              <span className="mx-4 font-semibold">15 Sep - 21 Sep</span>
              <button className="p-2 hover:bg-gray-200 rounded">
                <ChevronRight size={18} />
              </button>
            </div>

            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-100 text-center">
                <tr>
                  <th className="p-2 text-left">Task</th>
                  {weekDays.map((d) => (
                    <th key={d.key} className="p-2">
                      <div className="font-semibold">{d.date}</div>
                      <div className="text-xs text-gray-500">{d.label}</div>
                    </th>
                  ))}
                  <th className="p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="p-2 flex items-center gap-2">
                      <select
                        value={row.task}
                        onChange={(e) => updateTask(row.id, e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        <option value="">Nothing selected</option>
                        <option value="Design">Design</option>
                        <option value="Development">Development</option>
                        <option value="Testing">Testing</option>
                      </select>
                      <button
                        onClick={() => removeRow(row.id)}
                        className="p-1 text-red-500 hover:bg-gray-100 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                    {weekDays.map((d) => (
                      <td key={d.key} className="p-2 text-center">
                        <input
                          type="number"
                          min={0}
                          value={row.hours[d.key] || ""}
                          onChange={(e) =>
                            updateHours(row.id, d.key, Number(e.target.value))
                          }
                          className="w-16 border rounded px-1 text-center"
                        />
                      </td>
                    ))}
                    <td className="p-2 text-center font-semibold">
                      {totalPerRow(row)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-semibold">
                <tr>
                  <td className="p-2">Total</td>
                  {weekDays.map((d) => (
                    <td key={d.key} className="p-2 text-center">
                      {totalPerDay(d.key)}
                    </td>
                  ))}
                  <td className="p-2 text-center">
                    {rows.reduce((s, r) => s + totalPerRow(r), 0)}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="mt-4 flex gap-2">
              <button
                onClick={addRow}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                + Add Task
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Save Timesheet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
