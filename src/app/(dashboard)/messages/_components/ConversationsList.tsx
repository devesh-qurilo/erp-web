import ConversationItem from "./ConversationItem"


interface Conversation {
  id: number
  name: string
  message: string
  time: string
  avatar: string
  online: boolean
  unread: number
}

interface ConversationsListProps {
  conversations: Conversation[]
  selectedConversation: number
  onSelectConversation: (id: number) => void
}

export default function ConversationsList({
  conversations,
  selectedConversation,
  onSelectConversation,
}: ConversationsListProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isSelected={selectedConversation === conversation.id}
          onSelect={() => onSelectConversation(conversation.id)}
        />
      ))}
    </div>
  )
}