"use client";

import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

type EmployeeMeta = {
  employeeId?: string;
  name?: string;
  designation?: string | null;
  department?: string | null;
  profileUrl?: string | null;
};

type Lead = {
  id: number;
  name?: string;
  email?: string;
  clientCategory?: string;
  leadSource?: string;
  leadOwner?: string;
  addedBy?: string;
  leadOwnerMeta?: EmployeeMeta;
  addedByMeta?: EmployeeMeta;
  createDeal?: boolean;
  autoConvertToClient?: boolean;
  companyName?: string;
  mobileNumber?: string;
  city?: string;
  country?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  notes?: unknown[];
  deals?: unknown[];
  officePhone?: string;
  officialWebsite?: string;
  postalCode?: string;
  companyAddress?: string;
};

type Followup = {
  id: number;
  nextDate?: string;
  startTime?: string;
  remarks?: string;
  sendReminder?: boolean;
  reminderSent?: boolean;
  createdAt?: string;
};

type Deal = {
  id: number;
  title?: string;
  value?: number;
  dealStage?: string;
  dealAgent?: string;
  dealWatchers?: string[];
  leadId?: number;
  leadName?: string;
  leadMobile?: string;
  pipeline?: string;
  dealCategory?: string;
  closeDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  followups?: Followup[];
  tags?: string[];
  comments?: unknown[];
  assignedEmployeesMeta?: EmployeeMeta[];
  dealAgentMeta?: EmployeeMeta;
  dealWatchersMeta?: EmployeeMeta[];
};

const BASE = "https://chat.swiftandgo.in"; // change if needed
const CREATE_URL = `${BASE}/deals`; // adjust if your create endpoint differs
const EMP_API = `${BASE}/employee/all?page=0&size=20`;

const fetcher = async (url: string) => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) throw new Error("No access token found. Please log in.");

  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    let message = "Failed to load data.";
    try {
      const json = await res.json();
      message = json?.message || json?.error || message;
    } catch {
      message = (await res.text()) || message;
    }
    throw new Error(message);
  }
  return res.json();
};

