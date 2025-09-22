import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { CommonNavbar } from "@/components/Navbar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content Area */}
        <div className="flex flex-col flex-1">
          {/* ✅ Sticky Navbar */}
          <header className="sticky top-0 z-55">
            <CommonNavbar />
          </header>

          {/* ✅ Scrollable Page Content */}
          <main className="flex-1  p-9">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
