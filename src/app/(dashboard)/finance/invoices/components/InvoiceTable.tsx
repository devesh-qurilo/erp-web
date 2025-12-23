"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { MoreHorizontal, Eye, Edit2, Upload, Trash, CheckCircle, DollarSign, FileText, Bell, Copy } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";





const BASE_URL = process.env.NEXT_PUBLIC_MAIN ;
export default function InvoiceTable({
    invoices,
    loading,
    filters,
    setActiveInvoice,
    setModal
}) {

    const safeDate = (d) => {
        if (!d) return "--";
        return new Date(d).toLocaleDateString("en-GB");
    };



    const statusBadge = (s) => {
        s = s?.toLowerCase();
        if (s === "paid") return <Badge className="bg-green-100 text-green-700">Paid</Badge>;
        if (s === "unpaid") return <Badge className="bg-red-100 text-red-700">Unpaid</Badge>;
        if (s?.includes("credit")) return <Badge className="bg-yellow-100 text-yellow-700">Credit</Badge>;
        return <Badge>{s}</Badge>;
    };

    // Filtering logic
    const filtered = invoices.filter(inv => {
        if (filters.search) {
            const s = filters.search.toLowerCase();
            const match = inv.invoiceNumber?.toLowerCase().includes(s)
                || inv.project?.projectName?.toLowerCase().includes(s)
                || inv.client?.name?.toLowerCase().includes(s);
            if (!match) return false;
        }

        if (filters.project !== "All" && inv.project?.projectName !== filters.project) return false;
        if (filters.client !== "All" && inv.client?.name !== filters.client) return false;
        if (filters.status !== "All" && inv.status !== filters.status) return false;

        if (filters.startDate && filters.endDate) {
            const d = new Date(inv.invoiceDate);
            const start = new Date(filters.startDate);
            const end = new Date(filters.endDate);
            end.setHours(23, 59, 59);
            if (d < start || d > end) return false;
        }

        return true;
    });


    const handleMarkAsPaid = async (invoice) => {
        if (!invoice?.id) return;

        const ok = confirm(`Mark invoice ${invoice.invoiceNumber} as PAID?`);
        if (!ok) return;

        try {
            const res = await fetch(
                `${BASE_URL}/api/invoices/${invoice.invoiceNumber}/mark-paid`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || "Failed to mark invoice as paid");
            }

            alert("Invoice marked as PAID successfully ✅");

            // 🔁 refresh invoice list
            window.location.reload();   // agar parent se aata hai
        } catch (err) {
            console.error(err);
            alert("Failed to mark invoice as paid");
        }
    };





    const handleSendPaymentReminder = async (invoice) => {
        if (!invoice?.invoiceNumber) return;

        const ok = confirm(
            `Send payment reminder for invoice ${invoice.invoiceNumber}?`
        );
        if (!ok) return;

        try {
            const res = await fetch(
                `${BASE_URL}/api/invoices/${invoice.invoiceNumber}/actions/send-reminder-email`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );

            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || "Failed to send reminder");
            }

            alert("Payment reminder sent successfully 📧");
        } catch (err) {
            console.error(err);
            alert("Failed to send payment reminder");
        }
    };


    const handleDeleteInvoice = async (invoice) => {
        // if (!invoice?.invoiceNumber) return;


        //console.log("devesh delete ", invoice.invoiceNumber)
        // const ok = confirm(
        //     `Are you sure you want to delete invoice ${invoice.invoiceNumber}?`
        // );
        // if (!ok) return;

        try {
            const res = await fetch(
                `${BASE_URL}/api/invoices/${invoice.invoiceNumber}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );

            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || "Failed to delete invoice");
            }

            alert("Invoice deleted successfully 🗑️");

            // 🔁 Refresh list
            window.location.reload(); // or call fetchInvoices()
        } catch (err) {
            console.error("Delete invoice error:", err);
            alert("Failed to delete invoice");
        }
    };


    if (loading) return <p className="text-center py-10">Loading…</p>;

    return (
        <div className="border rounded-lg bg-white shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {filtered.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                                No invoices found
                            </TableCell>
                        </TableRow>
                    ) : (
                        filtered.map(inv => (
                            <TableRow key={inv.id} className="hover:bg-gray-50">
                                <TableCell>{inv.invoiceNumber}</TableCell>
                                <TableCell>{inv.project?.projectName}</TableCell>

                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {inv.client?.company?.companyLogoUrl ? (
                                            <Image src={inv.client.company.companyLogoUrl} alt="logo" width={28} height={28} className="rounded-full" />
                                        ) : (
                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                {inv.client?.name?.charAt(0)}
                                            </div>
                                        )}
                                        <span>{inv.client?.name}</span>
                                    </div>
                                </TableCell>

                                <TableCell>{inv.currency} {Number(inv.total).toFixed(2)}</TableCell>
                                <TableCell>{safeDate(inv.invoiceDate)}</TableCell>
                                <TableCell>{statusBadge(inv.status)}</TableCell>

                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent align="end" className="w-52">

                                            {/* --- COMMON ALWAYS --- */}
                                            <DropdownMenuItem onClick={() => { setActiveInvoice(inv); setModal(m => ({ ...m, view: true })); }}>
                                                <Eye className="h-4 w-4 mr-2" /> View
                                            </DropdownMenuItem>

                                            {/* ============================UNPAID INVOICE ACTIONS============================ */}
                                            {inv.status === "UNPAID" && (
                                                <>
                                                    <DropdownMenuItem onClick={() => { setActiveInvoice(inv); setModal(m => ({ ...m, edit: true })); }}>
                                                        <Edit2 className="h-4 w-4 mr-2" /> Edit
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem onClick={() => { if (confirm("Mark invoice as paid?")) handleMarkAsPaid(inv); }}>
                                                        <CheckCircle className="h-4 w-4 mr-2" /> Mark as Paid
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem onClick={() => { setActiveInvoice(inv); setModal(m => ({ ...m, payment: true })); }}>
                                                        <DollarSign className="h-4 w-4 mr-2" /> Add Payment
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setActiveInvoice(inv);
                                                            setModal(m => ({ ...m, viewPayment: true }));
                                                        }}
                                                    >
                                                        <FileText className="h-4 w-4 mr-2" /> View Payments
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem onClick={() => { setActiveInvoice(inv); setModal(m => ({ ...m, upload: true })); }}>
                                                        <Upload className="h-4 w-4 mr-2" /> Upload File
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem onClick={() => { handleSendPaymentReminder(inv); }}>
                                                        <Bell className="h-4 w-4 mr-2" /> Send Reminder
                                                    </DropdownMenuItem>
                                                </>
                                            )}

                                            {/* ============================PAID INVOICE ACTIONS============================ */}
                                            {inv.status === "PAID" && (
                                                <>
                                                    {/* <DropdownMenuItem onClick={() => { setActiveInvoice(inv); setModal(m => ({ ...m, receipt: true })); }}>
                                                        <FileText className="h-4 w-4 mr-2" /> Add Receipt
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem onClick={() => { setActiveInvoice(inv); setModal(m => ({ ...m, receipt: true })); }}>
                                                        <FileText className="h-4 w-4 mr-2" /> View Receipt
                                                    </DropdownMenuItem> */}


                                                    {/* ADD RECEIPT */}
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setActiveInvoice(inv);
                                                            setModal(m => ({ ...m, receipt: true }));
                                                        }}
                                                    >
                                                        <FileText className="h-4 w-4 mr-2" /> Add Receipt
                                                    </DropdownMenuItem>

                                                    {/* VIEW RECEIPT */}
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setActiveInvoice(inv);
                                                            setModal(m => ({ ...m, viewReceipt: true }));
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" /> View Receipt
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem onClick={() => { setActiveInvoice(inv); setModal(m => ({ ...m, upload: true })); }}>
                                                        <Upload className="h-4 w-4 mr-2" /> Upload File
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setActiveInvoice(inv);
                                                            setModal(m => ({ ...m, viewPayment: true }));
                                                        }}
                                                    >
                                                        <FileText className="h-4 w-4 mr-2" /> View Payments
                                                    </DropdownMenuItem>

                                                    <>
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setActiveInvoice(inv);
                                                                setModal(m => ({ ...m, createCredit: true }));
                                                            }}
                                                        >
                                                            <FileText className="h-4 w-4 mr-2" />
                                                            Create Credit Note
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setActiveInvoice(inv);
                                                                setModal(m => ({ ...m, viewCredit: true }));
                                                            }}
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Credit Notes
                                                        </DropdownMenuItem>
                                                    </>
                                                </>
                                            )}

                                            {/* ============================CREDIT NOTE INVOICE ACTIONS============================ */}
                                            {inv.status === "CREDIT_NOTES" && (
                                                <>
                                                    {/* <DropdownMenuItem onClick={() => { setActiveInvoice(inv); setModal(m => ({ ...m, payment: true })); }}>
                                                        <DollarSign className="h-4 w-4 mr-2" /> Add Payment
                                                    </DropdownMenuItem> */}

                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setActiveInvoice(inv);
                                                            setModal(m => ({ ...m, payment: true }));
                                                        }}
                                                    >
                                                        <DollarSign className="h-4 w-4 mr-2" /> Add Payment
                                                    </DropdownMenuItem>

                                                    {/* <DropdownMenuItem onClick={() => { setActiveInvoice(inv); setModal(m => ({ ...m, payment: true })); }}>
                                                        <FileText className="h-4 w-4 mr-2" /> View Payments
                                                    </DropdownMenuItem> */}

                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setActiveInvoice(inv);
                                                            setModal(m => ({ ...m, viewPayment: true }));
                                                        }}
                                                    >
                                                        <FileText className="h-4 w-4 mr-2" /> View Payments
                                                    </DropdownMenuItem>
                                                </>
                                            )}

                                            <DropdownMenuSeparator />

                                            {/* --- COMMON ALWAYS --- */}
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setActiveInvoice(inv);                 // original invoice
                                                    setModal(m => ({ ...m, create: true })); // SAME create modal open
                                                }}
                                            >
                                                <Copy className="h-4 w-4 mr-2" /> Create Duplicate
                                            </DropdownMenuItem>

                                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteInvoice(inv)}>
                                                <Trash className="h-4 w-4 mr-2" /> Delete
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
    );
}

