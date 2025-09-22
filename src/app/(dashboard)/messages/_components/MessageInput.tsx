import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Smile, Paperclip, Send } from "lucide-react"

export default function MessageInput() {
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Handle send message logic here
      console.log("Sending message:", newMessage)
      setNewMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="p-4 bg-white  border-t border-slate-200">
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="pr-20 py-3 rounded-2xl border-slate-200 resize-none"
            onKeyPress={handleKeyPress}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Paperclip className="w-4 h-4 text-slate-400" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Smile className="w-4 h-4 text-slate-400" />
            </Button>
          </div>
        </div>
        <Button
          size="sm"
          className="h-10 w-10 p-0 rounded-full bg-blue-500 hover:bg-blue-600"
          disabled={!newMessage.trim()}
          onClick={handleSendMessage}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}