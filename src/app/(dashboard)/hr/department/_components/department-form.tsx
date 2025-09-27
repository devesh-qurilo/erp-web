"use client"

import type * as React from "react"
import { useState, useMemo } from "react"
import { Department } from "../../../../../types/departments"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

type Props = {
  parents: Department[]
  initialParentId?: number | null
  onSuccess?: (d: Department) => void
}

export function CreateDepartmentForm({ parents, initialParentId = null, onSuccess }: Props) {
  const [name, setName] = useState("")
  const [parentId, setParentId] = useState<number | null>(initialParentId)
  const [submitting, setSubmitting] = useState(false)

  // Sort parents alphabetically
  const parentOptions = useMemo(
    () => parents.sort((a, b) => a.departmentName.localeCompare(b.departmentName)),
    [parents],
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Department name is required")
      return
    }
    try {
      setSubmitting(true)
      // NOTE: Using localStorage is generally discouraged for storing sensitive tokens
      // in client-side code, but is used here as per the pattern provided.
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
      if (!token) throw new Error("Access token not found")

      // *** API Route Update: Changed from "/api/hr/department" to "/api/departments" ***
      const res = await fetch("/api/hr/department", {
        method: "POST",
        headers: {
          // The proxy API route expects the Authorization header to be passed through
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ departmentName: name.trim(), parentDepartmentId: parentId }),
      })

      if (!res.ok) {
        // Attempt to parse the error message from the response body
        const errorBody = await res.json().catch(() => ({}))
        
        // Extract the error message, checking for 'error' (from Next.js API) 
        // or 'message' (a common alternative) before falling back.
        const errorMessage = errorBody.error || errorBody.message || "Failed to create department"
        
        throw new Error(errorMessage)
      }

      const data: Department = await res.json()
      setName("")
      // Reset parentId only if it wasn't pre-set
      if (initialParentId == null) setParentId(null)
      toast.success("Department created", {
        description: `"${data.departmentName}" was added successfully.`,
      })
      onSuccess?.(data)
    } catch (err: any) {
      console.error("Department creation error:", err)
      toast.error("Create failed", {
        description: err.message,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="dept-name">Department name</Label>
        <Input
          id="dept-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Marketing"
        />
      </div>

      <div className="grid gap-2">
        <Label>Parent department</Label>
        <Select
          value={parentId === null ? "none" : String(parentId)}
          onValueChange={(v) => setParentId(v === "none" ? null : Number(v))}
        >
          <SelectTrigger>
            <SelectValue placeholder="No parent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No parent</SelectItem>
            {parentOptions.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.departmentName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Creating..." : "Create Department"}
      </Button>
    </form>
  )
}
