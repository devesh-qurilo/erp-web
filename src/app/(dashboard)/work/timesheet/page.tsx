"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  ChevronLeft,
  ChevronRight,
  Search,
  Edit2,
  Trash2,
  Grid,
  Calendar,
  List,
  X,
  Eye,
  MoreVertical,
  User,
} from "lucide-react";

import WeeklyTimesheetModal from "./components/WeeklyTimesheetModal";

const MAIN =
  process.env.NEXT_PUBLIC_MAIN ||
  "https://6jnqmj85-80.inc1.devtunnels.ms";

type EmployeeItem = {
  employeeId: string;
  name: string;
  profileUrl?: string | null;
  designation?: string | null;
  department?: string | null;
};

type Timesheet = {
  id: number;
  projectId?: number;
  projectShortCode?: string;
  taskId?: number;
  employeeId?: string;
  employees?: EmployeeItem[];
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  memo?: string;
  durationHours?: number;
  createdBy?: string;
  createdAt?: string;
};

type ProjectOption = {
  id: number | string | null;
  shortCode: string;
  name?: string;
  assignedEmployees?: EmployeeItem[];
};

type ProjectTask = {
  id: number;
  title?: string;
  projectId?: number;
  projectShortCode?: string;
  assignedEmployees?: EmployeeItem[];
};

