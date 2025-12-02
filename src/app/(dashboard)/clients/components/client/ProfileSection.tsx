"use client"
import React, { useMemo } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import Row from "./Row"

/**
 * Order + colors chosen to match the screenshot:
 *  Finished  -> green
 *  To Do     -> yellow  (mapped from ON_HOLD)
 *  In Progress -> blue
 *  Cancelled -> red
 *  Not Started -> gray
 */
const STATUS_ORDER = [
  { key: "FINISHED", label: "Finished", color: "#16A34A" },      // green
  { key: "ON_HOLD", label: "To Do", color: "#F59E0B" },          // yellow (used as "To Do")
  { key: "IN_PROGRESS", label: "In Progress", color: "#2563EB" },// blue
  { key: "CANCELLED", label: "Cancelled", color: "#EF4444" },    // red
  { key: "NOT_STARTED", label: "Not Started", color: "#9CA3AF" },// gray
] as const

type StatusKey = (typeof STATUS_ORDER)[number]["key"]

/**
 * ProfileSection shows client info (unchanged) and a Projects card which contains:
 *  - donut chart (pie) built with CSS conic-gradient
 *  - legend to the right matching the screenshot
 *
 * Pass projects prop from parent: <ProfileSection client={client} projects={projects} />
 */
export const ProfileSection: React.FC<{ client: any; projects?: any[] }> = ({ client, projects = [] }) => {
  // normalize and compute counts/pcts in the SAME order as STATUS_ORDER
  const statusStats = useMemo(() => {
    const total = Array.isArray(projects) ? projects.length : 0

    // initialize counts
    const counts: Record<string, number> = {}
    STATUS_ORDER.forEach((s) => (counts[s.key] = 0))

    // Accept many potential status fields and normalize
    function normalizeProjectStatus(p: any): StatusKey {
      if (!p) return "NOT_STARTED"
      const cand = (p.projectStatus ?? p.status ?? p.state ?? p.project_state ?? "").toString().trim()
      const up = cand.toUpperCase().replace(/ /g, "_")

      if (["FINISHED", "COMPLETED", "DONE"].includes(up)) return "FINISHED"
      if (["IN_PROGRESS", "INPROGRESS", "IN-PROGRESS", "ONGOING", "RUNNING"].includes(up)) return "IN_PROGRESS"
      if (["ON_HOLD", "HOLD", "PAUSED", "TODO", "TO_DO", "TO-DO"].includes(up)) return "ON_HOLD"
      if (["CANCELLED", "CANCELED", "CANCEL"].includes(up)) return "CANCELLED"
      if (["NOT_STARTED", "NOTSTARTED", "PENDING", "PLANNED"].includes(up)) return "NOT_STARTED"

      // fallback: if it happens to match one of our keys exactly
      if ((STATUS_ORDER as any).some((m: any) => m.key === up)) return up as StatusKey

      // last fallback
      return "NOT_STARTED"
    }

    (projects || []).forEach((p) => {
      const k = normalizeProjectStatus(p)
      counts[k] = (counts[k] || 0) + 1
    })

    // build items in the desired order
    const items = STATUS_ORDER.map((s) => {
      const count = counts[s.key] ?? 0
      const pct = total > 0 ? (count / total) * 100 : 0
      return { key: s.key, label: s.label, color: s.color, count, pct }
    })

    return { total, items }
  }, [projects])

  // build conic-gradient CSS string from items (keeps order)
  const gradientStyle = useMemo(() => {
    const segs: string[] = []
    let cursor = 0
    statusStats.items.forEach((it) => {
      const start = cursor
      const end = cursor + Math.max(0, Math.round(it.pct * 100) / 100) // keep decimals under control
      // if pct is zero we still add a 0-length segment (harmless)
      segs.push(`${it.color} ${start}% ${end}%`)
      cursor = end
    })
    // if rounding left some gap, fill remainder with transparent (or gray)
    if (cursor < 100) {
      segs.push(`#ffffff ${cursor}% 100%`) // small white gap if any rounding error
    }
    return segs.join(", ")
  }, [statusStats.items])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information </CardTitle>
            <CardDescription>Details about client</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-0">
              <Row label="Name" value={client.name} />
              <Row label="Email" value={client.email} />
              <Row label="Gender" value={"—"} />
              <Row label="Company Name" value={client.company?.companyName ?? "—"} />
              <Row label="Company Logo" value={client.companyLogoUrl ? "Uploaded" : "—"} />
              <Row label="Mobile" value={client.mobile ?? "—"} />
              <Row label="Office Phone No." value={"—"} />
              <Row label="Official Website" value={"—"} />
              <Row label="GST/VAT No." value={"—"} />
              <Row label="Address" value={"—"} />
              <Row label="State" value={client.company?.state ?? "—"} />
              <Row label="Country" value={client.country ?? "India"} />
              <Row label="Postal Code" value={"—"} />
              <Row label="Language" value={"English"} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>
              {statusStats.total > 0 ? `${statusStats.total} project${statusStats.total > 1 ? "s" : ""}` : "No projects yet"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {statusStats.total === 0 ? (
              <div className="h-40 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-blue-500/90" />
              </div>
            ) : (
              <div className="flex items-center gap-6">
                {/* LEFT: Pie/Donut */}
                <div className="flex-shrink-0">
                  <div
                    className="relative"
                    style={{
                      width: 140,
                      height: 140,
                    }}
                  >
                    {/* Pie using conic-gradient */}
                    <div
                      aria-hidden
                      className="rounded-full"
                      style={{
                        width: 140,
                        height: 140,
                        background: `conic-gradient(${gradientStyle})`,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      }}
                    />

                    {/* Center hole to make donut (white center) */}
                    <div
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                      style={{
                        width: 90,
                        height: 90,
                        background: "#ffffff",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
                      }}
                    />

                    {/* Optional percentage in center: show largest segment pct */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none">
                      {/* show largest segment pct and label */}
                      {(() => {
                        const sorted = [...statusStats.items].sort((a, b) => b.pct - a.pct)
                        const top = sorted[0]
                        return (
                          <>
                            <div className="text-sm font-semibold" style={{ color: top?.color ?? "#111" }}>
                              {Math.round(top?.pct ?? 0)}%
                            </div>
                            <div className="text-xs text-gray-500 -mt-0.5">{top?.label}</div>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                </div>

                {/* RIGHT: Legend (vertical list) */}
                <div className="flex-1">
                  <div className="flex flex-col gap-3">
                    {statusStats.items.map((it) => (
                      <div key={it.key} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-sm flex-shrink-0" style={{ background: it.color }} />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{it.label}</div>
                          <div className="text-xs text-gray-500">{it.count} project{it.count !== 1 ? "s" : ""}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoices </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-green-600/90" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ProfileSection
