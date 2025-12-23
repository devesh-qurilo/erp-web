


"use client"

import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutGrid, TableIcon, MoreVertical, SlidersHorizontal, Search } from "lucide-react"

type Followup = {
  id: number
  nextDate?: string
  startTime?: string
  remarks?: string
  sendReminder?: boolean
  reminderSent?: boolean
  createdAt?: string
}

type PriorityObject = {
  id: number
  status: string
  color?: string
  dealId?: number | null
  isGlobal?: boolean
}

type Deal = {
  id: number | string
  title?: string
  value?: number
  dealStage?: string
  dealCategory?: string
  pipeline?: string
  dealAgent?: string
  dealAgentMeta?: {
    employeeId?: string
    name?: string
    designation?: string | null
    department?: string | null
    profileUrl?: string | null
  }
  createdAt?: string
  leadId?: number
  leadName?: string
  leadMobile?: string
  leadEmail?: string
  expectedCloseDate?: string
  followups?: Followup[]
  tags?: string[]
  dealWatchers?: string[] // array of employee ids
  dealWatchersMeta?: { employeeId?: string; name?: string; profileUrl?: string | null }[]
  assignedEmployeesMeta?: { employeeId?: string; name?: string; profileUrl?: string | null }[]
  priority?: string | number | PriorityObject | null
}

type PriorityItem = {
  id: number
  status: string
  color?: string
  dealId?: number | null
  isGlobal?: boolean
}

const BASE_URL =  `${process.env.NEXT_PUBLIC_MAIN}`

// Use uploaded images as fallback avatars (local paths provided earlier)
const sampleDesktopImage = "/mnt/data/Screenshot 2025-11-21 122016.png"
const sampleMobileImage = "/mnt/data/Screenshot 2025-11-21 122307.png"

