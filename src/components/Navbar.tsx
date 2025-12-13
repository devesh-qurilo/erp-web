"use client"

import React, { useState, useRef, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Search, Bell, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const NAV_ITEMS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/leads": "Leads",
  "/deals": "Deals",
  "/client": "Client",
  "/work/project": "Project",
  "/work/tasks": "Task",
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
  const router = useRouter()
  const pageTitle = NAV_ITEMS[pathname] || "Page"

  const [openMenu, setOpenMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    // show confirmation popup first
    const confirmed = window.confirm("Are you sure you want to logout?")
    if (!confirmed) {
      return
    }

    // Optional: call your logout API here, clear tokens, etc.
    // Example placeholder:
    // await fetch('/api/auth/logout', { method: 'POST' });

    // close menu
    setOpenMenu(false)

    // redirect to login page
    router.push("/login")
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="flex h-14 items-center justify-between px-0">
        {/* Left block */}
        <div className="flex items-center">
          <div className="flex items-center justify-center bg-[#15173a] h-14 w-64 px-4">
            <span className="text-white text-2xl font-bold tracking-tight">skavo</span>
          </div>

          <div className="pl-6">
            <h2 className="text-lg font-medium text-gray-800">{pageTitle}</h2>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-10 bg-gray-100 border border-gray-200 rounded-md h-9 text-sm"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4 pr-6 relative" ref={menuRef}>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Bell className="h-4 w-4 text-gray-600" />
          </Button>

          {/* Avatar → toggle menu */}
          <div
            onClick={() => setOpenMenu(!openMenu)}
            className="h-9 w-9 rounded-full overflow-hidden ring-2 ring-gray-100 cursor-pointer"
          >
            <img
              src={"/mnt/data/Screenshot 2025-11-24 174249.png"}
              alt="avatar"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Dropdown menu */}
          {openMenu && (
            <div className="absolute top-12 right-0 bg-white shadow-md rounded-lg px-4 py-2 w-32 border">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 text-sm text-gray-700 hover:text-black"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
