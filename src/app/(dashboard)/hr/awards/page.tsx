"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Award, Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface AwardData {
  id: number
  title: string
  summary: string
  iconUrl: string
  iconFileId: number
  isActive: boolean
  createdAt: string | null
  updatedAt: string
}

export default function AwardsPage() {
  const [awards, setAwards] = useState<AwardData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ✅ Fetch all awards
  useEffect(() => {
    async function fetchAwards() {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
        if (!token) throw new Error("Access token not found")

        const res = await fetch("/api/hr/awards", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          throw new Error("Failed to fetch awards")
        }

        const data = await res.json()
        setAwards(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchAwards()
  }, [])

  // ✅ Delete Award
  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this award?")) return

    try {
      const token = localStorage.getItem("accessToken")
      if (!token) throw new Error("Access token not found")

        const res = await fetch(`/api/hr/awards/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
        

      if (!res.ok) {
        throw new Error("Failed to delete award")
      }

      // Update state after delete
      setAwards((prev) => prev.filter((award) => award.id !== id))
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-16 w-16 rounded-lg mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Award className="h-10 w-10" />
            Awards
          </h1>
          <p className="text-muted-foreground text-lg">Browse all available awards and achievements</p>
        </div>

        <Link href="/hr/awards/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Award
          </Button>
        </Link>
      </div>

      {awards.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Awards Found</CardTitle>
            <CardDescription>There are currently no awards available.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {awards.map((award) => (
            <Card key={award.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <img
                    src={award.iconUrl || "/placeholder.svg"}
                    alt={award.title}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  {award.isActive && <Badge variant="secondary">Active</Badge>}
                </div>
                <CardTitle className="text-xl">{award.title}</CardTitle>
                <CardDescription className="line-clamp-2">{award.summary}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {award.updatedAt && <p>Updated: {new Date(award.updatedAt).toLocaleDateString()}</p>}
                </div>
                <div className="flex gap-2">
                  {/* Edit button */}
                  <Link href={`/hr/awards/${award.id}`}>
                    <Button size="sm" variant="outline">
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  </Link>

                  {/* Delete button */}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(award.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
