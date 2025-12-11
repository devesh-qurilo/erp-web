
"use client"

import { useState, useRef, useEffect } from "react"
import type { Stage } from "@/types/stages"
import type { Deal } from "@/types/deals"
import { Calendar, Tag, Phone } from "lucide-react"

type Filters = {
  pipeline?: string
  category?: string
}

// ---- API ----
const API_BASE = "https://6jnqmj85-80.inc1.devtunnels.ms"
const PRIORITIES_ADMIN_ENDPOINT = `${API_BASE}/deals/admin/priorities`
const PRIORITY_ASSIGN = (dealId: string | number) => `${API_BASE}/deals/${dealId}/priority/assign`
const PRIORITY_UPDATE = (dealId: string | number) => `${API_BASE}/deals/${dealId}/priority`
// ---------------

export default function KanbanBoard({
  stages,
  deals,
  search,
  filters,
}: {
  stages: Stage[]
  deals: Deal[]
  search: string
  filters: Filters
}) {
  const normalizedSearch = search.trim().toLowerCase()

  const filteredDeals = deals.filter((d) => {
    if (filters.pipeline && d.pipeline !== filters.pipeline) return false
    if (filters.category && d.dealCategory !== filters.category) return false
    if (normalizedSearch) {
      const hay =
        `${d.title} ${d.id} ${d.dealCategory ?? ""} ${d.pipeline ?? ""} ${d.dealAgentMeta?.name ?? d.dealAgent ?? ""}`.toLowerCase()
      if (!hay.includes(normalizedSearch)) return false
    }
    return true
  })

  // Read token once (used for API calls)
  const [token, setToken] = useState<string | null>(null)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("accessToken"))
    }
  }, [])

  // Global palette fetched from API and shared to cards
  const [globalPalette, setGlobalPalette] = useState<Array<{ id?: number; name: string; color: string }>>(() => [
    // fallback while loading (unique)
    { id: -1, name: "Medium", color: "#FBBF24" },
    { id: -2, name: "High", color: "#F97316" },
    { id: -3, name: "Low", color: "#15803D" },
  ])
  const [paletteLoading, setPaletteLoading] = useState<boolean>(true)

  // helper to dedupe palette by name case-insensitive, keep earlier items unless replaced by same-name with id/color
  const dedupePalette = (items: Array<{ id?: number; name: string; color: string }>) => {
    const map = new Map<string, { id?: number; name: string; color: string }>()
    for (const it of items) {
      const key = it.name.trim().toLowerCase()
      const existing = map.get(key)
      if (!existing) {
        map.set(key, it)
      } else {
        const chosen =
          (!existing.id && it.id) || (it.id && existing.id && it.id !== existing.id)
            ? { id: it.id ?? existing.id, name: it.name, color: it.color }
            : { id: existing.id ?? it.id, name: existing.name, color: existing.color ?? it.color }
        map.set(key, chosen)
      }
    }
    return Array.from(map.values())
  }

  useEffect(() => {
    let mounted = true

    // wait until token is loaded (token === null => still reading)
    if (token === null) {
      return
    }

    const fetchPriorities = async () => {
      setPaletteLoading(true)
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" }
        if (token) headers["Authorization"] = `Bearer ${token}`

        const res = await fetch(PRIORITIES_ADMIN_ENDPOINT, { headers })
        if (!res.ok) {
          throw new Error(`Failed to load priorities: ${res.status}`)
        }
        const json = await res.json()
        if (!mounted) return
        const mapped = Array.isArray(json)
          ? json.map((p: any) => ({ id: p.id, name: String(p.status ?? p.status), color: p.color ?? "#2563EB" }))
          : []
        if (mapped.length > 0) {
          setGlobalPalette((prev) => dedupePalette([...prev, ...mapped]))
        }
      } catch (err) {
        console.error("Error loading priorities:", err)
      } finally {
        if (mounted) setPaletteLoading(false)
      }
    }
    fetchPriorities()
    return () => {
      mounted = false
    }
  }, [token])

  /**
   * createGlobalPriority
   * - POST /deals/admin/priorities { status, color, isGlobal: true }
   * - returns created { id, status, color, ... }
   */
  const createGlobalPriority = async (name: string, color: string) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (token) headers["Authorization"] = `Bearer ${token}`
    const res = await fetch(PRIORITIES_ADMIN_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({ status: name, color, isGlobal: true }),
    })
    if (!res.ok) {
      const text = await safeReadResponseText(res)
      throw new Error(`Failed to create global priority: ${res.status} ${text}`)
    }
    const created = await res.json()
    // API returns { id, status, color, ... }
    return { id: created.id, name: created.status ?? name, color: created.color ?? color }
  }

  /**
   * assignPriorityToDeal
   * - POST /deals/{dealId}/priority/assign  body: { priorityId }
   * - returns assigned object
   *
   * NOTE: send a well-formed JSON body { priorityId: number } (previously sent raw number/string).
   */
  const assignPriorityToDeal = async (dealId: string | number, priorityId: number) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (token) headers["Authorization"] = `Bearer ${token}`

    const res = await fetch(PRIORITY_ASSIGN(dealId), {
      method: "POST",
      headers,
      body: JSON.stringify({ priorityId }),
    })

    if (!res.ok) {
      const text = await safeReadResponseText(res)
      // throw an Error containing both status and server text to help debugging
      throw new Error(`Failed to assign priority: ${res.status} ${text}`)
    }
    const created = await res.json()
    // API likely returns something like { id, status, color, dealId, isGlobal }
    return {
      id: created.id,
      name: created.status ?? String(created.status ?? priorityId),
      color: created.color ?? "#2563EB",
      dealId: created.dealId ?? dealId,
    }
  }

  /**
   * updatePriorityForDealFallback
   * - PUT /deals/{dealId}/priority { priorityId }
   * - returns updated object
   *
   * The server expects a body containing the priority id, e.g. { "priorityId": 4 }.
   */
  const updatePriorityForDealFallback = async (dealId: string | number, priorityId: number) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (token) headers["Authorization"] = `Bearer ${token}`

    const res = await fetch(PRIORITY_UPDATE(dealId), {
      method: "PUT",
      headers,
      body: JSON.stringify({ priorityId }),
    })
    if (!res.ok) {
      const text = await safeReadResponseText(res)
      throw new Error(`Failed fallback PUT update: ${res.status} ${text}`)
    }
    const created = await res.json()
    return {
      id: created.id,
      name: created.status ?? String(created.status ?? priorityId),
      color: created.color ?? "#2563EB",
      dealId: created.dealId ?? dealId,
    }
  }

  // safe response text reader (handles json/text)
  async function safeReadResponseText(res: Response) {
    try {
      const ct = res.headers.get("content-type") || ""
      if (ct.includes("application/json")) {
        const j = await res.json()
        return JSON.stringify(j)
      } else {
        const t = await res.text()
        return t
      }
    } catch (e) {
      return "<could not read response body>"
    }
  }

  /**
   * addPriorityAndAssignFlow:
   * - If palette item has id -> assign by id (POST assign)
   * - If palette item has no id -> create global priority then assign using returned id
   * - On assign failure (500 etc) -> try fallback PUT /deals/{dealId}/priority with body { priorityId }
   */
  const addPriorityAndAssignFlow = async (name: string, color: string, dealId: string | number, existingId?: number) => {
    // prefer direct assign if we have existingId
    if (existingId) {
      try {
        const assigned = await assignPriorityToDeal(dealId, existingId)
        setGlobalPalette((prev) => dedupePalette([...prev, { id: assigned.id, name: assigned.name, color: assigned.color }]))
        return assigned
      } catch (assignErr) {
        console.error("Assign failed, attempting fallback. Assign error:", assignErr)
        // fallback to update via PUT using the known priority id
        try {
          const fallback = await updatePriorityForDealFallback(dealId, existingId)
          setGlobalPalette((prev) => dedupePalette([...prev, { id: fallback.id, name: fallback.name, color: fallback.color }]))
          return fallback
        } catch (fallbackErr) {
          // bubble up the detailed error
          console.error("Fallback PUT failed:", fallbackErr)
          throw fallbackErr
        }
      }
    }

    // no existing id → create global, then assign
    try {
      const createdGlobal = await createGlobalPriority(name, color)
      setGlobalPalette((prev) => dedupePalette([...prev, createdGlobal]))
      try {
        const assigned = await assignPriorityToDeal(dealId, createdGlobal.id as number)
        setGlobalPalette((prev) => dedupePalette([...prev, { id: assigned.id, name: assigned.name, color: assigned.color }]))
        return assigned
      } catch (assignErr) {
        console.error("Assign after create failed, attempting fallback. Assign error:", assignErr)
        try {
          const fallback = await updatePriorityForDealFallback(dealId, createdGlobal.id as number)
          setGlobalPalette((prev) => dedupePalette([...prev, { id: fallback.id, name: fallback.name, color: fallback.color }]))
          return fallback
        } catch (fallbackErr) {
          console.error("Fallback PUT failed after create:", fallbackErr)
          throw fallbackErr
        }
      }
    } catch (createErr) {
      console.error("Create global priority failed:", createErr)
      throw createErr
    }
  }

  return (
    <div className="relative w-full">
      <div className="flex gap-6 overflow-x-auto pb-4 px-1">
        {stages.map((stage) => {
          const stageDeals = filteredDeals.filter((deal) => deal.dealStage === stage.name)
          return (
            <div key={stage.id} className="min-w-[340px] max-w-[380px] flex-shrink-0 flex flex-col">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <h2 className="text-sm font-semibold text-foreground">{stage.name}</h2>
                </div>
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  {stageDeals.length}
                </span>
              </div>

              <div className="flex flex-col gap-3 flex-1 bg-muted/30 rounded-xl p-3 min-h-[400px]">
                {stageDeals.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center">
                    <p className="text-sm text-muted-foreground">No deals in this stage</p>
                  </div>
                ) : (
                  stageDeals.map((deal) => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      palette={globalPalette}
                      paletteLoading={paletteLoading}
                      addPriorityAndAssignFlow={addPriorityAndAssignFlow}
                      token={token}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------- helpers ------------------- */

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => (n ? n[0] : ""))
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

/* ------------------- DealCard ------------------- */

function DealCard({
  deal,
  palette,
  paletteLoading,
  addPriorityAndAssignFlow,
  token,
}: {
  deal: Deal
  palette: Array<{ id?: number; name: string; color: string }>
  paletteLoading: boolean
  addPriorityAndAssignFlow: (name: string, color: string, dealId: string | number, existingId?: number) => Promise<{ id?: number; name: string; color: string }>
  token: string | null
}) {
  const leadName =
    (deal as any).leadName ||
    (deal as any).contactName ||
    deal.dealAgentMeta?.name ||
    deal.dealAgent ||
    "Unknown"

  const dealName = deal.title ?? "Deal"

  const tags: string[] = Array.isArray((deal as any).tags)
    ? (deal as any).tags
    : (deal as any).tags
    ? String((deal as any).tags)
        .split(",")
        .map((s: string) => s.trim())
    : []

  const nextFollowupRaw = (deal as any).nextFollowupDate ?? (deal as any).nextFollowup ?? (deal as any).next_followup
  const nextFollowup = nextFollowupRaw ? new Date(nextFollowupRaw) : null

  const contact =
    (deal as any).contactPhone ||
    (deal as any).phone ||
    (deal as any).contact ||
    (deal as any).mobile ||
    ""

  const watchers = Array.isArray((deal as any).watchers)
    ? (deal as any).watchers
    : Array.isArray((deal as any).dealWatchers)
    ? (deal as any).dealWatchers
    : []

  const rawPriority = (deal as any).priority
  const parsePriorities = (raw: any) => {
    if (!raw) return [] as Array<{ name: string; color?: string }>
    if (Array.isArray(raw)) {
      return raw.map((p: any) => (typeof p === "string" ? { name: p, color: undefined } : { name: p?.name ?? String(p), color: p?.color }))
    }
    if (typeof raw === "object") {
      return [{ name: raw.name ?? String(raw), color: raw.color }]
    }
    return [{ name: String(raw), color: undefined }]
  }

  const [priorities, setPriorities] = useState<Array<{ name: string; color?: string }>>(parsePriorities(rawPriority))

  const [openPopover, setOpenPopover] = useState(false)
  const popRef = useRef<HTMLDivElement | null>(null)

  const [openModal, setOpenModal] = useState(false)
  const [modalPriorityName, setModalPriorityName] = useState("")
  const [modalPriorityColor, setModalPriorityColor] = useState("#000000")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!openPopover) return
      if (popRef.current && !popRef.current.contains(e.target as Node)) {
        setOpenPopover(false)
      }
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [openPopover])

  /**
   * applyPalettePriority:
   * - when user selects an existing palette item from the popover
   * - if item has id -> assign by id (handled in addPriorityAndAssignFlow)
   * - else create global -> assign
   */
  const applyPalettePriority = async (p: { id?: number; name: string; color: string }) => {
    setPriorities([{ name: p.name, color: p.color }])
    try {
      const assigned = await addPriorityAndAssignFlow(p.name, p.color, (deal as any).id, p.id)
      setPriorities([{ name: assigned.name, color: assigned.color }])
    } catch (err) {
      console.error("Failed to persist selected priority:", err)
      // don't revert optimistic UI; user will see console details
    }
  }

  const onOpenAddModal = () => {
    setModalPriorityName("")
    setModalPriorityColor("#000000")
    setOpenModal(true)
  }

  // clicking colored circle shows the list (per your request)
  const onOpenPriorityList = () => {
    setOpenPopover(true)
  }

  /**
   * onSaveModal:
   * - create global priority then assign to deal (so it persists)
   * - fallback to PUT if assign fails
   */
  const onSaveModal = async () => {
    if (!modalPriorityName.trim()) return
    setSaving(true)
    try {
      const assigned = await addPriorityAndAssignFlow(modalPriorityName.trim(), modalPriorityColor || "#000000", (deal as any).id)
      setPriorities([{ name: assigned.name, color: assigned.color }])
      setOpenModal(false)
      setOpenPopover(false)
    } catch (err) {
      console.error("Could not save/assign priority", err)
      // UI unchanged; logs will contain detailed server responses
    } finally {
      setSaving(false)
    }
  }

  const onCancelModal = () => {
    setOpenModal(false)
  }

  return (
    <div className="group rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-default">
      <div className="p-4 flex flex-col gap-3 relative">
        <div className="absolute right-3 top-3">
          <div>
            {priorities.length === 0 ? (
              <button
                type="button"
                onClick={() => setOpenPopover((s) => !s)}
                className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-sm font-medium"
                aria-expanded={openPopover}
                aria-label="Toggle priority popover"
              >
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-border text-sm font-medium text-blue-600 bg-white/60">
                  <span className="text-[14px]">＋</span>
                  <span className="text-xs">Add priority</span>
                </div>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenPriorityList}
                className="h-6 w-6 rounded-full flex items-center justify-center"
                aria-label="Open priority list"
                title={priorities.map((p) => p.name).join(", ")}
              >
                <div
                  className="h-3 w-3 rounded-full shadow-sm"
                  style={{ backgroundColor: priorities[0].color ?? "rgba(59,130,246,0.9)" }}
                />
              </button>
            )}
          </div>

          {openPopover && (
            <div
              ref={popRef}
              className="mt-2 w-44 rounded-lg bg-white border border-border shadow-lg p-3 text-sm z-50"
              role="dialog"
              aria-modal="false"
            >
              <div className="flex flex-col gap-2">
                {paletteLoading ? (
                  <div className="text-xs text-muted-foreground">Loading...</div>
                ) : (
                  palette.map((pp) => (
                    <button
                      key={pp.id ?? pp.name}
                      type="button"
                      onClick={() => applyPalettePriority(pp)}
                      className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/20 text-left"
                    >
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: pp.color }} />
                      <span className="font-medium" style={{ color: pp.color }}>
                        {pp.name}
                      </span>
                    </button>
                  ))
                )}
              </div>

              <div className="border-t border-border/60 my-2" />

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 w-full">
                  <button
                    type="button"
                    onClick={onOpenAddModal}
                    className="h-8 w-8 rounded-full flex items-center justify-center bg-blue-600 text-white"
                    title="Add"
                  >
                    ＋
                  </button>
                  <div className="text-sm text-muted-foreground">Add</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-foreground truncate">{leadName}</div>
            <div className="text-xs text-muted-foreground mt-1 truncate">{dealName}</div>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {tags.slice(0, 3).map((t, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground">
                {t}
              </span>
            ))
            }
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-sm">
            {contact ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{contact}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">—</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {nextFollowup ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>{nextFollowup.toLocaleDateString()}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>No follow-up</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {watchers && watchers.length > 0 ? (
                watchers.slice(0, 4).map((w: any, i: number) => {
                  const img = w?.profilePictureUrl || w?.avatar || w?.avatarUrl
                  const name = w?.name || w?.displayName || String(w)
                  return img ? (
                    <img
                      key={i}
                      src={img}
                      alt={name}
                      title={name}
                      className="h-7 w-7 rounded-full border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div
                      key={i}
                      title={name}
                      className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-white shadow-sm"
                    >
                      {initials(name)}
                    </div>
                  )
                })
              ) : (
                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-white shadow-sm">
                  {initials(leadName)}
                </div>
              )}

              {watchers && watchers.length > 4 && (
                <div className="h-7 w-7 rounded-full bg-muted/80 flex items-center justify-center text-xs font-medium border-2 border-white shadow-sm">
                  +{watchers.length - 4}
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => {
                /* visual only — no behavior changed per request */
              }}
              className="h-8 w-8 rounded-full border border-border flex items-center justify-center bg-white text-blue-600 shadow-sm"
              title="Add watcher"
            >
              ＋
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium pt-2">Details removed</div>
      </div>

      {openModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Priority modal">
          <div className="absolute inset-0 bg-black/40" onClick={onCancelModal} />

          <div className="relative z-10 w-[320px] bg-white rounded-lg shadow-lg border border-border p-4">
            <h3 className="text-lg font-semibold mb-3">Add</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Priority Status *</label>
                <input
                  type="text"
                  value={modalPriorityName}
                  onChange={(e) => setModalPriorityName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Color Code *</label>
                <input
                  type="text"
                  value={modalPriorityColor}
                  onChange={(e) => setModalPriorityColor(e.target.value)}
                  placeholder="eg #000000"
                  className="w-full px-3 py-2 rounded-md border border-border text-sm"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-3">
              <button type="button" onClick={onCancelModal} className="px-4 py-2 rounded-md border border-border text-sm font-medium">
                Cancel
              </button>
              <button type="button" onClick={onSaveModal} className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
