// // src/app/layout.tsx
// "use client";

// import "./globals.css";
// import { useState } from "react";
// import Navbar from "@/components/Navbar";
// import Sidebar from "@/components/Sidebar";



// export default function RootLayout({ children }: { children: React.ReactNode }) {

//   const [isCollapsed, setIsCollapsed] = useState(false);
//     const [activeTab, setActiveTab] = useState("dashboard");

//   return (
//     <html lang="en">
//        <div className="min-h-screen bg-gray-50 flex">
//          <Sidebar 
//           isCollapsed={isCollapsed}
//         setIsCollapsed={setIsCollapsed}
//         activeTab={activeTab}
//         setActiveTab={setActiveTab}/>

//          <div className="flex-1 flex flex-col min-w-0">
//       <Navbar/>
       
      
    
//       <body>{children}</body>
//         </div>
//         </div>
//     </html>
//   );
// }

// src/app/layout.tsx
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}

