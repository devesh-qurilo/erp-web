"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Eye,
  FileText,
  MoreHorizontal,
  DollarSign,
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";

/* --------------------------
  Types
---------------------------*/
type Company = { companyName?: string | null; companyLogoUrl?: string | null };
type Client = {
  clientId?: string;
  name?: string | null;
  profilePictureUrl?: string | null;
  companyName?: string | null;
  company?: Company | null;
};
type Project = {
  projectName?: string | null;
  projectCode?: string | null;
  projectId?: string | null;
  budget?: number | null;
  currency?: string | null;
};
type Invoice = {
  id: number;
  invoiceNumber?: string | null;
  invoiceDate?: string | null;
  currency?: string | null;
  client?: Client | null;
  project?: Project | null;
  status?: string | null;
  total?: number | null;
  amount?: number | null;
  tax?: number | null;
  discount?: number | null;
  fileUrls?: string[] | null;
  paidAmount?: number | null;
  unpaidAmount?: number | null;
  adjustment?: number | null;
  createdAt?: string | null;
};

/* --------------------------
  Small Modal (reused)
---------------------------*/
function Modal({ open, title, onClose, children }: { open: boolean; title?: string; onClose: () => void; children: React.ReactNode; }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto px-4 py-8">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl bg-white rounded shadow-lg ">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button variant="ghost" onClick={onClose}><span className="sr-only">Close</span>✕</Button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

/* --------------------------
  Main Component
---------------------------*/
export default function InvoiceList() {
  const router = useRouter();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters (kept small for context)
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>("All");
  const [clientFilter, setClientFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" });

  // Create modal
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Active invoice (for other actions)
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);

  // Derived project/client lists (populated from invoices; replace with dedicated endpoints if available)
  const projectList = useMemo(() => {
    const map = new Map<string, Project>();
    invoices.forEach((i) => {
      const p = i.project;
      if (p?.projectName) {
        // use projectName as key; if projectId exists keep it
        map.set(p.projectName, {
          projectName: p.projectName,
          projectCode: p.projectCode,
          projectId: p.projectId ?? p.projectCode ?? p.projectName ?? undefined,
          budget: (p as any).budget ?? undefined,
          currency: p.currency ?? undefined,
        } as Project);
      }
    });
    return Array.from(map.values());
  }, [invoices]);

  const clientList = useMemo(() => {
    const map = new Map<string, Client>();
    invoices.forEach((i) => {
      const c = i.client;
      if (c?.name) map.set(c.name, c);
    });
    return Array.from(map.values());
  }, [invoices]);

  /* ---------------------------------------------------------
     CREATE FORM STATE (UI matches screenshot)
     Fields shown in screenshot:
      - Invoice Number (prefilled INV# placeholder)
      - Invoice Date
      - Currency (select)
      - Project (select)
      - Client (select)
      - Project Budget (read-only display)
      - Amount, Tax %, Discount (inputs)
      - Subtotal / Discount / Tax / Total calculation panel
      - Amount in words
      - Notes/Description
  --------------------------------------------------------- */
  const [create, setCreate] = useState({
    invoiceNumber: "",
    invoiceDate: "",
    currency: "USD",
    projectId: "",    // will store projectId (or projectCode if id not available)
    projectName: "",
    clientId: "",
    amount: 0,
    taxPercent: 10,
    discountValue: 0, // can be percent or absolute; we'll treat as percent (matching screenshot)
    amountInWords: "",
    notes: "",
  });

  // Helper - find selected project object (to show project budget & currency)
  const selectedProject = useMemo(() => projectList.find((p) => (p.projectId ?? p.projectName) === create.projectId || p.projectName === create.projectName) ?? null, [create.projectId, create.projectName, projectList]);

  // Calculations
  const subtotal = useMemo(() => {
    return Number(create.amount ?? 0);
  }, [create.amount]);

  const discountAmount = useMemo(() => {
    const disc = Number(create.discountValue ?? 0);
    // treat as percent (UI shows % in screenshot)
    return (subtotal * disc) / 100;
  }, [subtotal, create.discountValue]);

  const taxAmount = useMemo(() => {
    const tax = Number(create.taxPercent ?? 0);
    const base = subtotal - discountAmount;
    return (base * tax) / 100;
  }, [subtotal, discountAmount, create.taxPercent]);

  const total = useMemo(() => {
    return subtotal - discountAmount + taxAmount;
  }, [subtotal, discountAmount, taxAmount]);

  // fetch invoices list
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/finance/invoices", {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}` },
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`Failed to fetch invoices: ${res.status} ${t}`);
      }
      const data = await res.json();
      const arr = Array.isArray(data) ? data : data?.invoices ?? [];
      setInvoices(arr);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Failed to load invoices");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Safe date formatter
  const safeFormatDate = (d?: string | null) => {
    if (!d) return "N/A";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "N/A";
    return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  // Basic status badge
  const getStatusBadge = (status?: string | null) => {
    const s = (status ?? "").toString().toLowerCase();
    if (s === "paid") return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
    if (s === "unpaid") return <Badge className="bg-red-100 text-red-800">Unpaid</Badge>;
    if (s.includes("credit")) return <Badge className="bg-yellow-100 text-yellow-800">Credit Note</Badge>;
    if (!s) return <Badge variant="outline">Unknown</Badge>;
    return <Badge>{status}</Badge>;
  };

  // Create invoice API call (POST to base url provided)
  const handleCreateInvoice = async () => {
    // validation
    if (!create.invoiceDate || !create.currency || (!create.projectId && !create.projectName) || !create.clientId) {
      alert("Please fill required fields: Invoice Date, Currency, Project and Client.");
      return;
    }

    setCreating(true);
    try {
      // Build payload exactly as your API expects
      const payload: any = {
        invoiceNumber: create.invoiceNumber || undefined,
        invoiceDate: create.invoiceDate,
        currency: create.currency,
        projectId: create.projectId || create.projectName, // if you have real projectId, use that
        clientId: create.clientId,
        amount: Number(create.amount || 0),
        tax: Number(create.taxPercent || 0),
        discount: Number(create.discountValue || 0),
        amountInWords: create.amountInWords,
        notes: create.notes,
      };

      // POST to given base
      const res = await fetch("https://chat.swiftandgo.in/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization if needed; using localStorage token similar to other calls
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Create failed: ${res.status} ${text}`);
      }

      const created = await res.json();
      // Success: close modal and refresh list
      setOpenCreateModal(false);
      // Clear create form
      setCreate({
        invoiceNumber: "",
        invoiceDate: "",
        currency: "USD",
        projectId: "",
        projectName: "",
        clientId: "",
        amount: 0,
        taxPercent: 10,
        discountValue: 0,
        amountInWords: "",
        notes: "",
      });
      await fetchInvoices();
      // Optionally navigate to created invoice detail:
      // router.push(`/finance/invoices/${created.invoiceNumber}`);
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Create invoice failed");
    } finally {
      setCreating(false);
    }
  };

  // Filtered invoices (basic)
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (search) {
        const s = search.toLowerCase();
        return (
          (inv.invoiceNumber ?? "").toString().toLowerCase().includes(s) ||
          (inv.project?.projectName ?? "").toString().toLowerCase().includes(s) ||
          (inv.client?.name ?? "").toString().toLowerCase().includes(s)
        );
      }
      if (projectFilter !== "All" && (inv.project?.projectName ?? "") !== projectFilter) return false;
      if (clientFilter !== "All" && (inv.client?.name ?? "") !== clientFilter) return false;
      if (statusFilter !== "All" && (inv.status ?? "") !== statusFilter) return false;
      if (dateRange.start && dateRange.end) {
        if (!inv.invoiceDate) return false;
        const invDate = new Date(inv.invoiceDate);
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        end.setHours(23, 59, 59, 999);
        if (invDate < start || invDate > end) return false;
      }
      return true;
    });
  }, [invoices, search, projectFilter, clientFilter, statusFilter, dateRange]);

  // UI render
  if (loading) return <div className="container mx-auto p-6"><p className="text-center text-gray-600">Loading invoices...</p></div>;
  if (error) return <div className="container mx-auto p-6"><p className="text-center text-red-500">Error: {error}</p></div>;

  return (
    <div className="container mx-auto p-6">
      {/* Header and Create button (left as in screenshot) */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setOpenCreateModal(true)}
            className="flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Invoice
          </Button>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-600 mt-1">Manage and track all your invoices</p>
          </div>
        </div>
      </div>

      {/* Filters (kept same) */}
      <div className="mb-4 border rounded-md bg-white px-3 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border rounded p-2 bg-white">
            <span className="text-sm text-gray-600">Duration</span>
            <input type="date" className="text-xs border rounded px-2 py-1" value={dateRange.start} onChange={(e) => setDateRange(p => ({ ...p, start: e.target.value }))} />
            <span className="text-sm text-gray-400">to</span>
            <input type="date" className="text-xs border rounded px-2 py-1" value={dateRange.end} onChange={(e) => setDateRange(p => ({ ...p, end: e.target.value }))} />
          </div>

          <Select value={clientFilter} onValueChange={(v) => setClientFilter(v)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Client" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              {clientList.map((c) => (
                <SelectItem key={c.name} value={c.name ?? ""}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={projectFilter} onValueChange={(v) => setProjectFilter(v)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Project" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              {projectList.map((p) => (
                <SelectItem key={p.projectName} value={p.projectName ?? ""}>{p.projectName}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              {/* derive statuses */}
              {Array.from(new Set(invoices.map(i => i.status ?? ""))).filter(Boolean).map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-2 text-gray-400" />
            <Input placeholder="Search invoice / project / client" className="pl-8 w-[260px]" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <Button variant="outline" className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> Filters</Button>
      </div>

      {/* Table (abbreviated) */}
      <div className="border rounded-lg bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Code</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Client</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Invoice Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-10 text-gray-500">No invoices found</TableCell></TableRow>
            ) : (
              filteredInvoices.map((inv) => (
                <TableRow key={inv.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{inv.project?.projectCode ?? "N/A"}</TableCell>
                  <TableCell><p className="font-medium">{inv.invoiceNumber ?? "N/A"}</p></TableCell>
                  <TableCell>{inv.project?.projectName ?? "N/A"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {inv.client?.profilePictureUrl ? (
                        <Image src={inv.client.profilePictureUrl} alt={inv.client.name ?? "Client"} width={32} height={32} className="rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-600">{inv.client?.name?.charAt(0)?.toUpperCase() ?? "?"}</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{inv.client?.name ?? "N/A"}</p>
                        <p className="text-xs text-gray-500">{inv.client?.company?.companyName ?? ""}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{inv.currency ? `${inv.currency} ${Number(inv.total ?? 0).toFixed(2)}` : `$ ${Number(inv.total ?? 0).toFixed(2)}`}</TableCell>
                  <TableCell>{safeFormatDate(inv.invoiceDate)}</TableCell>
                  <TableCell>{getStatusBadge(inv.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => { setActiveInvoice(inv); }}>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => { /* other actions */ }}>
                          <FileText className="mr-2 h-4 w-4" /> Payments
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* -------------------------
         Create Invoice Modal: UI matches screenshot
      ------------------------- */}
      <Modal open={openCreateModal} title="Create Invoice" onClose={() => setOpenCreateModal(false)}>
        <div className="space-y-6">
          {/* Card: Invoice Details */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">Invoice Details</h4>

            <div className="grid grid-cols-3 gap-4 items-end">
              {/* Invoice Number */}
              <div>
                <label className="text-sm text-gray-600 block">Invoice Number *</label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="px-2 py-2 bg-gray-100 rounded-l text-gray-600">INV#</div>
                  <input
                    className="border rounded-r px-3 py-2 w-full"
                    placeholder="INV-2025-XXX"
                    value={create.invoiceNumber}
                    onChange={(e) => setCreate(p => ({ ...p, invoiceNumber: e.target.value }))}
                  />
                </div>
              </div>

              {/* Invoice Date */}
              <div>
                <label className="text-sm text-gray-600 block">Invoice Date *</label>
                <input
                  type="date"
                  className="border rounded px-3 py-2 w-full mt-1"
                  value={create.invoiceDate}
                  onChange={(e) => setCreate(p => ({ ...p, invoiceDate: e.target.value }))}
                />
              </div>

              {/* Currency */}
              <div>
                <label className="text-sm text-gray-600 block">Currency *</label>
                <select
                  className="border rounded px-3 py-2 w-full mt-1"
                  value={create.currency}
                  onChange={(e) => setCreate(p => ({ ...p, currency: e.target.value }))}
                >
                  <option value="USD">USD $</option>
                  <option value="INR">INR ₹</option>
                  <option value="EUR">EUR €</option>
                  <option value="GBP">GBP £</option>
                </select>
              </div>
            </div>
          </div>

          {/* Project Details card */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">Project Details</h4>

            <div className="grid grid-cols-3 gap-4">
              {/* Project select */}
              <div>
                <label className="text-sm text-gray-600 block">Project *</label>
                <select
                  className="border rounded px-3 py-2 w-full mt-1"
                  value={create.projectId || create.projectName}
                  onChange={(e) => {
                    const selected = e.target.value;
                    // find project by projectName or id
                    const p = projectList.find(pp => (pp.projectId ?? pp.projectName) === selected || pp.projectName === selected);
                    setCreate(prev => ({
                      ...prev,
                      projectId: selected,
                      projectName: p?.projectName ?? selected,
                    }));
                  }}
                >
                  <option value="">Select Project</option>
                  {projectList.map((p) => (
                    <option key={p.projectId ?? p.projectName} value={p.projectId ?? p.projectName}>
                      {p.projectName} {p.projectCode ? `(${p.projectCode})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Client select */}
              <div>
                <label className="text-sm text-gray-600 block">Client *</label>
                <select
                  className="border rounded px-3 py-2 w-full mt-1"
                  value={create.clientId}
                  onChange={(e) => setCreate(p => ({ ...p, clientId: e.target.value }))}
                >
                  <option value="">Select Client</option>
                  {clientList.map((c) => (
                    <option key={c.clientId ?? c.name} value={c.clientId ?? c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Project Budget (read-only) */}
              <div>
                <label className="text-sm text-gray-600 block">Project Budget *</label>
                <div className="mt-1 flex items-center">
                  <div className="px-2 py-2 bg-gray-100 rounded-l text-gray-600">{selectedProject?.currency ?? create.currency ?? "USD"}</div>
                  <input
                    readOnly
                    className="border rounded-r px-3 py-2 w-full bg-gray-50"
                    value={selectedProject?.budget ? Number(selectedProject.budget).toLocaleString() : "$ 0.00"}
                  />
                </div>
              </div>
            </div>

            {/* Amount / Tax / Amount panel */}
            <div className="mt-4 border rounded p-3 grid grid-cols-12 gap-3 items-center">
              <div className="col-span-7">
                <label className="text-sm text-gray-600">Amount</label>
                <div className="mt-1">
                  <input
                    type="number"
                    step="0.01"
                    className="border rounded px-3 py-2 w-full"
                    value={create.amount}
                    onChange={(e) => setCreate(p => ({ ...p, amount: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="col-span-3">
                <label className="text-sm text-gray-600">Tax (%)</label>
                <input
                  type="number"
                  step="0.01"
                  className="border rounded px-3 py-2 w-full mt-1"
                  value={create.taxPercent}
                  onChange={(e) => setCreate(p => ({ ...p, taxPercent: Number(e.target.value) }))}
                />
              </div>

              <div className="col-span-2 bg-gray-50 rounded p-2 text-center">
                <div className="text-xs text-gray-500">Amount</div>
                <div className="text-lg font-semibold">{create.currency} {Number(total).toFixed(2)}</div>
              </div>
            </div>

            {/* Subtotal / Discount / Tax / Total summary (right side style like screenshot) */}
            <div className="mt-4 grid grid-cols-4 gap-3">
              <div className="col-span-2" />
              <div className="col-span-2 border rounded p-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <div>Sub Total</div>
                  <div>{create.currency} {Number(subtotal).toFixed(2)}</div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-600">Discount</div>
                    <input
                      type="number"
                      className="w-16 border rounded px-2 py-1"
                      value={create.discountValue}
                      onChange={(e) => setCreate(p => ({ ...p, discountValue: Number(e.target.value) }))}
                    />
                    <select className="border rounded px-2 py-1" value="%" disabled>
                      <option>%</option>
                    </select>
                  </div>
                  <div>{create.currency} {Number(discountAmount).toFixed(2)}</div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="text-sm text-gray-600">Tax</div>
                  <div>{create.currency} {Number(taxAmount).toFixed(2)}</div>
                </div>

                <div className="mt-3 bg-gray-100 rounded py-2 px-3 flex justify-between font-semibold">
                  <div>Total</div>
                  <div>{create.currency} {Number(total).toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Amount in words and notes */}
          <div className="border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 block">Amount in words</label>
                <input
                  className="border rounded px-3 py-2 w-full mt-1"
                  value={create.amountInWords}
                  onChange={(e) => setCreate(p => ({ ...p, amountInWords: e.target.value }))}
                  placeholder="One thousand dollars"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block">Project Budget (duplicate)</label>
                <div className="mt-1">
                  <input
                    readOnly
                    className="border rounded px-3 py-2 w-full bg-gray-50"
                    value={selectedProject?.budget ? `${selectedProject.currency ?? create.currency} ${Number(selectedProject.budget).toLocaleString()}` : `${create.currency} 0.00`}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm text-gray-600 block">Note / Description for the recipient</label>
              <textarea
                className="border rounded px-3 py-2 w-full mt-1"
                rows={4}
                value={create.notes}
                onChange={(e) => setCreate(p => ({ ...p, notes: e.target.value }))}
                placeholder="Notes..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setOpenCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreateInvoice} disabled={creating}>
              {creating ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
