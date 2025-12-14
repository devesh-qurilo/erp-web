"use client";

import Modal from "./Modal";
import { Button } from "@/components/ui/button";

export default function InvoiceViewReceiptModal({ open, onClose, invoice }) {
    if (!invoice) return null;

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={`Receipts – ${invoice.invoiceNumber}`}
        >
            {(invoice.receipts?.length ?? 0) === 0 ? (
                <p className="text-sm text-gray-500">No receipts available</p>
            ) : (
                <div className="space-y-3">
                    {invoice.receipts.map((r, i) => (
                        <div key={i} className="border rounded p-3">
                            <div className="font-medium">
                                {r.currency} {r.amount}
                            </div>
                            <div className="text-sm text-gray-500">
                                {new Date(r.issueDate).toLocaleDateString()}
                            </div>

                            {r.fileUrl && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => window.open(r.fileUrl, "_blank")}
                                >
                                    View File
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </Modal>
    );
}
