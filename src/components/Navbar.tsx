// "use client"

// import React, { useState, useRef, useEffect } from "react"
// import { usePathname, useRouter } from "next/navigation"
// import { Search, Bell, LogOut } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"

// const NAV_ITEMS: Record<string, string> = {
//   "/dashboard": "Dashboard",
//   "/leads/admin/get": "Leads",
//   "/deals/get": "Deals",
//   "/clients": "Client",
//   "/work/project": "Project",
//   "/work/tasks": "Task",
//   "/work/timesheet": "Timesheet",
//   "/work/roadmap": "Project Roadmap",
//   "/hr/attendence": "Attendance",
//   "/hr/employee": "Employee",
//   "/hr/leave/admin": "Leave",
//   "/hr/holiday": "Holiday",
//   "/hr/designation": "Designation",
//   "/hr/appreciation": "Appreciation",
//   "/finance/invoices": "Invoices",
//   "/finance/credit-notes": "Creadit Notes",
//   "/settings/company-settings": "company-settings",
//   "/settings/profile-settings": "profile-settings",
//   "/messages": "Message",
//   "/settings": "Settings",
//   "/employees/leads/admin/get": "Leads",
//   "/employees/employee": "Dashboard",
//   "/employees/work/tasks": "Tasks",
//   "/employees/work/project": "Projects",
//   "/employees/work/timesheet": "Timesheets",
//   "/employees/work/roadmap": "Roadmap",
//   "/employees/hr/attendence": "Attendance",
//   "/employees/hr/leave/admin": "Leave",
//   "/employees/hr/holiday": "Holiday",
//   "/employees/hr/appreciation": "Appreciations",
  
//   "/employees/messages": "Messages",
//   "/employees/settings/profile-settings": "Profile Settings",
// }



// interface EmployeeProfile {
 
//   profilePictureUrl?: string;
 
// }

// export const CommonNavbar: React.FC = () => {
//   const pathname = usePathname()
//   const router = useRouter()
//   const pageTitle = NAV_ITEMS[pathname] || "Page"
//   const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
//   const BASE_URL = process.env.NEXT_PUBLIC_MAIN || ""

//   const [openMenu, setOpenMenu] = useState(false)
//   const menuRef = useRef<HTMLDivElement>(null)

//    const fetchEmployee = async () => {
//     const empId = localStorage.getItem("employeeId");
//     const token = localStorage.getItem("accessToken");
//     if (!empId || !token) return;

//     const res = await fetch(`${BASE_URL}/employee/me`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     setEmployee(await res.json());
//   };


//   useEffect(() => {
//     fetchEmployee();
//   }, []);
//   const handleLogout = async () => {
//     // show confirmation popup first
//     const confirmed = window.confirm("Are you sure you want to logout?")
//     if (!confirmed) {
//       return
//     }




//     // Optional: call your logout API here, clear tokens, etc.
//     // Example placeholder:
//     // await fetch('/api/auth/logout', { method: 'POST' });

//     // close menu
//     setOpenMenu(false)

//     // redirect to login page
//     router.push("/login")
//   }

//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
//         setOpenMenu(false)
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside)
//     return () => document.removeEventListener("mousedown", handleClickOutside)
//   }, [])

//   return (
//     <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
//       <div className="flex h-14 items-center justify-between px-0">
//         {/* Left block */}
//         <div className="flex items-center">
//           <div className="flex items-center justify-center bg-[#15173a] h-14 w-64 px-4">
//             <span className="text-white text-2xl font-bold tracking-tight">skavo </span>
//   {/* <img
//                src={employee?.profilePictureUrl || "/avatar.png"}
//               alt="avatar"
//               className="h-full w-full object-cover"
//             /> */}

//           </div>

//           <div className="pl-6">
//             <h2 className="text-lg font-medium text-gray-800">{pageTitle}</h2>
//           </div>
//         </div>

//         {/* Search */}
//         <div className="flex-1 max-w-xl mx-4 hidden md:block">
//           {/* <div className="relative">
//             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
//             <Input
//               placeholder="Search..."
//               className="pl-10 bg-gray-100 border border-gray-200 rounded-md h-9 text-sm"
//             />
//           </div> */}
//         </div>

//         {/* Right side */}
//         <div className="flex items-center gap-4 pr-6 relative" ref={menuRef}>
//           <Button variant="ghost" size="icon" className="h-9 w-9">
//             <Bell className="h-4 w-4 text-gray-600" />
//           </Button>

