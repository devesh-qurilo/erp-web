"use client"

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Clock, AlertCircle } from "lucide-react"

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

type TimesheetsTableProps = {
  timesheets: Timesheet[]
  hasActiveFilters: boolean
  onClearFilters?: () => void
}

export function TimesheetsTable({ timesheets, hasActiveFilters, onClearFilters }: TimesheetsTableProps) {
  if (timesheets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No timesheets found</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
          {hasActiveFilters
            ? "No timesheets match your current filters. Try adjusting your search criteria."
            : "No timesheet entries have been created yet."}
        </p>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            <AlertCircle className="w-4 h-4" />
            Clear all filters
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b-2">
            <TableHead className="font-semibold text-xs uppercase tracking-wider">ID</TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider">Project</TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider">Task</TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider">Employee</TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider">Start</TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider">End</TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider">Duration</TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider">Memo</TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {timesheets.map((t) => (
            <TableRow key={t.id} className="hover:bg-muted/50 transition-colors border-b">
              <TableCell className="font-semibold text-primary">#{t.id}</TableCell>
              <TableCell>
                <Badge variant="outline" className="font-medium">
                  P-{t.projectId}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-medium">
                  T-{t.taskId}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  {t.employees?.[0]?.profileUrl ? (
                    <img
                      src={t.employees[0].profileUrl || "/placeholder.svg"}
                      alt={t.employees[0].name}
                      className="w-8 h-8 rounded-full border border-border shadow-sm object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-border shadow-sm">
                      <span className="text-xs font-semibold text-primary">
                        {t.employees?.[0]?.name?.charAt(0) || "?"}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-sm truncate">{t.employees?.[0]?.name || "N/A"}</span>
                    {t.employees?.[0]?.designation && (
                      <span className="text-xs text-muted-foreground truncate">{t.employees[0].designation}</span>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{t.startDate}</span>
                  <span className="text-xs text-muted-foreground">{t.startTime}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{t.endDate}</span>
                  <span className="text-xs text-muted-foreground">{t.endTime}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={t.durationHours >= 8 ? "default" : t.durationHours >= 4 ? "secondary" : "outline"}
                  className="font-semibold"
                >
                  {t.durationHours}h
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs">
                <p className="text-sm text-muted-foreground truncate" title={t.memo}>
                  {t.memo || "—"}
                </p>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {format(new Date(t.createdAt), "MMM dd, yyyy")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
