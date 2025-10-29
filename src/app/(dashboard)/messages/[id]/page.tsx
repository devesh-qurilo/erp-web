//messages/[id]/page.tsx

"use client"

import { use, useEffect, useState } from "react"
import ChatWindow from "../_components/ChatWindow"

interface CurrentUser {
  employeeId: string
}

export default function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Unwrap promised params (Next.js App Router recent change)
  const { id: receiverId } = use(params)

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken")
        if (!token) {
          throw new Error("No access token found")
        }

        const res = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          throw new Error("Failed to fetch profile")
        }

        const data = await res.json()
        setCurrentUser({ employeeId: data.employeeId })
      } catch (err: any) {
        console.error(err)
        setError(err.message || "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) {
    return <p className="text-center mt-8 text-muted-foreground">Loading chat...</p>
  }

  if (error || !currentUser) {
    return <p className="text-center mt-8 text-destructive">Failed to load user profile.</p>
  }

  // Build chatRoomId dynamically (consistent naming)
  const chatRoomId = [currentUser.employeeId, receiverId].sort().join("_")

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <ChatWindow chatRoomId={chatRoomId} employeeid={currentUser.employeeId} receiverId={receiverId} />
    </div>
  )
}