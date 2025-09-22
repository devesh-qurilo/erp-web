import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Search } from "lucide-react"

export default function SidebarHeader() {
  return (
    <div className="p-4 border-b sticky border-slate-200 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-slate-900">Messages</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Bell className="w-4 h-4 text-slate-500" />
          </Button>
          <Avatar className="w-8 h-8">
            <AvatarImage src="/user-profile-illustration.png" />
            <AvatarFallback className="bg-blue-500 text-white text-xs">ME</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search conversations..."
          className="pl-10 bg-slate-50 border-slate-200 rounded-lg h-9 text-sm"
        />
      </div>
    </div>
  )
}