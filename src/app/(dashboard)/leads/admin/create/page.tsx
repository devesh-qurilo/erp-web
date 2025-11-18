"use client";

import useSWR from "swr";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Employee = { employeeId: string; name: string; designation?: string };
type DealCategoryItem = { id: number; categoryName: string };
type LeadSourceItem = { id: number; name: string };

type DealPayload = {
  title: string;
  pipeline: string;
  dealStage: string;
  dealCategory: string;
  value: number | "";
  expectedCloseDate: string;
  dealAgent: string;
  dealWatchers: string[]; // array of employeeId
};

type Lead = {
  id: number;
  name: string;
  email: string;
  mobileNumber?: string;
  clientCategory?: string;
  leadSource?: string;
  addedBy?: string;
  leadOwner?: string;
  createDeal?: boolean;
  autoConvertToClient?: boolean;
  deal?: DealPayload;
  companyName?: string;
  officialWebsite?: string;
  officePhone?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  companyAddress?: string;
  createdAt?: string;
  leadOwnerMeta?: { name?: string };
  addedByMeta?: { name?: string };
};

const BASE = "https://chat.swiftandgo.in";

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

/* ---------------------------
   Main Leads page
   --------------------------- */
export default function LeadsPage() {
  const router = useRouter();

  const { data: leadsData, error: leadsError, isLoading: leadsLoading, mutate } = useSWR<Lead[]>(
    `${BASE}/leads`,
    fetcher,
    { refreshInterval: 30000, revalidateOnFocus: true }
  );

  // Use the provided employees endpoint (paged)
  const { data: employeesData } = useSWR<{ content?: Employee[] }>(`${BASE}/employee/all?page=0&size=20`, fetcher, {
    revalidateOnFocus: false,
  });

  const employees = (employeesData && employeesData.content) ? employeesData.content : (employeesData as unknown as Employee[]) || [];

  const [query, setQuery] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!leadsData) return [];
    if (!q) return leadsData;
    return leadsData.filter((l) =>
      [
        l.name,
        l.email,
        l.companyName,
        l.mobileNumber,
        l.clientCategory,
        l.leadSource,
        l.city,
        l.country,
        l.leadOwner,
        l.addedBy,
      ]
        .filter(Boolean)
        .some((f) => (f as string).toLowerCase().includes(q))
    );
  }, [leadsData, query]);

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">Duration</div>
            <div className="text-sm text-muted-foreground underline">Start Date to End Date</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-4 flex items-start md:items-center justify-between gap-3">
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
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="border-0 p-0 outline-none text-sm" />
          </div>
          <button onClick={() => mutate()} className="inline-flex items-center rounded-md border px-3 py-2 text-sm">
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <Card className="p-0">
        {leadsLoading ? (
          <div className="p-6 text-center text-muted-foreground">Loading…</div>
        ) : leadsError ? (
          <div className="p-6 text-center text-destructive">{(leadsError as Error).message}</div>
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
                {filtered.map((lead, idx) => (
                  <LeadRow key={lead.id} lead={lead} idx={idx} mutate={mutate} />
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

/* ------------------------
   LeadRow (with actions)
   ------------------------ */
function LeadRow({ lead, idx, mutate }: { lead: Lead; idx: number; mutate: () => Promise<any> }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest(`[data-lead-row="${lead.id}"]`)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, lead.id]);

  const router = useRouter();

  const convert = async () => {
    if (!confirm("Convert this lead to client?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE}/leads/${lead.id}/convert`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
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

  const remove = async () => {
    if (!confirm("Delete this lead?")) return;
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
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-100" />
          <div className="flex flex-col">
            <span className="text-sm">{lead.leadOwnerMeta?.name || lead.leadOwner || "—"}</span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-100" />
          <div className="flex flex-col">
            <span className="text-sm">{lead.addedByMeta?.name || lead.addedBy || "—"}</span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm">{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "—"}</span>
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
                <button onClick={() => (window.location.href = `/leads/${lead.id}`)} className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50">
                  <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
                  </svg>
                  View
                </button>
              </li>
              <li>
                <button onClick={() => { setOpen(false); window.location.href = `/leads/edit/${lead.id}`; }} className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50">
                  <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6L20 10M3 21h6l11-11a2 2 0 00-2-2L7 19v2z" />
                  </svg>
                  Edit
                </button>
              </li>

              <li>
                <button onClick={convert} className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50">
                  <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 11c2.21 0 4-1.79 4-4S14.21 3 12 3 8 4.79 8 7s1.79 4 4 4z" />
                    <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M6 20v-1a4 4 0 014-4h4a4 4 0 014 4v1" />
                  </svg>
                  Change to Client
                </button>
              </li>

              <li>
                <button onClick={remove} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-slate-50">
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
   AddLeadModal component
   (with server-backed add/list/delete for categories & lead sources)
   ---------------------------- */
function AddLeadModal({ onClose, onCreated, employees }: { onClose: () => void; onCreated: () => void; employees: Employee[] }) {
  // presets
  const defaultPipelines = ["Default Pipeline", "Sales Pipeline", "Enterprise Pipeline"];
  const defaultDealStages = ["Generated", "Qualification", "Proposal", "Win", "Lost"];

  // server-backed lists
  const [dealCategories, setDealCategories] = useState<DealCategoryItem[]>([]);
  const [leadSources, setLeadSources] = useState<LeadSourceItem[]>([]);
  const [clientCategories, setClientCategories] = useState<DealCategoryItem[]>([]); // reuse deal category endpoint for client categories

  // load server lists on mount
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    (async () => {
      try {
        // deal categories
        const res1 = await fetch(`${BASE}/deals/dealCategory`, { headers: { Authorization: `Bearer ${token}` } });
        if (res1.ok) {
          const json = await res1.json();
          if (Array.isArray(json)) {
            setDealCategories(json);
            setClientCategories(json);
          }
        }

        // lead sources
        const res2 = await fetch(`${BASE}/deals/dealCategory/LeadSource`, { headers: { Authorization: `Bearer ${token}` } });
        if (res2.ok) {
          const json2 = await res2.json();
          if (Array.isArray(json2)) setLeadSources(json2);
        }
      } catch (err) {
        // ignore — UI will fall back
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // form payload state
  const emptyDeal: DealPayload = {
    title: "",
    pipeline: defaultPipelines[0],
    dealStage: defaultDealStages[0],
    dealCategory: "",
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
    createDeal: true,
    autoConvertToClient: true,
    deal: emptyDeal,
    companyName: "",
    officialWebsite: "",
    officePhone: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    companyAddress: "",
  });

  // small add-list modal state
  const [addModalOpen, setAddModalOpen] = useState<null | "clientCategory" | "leadSource" | "dealCategory">(null);
  const [addName, setAddName] = useState("");
  const [loadingAddList, setLoadingAddList] = useState(false);
  const [addListItems, setAddListItems] = useState<any[]>([]); // items fetched to show
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (addModalOpen) setAddModalOpen(null);
        else onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [addModalOpen, onClose]);

  const update = (k: string, v: any) => setPayload((p) => ({ ...p, [k]: v }));
  const updateDeal = (k: keyof DealPayload, v: any) => setPayload((p) => ({ ...p, deal: { ...(p.deal as DealPayload), [k]: v } }));

  // toggle watcher by employeeId (kept for compatibility, but watchers selection now via multi-select)
  const toggleWatcher = (id: string) => {
    setPayload((p) => {
      const s = new Set(p.deal!.dealWatchers || []);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return { ...p, deal: { ...(p.deal as DealPayload), dealWatchers: Array.from(s) } };
    });
  };

  const validate = () => {
    if (!payload.name?.trim() || !payload.email?.trim() || !payload.companyName?.trim()) {
      return "Name, Email and Company Name are required.";
    }
    if (payload.createDeal || payload.autoConvertToClient) {
      const d = payload.deal!;
      if (!d.title?.trim() || !d.value || !d.expectedCloseDate || !d.dealAgent) {
        return "Deal title, value, expected close date and deal agent are required when creating a deal.";
      }
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

      const body: any = {
        name: payload.name,
        email: payload.email,
        mobileNumber: payload.mobileNumber || undefined,
        clientCategory: payload.clientCategory || undefined,
        leadSource: payload.leadSource || undefined,
        addedBy: payload.addedBy || undefined,
        leadOwner: payload.leadOwner || undefined,
        createDeal: !!payload.createDeal,
        autoConvertToClient: !!payload.autoConvertToClient,
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
        companyName: payload.companyName,
        officialWebsite: payload.officialWebsite || undefined,
        officePhone: payload.officePhone || undefined,
        city: payload.city || undefined,
        state: payload.state || undefined,
        postalCode: payload.postalCode || undefined,
        country: payload.country || undefined,
        companyAddress: payload.companyAddress || undefined,
      };

      const res = await fetch(`${BASE}/leads`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Failed to create lead");
      }

      onCreated();
      alert("Lead created successfully.");
    } catch (err: any) {
      setError(err?.message || "Failed to create lead.");
    } finally {
      setSubmitting(false);
    }
  };

  // open small add-list modal and fetch items from server for that type
  const openAddModal = async (type: "clientCategory" | "leadSource" | "dealCategory") => {
    setAddModalOpen(type);
    setAddName("");
    setLoadingAddList(true);
    setAddListItems([]);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No token");

      if (type === "leadSource") {
        const res = await fetch(`${BASE}/deals/dealCategory/LeadSource`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json)) setAddListItems(json); // objects with id,name
        }
      } else {
        // dealCategory used for both dealCategory and clientCategory
        const res = await fetch(`${BASE}/deals/dealCategory`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json)) setAddListItems(json); // objects with id, categoryName
        }
      }
    } catch {
      // ignore
    } finally {
      setLoadingAddList(false);
    }
  };

  // add new item to server and update local arrays + select value
  const addItem = async (type: "clientCategory" | "leadSource" | "dealCategory") => {
    if (!addName.trim()) return alert("Please enter a name.");
    setLoadingAddList(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No token");

      let url = "";
      let body: any = {};
      if (type === "leadSource") {
        url = `${BASE}/deals/dealCategory/LeadSource`;
        body = { name: addName.trim() };
      } else {
        url = `${BASE}/deals/dealCategory`;
        body = { categoryName: addName.trim() };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Failed to add");
      }
      const created = await res.json();

      // Update local arrays and choose the created value
      if (type === "leadSource") {
        setLeadSources((prev) => [{ id: created.id, name: created.name || addName.trim() }, ...prev]);
        setPayload((p) => ({ ...p, leadSource: created.name || addName.trim() }));
      } else {
        // dealCategory or clientCategory
        setDealCategories((prev) => [{ id: created.id, categoryName: created.categoryName || addName.trim() }, ...prev]);
        setClientCategories((prev) => [{ id: created.id, categoryName: created.categoryName || addName.trim() }, ...prev]);
        setPayload((p) => ({ ...p, deal: { ...(p.deal as DealPayload), dealCategory: created.categoryName || addName.trim() }, clientCategory: created.categoryName || addName.trim() }));
      }

      setAddName("");
      setAddModalOpen(null);
      alert("Added successfully.");
    } catch (err: any) {
      alert("Error: " + (err?.message || err));
    } finally {
      setLoadingAddList(false);
    }
  };

  // delete item from server (dealCategory or leadSource)
  const deleteItem = async (type: "clientCategory" | "leadSource" | "dealCategory", id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No token");

      let url = "";
      if (type === "leadSource") {
        url = `${BASE}/deals/dealCategory/LeadSource/${id}`; // assumed delete path
      } else {
        url = `${BASE}/deals/dealCategory/${id}`; // provided delete endpoint
      }

      const res = await fetch(url, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Delete failed");
      }

      // Remove locally from lists shown
      if (type === "leadSource") setLeadSources((s) => s.filter((x) => x.id !== id));
      else {
        setDealCategories((s) => s.filter((x) => x.id !== id));
        setClientCategories((s) => s.filter((x) => x.id !== id));
      }

      alert("Deleted successfully.");
    } catch (err: any) {
      alert("Error deleting: " + (err?.message || err));
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      <div className="fixed inset-0 flex items-start justify-center px-4 pt-8">
        <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg border overflow-auto" style={{ maxHeight: "92vh" }}>
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
                  <Input value={payload.name} onChange={(e) => update("name", e.target.value)} />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Email *</label>
                  <Input value={payload.email} type="email" onChange={(e) => update("email", e.target.value)} />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Client Category</label>
                  <div className="flex gap-2">
                    <select value={payload.clientCategory} onChange={(e) => update("clientCategory", e.target.value)} className="w-full border rounded-md p-2">
                      <option value="">--</option>
                      {clientCategories.map((c) => <option key={c.id} value={c.categoryName}>{c.categoryName}</option>)}
                    </select>
                    <button type="button" onClick={() => openAddModal("clientCategory")} className="px-3 rounded border">Add</button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Lead Source</label>
                  <div className="flex gap-2">
                    <select value={payload.leadSource} onChange={(e) => update("leadSource", e.target.value)} className="w-full border rounded-md p-2">
                      <option value="">--</option>
                      {leadSources.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                    <button type="button" onClick={() => openAddModal("leadSource")} className="px-3 rounded border">Add</button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Added By</label>
                  <select value={payload.addedBy} onChange={(e) => update("addedBy", e.target.value)} className="w-full border rounded-md p-2">
                    <option value="">--</option>
                    {employees.map((emp) => <option key={emp.employeeId} value={emp.employeeId}>{emp.name} ({emp.employeeId})</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Lead Owner</label>
                  <select value={payload.leadOwner} onChange={(e) => update("leadOwner", e.target.value)} className="w-full border rounded-md p-2">
                    <option value="">--</option>
                    {employees.map((emp) => <option key={emp.employeeId} value={emp.employeeId}>{emp.name} ({emp.employeeId})</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-2 md:col-span-2">
                  <Checkbox checked={payload.createDeal} onCheckedChange={(c) => update("createDeal", !!c)} />
                  <span className="text-sm">Create Deal</span>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox checked={payload.autoConvertToClient} onCheckedChange={(c) => update("autoConvertToClient", !!c)} />
                  <span className="text-sm">Auto convert lead to client when deal stage is set to 'Win'</span>
                </div>
              </div>

              {/* Deal area */}
              {(payload.createDeal || payload.autoConvertToClient) && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Deal Name *</label>
                    <Input value={payload.deal!.title} onChange={(e) => updateDeal("title", e.target.value)} />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Pipeline *</label>
                    <select value={payload.deal!.pipeline} onChange={(e) => updateDeal("pipeline", e.target.value)} className="w-full border rounded-md p-2">
                      {defaultPipelines.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Deal Stage *</label>
                    <select value={payload.deal!.dealStage} onChange={(e) => updateDeal("dealStage", e.target.value)} className="w-full border rounded-md p-2">
                      {defaultDealStages.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Deal Value *</label>
                    <div className="flex">
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
                    <div className="flex gap-2">
                      <select value={payload.deal!.dealCategory} onChange={(e) => updateDeal("dealCategory", e.target.value)} className="w-full border rounded-md p-2">
                        <option value="">--</option>
                        {dealCategories.map((d) => <option key={d.id} value={d.categoryName}>{d.categoryName}</option>)}
                      </select>
                      <button type="button" onClick={() => openAddModal("dealCategory")} className="px-3 rounded border">Add</button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Deal Agent *</label>
                    <select value={payload.deal!.dealAgent} onChange={(e) => updateDeal("dealAgent", e.target.value)} className="w-full border rounded-md p-2">
                      <option value="">--</option>
                      {employees.map(emp => <option key={emp.employeeId} value={emp.employeeId}>{emp.name} ({emp.employeeId})</option>)}
                    </select>
                  </div>

                  {/* -------------------------
                      Deal Watchers — MULTI-SELECT dropdown (employeeId values)
                      ------------------------- */}
                  <div className="md:col-span-3">
                    <label className="text-sm text-muted-foreground">Deal Watcher(s)</label>

                    {/* Multi-select: uses native <select multiple> for simplicity and reliability */}
                    <select
                      multiple
                      value={payload.deal!.dealWatchers}
                      onChange={(e) => {
                        const options = Array.from(e.target.options);
                        const selected = options.filter(o => o.selected).map(o => o.value);
                        updateDeal("dealWatchers", selected);
                      }}
                      className="w-full border rounded-md p-2 h-32"
                    >
                      {employees.map(emp => (
                        <option key={emp.employeeId} value={emp.employeeId}>
                          {emp.name} ({emp.employeeId})
                        </option>
                      ))}
                    </select>

                    {/* Also show a helper text with selected names */}
                    <div className="mt-2 text-sm text-muted-foreground">
                      Selected:{" "}
                      {payload.deal!.dealWatchers.length === 0
                        ? "—"
                        : payload.deal!.dealWatchers
                            .map(id => employees.find(emp => emp.employeeId === id)?.name ?? id)
                            .join(", ")}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Company Details */}
            <div className="rounded-lg border p-4">
              <h4 className="font-medium mb-3">Company Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Company Name *</label>
                  <Input value={payload.companyName} onChange={(e) => update("companyName", e.target.value)} />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Official Website</label>
                  <Input value={payload.officialWebsite} onChange={(e) => update("officialWebsite", e.target.value)} />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Mobile Number</label>
                  <Input value={payload.mobileNumber} onChange={(e) => update("mobileNumber", e.target.value)} />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Office Phone No.</label>
                  <Input value={payload.officePhone} onChange={(e) => update("officePhone", e.target.value)} />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">City</label>
                  <Input value={payload.city} onChange={(e) => update("city", e.target.value)} />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">State</label>
                  <Input value={payload.state} onChange={(e) => update("state", e.target.value)} />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Postal Code</label>
                  <Input value={payload.postalCode} onChange={(e) => update("postalCode", e.target.value)} />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Country</label>
                  <Input value={payload.country} onChange={(e) => update("country", e.target.value)} />
                </div>

                <div className="md:col-span-3">
                  <label className="text-sm text-muted-foreground">Company Address</label>
                  <textarea value={payload.companyAddress} onChange={(e) => update("companyAddress", e.target.value)} className="w-full border rounded-md p-2 h-28" />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
              <Button type="submit" onClick={submit} disabled={submitting}>{submitting ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        </div>
      </div>

      {/* Small Add-List Modal (server-backed) */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/20" onClick={() => setAddModalOpen(null)} />
          <div className="fixed inset-0 flex items-start justify-center px-4 pt-20">
            <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg border overflow-auto">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">
                  {addModalOpen === "clientCategory" ? "Client Category" : addModalOpen === "leadSource" ? "Lead Source" : "Deal Category"}
                </h3>
                <button onClick={() => setAddModalOpen(null)} className="text-muted-foreground p-1 rounded hover:bg-slate-100">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-4">
                <div className="mb-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-blue-50">
                          <th className="p-2 text-left">#</th>
                          <th className="p-2 text-left">Name</th>
                          <th className="p-2 text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(addListItems.length
                          ? addListItems
                          : addModalOpen === "clientCategory"
                          ? clientCategories
                          : addModalOpen === "leadSource"
                          ? leadSources
                          : dealCategories
                        ).map((item: any, i: number) => (
                          <tr key={i} className="border-t">
                            <td className="p-2">{i + 1}</td>
                            <td className="p-2">{item.categoryName || item.name}</td>
                            <td className="p-2">
                              <button
                                onClick={() =>
                                  deleteItem(
                                    addModalOpen === "leadSource" ? "leadSource" : addModalOpen === "clientCategory" ? "clientCategory" : "dealCategory",
                                    item.id
                                  )
                                }
                                className="text-destructive"
                              >
                                🗑
                              </button>
                            </td>
                          </tr>
                        ))}
                        {(!addListItems.length && !(addModalOpen === "clientCategory" ? clientCategories.length : addModalOpen === "leadSource" ? leadSources.length : dealCategories.length)) && (
                          <tr>
                            <td colSpan={3} className="p-4 text-sm text-muted-foreground">No items found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-muted-foreground mb-1">Name *</label>
                  <input value={addName} onChange={(e) => setAddName(e.target.value)} className="w-full border rounded-md p-2" placeholder="Enter name" />
                </div>

                <div className="flex justify-end gap-2">
                  <button onClick={() => setAddModalOpen(null)} className="rounded-md px-4 py-2 border">Cancel</button>
                  <button onClick={() => addItem(addModalOpen)} disabled={loadingAddList} className="rounded-md bg-sky-600 text-white px-4 py-2">
                    {loadingAddList ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
