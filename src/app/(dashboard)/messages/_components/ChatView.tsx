import ChatHeader from "./ChatHeader"
import ChatMessages from "./ChatMessages"
import MessageInput from "./MessageInput"

interface ConversationData {
  id: number
  name: string
  message: string
  time: string
  avatar: string
  online: boolean
  unread: number
}

interface Message {
  id: number
  sender: string
  message: string
  time: string
  avatar: string
  isMe: boolean
}

interface ChatViewProps {
  conversationData?: ConversationData
  messages: Message[]
}

export default function ChatView({ conversationData, messages }: ChatViewProps) {
  if (!conversationData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Select a conversation to start messaging</p>
      </div>
    )
  }

  return (
    <div className="flex-1 w-200 h-screen flex flex-col">
      <ChatHeader conversationData={conversationData} />
      <ChatMessages messages={messages} />
      <MessageInput />
    </div>
  )
}