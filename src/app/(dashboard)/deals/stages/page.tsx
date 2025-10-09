"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import useSWR from "swr"
import type { Stage } from "@/types/stages"
import type { Deal } from "@/types/deals"
import AddStagePanel from "./_components/add-stages-panel"
import KanbanBoard from "./_components/kanban-board"
import { Button } from "@/components/ui/button"

export default function StagesPage() {
  const [token, setToken] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [pipelineFilter, setPipelineFilter] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  // Fetch token once on mount
  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
    setToken(t)
  }, [])

  const fetchWithAuth = async (url: string) => {
    if (!token) throw new Error("No access token found. Please log in.")
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error(`Failed to fetch ${url}`)
    return res.json()
  }

  const {
    data: stagesData = [],
    isLoading: stagesLoading,
    error: stagesError,
    mutate: mutateStages,
  } = useSWR<Stage[]>(token ? "/api/deals/stages" : null, fetchWithAuth)

  const {
    data: dealsData = [],
    isLoading: dealsLoading,
    error: dealsError,
    mutate: mutateDeals,
  } = useSWR<Deal[]>(token ? "/api/deals/get" : null, fetchWithAuth)

  // Combine loading and error states
  const loading = stagesLoading || dealsLoading
  const error = stagesError?.message || dealsError?.message || null

  // Compute stageDeals using memoization
  const stageDeals = useMemo(() => {
    return stagesData.map((stage) => ({
      ...stage,
      deals: dealsData.filter((deal) => deal.dealStage === stage.name),
    }))
  }, [stagesData, dealsData])

  // Compute filters using memoization
  const resolvedFilters = useMemo(
    () => ({
      pipeline: pipelineFilter || undefined,
      category: categoryFilter || undefined,
    }),
    [pipelineFilter, categoryFilter]
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg font-semibold">
        Loading stages and deals...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg font-semibold text-red-600">
        {error}
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
      <div className="p-6 max-w-[1400px] mx-auto w-full">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold text-foreground text-balance">Deals – Kanban</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <AddStagePanel
              onCreated={async () => {
                await mutateStages()
              }}
              getToken={() => token}
            />
            <Button asChild>
              <Link href="/deals/create">Add Deals</Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-x-auto">
          <KanbanBoard
            stages={stagesData}
            deals={dealsData}
            search={search}
            filters={resolvedFilters}
          />
        </main>

        <footer className="mt-6">
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </footer>
      </div>
    </div>
  )
}