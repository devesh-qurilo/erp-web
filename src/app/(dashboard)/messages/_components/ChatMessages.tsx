import MessageItem from "./MessageItem"
import DateSeparator from "./DateSeparator"

interface Message {
  id: number
  sender: string
  message: string
  time: string
  avatar: string
  isMe: boolean
}

interface ChatMessagesProps {
  messages: Message[]
}

export default function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <DateSeparator date="Today" />
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  )
}