"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  FileText,
  Target,
  MessageCircle,
  UserCheck,
  Settings,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

// Menu with nested dropdown for Employees
const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "leads", label: "Leads ", icon: FolderOpen, 
    children:[
        { id: "leads", label: "Leads", href: "/leads" },
        { id: "deals", label: "Deals", href: "/deals" },
    ] },
  { id: "clients", label: "Clients", icon: Users, href: "/clients" },
  { id: "work", label: "Work", icon: FileText, 
    children:[
        { id: "projects", label: "Projects", href: "/projects" },   
        { id: "tasks", label: "Tasks", href: "/tasks" },
        { id: "timesheet", label: "Time Sheet", href: "/timesheet" },
        { id: "projectroadmap", label: "Project Roadmap", href: "/roadmap" },
    ]
   },
  { id: "hr", label: "Hr", icon: Target, 
    children:[
        { id: "employees", label: "Employees", href: "/employees" },
        { id: "attendance", label:"Attendance", href: "/attendance" },
        { id: "leave", label: "Leaves", href: "/leave" },
        { id: "holiday", label: "Holidays", href: "/holiday" },
        { id: "designation", label: "Designation", href: "/designation" },
        { id: "department", label: "Departments", href: "/department" },
        { id: "appreciation", label: "Appreciation", href: "/appreciation" },
    ]
   },
  { id: "finance", label: "Finance", icon: MessageCircle, 
    children:[
        { id: "invoices", label: "Invoices", href: "/invoices" },
        { id: "creditnote", label: "Credit Notes", href: "/creditnote" },
    ]
   },
    { id: "message", label: "Messages", icon: UserCheck, href: "/message" },
]

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <div
      className={`bg-[#211C52] border-r border-gray-200 transition-all duration-300 flex flex-col ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-center px-4">
        {isCollapsed ? (
          <img src="Images/logo1.jpg" alt="Logo" className="h-8 w-8 object-contain" />
        ) : (
          <div className="flex items-center space-x-2">
            <img src="Images/qurilo logo.png" alt="Logo" className="h-8 w-18 object-contain" />
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <div className="p-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 hover:bg-[#7566E7] rounded-lg transition-colors"
        >
          <ChevronLeft
            className={`h-5 w-5 text-white transition-transform ${
              isCollapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.children) {
            const isOpen = openDropdown === item.id;

            return (
              <div key={item.id}>
                {/* Parent button */}
                <button
                  onClick={() =>
                    setOpenDropdown(isOpen ? null : item.id)
                  }
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isOpen
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-white hover:bg-[#7566E7]"
                  }`}
                >
                  <span className="flex items-center">
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span className="ml-3">{item.label}</span>}
                  </span>
                  {!isCollapsed && (
                    isOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )
                  )}
                </button>

                {/* Dropdown children */}
                {isOpen && !isCollapsed && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.href}
                        className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          pathname === child.href
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-200 hover:bg-[#7566E7]"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href!}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-white hover:bg-[#7566E7]"
              }`}
              title={isCollapsed ? item.label : ""}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="ml-3">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