function fmt(v?: string | null) {
  return v && v !== "null" ? v : "--";
}
function fmtDate(d?: string | null) {
  return d ? new Date(d).toLocaleString() : "--";
}
function fmtShortDate(d?: string | null) {
  return d ? new Date(d).toLocaleDateString() : "--";
}
function fmtCurrency(n?: number | null) {
  if (n == null || isNaN(Number(n))) return "--";
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

/* ---------------- EditModal (unchanged behavior) ---------------- */
function EditModal({ lead, onClose, onSaved }: { lead: Lead; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: lead?.name ?? "",
    email: lead?.email ?? "",
    clientCategory: lead?.clientCategory ?? "",
    leadSource: lead?.leadSource ?? "",
    leadOwner: lead?.leadOwner ?? "",
    addedBy: lead?.addedBy ?? "",
    autoConvertToClient: !!lead?.autoConvertToClient,
    companyName: lead?.companyName ?? "",
    officialWebsite: lead?.officialWebsite ?? "",
    mobileNumber: String(lead?.mobileNumber ?? ""),
    officePhone: lead?.officePhone ?? "",
    city: lead?.city ?? "",
    state: lead?.state ?? "",
    postalCode: lead?.postalCode ?? "",
    country: lead?.country ?? "",
    companyAddress: lead?.companyAddress ?? "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const update = (k: keyof typeof form, v: any) => setForm((s) => ({ ...s, [k]: v }));

  const validate = () => {
    if (!form.name.trim() || !form.email.trim()) return "Name and Email are required.";
    return null;
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const v = validate();
    if (v) {
      setErrorMsg(v);
      return;
    }
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No access token.");

      const body: any = {
        name: form.name,
        email: form.email,
        clientCategory: form.clientCategory || undefined,
        leadSource: form.leadSource || undefined,
        leadOwner: form.leadOwner || undefined,
        addedBy: form.addedBy || undefined,
        autoConvertToClient: !!form.autoConvertToClient,
        companyName: form.companyName || undefined,
        officialWebsite: form.officialWebsite || undefined,
        mobileNumber: form.mobileNumber ? Number(form.mobileNumber) : undefined,
        officePhone: form.officePhone || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        postalCode: form.postalCode || undefined,
        country: form.country || undefined,
        companyAddress: form.companyAddress || undefined,
      };

      const res = await fetch(`${BASE}/leads/${lead.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Update failed");
      }

      await res.json();
      alert("Lead updated successfully.");
      await onSaved();
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Failed to update lead.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="fixed inset-0 flex items-start justify-center px-4 pt-12">
        <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg border overflow-auto" style={{ maxHeight: "92vh" }}>
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Update Lead Contact</h3>
            <button onClick={onClose} className="text-muted-foreground p-1 rounded hover:bg-slate-100">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={submit} className="p-6 space-y-6">
            {errorMsg && <div className="text-destructive text-sm">{errorMsg}</div>}

            {/* Contact Details */}
            <div className="rounded-lg border p-4">
              <h4 className="font-medium mb-3">Contact Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Name *</label>
                  <input className="w-full border rounded-md p-2" value={form.name} onChange={(e) => update("name", e.target.value)} />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Email *</label>
                  <input className="w-full border rounded-md p-2" value={form.email} onChange={(e) => update("email", e.target.value)} />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Lead Source</label>
                  <input className="w-full border rounded-md p-2" value={form.leadSource} onChange={(e) => update("leadSource", e.target.value)} />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Lead Owner</label>
                  <input className="w-full border rounded-md p-2" value={form.leadOwner} onChange={(e) => update("leadOwner", e.target.value)} />
                </div>

                <div className="flex items-center gap-2 md:col-span-2">
                  <input type="checkbox" id="autoConvert" checked={!!form.autoConvertToClient} onChange={(e) => update("autoConvertToClient", e.target.checked)} />
                  <label htmlFor="autoConvert" className="text-sm">Auto Convert lead to client when the deal stage is set to "WIN".</label>
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="rounded-lg border p-4">
              <h4 className="font-medium mb-3">Company Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Company Name</label>
                  <input className="w-full border rounded-md p-2" value={form.companyName} onChange={(e) => update("companyName", e.target.value)} />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Official Website</label>
                  <input className="w-full border rounded-md p-2" value={form.officialWebsite} onChange={(e) => update("officialWebsite", e.target.value)} />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Mobile Number</label>
                  <input className="w-full border rounded-md p-2" value={form.mobileNumber} onChange={(e) => update("mobileNumber", e.target.value)} />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Office Phone No.</label>
                  <input className="w-full border rounded-md p-2" value={form.officePhone} onChange={(e) => update("officePhone", e.target.value)} />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">City</label>
                  <input className="w-full border rounded-md p-2" value={form.city} onChange={(e) => update("city", e.target.value)} />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">State</label>
                  <input className="w-full border rounded-md p-2" value={form.state} onChange={(e) => update("state", e.target.value)} />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Postal Code</label>
                  <input className="w-full border rounded-md p-2" value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)} />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Country</label>
                  <input className="w-full border rounded-md p-2" value={form.country} onChange={(e) => update("country", e.target.value)} />
                </div>

                <div className="md:col-span-3">
                  <label className="text-sm text-muted-foreground">Company Address</label>
                  <textarea className="w-full border rounded-md p-2 h-28" value={form.companyAddress} onChange={(e) => update("companyAddress", e.target.value)} />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
              <Button type="submit" onClick={submit} disabled={submitting}>{submitting ? "Updating..." : "Update"}</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ---------------- AddDealModal (watchers with dropdown + checkboxes) ---------------- */
function AddDealModal({
  lead,
  onClose,
  onCreated,
  possibleAgents,
  possibleWatchers,
}: {
  lead: Lead;
  onClose: () => void;
  onCreated: (d: Deal) => void;
  possibleAgents: EmployeeMeta[];
  possibleWatchers: EmployeeMeta[];
}) {
  const [form, setForm] = useState({
    leadContact: lead?.id ?? "",
    title: "",
    pipeline: "",
    dealStage: "Qualified",
    dealCategory: "",
    dealAgent: "",
    dealWatchers: [] as string[],
    value: "",
    closeDate: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // dropdown open state for watchers
  const [watchersOpen, setWatchersOpen] = useState(false);
  const watchersRef = useRef<HTMLDivElement | null>(null);

  // close dropdown when clicking outside
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!watchersRef.current) return;
      const t = e.target as Node;
      if (watchersOpen && !watchersRef.current.contains(t)) setWatchersOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [watchersOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const update = (k: keyof typeof form, v: any) => setForm((s) => ({ ...s, [k]: v }));

  const validate = () => {
    if (!form.title.trim()) return "Deal Name is required.";
    if (!form.pipeline.trim()) return "Pipeline is required.";
    if (!form.dealStage.trim()) return "Deal stage is required.";
    if (!form.closeDate.trim()) return "Close date is required.";
    return null;
  };

  const toggleWatcher = (employeeId: string, checked: boolean) => {
    setForm((s) => {
      const curr = s.dealWatchers || [];
      const updated = checked ? [...curr, employeeId] : curr.filter((id) => id !== employeeId);
      return { ...s, dealWatchers: updated };
    });
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No access token.");

      const body: any = {
        title: form.title,
        pipeline: form.pipeline || undefined,
        dealStage: form.dealStage || undefined,
        dealCategory: form.dealCategory || undefined,
        dealAgent: form.dealAgent || undefined,
        dealWatchers: form.dealWatchers && form.dealWatchers.length ? form.dealWatchers : undefined,
        value: form.value ? Number(form.value) : undefined,
        closeDate: form.closeDate || undefined,
        leadId: lead.id,
      };

      const res = await fetch(CREATE_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Failed to create deal.");
      }

      const createdDeal = await res.json();

      // pass created deal to parent, parent will update SWR cache
      onCreated(createdDeal as Deal);

      // close modal
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "Failed to create deal.");
    } finally {
      setSubmitting(false);
    }
  };

  // helper to show comma-separated selected watcher names
  const selectedWatcherNames = () => {
    const selected = possibleWatchers.filter((w) => form.dealWatchers.includes(w.employeeId || ""));
    if (selected.length === 0) return "--";
    return selected.map((s) => s.name).join(", ");
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="fixed inset-0 flex items-start justify-center px-4 pt-12">
        <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg border overflow-auto" style={{ maxHeight: "92vh" }}>
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Add Deal Information</h3>
            <button onClick={onClose} className="text-muted-foreground p-1 rounded hover:bg-slate-100">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={submit} className="p-6">
            {error && <div className="text-destructive text-sm mb-3">{error}</div>}

            <div className="rounded-lg border p-6">
              <h4 className="font-medium mb-4">Deal Details</h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-2">Lead Contact *</label>
                  <select
                    className="w-full p-2 border rounded-md bg-white text-sm"
                    value={String(form.leadContact)}
                    onChange={(e) => update("leadContact", Number(e.target.value))}
                  >
                    <option value="">{lead?.name ?? "--"}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-2">Deal Name *</label>
                  <input
                    className="w-full p-2 border rounded-md text-sm"
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-2">Pipeline *</label>
                  <select
                    className="w-full p-2 border rounded-md bg-white text-sm"
                    value={form.pipeline}
                    onChange={(e) => update("pipeline", e.target.value)}
                  >
                    <option value="">--</option>
                    <option>Default Pipeline</option>
                    <option>Sales</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-2">Deal Stages *</label>
                  <div className="relative">
                    <select
                      className="w-full p-2 border rounded-md bg-white text-sm"
                      value={form.dealStage}
                      onChange={(e) => update("dealStage", e.target.value)}
                    >
                      <option>Qualified</option>
                      <option>Generated</option>
                      <option>Proposal</option>
                      <option>Won</option>
                      <option>Lost</option>
                    </select>
                    <div className="absolute left-3 top-3 w-2 h-2 rounded-full bg-sky-600"></div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-2">Deal Category</label>
                  <div className="flex">
                    <select
                      className="flex-1 p-2 border rounded-l-md bg-white text-sm"
                      value={form.dealCategory}
                      onChange={(e) => update("dealCategory", e.target.value)}
                    >
                      <option value="">--</option>
                      <option value="Corporate">Corporate</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => alert("Add category not implemented")}
                      className="px-3 py-2 border rounded-r-md bg-gray-200 text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-2">Deal Agent</label>
                  <select
                    className="w-full p-2 border rounded-md bg-white text-sm"
                    value={form.dealAgent}
                    onChange={(e) => update("dealAgent", e.target.value)}
                  >
                    <option value="">--</option>
                    {possibleAgents.map((a) => (
                      <option key={a.employeeId} value={a.employeeId}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-2">Deal Value</label>
                  <div className="flex items-stretch">
                    <span className="inline-flex items-center px-3 rounded-l-md border bg-slate-100 text-sm">USD $</span>
                    <input
                      type="number"
                      className="w-full p-2 border rounded-r-md text-sm"
                      value={form.value}
                      onChange={(e) => update("value", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-2">Close Date *</label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded-md text-sm"
                    value={form.closeDate}
                    onChange={(e) => update("closeDate", e.target.value)}
                  />
                </div>

                {/* WATCHERS: dropdown with checkboxes (no scrollbar) */}
                <div className="relative" ref={watchersRef}>
                  <label className="block text-xs text-muted-foreground mb-2">Deal Watcher</label>

                  {/* fake select */}
                  <button
                    type="button"
                    onClick={() => setWatchersOpen((s) => !s)}
                    className="w-full p-2 border rounded-md text-left bg-white text-sm flex items-center justify-between"
                  >
                    <span className="truncate">{selectedWatcherNames()}</span>
                    <svg className={`w-4 h-4 transform ${watchersOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="none" stroke="currentColor">
                      <path d="M6 8l4 4 4-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {/* dropdown panel */}
                  {watchersOpen && (
                    <div className="absolute z-40 left-0 right-0 mt-2 bg-white border rounded-md shadow-lg p-3">
                      {possibleWatchers.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No employees</div>
                      ) : (
                        <div className="grid gap-2">
                          {possibleWatchers.map((w) => (
                            <label key={w.employeeId} className="flex items-start gap-2 text-sm">
                              <input
                                type="checkbox"
                                className="mt-1"
                                checked={form.dealWatchers.includes(w.employeeId || "")}
                                onChange={(e) => toggleWatcher(w.employeeId || "", e.target.checked)}
                              />
                              <div>
                                <div className="text-sm">{w.name}</div>
                                {w.designation && <div className="text-xs text-muted-foreground">{w.designation}</div>}
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground mt-1">Click to open and select watchers</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border rounded-full text-blue-600 hover:bg-blue-50"
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className={`px-6 py-2 rounded-full text-white ${
                  submitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {submitting ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Main Page Component ---------------- */

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data, error, isLoading, mutate } = useSWR<Lead>(`/api/leads/admin/get/${params.id}`, fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  });

  const [activeTab, setActiveTab] = useState<"profile" | "deals" | "notes">("profile");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [editOpen, setEditOpen] = useState(false);

  // Deals SWR: only fetch when in deals tab
  const { data: dealsData, error: dealsError, isLoading: dealsLoading, mutate: mutateDeals } = useSWR<Deal[]>(
    activeTab === "deals" ? `${BASE}/deals/lead/${params.id}` : null,
    fetcher,
    { refreshInterval: 30000, revalidateOnFocus: true }
  );

  // Employees SWR (for dropdowns)
  const { data: empResp, error: empError } = useSWR(EMP_API, fetcher, { refreshInterval: 0 });
  // empResp expected shape: { content: [...] }
  const employees: EmployeeMeta[] = (empResp && Array.isArray(empResp.content) ? empResp.content.map((e: any) => ({
    employeeId: e.employeeId,
    name: e.name,
    designation: e.designationName ?? null,
    department: e.departmentName ?? null,
    profileUrl: e.profilePictureUrl ?? null,
  })) : []);

  // Add Deal modal state
  const [addDealOpen, setAddDealOpen] = useState(false);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current) return;
      const t = e.target as Node;
      if (menuOpen && !menuRef.current.contains(t)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const goEdit = () => {
    setMenuOpen(false);
    router.push(`/leads/admin/edit/${params.id}`);
  };

  const convertToClient = async () => {
    setMenuOpen(false);
    if (!confirm("Convert this lead to client?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No access token.");
      const res = await fetch(`${BASE}/leads/${params.id}/convert`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      alert("Converted to client.");
      await mutate();
      router.push("/leads");
    } catch (err: any) {
      alert("Error: " + (err?.message ?? err));
    }
  };

  const remove = async () => {
    setMenuOpen(false);
    if (!confirm("Delete this lead?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No access token.");
      const res = await fetch(`${BASE}/leads/${params.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      alert("Deleted.");
      router.push("/leads");
    } catch (err: any) {
      alert("Error: " + (err?.message ?? err));
    }
  };

  // when a new deal is created, prepend it to the SWR cache so table updates immediately (no redirect)
  const handleCreatedDeal = async (created: Deal) => {
    if (mutateDeals) {
      mutateDeals((curr: Deal[] | undefined) => (curr ? [created, ...curr] : [created]), false);
    }
  };

  // Build agent/watcher lists from employee API (prefer this over deriving from deals)
  const agents = employees; // show all employees as agents
  const watchers = employees; // show all employees as watchers

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">{data?.name ?? "—"}</h1>
            <p className="text-sm text-muted-foreground mt-1">Detailed information about the selected lead.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 border-b bg-white rounded-t">
          <nav className="flex items-center gap-6 px-4">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-3 text-sm ${activeTab === "profile" ? "border-b-2 border-sky-600 text-sky-600" : "text-muted-foreground"}`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("deals")}
              className={`py-3 text-sm ${activeTab === "deals" ? "border-b-2 border-sky-600 text-sky-600" : "text-muted-foreground"}`}
            >
              Deals
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`py-3 text-sm ${activeTab === "notes" ? "border-b-2 border-sky-600 text-sky-600" : "text-muted-foreground"}`}
            >
              Notes
            </button>
          </nav>
        </div>

        {/* Card with Profile Information or Deals */}
        <Card className="p-6">
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Loading lead details…</div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-destructive">Failed to load lead details.</p>
              <p className="text-sm text-muted-foreground mt-2">{(error as Error)?.message}</p>
              <div className="mt-4">
                <Button variant="ghost" onClick={() => router.back()}>
                  Back to Leads
                </Button>
              </div>
            </div>
          ) : !data ? (
            <div className="py-12 text-center text-muted-foreground">No lead found.</div>
          ) : (
            <div>
              {/* header row with title + actions menu */}
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-lg font-semibold">{activeTab === "profile" ? "Profile Information" : activeTab === "deals" ? "Deals" : "Notes"}</h3>

                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((s) => !s)}
                    className="p-2 rounded hover:bg-slate-100"
                    aria-label="More actions"
                  >
                    <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="5" cy="12" r="1.5" />
                      <circle cx="12" cy="12" r="1.5" />
                      <circle cx="19" cy="12" r="1.5" />
                    </svg>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-44 rounded-md border bg-white shadow-lg z-30">
                      <ul className="py-1">
                        <li>
                          <button
                            onClick={() => {
                              setMenuOpen(false);
                              setEditOpen(true); // open modal (Edit)
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-sm"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6L20 10M3 21h6l11-11a2 2 0 00-2-2L7 19v2z" />
                            </svg>
                            Edit
                          </button>
                        </li>

                        <li>
                          <button
                            onClick={convertToClient}
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-sm"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 11c2.21 0 4-1.79 4-4S14.21 3 12 3 8 4.79 8 7s1.79 4 4 4z" />
                              <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M6 20v-1a4 4 0 014-4h4a4 4 0 014 4v1" />
                            </svg>
                            Change to Client
                          </button>
                        </li>

                        <li>
                          <button
                            onClick={remove}
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-sm text-destructive"
                          >
                            <svg className="w-4 h-4 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6M10 6V4a2 2 0 012-2h0a2 2 0 012 2v2" />
                            </svg>
                            Delete
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {activeTab === "profile" && (
                <>
                  {/* information grid */}
                  <div className="rounded-lg border p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <dl className="hidden md:block md:col-span-1 space-y-4 text-sm text-muted-foreground">
                        <dt>Name</dt>
                        <dt>Email</dt>
                        <dt>Lead Owner</dt>
                        <dt>Source</dt>
                        <dt>Company Name</dt>
                        <dt>Website</dt>
                        <dt>Mobile</dt>
                        <dt>Office Phone Number</dt>
                        <dt>City</dt>
                        <dt>State</dt>
                        <dt>Country</dt>
                        <dt>Postal Code</dt>
                        <dt>Address</dt>
                      </dl>

                      <div className="md:col-span-2">
                        <div className="grid gap-y-3">
                          <div className="flex items-start gap-6">
                            <div className="w-48 md:hidden text-sm text-muted-foreground">Name</div>
                            <div className="text-sm">{fmt(data?.name)}</div>
                          </div>

                          <div className="flex items-start gap-6">
                            <div className="w-48 md:hidden text-sm text-muted-foreground">Email</div>
                            <div className="text-sm">{fmt(data?.email)}</div>
                          </div>

                          <div className="flex items-start gap-6">
                            <div className="w-48 md:hidden text-sm text-muted-foreground">Lead Owner</div>
                            <div className="text-sm">{data?.leadOwnerMeta?.name ?? data?.leadOwner ?? "--"}</div>
                          </div>

                          <div className="flex items-start gap-6">
                            <div className="w-48 md:hidden text-sm text-muted-foreground">Source</div>
                            <div className="text-sm">{fmt(data?.leadSource)}</div>
                          </div>

                          <div className="flex items-start gap-6">
                            <div className="w-48 md:hidden text-sm text-muted-foreground">Company Name</div>
                            <div className="text-sm">{fmt(data?.companyName)}</div>
                          </div>

                          <div className="flex items-start gap-6">
                            <div className="w-48 md:hidden text-sm text-muted-foreground">Website</div>
                            <div className="text-sm">{fmt((data as any)?.officialWebsite)}</div>
                          </div>

                          <div className="flex items-start gap-6">
                            <div className="w-48 md:hidden text-sm text-muted-foreground">Mobile</div>
                            <div className="text-sm">{fmt(data?.mobileNumber)}</div>
                          </div>

                          <div className="flex items-start gap-6">
                            <div className="w-48 md:hidden text-sm text-muted-foreground">Office Phone Number</div>
                            <div className="text-sm">{fmt(data?.officePhone)}</div>
                          </div>

                          <div className="flex items-start gap-6">
                            <div className="w-48 md:hidden text-sm text-muted-foreground">City</div>
                            <div className="text-sm">{fmt(data?.city)}</div>
                          </div>

                          <div className="flex items-start gap-6">
                            <div className="w-48 md:hidden text-sm text-muted-foreground">State</div>
                            <div className="text-sm">{fmt(data?.state)}</div>
                          </div>

                          <div className="flex items-start gap-6">
                            <div className="w-48 md:hidden text-sm text-muted-foreground">Country</div>
                            <div className="text-sm">{fmt(data?.country)}</div>
                          </div>

                          <div className="flex items-start gap-6">
                            <div className="w-48 md:hidden text-sm text-muted-foreground">Postal Code</div>
                            <div className="text-sm">{fmt(data?.postalCode)}</div>
                          </div>

                          <div className="flex items-start gap-6">
                            <div className="w-48 md:hidden text-sm text-muted-foreground">Address</div>
                            <div className="text-sm">{fmt(data?.companyAddress)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* footer small details */}
                  <div className="mt-6 text-sm text-muted-foreground grid md:grid-cols-2 gap-2">
                    <div>Created: {fmtDate(data?.createdAt)}</div>
                    <div className="text-right">
                      Status: <Badge variant="secondary">{data?.status ?? "--"}</Badge>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "deals" && (
                <>
                  {/* Deals header (Add Deal + Pipeline selector) */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Open inline modal instead of redirect */}
                      <Button onClick={() => setAddDealOpen(true)}>+ Add Deal</Button>
                      <div>
                        <label className="text-sm text-muted-foreground mr-2">Pipeline</label>
                        <select className="border rounded p-2 text-sm">
                          <option>{data?.deals && (data as any).deals?.length ? data?.deals : data?.pipeline ?? "Default Pipeline"}</option>
                          <option>Sales</option>
                          <option>Default Pipeline</option>
                        </select>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">Result per page - 8</div>
                  </div>

                  <div className="rounded-lg border overflow-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-sky-50 text-left">
                        <tr>
                          <th className="px-4 py-2">Deal Name</th>
                          <th className="px-4 py-2">Lead Name</th>
                          <th className="px-4 py-2">Contact Details</th>
                          <th className="px-4 py-2">Value</th>
                          <th className="px-4 py-2">Close Date</th>
                          <th className="px-4 py-2">Follow Up</th>
                          <th className="px-4 py-2">Deal Agent</th>
                          <th className="px-4 py-2">Deal Watcher</th>
                          <th className="px-4 py-2">Stage</th>
                          <th className="px-4 py-2">Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {dealsLoading ? (
                          <tr>
                            <td colSpan={10} className="px-4 py-6 text-center text-muted-foreground">Loading deals…</td>
                          </tr>
                        ) : dealsError ? (
                          <tr>
                            <td colSpan={10} className="px-4 py-6 text-center text-destructive">Failed to load deals: {(dealsError as Error)?.message}</td>
                          </tr>
                        ) : !dealsData || dealsData.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="px-4 py-6 text-center text-muted-foreground">No deals found for this lead.</td>
                          </tr>
                        ) : (
                          dealsData.map((d) => (
                            <tr key={d.id} className="border-t">
                              <td className="px-4 py-3">
                                <div className="font-medium">{d.title ?? `Deal ${d.id}`}</div>
                                <div className="text-muted-foreground text-xs">{d.dealCategory ?? "--"}</div>
                              </td>

                              <td className="px-4 py-3">{d.leadName ?? data?.name ?? "--"}</td>

                              <td className="px-4 py-3">
                                <div className="text-xs">{fmt(d.leadMobile as any)}</div>
                                <div className="text-muted-foreground text-xs">{(data?.email as string) ?? "--"}</div>
                              </td>

                              <td className="px-4 py-3">{fmtCurrency(d.value ?? 0)}</td>

                              <td className="px-4 py-3">{d.closeDate ? fmtShortDate(d.closeDate) : d.updatedAt ? fmtShortDate(d.updatedAt) : "--"}</td>

                              <td className="px-4 py-3">
                                {d.followups && d.followups.length > 0 ? (
                                  <div className="text-sm">{fmtShortDate(d.followups[0].nextDate)}</div>
                                ) : (
                                  <div className="text-muted-foreground">------</div>
                                )}
                              </td>

                              <td className="px-4 py-3">
                                <div className="text-sm">{d.dealAgentMeta?.name ?? d.dealAgent ?? "--"}</div>
                                <div className="text-muted-foreground text-xs">{d.dealAgentMeta?.designation ?? ""}</div>
                              </td>

                              <td className="px-4 py-3">
                                {d.dealWatchersMeta && d.dealWatchersMeta.length > 0 ? (
                                  <div>
                                    <div className="text-sm">{d.dealWatchersMeta[0].name}</div>
                                    <div className="text-muted-foreground text-xs">{d.dealWatchersMeta[0].designation}</div>
                                  </div>
                                ) : (
                                  <div className="text-muted-foreground">--</div>
                                )}
                              </td>

                              <td className="px-4 py-3">
                                <select defaultValue={d.dealStage} className="border rounded p-1 text-sm">
                                  <option>{d.dealStage ?? "Generated"}</option>
                                  <option>Generated</option>
                                  <option>Qualified</option>
                                  <option>Proposal</option>
                                  <option>Won</option>
                                  <option>Lost</option>
                                </select>
                              </td>

                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => router.push(`/deals/${d.id}`)}
                                    className="text-sm px-2 py-1 border rounded hover:bg-slate-50"
                                  >
                                    View
                                  </button>

                                  <button
                                    onClick={async () => {
                                      if (!confirm("Delete this deal?")) return;
                                      try {
                                        const token = localStorage.getItem("accessToken");
                                        if (!token) throw new Error("No access token.");
                                        const res = await fetch(`${BASE}/deals/${d.id}`, {
                                          method: "DELETE",
                                          headers: { Authorization: `Bearer ${token}` },
                                        });
                                        if (!res.ok) throw new Error(await res.text());
                                        alert("Deal deleted.");
                                        await mutateDeals();
                                      } catch (err: any) {
                                        alert("Error: " + (err?.message ?? err));
                                      }
                                    }}
                                    className="text-sm px-2 py-1 border rounded text-destructive hover:bg-slate-50"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* pagination / footer */}
                  <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <div>Page 1 of 1</div>
                    <div className="flex items-center gap-2">
                      <button className="px-2 py-1" disabled>‹</button>
                      <button className="px-2 py-1" disabled>›</button>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "notes" && (
                <div className="py-8 text-center text-muted-foreground">Notes coming soon.</div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Edit Modal */}
      {editOpen && data && (
        <EditModal
          lead={data}
          onClose={() => setEditOpen(false)}
          onSaved={async () => {
            setEditOpen(false);
            await mutate(); // refresh SWR data
          }}
        />
      )}

      {/* Add Deal Modal (inline) */}
      {addDealOpen && data && (
        <AddDealModal
          lead={data}
          onClose={() => setAddDealOpen(false)}
          onCreated={handleCreatedDeal}
          possibleAgents={agents}
          possibleWatchers={watchers}
        />
      )}
    </main>
  );
}
