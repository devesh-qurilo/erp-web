"use client";

import { useState } from "react";
import Modal from "./Modal";
import { Button } from "@/components/ui/button";

export default function InvoiceEditModal({
    open,
    onClose,
    invoice,
    refresh
}) {
    if (!invoice) return null;

    const [form, setForm] = useState({
        invoiceDate: invoice.invoiceDate || "",
        currency: invoice.currency || "USD",
        amount: invoice.amount || invoice.total || 0,
        tax: invoice.tax || 0,
        discount: invoice.discount || 0,
        amountInWords: invoice.amountInWords || "",
        notes: invoice.notes || "",
    });

    const save = async () => {
        try {
            await fetch(`/api/invoices/${invoice.invoiceNumber}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                body: JSON.stringify(form),
            });

            onClose();
            refresh();
        } catch (e) {
            alert("Update failed");
        }
    };

    return (
        <Modal open={open} onClose={onClose} title={`Edit ${invoice.invoiceNumber}`}>
            <div className="space-y-3">

                <div className="grid grid-cols-2 gap-3">
                    <label>
                        <div className="text-sm text-gray-600 mb-1">Invoice Date</div>
                        <input
                            type="date"
                            className="border rounded px-2 py-1 w-full"
                            value={form.invoiceDate}
                            onChange={(e) => setForm(f => ({ ...f, invoiceDate: e.target.value }))}
                        />
                    </label>

                    <label>
                        <div className="text-sm text-gray-600 mb-1">Currency</div>
                        <input
                            className="border rounded px-2 py-1 w-full"
                            value={form.currency}
                            onChange={(e) => setForm(f => ({ ...f, currency: e.target.value }))}
                        />
                    </label>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <input
                        className="border rounded px-2 py-1"
                        placeholder="Amount"
                        value={form.amount}
                        onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                    />

                    <input
                        className="border rounded px-2 py-1"
                        placeholder="Tax"
                        value={form.tax}
                        onChange={(e) => setForm(f => ({ ...f, tax: e.target.value }))}
                    />

                    <input
                        className="border rounded px-2 py-1"
                        placeholder="Discount"
                        value={form.discount}
                        onChange={(e) => setForm(f => ({ ...f, discount: e.target.value }))}
                    />
                </div>

                <input
                    className="border rounded px-2 py-1 w-full"
                    placeholder="Amount in words"
                    value={form.amountInWords}
                    onChange={(e) => setForm(f => ({ ...f, amountInWords: e.target.value }))}
                />

                <textarea
                    className="border rounded px-2 py-1 w-full"
                    placeholder="Notes"
                    value={form.notes}
                    onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                />

                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={save}>Save</Button>
                </div>
            </div>
        </Modal>
    );
}
