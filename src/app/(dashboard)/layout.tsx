// "use client";

// import Navbar from "@/components/Navbar";

// import React, { useState } from "react";
// import Navbar from "@/components/Navbar";
// import Sidebar from "@/components/Sidebar";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [activeTab, setActiveTab] = useState("dashboard");

//   return (
//     <div className="flex h-screen">
//       <Sidebar
//         isCollapsed={isCollapsed}
//         setIsCollapsed={setIsCollapsed}
//         activeTab={activeTab}
//         setActiveTab={setActiveTab}
//       />
//       <div className="flex flex-col flex-1">
//         <Navbar />
//         <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">{children}</main>
//       </div>
//     </div>
//   );
// }

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-1">
      {/* Navbar only for dashboard */}
      
      <main className="p-6">{children}</main>
    </div>
  );
}