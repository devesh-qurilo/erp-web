"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react"
import ProjectFilters from "./_components/project-filters"


type Employee = {
  employeeId: string
  name: string
  profileUrl: string
  designation: string
  department: string
}

type CompanyFile = {
  id: number
  filename: string
  url: string
  mimeType: string
  size: number
  uploadedBy: string
}

type Project = {
  id: number
  shortCode: string
  name: string
  startDate: string
  deadline: string | null
  category: string
  currency: string
  budget: number
  clientId: string
  summary: string
  pinned: boolean
  companyFiles: CompanyFile[]
  assignedEmployees: Employee[]
  createdAt: string
  projectStatus: string | null
}

const ITEMS_PER_PAGE = 10

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const [filters, setFilters] = useState({
    category: "",
    status: "",
    budgetRange: { min: 0, max: Number.POSITIVE_INFINITY },
  })

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("accessToken")
        const res = await fetch("/api/work/project/employee", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`)
        }

        const data = await res.json()
        setProjects(data)
      } catch (err: any) {
        setError(err.message || "Failed to fetch projects")
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.clientId.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = !filters.category || project.category === filters.category

      const matchesStatus =
        !filters.status ||
        (filters.status === "pending" ? !project.projectStatus : project.projectStatus === filters.status)

      const matchesBudget = project.budget >= filters.budgetRange.min && project.budget <= filters.budgetRange.max

      return matchesSearch && matchesCategory && matchesStatus && matchesBudget
    })
  }, [projects, searchQuery, filters])

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin w-6 h-6 mr-2" /> Loading projects...
      </div>
    )
  }

  if (error) {
    return <div className="text-destructive text-center mt-10 p-4 bg-destructive/10 rounded-lg">{error}</div>
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Projects</h1>
          <p className="text-muted-foreground">Manage and track your ongoing projects</p>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by project name, code, or client ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>
            <ProjectFilters filters={filters} onFilterChange={handleFilterChange} projects={projects} />
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              {filteredProjects.length} of {projects.length} projects
            </span>
          </div>
        </div>

        {/* Main content */}
        {filteredProjects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No projects found matching your filters.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="border border-border shadow-sm">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold">Code</TableHead>
                      <TableHead className="font-semibold">Project Name</TableHead>
                      <TableHead className="font-semibold">Category</TableHead>
                      <TableHead className="font-semibold text-right">Budget</TableHead>
                      <TableHead className="font-semibold">Client</TableHead>
                      <TableHead className="font-semibold">Created</TableHead>
                      <TableHead className="font-semibold">Team</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProjects.map((p) => (
                      <TableRow key={p.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono text-sm font-medium">{p.shortCode}</TableCell>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent-foreground">
                            {p.category}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {p.currency} {p.budget.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{p.clientId}</TableCell>
                        <TableCell className="text-sm">{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex -space-x-2">
                            {p.assignedEmployees?.slice(0, 3).map((emp) => (
                              <img
                                key={emp.employeeId}
                                src={emp.profileUrl || "/placeholder.svg"}
                                alt={emp.name}
                                title={emp.name}
                                className="w-8 h-8 rounded-full border-2 border-background ring-1 ring-border"
                              />
                            ))}
                            {p.assignedEmployees?.length > 3 && (
                              <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                                +{p.assignedEmployees.length - 3}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {p.projectStatus ? (
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                              {p.projectStatus}
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                              Pending
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages} • {filteredProjects.length} results
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
