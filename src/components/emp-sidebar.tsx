"use client"

import Link from "next/link"
import {
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ClipboardList,
  Clock,
  Map,
  Building,
  CalendarCheck,
  CalendarX,
  CalendarDays,
  Award,
  MessageSquare,
} from "lucide-react"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-center  px-4 py-6">
          {/* <h1 className="text-2xl font-bold text-sidebar-primary">Qurilo</h1> */}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Dashboard */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/employee/dashboard">
                  <LayoutDashboard className="size-5" />
                  <span>Dashboard fbhvj</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Leads */}
        <SidebarGroup>
          <SidebarGroupLabel>Leads</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/employees/leads/admin/get">
                  <Users className="size-5" />
                  <span>Leads</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
         
          </SidebarMenu>
        </SidebarGroup>

      

        {/* Work */}
        <SidebarGroup>
          <SidebarGroupLabel>Work</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/employee/work/project">
                  <ClipboardList className="size-5" />
                  <span>Project</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/employee/work/task">
                  <ClipboardList className="size-5" />
                  <span>Task</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/employee/work/timesheet">
                  <Clock className="size-5" />
                  <span>Timesheet</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/employee/work/roadmap">
                  <Map className="size-5" />
                  <span>Project Roadmap</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* HR */}
        <SidebarGroup>
          <SidebarGroupLabel>HR</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/employee/hr/leave">
                  <CalendarX className="size-5" />
                  <span>Leave</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
 <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/employee/hr/attendance">
                  <CalendarDays className="size-5" />
                  <span>Attendance</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

           

          

         

            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/employee/hr/holiday">
                  <CalendarDays className="size-5" />
                  <span>Holiday</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/employee/hr/appreciation">
                  <Award className="size-5" />
                  <span>Appreciation</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

              <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/employee/hr/awards">
                  <Award className="size-5" />
                  <span>Awards</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

       

        {/* Messages */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/employee/messages">
                  <MessageSquare className="size-5" />
                  <span>Message</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarMenu>
            

            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/employee/settings/profile-settings">
                  <CalendarX className="size-5" />
                  <span>Profile Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4 text-xs text-sidebar-foreground/60 text-center border-t border-sidebar-border">
          © 2025 Qurilo
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
