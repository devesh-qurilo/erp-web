"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Filter, MoreHorizontal, Eye, Edit, TrendingUp, Trash2, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Company {
  companyName: string
  city?: string
  state?: string
}

interface Client {
  id: string
  name: string
  clientId: string
  profilePictureUrl?: string | null
  email: string
  mobile?: string | null
  country?: string | null
  category?: string | null
  subCategory?: string | null
  company?: Company | null
  companyLogoUrl?: string | null
  status: "ACTIVE" | "INACTIVE" | string
  addedBy: string
  createdAt?: string | null
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // existing filters/pagination (kept unchanged)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [searchQuery /* kept for internal use */ , setSearchQuery] = useState("")

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // header filter drawer state and its form fields
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false)
  const [dateFilterOn, setDateFilterOn] = useState("Created")
  const [clientNameFilter, setClientNameFilter] = useState("All")
  const [headerCategoryFilter, setHeaderCategoryFilter] = useState("All")

  // placeholder avatar using uploaded screenshot path
  const placeholderImg = "/mnt/data/Screenshot 2025-11-25 120245.png"

  async function fetchClients() {
    setLoading(true)
    try {
      const response = await fetch("/api/clients", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
      })
      if (!response.ok) throw new Error("Failed to fetch clients")
      const data = await response.json()
      setClients(data)
      setFilteredClients(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  // Action handlers (unchanged)
  const handleView = (client: Client) => (window.location.href = `/clients/${client.id}`)
  const handleEdit = (client: Client) => (window.location.href = `/clients/${client.id}/edit`)
  const handleMoveToDeal = (client: Client) => (window.location.href = `/deals/new?clientId=${client.id}`)

  const handleDelete = async (client: Client) => {
    if (!confirm(`Are you sure you want to delete ${client.name}?`)) return
    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}` },
      })
      if (!response.ok) throw new Error("Failed to delete client")
      fetchClients()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete client")
    }
  }

  // Filtering pipeline (kept behavior - includes header drawer filters)
  useEffect(() => {
    let result = [...clients]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.clientId.toLowerCase().includes(q) ||
          c.company?.companyName.toLowerCase().includes(q) ||
          (c.mobile ?? "").toLowerCase().includes(q)
      )
    }

    if (statusFilter !== "all") result = result.filter((c) => c.status === statusFilter)
    if (categoryFilter !== "all") result = result.filter((c) => c.category === categoryFilter)
    if (clientNameFilter !== "All") result = result.filter((c) => c.name === clientNameFilter)
    if (headerCategoryFilter !== "All") result = result.filter((c) => c.category === headerCategoryFilter)

    setFilteredClients(result)
    setCurrentPage(1)
  }, [searchQuery, statusFilter, categoryFilter, clients, clientNameFilter, headerCategoryFilter])

  // unique lists used in header drawer
  const categories = Array.from(new Set(clients.map((c) => c.category).filter(Boolean)))
  const clientNames = Array.from(new Set(clients.map((c) => c.name).filter(Boolean)))

  // pagination helpers
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedClients = filteredClients.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => setCurrentPage(page)
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  const clearHeaderFilters = () => {
    setDateFilterOn("Created")
    setClientNameFilter("All")
    setHeaderCategoryFilter("All")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading clients...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Top header line */}
      <div className="mb-4 flex items-center justify-between bg-white/60 px-3 py-2 rounded-md border border-slate-200">
        <div className="text-sm text-slate-600">
          Added on <span className="ml-2 text-slate-700">Start Date to End Date</span>
        </div>

        <div>
          <Button variant="ghost" size="sm" className="h-8" onClick={() => setShowFiltersDrawer(true)}>
            <Filter className="h-4 w-4 mr-2" /> Filters
          </Button>
        </div>
      </div>

      {/* Add client row */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <Link href="/clients/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">+ Add Client</Button>
          </Link>
        </div>
        <div /> {/* search removed per previous request */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Clients ({filteredClients.length})</CardTitle>
          <CardDescription>
            Showing {startIndex + 1}-{Math.min(endIndex, filteredClients.length)} of {filteredClients.length} clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {/* Updated header columns exactly as requested */}
                  <TableHead>Client ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[80px]">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No clients found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="text-sm text-slate-700">{client.clientId}</div>
                      </TableCell>

                      <TableCell>
                        <Link href={`/clients/${client.id}`}>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={client.profilePictureUrl || placeholderImg} alt={client.name} />
                              <AvatarFallback>
                                {client.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{client.name}</div>
                              {client.company?.companyName && (
                                <div className="text-xs text-muted-foreground">{client.company.companyName}</div>
                              )}
                            </div>
                          </div>
                        </Link>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">{client.email}</div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">{client.mobile ?? "—"}</div>
                      </TableCell>

                      <TableCell>
                        {client.category ? (
                          <div className="space-y-1">
                            <Badge variant="secondary">{client.category}</Badge>
                            {client.subCategory && (
                              <div className="text-xs text-muted-foreground">{client.subCategory}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : "—"}
                        </div>
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(client)}>
                              <Eye className="h-4 w-4 mr-2" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(client)}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleMoveToDeal(client)}>
                              <TrendingUp className="h-4 w-4 mr-2" /> Move to Deal
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(client)} className="text-destructive focus:text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
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

          {/* Pagination Controls (unchanged) */}
          {filteredClients.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Result per page -</span>
                <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                      return (
                        <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" onClick={() => handlePageChange(page)} className="w-10">
                          {page}
                        </Button>
                      )
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2">...</span>
                    }
                    return null
                  })}
                </div>
                <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters Drawer */}
      {showFiltersDrawer && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowFiltersDrawer(false)} />
          <div className="relative ml-auto w-72 bg-white h-full border-l border-slate-200 shadow-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-slate-800 font-medium">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </div>
              <button onClick={() => setShowFiltersDrawer(false)} className="text-slate-500"><X /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-600 block mb-1">Date Filter On</label>
                <select value={dateFilterOn} onChange={(e) => setDateFilterOn(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white">
                  <option>Created</option>
                  <option>Updated</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-600 block mb-1">Client Name</label>
                <select value={clientNameFilter} onChange={(e) => setClientNameFilter(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white">
                  <option>All</option>
                  {clientNames.map((n) => <option key={n}>{n}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-600 block mb-1">Category</label>
                <select value={headerCategoryFilter} onChange={(e) => setHeaderCategoryFilter(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white">
                  <option>All</option>
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="absolute bottom-6 right-4">
              <button onClick={clearHeaderFilters} className="px-4 py-2 border rounded-md text-blue-600">Clear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
