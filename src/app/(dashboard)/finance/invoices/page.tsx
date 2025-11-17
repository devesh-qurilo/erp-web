"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Eye,
  Download,
  Mail,
  FileText,
  MoreHorizontal,
  DollarSign,
  Search,
  SlidersHorizontal,
  Plus,
  Trash,
  Edit2,
  Upload,
  Copy,
  CheckCircle,
  Bell,
  FilePlus,
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
  Types (loose to accept nulls)
---------------------------*/
type Company = { companyName?: string | null; companyLogoUrl?: string | null };
type Client = {
  clientId?: string;
  name?: string | null;
  profilePictureUrl?: string | null;
  companyName?: string | null;
  company?: Company | null;
  email?: string | null;
  mobile?: string | null;
  address?: string | null;
  country?: string | null;
};
type Project = {
  projectName?: string | null;
  projectCode?: string | null;
  projectId?: string | null;
  startDate?: string | null;
  deadline?: string | null;
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
  amountInWords?: string | null;
  notes?: string | null;
  createdAt?: string | null;
};

/* --------------------------
  Helper small modal component
---------------------------*/
function Modal({ open, title, onClose, children }: { open: boolean; title?: string; onClose: () => void; children: React.ReactNode; }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 py-8">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-5xl bg-white rounded shadow-lg overflow-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-2xl font-semibold">{title}</h3>
          <Button variant="ghost" onClick={onClose}><span className="sr-only">Close</span>✕</Button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* --------------------------
  Small UI card used inside view modal for client/project
---------------------------*/
function InfoCard({ title, children }: { title: string; children: React.ReactNode; }) {
  return (
    <div className="rounded-lg border p-6 bg-white">
      <h4 className="text-lg font-medium mb-4">{title}</h4>
      <div>{children}</div>
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

  // filters
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>("All");
  const [clientFilter, setClientFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" });

  // modal state
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [openAddPaymentModal, setOpenAddPaymentModal] = useState(false);
  const [openViewPaymentsModal, setOpenViewPaymentsModal] = useState(false);
  const [openAddReceiptModal, setOpenAddReceiptModal] = useState(false);
  const [openViewReceiptsModal, setOpenViewReceiptsModal] = useState(false);

  // active invoice in context (for actions)
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);

  // form / loading states
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [addingPayment, setAddingPayment] = useState(false);
  const [addingReceipt, setAddingReceipt] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [deletingInvoice, setDeletingInvoice] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);

  // forms
  const [createForm, setCreateForm] = useState<any>({
    invoiceDate: "",
    currency: "",
    projectId: "",
    clientId: "",
    amount: "",
    tax: "",
    discount: "",
    amountInWords: "",
    notes: "",
  });

  const [editForm, setEditForm] = useState<any>({
    invoiceDate: "",
    currency: "",
    amount: "",
    tax: "",
    discount: "",
    amountInWords: "",
    notes: "",
  });

  const [paymentForm, setPaymentForm] = useState<any>({
    projectId: "",
    clientId: "",
    currency: "",
    amount: "",
    transactionId: "",
    invoiceId: "",
    paymentGatewayId: 1,
    notes: "",
  });

  const [receiptForm, setReceiptForm] = useState<any>({
    invoiceId: "",
    issueDate: "",
    currency: "",
    sellerCompanyName: "",
    productName: "",
    priceWithOutTax: 0,
    quantity: 1,
    description: "",
  });

  // fetch invoices
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

  // derived lists
  const projectList = useMemo(() => {
    const s = new Set<string>();
    invoices.forEach((i) => {
      const v = i.project?.projectName;
      if (v) s.add(v);
    });
    return ["All", ...Array.from(s)];
  }, [invoices]);

  const clientList = useMemo(() => {
    const s = new Set<string>();
    invoices.forEach((i) => {
      const v = i.client?.name;
      if (v) s.add(v);
    });
    return ["All", ...Array.from(s)];
  }, [invoices]);

  const statusList = useMemo(() => {
    const s = new Set<string>();
    invoices.forEach((i) => {
      const v = i.status;
      if (v) s.add(v);
    });
    return ["All", ...Array.from(s)];
  }, [invoices]);

  const safeFormatDate = (d?: string | null) => {
    if (!d) return "N/A";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "N/A";
    return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const getStatusBadge = (status?: string | null) => {
    const s = (status ?? "").toString().toLowerCase();
    if (s === "paid") return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
    if (s === "unpaid") return <Badge className="bg-red-100 text-red-800">Unpaid</Badge>;
    if (s.includes("credit")) return <Badge className="bg-yellow-100 text-yellow-800">Credit Note</Badge>;
    if (!s) return <Badge variant="outline">Unknown</Badge>;
    return <Badge>{status}</Badge>;
  };

  // filtering
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // search
      if (search) {
        const s = search.toLowerCase();
        const match =
          (inv.invoiceNumber ?? "").toString().toLowerCase().includes(s) ||
          (inv.project?.projectName ?? "").toString().toLowerCase().includes(s) ||
          (inv.project?.projectCode ?? "").toString().toLowerCase().includes(s) ||
          (inv.client?.name ?? "").toString().toLowerCase().includes(s);
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
        if (Number.isNaN(invDate.getTime())) return false;
        if (invDate < start || invDate > end) return false;
      }

      return true;
    });
  }, [invoices, search, projectFilter, clientFilter, statusFilter, dateRange]);

  /* --------------------------
    Action helpers (APIs)
  ---------------------------*/

  // Create invoice (POST /api/invoices)
  const handleCreateInvoice = async () => {
    setCreating(true);
    try {
      const body = {
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
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`Create failed: ${res.status} ${t}`);
      }
      await res.json();
      setOpenCreateModal(false);
      setCreateForm({
        invoiceDate: "",
        currency: "",
        projectId: "",
        clientId: "",
        amount: "",
        tax: "",
        discount: "",
        amountInWords: "",
        notes: "",
      });
      await fetchInvoices();
    } catch (err: any) {
      console.error(err);
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

  // Upload file (POST /api/invoices/{invoiceNumber}/files) FormData field 'file'
  const handleUploadFile = async () => {
    if (!activeInvoice?.invoiceNumber) return;
    if (!fileToUpload) {
      alert("Please choose a file");
      return;
    }
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

  // Delete file -> DELETE /api/invoices/{invoiceNumber}/files?fileUrl=...
  const handleDeleteFile = async (fileUrl: string) => {
    if (!activeInvoice?.invoiceNumber) return;
    if (!confirm("Delete this file?")) return;
    try {
      const res = await fetch(`/api/invoices/${activeInvoice.invoiceNumber}/files?fileUrl=${encodeURIComponent(fileUrl)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}` },
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`Delete file failed: ${res.status} ${t}`);
      }
      await res.json();
      await fetchInvoices();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Delete file failed");
    }
  };

  // Add receipt -> POST /api/invoice (body is receiptForm)
  const handleAddReceipt = async () => {
    setAddingReceipt(true);
    try {
      const res = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}` },
        body: JSON.stringify(receiptForm),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`Add receipt failed: ${res.status} ${t}`);
      }
      await res.json();
      setOpenAddReceiptModal(false);
      await fetchInvoices();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Add receipt failed");
    } finally {
      setAddingReceipt(false);
    }
  };

  // Add payment -> /api/payments (FormData: 'payment' JSON and 'file')
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

  // View payments -> fetch /api/payments/invoice/{invoiceNumber}
  const [paymentsForActive, setPaymentsForActive] = useState<any[]>([]);
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
      alert(err?.message || "Failed to load payments");
    }
  };

  // Mark as paid -> POST /api/invoices/{invoiceId}/mark-paid
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

  // Send payment reminder -> POST /api/invoices/{invoiceNumber}/actions/send-reminder-email
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

  // Delete invoice -> DELETE /api/invoices/{invoiceNumber}
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

  // Duplicate -> prefill create form from invoice
  const handleCreateDuplicate = (inv: Invoice) => {
    setCreateForm({
      invoiceDate: inv.invoiceDate ?? "",
      currency: inv.currency ?? "",
      projectId: inv.project?.projectId ?? "",
      clientId: inv.client?.clientId ?? "",
      amount: inv.amount ?? inv.total ?? 0,
      tax: inv.tax ?? 0,
      discount: inv.discount ?? 0,
      amountInWords: inv.amount ? inv.amount.toString() : "",
      notes: inv?.notes ?? "",
    });
    setOpenCreateModal(true);
  };

  // open action modal items depending on status
  const openActionsFor = (inv: Invoice) => {
    setActiveInvoice(inv);
    setOpenViewModal(true);
  };

  /* --------------------------
    UI
  ---------------------------*/
  if (loading) return <div className="container mx-auto p-6"><p className="text-center text-gray-600">Loading invoices...</p></div>;
  if (error) return <div className="container mx-auto p-6"><p className="text-center text-red-500">Error: {error}</p></div>;

  return (
    <div className="container mx-auto p-6">
      {/* header - Create button moved to top-left (matches your screenshot) */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => {
              setCreateForm({
                invoiceDate: "",
                currency: "",
                projectId: "",
                clientId: "",
                amount: "",
                tax: "",
                discount: "",
                amountInWords: "",
                notes: "",
              });
              setOpenCreateModal(true);
            }}
            className="flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Invoice
          </Button>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-600 mt-1">Manage and track all your invoices</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* right side reserved for other actions if needed */}
        </div>
      </div>

      {/* filters bar */}
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
            <SelectContent>{clientList.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>

          <Select value={projectFilter} onValueChange={(v) => setProjectFilter(v)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Project" /></SelectTrigger>
            <SelectContent>{projectList.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>{statusList.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-2 text-gray-400" />
            <Input placeholder="Search invoice / project / client" className="pl-8 w-[260px]" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <Button variant="outline" className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> Filters</Button>
      </div>

      {/* table */}
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
                      {/* Action menu - entries depend on status */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          {/* common: View */}
                          <DropdownMenuItem onClick={() => { setActiveInvoice(inv); setOpenViewModal(true); }}>
                            <Eye className="mr-2 h-4 w-4" /> View
                          </DropdownMenuItem>

                          {/* UNPAID: edit, mark as paid, add payment, view payment, payment reminder */}
                          {statusKey === "UNPAID" && (
                            <>
                              <DropdownMenuItem onClick={() => { setActiveInvoice(inv); setEditForm({ invoiceDate: inv.invoiceDate ?? "", currency: inv.currency ?? "", amount: inv.amount ?? inv.total ?? 0, tax: inv.tax ?? 0, discount: inv.discount ?? 0, amountInWords: inv.amountInWords ?? "", notes: inv.notes ?? "" }); setOpenEditModal(true); }}>
                                <Edit2 className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => { setActiveInvoice(inv); if (confirm("Mark this invoice as paid?")) { handleMarkAsPaid(); } }}>
                                <CheckCircle className="mr-2 h-4 w-4" /> Mark as paid
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => { setActiveInvoice(inv); setPaymentForm({ ...paymentForm, projectId: inv.project?.projectId ?? "", clientId: inv.client?.clientId ?? "", currency: inv.currency ?? "", amount: inv.unpaidAmount ?? inv.total ?? 0, invoiceId: inv.invoiceNumber ?? "" }); setOpenAddPaymentModal(true); }}>
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

                          {/* PAID: add receipt, view receipt, upload file, view payment, add credit note, view credit note */}
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

                              <DropdownMenuItem onClick={() => { alert("Add credit note: feature to implement in future"); }}>
                                <FileText className="mr-2 h-4 w-4" /> Add credit note
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => { alert("View credit notes: feature to implement in future"); }}>
                                <FileText className="mr-2 h-4 w-4" /> View credit note
                              </DropdownMenuItem>
                            </>
                          )}

                          {/* CREDIT_NOTES */}
                          {statusKey.includes("CREDIT") && (
                            <>
                              <DropdownMenuItem onClick={() => { setActiveInvoice(inv); setPaymentForm({ ...paymentForm, projectId: inv.project?.projectId ?? "", clientId: inv.client?.clientId ?? "", currency: inv.currency ?? "", amount: inv.unpaidAmount ?? inv.total ?? 0, invoiceId: inv.invoiceNumber ?? "" }); setOpenAddPaymentModal(true); }}>
                                <DollarSign className="mr-2 h-4 w-4" /> Add payment
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => { setActiveInvoice(inv); fetchPaymentsForInvoice(inv.invoiceNumber ?? ""); setOpenViewPaymentsModal(true); }}>
                                <FileText className="mr-2 h-4 w-4" /> View payment
                              </DropdownMenuItem>
                            </>
                          )}

                          <DropdownMenuSeparator />

                          {/* Create duplicate */}
                          <DropdownMenuItem onClick={() => handleCreateDuplicate(inv)}>
                            <Copy className="mr-2 h-4 w-4" /> Create duplicate
                          </DropdownMenuItem>

                          {/* Delete */}
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
         Create Invoice Modal
         ------------------------ */}
      <Modal open={openCreateModal} title="+ Create Invoice" onClose={() => setOpenCreateModal(false)}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <div className="text-sm text-gray-600">Invoice Date</div>
              <input type="date" value={createForm.invoiceDate} onChange={(e) => setCreateForm((p:any) => ({ ...p, invoiceDate: e.target.value }))} className="border rounded px-2 py-1 w-full" />
            </label>
            <label className="block">
              <div className="text-sm text-gray-600">Currency</div>
              <input value={createForm.currency} onChange={(e) => setCreateForm((p:any) => ({ ...p, currency: e.target.value }))} className="border rounded px-2 py-1 w-full" />
            </label>
            <label>
              <div className="text-sm text-gray-600">Project (ID)</div>
              <input value={createForm.projectId} onChange={(e) => setCreateForm((p:any) => ({ ...p, projectId: e.target.value }))} className="border rounded px-2 py-1 w-full" placeholder="projectId (e.g. 15)" />
            </label>
            <label>
              <div className="text-sm text-gray-600">Client (ID)</div>
              <input value={createForm.clientId} onChange={(e) => setCreateForm((p:any) => ({ ...p, clientId: e.target.value }))} className="border rounded px-2 py-1 w-full" placeholder="clientId (e.g. CLI006)" />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <input value={createForm.amount} onChange={(e) => setCreateForm((p:any) => ({ ...p, amount: e.target.value }))} className="border rounded px-2 py-1" placeholder="Amount" />
            <input value={createForm.tax} onChange={(e) => setCreateForm((p:any) => ({ ...p, tax: e.target.value }))} className="border rounded px-2 py-1" placeholder="Tax" />
            <input value={createForm.discount} onChange={(e) => setCreateForm((p:any) => ({ ...p, discount: e.target.value }))} className="border rounded px-2 py-1" placeholder="Discount" />
          </div>

          <input value={createForm.amountInWords} onChange={(e) => setCreateForm((p:any) => ({ ...p, amountInWords: e.target.value }))} className="border rounded px-2 py-1 w-full" placeholder="Amount in words" />
          <textarea value={createForm.notes} onChange={(e) => setCreateForm((p:any) => ({ ...p, notes: e.target.value }))} className="border rounded px-2 py-1 w-full" placeholder="Notes" />

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpenCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreateInvoice} disabled={creating}>{creating ? "Creating..." : "Save"}</Button>
          </div>
        </div>
      </Modal>

      {/* -------------------------
         View Invoice Modal (FULL DETAILS UI)
         ------------------------ */}
      <Modal open={openViewModal} title={`Invoice ${activeInvoice?.invoiceNumber ?? ""}`} onClose={() => { setOpenViewModal(false); setActiveInvoice(null); }}>
        <div className="space-y-6">
          {/* Top row: Client card and Project card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InfoCard title="Client Details">
              <div className="grid grid-cols-2 gap-y-3">
                <div className="text-sm text-gray-500">Name</div>
                <div className="font-medium">{activeInvoice?.client?.name ?? "-"}</div>

                <div className="text-sm text-gray-500">Email</div>
                <div className="font-medium">{activeInvoice?.client?.email ?? "-"}</div>

                <div className="text-sm text-gray-500">Company Name</div>
                <div className="font-medium">{activeInvoice?.client?.company?.companyName ?? activeInvoice?.client?.companyName ?? "-"}</div>

                <div className="text-sm text-gray-500">Mobile</div>
                <div className="font-medium">{activeInvoice?.client?.mobile ?? "-"}</div>

                <div className="text-sm text-gray-500">Address</div>
                <div className="font-medium">{activeInvoice?.client?.address ?? "--"}</div>

                <div className="text-sm text-gray-500">Country</div>
                <div className="font-medium">{activeInvoice?.client?.country ?? "-"}</div>
              </div>
            </InfoCard>

            <InfoCard title="Project Details">
              <div className="grid grid-cols-2 gap-y-3">
                <div className="text-sm text-gray-500">Project Name</div>
                <div className="font-medium">{activeInvoice?.project?.projectName ?? "-"}</div>

                <div className="text-sm text-gray-500">Project Code</div>
                <div className="font-medium">{activeInvoice?.project?.projectCode ?? "-"}</div>

                <div className="text-sm text-gray-500">Start Date</div>
                <div className="font-medium">{safeFormatDate(activeInvoice?.project?.startDate ?? activeInvoice?.createdAt)}</div>

                <div className="text-sm text-gray-500">Deadline</div>
                <div className="font-medium">{safeFormatDate(activeInvoice?.project?.deadline)}</div>

                <div className="text-sm text-gray-500">Budget</div>
                <div className="font-medium">{activeInvoice?.project?.currency ?? ""} {Number(activeInvoice?.project?.budget ?? 0).toLocaleString()}</div>
              </div>
            </InfoCard>
          </div>

          {/* Invoice details full (big card) */}
          <InfoCard title="Invoice Details">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* labels column */}
              <div className="space-y-4">
                <div className="text-sm text-gray-500">Invoice No.</div>
                <div className="text-sm text-gray-500">Invoice Date</div>
                <div className="text-sm text-gray-500">Currency</div>
                <div className="text-sm text-gray-500">Amount</div>
                <div className="text-sm text-gray-500">Tax</div>
                <div className="text-sm text-gray-500">Subtotal</div>
                <div className="text-sm text-gray-500">Discount</div>
                <div className="text-sm text-gray-500">Total Amount</div>
                <div className="text-sm text-gray-500">Status</div>
                <div className="text-sm text-gray-500">Files</div>
              </div>

              {/* values column */}
              <div className="md:col-span-2 space-y-4">
                <div className="font-medium">{activeInvoice?.invoiceNumber ?? "-"}</div>
                <div className="font-medium">{safeFormatDate(activeInvoice?.invoiceDate)}</div>
                <div className="font-medium">{activeInvoice?.currency ?? "-"}</div>
                <div className="font-medium">{activeInvoice?.currency ?? ""} {Number(activeInvoice?.amount ?? activeInvoice?.total ?? 0).toLocaleString()}</div>
                <div className="font-medium">{activeInvoice?.tax != null ? `${activeInvoice.tax}%` : "-"}</div>
                <div className="font-medium">{activeInvoice?.currency ?? ""} {Number((activeInvoice?.amount ?? 0) + ((activeInvoice?.amount ?? 0) * ((activeInvoice?.tax ?? 0) / 100))).toLocaleString()}</div>
                <div className="font-medium">{activeInvoice?.currency ?? ""} {Number(activeInvoice?.discount ?? 0).toFixed(2)}</div>
                <div className="font-bold">{activeInvoice?.currency ?? ""} {Number(activeInvoice?.total ?? 0).toLocaleString()}</div>
                <div className="flex items-center gap-2">{getStatusBadge(activeInvoice?.status)} <span className="text-sm text-gray-600">{(activeInvoice?.status ?? "").toString().replace("_", " ")}</span></div>

                <div>
                  {/* files - show thumbnails if images, else show file link */}
                  <div className="flex gap-4 flex-wrap">
                    {(activeInvoice?.fileUrls ?? []).length === 0 && <div className="text-sm text-gray-500">No files attached</div>}
                    {(activeInvoice?.fileUrls ?? []).map((f, idx) => {
                      const isImage = /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(f ?? "");
                      return (
                        <div key={idx} className="w-40">
                          <div className="relative rounded overflow-hidden border">
                            {isImage ? (
                              // Next/Image requires remote domains configured; use normal img if not configured
                              <img src={f ?? ""} alt={`file-${idx}`} className="w-full h-24 object-cover" />
                            ) : (
                              <div className="w-full h-24 flex items-center justify-center bg-gray-50 text-sm text-gray-600">FILE</div>
                            )}
                            <div className="absolute top-2 right-2">
                              <Button variant="ghost" size="sm" onClick={() => window.open(f, "_blank")}>
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* notes */}
            <div className="mt-6">
              <div className="text-sm text-gray-500">Notes</div>
              <div className="mt-2 text-sm">{activeInvoice?.notes ?? "No notes"}</div>
            </div>

            {/* quick actions in view modal */}
            <div className="mt-6 flex gap-2 justify-end">
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
          </InfoCard>
        </div>
      </Modal>

      {/* -------------------------
         Edit Invoice Modal
         ------------------------ */}
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

      {/* -------------------------
         Upload File Modal
         ------------------------ */}
      <Modal open={openUploadModal} title={`Upload file for ${activeInvoice?.invoiceNumber ?? ""}`} onClose={() => { setOpenUploadModal(false); setFileToUpload(null); }}>
        <div className="space-y-3">
          <input type="file" onChange={(e) => setFileToUpload(e.target.files ? e.target.files[0] : null)} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => { setOpenUploadModal(false); setFileToUpload(null); }}>Cancel</Button>
            <Button onClick={handleUploadFile} disabled={uploading}>{uploading ? "Uploading..." : "Upload"}</Button>
          </div>
        </div>
      </Modal>

      {/* -------------------------
         Add Payment Modal
         ------------------------ */}
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

      {/* -------------------------
         View Payments Modal
         ------------------------ */}
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
                    {/* Implement payment delete/download if needed */}
                    <Button variant="ghost" size="icon" onClick={() => { if (p.receiptFileUrl) window.open(p.receiptFileUrl, "_blank"); }}>🔍</Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* -------------------------
         Add Receipt Modal
         ------------------------ */}
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
            <Button onClick={handleAddReceipt} disabled={addingReceipt}>{addingReceipt ? "Saving..." : "Save"}</Button>
          </div>
        </div>
      </Modal>

      {/* -------------------------
         View Receipts Modal (simple) - will open receipt API in modal or new page
         ------------------------ */}
      <Modal open={openViewReceiptsModal} title={`Receipts for ${activeInvoice?.invoiceNumber ?? ""}`} onClose={() => setOpenViewReceiptsModal(false)}>
        <div className="space-y-3">
          <div className="text-sm text-gray-500">Receipts are available in receipts API. You can open the receipt in a new tab.</div>
          <div className="flex justify-end">
            <Button onClick={() => { if (activeInvoice?.invoiceNumber) router.push(`/invoice/receipt/${activeInvoice.invoiceNumber}`); }}>Open Receipts Page</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
