"use client"
import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const InvoicesTable: React.FC<{
  invoices: any[]
  loading?: boolean
  error?: string | null
  onRefresh?: () => void
  onView?: (id: any) => void
}> = ({ invoices = [], loading, error, onRefresh, onView }) => (
  <Card>
    <CardHeader>
      <CardTitle>Invoices</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Button onClick={onRefresh} className="bg-blue-600 hover:bg-blue-700 text-white">Refresh</Button>
        </div>
        <div className="w-64">
          <input placeholder="Search invoice number or project" className="w-full px-3 py-2 border rounded" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-blue-50 text-left text-xs">
              <th className="px-4 py-3">Invoice #</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Currency</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Unpaid</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-8">Loading invoices...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-red-600">{error}</td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8">No invoices found</td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="border-t">
                  <td className="px-4 py-3">{inv.invoiceNumber ?? "—"}</td>
                  <td className="px-4 py-3">{inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3">{inv.project?.projectName ?? inv.project?.projectCode ?? "—"}</td>
                  <td className="px-4 py-3">{inv.currency ?? "—"}</td>
                  <td className="px-4 py-3">{typeof inv.total === "number" ? inv.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}</td>
                  <td className="px-4 py-3">{typeof inv.unpaidAmount === "number" ? inv.unpaidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}</td>
                  <td className="px-4 py-3"><Badge variant="secondary">{inv.status ?? "—"}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => onView?.(inv.id)}>View</Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
)

export default InvoicesTable
