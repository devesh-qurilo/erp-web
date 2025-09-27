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
  Settings,
} from "lucide-react"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-center px-4 py-6">
          {/* <h1 className="text-2xl font-bold text-sidebar-primary">Qurilo</h1> */}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Dashboard */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/dashboard">
                  <LayoutDashboard className="size-5" />
                  <span>Dashboard</span>
                </a>
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
                <a href="/leads">
                  <Users className="size-5" />
                  <span>Leads</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/deals">
                  <Briefcase className="size-5" />
                  <span>Deals</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Client */}
        <SidebarGroup>
          <SidebarGroupLabel>Client</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/client">
                  <Building className="size-5" />
                  <span>Client</span>
                </a>
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
                <a href="/work/project">
                  <ClipboardList className="size-5" />
                  <span>Project</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/work/task">
                  <ClipboardList className="size-5" />
                  <span>Task</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/work/timesheet">
                  <Clock className="size-5" />
                  <span>Timesheet</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/work/roadmap">
                  <Map className="size-5" />
                  <span>Project Roadmap</span>
                </a>
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
                <a href="/hr/attendance">
                  <CalendarCheck className="size-5" />
                  <span>Attendance</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/hr/leave">
                  <CalendarX className="size-5" />
                  <span>Leave</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/hr/designation">
                  <CalendarX className="size-5" />
                  <span>Designation</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/hr/holiday">
                  <CalendarDays className="size-5" />
                  <span>Holiday</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/hr/appreciation">
                  <Award className="size-5" />
                  <span>Appreciation</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Message + Setting */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/messages">
                  <MessageSquare className="size-5" />
                  <span>Message</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/settings">
                  <Settings className="size-5" />
                  <span>Setting</span>
                </a>
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
