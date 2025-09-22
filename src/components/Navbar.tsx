"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { Search, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const NAV_ITEMS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/leads": "Leads",
  "/deals": "Deals",
  "/client": "Client",
  "/work/project": "Project",
  "/work/task": "Task",
  "/work/timesheet": "Timesheet",
  "/work/roadmap": "Project Roadmap",
  "/hr/attendance": "Attendance",
  "/hr/leave": "Leave",
  "/hr/holiday": "Holiday",
  "/hr/appreciation": "Appreciation",
  "/messages": "Message",
  "/settings": "Settings",
}

export const CommonNavbar: React.FC = () => {
  const pathname = usePathname()
  const pageTitle = NAV_ITEMS[pathname] || "Page"

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left section with brand and page title */}
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-foreground">Qurilo</h1>
          <div className="h-6 w-px bg-border" />
          <h2 className="text-lg font-medium text-muted-foreground">{pageTitle}</h2>
        </div>

        {/* Center section with search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        {/* Right section with actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