export default function DealsPage() {
  const [token, setToken] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [stageFilter, setStageFilter] = useState<string>("all")

  // UI-only state for the top nav (keeps functionality same; not used to filter results unless you wire it)
  const [pipelineFilter, setPipelineFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<string>("") // placeholder string for "Start Date to End Date"

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
    setToken(t)
  }, [])

  const authFetcher = async (url: string) => {
    if (!token) throw new Error("No access token found. Please log in.")
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      const txt = await res.text().catch(() => "")
      throw new Error(`Failed to fetch ${url}: ${res.status} ${txt}`)
    }
    return res.json()
  }

  // Fetch deals (kept same endpoint as you used)
  const { data: deals = [], error: dealsError, isLoading: dealsLoading, mutate: mutateDeals } = useSWR(
    token ? "/api/deals/get" : null,
    authFetcher
  )

  // Fetch global priorities list
  const { data: priorities = [] as PriorityItem[] } = useSWR(
    token ? `${BASE_URL}/deals/admin/priorities` : null,
    authFetcher
  )

  const priorityByStatus = useMemo(() => {
    const m = new Map<string, PriorityItem>()
    for (const p of priorities || []) {
      if (p.status) m.set(String(p.status).toLowerCase(), p)
    }
    return m
  }, [priorities])

  const priorityById = useMemo(() => {
    const m = new Map<number, PriorityItem>()
    for (const p of priorities || []) {
      m.set(p.id, p)
    }
    return m
  }, [priorities])

  const stages = useMemo(() => {
    const s = new Set<string>()
    for (const d of deals as Deal[]) {
      if (d.dealStage) s.add(d.dealStage)
    }
    return Array.from(s.values()).sort()
  }, [deals])

  // derive pipeline values for the top nav dropdown (UI only)
  const pipelines = useMemo(() => {
    const s = new Set<string>()
    for (const d of deals as Deal[]) {
      if (d.pipeline) s.add(d.pipeline)
    }
    return Array.from(s.values()).sort()
  }, [deals])

  const getNextFollowupDate = (followups?: Followup[]) => {
    if (!followups || followups.length === 0) return null
    const valid = followups.filter((f) => f && f.nextDate).slice()
    if (valid.length === 0) return null
    valid.sort((a, b) => new Date(a.nextDate as string).getTime() - new Date(b.nextDate as string).getTime())
    return valid[0].nextDate || null
  }

  const filteredDeals = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (deals as Deal[]).filter((d) => {
      const matchesStage =
        stageFilter === "all" || (String(d.dealStage || "").toLowerCase() === stageFilter.toLowerCase())
      const hay = [
        d.title,
        d.dealAgentMeta?.name,
        d.dealAgent,
        d.dealCategory,
        d.pipeline,
        String(d.id),
        d.leadName,
        d.leadEmail,
        d.leadMobile,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      const matchesQuery = q.length === 0 || hay.includes(q)
      return matchesStage && matchesQuery
    })
  }, [deals, query, stageFilter])

  if (dealsLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-lg font-semibold">Loading deals...</div>
  }

  if (dealsError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-lg font-semibold text-destructive">
        {(dealsError as Error).message || "Failed to load deals. Please try again later."}
      </div>
    )
  }

  // Normalize priority input to status string
  const normalizePriorityString = (p?: unknown) => {
    if (p === null || p === undefined) return "low"
    if (typeof p === "string") return p.toLowerCase()
    if (typeof p === "number") {
      const byId = priorityById.get(p)
      if (byId?.status) return String(byId.status).toLowerCase()
      return "low"
    }
    try {
      const o = p as PriorityObject
      if (o && o.status) return String(o.status).toLowerCase()
      return String(p).toLowerCase()
    } catch {
      return "low"
    }
  }

  const getPriorityColor = (p?: unknown) => {
    if (p && typeof p === "object" && "color" in (p as any) && (p as any).color) {
      return (p as any).color as string
    }
    if (typeof p === "number") {
      const item = priorityById.get(p)
      if (item?.color) return item.color
    }
    const s = normalizePriorityString(p)
    const item = priorityByStatus.get(s)
    if (item?.color) return item.color
    switch (s) {
      case "high":
        return "#ef4444"
      case "medium":
        return "#f59e0b"
      default:
        return "#10b981"
    }
  }

  // POST assign priority: per your latest API: POST ${baseUrl}/deals/{{dealId}}/priority/assign with body { priorityId: <number> }
  const handlePriorityAssign = async (dealId: number | string, newPriorityIdOrVal: string | number) => {
    if (!token) return
    try {
      // prefer numeric id
      const asNum = Number(newPriorityIdOrVal)
      let priorityIdToSend: number | null = !Number.isNaN(asNum) ? asNum : null

      if (priorityIdToSend === null) {
        // resolve status -> id
        const found = priorityByStatus.get(String(newPriorityIdOrVal).toLowerCase())
        if (found) priorityIdToSend = found.id
      }

      if (priorityIdToSend === null) {
        console.error("Could not resolve priorityId for:", newPriorityIdOrVal)
        return
      }

      const url = `${BASE_URL}/deals/${dealId}/priority/assign`
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priorityId: priorityIdToSend }),
      })

      if (!res.ok) {
        const txt = await res.text().catch(() => "")
        console.error("Failed to assign priority:", res.status, txt)
        return
      }

      await mutateDeals()
    } catch (err) {
      console.error("Error assigning priority:", err)
    }
  }

  // PUT stage: per your API: PUT ${baseUrl}/deals/:dealId/stage?stage=Win
  const handleStageChange = async (dealId: number | string, newStage: string) => {
    if (!token) return
    try {
      const url = `${BASE_URL}/deals/${dealId}/stage?stage=${encodeURIComponent(newStage)}`
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) {
        const txt = await res.text().catch(() => "")
        console.error("Failed to update stage:", res.status, txt)
        return
      }
      await mutateDeals()
    } catch (err) {
      console.error("Error updating stage:", err)
    }
  }

  return (
     <main className="container mx-auto max-w-6xl px-4 py-8">
    <div className="p-0 ">
      {/* Top mini nav (matches provided image) */}
      <div className="mb-4 rounded-md border bg-white py-2 px-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm">
          <div className="text-xs text-muted-foreground">Duration</div>
          {/* simple text input representing start to end (UI only) */}
          <Input
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            placeholder="Start Date to End Date"
            className="w-[300px] text-sm"
          />
          <div className="text-xs text-muted-foreground">Pipeline</div>
          <Select value={pipelineFilter} onValueChange={setPipelineFilter}>
            <SelectTrigger className="w-36 text-sm py-1">
              <SelectValue placeholder="All pipelines" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {pipelines.length ? (
                pipelines.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))
              ) : (
                <>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Partnerships">Partnerships</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="px-2">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-sm">Filters</span>
            </div>
          </Button>
        </div>
      </div>

      {/* Header row: Add Deal left, search + view toggles right (matches image layout) */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button asChild>
            <Link href="/deals/create">+ Add Deal</Link>
          </Button>
        </div>

        <div className="flex w-full items-center gap-3 md:max-w-2xl md:justify-end">
          {/* smaller search on right similar to image */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search deals"
                aria-label="Search deals"
                className="pr-10"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* view toggles */}
            <Tabs className="w-auto" defaultValue="table">
              <TabsList>
                <TabsTrigger value="table" asChild>
                  <Link href="/deals/get" className="flex items-center gap-2 px-2">
                    <TableIcon className="h-4 w-4" />
                  </Link>
                </TabsTrigger>
                <TabsTrigger value="kanban" asChild>
                  <Link href="/deals/stages" className="flex items-center gap-2 px-2">
                    <LayoutGrid className="h-4 w-4" />
                  </Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* main table */}
      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Deal Name</TableHead>
              <TableHead>Lead Name</TableHead>
              <TableHead>Contact Details</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Close Date</TableHead>
              <TableHead>Next Follow Up</TableHead>
              <TableHead>Deal Agent</TableHead>
              <TableHead>Deal Watcher</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Priority Status</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredDeals.map((deal: Deal) => {
              const nextFollowUp = getNextFollowupDate(deal.followups)
              const nextFollowUpDisplay = nextFollowUp ? new Date(nextFollowUp).toLocaleDateString() : "—"

              const watchersNames =
                deal.dealWatchersMeta && deal.dealWatchersMeta.length > 0
                  ? deal.dealWatchersMeta.map((w) => w.name).filter(Boolean).join(", ")
                  : (deal.dealWatchers || []).join(", ") || "—"

              let prioritySelectValue: string
              if (deal.priority === null || typeof deal.priority === "undefined") {
                const fallback = priorities?.find((p) => String(p.status).toLowerCase() === "low") || priorities?.[0]
                prioritySelectValue = fallback ? String(fallback.id) : "Low"
              } else if (typeof deal.priority === "object" && "id" in (deal.priority as any)) {
                prioritySelectValue = String((deal.priority as PriorityObject).id)
              } else if (typeof deal.priority === "number") {
                prioritySelectValue = String(deal.priority)
              } else {
                const found = priorityByStatus.get(String(deal.priority).toLowerCase())
                prioritySelectValue = found ? String(found.id) : String(deal.priority)
              }

              const priorityColor = getPriorityColor(deal.priority)

              return (
                <TableRow key={String(deal.id)} className="align-top">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                        <img
                          src={(deal.dealAgentMeta?.profileUrl as string) || sampleDesktopImage}
                          alt={deal.dealAgentMeta?.name || deal.dealAgent || "agent"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <Link href={`/deals/get/${deal.id}`} className="line-clamp-1 font-medium hover:underline">
                          {deal.title || "—"}
                        </Link>
                        <div className="text-xs text-muted-foreground">ID: {deal.id}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>{deal.leadName || "—"}</TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    <div>{deal.leadEmail || "—"}</div>
                    <div>{deal.leadMobile || "—"}</div>
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    {typeof deal.value === "number" ? `$${deal.value.toLocaleString()}` : "—"}
                  </TableCell>

                  <TableCell>
                    {deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : "—"}
                  </TableCell>

                  <TableCell>{nextFollowUpDisplay}</TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                        <img
                          src={(deal.dealAgentMeta?.profileUrl as string) || sampleMobileImage}
                          alt={deal.dealAgentMeta?.name || deal.dealAgent || "agent"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm">{deal.dealAgentMeta?.name || deal.dealAgent || "—"}</div>
                        <div className="text-xs text-muted-foreground">Team Lead</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-sm">{watchersNames}</TableCell>

                  {/* Stage select - now persists via PUT */}
                  <TableCell>
                    <Select
                      value={deal.dealStage || "Qualified"}
                      onValueChange={(val) => {
                        handleStageChange(deal.id, val)
                      }}
                    >
                      <SelectTrigger className="w-36" aria-label="Deal stage">
                        <SelectValue placeholder={deal.dealStage || "Stage"} />
                      </SelectTrigger>
                      <SelectContent>
                        {stages.length ? (
                          stages.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="Qualified">Qualified</SelectItem>
                            <SelectItem value="Win">Win</SelectItem>
                            <SelectItem value="Lost">Lost</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* Priority select - now uses POST /priority/assign with body { priorityId } */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: priorityColor }} />
                      <div className="flex-1">
                        <Select
                          value={prioritySelectValue}
                          onValueChange={(val) => {
                            const asNum = Number(val)
                            const toSend = !Number.isNaN(asNum) ? asNum : (() => {
                              const resolved = priorityByStatus.get(String(val).toLowerCase())
                              return resolved ? resolved.id : null
                            })()
                            if (toSend !== null) handlePriorityAssign(deal.id, toSend)
                          }}
                        >
                          <SelectTrigger className="w-32 text-sm py-1" aria-label="Priority status">
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            {(priorities && priorities.length > 0
                              ? priorities
                              : [
                                  { id: 3, status: "Low", color: "#10b981" },
                                  { id: 4, status: "Medium", color: "#f59e0b" },
                                  { id: 1, status: "High", color: "#ef4444" },
                                ]
                            ).map((p: PriorityItem) => (
                              <SelectItem key={p.id} value={String(p.id)}>
                                <div className="flex items-center gap-2">
                                  <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                  <span>{p.status}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {(deal.tags && deal.tags.length > 0 && deal.tags.join(", ")) || "—"}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-2">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/deals/get/${deal.id}`}>View</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/deals/create/${deal.id}`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              //console.log("Delete clicked for", deal.id)
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}

            {filteredDeals.length === 0 && (
              <TableRow>
                <TableCell colSpan={12} className="py-10 text-center text-sm text-muted-foreground">
                  No deals found. Adjust your filters or search terms.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4">
        <Link href="/" className="underline">
          Back to Home
        </Link>
      </div>
    </div>
    </main>
  )
}
