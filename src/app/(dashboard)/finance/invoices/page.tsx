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
  Edit2,
  CheckCircle,
  FilePlus,
  Upload,
  Copy,
  Trash,
  Bell,
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
   Types (accept nulls)
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
  projectId?: string | null;
  projectName?: string | null;
  projectCode?: string | null;
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
   Reusable Modal (backdrop fixed)
---------------------------*/
function Modal({ open, title, onClose, children }: { open: boolean; title?: string; onClose: () => void; children: React.ReactNode; }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center px-4 py-8">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-auto max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* --------------------------
   Main component
---------------------------*/
export default function InvoiceList() {
  const router = useRouter();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // filters
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>("All");
  const [clientFilter, setClientFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" });

  // modal states
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [openAddPaymentModal, setOpenAddPaymentModal] = useState(false);
  const [openViewPaymentsModal, setOpenViewPaymentsModal] = useState(false);
  const [openAddReceiptModal, setOpenAddReceiptModal] = useState(false);
  const [openViewReceiptsModal, setOpenViewReceiptsModal] = useState(false);

  // active invoice and small UI flags
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [addingPayment, setAddingPayment] = useState(false);
  const [addingReceipt, setAddingReceipt] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [deletingInvoice, setDeletingInvoice] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);

  // simple forms
  const [createForm, setCreateForm] = useState<any>({
    invoiceNumber: "",
    invoiceDate: "",
    currency: "USD",
    projectId: "",
    clientId: "",
    amount: 0,
    tax: 10,
    discount: 0,
    amountInWords: "",
    notes: "",
  });

  const [editForm, setEditForm] = useState<any>({});
  const [paymentForm, setPaymentForm] = useState<any>({});
  const [receiptForm, setReceiptForm] = useState<any>({});
  const [paymentsForActive, setPaymentsForActive] = useState<any[]>([]);

  /* --------------------------
     Fetch invoices
  ---------------------------*/
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
      setError(null);
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

  /* --------------------------
     Derived lists for selects
  ---------------------------*/
  const projectList = useMemo(() => {
    const setP = new Set<string>();
    invoices.forEach((i) => {
      if (i.project?.projectName) setP.add(i.project.projectName);
    });
    return ["All", ...Array.from(setP)];
  }, [invoices]);

  const clientList = useMemo(() => {
    const setC = new Set<string>();
    invoices.forEach((i) => {
      if (i.client?.name) setC.add(i.client.name);
    });
    return ["All", ...Array.from(setC)];
  }, [invoices]);

  const statusList = useMemo(() => {
    const setS = new Set<string>();
    invoices.forEach((i) => {
      if (i.status) setS.add(i.status);
    });
    return ["All", ...Array.from(setS)];
  }, [invoices]);

  /* --------------------------
     Helpers
  ---------------------------*/
  const safeFormatDate = (d?: string | null) => {
    if (!d) return "N/A";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "N/A";
    return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const getStatusBadge = (status?: string | null) => {
    const s = (status ?? "").toLowerCase();
    if (s === "paid") return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
    if (s === "unpaid") return <Badge className="bg-red-100 text-red-800">Unpaid</Badge>;
    if (s.includes("credit")) return <Badge className="bg-yellow-100 text-yellow-800">Credit Note</Badge>;
    if (!s) return <Badge variant="outline">Unknown</Badge>;
    return <Badge>{status}</Badge>;
  };

  /* --------------------------
     Filtered invoices
  ---------------------------*/
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (search) {
        const s = search.toLowerCase();
        const match =
          (inv.invoiceNumber ?? "").toLowerCase().includes(s) ||
          (inv.project?.projectName ?? "").toLowerCase().includes(s) ||
          (inv.client?.name ?? "").toLowerCase().includes(s) ||
          (inv.project?.projectCode ?? "").toLowerCase().includes(s);
        if (!match) return false;
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

  /* --------------------------
     API actions
  ---------------------------*/

  // Create invoice -> POST https://chat.swiftandgo.in/api/invoices
  const handleCreateInvoice = async () => {
    // basic client-side validation
    if (!createForm.invoiceDate || !createForm.currency || !createForm.projectId || !createForm.clientId) {
      alert("Please fill required fields: invoice date, currency, project and client.");
      return;
    }

    const token = localStorage.getItem("accessToken") || "";
    if (!token) {
      alert("Access token missing. Please login again.");
      return;
    }

    setCreating(true);
    try {
      const payload = {
        invoiceNumber: createForm.invoiceNumber || undefined,
        invoiceDate: createForm.invoiceDate,
        currency: createForm.currency,
        projectId: createForm.projectId,
        clientId: createForm.clientId,
        amount: Number(createForm.amount || 0),
        tax: Number(createForm.tax || 0),
        discount: Number(createForm.discount || 0),
        amountInWords: createForm.amountInWords,
        notes: createForm.notes,
      };

      console.log("Creating invoice payload:", payload);

      const res = await fetch("https://chat.swiftandgo.in/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text().catch(() => "");
      let body: any = text;
      try { body = JSON.parse(text); } catch { /* keep text */ }

      if (!res.ok) {
        console.error("Create failed response:", res.status, body);
        const serverMsg = typeof body === "object" && body?.message ? body.message : (typeof body === "string" ? body : "");
        alert(`Create failed: ${res.status} ${res.statusText}${serverMsg ? " — " + serverMsg : ""}`);
        return;
      }

      // success -> refresh list and close modal
      setOpenCreateModal(false);
      setCreateForm({
        invoiceNumber: "",
        invoiceDate: "",
        currency: "USD",
        projectId: "",
        clientId: "",
        amount: 0,
        tax: 10,
        discount: 0,
        amountInWords: "",
        notes: "",
      });
      await fetchInvoices();
    } catch (err: any) {
      console.error("handleCreateInvoice error:", err);
      alert(err?.message || "Create invoice failed");
    } finally {
      setCreating(false);
    }
  };

  // Edit invoice (PUT /api/invoices/{invoiceNumber})
  const handleEditInvoice = async () => {
    if (!activeInvoice?.invoiceNumber) return;
    setEditing(true);
    try {
      const body = {
        invoiceDate: editForm.invoiceDate,
        currency: editForm.currency,
        amount: Number(editForm.amount || 0),
        tax: Number(editForm.tax || 0),
        discount: Number(editForm.discount || 0),
        amountInWords: editForm.amountInWords,
        notes: editForm.notes,
      };
      const res = await fetch(`/api/invoices/${activeInvoice.invoiceNumber}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`Update failed: ${res.status} ${t}`);
      }
      await res.json();
      setOpenEditModal(false);
      await fetchInvoices();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Update failed");
    } finally {
      setEditing(false);
    }
  };

  // Upload file
  const handleUploadFile = async () => {
    if (!activeInvoice?.invoiceNumber) return;
    if (!fileToUpload) { alert("Choose a file"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", fileToUpload);
      const res = await fetch(`/api/invoices/${activeInvoice.invoiceNumber}/files`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}` },
        body: fd,
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`Upload failed: ${res.status} ${t}`);
      }
      await res.json();
      setOpenUploadModal(false);
      setFileToUpload(null);
      await fetchInvoices();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Add payment (formdata)
  const handleAddPayment = async () => {
    setAddingPayment(true);
    try {
      const fd = new FormData();
      fd.append("payment", JSON.stringify(paymentForm));
      if (paymentFile) fd.append("file", paymentFile);
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}` },
        body: fd,
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`Add payment failed: ${res.status} ${t}`);
      }
      await res.json();
      setOpenAddPaymentModal(false);
      setPaymentFile(null);
      await fetchInvoices();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Add payment failed");
    } finally {
      setAddingPayment(false);
    }
  };

  // Fetch payments for invoice
  const fetchPaymentsForInvoice = async (invoiceNumber?: string | null) => {
    if (!invoiceNumber) return setPaymentsForActive([]);
    try {
      const res = await fetch(`/api/payments/invoice/${invoiceNumber}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}` },
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`Fetch payments failed: ${res.status} ${t}`);
      }
      const data = await res.json();
      setPaymentsForActive(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setPaymentsForActive([]);
    }
  };

  // Mark as paid
  const handleMarkAsPaid = async () => {
    if (!activeInvoice) return;
    setMarkingPaid(true);
    try {
      const res = await fetch(`/api/invoices/${activeInvoice.id}/mark-paid`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}` },
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`Mark paid failed: ${res.status} ${t}`);
      }
      await res.json();
      await fetchInvoices();
      setOpenViewModal(false);
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Mark as paid failed");
    } finally {
      setMarkingPaid(false);
    }
  };

  // Send payment reminder
  const handleSendPaymentReminder = async () => {
    if (!activeInvoice?.invoiceNumber) return;
    try {
      const res = await fetch(`/api/invoices/${activeInvoice.invoiceNumber}/actions/send-reminder-email`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}` },
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`Send reminder failed: ${res.status} ${t}`);
      }
      await res.json();
      alert("Reminder sent");
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Send reminder failed");
    }
  };

  // Delete invoice
  const handleDeleteInvoice = async (invoiceNumber?: string | null) => {
    if (!invoiceNumber) return;
    if (!confirm("Delete this invoice?")) return;
    setDeletingInvoice(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceNumber}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}` },
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`Delete failed: ${res.status} ${t}`);
      }
      await res.json();
      setActiveInvoice(null);
      await fetchInvoices();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Delete failed");
    } finally {
      setDeletingInvoice(false);
    }
  };

  // Duplicate invoice -> prefill create form
  const handleCreateDuplicate = (inv: Invoice) => {
    setCreateForm({
      invoiceNumber: "",
      invoiceDate: inv.invoiceDate ?? "",
      currency: inv.currency ?? "USD",
      projectId: inv.project?.projectId ?? inv.project?.projectName ?? "",
      clientId: inv.client?.clientId ?? "",
      amount: inv.amount ?? inv.total ?? 0,
      tax: inv.tax ?? 0,
      discount: inv.discount ?? 0,
      amountInWords: inv.amountInWords ?? "",
      notes: inv.notes ?? "",
    });
    setOpenCreateModal(true);
  };

  /* --------------------------
     UI states while loading/error
  ---------------------------*/
  if (loading) return <div className="container mx-auto p-6"><p className="text-center text-gray-600">Loading invoices...</p></div>;
  if (error) return <div className="container mx-auto p-6"><p className="text-center text-red-500">Error: {error}</p></div>;

  /* --------------------------
     Render
  ---------------------------*/
  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={() => {
            setCreateForm({
              invoiceNumber: "",
              invoiceDate: "",
              currency: "USD",
              projectId: "",
              clientId: "",
              amount: 0,
              tax: 10,
              discount: 0,
              amountInWords: "",
              notes: "",
            });
            setOpenCreateModal(true);
          }} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" /> Create Invoice
          </Button>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-600 mt-1">Manage and track all your invoices</p>
          </div>
        </div>

        <div className="flex items-center gap-3"></div>
      </div>

      {/* Filters */}
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
              {clientList.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={projectFilter} onValueChange={(v) => setProjectFilter(v)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Project" /></SelectTrigger>
            <SelectContent>
              {projectList.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              {statusList.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-2 text-gray-400" />
            <Input placeholder="Search invoice / project / client" className="pl-8 w-[260px]" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <Button variant="outline" className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> Filters</Button>
      </div>

      {/* Table */}
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
              filteredInvoices.map((inv) => {
                const statusKey = (inv.status ?? "").toString().toUpperCase();
                return (
                  <TableRow key={inv.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{inv.project?.projectCode ?? "N/A"}</TableCell>
                    <TableCell><p className="font-medium">{inv.invoiceNumber ?? "N/A"}</p></TableCell>
                    <TableCell>{inv.project?.projectName ?? "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {inv.client?.company?.companyLogoUrl ? (
                          <Image src={inv.client.company.companyLogoUrl} alt={inv.client.company.companyName ?? "Company"} width={32} height={32} className="rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-gray-600">{inv.client?.name?.charAt(0)?.toUpperCase() ?? "?"}</span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm">{inv.client?.name ?? "N/A"}</p>
                          <p className="text-xs text-gray-500">{inv.client?.company?.companyName ?? inv.client?.companyName ?? ""}</p>
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
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem onClick={() => { setActiveInvoice(inv); setOpenViewModal(true); }}>
                            <Eye className="mr-2 h-4 w-4" /> View
                          </DropdownMenuItem>

                          {statusKey === "UNPAID" && (
                            <>
                              <DropdownMenuItem onClick={() => { setActiveInvoice(inv); setEditForm({ invoiceDate: inv.invoiceDate, currency: inv.currency, amount: inv.amount ?? inv.total, tax: inv.tax, discount: inv.discount, amountInWords: inv.amountInWords, notes: inv.notes }); setOpenEditModal(true); }}>
                                <Edit2 className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => { setActiveInvoice(inv); if (confirm("Mark this invoice as paid?")) { handleMarkAsPaid(); } }}>
                                <CheckCircle className="mr-2 h-4 w-4" /> Mark as paid
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => { setActiveInvoice(inv); setPaymentForm({ projectId: inv.project?.projectId ?? "", clientId: inv.client?.clientId ?? "", currency: inv.currency ?? "", amount: inv.unpaidAmount ?? inv.total ?? 0, invoiceId: inv.invoiceNumber ?? "" }); setOpenAddPaymentModal(true); }}>
                                <DollarSign className="mr-2 h-4 w-4" /> Add payment
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => { setActiveInvoice(inv); fetchPaymentsForInvoice(inv.invoiceNumber ?? ""); setOpenViewPaymentsModal(true); }}>
                                <FileText className="mr-2 h-4 w-4" /> View payment
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => { setActiveInvoice(inv); if (confirm("Send payment reminder?")) handleSendPaymentReminder(); }}>
                                <Bell className="mr-2 h-4 w-4" /> Payment reminder
                              </DropdownMenuItem>
                            </>
                          )}

                          {statusKey === "PAID" && (
                            <>
                              <DropdownMenuItem onClick={() => { setActiveInvoice(inv); setOpenAddReceiptModal(true); }}>
                                <FilePlus className="mr-2 h-4 w-4" /> Add receipt
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => { setActiveInvoice(inv); fetchPaymentsForInvoice(inv.invoiceNumber ?? ""); setOpenViewReceiptsModal(true); }}>
                                <FileText className="mr-2 h-4 w-4" /> View receipt
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => { setActiveInvoice(inv); setOpenUploadModal(true); }}>
                                <Upload className="mr-2 h-4 w-4" /> Upload file
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => { setActiveInvoice(inv); fetchPaymentsForInvoice(inv.invoiceNumber ?? ""); setOpenViewPaymentsModal(true); }}>
                                <FileText className="mr-2 h-4 w-4" /> View payment
                              </DropdownMenuItem>
                            </>
                          )}

                          {statusKey.includes("CREDIT") && (
                            <>
                              <DropdownMenuItem onClick={() => { setActiveInvoice(inv); setPaymentForm({ projectId: inv.project?.projectId ?? "", clientId: inv.client?.clientId ?? "", currency: inv.currency ?? "", amount: inv.unpaidAmount ?? inv.total ?? 0, invoiceId: inv.invoiceNumber ?? "" }); setOpenAddPaymentModal(true); }}>
                                <DollarSign className="mr-2 h-4 w-4" /> Add payment
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => { setActiveInvoice(inv); fetchPaymentsForInvoice(inv.invoiceNumber ?? ""); setOpenViewPaymentsModal(true); }}>
                                <FileText className="mr-2 h-4 w-4" /> View payment
                              </DropdownMenuItem>
                            </>
                          )}

                          <DropdownMenuSeparator />

                          <DropdownMenuItem onClick={() => handleCreateDuplicate(inv)}>
                            <Copy className="mr-2 h-4 w-4" /> Create duplicate
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => { setActiveInvoice(inv); handleDeleteInvoice(inv.invoiceNumber ?? ""); }}>
                            <Trash className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* -------------------------
         Create Invoice Modal (UI like screenshots)
         ------------------------ */}
      <Modal open={openCreateModal} title="+ Create Invoice" onClose={() => setOpenCreateModal(false)}>
        <div className="space-y-6">
          {/* Invoice Details */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">Invoice Details</h4>
            <div className="grid grid-cols-3 gap-4 items-end">
              <div>
                <label className="text-sm text-gray-600 block">Invoice Number *</label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="px-2 py-2 bg-gray-100 rounded-l text-gray-600">INV#</div>
                  <input className="border rounded-r px-3 py-2 w-full" placeholder="INV-2025-XXX" value={createForm.invoiceNumber} onChange={(e) => setCreateForm((p:any) => ({ ...p, invoiceNumber: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 block">Invoice Date *</label>
                <input type="date" className="border rounded px-3 py-2 w-full mt-1" value={createForm.invoiceDate} onChange={(e) => setCreateForm((p:any) => ({ ...p, invoiceDate: e.target.value }))} />
              </div>

              <div>
                <label className="text-sm text-gray-600 block">Currency *</label>
                <select className="border rounded px-3 py-2 w-full mt-1" value={createForm.currency} onChange={(e) => setCreateForm((p:any) => ({ ...p, currency: e.target.value }))}>
                  <option value="USD">USD $</option>
                  <option value="INR">INR ₹</option>
                  <option value="EUR">EUR €</option>
                </select>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">Project Details</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-600 block">Project *</label>
                <select className="border rounded px-3 py-2 w-full mt-1" value={createForm.projectId} onChange={(e) => setCreateForm((p:any) => ({ ...p, projectId: e.target.value }))}>
                  <option value="">Select Project</option>
                  {projectList.filter(p=>p!=="All").map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600 block">Client *</label>
                <select className="border rounded px-3 py-2 w-full mt-1" value={createForm.clientId} onChange={(e) => setCreateForm((p:any) => ({ ...p, clientId: e.target.value }))}>
                  <option value="">Select Client</option>
                  {clientList.filter(c=>c!=="All").map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600 block">Project Budget *</label>
                <div className="mt-1 flex items-center">
                  <div className="px-2 py-2 bg-gray-100 rounded-l text-gray-600">{createForm.currency}</div>
                  <input readOnly className="border rounded-r px-3 py-2 w-full bg-gray-50" value={"30,000"} />
                </div>
              </div>
            </div>

            <div className="mt-4 border rounded p-3 grid grid-cols-12 gap-3 items-center">
              <div className="col-span-7">
                <label className="text-sm text-gray-600">Amount</label>
                <input type="number" step="0.01" className="border rounded px-3 py-2 w-full mt-1" value={createForm.amount} onChange={(e) => setCreateForm((p:any) => ({ ...p, amount: Number(e.target.value) }))} />
              </div>

              <div className="col-span-3">
                <label className="text-sm text-gray-600">Tax (%)</label>
                <input type="number" step="0.01" className="border rounded px-3 py-2 w-full mt-1" value={createForm.tax} onChange={(e) => setCreateForm((p:any) => ({ ...p, tax: Number(e.target.value) }))} />
              </div>

              <div className="col-span-2 bg-gray-50 rounded p-2 text-center">
                <div className="text-xs text-gray-500">Amount</div>
                <div className="text-lg font-semibold">{createForm.currency} {(Number(createForm.amount || 0) - (Number(createForm.discount || 0)/100*Number(createForm.amount||0)) + (((Number(createForm.amount||0) - (Number(createForm.discount||0)/100*Number(createForm.amount||0))) * Number(createForm.tax||0))/100)).toFixed(2)}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3">
              <div className="col-span-2" />
              <div className="col-span-2 border rounded p-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <div>Sub Total</div>
                  <div>{createForm.currency} {Number(createForm.amount || 0).toFixed(2)}</div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-600">Discount</div>
                    <input type="number" className="w-16 border rounded px-2 py-1" value={createForm.discount} onChange={(e) => setCreateForm((p:any) => ({ ...p, discount: Number(e.target.value) }))} />
                    <select className="border rounded px-2 py-1" value="%" disabled><option>%</option></select>
                  </div>
                  <div>{createForm.currency} {((Number(createForm.discount||0)/100)*Number(createForm.amount||0)).toFixed(2)}</div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="text-sm text-gray-600">Tax</div>
                  <div>{createForm.currency} {(((Number(createForm.amount||0) - (Number(createForm.discount||0)/100*Number(createForm.amount||0))) * Number(createForm.tax||0))/100).toFixed(2)}</div>
                </div>

                <div className="mt-3 bg-gray-100 rounded py-2 px-3 flex justify-between font-semibold">
                  <div>Total</div>
                  <div>{createForm.currency} {(Number(createForm.amount || 0) - (Number(createForm.discount||0)/100*Number(createForm.amount||0)) + (((Number(createForm.amount||0) - (Number(createForm.discount||0)/100*Number(createForm.amount||0))) * Number(createForm.tax||0))/100)).toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Amount in words + notes */}
          <div className="border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 block">Amount in words</label>
                <input className="border rounded px-3 py-2 w-full mt-1" value={createForm.amountInWords} onChange={(e) => setCreateForm((p:any) => ({ ...p, amountInWords: e.target.value }))} placeholder="One thousand dollars" />
              </div>

              <div>
                <label className="text-sm text-gray-600 block">Project Budget (duplicate)</label>
                <input readOnly className="border rounded px-3 py-2 w-full mt-1 bg-gray-50" value={`${createForm.currency} 30,000`} />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm text-gray-600 block">Note / Description for the recipient</label>
              <textarea className="border rounded px-3 py-2 w-full mt-1" rows={4} value={createForm.notes} onChange={(e) => setCreateForm((p:any) => ({ ...p, notes: e.target.value }))} placeholder="Notes..." />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setOpenCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreateInvoice} disabled={creating}>{creating ? "Saving..." : "Save"}</Button>
          </div>
        </div>
      </Modal>

      {/* -------------------------
         View / Edit / Upload / Payments modals (existing)
         ------------------------ */}
      <Modal open={openViewModal} title={`Invoice ${activeInvoice?.invoiceNumber ?? ""}`} onClose={() => { setOpenViewModal(false); setActiveInvoice(null); }}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Project</div>
              <div className="font-medium">{activeInvoice?.project?.projectName ?? "N/A"} ({activeInvoice?.project?.projectCode ?? ""})</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Client</div>
              <div className="font-medium">{activeInvoice?.client?.name ?? "N/A"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Invoice Date</div>
              <div className="font-medium">{safeFormatDate(activeInvoice?.invoiceDate ?? "")}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Status</div>
              <div className="mt-1">{getStatusBadge(activeInvoice?.status)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Amount</div>
              <div className="font-medium">{activeInvoice?.currency ?? ""} {Number(activeInvoice?.total ?? 0).toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Paid / Unpaid</div>
              <div className="font-medium">{Number(activeInvoice?.paidAmount ?? 0).toFixed(2)} / {Number(activeInvoice?.unpaidAmount ?? 0).toFixed(2)}</div>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Files</div>
            <div className="mt-2 space-y-2">
              {activeInvoice?.fileUrls && activeInvoice.fileUrls.length > 0 ? (
                activeInvoice.fileUrls.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 border rounded px-3 py-2">
                    <a href={f} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">File {idx + 1}</a>
                    <div>
                      <Button variant="ghost" size="sm" onClick={() => { /* delete file */ }}>Delete file</Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No files</div>
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            {(activeInvoice?.status ?? "").toString().toUpperCase() === "UNPAID" && (
              <>
                <Button variant="ghost" onClick={() => { setOpenEditModal(true); setEditForm({ invoiceDate: activeInvoice?.invoiceDate ?? "", currency: activeInvoice?.currency ?? "", amount: activeInvoice?.amount ?? activeInvoice?.total ?? 0, tax: activeInvoice?.tax ?? 0, discount: activeInvoice?.discount ?? 0, amountInWords: activeInvoice?.amountInWords ?? "", notes: activeInvoice?.notes ?? "" }); }}>
                  <Edit2 className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button onClick={() => { setActiveInvoice(activeInvoice); if (confirm("Mark this invoice as paid?")) handleMarkAsPaid(); }}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Mark as paid
                </Button>
              </>
            )}

            <Button variant="ghost" onClick={() => { setOpenUploadModal(true); }}>
              <Upload className="mr-2 h-4 w-4" /> Upload file
            </Button>

            <Button onClick={() => { setOpenViewPaymentsModal(true); fetchPaymentsForInvoice(activeInvoice?.invoiceNumber ?? ""); }}>
              <FileText className="mr-2 h-4 w-4" /> View Payment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal open={openEditModal} title={`Edit ${activeInvoice?.invoiceNumber ?? ""}`} onClose={() => setOpenEditModal(false)}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label>
              <div className="text-sm text-gray-600">Invoice Date</div>
              <input type="date" value={editForm.invoiceDate} onChange={(e) => setEditForm((p:any) => ({ ...p, invoiceDate: e.target.value }))} className="border rounded px-2 py-1 w-full" />
            </label>
            <label>
              <div className="text-sm text-gray-600">Currency</div>
              <input value={editForm.currency} onChange={(e) => setEditForm((p:any) => ({ ...p, currency: e.target.value }))} className="border rounded px-2 py-1 w-full" />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <input value={editForm.amount} onChange={(e) => setEditForm((p:any) => ({ ...p, amount: e.target.value }))} className="border rounded px-2 py-1" placeholder="Amount" />
            <input value={editForm.tax} onChange={(e) => setEditForm((p:any) => ({ ...p, tax: e.target.value }))} className="border rounded px-2 py-1" placeholder="Tax" />
            <input value={editForm.discount} onChange={(e) => setEditForm((p:any) => ({ ...p, discount: e.target.value }))} className="border rounded px-2 py-1" placeholder="Discount" />
          </div>

          <input value={editForm.amountInWords} onChange={(e) => setEditForm((p:any) => ({ ...p, amountInWords: e.target.value }))} className="border rounded px-2 py-1 w-full" placeholder="Amount in words" />
          <textarea value={editForm.notes} onChange={(e) => setEditForm((p:any) => ({ ...p, notes: e.target.value }))} className="border rounded px-2 py-1 w-full" placeholder="Notes" />

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpenEditModal(false)}>Cancel</Button>
            <Button onClick={handleEditInvoice} disabled={editing}>{editing ? "Saving..." : "Save"}</Button>
          </div>
        </div>
      </Modal>

      {/* Upload file modal */}
      <Modal open={openUploadModal} title={`Upload file for ${activeInvoice?.invoiceNumber ?? ""}`} onClose={() => { setOpenUploadModal(false); setFileToUpload(null); }}>
        <div className="space-y-3">
          <input type="file" onChange={(e) => setFileToUpload(e.target.files ? e.target.files[0] : null)} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => { setOpenUploadModal(false); setFileToUpload(null); }}>Cancel</Button>
            <Button onClick={handleUploadFile} disabled={uploading}>{uploading ? "Uploading..." : "Upload"}</Button>
          </div>
        </div>
      </Modal>

      {/* Add payment modal */}
      <Modal open={openAddPaymentModal} title={`Add payment for ${activeInvoice?.invoiceNumber ?? ""}`} onClose={() => { setOpenAddPaymentModal(false); setPaymentFile(null); }}>
        <div className="space-y-3">
          <input value={paymentForm.projectId} onChange={(e) => setPaymentForm((p:any) => ({ ...p, projectId: e.target.value }))} className="border rounded px-2 py-1 w-full" placeholder="projectId" />
          <input value={paymentForm.clientId} onChange={(e) => setPaymentForm((p:any) => ({ ...p, clientId: e.target.value }))} className="border rounded px-2 py-1 w-full" placeholder="clientId" />
          <input value={paymentForm.currency} onChange={(e) => setPaymentForm((p:any) => ({ ...p, currency: e.target.value }))} className="border rounded px-2 py-1 w-full" placeholder="currency" />
          <input value={paymentForm.amount} onChange={(e) => setPaymentForm((p:any) => ({ ...p, amount: e.target.value }))} className="border rounded px-2 py-1 w-full" placeholder="amount" />
          <input value={paymentForm.transactionId} onChange={(e) => setPaymentForm((p:any) => ({ ...p, transactionId: e.target.value }))} className="border rounded px-2 py-1 w-full" placeholder="transactionId" />
          <input value={paymentForm.invoiceId} onChange={(e) => setPaymentForm((p:any) => ({ ...p, invoiceId: e.target.value }))} className="border rounded px-2 py-1 w-full" placeholder="invoiceId" />
          <input type="file" onChange={(e) => setPaymentFile(e.target.files ? e.target.files[0] : null)} />
          <textarea value={paymentForm.notes} onChange={(e) => setPaymentForm((p:any) => ({ ...p, notes: e.target.value }))} className="border rounded px-2 py-1 w-full" placeholder="notes" />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => { setOpenAddPaymentModal(false); setPaymentFile(null); }}>Cancel</Button>
            <Button onClick={handleAddPayment} disabled={addingPayment}>{addingPayment ? "Saving..." : "Save"}</Button>
          </div>
        </div>
      </Modal>

      {/* View payments modal */}
      <Modal open={openViewPaymentsModal} title={`Payments for ${activeInvoice?.invoiceNumber ?? ""}`} onClose={() => { setOpenViewPaymentsModal(false); setPaymentsForActive([]); }}>
        <div className="space-y-3">
          {paymentsForActive.length === 0 ? (
            <div className="text-sm text-gray-500">No payments found</div>
          ) : (
            paymentsForActive.map((p: any) => (
              <div key={p.id} className="border rounded p-3">
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{p.currency} {Number(p.amount).toFixed(2)}</div>
                    <div className="text-sm text-gray-500">{p.paymentDate ? new Date(p.paymentDate).toLocaleString() : ""}</div>
                    <div className="text-sm">{p.note}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => { if (p.receiptFileUrl) window.open(p.receiptFileUrl, "_blank"); }}>🔍</Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Add receipt modal */}
      <Modal open={openAddReceiptModal} title={`Add Receipt for ${activeInvoice?.invoiceNumber ?? ""}`} onClose={() => setOpenAddReceiptModal(false)}>
        <div className="space-y-3">
          <input value={receiptForm.invoiceId} onChange={(e) => setReceiptForm((p:any) => ({ ...p, invoiceId: e.target.value }))} className="border rounded px-2 py-1 w-full" placeholder="invoiceId" />
          <input value={receiptForm.issueDate} onChange={(e) => setReceiptForm((p:any) => ({ ...p, issueDate: e.target.value }))} className="border rounded px-2 py-1 w-full" type="date" />
          <input value={receiptForm.currency} onChange={(e) => setReceiptForm((p:any) => ({ ...p, currency: e.target.value }))} className="border rounded px-2 py-1 w-full" placeholder="currency" />
          <input value={receiptForm.productName} onChange={(e) => setReceiptForm((p:any) => ({ ...p, productName: e.target.value }))} className="border rounded px-2 py-1 w-full" placeholder="productName" />
          <input value={receiptForm.priceWithOutTax} onChange={(e) => setReceiptForm((p:any) => ({ ...p, priceWithOutTax: Number(e.target.value) }))} className="border rounded px-2 py-1 w-full" placeholder="priceWithOutTax" />
          <textarea value={receiptForm.description} onChange={(e) => setReceiptForm((p:any) => ({ ...p, description: e.target.value }))} className="border rounded px-2 py-1 w-full" placeholder="description" />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpenAddReceiptModal(false)}>Cancel</Button>
            <Button onClick={async () => { setAddingReceipt(true); try { await fetch("/api/invoice", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}` }, body: JSON.stringify(receiptForm) }); setOpenAddReceiptModal(false); await fetchInvoices(); } catch(e){ console.error(e); alert("Add receipt failed"); } finally { setAddingReceipt(false); } }} disabled={addingReceipt}>{addingReceipt ? "Saving..." : "Save"}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={openViewReceiptsModal} title={`Receipts for ${activeInvoice?.invoiceNumber ?? ""}`} onClose={() => setOpenViewReceiptsModal(false)}>
        <div className="space-y-3">
          <div className="text-sm text-gray-500">Receipts are available via receipts API. Open receipts page to view full details.</div>
          <div className="flex justify-end">
            <Button onClick={() => { if (activeInvoice?.invoiceNumber) router.push(`/invoice/receipt/${activeInvoice.invoiceNumber}`); }}>Open Receipts Page</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
