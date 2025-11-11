"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  ArrowLeft,
  FileText,
  Users,
  Calendar,
  DollarSign,
  Clock,
  User,
  Pin,
  Archive,
  BarChart3,
  FileImage,
  File,
  TrendingUp,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Document, Page, pdfjs } from "react-pdf"
import { StatCard } from "../_components/stat-card"



type Employee = {
  employeeId: string
  name: string
  profileUrl: string
  designation: string | null
  department: string | null
}

type Client = {
  clientId: string
  name: string
  profilePictureUrl: string
}

type CompanyFile = {
  id: number
  projectId: number
  taskId: number | null
  filename: string
  bucket: string
  path: string
  url: string
  mimeType: string
  size: number
  uploadedBy: string
  createdAt: string | null
}

type Project = {
  id: number
  shortCode: string
  name: string
  startDate: string
  deadline: string | null
  noDeadline: boolean
  category: string
  departmentId: number
  clientId: string
  client: Client
  summary: string
  tasksNeedAdminApproval: boolean
  companyFiles: CompanyFile[]
  currency: string
  budget: number
  hoursEstimate: number
  allowManualTimeLogs: boolean
  addedBy: string
  companyFile: any | null
  assignedEmployeeIds: string[]
  assignedEmployees: Employee[]
  projectStatus: string
  progressPercent: number
  calculateProgressThroughTasks: boolean
  createdBy: string
  createdAt: string
  updatedBy: string
  updatedAt: string
  totalTimeLoggedMinutes: number | null
  expenses: any | null
  profit: any | null
  earning: any | null
  pinned: boolean
  pinnedAt: string | null
  archived: boolean
  archivedAt: string | null
}

const timeLogData = [
  { month: "Jan", hours: 40 },
  { month: "Feb", hours: 60 },
  { month: "Mar", hours: 45 },
  { month: "Apr", hours: 80 },
]

