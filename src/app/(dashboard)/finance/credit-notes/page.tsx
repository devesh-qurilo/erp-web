"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, Download, Mail } from "lucide-react";
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

type Company = {
  companyName: string;
  website: string;
  officePhone: string;
  taxName: string;
  gstVatNo: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  shippingAddress: string;
  companyLogoUrl: string;
  country: string | null;
};

type Client = {
  clientId: string;
  name: string;
  profilePictureUrl: string;
  email: string;
  mobile: string;
  companyName: string;
  address: string;
  country: string;
  company: Company;
};

type Project = {
  projectName: string;
  projectCode: string;
  startDate: string;
  deadline: string;
  budget: number;
  currency: string;
};

type CreditNote = {
  id: number;
  creditNoteNumber: string;
  creditNoteDate: string;
  currency: string;
  adjustment: number;
  adjustmentPositive: boolean;
  tax: number;
  amount: number;
  notes: string;
  fileUrl: string;
  client: Client;
  project: Project;
  totalAmount: number;
  createdAt: string;
};

export default function CreditNotesList() {
  const router = useRouter();
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchCreditNotes() {
    try {
      const res = await fetch("/api/finance/credit-notes", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch credit notes: ${res.statusText}`);
      }

      const data = await res.json();
      setCreditNotes(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Something went wrong while fetching credit notes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCreditNotes();
  }, []);

  const getAdjustmentBadge = (positive: boolean) => {
    if (positive) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Credit</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Debit</Badge>;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDownload = (fileUrl: string) => {
    window.open(fileUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center text-gray-600">Loading credit notes...</p>
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Credit Notes</h1>
        <p className="text-gray-600 mt-1">Manage and track all your credit notes</p>
      </div>

      <div className="border rounded-lg bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Code</TableHead>
              <TableHead>Credit Note</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Client</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Adjustment</TableHead>
              <TableHead>Credit Note Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {creditNotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                  No credit notes found
                </TableCell>
              </TableRow>
            ) : (
              creditNotes.map((cn) => (
                <TableRow key={cn.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {cn.project?.projectCode || "N/A"}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{cn.creditNoteNumber || "N/A"}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{cn.project?.projectName || "N/A"}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {cn.client?.company?.companyLogoUrl ? (
                        <Image
                          src={cn.client.company.companyLogoUrl}
                          alt={cn.client.company.companyName || "Company"}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-gray-600">
                            {cn.client?.name?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{cn.client?.name || "N/A"}</p>
                        <p className="text-xs text-gray-500">
                          {cn.client?.company?.companyName || ""}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {cn.currency} {cn.totalAmount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {cn.currency} {cn.adjustmentPositive ? "+" : "-"}{cn.adjustment.toFixed(2)}
                  </TableCell>
                  <TableCell>{formatDate(cn.creditNoteDate)}</TableCell>
                  <TableCell>{getAdjustmentBadge(cn.adjustmentPositive)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="View Credit Note"
                        onClick={() => router.push(`/credit-notes/${cn.creditNoteNumber}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Download Credit Note"
                        onClick={() => handleDownload(cn.fileUrl)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Send Credit Note"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
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