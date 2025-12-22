"use client";

import React, { useState } from "react";
import Link from "next/link";
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
} from "@/components/ui/sidebar";
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
  Notebook,
} from "lucide-react";
import AttendanceCalendar from "@/app/(dashboard)/hr/attendence/components/AttendanceCalendar";

export function EAppSidebar() {
  // track which groups are open; keys correspond to group labels
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    leads: false,
    client: false,
    work: false,
    hr: false,
    finance: false,
    settings: false,
  });

  const toggleGroup = (key: string) =>
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  const Chevron = ({ open }: { open: boolean }) => (
    <span className="ml-2  text-sidebar-foreground/60">{open ? "▾" : ">"}</span>
  );

  return (
    <div className="min-h-screen bg-[#15173a]  text-white">
      <Sidebar className="#211C52">
        <SidebarHeader>
          <div className="flex items-center justify-center  px-1 py-6">
            {/* <h1 className="text-2xl font-bold text-sidebar-primary">Qurilo</h1> */}
          </div>
        </SidebarHeader>

        <SidebarContent className="bg-[#15173a] text-white">
          {/* Dashboard */}
          <SidebarGroup className=" text-white">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/employees/employee">
                    <LayoutDashboard className="size-5" />
                    <span >Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {/* Leads (collapsible) */}
          {/* <SidebarGroup>
            <div
              role="button"
              className="flex items-center justify-between w-full cursor-pointer px-3"
              onClick={() => toggleGroup("leads")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") toggleGroup("leads");
              }}
              tabIndex={0}
              aria-expanded={!!openGroups.leads}
            >
              <SidebarGroupLabel className=" text-white">Leads</SidebarGroupLabel>
              <Chevron open={!!openGroups.leads} />
            </div> */}

          {/* {openGroups.leads ? ( */}
          {/* <SidebarMenu> */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/employees/leads/admin/get">
                <Users className="size-5" />
                <span>Leads</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/deals/get">
                      <Briefcase className="size-5" />
                      <span>Deals</span>
                    </Link>
                  </SidebarMenuButton> */}
          {/* </SidebarMenuItem>
              </SidebarMenu> */}
          {/* //   ) : null} */}
          {/* // </SidebarGroup> */}



          {/* Work (collapsible) */}
          <SidebarGroup>
            <div
              role="button"
              className="flex items-center justify-between w-full cursor-pointer px-3"
              onClick={() => toggleGroup("work")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") toggleGroup("work");
              }}
              tabIndex={0}
              aria-expanded={!!openGroups.work}
            >
              <SidebarGroupLabel className=" text-white">Work</SidebarGroupLabel>
              <Chevron open={!!openGroups.work} />
            </div>

            {openGroups.work ? (
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/employees/work/project">
                      <ClipboardList className="size-5" />
                      <span>Project</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/employees/work/tasks">
                      <ClipboardList className="size-5" />
                      <span>Task</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/employees/work/timesheet">
                      <Clock className="size-5" />
                      <span>Timesheet</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/employees/work/roadmap">
                      <Map className="size-5" />
                      <span>Project Roadmap</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            ) : null}
          </SidebarGroup>

          {/* HR (collapsible) */}
          <SidebarGroup>
            <div
              role="button"
              className="flex items-center justify-between w-full cursor-pointer px-3"
              onClick={() => toggleGroup("hr")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") toggleGroup("hr");
              }}
              tabIndex={0}
              aria-expanded={!!openGroups.hr}
            >
              <SidebarGroupLabel className=" text-white">HR</SidebarGroupLabel>
              <Chevron open={!!openGroups.hr} />
            </div>

            {openGroups.hr ? (
              <SidebarMenu>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/employees/hr/attendence">
                      <Notebook className="size-5" />
                      <span>Attendance</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>


                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/employees/hr/leave/admin">
                      <CalendarX className="size-5" />
                      <span>Leave</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/employees/hr/holiday">
                      <CalendarDays className="size-5" />
                      <span>Holiday</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/employees/hr/appreciation">
                      <Award className="size-5" />
                      <span>Appreciation</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            ) : null}
          </SidebarGroup>

          {/* Finance (collapsible) */}


          {/* Messages */}
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/employees/messages">
                    <MessageSquare className="size-5" />
                    <span>Message</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>


          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/employees/settings/profile-settings">
                <CalendarX className="size-5" />
                <span>Profile Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* </SidebarMenu> */}
          {/* ) : null} */}
          {/* </SidebarGroup> */}
        </SidebarContent>

        <SidebarFooter className="bg-[#15173a] text-white">
          <div className="p-4 text-xs text-white text-sidebar-foreground/60 text-center border-t border-sidebar-border">
            © 2025 Qurilo
          </div>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
