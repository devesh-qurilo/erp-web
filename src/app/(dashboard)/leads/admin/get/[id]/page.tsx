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
  leadCompanyName?: string;
  pipeline?: string;
  dealCategory?: string;
  expectedCloseDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  followups?: Followup[];
  tags?: string[];
  comments?: unknown[];
  assignedEmployeesMeta?: EmployeeMeta[];
  dealAgentMeta?: EmployeeMeta;
  dealWatchersMeta?: EmployeeMeta[];
};

type DealCategory = { id: number; categoryName: string };

const BASE = "https://chat.swiftandgo.in"; // change if needed
const CREATE_URL = `${BASE}/deals`; // adjust if your create endpoint differs
const EMP_API = `${BASE}/employee/all?page=0&size=20`;
const CAT_API = `${BASE}/deals/dealCategory`;

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

/* ---------------- EditModal (unchanged) ---------------- */
// ... (keep the same EditModal component as before) ...
// For brevity in this message, assume EditModal component is unchanged from your existing file.
// (In your project paste the same EditModal code as before)

/* ---------------- Deal View Modal (UPDATED: clickable email/call + file upload) ---------------- */
function DealViewModal({ deal, lead, onClose }: { deal: Deal; lead?: Lead | null; onClose: () => void }) {
  const [files, setFiles] = useState<{ name: string; url?: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    // Optionally load existing files for the deal if backend supports /deals/{id}/files GET
    const loadFiles = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        const res = await fetch(`${BASE}/deals/${deal.id}/files`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        if (!res.ok) return;
        const json = await res.json();
        // expect json to be array of { name, url } or adapt based on your API
        if (Array.isArray(json)) setFiles(json);
      } catch (err) {
        // ignore silently
      }
    };
    loadFiles();
  }, [deal.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const f = e.target.files?.[0] ?? null;
    setSelectedFile(f);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setFileError("Select a file first.");
      return;
    }
    setFileError(null);
    setUploading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No access token.");
      const fd = new FormData();
      fd.append("file", selectedFile);

      // endpoint: POST /deals/{dealId}/files  (adjust if your backend uses different path)
      const res = await fetch(`${BASE}/deals/${deal.id}/files`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      // JSON may contain uploaded file info (name/url)
      const uploaded = (json && (json.name || json.url)) ? { name: json.name || selectedFile.name, url: json.url } : { name: selectedFile.name };
      setFiles((s) => [uploaded, ...s]);
      setSelectedFile(null);
      (document.getElementById("deal-file-input") as HTMLInputElement | null)?.value && ((document.getElementById("deal-file-input") as HTMLInputElement).value = "");
    } catch (err: any) {
      setFileError(err?.message ?? "Upload failed.");
    } finally {
      setUploading(false);
    }
  };
  const leadCompanyName = lead?.companyName ?? ""
  const leadEmail = lead?.email ?? "";
  const leadPhone = lead?.mobileNumber ?? deal.leadMobile ?? "";

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="fixed inset-0 flex items-start justify-center px-4 pt-8">
        <div className="max-w-5xl w-full bg-white rounded-lg shadow-lg border overflow-auto" style={{ maxHeight: "92vh" }}>
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Deal {deal.id ?? ""}</h3>
            <button onClick={onClose} className="text-muted-foreground p-1 rounded hover:bg-slate-100">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Deal Information */}
            <div className="lg:col-span-2 rounded-lg border p-4">
              <h4 className="font-medium mb-2">Deal Information</h4>
              <div className="text-sm text-muted-foreground mb-4">
                {deal.pipeline ?? "Default Pipeline"} → {deal.dealStage ?? "--"}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Deal Name</div>
                  <div className="font-medium">{deal.title ?? `Deal ${deal.id}`}</div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Lead Contact</div>
                  <div>{deal.leadName ?? "--"}</div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Email</div>
                  <div>{leadEmail ? <a className="text-sky-600 underline" href={`mailto:${leadEmail}`}>{leadEmail}</a> : "--"}</div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Company Name</div>
                  <div>{leadCompanyName ?? "--"}</div>
                  {/* <div>{deal.assignedEmployeesMeta && deal.assignedEmployeesMeta.length ? deal.assignedEmployeesMeta[0].department ?? "--" : "--"}</div> */}
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Deal Category</div>
                  <div>{deal.dealCategory ?? "--"}</div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Deal Agent</div>
                  <div>{deal.dealAgentMeta?.name ?? deal.dealAgent ?? "--"}</div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Deal Watcher</div>
                  <div>{deal.dealWatchersMeta && deal.dealWatchersMeta.length ? deal.dealWatchersMeta[0].name : "--"}</div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Close Date</div>
                  <div>{deal.expectedCloseDate ? fmtShortDate(deal.expectedCloseDate) : "--"}</div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Deal Value</div>
                  <div>{fmtCurrency(deal.value ?? 0)}</div>
                </div>
              </div>
            </div>

            {/* Right: Lead Contact Details (email/call clickable) */}
            <div className="rounded-lg border p-4">
              <h4 className="font-medium mb-3">Lead Contact Details</h4>
              <div className="text-sm grid gap-2">
                <div className="flex justify-between">
                  <div className="text-xs text-muted-foreground">Name</div>
                  <div>{deal.leadName ?? "--"}</div>
                </div>

                <div className="flex justify-between">
                  <div className="text-xs text-muted-foreground">Email</div>
                  <div>
                    {leadEmail ? (
                      <a className="text-sky-600 underline" href={`mailto:${leadEmail}`} target="_blank" rel="noreferrer">
                        {leadEmail}
                      </a>
                    ) : (
                      "--"
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <div className="text-xs text-muted-foreground">Mobile</div>
                  <div>
                    {leadPhone ? (
                      <a className="text-sky-600 underline" href={`tel:${leadPhone}`}>
                        {leadPhone}
                      </a>
                    ) : (
                      "--"
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <div className="text-xs text-muted-foreground">Company Name</div>
                  <div>{leadCompanyName ?? "--"}</div>

                </div>

                <div className="mt-3 flex gap-2">
                  {/* clickable email / call buttons */}
                  <a href={leadEmail ? `mailto:${leadEmail}` : "#"} className="px-3 py-2 border rounded text-sm inline-flex items-center gap-2" target="_blank" rel="noreferrer">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a3 3 0 003.22 0L21 8" />
                    </svg>
                    Email
                  </a>
                  <a href={leadPhone ? `tel:${leadPhone}` : "#"} className="px-3 py-2 border rounded text-sm inline-flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M22 16.92V21a1 1 0 01-1.11 1A19.86 19.86 0 013 5.11 1 1 0 014 4h4.09a1 1 0 01.95.68 12.05 12.05 0 00.7 2.28 1 1 0 01-.24 1.02L8.91 10.9" />
                    </svg>
                    Call
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom tabs: Files + Follow Up etc. - Files area includes upload */}
            <div className="lg:col-span-3 mt-4 rounded-lg border p-4">
              <div className="flex gap-6 border-b pb-3 text-sm">
                <button className="pb-2 border-b-2 border-sky-600 text-sky-600 font-medium">Files</button>
                <button className="pb-2 border-b-2 border-transparent text-slate-700">Follow Up</button>
                <button className="pb-2 border-b-2 border-transparent text-slate-700">People</button>
                <button className="pb-2 border-b-2 border-transparent text-slate-700">Notes</button>
                <button className="pb-2 border-b-2 border-transparent text-slate-700">Comments</button>
                <button className="pb-2 border-b-2 border-transparent text-slate-700">Tags</button>
              </div>

              <div className="mt-4 text-sm">
                <div className="mb-4">
                  <label className="block text-xs text-muted-foreground mb-2">Upload File</label>
                  <div className="flex items-center gap-3">
                    <input id="deal-file-input" type="file" onChange={handleFileChange} className="text-sm" />
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className={`px-3 py-2 rounded bg-blue-600 text-white ${uploading ? "opacity-60" : "hover:bg-blue-700"}`}
                    >
                      {uploading ? "Uploading..." : "Upload"}
                    </button>
                    {fileError && <div className="text-destructive text-xs">{fileError}</div>}
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium mb-2">Files</h5>
                  {files.length === 0 ? (
                    <div className="text-muted-foreground">No files uploaded.</div>
                  ) : (
                    <ul className="list-disc pl-5 text-sm">
                      {files.map((f, i) => (
                        <li key={i}>
                          {f.url ? <a href={f.url} className="text-sky-600 underline" target="_blank" rel="noreferrer">{f.name}</a> : f.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-4">Follow ups / files listing area — replicate your existing UI here as needed.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



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

  // watchers dropdown as before
  const [watchersOpen, setWatchersOpen] = useState(false);
  const watchersButtonRef = useRef<HTMLButtonElement | null>(null);
  const [panelPos, setPanelPos] = useState<{ top: number; left: number; width: number } | null>(null);

  // categories state
  const [categories, setCategories] = useState<DealCategory[]>([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const [catModalOpen, setCatModalOpen] = useState(false);

  const update = (k: keyof typeof form, v: any) => setForm((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // load categories from API
  const loadCategories = async () => {
    setCatsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No access token.");
      const res = await fetch(CAT_API, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(await res.text());
      const json: DealCategory[] = await res.json();
      setCategories(json);
      // if current selected category empty and categories exist, set first
      if (!form.dealCategory && json.length > 0) {
        setForm((s) => ({ ...s, dealCategory: json[0].categoryName }));
      }
    } catch (err: any) {
      console.error("Failed to load categories", err);
    } finally {
      setCatsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

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

  // compute panel position
  const openWatchers = () => {
    const btn = watchersButtonRef.current;
    if (!btn) {
      setWatchersOpen(true);
      return;
    }
    const rect = btn.getBoundingClientRect();
    const top = rect.bottom + 8;
    const left = rect.left;
    const width = rect.width;
    setPanelPos({ top, left, width });
    setWatchersOpen((s) => !s);
  };

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
                      {!catsLoading && categories.map((c) => (
                        <option key={c.id} value={c.categoryName}>{c.categoryName}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setCatModalOpen(true)}
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

                {/* WATCHERS: fixed popup (no page scrollbar) */}
                <div className="relative">
                  <label className="block text-xs text-muted-foreground mb-2">Deal Watcher</label>

                  {/* fake select */}
                  <button
                    type="button"
                    ref={watchersButtonRef}
                    onClick={openWatchers}
                    className="w-full p-2 border rounded-md text-left bg-white text-sm flex items-center justify-between"
                  >
                    <span className="truncate">{selectedWatcherNames()}</span>
                    <svg className={`w-4 h-4 transform ${watchersOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="none" stroke="currentColor">
                      <path d="M6 8l4 4 4-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {/* PANEL: fixed positioned */}
                  {watchersOpen && panelPos && (
                    <div
                      style={{
                        position: "fixed",
                        top: panelPos.top,
                        left: panelPos.left,
                        width: panelPos.width,
                        zIndex: 60,
                      }}
                    >
                      <div className="bg-white border rounded-md shadow-lg p-3 max-h-[60vh] overflow-auto">
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

      {/* Deal Category Modal */}
      {catModalOpen && (
        <DealCategoryModal
          onClose={() => { setCatModalOpen(false); }}
          onSaved={() => { loadCategories(); }}
        />
      )}
    </div>
  );
}

/* ---------------- EditModal (unchanged) ---------------- */
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

/* ---------------- Deal Category Modal (GET/POST/DELETE) ---------------- */
function DealCategoryModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [categories, setCategories] = useState<DealCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No access token.");
      const res = await fetch(CAT_API, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setCategories(json);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) {
      setError("Category name required.");
      return;
    }
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No access token.");
      const res = await fetch(CAT_API, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ categoryName: newName }),
      });
      if (!res.ok) throw new Error(await res.text());
      const created: DealCategory = await res.json();
      setNewName("");
      // refresh list
      await load();
      onSaved();
    } catch (err: any) {
      setError(err?.message ?? "Failed to add category");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No access token.");
      const res = await fetch(`${CAT_API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      await load();
      onSaved();
    } catch (err: any) {
      alert("Error: " + (err?.message ?? err));
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="fixed inset-0 flex items-start justify-center px-4 pt-12">
        <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg border overflow-auto" style={{ maxHeight: "80vh" }}>
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Deal Category</h3>
            <button onClick={onClose} className="text-muted-foreground p-1 rounded hover:bg-slate-100">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            {error && <div className="text-destructive mb-3">{error}</div>}
            <div className="rounded-lg border p-4 mb-4">
              <div className="overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-sky-50 text-left">
                    <tr>
                      <th className="px-4 py-2 w-12">#</th>
                      <th className="px-4 py-2">Category Name</th>
                      <th className="px-4 py-2 w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={3} className="px-4 py-4 text-center text-muted-foreground">Loading…</td></tr>
                    ) : categories.length === 0 ? (
                      <tr><td colSpan={3} className="px-4 py-4 text-center text-muted-foreground">No categories.</td></tr>
                    ) : (
                      categories.map((c, idx) => (
                        <tr key={c.id} className="border-t">
                          <td className="px-4 py-3">{idx + 1}</td>
                          <td className="px-4 py-3">{c.categoryName}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => handleDelete(c.id)} className="text-destructive px-2 py-1 rounded border">🗑</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-muted-foreground mb-2">Deal Category Name *</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full p-2 border rounded-md" />
            </div>

            <div className="flex items-center justify-center gap-6">
              <button onClick={onClose} className="px-6 py-2 border rounded-full text-blue-600 hover:bg-blue-50">Cancel</button>
              <button onClick={handleAdd} className="px-6 py-2 rounded-full text-white bg-blue-600 hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




/* ---------------- Deal Category Modal (unchanged) ---------------- */
// ... keep DealCategoryModal as provided earlier ...

/* ---------------- AddDealModal (unchanged majorly) ---------------- */
// ... keep AddDealModal as provided earlier ...

/* ---------------- Main Page Component (UPDATED to pass lead to view modal) ---------------- */

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

  const { data: dealsData, error: dealsError, isLoading: dealsLoading, mutate: mutateDeals } = useSWR<Deal[]>(
    activeTab === "deals" ? `${BASE}/deals/lead/${params.id}` : null,
    fetcher,
    { refreshInterval: 30000, revalidateOnFocus: true }
  );

  const { data: empResp } = useSWR(EMP_API, fetcher, { refreshInterval: 0 });
  const employees: EmployeeMeta[] = (empResp && Array.isArray(empResp.content) ? empResp.content.map((e: any) => ({
    employeeId: e.employeeId,
    name: e.name,
    designation: e.designationName ?? null,
    department: e.departmentName ?? null,
    profileUrl: e.profilePictureUrl ?? null,
  })) : []);

  const [addDealOpen, setAddDealOpen] = useState(false);

  // NEW: pass lead to view modal
  const [viewDeal, setViewDeal] = useState<Deal | null>(null);
  const [viewLead, setViewLead] = useState<Lead | null>(null);

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

  const handleCreatedDeal = async (created: Deal) => {
    if (mutateDeals) {
      mutateDeals((curr: Deal[] | undefined) => (curr ? [created, ...curr] : [created]), false);
    }
  };

  const agents = employees;
  const watchers = employees;

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
                              setEditOpen(true);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-sm"
                          >
                            Edit
                          </button>
                        </li>

                        <li>
                          <button
                            onClick={convertToClient}
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-sm"
                          >
                            Change to Client
                          </button>
                        </li>

                        <li>
                          <button
                            onClick={remove}
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-sm text-destructive"
                          >
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

                              <td className="px-4 py-3">{d.expectedCloseDate ? fmtShortDate(d.expectedCloseDate) : d.updatedAt ? fmtShortDate(d.updatedAt) : "--"}</td>

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
                                  {/* open modal with both deal + lead */}
                                  <button
                                    onClick={() => {
                                      setViewDeal(d);
                                      setViewLead(data ?? null);
                                    }}
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

      {/* Add Deal Modal */}
      {addDealOpen && data && (
        <AddDealModal
          lead={data}
          onClose={() => setAddDealOpen(false)}
          onCreated={handleCreatedDeal}
          possibleAgents={agents}
          possibleWatchers={watchers}
        />
      )} 

      {/* Deal View Modal (pass lead for email/call and files) */}
      {viewDeal && (
        <DealViewModal
          deal={viewDeal}
          lead={viewLead}
          onClose={() => {
            setViewDeal(null);
            setViewLead(null);
          }}
        />
      )}
    </main>
  );
}
