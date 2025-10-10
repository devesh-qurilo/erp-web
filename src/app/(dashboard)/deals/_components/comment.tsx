"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"

interface Comment {
  id: number
  employeeId: string
  commentText: string
  createdAt: string
}

interface DealCommentsProps {
  dealId: string
}

export default function DealComments({ dealId }: DealCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newComment, setNewComment] = useState("")
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
  const isLoggedIn = !!token

  // -----------------------------------------------------------------
  const fetchComments = useCallback(async () => {
    if (!dealId) {
      setError("Deal ID not found")
      setLoading(false)
      return
    }
    try {
      const res = await fetch(`/api/deals/get/${dealId}/comments`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      if (!res.ok) throw new Error(`Failed to fetch comments: ${res.statusText}`)
      const data = await res.json()
      if (!Array.isArray(data.data)) throw new Error("Invalid data format")
      setComments(data.data)
      setError(null)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to load comments")
    } finally {
      setLoading(false)
    }
  }, [dealId, token])

  // -----------------------------------------------------------------
  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  // -----------------------------------------------------------------
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setAdding(true)
    setAddError(null)
    try {
      const res = await fetch(`/api/deals/get/${dealId}/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commentText: newComment.trim() }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to add comment")
      }
      const { data } = await res.json()
      setComments(data)
      setNewComment("")
    } catch (err: any) {
      setAddError(err.message || "Could not add comment")
    } finally {
      setAdding(false)
    }
  }

  // -----------------------------------------------------------------
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // -----------------------------------------------------------------
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Comments</h3>
        <p className="text-sm text-gray-500">Loading comments...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Comments</h3>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h3>

      {/* Comments list */}
      <div className="space-y-3 mb-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-blue-600">{comment.employeeId}</span>
              <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
            </div>
            <p className="text-gray-800 text-sm">{comment.commentText}</p>
          </div>
        ))}
        {!comments.length && <span className="text-gray-400 italic text-sm">No comments yet</span>}
      </div>

      {/* Add comment form */}
      {/* {isLoggedIn && (
        <form onSubmit={handleAddComment} className="flex flex-col gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            disabled={adding}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={adding || !newComment.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {adding ? "Adding..." : "Add Comment"}
            </button>
          </div>
          {addError && <p className="text-sm text-red-500">{addError}</p>}
        </form>
      )} */}
    </div>
  )
}