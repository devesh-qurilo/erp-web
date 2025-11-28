// src/app/finance/credit-notes/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, Download, Mail, MoreHorizontal } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_BASE = "https://6jnqmj85-80.inc1.devtunnels.ms";

type Company = {
  companyName?: string;
  website?: string;
  officePhone?: string;
  taxName?: string;
  gstVatNo?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  shippingAddress?: string;
  companyLogoUrl?: string | null;
  country?: string | null;
};

type Client = {
  clientId?: string;
  name?: string;
  profilePictureUrl?: string | null;
  email?: string;
  mobile?: string;
  companyName?: string | null;
  address?: string | null;
  country?: string;
  company?: Company | null;
};

type Project = {
  projectName?: string | null;
  projectCode?: string | null;
  startDate?: string | null;
  deadline?: string | null;
  budget?: number | null;
  currency?: string | null;
};

type CreditNote = {
  id: number;
  creditNoteNumber?: string;
  creditNoteDate?: string | null;
  currency?: string | null;
  adjustment?: number | null;
  adjustmentPositive?: boolean;
  tax?: number | null;
  amount?: number | null;
  notes?: string | null;
  fileUrl?: string | null;
  client?: Client | null;
  project?: Project | null;
  totalAmount?: number | null;
  createdAt?: string | null;
  invoiceNumber?: string | null; // optional: if your API provides invoice link
};

export default function CreditNotesPage() {
  const router = useRouter();
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // UI state for filters (non-functional placeholders but present in UI)
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [durationFilter, setDurationFilter] = useState<string>(""); // can be 'this_month', 'custom', etc.
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("accessToken") || "";
        const res = await fetch(`${API_BASE}/api/credit-notes/getAll`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch credit notes (${res.status})`);
        }

        const data = await res.json();
        if (!mounted) return;
        setCreditNotes(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("Credit notes fetch error:", err);
        setError(err?.message || "Failed to load credit notes");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const formatDate = (d?: string | null) => {
    if (!d) return "";
    try {
      return new Date(d).toLocaleDateString("en-GB"); // dd/mm/yyyy like screenshot
    } catch {
      return d;
    }
  };

  const getAdjustmentBadge = (positive?: boolean) => {
    if (positive) {
      return <Badge className="bg-green-100 text-green-800">Adjustment</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Adjustment</Badge>;
  };

  const handleView = (cn: CreditNote) => {
    // navigate to view page if exists (using creditNoteNumber)
    if (cn.creditNoteNumber) {
      router.push(`/credit-notes/${cn.creditNoteNumber}`);
    } else {
      // fallback: open file if available
      if (cn.fileUrl) window.open(cn.fileUrl, "_blank");
    }
  };

  const handleDownload = (fileUrl?: string | null) => {
    if (!fileUrl) return;
    window.open(fileUrl, "_blank");
  };

  const handleSend = (cn: CreditNote) => {
    // open email modal or use mailto — placeholder behaviour
    if (cn.fileUrl && cn.client?.email) {
      window.location.href = `mailto:${cn.client.email}?subject=Credit Note ${cn.creditNoteNumber}&body=Please find attached credit note.`;
    } else {
      alert("Client email or file not available to send.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-slate-900">Credit Note</h2>
        </div>

        {/* Filter bar similar to screenshot */}
        <div className="bg-white border rounded-md mb-4 p-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="text-sm text-slate-600 font-medium">Duration</div>
            <div className="text-sm text-slate-500">Start Date to End Date</div>
          </div>

          <div className="ml-4">
            <Select onValueChange={(v) => setClientFilter(v)} value={clientFilter}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue placeholder="Client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="clientA">Client A</SelectItem>
                <SelectItem value="clientB">Client B</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Button variant="ghost" size="sm">Filters</Button>
          </div>
        </div>

        <div className="bg-white border rounded-lg shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-slate-600">Loading credit notes...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">Error: {error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Credit Note</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Credit Note Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {creditNotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      No credit notes found
                    </TableCell>
                  </TableRow>
                ) : (
                  creditNotes.map((cn) => (
                    <TableRow key={cn.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="font-medium">{cn.creditNoteNumber || `#${cn.id}`}</div>
                      </TableCell>

                      <TableCell>
                        {/* If invoiceNumber exists show it, else keep placeholder */}
                        <div className="text-sm text-slate-600">{(cn as any).invoiceNumber || "INV#014"}</div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-3">
                          {cn.client?.company?.companyLogoUrl ? (
                            <Image
                              src={cn.client.company.companyLogoUrl}
                              alt={cn.client?.company?.companyName || "Logo"}
                              width={28}
                              height={28}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                              <span className="text-sm text-slate-600">
                                {cn.client?.name ? cn.client.name.charAt(0).toUpperCase() : "?"}
                              </span>
                            </div>
                          )}

                          <div>
                            <div className="font-medium text-sm">{cn.client?.name || "Unknown"}</div>
                            <div className="text-xs text-slate-500">{cn.project?.projectName || ""}</div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-right font-semibold">
                        {cn.currency ?? ""} {((cn.totalAmount ?? cn.amount ?? 0) as number).toFixed(2)}
                        <div className="text-xs mt-1 text-slate-500">{getAdjustmentBadge(!!cn.adjustmentPositive)}</div>
                      </TableCell>

                      <TableCell>{formatDate(cn.creditNoteDate)}</TableCell>

                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View"
                            onClick={() => handleView(cn)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            title="Download"
                            onClick={() => handleDownload(cn.fileUrl || "")}
                          >
                            <Download className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            title="Send"
                            onClick={() => handleSend(cn)}
                          >
                            <Mail className="w-4 h-4" />
                          </Button>

                          <button className="p-1 rounded hover:bg-slate-100" title="More">
                            <MoreHorizontal className="w-4 h-4 text-slate-600" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
