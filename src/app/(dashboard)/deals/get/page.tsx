"use client"

import { useEffect } from "react"

import useSWR from "swr"
import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

type Deal = {
  id: string
  title: string
  value: number
  dealStage: string
  dealCategory: string
  pipeline: string
  dealAgent: string
  dealAgentMeta?: {
    name: string
    profileUrl?: string
  }
  createdAt: string
}

export default function DealsPage() {
  const [token, setToken] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [stage, setStage] = useState<string>("all")

  useEffect(() => {
    // only reading token; no data fetching here
    const t = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
    setToken(t)
  }, [])

  const fetcher = async (url: string) => {
    if (!token) throw new Error("No access token found. Please log in.")
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error("Failed to fetch deals")
    return (await res.json()) as Deal[]
  }

  const { data: deals = [], error, isLoading } = useSWR(token ? "/api/deals/get" : null, fetcher)

  const stages = useMemo(() => {
    const s = new Set<string>()
    for (const d of deals) {
      if (d.dealStage) s.add(d.dealStage)
    }
    return Array.from(s.values()).sort()
  }, [deals])

  const filteredDeals = useMemo(() => {
    const q = query.trim().toLowerCase()
    return deals.filter((d) => {
      const matchesStage = stage === "all" || (d.dealStage || "").toLowerCase() === stage.toLowerCase()
      const hay = [d.title, d.dealAgentMeta?.name, d.dealAgent, d.dealCategory, d.pipeline, d.id]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      const matchesQuery = q.length === 0 || hay.includes(q)
      return matchesStage && matchesQuery
    })
  }, [deals, query, stage])

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-lg font-semibold">Loading deals...</div>
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-lg font-semibold text-destructive">
        {(error as Error).message || "Failed to load deals. Please try again later."}
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-pretty text-3xl font-bold">Deals</h1>
        <div className="flex w-full flex-col gap-3 md:max-w-2xl md:flex-row">
          <div className="flex-1">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, agent, category, pipeline, or ID"
              aria-label="Search deals"
            />
          </div>
          <Select value={stage} onValueChange={setStage}>
            <SelectTrigger className="w-full md:w-48" aria-label="Filter by stage">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stages</SelectItem>
              {stages.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button asChild>
            <Link href="/deals/create">Add Deals</Link>
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[220px]">Deal</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Pipeline</TableHead>
              <TableHead className="min-w-[180px]">Agent</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDeals.map((deal) => (
              <TableRow key={deal.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                 
                    <div className="min-w-0">
                      <Link href={`/deals/get/${deal.id}`} className="line-clamp-1 font-medium hover:underline">
                        {deal.title}
                      </Link>
                      <div className="text-xs text-muted-foreground">ID: {deal.id}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>${deal.value.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={deal.dealStage?.toUpperCase() === "WIN" ? "default" : "secondary"}>
                    {deal.dealStage}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap">{deal.dealCategory}</TableCell>
                <TableCell className="whitespace-nowrap">{deal.pipeline}</TableCell>
                <TableCell className="min-w-[180px]">{deal.dealAgentMeta?.name || deal.dealAgent}</TableCell>
                <TableCell className="whitespace-nowrap">{new Date(deal.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="sm">
                        :
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/deals/get/${deal.id}`}>View</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/deals/create/${deal.id}`}>Edit</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => console.log("[v0] Delete clicked for deal:", deal.id)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredDeals.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
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
  )
}
