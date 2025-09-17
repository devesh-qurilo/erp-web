// "use client";

// import React, { useState } from 'react';
// import { Search, Bell, User, Settings, LogOut, ChevronDown } from 'lucide-react';

// const Navbar: React.FC = () => {
//   const [showProfileDropdown, setShowProfileDropdown] = useState(false);
//   const [showNotifications, setShowNotifications] = useState(false);

//   const notifications = [
//     { id: 1, message: "New project assigned to you", time: "2 min ago", unread: true },
//     { id: 2, message: "Invoice #1234 has been paid", time: "1 hour ago", unread: true },
//     { id: 3, message: "Client meeting scheduled for tomorrow", time: "3 hours ago", unread: false },
//   ];

//   return (
//     <div className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
//       {/* Search Bar */}
//       <div className="flex-1 max-w-md">
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search anything..."
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           />
//         </div>
//       </div>

//       {/* Right Side Actions */}
//       <div className="flex items-center space-x-4">
//         {/* Notifications */}
//         <div className="relative">
//           <button
//             onClick={() => setShowNotifications(!showNotifications)}
//             className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
//           >
//             <Bell className="h-5 w-5 text-gray-600" />
//             {notifications.some(n => n.unread) && (
//               <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
//                 {notifications.filter(n => n.unread).length}
//               </span>
//             )}
//           </button>

//           {showNotifications && (
//             <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
//               <div className="p-4 border-b border-gray-200">
//                 <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
//               </div>
//               <div className="max-h-64 overflow-y-auto">
//                 {notifications.map((notification) => (
//                   <div
//                     key={notification.id}
//                     className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
//                       notification.unread ? 'bg-blue-50' : ''
//                     }`}
//                   >
//                     <p className="text-sm text-gray-800">{notification.message}</p>
//                     <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
//                   </div>
//                 ))}
//               </div>
//               <div className="p-2">
//                 <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 py-2">
//                   View all notifications
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* User Profile */}
//         <div className="relative">
//           <button
//             onClick={() => setShowProfileDropdown(!showProfileDropdown)}
//             className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
//           >
//             <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
//               <User className="h-5 w-5 text-white" />
//             </div>
//             <span className="text-sm font-medium text-gray-700 hidden md:block">John Doe</span>
//             <ChevronDown className="h-4 w-4 text-gray-500" />
//           </button>

//           {showProfileDropdown && (
//             <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
//               <div className="p-4 border-b border-gray-200">
//                 <p className="text-sm font-medium text-gray-900">John Doe</p>
//                 <p className="text-xs text-gray-500">john.doe@company.com</p>
//               </div>
//               <div className="py-2">
//                 <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
//                   <User className="h-4 w-4 mr-3" />
//                   Profile
//                 </button>
//                 <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
//                   <Settings className="h-4 w-4 mr-3" />
//                   Settings
//                 </button>
//                 <hr className="my-2" />
//                 <button className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
//                   <LogOut className="h-4 w-4 mr-3" />
//                   Logout
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Navbar;