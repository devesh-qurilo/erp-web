// components/ProjectMembersTableFetch.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { UserIcon } from "@heroicons/react/24/outline";
import { getStorage } from "../../../../../lib/storage/storege"; // adjust path if needed

type AssignedEmployee = {
  employeeId: string;
  name: string;
  profileUrl?: string | null;
  designation?: string | null;
  department?: string | null;
};

type Project = {
  id: number;
  shortCode?: string;
  name?: string;
  assignedEmployees?: AssignedEmployee[];
  assignedEmployeeIds?: string[];
  projectAdminId?: string | null;
};

const MAIN = process.env.NEXT_PUBLIC_MAIN || ""; // set this to API origin (e.g. https://chat.swiftandgo.in) or leave empty to use relative /api/ paths

export default function ProjectMembersTableFetch({ projectId }: { projectId: number }) {
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<AssignedEmployee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberInput, setNewMemberInput] = useState("");
  const [search, setSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const base = (path: string) => (MAIN ? `${MAIN}${path}` : path);

  // get token — getStorage may return string or object — handle both:
  const token = useMemo(() => {
    try {
      const t = getStorage();
      if (!t) return null;
      if (typeof t === "string") return t;
      // if object, try common fields
      return (t as any).accessToken || (t as any).token || null;
    } catch {
      return null;
    }
  }, []);

  const headersWithAuth = (extra: Record<string, string> = {}) => {
    const h: Record<string, string> = { ...extra };
    if (token) h["Authorization"] = `Bearer ${token}`;
    return h;
  };

  // helper: fetch with timeout + nicer errors (detect HTML 404)
  const doFetch = async (url: string, init: RequestInit = {}, msTimeout = 15000) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), msTimeout);
    try {
      const merged = { ...init, signal: controller.signal };
      const res = await fetch(url, merged);
      clearTimeout(timeout);

      const ct = res.headers.get("content-type") || "";
      const textBody = await res.text().catch(() => "");
      if (!res.ok) {
        if (ct.includes("text/html") || textBody.trim().startsWith("<!DOCTYPE html")) {
          throw new Error(`HTTP ${res.status} ${res.statusText} — server returned HTML (likely wrong URL). URL: ${url}`);
        }
        throw new Error(`HTTP ${res.status} ${res.statusText} ${textBody ? "- " + textBody : ""}`);
      }

      if (ct.includes("application/json")) {
        return JSON.parse(textBody || "{}");
      }
      return textBody;
    } catch (err: any) {
      if (err.name === "AbortError") throw new Error("Request timed out");
      if (err.message === "Failed to fetch") throw new Error("Network Error — check CORS / server availability");
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  };
  
  // GET project + members
  const fetchProject = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = base(`https://chat.swiftandgo.in/api/projects/${projectId}`);
      console.log("[members] GET", url);
      const data = await doFetch(url, {
        method: "GET",
        headers: headersWithAuth({ "Content-Type": "application/json" }),
        credentials: "same-origin",
      });

      // ensure data shape
      setProject(data);
      setMembers(Array.isArray(data?.assignedEmployees) ? data.assignedEmployees : []);
    } catch (err: any) {
      console.error("fetchProject error:", err);
      setError(err?.message || "Failed to load project");
      setProject(null);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // POST assign members
  const handleAssign = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const raw = (newMemberInput || "").trim();
    if (!raw) return alert("Enter employee IDs (comma separated) e.g. EMP-015,EMP-010");
    const employeeIds = raw.split(",").map(s => s.trim()).filter(Boolean);
    if (employeeIds.length === 0) return alert("No valid IDs found");

    setLoading(true);
    setError(null);
    try {
      const url = `https://chat.swiftandgo.in/api/projects/${projectId}/assign`;
      console.log("[members] POST assign", url, employeeIds);
      const res=  await doFetch(url, {
        method: "POST",
        headers: headersWithAuth({ "Content-Type": "application/json" ,Authorization: `Bearer ${getStorage()}`}),
        body: JSON.stringify({ employeeIds }),
        credentials: "same-origin",
      });
      console.log("Assign response:", res);
      setNewMemberInput("");
      setShowAddModal(false);
      await fetchProject();
    } catch (err: any) {
      console.error("assign error:", err);
      setError(err?.message || "Failed to assign members");
    } finally {
      setLoading(false);
    }
  };

  // DELETE member (remove assignment)
  const handleRemove = async (employeeId: string) => {
    if (!confirm(`Remove ${employeeId} from project?`)) return;
    setActionLoadingId(employeeId);
    setError(null);
    try {
      const url = base(`/api/projects/${projectId}/assign/${encodeURIComponent(employeeId)}`);
      console.log("[members] DELETE", url);
      await doFetch(url, {
        method: "DELETE",
        headers: headersWithAuth({ "Content-Type": "application/json" }),
        credentials: "same-origin",
      });

      // If this member was projectAdmin, try to clear projectAdminId on project (best-effort)
      if (project?.projectAdminId === employeeId) {
        try {
          const patchUrl = base(`/api/projects/${projectId}`);
          // Many backends accept PATCH to update fields; adjust if your API uses a different endpoint.
          await doFetch(patchUrl, {
            method: "PATCH",
            headers: headersWithAuth({ "Content-Type": "application/json" }),
            body: JSON.stringify({ projectAdminId: null }),
            credentials: "same-origin",
          });
        } catch (innerErr) {
          console.warn("Failed to clear projectAdminId (this is optional):", innerErr);
          // it's okay — the main delete already removed the member; refresh below will reflect reality.
        }
      }

      await fetchProject();
    } catch (err: any) {
      console.error("remove error:", err);
      setError(err?.message || "Failed to remove member");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Remove Project Admin button handler:
  // We try to clear admin flag (if server supports PATCH). If server instead expects special endpoint,
  // change the `patchUrl` and payload accordingly.
  const handleRemoveAdmin = async (employeeId: string) => {
    if (!confirm(`Remove Project Admin role from ${employeeId}?`)) return;
    setActionLoadingId(employeeId);
    setError(null);
    try {
      // Try PATCH to clear projectAdminId
      const patchUrl = base(`/api/projects/${projectId}`);
      console.log("[members] PATCH clear admin", patchUrl);
      await doFetch(patchUrl, {
        method: "PATCH",
        headers: headersWithAuth({ "Content-Type": "application/json" }),
        body: JSON.stringify({ projectAdminId: null }),
        credentials: "same-origin",
      });

      // After clearing admin field, refresh project
      await fetchProject();
    } catch (err: any) {
      console.error("removeAdmin error:", err);
      setError(err?.message || "Failed to remove project admin (server may not support PATCH).");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = members.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (m.name || "").toLowerCase().includes(q) || (m.employeeId || "").toLowerCase().includes(q) || (m.designation || "").toLowerCase().includes(q);
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Members</h2>

        <div className="flex items-center gap-3">
          <button onClick={() => { setShowAddModal(true); setNewMemberInput(""); }} className="bg-blue-600 text-white px-4 py-2 rounded shadow-sm hover:bg-blue-700">
            + Add Project Members
          </button>

          <input type="search" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} className="border px-3 py-2 rounded-md text-sm" />
        </div>
      </div>

      {loading ? (
        <div className="py-6 text-center text-gray-500">Loading members...</div>
      ) : (
        <>
          {error && <div className="mb-4 p-3 rounded bg-red-50 text-red-700"><strong>Error:</strong> {error}</div>}

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-blue-50 text-left text-gray-600">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">User Role</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={3} className="py-6 text-center text-gray-500">No members found</td></tr>
                ) : (
                  filtered.map((m) => (
                    <tr key={m.employeeId} className="border-b last:border-b-0 bg-white">
                      <td className="px-4 py-4 align-top flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                          {m.profileUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.profileUrl} alt={m.name} className="w-full h-full object-cover" />
                          ) : <UserIcon className="w-6 h-6 text-gray-400 p-1" />}
                        </div>
                        <div>
                          <div className="font-medium">{m.name || m.employeeId}</div>
                          <div className="text-xs text-gray-500">{m.designation || m.department || m.employeeId}</div>
                        </div>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <div className="flex items-center gap-2 text-sm">
                          <input type="radio" checked={project?.projectAdminId === m.employeeId} readOnly />
                          <span className="ml-1">Project Admin</span>
                          {project?.projectAdminId === m.employeeId && (
                            <button onClick={() => handleRemoveAdmin(m.employeeId)} disabled={actionLoadingId === m.employeeId} className="ml-3 px-3 py-1 border rounded text-sm bg-white">
                              {actionLoadingId === m.employeeId ? "Removing..." : "Remove Project Admin"}
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <button onClick={() => handleRemove(m.employeeId)} className="text-red-600 flex items-center gap-2" disabled={actionLoadingId === m.employeeId}>
                          {actionLoadingId === m.employeeId ? "Removing..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Add modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={(e) => { e.preventDefault(); handleAssign(); }} className="bg-white w-full max-w-lg rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Project Members</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-gray-500">Close</button>
            </div>

            <div className="mb-3">
              <label className="text-xs text-gray-600">Employee IDs (comma separated)</label>
              <input value={newMemberInput} onChange={(e) => setNewMemberInput(e.target.value)} placeholder="EMP-015,EMP-010" className="w-full border px-3 py-2 rounded mt-1" />
              <div className="text-xs text-gray-500 mt-1">Example: <code>EMP-015,EMP-010</code></div>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded border">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Add</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
