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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="flex h-14 items-center justify-between px-0">
        {/* Left colored logo block + title */}
        <div className="flex items-center">
          {/* dark purple vertical block with logo text */}
          <div className="flex items-center justify-center bg-[#15173a] h-14 w-64 px-4">
            <span className="text-white text-2xl  font-bold tracking-tight">skavo</span>
          </div>

          {/* page title area (white background) */}
          <div className="pl-6">
            <h2 className="text-lg font-medium text-gray-800">{pageTitle}</h2>
          </div>
        </div>

        {/* Center search (kept minimal like original; visually hidden on very small screens) */}
        <div className="flex-1 max-w-xl mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-10 bg-gray-100 border border-gray-200 rounded-md h-9 text-sm"
            />
          </div>
        </div>

        {/* Right section with actions */}
        <div className="flex items-center gap-4 pr-6">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Bell className="h-4 w-4 text-gray-600" />
          </Button>

          {/* avatar circle using uploaded screenshot path */}
          <div className="h-9 w-9 rounded-full overflow-hidden ring-2 ring-gray-100">
            <img
              src={"/mnt/data/Screenshot 2025-11-24 110347.png"}
              alt="avatar"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </nav>
  )
}
