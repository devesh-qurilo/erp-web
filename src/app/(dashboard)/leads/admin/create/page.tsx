"use client";

import useSWR from "swr";
import { useMemo, useState, useEffect, useCallback, Fragment } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Employee = { employeeId: string; name: string; designation?: string };
type DealPayload = {
  title: string;
  pipeline: string;
  dealStage: string;
  dealCategory: string;
  value: number | "";
  expectedCloseDate: string;
  dealAgent: string;
  dealWatchers: string[];
};
type Lead = {
  id: number;
  name: string;
  email: string;
  mobileNumber?: string;
  clientCategory?: string;
  addedBy?: string;
  leadOwner?: string;
  createDeal?: boolean;
  autoConvertToClient?: boolean;
  deal?: DealPayload;
  companyName?: string;
  city?: string;
  country?: string;
  createdAt?: string;
  leadOwnerMeta?: { name?: string; profileUrl?: string };
  addedByMeta?: { name?: string; profileUrl?: string };
};

const BASE = "https://chat.swiftandgo.in"; // as you provided

const fetcher = async (url: string) => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("No access token found. Please login.");
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || "Failed to fetch");
  }
  return res.json();
};

function OwnerCell({ name, designation, avatar }: { name?: string; designation?: string; avatar?: string }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={avatar || "/placeholder.svg?height=32&width=32&query=profile-avatar"}
        alt={name || "avatar"}
        className="h-8 w-8 rounded-full object-cover border"
      />
      <div className="flex flex-col">
        <span className="text-sm font-medium">{name || "—"}</span>
        <span className="text-xs text-muted-foreground">{designation || "—"}</span>
      </div>
    </div>
  );
}

