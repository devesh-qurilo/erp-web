"use client"

import { useState } from "react"
import ChatView from "./_components/ChatView"
import Sidebar from "./_components/Sidebar"


export default function MessagingApp() {
  const [selectedConversation, setSelectedConversation] = useState(1)

  const conversations = [
    {
      id: 1,
      name: "Chaitanya Roy",
      message: "Hey! How's the project coming along?",
      time: "2m ago",
      avatar: "/professional-man.png",
      online: true,
      unread: 2,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      message: "The meeting has been rescheduled to 3 PM",
      time: "15m ago",
      avatar: "/professional-woman-diverse.png",
      online: true,
      unread: 0,
    },
    {
      id: 3,
      name: "Mike Chen",
      message: "Thanks for the feedback on the design!",
      time: "1h ago",
      avatar: "/asian-professional-man.png",
      online: false,
      unread: 0,
    },
    {
      id: 4,
      name: "Design Team",
      message: "Alex: New mockups are ready for review",
      time: "2h ago",
      avatar: "/team-group.jpg",
      online: true,
      unread: 5,
    },
    {
      id: 5,
      name: "Emma Wilson",
      message: "Can we schedule a quick call tomorrow?",
      time: "3h ago",
      avatar: "/blonde-professional-woman.png",
      online: false,
      unread: 1,
    },
  ]

  const chatMessages = [
    {
      id: 1,
      sender: "Chaitanya Roy",
      message: "Hey! How's the project coming along? I wanted to check in on the progress.",
      time: "11:00 AM",
      avatar: "/professional-man.png",
      isMe: false,
    },
    {
      id: 2,
      sender: "You",
      message: "It's going great! We're ahead of schedule actually. Should have the first draft ready by tomorrow.",
      time: "11:02 AM",
      avatar: "/diverse-user-avatars.png",
      isMe: true,
    },
    {
      id: 3,
      sender: "Chaitanya Roy",
      message: "That's fantastic news! 🎉",
      time: "11:03 AM",
      avatar: "/professional-man.png",
      isMe: false,
    },
    {
      id: 4,
      sender: "You",
      message: "Thanks! The team has been working really hard on this.",
      time: "11:05 AM",
      avatar: "/diverse-user-avatars.png",
      isMe: true,
    },
  ]

  const selectedConversationData = conversations.find((c) => c.id === selectedConversation)

  return (
    <div className="flex w-full bg-slate-50">
      <Sidebar
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={setSelectedConversation}
      />
      <ChatView
        conversationData={selectedConversationData}
        messages={chatMessages}
      />
    </div>
  )
}