function FilePreview({ file }: { file: CompanyFile }) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const isImage = file.mimeType.startsWith("image/")
  const isPDF = file.mimeType === "application/pdf"

  if (isImage) {
    return (
      <div className="relative group">
        <img
          src={file.url || "/placeholder.svg"}
          alt={file.filename}
          className="w-full h-48 object-cover rounded-md border border-(--color-border)"
        />
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-black/50 rounded-md transition"
        >
          <FileImage className="w-6 h-6 text-white" />
        </a>
      </div>
    )
  }

  if (isPDF) {
    return (
      <div className="border border-(--color-border) rounded-md overflow-hidden">
        <Document file={file.url} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
          <Page pageNumber={pageNumber} width={300} />
        </Document>
        {numPages > 1 && (
          <div className="flex justify-center space-x-2 p-2 bg-(--color-surface)">
            <Button variant="outline" size="sm" onClick={() => setPageNumber(Math.max(pageNumber - 1, 1))}>
              Prev
            </Button>
            <span className="self-center text-sm text-gray-700">
              Page {pageNumber} of {numPages}
            </span>
            <Button variant="outline" size="sm" onClick={() => setPageNumber(Math.min(pageNumber + 1, numPages))}>
              Next
            </Button>
          </div>
        )}
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center p-2 text-sm text-(--color-primary) hover:underline"
        >
          Open Full PDF
        </a>
      </div>
    )
  }

  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 p-3 border border-(--color-border) rounded-md hover:bg-(--color-surface) transition"
    >
      <File className="w-4 h-4 text-gray-600" />
      <span className="text-sm font-medium text-gray-900">{file.filename}</span>
    </a>
  )
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem("accessToken")
        const res = await fetch(`/api/work/project/employee/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) throw new Error(`Error ${res.status}`)
        const data = await res.json()
        setProject(data)
      } catch (err: any) {
        setError(err.message || "Failed to fetch project details")
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-(--color-surface)">
        <div className="text-center">
          <Loader2 className="animate-spin w-8 h-8 mr-2 mx-auto text-(--color-primary) mb-3" />
          <span className="text-gray-700">Loading project details...</span>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-(--color-surface)">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center text-(--color-destructive)">
            {error || "Project not found."}
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalHours = project.totalTimeLoggedMinutes ? Math.round(project.totalTimeLoggedMinutes / 60) : 0
  const budgetUtilized = project.budget * (project.progressPercent / 100)

  return (
    <div className="min-h-screen bg-(--color-surface)">
      {/* Header */}
      <div className="border-b border-(--color-border) bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="gap-2 text-gray-700 hover:text-gray-900 hover:bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="uppercase text-xs font-semibold">
                {project.projectStatus || "Pending"}
              </Badge>
              {project.pinned && (
                <Badge className="gap-1 bg-(--color-accent-light) text-(--color-accent) border-0">
                  <Pin className="w-3 h-3" /> Pinned
                </Badge>
              )}
              {project.archived && (
                <Badge variant="destructive" className="gap-1">
                  <Archive className="w-3 h-3" /> Archived nandiuni
                </Badge>
              )}
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-1">{project.name}</h1>
            <p className="text-sm text-gray-700 font-mono">{project.shortCode}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 text-gray-900 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Budget"
            value={`${project.currency} ${project.budget.toLocaleString()}`}
            icon={DollarSign}
            subtext={`Utilized: ${project.currency} ${Math.round(budgetUtilized).toLocaleString()}`}
          />
          <StatCard
            title="Hours Estimate"
            value={`${project.hoursEstimate}h`}
            icon={Clock}
            subtext={`Logged: ${totalHours}h`}
            variant="accent"
          />
          <StatCard title="Progress" value={`${project.progressPercent}%`} icon={TrendingUp} />
          <StatCard
            title="Team Size"
            value={project.assignedEmployees?.length || 0}
            icon={Users}
            subtext="members assigned"
          />
        </div>

        <Separator className="bg-(--color-border)" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Info */}
          <Card className="lg:col-span-2 border-(--color-border) shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="w-5 h-5 text-(--color-primary)" /> Project Overview mmmmmmmm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {/* Timeline Section */}
                <div className="pb-4 border-b border-(--color-border)">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-(--color-primary)" />
                    Timeline
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 text-xs uppercase tracking-wide mb-1">Start Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(project.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs uppercase tracking-wide mb-1">Deadline</p>
                      <p className="font-medium text-gray-900">
                        {!project.noDeadline && project.deadline
                          ? new Date(project.deadline).toLocaleDateString()
                          : "No Deadline"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Client Section */}
                <div className="pb-4 border-b border-(--color-border)">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-(--color-primary)" />
                    Client
                  </h3>
                  <div className="flex items-center gap-3 p-3 bg-(--color-surface) rounded-lg border border-(--color-border)">
                    {project.client.profilePictureUrl && (
                      <img
                        src={project.client.profilePictureUrl || "/placeholder.svg"}
                        alt={project.client.name}
                        className="w-12 h-12 rounded-full border-2 border-(--color-border)"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{project.client.name}</p>
                      <p className="text-xs text-gray-600 font-mono">{project.clientId}</p>
                    </div>
                  </div>
                </div>

                {/* Summary Section */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Summary</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{project.summary}</p>
                </div>

                {/* Progress Bar */}
                {project.progressPercent > 0 && (
                  <div className="pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">Overall Progress</span>
                      <Badge className="bg-(--color-primary-light) text-(--color-primary-dark) border-0">
                        {project.progressPercent}%
                      </Badge>
                    </div>
                    <Progress value={project.progressPercent} className="h-2 bg-(--color-border)" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Charts Section */}
          <Card className="border-(--color-border) shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <BarChart3 className="w-5 h-5 text-(--color-primary)" /> Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Budget Utilization Bar */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-(--color-primary)" /> Budget Utilization
                </h4>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={[
                      { category: "Allocated", value: project.budget },
                      { category: "Utilized", value: budgetUtilized },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="category" tick={{ fill: "#374151", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#374151", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "0.5rem" }}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Time Logged Bar */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-(--color-accent)" /> Time Tracking
                </h4>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={timeLogData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fill: "#374151", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#374151", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "0.5rem" }}
                    />
                    <Bar dataKey="hours" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="bg-(--color-border)" />

        {/* Team Section */}
        <Card className="border-(--color-border) shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="w-5 h-5 text-(--color-primary)" /> Team Members
            </CardTitle>
            <Badge variant="outline" className="text-xs font-semibold">
              {project.assignedEmployees?.length || 0} Members
            </Badge>
          </CardHeader>
          <CardContent>
            {project.assignedEmployees?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {project.assignedEmployees.map((emp) => (
                  <div
                    key={emp.employeeId}
                    className="flex items-center gap-3 p-3 border border-(--color-border) rounded-lg hover:bg-(--color-surface) transition-colors"
                  >
                    <img
                      src={emp.profileUrl || "/placeholder.svg"}
                      alt={emp.name}
                      className="w-12 h-12 rounded-full border-2 border-(--color-border) flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-gray-900 truncate">{emp.name}</p>
                      {emp.designation && <p className="text-xs text-gray-600 truncate">{emp.designation}</p>}
                      {emp.department && <p className="text-xs text-gray-600 truncate">{emp.department}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-600">No team members assigned yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Files Section */}
        <Card className="border-(--color-border) shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="w-5 h-5 text-(--color-primary)" /> Project Files
            </CardTitle>
            <Badge variant="outline" className="text-xs font-semibold">
              {project.companyFiles?.length || 0} Files
            </Badge>
          </CardHeader>
          <CardContent>
            {project.companyFiles?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.companyFiles.map((file) => (
                  <div
                    key={file.id}
                    className="space-y-3 border border-(--color-border) rounded-lg p-4 hover:border-(--color-primary)/30 transition-colors"
                  >
                    <FilePreview file={file} />
                    <div className="text-xs space-y-2">
                      <p className="font-medium text-gray-900 truncate">{file.filename}</p>
                      <p className="text-gray-600">
                        {file.mimeType} • {(file.size / 1024).toFixed(1)} KB
                      </p>
                      <p className="text-gray-600">Uploaded by {file.uploadedBy}</p>
                      {file.createdAt && (
                        <p className="text-gray-600">{new Date(file.createdAt).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No files uploaded yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}