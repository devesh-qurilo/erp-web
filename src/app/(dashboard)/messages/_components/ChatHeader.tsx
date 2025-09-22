import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Phone, Video, MoreVertical } from "lucide-react"

interface ConversationData {
  id: number
  name: string
  message: string
  time: string
  avatar: string
  online: boolean
  unread: number
}

interface ChatHeaderProps {
  conversationData: ConversationData
}

export default function ChatHeader({ conversationData }: ChatHeaderProps) {
  return (
    <div className="p-4 border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={conversationData?.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-slate-200 text-slate-600">
                {conversationData?.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            {conversationData?.online && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 text-sm">{conversationData?.name}</h2>
            <p className="text-xs text-slate-500">
              {conversationData?.online ? "Active now" : "Last seen 2h ago"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Phone className="w-4 h-4 text-slate-500" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Video className="w-4 h-4 text-slate-500" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="w-4 h-4 text-slate-500" />
          </Button>
        </div>
      </div>
    </div>
  )
}