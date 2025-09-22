"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, List, Grid3X3, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react"

interface Department {
  id: number
  name: string
  parentDepartment: string
}

const departments: Department[] = [
  { id: 1, name: "Sales", parentDepartment: "--" },
  { id: 2, name: "Research", parentDepartment: "--" },
  { id: 3, name: "Marketing", parentDepartment: "--" },
  { id: 4, name: "Human Resources", parentDepartment: "--" },
  { id: 5, name: "Finance", parentDepartment: "--" },
]

export function DepartmentManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  const filteredDepartments = departments.filter((dept) => dept.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Department
        </Button>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          <div className="flex gap-1">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-purple-500 hover:bg-purple-600" : ""}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-purple-500 hover:bg-purple-600" : ""}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <Card className="border-2 border-blue-200">
        <Table>
          <TableHeader className="bg-blue-50">
            <TableRow>
              <TableHead className="font-medium text-gray-700">Name</TableHead>
              <TableHead className="font-medium text-gray-700">Parent Department</TableHead>
              <TableHead className="font-medium text-gray-700">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDepartments.map((department) => (
              <TableRow key={department.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{department.name}</TableCell>
                <TableCell className="text-gray-500">{department.parentDepartment}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>Result per page - {filteredDepartments.length}</div>
        <div className="flex items-center gap-4">
          <span>Page 1 of 1</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" disabled>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" disabled>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