export default function LeadsPage() {
  const router = useRouter();
  const { data, error, isLoading, mutate } = useSWR<Lead[]>(`${BASE}/leads`, fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  });

  // employees for selects
  const { data: employeesData } = useSWR<Employee[]>(`${BASE}/hr/employee`, fetcher, {
    revalidateOnFocus: false,
  });
  const employees = employeesData || [];

  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false); // for filters (if needed)
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Filtering basic
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!data || !q) return data || [];
    return data.filter((l) =>
      [
        l.name,
        l.email,
        l.companyName,
        l.mobileNumber,
        l.clientCategory,
        l.city,
        l.country,
        l.leadOwner,
        l.addedBy,
      ]
        .filter(Boolean)
        .some((f) => (f as string).toLowerCase().includes(q))
    );
  }, [data, query]);

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      {/* top header */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">Duration</div>
            <div className="text-sm text-muted-foreground underline">Start Date to End Date</div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setDrawerOpen(true)} className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M6 12h12M10 18h4" />
              </svg>
              <span className="hidden sm:inline">Filters</span>
            </button>
            <div className="w-9 h-9 rounded-full bg-gray-200" />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-start md:items-center justify-between gap-3">
          <div>
            <button
              onClick={() => setAddModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-white text-sm font-medium shadow-sm hover:bg-sky-700"
            >
              + Add Lead
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-md border bg-white px-3 py-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="border-0 p-0 outline-none text-sm"
              />
            </div>
            <button onClick={() => mutate()} className="inline-flex items-center rounded-md border px-3 py-2 text-sm">
              Refresh
            </button>
          </div>
        </div>
      </div>

      <Card className="p-0">
        {isLoading ? (
          <div className="p-6 text-center text-muted-foreground">Loading…</div>
        ) : error ? (
          <div className="p-6 text-center text-destructive">{(error as Error).message}</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">S.No.</TableHead>
                  <TableHead className="min-w-[220px]">Lead Name</TableHead>
                  <TableHead>Contact Details</TableHead>
                  <TableHead>Lead Owner</TableHead>
                  <TableHead>Added By</TableHead>
                  <TableHead>Created On</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((lead, i) => (
                  <LeadRow key={lead.id} idx={i} lead={lead} mutate={mutate} />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
        <div>Result per page - 8</div>
        <div>Page 1 of 1</div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded hover:bg-slate-100">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="p-2 rounded hover:bg-slate-100">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Add Lead Modal */}
      {addModalOpen && (
        <AddLeadModal
          onClose={() => setAddModalOpen(false)}
          onCreated={() => {
            setAddModalOpen(false);
            mutate();
          }}
          employees={employees}
        />
      )}
    </main>
  );
}

/* ----------------------------
   Lead row w/ action menu (icons)
   ---------------------------- */
function LeadRow({ lead, idx, mutate }: { lead: Lead; idx: number; mutate: () => Promise<any> }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!(target as HTMLElement).closest || !(target as HTMLElement).closest(`[data-lead-row="${lead.id}"]`)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, lead.id]);

  const router = useRouter();

  const doConvert = async () => {
    if (!confirm("Convert this lead to client?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE}/leads/${lead.id}/convert`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(await res.text());
      alert("Converted to client");
      await mutate();
    } catch (e: any) {
      alert("Error: " + (e.message || e));
    } finally {
      setOpen(false);
    }
  };

  const doDelete = async () => {
    if (!confirm("Delete this lead? This action cannot be undone.")) return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE}/leads/${lead.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      alert("Deleted");
      await mutate();
    } catch (e: any) {
      alert("Error: " + (e.message || e));
    } finally {
      setOpen(false);
    }
  };

  return (
    <TableRow data-lead-row={`${lead.id}`}>
      <TableCell>{idx + 1}</TableCell>
      <TableCell>
        <Link href={`/leads/${lead.id}`}>
          <div className="flex flex-col">
            <span className="font-medium">{lead.name}</span>
            <span className="text-xs text-muted-foreground">{lead.companyName || "—"}</span>
          </div>
        </Link>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="text-sm">{lead.email}</span>
          <span className="text-xs text-muted-foreground">{lead.mobileNumber || "—"}</span>
        </div>
      </TableCell>
      <TableCell>
        <OwnerCell name={lead.leadOwnerMeta?.name || lead.leadOwner} designation={lead.leadOwnerMeta?.name && ""} />
      </TableCell>
      <TableCell>
        <OwnerCell name={lead.addedByMeta?.name || lead.addedBy} designation={lead.addedByMeta?.name && ""} />
      </TableCell>
      <TableCell>
        <span className="text-sm">
          {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" }) : "—"}
        </span>
      </TableCell>
      <TableCell className="relative text-right">
        <button onClick={() => setOpen((s) => !s)} className="inline-flex items-center rounded-full p-2 hover:bg-slate-100">
          <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 z-30 mt-2 w-56 rounded-md bg-white shadow-lg border">
            <ul className="py-1">
              <li>
                <button
                  onClick={() => { setOpen(false); window.location.href = `/leads/${lead.id}`; }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50"
                >
                  <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
                  </svg>
                  View
                </button>
              </li>

              <li>
                <button
                  onClick={() => { setOpen(false); router.push(`/leads/edit/${lead.id}`); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50"
                >
                  <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6L20 10M3 21h6l11-11a2 2 0 00-2-2L7 19v2z" />
                  </svg>
                  Edit
                </button>
              </li>

              <li>
                <button onClick={doConvert} className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50">
                  <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 11c2.21 0 4-1.79 4-4S14.21 3 12 3 8 4.79 8 7s1.79 4 4 4z" />
                    <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M6 20v-1a4 4 0 014-4h4a4 4 0 014 4v1" />
                  </svg>
                  Change to Client
                </button>
              </li>

              <li>
                <button onClick={doDelete} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-slate-50">
                  <svg className="w-5 h-5 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6M10 6V4a2 2 0 012-2h0a2 2 0 012 2v2" />
                  </svg>
                  Delete
                </button>
              </li>
            </ul>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}

/* ----------------------------
   Add Lead Modal component
   ---------------------------- */
function AddLeadModal({ onClose, onCreated, employees }: { onClose: () => void; onCreated: () => void; employees: Employee[] }) {
  const emptyDeal: DealPayload = {
    title: "",
    pipeline: "Default Pipeline",
    dealStage: "Win",
    dealCategory: "Enterprise",
    value: "" as unknown as number,
    expectedCloseDate: "",
    dealAgent: "",
    dealWatchers: [],
  };

  const [payload, setPayload] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    clientCategory: "",
    leadSource: "",
    addedBy: "",
    leadOwner: "",
    createDeal: false,
    autoConvertToClient: false,
    companyName: "",
    city: "",
    country: "",
    deal: emptyDeal,
  });

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // handle clicks outside to close modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const updateField = (k: string, v: any) => setPayload((p) => ({ ...p, [k]: v }));
  const updateDeal = (k: keyof DealPayload, v: any) => setPayload((p) => ({ ...p, deal: { ...(p.deal as DealPayload), [k]: v } }));

  const toggleWatcher = (empId: string) => {
    setPayload((p) => {
      const watchers = new Set(p.deal?.dealWatchers || []);
      if (watchers.has(empId)) watchers.delete(empId);
      else watchers.add(empId);
      return { ...p, deal: { ...(p.deal as DealPayload), dealWatchers: Array.from(watchers) } };
    });
  };

  const validate = () => {
    if (!payload.name || !payload.email || !payload.companyName) return "Name, Email and Company Name are required.";
    if (payload.createDeal || payload.autoConvertToClient) {
      const d = payload.deal as DealPayload;
      if (!d.title || !d.value || !d.expectedCloseDate || !d.dealAgent) return "Complete deal details are required when creating a deal.";
    }
    return null;
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
      if (!token) throw new Error("No access token found.");

      // Build request identical to your sample JSON (trim empty strings)
      const body = {
        name: payload.name,
        email: payload.email,
        mobileNumber: payload.mobileNumber || undefined,
        clientCategory: payload.clientCategory || undefined,
        addedBy: payload.addedBy || undefined,
        leadOwner: payload.leadOwner || undefined,
        createDeal: !!payload.createDeal,
        autoConvertToClient: !!payload.autoConvertToClient,
        companyName: payload.companyName || undefined,
        city: payload.city || undefined,
        country: payload.country || undefined,
        deal: payload.createDeal || payload.autoConvertToClient ? {
          title: payload.deal!.title,
          pipeline: payload.deal!.pipeline,
          dealStage: payload.deal!.dealStage,
          dealCategory: payload.deal!.dealCategory,
          value: Number(payload.deal!.value),
          expectedCloseDate: payload.deal!.expectedCloseDate,
          dealAgent: payload.deal!.dealAgent,
          dealWatchers: payload.deal!.dealWatchers || [],
        } : undefined,
      };

      const res = await fetch(`${BASE}/leads`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Create failed");
      }

      // success
      onCreated();
      alert("Lead created.");
    } catch (err: any) {
      setError(err?.message || "Failed to create lead.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      <div className="fixed inset-0 flex items-start justify-center px-4 pt-10">
        <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg border overflow-auto" style={{ maxHeight: "90vh" }}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Add Lead Contact Information</h3>
            <button onClick={onClose} className="text-muted-foreground p-1 rounded hover:bg-slate-100">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={submit} className="p-6 space-y-6">
            {error && <div className="text-destructive text-sm">{error}</div>}

            {/* Lead Contact Detail */}
            <div className="rounded-lg border p-4">
              <h4 className="font-medium mb-3">Lead Contact Detail</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Name *</label>
                  <Input name="name" value={payload.name} onChange={(e) => updateField("name", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Email *</label>
                  <Input name="email" type="email" value={payload.email} onChange={(e) => updateField("email", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Client Category</label>
                  <Input name="clientCategory" value={payload.clientCategory} onChange={(e) => updateField("clientCategory", e.target.value)} />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Lead Source</label>
                  <Input name="leadSource" value={payload.leadSource} onChange={(e) => updateField("leadSource", e.target.value)} />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Added By</label>
                  <select name="addedBy" value={payload.addedBy} onChange={(e) => updateField("addedBy", e.target.value)} className="w-full border rounded-md p-2 text-sm">
                    <option value="">--</option>
                    {employees.map((emp) => <option key={emp.employeeId} value={emp.employeeId}>{emp.name} ({emp.employeeId})</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Lead Owner</label>
                  <select name="leadOwner" value={payload.leadOwner} onChange={(e) => updateField("leadOwner", e.target.value)} className="w-full border rounded-md p-2 text-sm">
                    <option value="">--</option>
                    {employees.map((emp) => <option key={emp.employeeId} value={emp.employeeId}>{emp.name} ({emp.employeeId})</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-2 md:col-span-2">
                  <Checkbox checked={payload.createDeal} onCheckedChange={(c) => { updateField("createDeal", !!c); if (!!c) updateField("autoConvertToClient", true); }} />
                  <span className="text-sm">Create Deal</span>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox checked={payload.autoConvertToClient} onCheckedChange={(c) => updateField("autoConvertToClient", !!c)} />
                  <span className="text-sm">Auto convert lead to client when deal stage is 'Win'</span>
                </div>
              </div>

              {/* Deal fields (if createDeal) */}
              {(payload.createDeal || payload.autoConvertToClient) && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Deal Name *</label>
                    <Input name="deal.title" value={payload.deal!.title} onChange={(e) => updateDeal("title", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Pipeline *</label>
                    <Input name="deal.pipeline" value={payload.deal!.pipeline} onChange={(e) => updateDeal("pipeline", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Deal Stage *</label>
                    <Input name="deal.dealStage" value={payload.deal!.dealStage} onChange={(e) => updateDeal("dealStage", e.target.value)} />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Deal Value *</label>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-2 bg-gray-100 rounded-l">USD $</div>
                      <input type="number" value={payload.deal!.value as any} onChange={(e) => updateDeal("value", e.target.value)} className="flex-1 border p-2 rounded-r" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Close Date *</label>
                    <input type="date" value={payload.deal!.expectedCloseDate} onChange={(e) => updateDeal("expectedCloseDate", e.target.value)} className="w-full border rounded-md p-2" />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Deal Category</label>
                    <Input name="deal.dealCategory" value={payload.deal!.dealCategory} onChange={(e) => updateDeal("dealCategory", e.target.value)} />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Deal Agent *</label>
                    <select value={payload.deal!.dealAgent} onChange={(e) => updateDeal("dealAgent", e.target.value)} className="w-full border rounded-md p-2">
                      <option value="">--</option>
                      {employees.map((emp) => <option key={emp.employeeId} value={emp.employeeId}>{emp.name} ({emp.employeeId})</option>)}
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="text-sm text-muted-foreground">Deal Watcher(s)</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {employees.map((emp) => (
                        <label key={emp.employeeId} className="inline-flex items-center gap-2 border rounded px-2 py-1 text-sm">
                          <input type="checkbox" checked={payload.deal!.dealWatchers.includes(emp.employeeId)} onChange={() => toggleWatcher(emp.employeeId)} />
                          <span>{emp.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Company Details */}
            <div className="rounded-lg border p-4">
              <h4 className="font-medium mb-3">Company Details</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Company Name *</label>
                  <Input value={payload.companyName} onChange={(e) => updateField("companyName", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Official Website</label>
                  <Input value={""} onChange={() => {}} placeholder="--" />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Mobile Number</label>
                  <Input value={payload.mobileNumber} onChange={(e) => updateField("mobileNumber", e.target.value)} />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Office Phone No.</label>
                  <Input value={""} onChange={() => {}} placeholder="--" />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">City</label>
                  <Input value={payload.city} onChange={(e) => updateField("city", e.target.value)} />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Country</label>
                  <Input value={payload.country} onChange={(e) => updateField("country", e.target.value)} />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm text-muted-foreground">Company Address</label>
                  <textarea value={""} onChange={() => {}} className="w-full border rounded-md p-2 h-24" placeholder="--" />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
              <Button type="submit" onClick={submit} disabled={submitting}>
                {submitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
