"use client"
import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import useSWR from "swr"
import ChatInput from "./ChatInput" // ✅ import ChatInput here

interface Message {
  id: number
  chatRoomId: string
  senderId: string
  receiverId: string
  content: string
  messageType: "TEXT" | "FILE"
  fileAttachment: { fileName: string; fileUrl: string } | null
  status: string
  createdAt: string
  deletedForCurrentUser: boolean
  senderDetails: {
    employeeId: string
    name: string
    profileUrl: string | null
    designation: string | null
    department: string | null
  }
  receiverDetails: {
    employeeId: string
    name: string
    profileUrl: string | null
    designation: string | null
    department: string | null
  }
}

interface ChatWindowProps {
  chatRoomId: string
  employeeid: string
  receiverId: string
}

const fetcher = async (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}
  const res = await fetch(url, { headers, cache: "no-store" })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error || "Failed to fetch")
  }
  return res.json()
}

export default function ChatWindow({ chatRoomId, employeeid, receiverId }: ChatWindowProps) {
  const [currentUserId, setCurrentUserId] = useState(employeeid || "")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!employeeid) {
      const fromLS = localStorage.getItem("employeeId")
      if (fromLS) setCurrentUserId(fromLS)
    }
  }, [employeeid])

  const { data, error, isLoading, mutate } = useSWR<Message[]>(
    receiverId ? `/api/chats/history/${receiverId}` : null,
    fetcher,
    { revalidateOnFocus: true },
  )

  const messages = data || []

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  // Optimistic update when new message sent
  const handleMessageSent = (newMessage: Message) => {
    mutate((prev) => (prev ? [...prev, newMessage] : [newMessage]), false)
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  if (isLoading) return <p className="text-center text-muted-foreground">Loading chat...</p>
  if (error) return <p className="text-center text-destructive">{(error as Error).message}</p>

  return (
    <div className="flex flex-col h-full border border-border rounded-lg overflow-hidden bg-background">
      {/* 💬 Messages list */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUserId

          if (msg.deletedForCurrentUser) {
            return (
              <div key={msg.id} className={`flex items-start gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
                {!isMine && (
                  <Image
                    src={msg.senderDetails.profileUrl || "/placeholder.svg?height=32&width=32&query=User%20avatar"}
                    alt={msg.senderDetails.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <div className="px-3 py-2 rounded-xl max-w-xs bg-muted italic text-muted-foreground">
                  This message was deleted
                </div>
              </div>
            )
          }

          return (
            <div key={msg.id} className={`flex items-start gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
              {!isMine && (
                <Image
                  src={msg.senderDetails.profileUrl || "/placeholder.svg?height=32&width=32&query=User%20avatar"}
                  alt={msg.senderDetails.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <div
                className={`px-3 py-2 rounded-xl max-w-[75%] sm:max-w-md md:max-w-lg break-words ${
                  isMine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}
              >
                {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
                {msg.fileAttachment && (
                  <a
                    href={msg.fileAttachment.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-1 underline break-all"
                  >
                    📎 {msg.fileAttachment.fileName}
                  </a>
                )}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 📨 ChatInput integrated here */}
      <ChatInput
        chatRoomId={chatRoomId}
        senderId={currentUserId}
        receiverId={receiverId}
        onMessageSent={handleMessageSent}
      />
    </div>
  )
}
