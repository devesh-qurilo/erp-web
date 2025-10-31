"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Loader2, Search, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedBudgetRange, setSelectedBudgetRange] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)

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
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.shortCode.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = selectedCategory === "all" || project.category === selectedCategory

      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "pending" ? !project.projectStatus : project.projectStatus === selectedStatus)

      let matchesBudget = true
      if (selectedBudgetRange !== "all") {
        const budget = project.budget
        switch (selectedBudgetRange) {
          case "0-10k":
            matchesBudget = budget < 10000
            break
          case "10k-50k":
            matchesBudget = budget >= 10000 && budget < 50000
            break
          case "50k-100k":
            matchesBudget = budget >= 50000 && budget < 100000
            break
          case "100k+":
            matchesBudget = budget >= 100000
            break
        }
      }

      return matchesSearch && matchesCategory && matchesStatus && matchesBudget
    })
  }, [projects, searchTerm, selectedCategory, selectedStatus, selectedBudgetRange])

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE)
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    return filteredProjects.slice(start, end)
  }, [filteredProjects, currentPage])

  const categories = useMemo(() => {
    return Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))
  }, [projects])

  const statuses = useMemo(() => {
    const statusSet = new Set<string>()
    projects.forEach((p) => {
      if (p.projectStatus) {
        statusSet.add(p.projectStatus)
      } else {
        statusSet.add("pending")
      }
    })
    return Array.from(statusSet)
  }, [projects])

  const handleReset = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setSelectedStatus("all")
    setSelectedBudgetRange("all")
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
    return <div className="text-red-500 text-center mt-10">{error}</div>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Projects Roadmap</h1>
        <p className="text-muted-foreground">Manage and track all your projects</p>
      </div>

      <Card className="mb-6 border-border">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by project name or code..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 bg-secondary/30"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Select
                value={selectedCategory}
                onValueChange={(value) => {
                  setSelectedCategory(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="bg-secondary/30">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedStatus}
                onValueChange={(value) => {
                  setSelectedStatus(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="bg-secondary/30">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedBudgetRange}
                onValueChange={(value) => {
                  setSelectedBudgetRange(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="bg-secondary/30">
                  <SelectValue placeholder="Budget Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Budgets</SelectItem>
                  <SelectItem value="0-10k">Under $10k</SelectItem>
                  <SelectItem value="10k-50k">$10k - $50k</SelectItem>
                  <SelectItem value="50k-100k">$50k - $100k</SelectItem>
                  <SelectItem value="100k+">$100k+</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={handleReset} className="w-full bg-transparent">
                <X className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>

            {/* Results Info */}
            <div className="text-sm text-muted-foreground">
              Showing {paginatedProjects.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredProjects.length)} of {filteredProjects.length} projects
            </div>
          </div>
        </CardContent>
      </Card>

      {paginatedProjects.length === 0 ? (
        <Card className="border-border">
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">No projects found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="font-semibold">Code</TableHead>
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Category</TableHead>
                      <TableHead className="font-semibold">Budget</TableHead>
                      <TableHead className="font-semibold">Created</TableHead>
                      <TableHead className="font-semibold">Team</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProjects.map((project) => (
                      <TableRow key={project.id} className="border-border hover:bg-secondary/20">
                        <TableCell className="font-medium text-primary">{project.shortCode}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{project.name}</span>
                            <span className="text-xs text-muted-foreground">Client: {project.clientId}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground">
                            {project.category}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {project.currency} {project.budget.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex -space-x-2">
                            {project.assignedEmployees?.slice(0, 3).map((emp) => (
                              <img
                                key={emp.employeeId}
                                src={emp.profileUrl || "/placeholder.svg"}
                                alt={emp.name}
                                title={emp.name}
                                className="w-8 h-8 rounded-full border-2 border-background shadow-sm"
                              />
                            ))}
                            {project.assignedEmployees && project.assignedEmployees.length > 3 && (
                              <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                                +{project.assignedEmployees.length - 3}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              project.projectStatus
                                ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                            }`}
                          >
                            {project.projectStatus || "Pending"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))
                    .map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
