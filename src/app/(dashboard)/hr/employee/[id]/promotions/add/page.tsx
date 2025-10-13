"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"

type PromotionPayload = {
  oldDesignationId: number
  oldDepartmentId: number
  newDepartmentId: number
  newDesignationId: number
  isPromotion: boolean
  sendNotification: boolean
  remarks: string
}

export default function AddPromotionPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const employeeId = params?.id

  const [form, setForm] = useState<PromotionPayload>({
    oldDesignationId: 1,
    oldDepartmentId: 1,
    newDepartmentId: 2,
    newDesignationId: 2,
    isPromotion: true,
    sendNotification: true,
    remarks: "",
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!employeeId) {
      setError("Missing employee id in route")
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
      const res = await fetch(`/api/hr/employee/${employeeId}/promotions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      })

      const contentType = res.headers.get("content-type") || "application/json"
      const raw = await res.text()
      let data: any = null
      if (raw && contentType.includes("application/json")) {
        try {
          data = JSON.parse(raw)
        } catch {
          // leave data as raw text fallback
          data = raw
        }
      } else {
        data = raw
      }

      if (!res.ok) {
        const message = typeof data === "string" && data.trim().length > 0
          ? data
          : (data?.message || `Failed to create promotion (status ${res.status})`)
        throw new Error(message)
      }

      // Success UX: simple alert then navigate back to employee profile or promotions list
      alert("Promotion saved successfully")
      router.push(`/hr/employee/${employeeId}`)
    } catch (err: any) {
      setError(err?.message || "Unexpected error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4 max-w-2xl">
      <h1 className="text-xl font-semibold mb-4">Add Promotion</h1>
      {error ? (
        <div className="mb-4 text-red-600 text-sm">{error}</div>
      ) : null}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm">Old Designation ID</span>
            <input
              type="number"
              className="border rounded px-3 py-2"
              value={form.oldDesignationId}
              onChange={(e) =>
                setForm((f) => ({ ...f, oldDesignationId: Number(e.target.value) }))
              }
              required
              min={1}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm">Old Department ID</span>
            <input
              type="number"
              className="border rounded px-3 py-2"
              value={form.oldDepartmentId}
              onChange={(e) =>
                setForm((f) => ({ ...f, oldDepartmentId: Number(e.target.value) }))
              }
              required
              min={1}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm">New Department ID</span>
            <input
              type="number"
              className="border rounded px-3 py-2"
              value={form.newDepartmentId}
              onChange={(e) =>
                setForm((f) => ({ ...f, newDepartmentId: Number(e.target.value) }))
              }
              required
              min={1}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm">New Designation ID</span>
            <input
              type="number"
              className="border rounded px-3 py-2"
              value={form.newDesignationId}
              onChange={(e) =>
                setForm((f) => ({ ...f, newDesignationId: Number(e.target.value) }))
              }
              required
              min={1}
            />
          </label>
        </div>

        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isPromotion}
              onChange={(e) => setForm((f) => ({ ...f, isPromotion: e.target.checked }))}
            />
            <span className="text-sm">Is Promotion</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.sendNotification}
              onChange={(e) =>
                setForm((f) => ({ ...f, sendNotification: e.target.checked }))
              }
            />
            <span className="text-sm">Send Notification</span>
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Remarks</span>
          <textarea
            className="border rounded px-3 py-2 min-h-[100px]"
            value={form.remarks}
            onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
            placeholder="Exceptional performance in Q2"
          />
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save Promotion"}
          </button>
          <button
            type="button"
            className="border px-4 py-2 rounded"
            onClick={() => router.back()}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}


