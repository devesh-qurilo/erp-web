import type React from "react"
import ChatRoomsList from "./_components/ChatRoomsList"

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen md:h-[calc(100vh-0rem)] flex flex-col md:flex-row">
      <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground text-pretty">Chats</h2>
        </div>
        <div className="h-[calc(100vh-4rem)] md:h-screen overflow-y-auto">
          <ChatRoomsList />
        </div>
      </aside>
      <main className="flex-1 min-w-0 bg-background">{children}</main>
    </div>
  )
}
