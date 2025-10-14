"use client"

import type React from "react"

import { useState } from "react"

export default function ChatInput({
  chatRoomId,
  senderId,
  receiverId,
  onMessageSent,
}: {
  chatRoomId: string
  senderId: string
  receiverId: string
  onMessageSent?: (message: any) => void
}) {
  const [message, setMessage] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message && !file) return

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append("chatRoomId", chatRoomId)
      formData.append("senderId", senderId)
      formData.append("receiverId", receiverId)
      formData.append("content", message)
      formData.append("messageType", file ? "FILE" : "TEXT")
      formData.append("status", "SENT")
      if (file) formData.append("fileAttachment", file)

      const token = localStorage.getItem("accessToken")
      const res = await fetch("/api/chats/send", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      // Parse response robustly (API may return JSON or plain text on errors)
      const rawText = await res.text()
      let data: any
      try {
        data = rawText ? JSON.parse(rawText) : null
      } catch {
        data = rawText
      }

      if (!res.ok) {
        console.error("Send message error details:", data)
        const messageFromServer =
          typeof data === "object" && data !== null ? data.error || data.message : String(data || "")
        throw new Error(messageFromServer || "Failed to send message")
      }

      onMessageSent?.(data) // ✅ notify parent
      setMessage("")
      setFile(null)
    } catch (error) {
      console.error("Send message error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSendMessage} className="flex gap-2 items-center p-2 border-t border-border bg-background">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 border border-border rounded px-3 py-2 bg-background text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
      />
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" id="fileInput" />
      <label htmlFor="fileInput" className="cursor-pointer bg-muted text-foreground px-3 py-2 rounded">
        {"📎"}
      </label>
      <button
        type="submit"
        disabled={loading}
        className="bg-primary text-primary-foreground px-4 py-2 rounded disabled:opacity-50 hover:opacity-90"
      >
        {loading ? "Sending..." : "Send"}
      </button>
    </form>
  )
}