export default function TimesheetPage() {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState<string>("All");
  const [departmentFilter, setDepartmentFilter] = useState<string>("All");

  const [showFilters, setShowFilters] = useState(false);
  const [filterEmployee, setFilterEmployee] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 9;

  type ViewMode = "table" | "list" | "calendar" | "weekly";
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // ===== Log Time + Action =====
  const [showLogModal, setShowLogModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    projectId: "", // projectId as string
    taskId: "",
    employeeId: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    memo: "",
  });

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Timesheet | null>(null);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // ===== Weekly modal state =====
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);

  // ====== Projects for dropdown ======
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  // ====== Tasks for selected project ======
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);
  const [selectedTaskEmployees, setSelectedTaskEmployees] = useState<EmployeeItem[]>([]);

  // map: projectId -> assignedEmployees (from AllProject)
  const projectEmployeeMap = useMemo(() => {
    const map = new Map<string, EmployeeItem[]>();
    projectOptions.forEach((p) => {
      if (p.id != null && p.assignedEmployees?.length) {
        map.set(String(p.id), p.assignedEmployees);
      }
    });
    return map;
  }, [projectOptions]);

  // ====== Derived from timesheets ======
  const employeeOptions = useMemo(() => {
    const s = new Set<string>();
    timesheets.forEach((t) => {
      if (t.employees && t.employees.length > 0) {
        t.employees.forEach((e) => {
          if (e?.employeeId) s.add(e.employeeId);
        });
      } else if (t.employeeId) {
        s.add(t.employeeId);
      }
    });
    return ["--", ...Array.from(s)];
  }, [timesheets]);

  const employeeMap = useMemo(() => {
    const map = new Map<string, EmployeeItem>();
    timesheets.forEach((t) => {
      t.employees?.forEach((e) => {
        if (e?.employeeId && !map.has(e.employeeId)) {
          map.set(e.employeeId, e);
        }
      });
    });
    return map;
  }, [timesheets]);

  const getEmployeeLabel = (id: string) => {
    if (!id || id === "--") return "--";
    const emp = employeeMap.get(id);
    if (emp?.name) return `${emp.name} (${id})`;
    return id;
  };

  const allTaskOptions = useMemo(() => {
    const s = new Set<number>();
    timesheets.forEach((t) => {
      if (typeof t.taskId === "number") s.add(t.taskId);
    });
    return ["--", ...Array.from(s).map((n) => String(n))];
  }, [timesheets]);

  const getTaskLabel = (idStr: string) => {
    if (!idStr || idStr === "--") return "--";
    const id = Number(idStr);
    const t = projectTasks.find((pt) => pt.id === id);
    if (t?.title) return `Task ${id} - ${t.title}`;
    return `Task ${idStr}`;
  };

  const departmentOptions = useMemo(() => {
    const s = new Set<string>();
    timesheets.forEach((t) =>
      t.employees?.forEach(
        (e) => e?.department && s.add(e.department)
      )
    );
    return ["All", ...Array.from(s)];
  }, [timesheets]);

  function formatDateTime(dateISO?: string, time?: string) {
    if (!dateISO) return "";
    try {
      const combined = time
        ? `${dateISO}T${time}`
        : `${dateISO}T00:00:00`;
      const d = new Date(combined);
      if (Number.isNaN(d.getTime())) return `${dateISO} ${time ?? ""}`;
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      if (hours === 0) hours = 12;
      return `${dd}/${mm}/${yyyy} ${hours}:${minutes} ${ampm}`;
    } catch {
      return `${dateISO} ${time ?? ""}`;
    }
  }

  const fmtDateTime = (date?: string, time?: string) =>
    formatDateTime(date, time);

  const computeDurationHours = (
    sDate?: string,
    sTime?: string,
    eDate?: string,
    eTime?: string
  ) => {
    if (!sDate || !eDate) return 0;
    try {
      const sParts = sDate.split("-").map(Number);
      const eParts = eDate.split("-").map(Number);
      let sH = 0,
        sM = 0,
        eH = 0,
        eM = 0;
      if (sTime) [sH, sM] = sTime.split(":").map((v) => Number(v));
      if (eTime) [eH, eM] = eTime.split(":").map((v) => Number(v));
      const start = new Date(
        sParts[0],
        sParts[1] - 1,
        sParts[2],
        sH,
        sM
      );
      const end = new Date(
        eParts[0],
        eParts[1] - 1,
        eParts[2],
        eH,
        eM
      );
      const diffMs = end.getTime() - start.getTime();
      if (isNaN(diffMs) || diffMs <= 0) return 0;
      return Math.round(diffMs / (1000 * 60 * 60)); // hours
    } catch {
      return 0;
    }
  };

  const modalTotalHours = computeDurationHours(
    form.startDate,
    form.startTime,
    form.endDate,
    form.endTime
  );

  // ====== load timesheets ======
  const loadTimesheets = useCallback(
    async (accessToken?: string | null) => {
      setLoading(true);
      setError(null);
      try {
        const resolvedToken =
          accessToken ||
          token ||
          (typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null);
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(itemsPerPage),
          search: searchQuery || "",
          employee: filterEmployee !== "all" ? filterEmployee : "",
          department:
            filterDepartment !== "all" ? filterDepartment : "",
        });
        const url = `${MAIN}/timesheets?${params.toString()}`;
        const res = await fetch(url, {
          method: "GET",
          headers: resolvedToken
            ? {
                Authorization: `Bearer ${resolvedToken}`,
                Accept: "application/json",
              }
            : { Accept: "application/json" },
          cache: "no-store",
        });
        if (res.status === 401) {
          try {
            localStorage.removeItem("accessToken");
          } catch {}
          setToken(null);
          setTimesheets([]);
          setTotalPages(1);
          setLoading(false);
          return;
        }
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          console.error(
            "timesheets fetch failed",
            res.status,
            txt
          );
          throw new Error(
            `Failed to load timesheets (${res.status})`
          );
        }
        const data = await res.json();
        let items: Timesheet[] = [];
        if (Array.isArray(data)) {
          items = data;
          setTotalPages(
            Math.max(1, Math.ceil((data.length || 0) / itemsPerPage))
          );
        } else {
          items = Array.isArray(data.items) ? data.items : [];
          setTotalPages(
            data.totalPages ?? 
              Math.max(
                1,
                Math.ceil(
                  (data.total ?? items.length) / itemsPerPage
                )
              )
          );
        }
        setTimesheets(items);
      } catch (err: any) {
        console.error("loadTimesheets error", err);
        setError(String(err?.message ?? err));
        setTimesheets([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [
      currentPage,
      searchQuery,
      filterEmployee,
      filterDepartment,
      token,
    ]
  );

  // ====== load projects for Project dropdown ======
  const loadProjects = useCallback(
    async (accessToken?: string | null) => {
      setProjectsLoading(true);
      setProjectsError(null);
      try {
        const resolvedToken =
          accessToken ||
          token ||
          (typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null);
        const url = `${MAIN}/projects/AllProject`;
        const res = await fetch(url, {
          method: "GET",
          headers: resolvedToken
            ? {
                Authorization: `Bearer ${resolvedToken}`,
                Accept: "application/json",
              }
            : { Accept: "application/json" },
          cache: "no-store",
        });
        if (res.status === 401) {
          try {
            localStorage.removeItem("accessToken");
          } catch {}
          setToken(null);
          setProjectOptions([]);
          setProjectsLoading(false);
          return;
        }
        if (!res.ok) {
          const txt = await res
            .text()
            .catch(() => "");
          console.error(
            "projects fetch failed",
            res.status,
            txt
          );
          throw new Error(
            `Failed to load projects (${res.status})`
          );
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          const list: ProjectOption[] = [];
          data.forEach((p: any) => {
            const sc = (p?.shortCode ?? "")
              .toString()
              .trim();
            const id =
              p?.id ??
              p?.projectId ??
              p?._id ??
              null;
            const name = (p?.name ?? "")
              .toString()
              .trim();
            const assignedEmployees: EmployeeItem[] =
              Array.isArray(p?.assignedEmployees)
                ? p.assignedEmployees
                : [];
            if (id != null && sc) {
              list.push({
                id,
                shortCode: sc,
                name,
                assignedEmployees,
              });
            }
          });
          const seen = new Set<string>();
          const deduped: ProjectOption[] = [];
          list.forEach((p) => {
            if (!seen.has(String(p.id))) {
              seen.add(String(p.id));
              deduped.push(p);
            }
          });
          setProjectOptions(deduped);
        } else {
          console.warn("unexpected projects response", data);
          setProjectOptions([]);
        }
      } catch (err: any) {
        console.error("loadProjects error", err);
        setProjectsError(String(err?.message ?? err));
        setProjectOptions([]);
      } finally {
        setProjectsLoading(false);
      }
    },
    [token]
  );

  // ====== fetch tasks for a project ======
  const fetchProjectTasks = useCallback(
    async (projectIdRaw: string | number, preselectTaskId?: number | null) => {
      if (!projectIdRaw) {
        setProjectTasks([]);
        setSelectedTaskEmployees([]);
        return;
      }

      const projectIdNum = Number(projectIdRaw);
      if (!projectIdNum || Number.isNaN(projectIdNum)) {
        setProjectTasks([]);
        setSelectedTaskEmployees([]);
        return;
      }

      try {
        const resolvedToken =
          token ||
          (typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null);
        const url = `${MAIN}/projects/${projectIdNum}/tasks`;
        const res = await fetch(url, {
          method: "GET",
          headers: resolvedToken
            ? {
                Authorization: `Bearer ${resolvedToken}`,
                Accept: "application/json",
              }
            : { Accept: "application/json" },
          cache: "no-store",
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          console.error(
            "project tasks fetch failed",
            res.status,
            txt
          );
          setProjectTasks([]);
          setSelectedTaskEmployees([]);
          return;
        }

        const data = await res.json();
        const list: ProjectTask[] = Array.isArray(data)
          ? data
          : [];
        setProjectTasks(list);

        if (preselectTaskId != null && list.length > 0) {
          const task = list.find((t) => t.id === preselectTaskId);
          setSelectedTaskEmployees(
            task?.assignedEmployees ?? []
          );
        } else {
          setSelectedTaskEmployees([]);
        }
      } catch (err) {
        console.error("fetchProjectTasks error", err);
        setProjectTasks([]);
        setSelectedTaskEmployees([]);
      }
    },
    [token]
  );

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery((prev) => {
        if (prev !== searchInput) {
          setCurrentPage(1);
          return searchInput;
        }
        return prev;
      });
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("accessToken");
      setToken(saved);
      loadTimesheets(saved);
      loadProjects(saved);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (token) {
      loadTimesheets(token);
      loadProjects(token);
    } else {
      loadTimesheets(null);
      loadProjects(null);
    }
  }, [
    loadTimesheets,
    loadProjects,
    token,
    currentPage,
    searchQuery,
    filterEmployee,
    filterDepartment,
  ]);

  // ===== open Log Time modal (create / edit) =====
  const openLogForm = (row?: Timesheet) => {
    setProjectTasks([]);
    setSelectedTaskEmployees([]);

    if (!row) {
      setEditingId(null);
      setForm({
        projectId: "",
        taskId: "",
        employeeId: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        memo: "",
      });
    } else {
      const emp =
        row.employees && row.employees[0]
          ? row.employees[0]
          : undefined;
      setEditingId(row.id);
      setForm({
        projectId:
          row.projectId !== undefined &&
          row.projectId !== null
            ? String(row.projectId)
            : "",
        taskId:
          row.taskId !== undefined && row.taskId !== null
            ? String(row.taskId)
            : "",
        employeeId:
          row.employeeId ??
          emp?.employeeId ??
          "",
        startDate: row.startDate ?? "",
        startTime: row.startTime ?? "",
        endDate: row.endDate ?? "",
        endTime: row.endTime ?? "",
        memo: row.memo ?? "",
      });

      if (row.projectId) {
        fetchProjectTasks(
          row.projectId,
          row.taskId ?? null
        );
      }
    }
    setSaveError(null);
    setShowLogModal(true);
  };

  const saveEntry = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      if (
        !form.projectId ||
        !form.taskId ||
        !form.employeeId ||
        !form.startDate ||
        !form.startTime ||
        !form.endDate ||
        !form.endTime ||
        !form.memo
      ) {
        setSaveError("Please fill all required fields.");
        setSaving(false);
        return;
      }

      const payload: any = {
        projectId: Number(form.projectId), // projectId numeric
        taskId: Number(form.taskId),
        employeeId: form.employeeId,
        startDate: form.startDate,
        startTime: form.startTime,
        endDate: form.endDate,
        endTime: form.endTime,
        memo: form.memo,
        durationHours: computeDurationHours(
          form.startDate,
          form.startTime,
          form.endDate,
          form.endTime
        ),
      };

      const resolvedToken =
        token ||
        (typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null);

      const url = editingId
        ? `${MAIN}/timesheets/${editingId}`
        : `${MAIN}/timesheets`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          ...(resolvedToken
            ? { Authorization: `Bearer ${resolvedToken}` }
            : {}),
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("save entry failed", res.status, text);
        throw new Error("Failed to save entry");
      }

      setShowLogModal(false);
      setEditingId(null);
      setForm({
        projectId: "",
        taskId: "",
        employeeId: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        memo: "",
      });
      await loadTimesheets(token ?? null);
    } catch (err: any) {
      console.error("saveEntry error", err);
      setSaveError(err?.message || "Failed to save entry");
    } finally {
      setSaving(false);
    }
  };

  // ===== View + Delete =====
  const openView = (row: Timesheet) => {
    setSelectedRow(row);
    setIsViewOpen(true);
    setOpenMenuId(null);
  };

  const openDelete = (row: Timesheet) => {
    setSelectedRow(row);
    setIsDeleteConfirmOpen(true);
    setOpenMenuId(null);
    setSaveError(null);
  };

  const deleteTimesheet = async () => {
    if (!selectedRow) return;
    setSaving(true);
    setSaveError(null);
    try {
      const resolvedToken =
        token ||
        (typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null);
      const res = await fetch(
        `${MAIN}/timesheets/${selectedRow.id}`,
        {
          method: "DELETE",
          headers: resolvedToken
            ? { Authorization: `Bearer ${resolvedToken}` }
            : undefined,
        }
      );
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.error(
          "deleteTimesheet failed",
          res.status,
          txt
        );
        throw new Error("Failed to delete timesheet");
      }
      setIsDeleteConfirmOpen(false);
      setSelectedRow(null);
      await loadTimesheets(token ?? null);
    } catch (err: any) {
      console.error("deleteTimesheet error", err);
      setSaveError(err?.message || "Failed to delete timesheet");
    } finally {
      setSaving(false);
    }
  };

  // small row rendering
  const TimesheetRow: React.FC<{ t: Timesheet }> = ({ t }) => {
    const employee =
      t.employees && t.employees.length > 0
        ? t.employees[0]
        : undefined;
    const avatar =
      employee?.profileUrl ??
      "/_next/static/media/avatar-placeholder.7b9f2b3a.jpg";

    return (
      <tr
        key={t.id}
        className="even:bg-white odd:bg-white border-t"
      >
        <td className="py-4 px-4 text-sm text-gray-700 border-r align-top">
          {t.projectShortCode ?? "—"}
        </td>
        <td className="py-4 px-4 border-r align-top">
          <div className="text-sm font-medium">
            Task {t.taskId ?? "—"}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {t.memo ?? ""}
          </div>
        </td>
        <td className="py-4 px-4 w-48 border-r align-top">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img
                src={avatar}
                alt={employee?.name ?? "employee"}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-sm text-gray-800">
                {employee?.name ??
                  t.employeeId ??
                  "—"}
              </div>
              <div className="text-xs text-gray-400">
                {employee?.designation ??
                  employee?.department ??
                  ""}
              </div>
            </div>
          </div>
        </td>
        <td className="py-4 px-4 border-r align-top text-sm text-gray-600">
          {fmtDateTime(t.startDate, t.startTime)}
        </td>
        <td className="py-4 px-4 border-r align-top text-sm text-gray-600">
          {fmtDateTime(t.endDate, t.endTime)}
        </td>
        <td className="py-4 px-4 border-r align-top text-sm text-gray-700">
          {t.durationHours ?? 0}h
        </td>
        <td className="py-4 px-4 align-top text-right">
          <div className="inline-flex items-center relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId((cur) =>
                  cur === t.id ? null : t.id
                );
              }}
              className="p-2 rounded hover:bg-gray-100"
              title="Actions"
              aria-expanded={openMenuId === t.id}
            >
              <MoreVertical className="h-5 w-5 text-gray-600" />
            </button>

            {openMenuId === t.id && (
              <>
                <div
                  onClick={() => setOpenMenuId(null)}
                  className="fixed inset-0 z-[10005]"
                />
                <div className="absolute right-0 top-8 z-[10010] w-44 bg-white rounded-md border shadow-lg">
                  <div className="p-2">
                    <button
                      onClick={() => openView(t)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 text-sm text-gray-700"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={() => openLogForm(t)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 text-sm text-gray-700"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => openDelete(t)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 text-sm text-red-600"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  useEffect(() => {
    setOpenMenuId(null);
  }, [currentPage, viewMode]);

  // filtered list for display
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return timesheets.filter((t) => {
      if (employeeFilter !== "All") {
        const hasByEmpObj = (t.employees ?? []).some(
          (e) => e.employeeId === employeeFilter
        );
        const hasByEmpId = t.employeeId === employeeFilter;
        if (!hasByEmpObj && !hasByEmpId) return false;
      }
      if (departmentFilter !== "All") {
        const has = (t.employees ?? []).some(
          (e) => e.department === departmentFilter
        );
        if (!has) return false;
      }
      if (!q) return true;
      if (
        String(t.projectShortCode ?? "")
          .toLowerCase()
          .includes(q)
      )
        return true;
      if (
        String(t.memo ?? "")
          .toLowerCase()
          .includes(q)
      )
        return true;
      const empMatch = (t.employees ?? []).some(
        (e) =>
          (e.name ?? "")
            .toLowerCase()
            .includes(q) ||
          (e.designation ?? "")
            .toLowerCase()
            .includes(q)
      );
      if (empMatch) return true;
      return false;
    });
  }, [
    timesheets,
    searchQuery,
    employeeFilter,
    departmentFilter,
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="w-full">
        <div className="max-w-[1180px] mx-auto ">
          <div className="bg-white rounded-lg border p-3 mb-4 flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Duration
              </span>
              <Input
                placeholder="Start Date to End Date"
                className="w-64"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Employee
              </span>
              <Select
                value={employeeFilter}
                onValueChange={(v) =>
                  setEmployeeFilter(v)
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  {employeeOptions
                    .slice(1)
                    .map((e) => (
                      <SelectItem key={e} value={e}>
                        {getEmployeeLabel(e)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto flex items-center gap-4">
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
              >
                <Search className="w-4 h-4" /> Filters
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <Button
                className="bg-blue-600 text-white"
                onClick={() => openLogForm()}
              >
                + Log Time
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 border rounded px-2 py-1 bg-white">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search"
                  value={searchInput}
                  onChange={(e) =>
                    setSearchInput(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setSearchQuery(searchInput);
                      setCurrentPage(1);
                    }
                  }}
                  className="border-0 bg-transparent focus-visible:ring-0"
                />
              </div>

              {/* === Top-right icon group (updated order & styles to match image) === */}
              <div className="flex items-center bg-white border rounded-lg overflow-hidden">
                {/* Search icon button */}
                <button
                  onClick={() => {
                    // focus the search input (approximate behavior)
                    const el = document.querySelector('input[placeholder="Search"]') as HTMLInputElement | null;
                    if (el) el.focus();
                  }}
                  className="px-3 py-2 hover:bg-gray-50"
                  title="Search"
                >
                  <Search className="w-4 h-4" />
                </button>

                {/* List view */}
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 hover:bg-gray-50 ${viewMode === "list" ? "bg-gray-100" : ""}`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>

               {/* Weekly view (with "7" badge) */}
                <button
                  onClick={() => {
                    setViewMode("weekly");
                    setShowWeeklyModal(true);
                  }}
                  aria-pressed={viewMode === "weekly"}
                  title="Weekly calendar"
                  className={`relative px-3 py-2 hover:bg-gray-50 ${viewMode === "weekly" ? "bg-violet-600 text-white" : ""}`}
                >
                  <Calendar className="w-4 h-4" />
                  {/* badge */}
                  <span
                    className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold leading-none
                      ${viewMode === "weekly" ? "bg-white text-violet-600" : "bg-violet-600 text-white"}`}
                    aria-hidden="true"
                  >
                    7
                  </span>
                </button>


                {/* Calendar view (opens calendar) */}
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`px-3 py-2 hover:bg-gray-50 ${viewMode === "calendar" ? "ring-2 ring-indigo-300" : ""}`}
                  title="Open calendar view"
                >
                  <Calendar className="w-4 h-4 text-gray-600" />
                </button>

                {/* User / profile icon */}
                <button
                  onClick={() => {
                    // placeholder for user action — can open profile or dropdown
                    // keeping behavior neutral to avoid changing other flows
                    console.log("User icon clicked");
                  }}
                  className="px-3 py-2 hover:bg-gray-50"
                  title="User"
                >
                  <User className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
            <div className="p-0">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="text-left text-sm text-gray-600 border-b bg-blue-50">
                    <th className="py-3 px-4 w-28 border-r">
                      Code
                    </th>
                    <th className="py-3 px-4 border-r">
                      Task
                    </th>
                    <th className="py-3 px-4 w-48 border-r">
                      Employee
                    </th>
                    <th className="py-3 px-4 w-40 border-r">
                      Start Time
                    </th>
                    <th className="py-3 px-4 w-40 border-r">
                      End Time
                    </th>
                    <th className="py-3 px-4 w-28 border-r">
                      Total Hours
                    </th>
                    <th className="py-3 px-4 w-16">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading && (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-6 text-center text-gray-500"
                      >
                        Loading...
                      </td>
                    </tr>
                  )}

                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-6 text-center text-gray-500"
                      >
                        {error
                          ? `Error: ${error}`
                          : "No timesheets found"}
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    filtered.map((t) => (
                      <TimesheetRow key={t.id} t={t} />
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="px-4 py-3 flex items-center justify-between text-sm text-gray-600">
            <div>Result per page - {filtered.length}</div>
            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded hover:bg-gray-100"
                onClick={() =>
                  setCurrentPage((c) => Math.max(1, c - 1))
                }
                disabled={currentPage === 1}
              >
                <ChevronLeft />
              </button>
              <div>
                Page {currentPage} of {totalPages}
              </div>
              <button
                className="p-2 rounded hover:bg-gray-100"
                onClick={() =>
                  setCurrentPage((c) =>
                    Math.min(totalPages, c + 1)
                  )
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* filters drawer */}
      <div
        aria-hidden={!showFilters}
        onClick={() => setShowFilters(false)}
        className={`fixed inset-0 transition-opacity duration-300 z-[9990] ${
          showFilters
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
      />
      <aside
        aria-hidden={!showFilters}
        className={`fixed right-0 top-0 h-full w-[360px] bg-white shadow-xl transform transition-transform duration-300 z-[9999] ${
          showFilters ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            <h3 className="font-semibold">Filters</h3>
          </div>
          <button
            onClick={() => setShowFilters(false)}
            className="p-2 rounded hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-auto h-[calc(100%-140px)]">
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Employee
            </label>
            <Select
              value={filterEmployee}
              onValueChange={(v) => setFilterEmployee(v)}
            >
              <SelectTrigger className="w-full rounded border px-3 py-2">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {employeeOptions
                  .slice(1)
                  .map((e) => (
                    <SelectItem key={e} value={e}>
                      {getEmployeeLabel(e)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Department
            </label>
            <Select
              value={filterDepartment}
              onValueChange={(v) =>
                setFilterDepartment(v)
              }
            >
              <SelectTrigger className="w-full rounded border px-3 py-2">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {departmentOptions
                  .slice(1)
                  .map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-4 border-t flex items-center justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setFilterEmployee("all");
              setFilterDepartment("all");
              setShowFilters(false);
            }}
          >
            Reset
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowFilters(false)}
            >
              Close
            </Button>
            <Button
              className="bg-blue-600 text-white"
              onClick={() => {
                setShowFilters(false);
                setCurrentPage(1);
                loadTimesheets(token ?? null);
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      </aside>

      {/* ======= Log Time Modal ======= */}
      {showLogModal && (
        <div className="fixed inset-0 z-[10020] flex items-start justify-center pt-12 px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowLogModal(false)}
          />
          <div className="relative bg-white w-full max-w-4xl rounded-xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingId ? "Edit TimeLog" : "Log Time"}
              </h3>
              <button
                className="p-2 rounded hover:bg-gray-100"
                onClick={() => setShowLogModal(false)}
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-white rounded-md border p-6">
                <h4 className="text-md font-medium mb-4">
                  TimeLog Details
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Project dropdown (value = projectId) */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Project *
                    </label>
                    <select
                      value={form.projectId || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setForm((s) => ({
                          ...s,
                          projectId: value,
                          taskId: "",
                          employeeId: "",
                        }));
                        if (value) {
                          fetchProjectTasks(value);
                        } else {
                          setProjectTasks([]);
                          setSelectedTaskEmployees([]);
                        }
                      }}
                      className="w-full border rounded px-3 py-2 text-sm"
                    >
                      <option value="">--</option>
                      {projectsLoading && (
                        <option value="">
                          Loading...
                        </option>
                      )}
                      {projectsError && (
                        <option value="">
                          Error loading projects
                        </option>
                      )}
                      {projectOptions.map((p) => (
                        <option
                          key={`${p.id}-${p.shortCode}`}
                          value={String(p.id)}
                        >
                          {p.id != null
                            ? `#${p.id} - ${p.name || p.shortCode}`
                            : p.name || p.shortCode}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Task dropdown - depends on selected project */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Task *
                    </label>
                    <select
                      value={form.taskId || "--"}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "--") {
                          setForm((s) => ({
                            ...s,
                            taskId: "",
                            employeeId: "",
                          }));
                          setSelectedTaskEmployees([]);
                          return;
                        }
                        const idNum = Number(val);
                        const task = projectTasks.find(
                          (t) => t.id === idNum
                        );
                        setForm((s) => ({
                          ...s,
                          taskId: val,
                          employeeId: "",
                        }));
                        setSelectedTaskEmployees(
                          task?.assignedEmployees ?? []
                        );
                      }}
                      className="w-full border rounded px-3 py-2 text-sm"
                      disabled={
                        !!form.projectId &&
                        projectTasks.length === 0
                      }
                    >
                      {form.projectId ? (
                        projectTasks.length === 0 ? (
                          <option value="--">No tasks</option>
                        ) : (
                          <>
                            <option value="--">--</option>
                            {projectTasks.map((t) => (
                              <option
                                key={t.id}
                                value={String(t.id)}
                              >
                                {getTaskLabel(String(t.id))}
                              </option>
                            ))}
                          </>
                        )
                      ) : (
                        allTaskOptions.map((t) => (
                          <option key={t} value={t}>
                            {t === "--"
                              ? "--"
                              : getTaskLabel(t)}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Employee dropdown - depends on selected task / project */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Employee *
                    </label>
                    <select
                      value={form.employeeId || "--"}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          employeeId:
                            e.target.value === "--"
                              ? ""
                              : e.target.value,
                        }))
                      }
                      className="w-full border rounded px-3 py-2 text-sm"
                      disabled={
                        !!form.projectId &&
                        projectTasks.length === 0
                      }
                    >
                      {(() => {
                        const projectEmployees =
                          form.projectId
                            ? projectEmployeeMap.get(
                                form.projectId
                              ) ?? []
                            : [];

                        if (
                          form.projectId &&
                          projectTasks.length === 0
                        ) {
                          return (
                            <option value="--">
                              No employees
                            </option>
                          );
                        }

                        if (
                          selectedTaskEmployees.length > 0
                        ) {
                          return (
                            <>
                              <option value="--">--</option>
                              {selectedTaskEmployees.map(
                                (e) => (
                                  <option
                                    key={e.employeeId}
                                    value={e.employeeId}
                                  >
                                    {e.name
                                      ? `${e.name} (${e.employeeId})`
                                      : e.employeeId}
                                  </option>
                                )
                              )}
                            </>
                          );
                        }

                        if (
                          form.projectId &&
                          projectEmployees.length > 0
                        ) {
                          return (
                            <>
                              <option value="--">--</option>
                              {projectEmployees.map((e) => (
                                <option
                                  key={e.employeeId}
                                  value={e.employeeId}
                                >
                                  {e.name
                                    ? `${e.name} (${e.employeeId})`
                                    : e.employeeId}
                                </option>
                              ))}
                            </>
                          );
                        }

                        // no project selected -> global list
                        return employeeOptions.map((e) => (
                          <option key={e} value={e}>
                            {getEmployeeLabel(e)}
                          </option>
                        ));
                      })()}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          startDate: e.target.value,
                        }))
                      }
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          startTime: e.target.value,
                        }))
                      }
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          endDate: e.target.value,
                        }))
                      }
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      End Time *
                    </label>
                    <input
                      type="time"
                      value={form.endTime}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          endTime: e.target.value,
                        }))
                      }
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Memo *
                    </label>
                    <input
                      type="text"
                      value={form.memo}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          memo: e.target.value,
                        }))
                      }
                      className="w-full border rounded px-3 py-2 text-sm"
                      placeholder="Memo"
                    />
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      Total Hours
                    </div>
                    <div className="text-2xl font-semibold text-blue-600">
                      {modalTotalHours}h
                    </div>
                  </div>
                </div>

                {saveError && (
                  <div className="mt-4 text-sm text-red-600">
                    {saveError}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-center gap-6 mt-8 pb-6">
                <button
                  onClick={() => setShowLogModal(false)}
                  className="px-6 py-2 rounded-md border text-blue-600"
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  onClick={saveEntry}
                  className="px-6 py-2 rounded-md bg-blue-600 text-white shadow"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update"
                    : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewOpen && selectedRow && (
        <div className="fixed inset-0 z-[10030] flex items-start justify-center pt-8 px-6">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsViewOpen(false)}
          />

          <div className="relative bg-white w-full max-w-6xl rounded-xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-xl font-semibold">
                Timesheet
              </h3>
              <button
                className="p-2 rounded hover:bg-gray-100"
                onClick={() => setIsViewOpen(false)}
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT: Big Card */}
                <div className="lg:col-span-2 relative bg-white rounded-xl border p-6">
                  <div className="absolute top-4 right-4 text-gray-500">
                    ⋮
                  </div>

                  <h4 className="text-lg font-medium mb-4">
                    TimeLog Details
                  </h4>

                  <div className="grid grid-cols-3 gap-y-4 gap-x-6 items-center text-sm">
                    <div className="text-gray-500">
                      Start Time
                    </div>
                    <div className="col-span-2">
                      {fmtDateTime(
                        selectedRow.startDate,
                        selectedRow.startTime
                      )}
                    </div>

                    <div className="text-gray-500">
                      End Time
                    </div>
                    <div className="col-span-2">
                      {fmtDateTime(
                        selectedRow.endDate,
                        selectedRow.endTime
                      )}
                    </div>

                    <div className="text-gray-500">
                      Total Hours
                    </div>
                    <div className="col-span-2">
                      {typeof selectedRow.durationHours ===
                      "number"
                        ? `${selectedRow.durationHours}h`
                        : "-"}
                    </div>

                    <div className="text-gray-500">
                      Memo
                    </div>
                    <div className="col-span-2">
                      {selectedRow.memo ?? "-"}
                    </div>

                    <div className="text-gray-500">
                      Project
                    </div>
                    <div className="col-span-2">
                      {selectedRow.projectShortCode ??
                        selectedRow.projectId ??
                        "-"}
                    </div>

                    <div className="text-gray-500">
                      Task
                    </div>
                    <div className="col-span-2">
                      Task {selectedRow.taskId ?? "-"}
                    </div>

                    <div className="text-gray-500">
                      Employee
                    </div>
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                        {selectedRow.employees &&
                        selectedRow.employees[0]
                          ?.profileUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={
                              selectedRow.employees[0]
                                .profileUrl!
                            }
                            alt={
                              selectedRow.employees[0]
                                .name ?? ""
                            }
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-200" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {selectedRow.employees &&
                          selectedRow.employees[0]?.name
                            ? selectedRow.employees[0]
                                .name
                            : selectedRow.employeeId}
                        </div>
                        <div className="text-xs text-gray-500">
                          {selectedRow.employees &&
                          selectedRow.employees[0]
                            ?.designation
                            ? selectedRow.employees[0]
                                .designation
                            : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT: History Card */}
                <div className="bg-white rounded-xl border p-5">
                  <h5 className="font-medium mb-3">
                    History
                  </h5>

                  <div className="space-y-4 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <div className="text-gray-500">
                        Start Time
                      </div>
                      <div>
                        {fmtDateTime(
                          selectedRow.startDate,
                          selectedRow.startTime
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <div className="text-gray-500">
                        Task
                      </div>
                      <div>
                        Task {selectedRow.taskId ?? "-"}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <div className="text-gray-500">
                        End Time
                      </div>
                      <div>
                        {fmtDateTime(
                          selectedRow.endDate,
                          selectedRow.endTime
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* footer buttons */}
              <div className="flex items-center justify-center gap-6 mt-8 pb-6">
                <button
                  onClick={() => setIsViewOpen(false)}
                  className="px-6 py-2 rounded-md border text-blue-600"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    if (selectedRow) {
                      openLogForm(selectedRow);
                    }
                    setIsViewOpen(false);
                  }}
                  className="px-6 py-2 rounded-md bg-blue-600 text-white"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {isDeleteConfirmOpen && selectedRow && (
        <div className="fixed inset-0 z-[10040] flex items-start justify-center pt-12 px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsDeleteConfirmOpen(false)}
          />
          <div className="relative bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Delete TimeLog
              </h3>
              <p className="text-sm text-gray-700">
                Are you sure you want to delete
                timesheet{" "}
                <strong>
                  RTA-
                  {String(selectedRow.id).padStart(2, "0")}
                </strong>
                ? This action cannot be undone.
              </p>

              {saveError && (
                <div className="mt-4 text-sm text-red-600">
                  {saveError}
                </div>
              )}

              <div className="flex items-center justify-end gap-4 mt-6">
                <button
                  className="px-4 py-2 rounded border"
                  onClick={() =>
                    setIsDeleteConfirmOpen(false)
                  }
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-red-600 text-white"
                  onClick={deleteTimesheet}
                  disabled={saving}
                >
                  {saving ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly full-screen modal */}
      {showWeeklyModal && (
        <WeeklyTimesheetModal
          open={showWeeklyModal}
          onClose={() => setShowWeeklyModal(false)}
        />
      )}
    </div>
  );
}
