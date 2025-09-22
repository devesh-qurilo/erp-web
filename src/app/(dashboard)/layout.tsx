import type React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { CommonNavbar } from "@/components/Navbar"


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main content area */}
        <SidebarInset>
          {/* Fixed Navbar */}
          <CommonNavbar />

          {/* Page Content */}
          <main className="flex-1 p-6 pt-20">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
