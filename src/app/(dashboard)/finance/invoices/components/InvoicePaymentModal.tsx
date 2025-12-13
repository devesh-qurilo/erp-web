"use client";

import { useState } from "react";
import Modal from "./Modal";
import { Button } from "@/components/ui/button";

export default function InvoicePaymentModal({
    open,
    onClose,
    invoice
}) {
    const [form, setForm] = useState({
        amount: invoice?.unpaidAmount || invoice?.total || "",
        currency: invoice?.currency || "",
        transactionId: "",
        notes: "",
    });

    const [file, setFile] = useState(null);

    if (!invoice) return null;

    const savePayment = async () => {
        const fd = new FormData();
        fd.append("payment", JSON.stringify({
            ...form,
            invoiceId: invoice.invoiceNumber
        }));

        if (file) fd.append("file", file);

        await fetch("/api/payments", {
            method: "POST",
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
            body: fd,
        });

        onClose();
    };

    return (
        <Modal open={open} onClose={onClose} title={`Add Payment - ${invoice.invoiceNumber}`}>
            <div className="space-y-3">

                <input
                    className="border rounded w-full px-2 py-1"
                    placeholder="Amount"
                    value={form.amount}
                    onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                />

                <input
                    className="border rounded w-full px-2 py-1"
                    placeholder="Transaction ID"
                    value={form.transactionId}
                    onChange={(e) => setForm(f => ({ ...f, transactionId: e.target.value }))}
                />

                <input
                    className="border rounded w-full px-2 py-1"
                    placeholder="Currency"
                    value={form.currency}
                    onChange={(e) => setForm(f => ({ ...f, currency: e.target.value }))}
                />

                <textarea
                    className="border rounded w-full px-2 py-1"
                    placeholder="Notes"
                    value={form.notes}
                    onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                />

                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                />

                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={savePayment}>Save</Button>
                </div>

            </div>
        </Modal>
    );
}
