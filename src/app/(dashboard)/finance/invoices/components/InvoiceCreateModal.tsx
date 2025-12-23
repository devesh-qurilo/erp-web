"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import Modal from "./Modal";
import Card from "./Card";


const BASE_URL = "https://6jnqmj85-80.inc1.devtunnels.ms";


export default function InvoiceCreateModal({
    open,
    onClose,
    invoices = [],
    refresh
}) {
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        invoiceNumber: "",
        invoiceDate: "",
        currency: "USD",
        projectName: "",
        projectId: "",
        clientId: "",
        amount: 0,
        tax: 10,
        discount: 0,
        amountInWords: "",
        notes: "",
    });

    // 🔹 Project List
    const projectList = useMemo(() => {
        const set = new Set();
        invoices.forEach(inv => inv.project?.projectName && set.add(inv.project.projectName));
        return ["Select Project", ...Array.from(set)];
    }, [invoices]);

    // 🔹 Client List
    const clientList = useMemo(() => {
        const set = new Set();
        invoices.forEach(inv => inv.client?.name && set.add(inv.client.name));
        return ["Select Client", ...Array.from(set)];
    }, [invoices]);

    // 🔹 Helpers
    const getProjectBudget = (projectName) => {
        const f = invoices.find(i => i.project?.projectName === projectName);
        return f?.project?.budget || 0;
    };

    const subtotal = Number(form.amount || 0);

    const discountAmount =
        form.discount > 1 ? form.discount : (subtotal * Number(form.discount || 0)) / 100;

    const taxAmount = ((subtotal - discountAmount) * Number(form.tax || 0)) / 100;

    const totalAmount = subtotal - discountAmount + taxAmount;

    // 🔹 API Call
    const saveInvoice = async () => {
        setSaving(true);
        try {
            const payload = {
                ...form,
                amount: Number(form.amount || 0),
                tax: Number(form.tax || 0),
                discount: Number(form.discount || 0),
            };

            const res = await fetch(`${BASE_URL}/api/invoices`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Create failed");

            onClose();
            refresh();
        } catch (e) {
            alert(e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal open={open} title="Create Invoice" onClose={onClose}>
            <div className="space-y-6">

                {/* ============================
           Invoice Details
        ============================ */}
                <Card>
                    <h4 className="text-sm font-medium mb-4">Invoice Details</h4>

                    <div className="grid grid-cols-12 gap-3">

                        <div className="col-span-4">
                            <label className="text-sm text-gray-600 block mb-1">Invoice Number *</label>
                            <div className="relative">
                                <div className="absolute left-0 inset-y-0 pl-3 flex items-center text-gray-400">
                                    INV#
                                </div>
                                <input
                                    className="pl-14 border rounded w-full h-10"
                                    placeholder="INV0001"
                                    value={form.invoiceNumber}
                                    onChange={(e) => setForm(f => ({ ...f, invoiceNumber: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="col-span-4">
                            <label className="text-sm text-gray-600 block mb-1">Invoice Date *</label>
                            <input
                                type="date"
                                className="border rounded w-full h-10 px-2"
                                value={form.invoiceDate}
                                onChange={(e) => setForm(f => ({ ...f, invoiceDate: e.target.value }))}
                            />
                        </div>

                        <div className="col-span-4">
                            <label className="text-sm text-gray-600 block mb-1">Currency *</label>
                            <select
                                className="border rounded w-full h-10 px-2"
                                value={form.currency}
                                onChange={(e) => setForm(f => ({ ...f, currency: e.target.value }))}
                            >
                                {/* <option>USD</option>
                                <option>USD</option>
                                <option>EUR</option> */}

                            <option value="USD">USD - US Dollar</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="GBP">GBP - British Pound</option>
                                <option value="AUD">AUD - Australian Dollar</option>
                                <option value="CAD">CAD - Canadian Dollar</option>
                                <option value="JPY">JPY - Japanese Yen</option>
                                <option value="CHF">CHF - Swiss Franc</option>
                                <option value="SGD">SGD - Singapore Dollar</option>
                                <option value="NZD">NZD - New Zealand Dollar</option>


                            </select>
                        </div>

                    </div>
                </Card>

                {/* ============================
          Project Details
        ============================ */}
                <Card>
                    <h4 className="text-sm font-medium mb-4">Project Details</h4>

                    <div className="grid grid-cols-12 gap-3">

                        {/* Project */}
                        <div className="col-span-4">
                            <label className="text-sm text-gray-600 block mb-1">Project *</label>
                            <select
                                className="border rounded w-full h-10 px-2"
                                value={form.projectName}
                                onChange={(e) => {
                                    const name = e.target.value;
                                    const found = invoices.find(i => i.project?.projectName === name);

                                    setForm(f => ({
                                        ...f,
                                        projectName: name,
                                        projectId: found?.project?.projectId || "",
                                    }));
                                }}
                            >
                                {projectList.map(p => <option key={p}>{p}</option>)}
                            </select>
                        </div>

                        {/* Client */}
                        <div className="col-span-4">
                            <label className="text-sm text-gray-600 block mb-1">Client *</label>
                            <select
                                className="border rounded w-full h-10 px-2"
                                value={form.clientId}
                                onChange={(e) => setForm(f => ({ ...f, clientId: e.target.value }))}
                            >
                                {clientList.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {/* Project Budget */}
                        <div className="col-span-4">
                            <label className="text-sm text-gray-600 block mb-1">Project Budget *</label>

                            <div className="flex">
                                <div className="px-3 py-2 bg-gray-100 border rounded-l">
                                    {form.currency === "USD" ? "₹" : "$"}
                                </div>
                                <input
                                    readOnly
                                    className="border rounded-r w-full h-10 px-3"
                                    value={getProjectBudget(form.projectName).toLocaleString()}
                                />
                            </div>
                        </div>

                    </div>

                    {/* Amount, Tax, Summary */}
                    <div className="mt-4 border rounded flex overflow-hidden">

                        {/* Amount */}
                        <div className="flex-1 p-3">
                            <label className="text-sm text-gray-600 block mb-1">Amount</label>
                            <div className="flex gap-3 items-center">
                                <div className="px-3 py-2 bg-gray-50 border rounded">$</div>
                                <input
                                    type="number"
                                    className="border rounded h-10 w-40 px-2"
                                    value={form.amount}
                                    onChange={(e) => setForm(f => ({ ...f, amount: Number(e.target.value) }))}
                                />
                            </div>
                        </div>

                        {/* Tax */}
                        <div className="w-56 p-3 border-l">
                            <label className="text-sm text-gray-600 block mb-1">Tax (%)</label>
                            <input
                                type="number"
                                className="border rounded h-10 w-full px-2"
                                value={form.tax}
                                onChange={(e) => setForm(f => ({ ...f, tax: Number(e.target.value) }))}
                            />
                        </div>

                        {/* Total Box */}
                        <div className="w-40 bg-gray-100 p-3 flex flex-col items-center justify-center">
                            <div className="text-sm text-gray-500">Total</div>
                            <div className="font-bold text-lg">{totalAmount.toFixed(2)}</div>
                        </div>

                    </div>

                    {/* Subtotal Table */}
                    <div className="mt-4 flex justify-end">
                        <div className="w-80 border rounded">

                            <div className="grid grid-cols-3 p-2 border-b">
                                <div></div>
                                <div className="text-sm text-gray-500 text-right">Subtotal</div>
                                <div className="text-right font-medium">{subtotal.toFixed(2)}</div>
                            </div>

                            <div className="grid grid-cols-3 p-2 border-b items-center">
                                <div className="text-sm text-gray-500">Discount</div>
                                <div>
                                    <input
                                        type="number"
                                        className="border rounded px-2 w-full h-8"
                                        value={form.discount}
                                        onChange={(e) => setForm(f => ({ ...f, discount: Number(e.target.value) }))}
                                    />
                                </div>
                                <div className="text-right">{discountAmount.toFixed(2)}</div>
                            </div>

                            <div className="grid grid-cols-3 p-2 border-b items-center">
                                <div className="text-sm text-gray-500">Tax</div>
                                <div className="text-sm text-gray-500">{form.tax}%</div>
                                <div className="text-right">{taxAmount.toFixed(2)}</div>
                            </div>

                            <div className="grid grid-cols-3 p-2 bg-gray-100">
                                <div />
                                <div className="text-right font-medium">Total</div>
                                <div className="text-right font-bold">{totalAmount.toFixed(2)}</div>
                            </div>

                        </div>
                    </div>

                </Card>

                {/* ============================
          Amount in words + Notes
        ============================ */}
                <Card>
                    <div className="grid grid-cols-12 gap-4">

                        <div className="col-span-6">
                            <label className="text-sm text-gray-600 block mb-1">Amount in words</label>
                            <input
                                className="border rounded w-full h-10 px-3"
                                value={form.amountInWords}
                                onChange={(e) => setForm(f => ({ ...f, amountInWords: e.target.value }))}
                            />
                        </div>

                        <div className="col-span-6">
                            <label className="text-sm text-gray-600 block mb-1">Notes</label>
                            <textarea
                                className="border rounded w-full h-28 p-3"
                                value={form.notes}
                                onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                            />
                        </div>

                    </div>
                </Card>

                {/* ============================
          Action Buttons
        ============================ */}
                <div className="flex justify-center gap-4 mt-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={saveInvoice} disabled={saving}>
                        {saving ? "Saving..." : "Save"}
                    </Button>
                </div>

            </div>
        </Modal>
    );
}





