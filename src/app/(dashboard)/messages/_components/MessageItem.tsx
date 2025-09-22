import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Message {
  id: number
  sender: string
  message: string
  time: string
  avatar: string
  isMe: boolean
}

interface MessageItemProps {
  message: Message
}

export default function MessageItem({ message }: MessageItemProps) {
  return (
    <div className={`flex gap-3 ${message.isMe ? "flex-row-reverse" : ""}`}>
      {!message.isMe && (
        <Avatar className="w-8 h-8 mt-1">
          <AvatarImage src={message.avatar || "/placeholder.svg"} />
          <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
            {message.sender
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
      )}
      <div className={`flex flex-col max-w-xs lg:max-w-md ${message.isMe ? "items-end" : "items-start"}`}>
        {!message.isMe && <span className="text-xs text-slate-500 mb-1 px-3">{message.sender}</span>}
        <div
          className={`px-4 py-2 rounded-2xl ${
            message.isMe
              ? "bg-blue-500 text-white rounded-br-md"
              : "bg-white border border-slate-200 text-slate-900 rounded-bl-md"
          }`}
        >
          <p className="text-sm leading-relaxed">{message.message}</p>
        </div>
        <span className="text-xs text-slate-400 mt-1 px-3">{message.time}</span>
      </div>
    </div>
  )
}