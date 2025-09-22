import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Conversation {
  id: number
  name: string
  message: string
  time: string
  avatar: string
  online: boolean
  unread: number
}

interface ConversationItemProps {
  conversation: Conversation
  isSelected: boolean
  onSelect: () => void
}

export default function ConversationItem({
  conversation,
  isSelected,
  onSelect,
}: ConversationItemProps) {
  return (
    <div
      onClick={onSelect}
      className={`p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${
        isSelected ? "bg-blue-50 border-r-2 border-r-blue-500" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar className="w-12 h-12">
            <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
            <AvatarFallback className="bg-slate-200 text-slate-600">
              {conversation.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          {conversation.online && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-slate-900 truncate text-sm">{conversation.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{conversation.time}</span>
              {conversation.unread > 0 && (
                <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {conversation.unread}
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-slate-600 truncate">{conversation.message}</p>
        </div>
      </div>
    </div>
  )
}