//messages/[id]/page.tsx

"use client"

import { use, useEffect, useState } from "react"
import ChatWindow from "../_components/ChatWindow"

export default function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Unwrap promised params (Next.js App Router recent change)
  const { id: receiverId } = use(params)

  const [employeeId, setEmployeeId] = useState<string>("")

  // Get logged-in employee ID from localStorage
  useEffect(() => {
    const id = localStorage.getItem("employeeId")
    if (id) {
      setEmployeeId(id)
    } else {
      localStorage.setItem("employeeId", "EMP-009")
      setEmployeeId("EMP-009")
    }
  }, [])

  // Build chatRoomId dynamically (consistent naming)
  const chatRoomId = employeeId && receiverId ? [employeeId, receiverId].sort().join("_") : ""

  if (!employeeId) {
    return <p className="text-center mt-8 text-muted-foreground">Loading chat...</p>
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <ChatWindow chatRoomId={chatRoomId} employeeid={employeeId} receiverId={receiverId} />
    </div>
  )
}
