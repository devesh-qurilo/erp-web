"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, Download, Mail, FileText } from "lucide-react";
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

type Invoice = {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  currency: string;
  client: Client;
  project: Project;
  projectBudget: number;
  status: string;
  amount: number;
  tax: number;
  discount: number;
  total: number;
  amountInWords: string;
  notes: string;
  fileUrls: string[];
  paidAmount: number;
  unpaidAmount: number;
  adjustment: number;
  createdAt: string;
};

export default function InvoiceList() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchInvoices() {
    try {
      const res = await fetch("/api/finance/invoices", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch invoices: ${res.statusText}`);
      }

      const data = await res.json();
      const invoicesArray = Array.isArray(data) ? data : data?.invoices;
      setInvoices(Array.isArray(invoicesArray) ? invoicesArray : []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Something went wrong while fetching invoices.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInvoices();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === "paid") {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
    } else if (statusLower === "pending" || statusLower === "unpaid") {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    } else if (statusLower === "overdue") {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Overdue</Badge>;
    } else if (statusLower === "draft") {
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Draft</Badge>;
    }
    return <Badge variant="outline">{status || "Unknown"}</Badge>;
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <p className="text-gray-600 mt-1">Manage and track all your invoices</p>
      </div>

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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((inv) => (
                <TableRow key={inv.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {inv.project?.projectCode || "N/A"}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{inv.invoiceNumber || "N/A"}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{inv.project?.projectName || "N/A"}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {inv.client?.company?.companyLogoUrl ? (
                        <Image
                          src={inv.client.company.companyLogoUrl}
                          alt={inv.client.company.companyName || "Company"}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-gray-600">
                            {inv.client?.name?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{inv.client?.name || "N/A"}</p>
                        <p className="text-xs text-gray-500">
                          {inv.client?.company?.companyName || ""}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {inv.currency && inv.total != null
                      ? `${inv.currency} ${inv.total.toFixed(2)}`
                      : "N/A"}
                  </TableCell>
                  <TableCell>{formatDate(inv.invoiceDate)}</TableCell>
                  <TableCell>{getStatusBadge(inv.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="View Invoice"
                        onClick={() => router.push(`/invoices/${inv.invoiceNumber}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="View Credit Notes"
                        onClick={() => router.push(`/finance/invoices/credit-notes?invoiceNumber=${inv.invoiceNumber}`)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Download Invoice"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Send Invoice"
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