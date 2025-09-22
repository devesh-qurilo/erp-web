"use client"

import React from "react"
import { usePathname } from "next/navigation"

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
    <nav className="w-full bg-amber-100 text-black shadow-md">
      <div className="flex w-full items-center justify-between px-6 py-3">
        {/* Brand / Logo */}
        <h1 className="text-lg font-bold">Qurilo</h1>

        {/* Page Title */}
        <h2 className="text-base font-medium">{pageTitle}</h2>
      </div>
    </nav>
  )
}
