"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function EditAwardPage() {
  const params = useParams()
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const awardId = params.id

  // ✅ Fetch existing award details
  useEffect(() => {
    async function fetchAward() {
      try {
        const token = localStorage.getItem("accessToken")
        if (!token) throw new Error("Access token not found")

        const res = await fetch(`/api/hr/awards/${awardId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error("Failed to fetch award")

        const award = await res.json()
        setTitle(award.title)
        setSummary(award.summary)
      } catch (err: any) {
        setError(err.message || "An error occurred")
      }
    }

    if (awardId) fetchAward()
  }, [awardId])

  // ✅ Handle update award
  const handleUpdate = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("accessToken")
      if (!token) throw new Error("Access token not found")

      const formData = new FormData()
      formData.append("title", title)
      formData.append("summary", summary)
      if (iconFile) formData.append("iconFile", iconFile)

      const res = await fetch(`/api/hr/awards/${awardId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Failed to update award")
      }

      router.push("/hr/awards") // redirect back to awards list
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Edit Award</h1>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <div className="flex flex-col gap-3 mb-4">
        <input
          type="text"
          placeholder="Award Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Award Summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="file"
          onChange={(e) => setIconFile(e.target.files?.[0] || null)}
          className="border px-3 py-2 rounded"
        />

        <Button onClick={handleUpdate} disabled={loading}>
          {loading ? "Updating..." : "Update Award"}
        </Button>
      </div>
    </div>
  )
}
