"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"

interface ChatRoom {
  id: string
  participant1Id: string
  participant2Id: string
  participant1Details: {
    employeeId: string
    name: string
    profileUrl: string | null
    designation: string | null
    department: string | null
  }
  participant2Details: {
    employeeId: string
    name: string
    profileUrl: string | null
    designation: string | null
    department: string | null
  }
  lastMessage?: {
    content: string | null
    messageType: "TEXT" | "FILE"
    fileAttachment?: {
      fileName: string
      fileUrl: string
    } | null
    createdAt: string
  }
  unreadCount: number
}

interface CurrentUser {
  employeeId: string
}

export default function ChatRoomsList() {
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken")
        if (!token) {
          throw new Error("No access token found")
        }

        const headers: HeadersInit = { Authorization: `Bearer ${token}` }

        const [profileRes, roomsRes] = await Promise.all([
          fetch("/api/profile", { headers }),
          fetch("/api/chats/rooms", { headers, cache: "no-store" })
        ])

        if (!profileRes.ok) {
          throw new Error("Failed to fetch profile")
        }
        if (!roomsRes.ok) {
          throw new Error("Failed to fetch chat rooms")
        }

        const profileData = await profileRes.json()
        setCurrentUser({ employeeId: profileData.employeeId })

        const roomsData = await roomsRes.json()
        setRooms(roomsData)
      } catch (err: any) {
        console.error(err)
        setError(err.message || "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <p className="text-center text-muted-foreground">Loading chats...</p>
  if (error) return <p className="text-center text-destructive">{error}</p>

  if (!currentUser) {
    return <p className="text-center text-muted-foreground">Unable to load user profile.  </p>
  }

  if (!rooms.length) return <p className="text-center text-muted-foreground">No chat rooms found.</p>

  return (
    <div className="space-y-3 p-4 bg-background">
      {rooms.map((room) => {
        const partner =
          room.participant1Details.employeeId === currentUser.employeeId ? room.participant2Details : room.participant1Details

        return (
          <Link
            key={room.id}
            href={`/messages/${partner.employeeId}`}
            className="flex items-center gap-3 bg-muted hover:opacity-90 p-3 rounded-2xl shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={`Open chat with ${partner.name}`}
          >
            <Image
              src={partner.profileUrl || "/placeholder.svg?height=48&width=48&query=User%20avatar"}
              alt={partner.name}
              width={48}
              height={48}
              className="rounded-full"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-pretty">{partner.name}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {room.lastMessage?.messageType === "FILE"
                  ? `📎 ${room.lastMessage.fileAttachment?.fileName}`
                  : room.lastMessage?.content || "No messages yet"}
              </p>
            </div>
            {room.unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-1">
                {room.unreadCount}
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )
}