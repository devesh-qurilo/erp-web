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
} from "lucide-react";

export function AppSidebar() {
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
                  <Link href="/dashboard">
                    <LayoutDashboard className="size-5" />
                    <span >Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {/* Leads (collapsible) */}
          <SidebarGroup>
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
            </div>

            {openGroups.leads ? (
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/leads/admin/get">
                      <Users className="size-5" />
                      <span>Leads</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/deals/get">
                      <Briefcase className="size-5" />
                      <span>Deals</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            ) : null}
          </SidebarGroup>

          {/* Client (kept as label but made collapsible if needed) */}
          <SidebarGroup>
            <div
              role="button"
              className="flex items-center justify-between w-full cursor-pointer px-3"
              onClick={() => toggleGroup("client")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") toggleGroup("client");
              }}
              tabIndex={0}
              aria-expanded={!!openGroups.client}
            >
              <SidebarGroupLabel className=" text-white">Client</SidebarGroupLabel>
              <Chevron open={!!openGroups.client} />
            </div>

            {openGroups.client ? (
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/clients">
                      <Building className="size-5" />
                      <span>Client</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            ) : null}
          </SidebarGroup>

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
                    <Link href="/work/project">
                      <ClipboardList className="size-5" />
                      <span>Project</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/work/tasks">
                      <ClipboardList className="size-5" />
                      <span>Task</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/work/timesheet">
                      <Clock className="size-5" />
                      <span>Timesheet</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/work/roadmap">
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
                    <Link href="/hr/leave/admin">
                      <CalendarX className="size-5" />
                      <span>Leave</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/hr/awards">
                      <Award className="size-5" />
                      <span>Awards</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/hr/employee">
                      <Users className="size-5" />
                      <span>Employee</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/hr/designation">
                      <Briefcase className="size-5" />
                      <span>Designation</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/hr/department">
                      <Briefcase className="size-5" />
                      <span>Departments</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/hr/holiday">
                      <CalendarDays className="size-5" />
                      <span>Holiday</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/hr/appreciation">
                      <Award className="size-5" />
                      <span>Appreciation</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            ) : null}
          </SidebarGroup>

          {/* Finance (collapsible) */}
          <SidebarGroup>
            <div
              role="button"
              className="flex items-center justify-between w-full cursor-pointer px-3"
              onClick={() => toggleGroup("finance")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") toggleGroup("finance");
              }}
              tabIndex={0}
              aria-expanded={!!openGroups.finance}
            >
              <SidebarGroupLabel className=" text-white">Finance</SidebarGroupLabel>
              <Chevron open={!!openGroups.finance} />
            </div>

            {openGroups.finance ? (
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/finance/invoices">
                      <CalendarCheck className="size-5" />
                      <span>Invoices</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/finance/credit-notes">
                      <CalendarX className="size-5" />
                      <span>Credit Notes</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            ) : null}
          </SidebarGroup>

          {/* Messages */}
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/messages">
                    <MessageSquare className="size-5" />
                    <span>Message</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {/* Settings (collapsible) */}
          <SidebarGroup>
            <div
              role="button"
              className="flex items-center justify-between w-full cursor-pointer px-3"
              onClick={() => toggleGroup("settings")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") toggleGroup("settings");
              }}
              tabIndex={0}
              aria-expanded={!!openGroups.settings}
            >
              <SidebarGroupLabel className=" text-white">Settings</SidebarGroupLabel>
              <Chevron open={!!openGroups.settings} />
            </div>

            {openGroups.settings ? (
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/settings/company-settings">
                      <CalendarCheck className="size-5" />
                      <span>Company Settings </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/settings/profile-settings">
                      <CalendarX className="size-5" />
                      <span>Profile Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            ) : null}
          </SidebarGroup>
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
