// components/TasksTable.tsx
"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { UserIcon } from "@heroicons/react/24/outline";
import { deleteAPI, getAPI, postAPI, putAPI } from "@/app/api/apiHelper";
import { getStorage } from "../../../../../lib/storage/storege";
type Employee = {
  employeeId: string;
  name: string;
  profileUrl?: string | null;
};

type Label = { id: number; name: string; colorCode?: string };
type Milestone = { id: number; title: string };

type Task = {
  id: number;
  title: string;
  projectId: number;
  startDate?: string | null;
  dueDate?: string | null;
  noDueDate?: boolean;
  taskStage?: any;
  taskStageId?: number;
  assignedEmployeeIds?: string[];
  assignedEmployees?: Employee[] | null;
  description?: string | null;
  labels?: Label[];
  milestone?: Milestone | null;
  milestoneId?: number | null;
  priority?: string | null;
  isPrivate?: boolean;
  timeEstimateMinutes?: number | null;
  isDependent?: boolean;
  dependentTaskId?: number | null;
  attachments?: any[];
  pinned?: boolean | null;
};

const MAIN = process.env.NEXT_PUBLIC_MAIN || "";

export default function TasksTable({ projectId }: { projectId: number }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 
  // modals / form state
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [menuOpenFor, setMenuOpenFor] = useState<number | null>(null);

  const emptyForm = {
    title: "",
    category: "", // category id or name (API expects category)
    startDate: "",
    dueDate: "",
    noDueDate: false,
    taskStageId: "",
    assignedEmployeeIds: [] as string[],
    description: "",
    labelIds: [] as string[],
    milestoneId: "",
    priority: "LOW",
    isPrivate: false,
    timeEstimateMinutes: "",
    isDependent: false,
    projectId: projectId,
    taskFile: null as File | null,
  };
  const [form, setForm] = useState(emptyForm);

  // axios instance
  const axiosInstance = axios.create({
    baseURL: MAIN || undefined,
  });

  const base = (path: string) => (MAIN ? `${MAIN}${path}` : path);
 
  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getStorage();
      const url = `https://chat.swiftandgo.in/projects/${projectId}/tasks`;
      const res = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // helpers
  const updateForm = (patch: Partial<typeof emptyForm>) => setForm((s) => ({ ...s, ...patch }));

  // create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("category", form.category || "");
      fd.append("startDate", form.startDate || "");
      fd.append("dueDate", form.dueDate || "");
      fd.append("noDueDate", String(form.noDueDate));
      fd.append("taskStageId", form.taskStageId || "");
      fd.append("assignedEmployeeIds", JSON.stringify(form.assignedEmployeeIds));
      fd.append("description", form.description || "");
      fd.append("labelIds", JSON.stringify(form.labelIds));
      fd.append("milestoneId", form.milestoneId || "");
      fd.append("priority", form.priority || "");
      fd.append("isPrivate", String(form.isPrivate));
      fd.append("timeEstimateMinutes", String(form.timeEstimateMinutes || ""));
      fd.append("isDependent", String(form.isDependent));
      fd.append("projectId", String(projectId));
      if (form.taskFile) fd.append("taskFile", form.taskFile);

      await postAPI(base("/api/projects/tasks"), fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowCreate(false);
      setForm(emptyForm);
      await fetchTasks();
    } catch (err: any) {
      alert("Create task failed: " + (err?.response?.data?.message || err?.message || "unknown"));
    }
  };

  // open edit and prefill
  const openEdit = (t: Task) => {
    setEditTask(t);
    setForm({
      title: t.title || "",
      category: (t as any).categoryId?.id ? String((t as any).categoryId.id) : "",
      startDate: t.startDate ? t.startDate : "",
      dueDate: t.dueDate ? t.dueDate : "",
      noDueDate: !!t.noDueDate,
      taskStageId: t.taskStageId ? String(t.taskStageId) : "",
      assignedEmployeeIds: t.assignedEmployeeIds || [],
      description: t.description || "",
      labelIds: (t.labels || []).map((l) => String(l.id)),
      milestoneId: t.milestoneId ? String(t.milestoneId) : "",
      priority: t.priority || "LOW",
      isPrivate: !!t.isPrivate,
      timeEstimateMinutes: t.timeEstimateMinutes ? String(t.timeEstimateMinutes) : "",
      isDependent: !!t.isDependent,
      projectId: t.projectId,
      taskFile: null,
    });
    setShowEdit(true);
  };

  // submit edit
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTask) return;
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("category", form.category || "");
      fd.append("noDueDate", String(form.noDueDate));
      fd.append("description", form.description || "");
      fd.append("labelIds", JSON.stringify(form.labelIds));
      fd.append("priority", form.priority || "");
      fd.append("isPrivate", String(form.isPrivate));
      fd.append("timeEstimateMinutes", String(form.timeEstimateMinutes || ""));
      fd.append("isDependent", String(form.isDependent));
      fd.append("projectId", String(projectId));
      fd.append("assignedEmployeeIds", JSON.stringify(form.assignedEmployeeIds));
      if (form.taskFile) fd.append("taskFile", form.taskFile);

      await putAPI(base(`/api/projects/tasks/${editTask.id}`), fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowEdit(false);
      setEditTask(null);
      setForm(emptyForm);
      await fetchTasks();
    } catch (err: any) {
      alert("Update task failed: " + (err?.response?.data?.message || err?.message || "unknown"));
    }
  };

  // delete
  const handleDelete = async (taskId: number) => {
    if (!confirm("Are you sure to delete this task?")) return;
    try {
      await deleteAPI(base(`/api/projects/${projectId}/tasks/${taskId}`));
      setMenuOpenFor(null);
      await fetchTasks();
    } catch (err: any) {
      alert("Delete failed: " + (err?.response?.data?.message || err?.message || "unknown"));
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-4">Tasks</h2>
      {/* HEADER: Add Task moved to LEFT, Search remains RIGHT */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { setForm({ ...emptyForm, projectId }); setShowCreate(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow-sm hover:bg-blue-700"
          >
            + Add Task
          </button>
          
        </div>

        <div className="flex items-center gap-3">
          <input
            type="search"
            placeholder="Search"
            onChange={(e) => {
              const q = e.target.value.toLowerCase();
              if (!q) fetchTasks();
              else setTasks((prev) => prev.filter((t) => (t.title || "").toLowerCase().includes(q)));
            }}
            className="border px-3 py-2 rounded-md text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-6 text-center text-gray-500">Loading tasks...</div>
      ) : error ? (
        <div className="py-6 text-center text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-blue-50 text-left text-gray-600">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3">Completed On</th>
                <th className="px-4 py-3">Start Date</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Assigned</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} className="border-b last:border-b-0 bg-white">
                  <td className="px-4 py-4 align-top">RTA-{t.id}</td>
                  <td className="px-4 py-4 align-top">
                    <div className="font-medium">{t.title}</div>
                    {t.description && <div className="text-xs text-gray-500 mt-1">{t.description.slice(0, 80)}{t.description.length > 80 ? "..." : ""}</div>}
                  </td>
                  <td className="px-4 py-4 align-top">--</td>
                  <td className="px-4 py-4 align-top">{t.startDate ? new Date(t.startDate).toLocaleDateString() : "--"}</td>
                  <td className={`px-4 py-4 align-top ${t.dueDate && new Date(t.dueDate) < new Date() ? "text-red-600" : ""}`}>
                    {t.noDueDate ? "--" : t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "--"}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex -space-x-2">
                      {(t.assignedEmployees || []).slice(0, 3).map((e) => (
                        <div key={e.employeeId} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-100">
                          {e.profileUrl ? <img src={e.profileUrl} alt={e.name} className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full text-gray-400 p-1" />}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top relative">
                    <button onClick={() => setMenuOpenFor(menuOpenFor === t.id ? null : t.id)} className="p-1 rounded hover:bg-gray-100">⋮</button>
                    {menuOpenFor === t.id && (
                      <div className="absolute right-2 top-10 z-20 w-48 bg-white border rounded-md shadow-md">
                        <button onClick={() => { alert("View task - future"); setMenuOpenFor(null); }} className="w-full text-left px-4 py-2 hover:bg-gray-50">View</button>
                        <button onClick={() => { openEdit(t); setMenuOpenFor(null); }} className="w-full text-left px-4 py-2 hover:bg-gray-50">Edit</button>
                        <button onClick={() => handleDelete(t.id)} className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50">Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleCreate} className="bg-white w-full max-w-3xl rounded-lg p-6 shadow-lg overflow-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Task</h3>
              <button type="button" onClick={() => setShowCreate(false)} className="text-gray-500">Close</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex flex-col">
                <span className="text-xs text-gray-600">Title</span>
                <input required value={form.title} onChange={(e) => updateForm({ title: e.target.value })} className="border px-3 py-2 rounded" />
              </label>

              <label className="flex flex-col">
                <span className="text-xs text-gray-600">Category (id)</span>
                <input value={form.category} onChange={(e) => updateForm({ category: e.target.value })} className="border px-3 py-2 rounded" />
              </label>

              <label className="flex flex-col">
                <span className="text-xs text-gray-600">Start Date</span>
                <input type="date" value={form.startDate} onChange={(e) => updateForm({ startDate: e.target.value })} className="border px-3 py-2 rounded" />
              </label>

              <label className="flex flex-col">
                <span className="text-xs text-gray-600">Due Date</span>
                <input type="date" value={form.dueDate} onChange={(e) => updateForm({ dueDate: e.target.value })} className="border px-3 py-2 rounded" />
              </label>

              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.noDueDate} onChange={(e) => updateForm({ noDueDate: e.target.checked })} />
                <span className="text-sm text-gray-600">No Due Date</span>
              </label>

              <label className="flex flex-col">
                <span className="text-xs text-gray-600">Task Stage ID</span>
                <input value={form.taskStageId} onChange={(e) => updateForm({ taskStageId: e.target.value })} className="border px-3 py-2 rounded" />
              </label>

              <label className="flex flex-col md:col-span-2">
                <span className="text-xs text-gray-600">Description</span>
                <textarea value={form.description} onChange={(e) => updateForm({ description: e.target.value })} className="border px-3 py-2 rounded" />
              </label>

              <label className="flex flex-col">
                <span className="text-xs text-gray-600">Assigned Employee IDs (comma separated)</span>
                <input value={form.assignedEmployeeIds.join(",")} onChange={(e) => updateForm({ assignedEmployeeIds: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} className="border px-3 py-2 rounded" />
              </label>

              <label className="flex flex-col">
                <span className="text-xs text-gray-600">Label IDs (comma separated)</span>
                <input value={form.labelIds.join(",")} onChange={(e) => updateForm({ labelIds: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} className="border px-3 py-2 rounded" />
              </label>

              <label className="flex flex-col">
                <span className="text-xs text-gray-600">Milestone ID</span>
                <input value={form.milestoneId} onChange={(e) => updateForm({ milestoneId: e.target.value })} className="border px-3 py-2 rounded" />
              </label>

              <label className="flex flex-col">
                <span className="text-xs text-gray-600">Priority</span>
                <select value={form.priority} onChange={(e) => updateForm({ priority: e.target.value })} className="border px-3 py-2 rounded">
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </label>

              <label className="flex flex-col">
                <span className="text-xs text-gray-600">Time Estimate (minutes)</span>
                <input type="number" value={form.timeEstimateMinutes} onChange={(e) => updateForm({ timeEstimateMinutes: e.target.value })} className="border px-3 py-2 rounded" />
              </label>

              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isPrivate} onChange={(e) => updateForm({ isPrivate: e.target.checked })} />
                <span className="text-sm text-gray-600">Private</span>
              </label>

              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isDependent} onChange={(e) => updateForm({ isDependent: e.target.checked })} />
                <span className="text-sm text-gray-600">Is Dependent</span>
              </label>

              <label className="flex flex-col md:col-span-2">
                <span className="text-xs text-gray-600">Attach file (optional)</span>
                <input type="file" onChange={(e) => updateForm({ taskFile: e.target.files?.[0] || null })} />
              </label>
            </div>

            <div className="mt-4 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded border">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Save</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit modal */}
      {showEdit && editTask && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleEdit} className="bg-white w-full max-w-3xl rounded-lg p-6 shadow-lg overflow-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Task</h3>
              <button type="button" onClick={() => { setShowEdit(false); setEditTask(null); }} className="text-gray-500">Close</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex flex-col">
                <span className="text-xs text-gray-600">Title</span>
                <input required value={form.title} onChange={(e) => updateForm({ title: e.target.value })} className="border px-3 py-2 rounded" />
              </label>

              <label className="flex flex-col">
                <span className="text-xs text-gray-600">Category (id)</span>
                <input value={form.category} onChange={(e) => updateForm({ category: e.target.value })} className="border px-3 py-2 rounded" />
              </label>

              <label className="flex flex-col md:col-span-2">
                <span className="text-xs text-gray-600">Description</span>
                <textarea value={form.description} onChange={(e) => updateForm({ description: e.target.value })} className="border px-3 py-2 rounded" />
              </label>

              <label className="flex flex-col">
                <span className="text-xs text-gray-600">Assigned Employee IDs (comma separated)</span>
                <input value={form.assignedEmployeeIds.join(",")} onChange={(e) => updateForm({ assignedEmployeeIds: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} className="border px-3 py-2 rounded" />
              </label>

              <label className="flex flex-col">
                <span className="text-xs text-gray-600">Label IDs (comma separated)</span>
                <input value={form.labelIds.join(",")} onChange={(e) => updateForm({ labelIds: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} className="border px-3 py-2 rounded" />
              </label>

              <label className="flex flex-col">
                <span className="text-xs text-gray-600">Priority</span>
                <select value={form.priority} onChange={(e) => updateForm({ priority: e.target.value })} className="border px-3 py-2 rounded">
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </label>

              <label className="flex flex-col">
                <span className="text-xs text-gray-600">Time Estimate (minutes)</span>
                <input type="number" value={form.timeEstimateMinutes} onChange={(e) => updateForm({ timeEstimateMinutes: e.target.value })} className="border px-3 py-2 rounded" />
              </label>

              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isPrivate} onChange={(e) => updateForm({ isPrivate: e.target.checked })} />
                <span className="text-sm text-gray-600">Private</span>
              </label>

              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isDependent} onChange={(e) => updateForm({ isDependent: e.target.checked })} />
                <span className="text-sm text-gray-600">Is Dependent</span>
              </label>

              <label className="flex flex-col md:col-span-2">
                <span className="text-xs text-gray-600">Attach file (optional)</span>
                <input type="file" onChange={(e) => updateForm({ taskFile: e.target.files?.[0] || null })} />
              </label>
            </div>

            <div className="mt-4 flex items-center justify-end gap-3">
              <button type="button" onClick={() => { setShowEdit(false); setEditTask(null); }} className="px-4 py-2 rounded border">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Update</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
