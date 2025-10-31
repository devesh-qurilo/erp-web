"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Filter, X } from "lucide-react"
import { useState } from "react"

type Project = {
  category: string
  projectStatus: string | null
  budget: number
}

interface ProjectFiltersProps {
  filters: {
    category: string
    status: string
    budgetRange: { min: number; max: number }
  }
  onFilterChange: (filters: {
    category: string
    status: string
    budgetRange: { min: number; max: number }
  }) => void
  projects: Project[]
}

export default function ProjectFilters({ filters, onFilterChange, projects }: ProjectFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Get unique categories and statuses from projects
  const categories = Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))
  const statuses = [
    { value: "pending", label: "Pending" },
    ...Array.from(
      new Set(
        projects
          .map((p) => p.projectStatus)
          .filter((s): s is string => s != null)
      )
    ).map((status) => ({
      value: status,
      label: status,
    })),
  ]

  const hasActiveFilters = filters.category || filters.status || filters.budgetRange.max !== Number.POSITIVE_INFINITY

  const handleResetFilters = () => {
    onFilterChange({
      category: "",
      status: "",
      budgetRange: { min: 0, max: Number.POSITIVE_INFINITY },
    })
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={hasActiveFilters ? "default" : "outline"} size="sm" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 inline-flex items-center rounded-full bg-primary-foreground text-primary px-2 py-0.5 text-xs font-medium">
              {(filters.category ? 1 : 0) +
                (filters.status ? 1 : 0) +
                (filters.budgetRange.max !== Number.POSITIVE_INFINITY ? 1 : 0)}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Filters</span>
          {hasActiveFilters && (
            <button onClick={handleResetFilters} className="text-xs text-muted-foreground hover:text-foreground">
              <X className="w-3 h-3" />
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Category Filter */}
        <div className="px-2 py-1.5">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Category</p>
          <div className="space-y-1">
            <button
              onClick={() => onFilterChange({ ...filters, category: "" })}
              className={`w-full text-left px-2 py-1.5 text-sm rounded ${
                !filters.category ? "bg-muted text-foreground" : "hover:bg-muted text-foreground"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onFilterChange({ ...filters, category: cat })}
                className={`w-full text-left px-2 py-1.5 text-sm rounded ${
                  filters.category === cat ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Status Filter */}
        <div className="px-2 py-1.5">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Status</p>
          <div className="space-y-1">
            <button
              onClick={() => onFilterChange({ ...filters, status: "" })}
              className={`w-full text-left px-2 py-1.5 text-sm rounded ${
                !filters.status ? "bg-muted text-foreground" : "hover:bg-muted text-foreground"
              }`}
            >
              All Statuses
            </button>
            {statuses.map((stat) => (
              <button
                key={stat.value}
                onClick={() => onFilterChange({ ...filters, status: stat.value })}
                className={`w-full text-left px-2 py-1.5 text-sm rounded ${
                  filters.status === stat.value ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                {stat.label}
              </button>
            ))}
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Budget Range Filter */}
        <div className="px-2 py-1.5">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Budget Range</p>
          <div className="space-y-1">
            <button
              onClick={() =>
                onFilterChange({
                  ...filters,
                  budgetRange: { min: 0, max: Number.POSITIVE_INFINITY },
                })
              }
              className={`w-full text-left px-2 py-1.5 text-sm rounded ${
                filters.budgetRange.max === Number.POSITIVE_INFINITY
                  ? "bg-muted text-foreground"
                  : "hover:bg-muted text-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() =>
                onFilterChange({
                  ...filters,
                  budgetRange: { min: 0, max: 10000 },
                })
              }
              className={`w-full text-left px-2 py-1.5 text-sm rounded ${
                filters.budgetRange.max === 10000 ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              Up to $10,000
            </button>
            <button
              onClick={() =>
                onFilterChange({
                  ...filters,
                  budgetRange: { min: 10000, max: 50000 },
                })
              }
              className={`w-full text-left px-2 py-1.5 text-sm rounded ${
                filters.budgetRange.max === 50000 && filters.budgetRange.min === 10000
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              $10,000 - $50,000
            </button>
            <button
              onClick={() =>
                onFilterChange({
                  ...filters,
                  budgetRange: { min: 50000, max: Number.POSITIVE_INFINITY },
                })
              }
              className={`w-full text-left px-2 py-1.5 text-sm rounded ${
                filters.budgetRange.min === 50000 && filters.budgetRange.max === Number.POSITIVE_INFINITY
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              $50,000+
            </button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
