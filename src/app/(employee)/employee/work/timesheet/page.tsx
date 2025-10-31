"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Loader2, Clock, X } from "lucide-react"
import { format } from "date-fns"
import { FilterBar } from "./_components/filter-bar"
import { TimesheetsTable } from "./_components/timesheets-table"
import { PaginationControls } from "./_components/pagination-controls"

type Employee = {
  employeeId: string
  name: string
  profileUrl: string
  designation?: string | null
  department?: string | null
}

type Timesheet = {
  id: number
  projectId: number
  taskId: number
  employeeId: string
  employees: Employee[]
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  memo: string
  durationHours: number
  createdAt: string
}

type DateRange = {
  from: Date | undefined
  to: Date | undefined
}

export default function TimesheetsPage() {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([])
  const [filteredTimesheets, setFilteredTimesheets] = useState<Timesheet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined })
  const [durationFilter, setDurationFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date-desc")

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    const fetchTimesheets = async () => {
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
        setTimesheets(data)
        setFilteredTimesheets(data)
      } catch (err: any) {
        setError(err.message || "Failed to fetch timesheets")
      } finally {
        setLoading(false)
      }
    }

    fetchTimesheets()
  }, [])

  useEffect(() => {
    let result = [...timesheets]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (t) =>
          t.id.toString().includes(query) ||
          t.projectId.toString().includes(query) ||
          t.taskId.toString().includes(query) ||
          t.employees?.[0]?.name?.toLowerCase().includes(query) ||
          t.memo?.toLowerCase().includes(query),
      )
    }

    if (dateRange.from) {
      result = result.filter((t) => {
        const timesheetDate = new Date(t.startDate)
        return timesheetDate >= dateRange.from!
      })
    }

    if (dateRange.to) {
      result = result.filter((t) => {
        const timesheetDate = new Date(t.startDate)
        return timesheetDate <= dateRange.to!
      })
    }

    if (durationFilter !== "all") {
      result = result.filter((t) => {
        const hours = t.durationHours
        switch (durationFilter) {
          case "short":
            return hours < 4
          case "medium":
            return hours >= 4 && hours < 8
          case "long":
            return hours >= 8
          default:
            return true
        }
      })
    }

    switch (sortBy) {
      case "date-desc":
        result.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
        break
      case "date-asc":
        result.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        break
      case "duration-desc":
        result.sort((a, b) => b.durationHours - a.durationHours)
        break
      case "duration-asc":
        result.sort((a, b) => a.durationHours - b.durationHours)
        break
    }

    setFilteredTimesheets(result)
    setCurrentPage(1)
  }, [searchQuery, dateRange, durationFilter, sortBy, timesheets])

  const clearFilters = () => {
    setSearchQuery("")
    setDateRange({ from: undefined, to: undefined })
    setDurationFilter("all")
    setSortBy("date-desc")
  }

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Project ID",
      "Task ID",
      "Employee",
      "Start Date",
      "Start Time",
      "End Date",
      "End Time",
      "Duration (hrs)",
      "Memo",
      "Created At",
    ]
    const rows = filteredTimesheets.map((t) => [
      t.id,
      t.projectId,
      t.taskId,
      t.employees?.[0]?.name || "N/A",
      t.startDate,
      t.startTime,
      t.endDate,
      t.endTime,
      t.durationHours,
      t.memo,
      new Date(t.createdAt).toLocaleString(),
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `timesheets-${format(new Date(), "yyyy-MM-dd")}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getTotalHours = () => {
    return filteredTimesheets.reduce((sum, t) => sum + t.durationHours, 0).toFixed(2)
  }

  const hasActiveFilters = Boolean(
    searchQuery || dateRange.from || dateRange.to || durationFilter !== "all" || sortBy !== "date-desc"
  )

  const totalPages = Math.ceil(filteredTimesheets.length / itemsPerPage)
  const paginatedTimesheets = filteredTimesheets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin w-8 h-8 text-primary" />
          <p className="text-sm text-muted-foreground">Loading timesheets...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <X className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Error Loading Timesheets</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Clock className="w-7 h-7 text-primary" />
              </div>
              Timesheets
            </h1>
            <p className="text-muted-foreground mt-2">Track and manage your time entries across projects</p>
          </div>

          <Card className="border-0 bg-gradient-to-br from-primary/5 to-primary/10 shadow-sm">
            <CardContent className="pt-4 pb-4 px-6">
              <div className="text-sm font-medium text-muted-foreground">Total Hours Logged</div>
              <div className="text-3xl font-bold text-primary mt-1">{getTotalHours()}h</div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm border">
          <CardHeader className="border-b bg-muted/50 pb-4">
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              durationFilter={durationFilter}
              onDurationChange={setDurationFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
              filteredCount={filteredTimesheets.length}
              totalCount={timesheets.length}
              onExport={exportToCSV}
            />
          </CardHeader>

          <CardContent className="p-0">
            <TimesheetsTable
              timesheets={paginatedTimesheets}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
            />
          </CardContent>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredTimesheets.length}
          />
        </Card>
      </div>
    </div>
  )
}
