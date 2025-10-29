"use client"

import { useEffect, useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react"

type Attendance = {
  date: string
  employeeId: string
  employeeName: string
  status: string
  attendanceId: number
  overwritten: boolean
  late: boolean
  halfDay: boolean
  clockInTime: string
  clockInLocation: string
  clockInWorkingFrom: string
  clockOutTime: string
  clockOutLocation: string
  clockOutWorkingFrom: string
  markedById: string
  markedByName: string
  holiday: boolean
  leave: boolean
  isPresent: boolean
}

const STATUS_CONFIG = {
  present: { label: "Present", color: "bg-green-100 text-green-800", symbol: "✓" },
  absent: { label: "Absent", color: "bg-red-100 text-red-800", symbol: "✕" },
  late: { label: "Late", color: "bg-yellow-100 text-yellow-800", symbol: "⏱" },
  halfDay: { label: "Half Day", color: "bg-blue-100 text-blue-800", symbol: "◐" },
  leave: { label: "Leave", color: "bg-purple-100 text-purple-800", symbol: "🏖" },
  holiday: { label: "Holiday", color: "bg-gray-100 text-gray-800", symbol: "★" },
}

const getStatusBadge = (attendance: Attendance) => {
  if (attendance.holiday) return STATUS_CONFIG.holiday
  if (attendance.leave) return STATUS_CONFIG.leave
  if (attendance.halfDay) return STATUS_CONFIG.halfDay
  if (attendance.late) return STATUS_CONFIG.late
  if (attendance.isPresent) return STATUS_CONFIG.present
  return STATUS_CONFIG.absent
}

const ITEMS_PER_PAGE = 10

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem("accessToken")
        if (!token) {
          setError("No access token found. Please login again.")
          setLoading(false)
          return
        }

        const res = await fetch("/api/hr/attendance", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error("Failed to fetch attendance")
        }

        const data = await res.json()
        setAttendance(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAttendance()
  }, [])

  const filteredAttendance = useMemo(() => {
    return attendance.filter((record) => {
      const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase())

      if (statusFilter === "all") return matchesSearch

      const badge = getStatusBadge(record)
      const statusKey = Object.entries(STATUS_CONFIG).find(([_, config]) => config.label === statusFilter)?.[0]

      return matchesSearch && badge === STATUS_CONFIG[statusKey as keyof typeof STATUS_CONFIG]
    })
  }, [attendance, searchTerm, statusFilter])

  const totalPages = Math.ceil(filteredAttendance.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedAttendance = filteredAttendance.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
      </div>
    )
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold">My Attendance</h2>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by employee name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium"
            >
              <option value="all">All Status</option>
              {Object.values(STATUS_CONFIG).map((config) => (
                <option key={config.label} value={config.label}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          <p className="text-sm text-gray-600">
            Showing {paginatedAttendance.length} of {filteredAttendance.length} records
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Employee Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Clock In</TableHead>
              <TableHead>Clock Out</TableHead>
              <TableHead>Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAttendance.length > 0 ? (
              paginatedAttendance.map((a) => {
                const badge = getStatusBadge(a)
                return (
                  <TableRow key={a.attendanceId}>
                    <TableCell className="font-medium">{a.date}</TableCell>
                    <TableCell>{a.employeeName}</TableCell>
                    <TableCell>
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-medium text-sm ${badge.color}`}
                      >
                        <span>{badge.symbol}</span>
                        <span>{badge.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>{a.clockInTime || "-"}</TableCell>
                    <TableCell>{a.clockOutTime || "-"}</TableCell>
                    <TableCell className="text-sm text-gray-600">{a.clockInLocation || "-"}</TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                  No attendance records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {filteredAttendance.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6 bg-gray-50">
        <h3 className="font-semibold mb-4">Status Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${config.color} text-xs font-bold`}
              >
                {config.symbol}
              </div>
              <span className="text-sm font-medium">{config.label}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