//           {/* Avatar → toggle menu */}
//           <div
//             onClick={() => setOpenMenu(!openMenu)}
//             className="h-9 w-9 rounded-full overflow-hidden ring-2 ring-gray-100 cursor-pointer"
//           >
//             <img
//                src={employee?.profilePictureUrl || "/avatar.png"}
//               alt="avatar"
//               className="h-full w-full object-cover"
//             />
//           </div>

//           {/* Dropdown menu */}
//           {openMenu && (
//             <div className="absolute top-12 right-0 bg-white shadow-md rounded-lg px-4 py-2 w-32 border">
//               <button
//                 onClick={handleLogout}
//                 className="w-full flex items-center gap-2 text-sm text-gray-700 hover:text-black"
//               >
//                 <LogOut size={16} /> Logout
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </nav>
//   )
// }






"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS: Record<string, string> = {

   "/dashboard": "Dashboard",
  "/leads/admin/get": "Leads",
  "/deals/get": "Deals",
  "/clients": "Client",
  "/work/project": "Project",
  "/work/tasks": "Task",
  "/work/timesheet": "Timesheet",
  "/work/roadmap": "Project Roadmap",
  "/hr/attendence": "Attendance",
  "/hr/employee": "Employee",
  "/hr/leave/admin": "Leave",
  "/hr/holiday": "Holiday",
  "/hr/designation": "Designation",
  "/hr/appreciation": "Appreciation",
  "/finance/invoices": "Invoices",
  "/finance/credit-notes": "Creadit Notes",
  "/settings/company-settings": "company-settings",
  "/settings/profile-settings": "profile-settings",
  "/messages": "Message",
  "/settings": "Settings",
  "/employees/leads/admin/get": "Leads",
  "/employees/employee": "Dashboard",
  "/employees/work/tasks": "Tasks",
  "/employees/work/project": "Projects",
  "/employees/work/timesheet": "Timesheets",
  "/employees/work/roadmap": "Roadmap",
  "/employees/hr/attendence": "Attendance",
  "/employees/hr/leave/admin": "Leave",
  "/employees/hr/holiday": "Holiday",
  "/employees/hr/appreciation": "Appreciations",
  
  "/employees/messages": "Messages",
  "/employees/settings/profile-settings": "Profile Settings",
};

export const CommonNavbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const pageTitle = NAV_ITEMS[pathname] || "Page";

  const [openMenu, setOpenMenu] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (lang: string) => {
    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event("change"));
    }
    setLangOpen(false);
  };

  const handleLogout = () => {
    if (!confirm("Are you sure you want to logout?")) return;
    router.push("/login");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(false);
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    // <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
    //   <div className="flex h-14 items-center justify-between px-4">
    //     <h2 className="text-lg font-semibold">{pageTitle}</h2>

  <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="flex h-14 items-center justify-between px-0">
         {/* Left block */}
         <div className="flex items-center">
             <div className="flex items-center justify-center bg-[#15173a] h-14 w-64 px-4">
             <span className="text-white text-2xl font-bold tracking-tight">skavo </span>
  {/* <img
               src={employee?.profilePictureUrl || "/avatar.png"}
              alt="avatar"
              className="h-full w-full object-cover"
            /> */}

          </div>

           <div className="pl-6">
            <h2 className="text-lg font-medium text-gray-800">{pageTitle}</h2>
          </div>
        </div>




        <div className="flex items-center gap-3 relative" ref={menuRef}>
          {/* Bell */}
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>

          {/* 🌐 Language */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100"
            >
              🌐 Language
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 bg-white border shadow rounded-md w-32 z-50">
                {[
                  { code: "en", label: "English" },
                  { code: "hi", label: "हिंदी" },
                  { code: "mr", label: "मराठी" },
                  { code: "ta", label: "தமிழ்" },
                  { code: "te", label: "తెలుగు" },
                  { code: "ur", label: "اردو" },
                ].map((l) => (
                  <button
                    key={l.code}
                    onClick={() => handleLanguageChange(l.code)}
                    className="block w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Avatar */}
          <div
            onClick={() => setOpenMenu(!openMenu)}
            className="h-9 w-9 rounded-full overflow-hidden ring-2 ring-gray-100 cursor-pointer"
          >
            <img src="/avatar.png" className="h-full w-full object-cover" />
          </div>

          {/* Logout */}
          {openMenu && (
            <div className="absolute top-12 right-0 bg-white shadow rounded-md px-4 py-2 w-32 border">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm hover:text-black"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
