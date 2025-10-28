"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ProjectData {
  projectName: string
  shortCode: string
  startDate: string
  deadline: string
  noDeadline: boolean
  projectCategory: string
  departmentId: string
  clientId: string
  assignedEmployeeIds: string
  projectSummary: string
  currency: string
  projectBudget: string
  hoursEstimate: string
  tasksNeedAdminApproval: boolean
  allowManualTimeLogs: boolean
}

export default function EditProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")
  const [projectData, setProjectData] = useState<ProjectData | null>(null)

  useEffect(() => {
    const fetchProject = async () => {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        setMessage("No token found!")
        setMessageType("error")
        setFetching(false)
        return
      }

      try {
        const res = await fetch(`/api/work/project?id=${projectId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await res.json()

        if (!res.ok) {
          const errorMsg =
            typeof data?.error === "string"
              ? data.error
              : data?.error?.message || data?.message || "Failed to fetch project"
          setMessage(errorMsg)
          setMessageType("error")
        } else {
          // Assuming the API returns a single project or array with one item
          const project = Array.isArray(data) ? data[0] : data
          setProjectData({
            projectName: project.projectName || "",
            shortCode: project.shortCode || "",
            startDate: project.startDate ? project.startDate.split("T")[0] : "",
            deadline: project.deadline ? project.deadline.split("T")[0] : "",
            noDeadline: project.noDeadline || false,
            projectCategory: project.projectCategory || "",
            departmentId: project.departmentId || "",
            clientId: project.clientId || "",
            assignedEmployeeIds: project.assignedEmployeeIds?.join(",") || "",
            projectSummary: project.projectSummary || "",
            currency: project.currency || "",
            projectBudget: project.projectBudget || "",
            hoursEstimate: project.hoursEstimate || "",
            tasksNeedAdminApproval: project.tasksNeedAdminApproval || false,
            allowManualTimeLogs: project.allowManualTimeLogs || false,
          })
        }
      } catch (error) {
        console.error(error)
        setMessage("Error fetching project")
        setMessageType("error")
      } finally {
        setFetching(false)
      }
    }

    fetchProject()
  }, [projectId])

  const handleUpdateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const form = e.currentTarget
    const formData = new FormData(form)

    formData.set("noDeadline", form.noDeadline.checked ? "true" : "false")
    formData.set("tasksNeedAdminApproval", form.tasksNeedAdminApproval.checked ? "true" : "false")
    formData.set("allowManualTimeLogs", form.allowManualTimeLogs.checked ? "true" : "false")

    const token = localStorage.getItem("accessToken")
    if (!token) {
      setMessage("No token found!")
      setMessageType("error")
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`/api/work/project?id=${projectId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        const errorMsg =
          typeof data?.error === "string" ? data.error : data?.error?.message || data?.message || JSON.stringify(data)

        setMessage(errorMsg)
        setMessageType("error")
      } else {
        setMessage("Project updated successfully!")
        setMessageType("success")
        setTimeout(() => {
          router.push("/work/project/all")
        }, 1500)
      }
    } catch (error) {
      console.error(error)
      setMessage("Error submitting form")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Edit Project</h1>
          <p className="text-muted-foreground">Update project details and settings</p>
        </div>

        {/* Alert Messages */}
        {message && (
          <Alert
            className={`mb-6 ${messageType === "success" ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-red-500 bg-red-50 dark:bg-red-950"}`}
          >
            <div className="flex items-center gap-2">
              {messageType === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription
                className={
                  messageType === "success" ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"
                }
              >
                {message}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {projectData && (
          <form onSubmit={handleUpdateProject} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Project name, code, and timeline</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Project Name *</label>
                    <Input
                      name="projectName"
                      placeholder="Enter project name"
                      defaultValue={projectData.projectName}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Short Code *</label>
                    <Input
                      name="shortCode"
                      placeholder="e.g., PROJ-001"
                      defaultValue={projectData.shortCode}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Date *</label>
                    <Input type="date" name="startDate" defaultValue={projectData.startDate} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Deadline</label>
                    <Input type="date" name="deadline" defaultValue={projectData.deadline} />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <input
                    type="checkbox"
                    name="noDeadline"
                    id="noDeadline"
                    className="w-4 h-4"
                    defaultChecked={projectData.noDeadline}
                  />
                  <label htmlFor="noDeadline" className="text-sm font-medium cursor-pointer">
                    No Deadline
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Category, department, and client information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Project Category</label>
                    <Input
                      name="projectCategory"
                      placeholder="e.g., Web Development"
                      defaultValue={projectData.projectCategory}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Department ID</label>
                    <Input
                      type="number"
                      name="departmentId"
                      placeholder="Enter department ID"
                      defaultValue={projectData.departmentId}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Client ID</label>
                    <Input name="clientId" placeholder="Enter client ID" defaultValue={projectData.clientId} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Assigned Employee IDs *</label>
                    <Input
                      name="assignedEmployeeIds"
                      placeholder="1,2,3"
                      defaultValue={projectData.assignedEmployeeIds}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Project Summary</label>
                  <Textarea
                    name="projectSummary"
                    placeholder="Describe your project..."
                    rows={4}
                    defaultValue={projectData.projectSummary}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Budget & Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Budget & Timeline</CardTitle>
                <CardDescription>Financial and time estimates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Currency</label>
                    <Input name="currency" placeholder="USD / INR" defaultValue={projectData.currency} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Project Budget</label>
                    <Input
                      type="number"
                      name="projectBudget"
                      placeholder="0.00"
                      defaultValue={projectData.projectBudget}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Hours Estimate</label>
                    <Input
                      type="number"
                      name="hoursEstimate"
                      placeholder="0"
                      defaultValue={projectData.hoursEstimate}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Project configuration and permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <input
                    type="checkbox"
                    name="tasksNeedAdminApproval"
                    id="tasksNeedAdminApproval"
                    className="w-4 h-4"
                    defaultChecked={projectData.tasksNeedAdminApproval}
                  />
                  <label htmlFor="tasksNeedAdminApproval" className="text-sm font-medium cursor-pointer">
                    Tasks Need Admin Approval
                  </label>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <input
                    type="checkbox"
                    name="allowManualTimeLogs"
                    id="allowManualTimeLogs"
                    className="w-4 h-4"
                    defaultChecked={projectData.allowManualTimeLogs}
                  />
                  <label htmlFor="allowManualTimeLogs" className="text-sm font-medium cursor-pointer">
                    Allow Manual Time Logs
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Attachments</CardTitle>
                <CardDescription>Optional company file attachment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                  <input type="file" name="companyFile" className="hidden" id="fileInput" />
                  <label htmlFor="fileInput" className="cursor-pointer">
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-1">Any file type accepted</p>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button type="submit" disabled={loading} className="flex-1 h-11 text-base font-semibold">
                {loading ? "Updating Project..." : "Update Project"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-11 text-base font-semibold bg-transparent"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
