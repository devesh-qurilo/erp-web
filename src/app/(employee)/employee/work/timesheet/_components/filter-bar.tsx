"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Download, CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

type DateRange = {
  from: Date | undefined
  to: Date | undefined
}

type FilterBarProps = {
  searchQuery: string
  onSearchChange: (value: string) => void
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  durationFilter: string
  onDurationChange: (value: string) => void
  sortBy: string
  onSortChange: (value: string) => void
  hasActiveFilters: boolean
  onClearFilters: () => void
  filteredCount: number
  totalCount: number
  onExport: () => void
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  durationFilter,
  onDurationChange,
  sortBy,
  onSortChange,
  hasActiveFilters,
  onClearFilters,
  filteredCount,
  totalCount,
  onExport,
}: FilterBarProps) {
  return (
    <div className="space-y-4">
      {/* Search and Export Row */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, project, employee, or memo..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-10 bg-background"
          />
        </div>
        <Button onClick={onExport} variant="outline" className="gap-2 h-10 whitespace-nowrap bg-transparent">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
        <div className="flex flex-wrap gap-2 flex-1">
          {/* Date Range Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("gap-2 h-10", (dateRange.from || dateRange.to) && "bg-primary/10 border-primary")}
              >
                <CalendarIcon className="w-4 h-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM dd, yyyy")
                  )
                ) : (
                  "Date Range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => onDateRangeChange({ from: range?.from, to: range?.to })}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {/* Duration Filter */}
          <Select value={durationFilter} onValueChange={onDurationChange}>
            <SelectTrigger className={cn("h-10 w-[140px]", durationFilter !== "all" && "bg-primary/10 border-primary")}>
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Durations</SelectItem>
              <SelectItem value="short">Short (&lt;4h)</SelectItem>
              <SelectItem value="medium">Medium (4-8h)</SelectItem>
              <SelectItem value="long">Long (≥8h)</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="h-10 w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Date (Newest)</SelectItem>
              <SelectItem value="date-asc">Date (Oldest)</SelectItem>
              <SelectItem value="duration-desc">Duration (High)</SelectItem>
              <SelectItem value="duration-asc">Duration (Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="gap-2 h-10 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Filter Info and Results Count */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="secondary" className="font-normal">
          {filteredCount} {filteredCount === 1 ? "entry" : "entries"}
        </Badge>
        {hasActiveFilters && <span className="text-xs text-muted-foreground">filtered from {totalCount} total</span>}
      </div>
    </div>
  )
}
