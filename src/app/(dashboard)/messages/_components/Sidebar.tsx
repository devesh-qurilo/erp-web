import ConversationsList from "./ConversationsList"
import SidebarHeader from "./SidebarHeader"


interface Conversation {
  id: number
  name: string
  message: string
  time: string
  avatar: string
  online: boolean
  unread: number
}

interface SidebarProps {
  conversations: Conversation[]
  selectedConversation: number
  onSelectConversation: (id: number) => void
}

export default function Sidebar({
  conversations,
  selectedConversation,
  onSelectConversation,
}: SidebarProps) {
  return (
    <div className="w-100 bg-amber-50  border-slate-200 flex flex-col">
      <SidebarHeader />
      <ConversationsList
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={onSelectConversation}
      />
    </div>
  )
}