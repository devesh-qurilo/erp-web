"use client";

import { useEffect, useMemo, useState } from "react";
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

type Company = {
  companyName?: string | null;
  companyLogoUrl?: string | null;
};

type Client = {
  clientId?: string | null;
  name?: string | null;
  profilePictureUrl?: string | null;
  companyName?: string | null;
  company?: Company | null;
};

type Project = {
  projectName?: string | null;
  projectCode?: string | null;
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
  paidAmount?: number | null;
  unpaidAmount?: number | null;
  adjustment?: number | null;
};

export default function InvoiceList() {
  const router = useRouter();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>("All");
  const [clientFilter, setClientFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

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

  // status badge mapping
  const getStatusBadge = (status?: string | null) => {
    const s = (status ?? "").toString().toLowerCase();
    if (s === "paid") return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
    if (s === "unpaid" || s === "un-paid" || s === "un_paid") return <Badge className="bg-red-100 text-red-800">Unpaid</Badge>;
    if (s.includes("credit")) return <Badge className="bg-yellow-100 text-yellow-800">Credit Note</Badge>;
    if (s === "pending") return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    if (!s) return <Badge variant="outline">Unknown</Badge>;
    return <Badge>{status}</Badge>;
  };

  const safeFormatDate = (d?: string | null) => {
    if (!d) return "N/A";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "N/A";
    return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  // Build unique dropdown lists, filtering out null/empty
  const projectList = useMemo(() => {
    const set = new Set<string>();
    invoices.forEach((i) => {
      const name = i.project?.projectName;
      if (name && name.toString().trim() !== "") set.add(name);
    });
    return ["All", ...Array.from(set)];
  }, [invoices]);

  const clientList = useMemo(() => {
    const set = new Set<string>();
    invoices.forEach((i) => {
      const name = i.client?.name;
      if (name && name.toString().trim() !== "") set.add(name);
    });
    return ["All", ...Array.from(set)];
  }, [invoices]);

  const statusList = useMemo(() => {
    const set = new Set<string>();
    invoices.forEach((i) => {
      const s = i.status;
      if (s && s.toString().trim() !== "") set.add(s);
    });
    return ["All", ...Array.from(set)];
  }, [invoices]);

  // Filtering logic (safe against null client/project)
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Search (invoiceNumber, projectName, projectCode, client name)
      if (search) {
        const s = search.toLowerCase();
        const match =
          (inv.invoiceNumber ?? "").toString().toLowerCase().includes(s) ||
          (inv.project?.projectName ?? "").toString().toLowerCase().includes(s) ||
          (inv.project?.projectCode ?? "").toString().toLowerCase().includes(s) ||
          (inv.client?.name ?? "").toString().toLowerCase().includes(s);
        if (!match) return false;
      }

      // Project filter
      if (projectFilter !== "All") {
        if ((inv.project?.projectName ?? "") !== projectFilter) return false;
      }

      // Client filter
      if (clientFilter !== "All") {
        if ((inv.client?.name ?? "") !== clientFilter) return false;
      }

      // Status filter
      if (statusFilter !== "All") {
        if ((inv.status ?? "") !== statusFilter) return false;
      }

      // Date range filter (both start & end must be set to filter)
      if (dateRange.start && dateRange.end) {
        if (!inv.invoiceDate) return false;
        const invDate = new Date(inv.invoiceDate);
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        // normalize end to end of day
        end.setHours(23, 59, 59, 999);
        if (Number.isNaN(invDate.getTime())) return false;
        if (invDate < start || invDate > end) return false;
      }

      return true;
    });
  }, [invoices, search, projectFilter, clientFilter, statusFilter, dateRange]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center text-gray-600">Loading invoices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">Manage and track all your invoices</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => router.push("/finance/invoices/create")} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" /> Create Invoice
          </Button>
        </div>
      </div>

      {/* TOP FILTERS BAR (matches screenshot layout) */}
      <div className="mb-4 border rounded-md bg-white px-3 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Duration */}
          <div className="flex items-center gap-2 border rounded p-2 bg-white">
            <span className="text-sm text-gray-600">Duration</span>
            <input
              type="date"
              className="text-xs border rounded px-2 py-1"
              value={dateRange.start}
              onChange={(e) => setDateRange((p) => ({ ...p, start: e.target.value }))}
            />
            <span className="text-sm text-gray-400">to</span>
            <input
              type="date"
              className="text-xs border rounded px-2 py-1"
              value={dateRange.end}
              onChange={(e) => setDateRange((p) => ({ ...p, end: e.target.value }))}
            />
          </div>

          {/* Client Select */}
          <Select value={clientFilter} onValueChange={(v) => setClientFilter(v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Client" />
            </SelectTrigger>
            <SelectContent>
              {clientList.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Project Select */}
          <Select value={projectFilter} onValueChange={(v) => setProjectFilter(v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              {projectList.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Select */}
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusList.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-2 text-gray-400" />
            <Input
              placeholder="Search invoice / project / client"
              className="pl-8 w-[260px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Filters icon button (visual only like screenshot) */}
        <Button variant="outline" className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </Button>
      </div>

      {/* TABLE */}
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
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((inv) => (
                <TableRow key={inv.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{inv.project?.projectCode ?? "N/A"}</TableCell>
                  <TableCell>
                    <p className="font-medium">{inv.invoiceNumber ?? "N/A"}</p>
                  </TableCell>
                  <TableCell>{inv.project?.projectName ?? "N/A"}</TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      {inv.client?.company?.companyLogoUrl ? (
                        <Image
                          src={inv.client.company.companyLogoUrl}
                          alt={inv.client.company.companyName ?? "Company"}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-gray-600">
                            {inv.client?.name ? inv.client.name.charAt(0).toUpperCase() : "?"}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{inv.client?.name ?? "N/A"}</p>
                        <p className="text-xs text-gray-500">{inv.client?.company?.companyName ?? inv.client?.companyName ?? ""}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-right font-semibold">
                    {inv.currency ? `${inv.currency} ${Number(inv.total ?? 0).toFixed(2)}` : `$ ${Number(inv.total ?? 0).toFixed(2)}`}
                  </TableCell>

                  <TableCell>{safeFormatDate(inv.invoiceDate)}</TableCell>

                  <TableCell>{getStatusBadge(inv.status)}</TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => router.push(`/finance/invoices/${inv.invoiceNumber ?? ""}`)}>
                          <Eye className="h-4 w-4 mr-2" /> View Invoice
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => router.push(`/finance/invoices/payments?invoiceNumber=${inv.invoiceNumber ?? ""}`)}>
                          <DollarSign className="h-4 w-4 mr-2" /> Record Payment
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => router.push(`/finance/invoices/credit-notes?invoiceNumber=${inv.invoiceNumber ?? ""}`)}>
                          <FileText className="h-4 w-4 mr-2" /> Credit Notes
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" /> Download PDF
                        </DropdownMenuItem>

                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" /> Send Invoice
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
    </div>
  );
}
