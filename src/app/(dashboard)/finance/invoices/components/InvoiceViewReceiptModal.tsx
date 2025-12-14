


"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import InvoiceReceiptModal from "./InvoiceReceiptModal"; // ✅ ADD RECEIPT FORM
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Plus } from "lucide-react";

const BASE_URL = "https://6jnqmj85-80.inc1.devtunnels.ms";

export default function InvoiceViewReceiptModal({
  open,
  onClose,
  invoice,
}: {
  open: boolean;
  onClose: () => void;
  invoice: any;
}) {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Add Receipt Modal state
  const [showAddReceipt, setShowAddReceipt] = useState(false);

  // 🔥 FINAL + GUARANTEED fetch logic
  async function loadReceipts() {
    const invoiceId =
      invoice?.invoiceId ||
      invoice?.invoiceNumber ||
      invoice?.invoiceNo;

    if (!invoiceId) {
      setReceipts([]);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${BASE_URL}/api/invoice/receipt/${invoiceId}`
      );
      const text = await res.text();
      if (!text) {
        setReceipts([]);
        return;
      }
      const data = JSON.parse(text);
      setReceipts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Failed to load receipts", err);
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  }

  // ✅ Reload when modal opens
  useEffect(() => {
    if (open) {
      loadReceipts();
    }
  }, [open, invoice]);

  if (!invoice) return null;

  return (
    <>
      {/* ================= VIEW RECEIPTS MODAL ================= */}
      <Modal
        open={open}
        onClose={onClose}
        title="Receipts"
        className="max-w-6xl"
      >
        {/* Add Receipt Button */}
        <div className="mb-4">
          <Button onClick={() => setShowAddReceipt(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add a Receipt
          </Button>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-blue-50">
              <TableRow>
                <TableHead>Invoice No.</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-sm text-gray-500"
                  >
                    Loading receipts...
                  </TableCell>
                </TableRow>
              )}

              {!loading && receipts.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-sm text-gray-500"
                  >
                    No receipts available
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                receipts.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.invoiceId}</TableCell>
                    <TableCell>{r.productName}</TableCell>
                    <TableCell>{r.buyerCleintName}</TableCell>
                    <TableCell>
                      {r.currency} {r.totalAmount}
                    </TableCell>
                    <TableCell>
                      {new Date(r.issueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </Modal>

      {/* ================= ADD RECEIPT MODAL ================= */}
      <InvoiceReceiptModal
        open={showAddReceipt}
        invoice={invoice}
        onClose={() => {
          setShowAddReceipt(false);
          loadReceipts(); // 🔥 auto refresh after add
        }}
      />
    </>
  );
}
