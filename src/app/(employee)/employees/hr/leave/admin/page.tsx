// "use client";
// import { useEffect, useState } from "react";

// interface Leave {
//   id: number;
//   employeeId: string;
//   employeeName: string;
//   leaveType: string;
//   durationType: string;
//   startDate: string | null;
//   endDate: string | null;
//   singleDate: string | null;
//   reason: string;
//   status: string;
//   rejectionReason: string | null;
//   approvedByName: string | null;
//   isPaid: boolean;
//   approvedAt: string | null;
//   rejectedAt: string | null;
//   documentUrls: string[];
//   createdAt: string;
//   updatedAt: string;
// }

// export default function LeavesList() {
//   const [leaves, setLeaves] = useState<Leave[]>([]);
//   const [loadingId, setLoadingId] = useState<number | null>(null);

//   // Fetch leaves
//   const fetchLeaves = async () => {
//     const token = localStorage.getItem("accessToken");
//     if (!token) return;
//     const res = await fetch("/api/hr/leave", {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     const data = await res.json();

//     console.log("devesh level ", data)
//     setLeaves(data);
//   };

//   useEffect(() => {
//     fetchLeaves();
//   }, []);

//   // Approve leave
//   const approveLeave = async (leaveId: number) => {
//     const token = localStorage.getItem("accessToken");
//     if (!token) return;
//     setLoadingId(leaveId);
//     await fetch(`/api/hr/leave/${leaveId}/status`, {
//       method: "PATCH",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ status: "APPROVED" }),
//     });
//     await fetchLeaves();
//     setLoadingId(null);
//   };

//   // Reject leave
//   const rejectLeave = async (leaveId: number, reason: string) => {
//     const token = localStorage.getItem("accessToken");
//     if (!token) return;
//     if (!reason) {
//       alert("Please enter a reason for rejection.");
//       return;
//     }
//     setLoadingId(leaveId);
//     await fetch(`/api/hr/leave/${leaveId}/status`, {
//       method: "PATCH",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         status: "REJECTED",
//         rejectionReason: reason,
//       }),
//     });
//     await fetchLeaves();
//     setLoadingId(null);
//   };

//   // Get display dates
//   const getDisplayDates = (leave: Leave) => {
//     if (leave.singleDate) {
//       return leave.singleDate;
//     }
//     if (leave.startDate && leave.endDate) {
//       return `${leave.startDate} to ${leave.endDate}`;
//     }
//     return "N/A";
//   };

//   // Get status color class
//   const getStatusClass = (status: string) => {
//     switch (status) {
//       case "APPROVED":
//         return "bg-green-100 text-green-800";
//       case "REJECTED":
//         return "bg-red-100 text-red-800";
//       case "PENDING":
//         return "bg-yellow-100 text-yellow-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   if (leaves.length === 0) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <p className="text-gray-500">No leaves found.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 bg-white rounded-lg shadow-md">
//       <h2 className="text-2xl font-bold mb-6 text-gray-800">Employee Leaves</h2>
//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Employee
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Leave Type
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Duration
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Dates
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Reason
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Status
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {leaves.map((leave) => (
//               <tr key={leave.id} className="hover:bg-gray-50">
//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                   {leave.employeeName}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                   {leave.leaveType}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                   {leave.durationType}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                   {getDisplayDates(leave)}
//                 </td>
//                 <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
//                   {leave.reason}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <span
//                     className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(
//                       leave.status
//                     )}`}
//                   >
//                     {leave.status}
//                   </span>
//                   {leave.status === "REJECTED" && leave.rejectionReason && (
//                     <div className="mt-1 text-xs text-red-600">
//                       Reason: {leave.rejectionReason}
//                     </div>
//                   )}
//                   {leave.status === "APPROVED" && leave.approvedByName && (
//                     <div className="mt-1 text-xs text-green-600">
//                       Approved by: {leave.approvedByName}
//                     </div>
//                   )}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                   {leave.status === "PENDING" && (
//                     <div className="flex gap-2">
//                       <button
//                         onClick={() => approveLeave(leave.id)}
//                         disabled={loadingId === leave.id}
//                         className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                       >
//                         {loadingId === leave.id ? "Processing..." : "Approve"}
//                       </button>
//                       <button
//                         onClick={() => {
//                           const reason = prompt("Enter rejection reason:");
//                           if (reason) {
//                             rejectLeave(leave.id, reason);
//                           }
//                         }}
//                         disabled={loadingId === leave.id}
//                         className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                       >
//                         {loadingId === leave.id ? "Processing..." : "Reject"}
//                       </button>
//                     </div>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }






// "use client";
// import { useEffect, useMemo, useState } from "react";

// interface Leave {
//   id: number;
//   employeeId: string;
//   employeeName: string;
//   leaveType: string;
//   durationType: string;
//   startDate: string | null;
//   endDate: string | null;
//   singleDate: string | null;
//   reason: string;
//   status: string;
//   rejectionReason: string | null;
//   approvedByName: string | null;
//   isPaid: boolean;
//   approvedAt: string | null;
//   rejectedAt: string | null;
//   documentUrls: string[];
//   createdAt: string;
//   updatedAt: string;
// }

// interface LeaveQuota {
//   id: number;
//   leaveType: string;
//   totalLeaves: number;
//   monthlyLimit: number;
//   totalTaken: number;
//   overUtilized: number;
//   remainingLeaves: number;
// }



// const BASE_URL = process.env.NEXT_PUBLIC_MAIN;
// export default function LeavesPage() {
//   /* ================= STATE ================= */
//   const [view, setView] = useState<"LIST" | "CALENDAR" | "PROFILE">("LIST");
//   const [leaves, setLeaves] = useState<Leave[]>([]);
//   const [quota, setQuota] = useState<LeaveQuota[]>([]);
//   const [loadingId, setLoadingId] = useState<number | null>(null);

//   /* ================= FILTER STATE ================= */
//   const [filters, setFilters] = useState({
//     fromDate: "",
//     toDate: "",
//     status: "",
//     leaveType: "",
//     paid: "",
//   });

//   const employeeId =
//     typeof window !== "undefined"
//       ? localStorage.getItem("employeeId")
//       : null;

//   /* ================= FETCH LEAVES ================= */
//   const fetchLeaves = async () => {
//     const token = localStorage.getItem("accessToken");
//     if (!token) return;

//     const res = await fetch(`${BASE_URL}/employee/api/leaves`, {
//       method: "GET",
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     setLeaves(await res.json());
//   };

//   /* ================= FETCH QUOTA ================= */
//   const fetchQuota = async () => {
//     const employeeId = localStorage.getItem("employeeId");
//     const token = localStorage.getItem("accessToken");
//     // if (!employeeId) return;
//     const res = await fetch(
//       `${BASE_URL}/employee/leave-quota/employee/${employeeId}`, {
//       method: "GET",
//       headers: { Authorization: `Bearer ${token}` },
//     }
//     );
//     setQuota(await res.json());
//   };

//   useEffect(() => {
//     fetchLeaves();
//   }, []);

//   useEffect(() => {
//     if (view === "PROFILE") fetchQuota();
//   }, [view]);

//   /* ================= FILTERED DATA ================= */
//   const filteredLeaves = useMemo(() => {
//     return leaves.filter((l) => {
//       const baseDate = l.singleDate ?? l.startDate;
//       if (!baseDate) return false;

//       if (filters.fromDate && baseDate < filters.fromDate) return false;
//       if (filters.toDate && baseDate > filters.toDate) return false;
//       if (filters.status && l.status !== filters.status) return false;
//       if (filters.leaveType && l.leaveType !== filters.leaveType) return false;
//       if (filters.paid !== "" && String(l.isPaid) !== filters.paid) return false;

//       return true;
//     });
//   }, [leaves, filters]);

//   /* ================= HELPERS (UNCHANGED) ================= */
//   const getDisplayDates = (leave: Leave) => {
//     if (leave.singleDate) return leave.singleDate;
//     if (leave.startDate && leave.endDate) {
//       return `${leave.startDate} to ${leave.endDate}`;
//     }
//     return "N/A";
//   };

//   const getStatusClass = (status: string) => {
//     switch (status) {
//       case "APPROVED":
//         return "bg-green-100 text-green-800";
//       case "REJECTED":
//         return "bg-red-100 text-red-800";
//       case "PENDING":
//         return "bg-yellow-100 text-yellow-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   /* ================= UI ================= */
//   return (
//     <div className="p-6 bg-white rounded-lg shadow-md">

//       {/* ================= ACTION BUTTON SECTION (ALWAYS VISIBLE) ================= */}
//       <div className="flex justify-between items-center mb-4">
//         <button className="bg-blue-600 text-white px-4 py-2 rounded">
//           + New Leave
//         </button>

//         <div className="flex gap-2">
//           <button
//             className={view === "LIST" ? "bg-blue-100 px-3 py-2 rounded" : "px-3 py-2"}
//             onClick={() => setView("LIST")}
//           >
//             📋
//           </button>
//           <button
//             className={view === "CALENDAR" ? "bg-blue-100 px-3 py-2 rounded" : "px-3 py-2"}
//             onClick={() => setView("CALENDAR")}
//           >
//             📅
//           </button>
//           <button
//             className={view === "PROFILE" ? "bg-blue-100 px-3 py-2 rounded" : "px-3 py-2"}
//             onClick={() => setView("PROFILE")}
//           >
//             👤
//           </button>
//         </div>
//       </div>

//       {/* ================= FILTER SECTION (ONLY LIST VIEW) ================= */}
//       {view === "LIST" && (
//         <div className="flex flex-wrap gap-3 mb-6 border-b pb-4">
//           <input type="date" onChange={e => setFilters(f => ({ ...f, fromDate: e.target.value }))} />
//           <input type="date" onChange={e => setFilters(f => ({ ...f, toDate: e.target.value }))} />

//           <select onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
//             <option value="">Status</option>
//             <option value="APPROVED">Approved</option>
//             <option value="PENDING">Pending</option>
//             <option value="REJECTED">Rejected</option>
//           </select>

//           <select onChange={e => setFilters(f => ({ ...f, leaveType: e.target.value }))}>
//             <option value="">Leave Type</option>
//             <option value="SICK">Sick</option>
//             <option value="CASUAL">Casual</option>
//             <option value="EARNED">Earned</option>
//           </select>

//           <select onChange={e => setFilters(f => ({ ...f, paid: e.target.value }))}>
//             <option value="">Paid</option>
//             <option value="true">Paid</option>
//             <option value="false">Unpaid</option>
//           </select>

//           <button className="px-4 py-1 bg-blue-600 text-white rounded">
//             Apply
//           </button>

//           <button
//             className="px-4 py-1 border rounded"
//             onClick={() =>
//               setFilters({
//                 fromDate: "",
//                 toDate: "",
//                 status: "",
//                 leaveType: "",
//                 paid: "",
//               })
//             }
//           >
//             Clear
//           </button>
//         </div>
//       )}

//       {/* ================= TABLE (ONLY LIST VIEW, UNCHANGED) ================= */}
//       {view === "LIST" && (
//         <div className="overflow-x-auto">
//           {/* 👇 YOUR TABLE JSX – SAME AS BEFORE */}
//           {/* using filteredLeaves instead of leaves */}
//           {/* paste your table tbody exactly here */}
//         </div>
//       )}

//       {/* ================= CALENDAR VIEW ================= */}
//       {view === "CALENDAR" && (
//         <div className="text-center py-20 text-gray-500">
//           Calendar UI here (uses filteredLeaves)
//         </div>
//       )}

//       {/* ================= PROFILE VIEW ================= */}
//       {view === "PROFILE" && (
//         <div className="overflow-x-auto">
//           <table className="min-w-full border">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="p-3 text-left">Leave Type</th>
//                 <th className="p-3">Total</th>
//                 <th className="p-3">Monthly</th>
//                 <th className="p-3">Taken</th>
//                 <th className="p-3">Over</th>
//                 <th className="p-3">Remaining</th>
//               </tr>
//             </thead>
//             <tbody>
//               {quota.map(q => (
//                 <tr key={q.id} className="border-t">
//                   <td className="p-3">{q.leaveType}</td>
//                   <td className="p-3">{q.totalLeaves}</td>
//                   <td className="p-3">{q.monthlyLimit}</td>
//                   <td className="p-3">{q.totalTaken}</td>
//                   <td className="p-3">{q.overUtilized}</td>
//                   <td className="p-3">{q.remainingLeaves}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }




















// "use client";
// import { useEffect, useMemo, useState } from "react";

// interface Leave {
//   id: number;
//   employeeId: string;
//   employeeName: string;
//   leaveType: string;
//   durationType: string;
//   startDate: string | null;
//   endDate: string | null;
//   singleDate: string | null;
//   reason: string;
//   status: string;
//   rejectionReason: string | null;
//   approvedByName: string | null;
//   isPaid: boolean;
//   approvedAt: string | null;
//   rejectedAt: string | null;
//   documentUrls: string[];
//   createdAt: string;
//   updatedAt: string;
// }

// interface LeaveQuota {
//   id: number;
//   leaveType: string;
//   totalLeaves: number;
//   monthlyLimit: number;
//   totalTaken: number;
//   overUtilized: number;
//   remainingLeaves: number;
// }



// const BASE_URL = process.env.NEXT_PUBLIC_MAIN;
// export default function LeavesList() {
//   /* ================= BASIC STATE ================= */
//   const [view, setView] = useState<"LIST" | "CALENDAR" | "PROFILE">("LIST");
//   const [leaves, setLeaves] = useState<Leave[]>([]);
//   const [quota, setQuota] = useState<LeaveQuota[]>([]);
//   const [loadingId, setLoadingId] = useState<number | null>(null);

//   /* ================= FILTER STATE ================= */
//   const [filters, setFilters] = useState({
//     fromDate: "",
//     toDate: "",
//     status: "",
//     leaveType: "",
//     paid: "",
//   });

//   /* ================= FETCH LEAVES ================= */
//   const fetchLeaves = async () => {
//     const token = localStorage.getItem("accessToken");
//     if (!token) return;

//     const res = await fetch(`${BASE_URL}/employee/api/leaves/my-leaves`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     setLeaves(await res.json());
//   };

//   /* ================= FETCH PROFILE QUOTA ================= */
//   const fetchQuota = async () => {
//     const empId = localStorage.getItem("employeeId");
//     const token = localStorage.getItem("accessToken");
//     if (!empId) return;

//     const res = await fetch(`${BASE_URL}/employee/leave-quota/me`, {
//       method: "GET",
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     setQuota(await res.json());
//   };

//   useEffect(() => {
//     fetchLeaves();
//   }, []);

//   useEffect(() => {
//     if (view === "PROFILE") fetchQuota();
//   }, [view]);

//   /* ================= FILTER LOGIC ================= */
//   const filteredLeaves = useMemo(() => {
//     return leaves.filter((l) => {
//       const date = l.singleDate ?? l.startDate;
//       if (!date) return false;

//       if (filters.fromDate && date < filters.fromDate) return false;
//       if (filters.toDate && date > filters.toDate) return false;
//       if (filters.status && l.status !== filters.status) return false;
//       if (filters.leaveType && l.leaveType !== filters.leaveType) return false;
//       if (filters.paid !== "" && String(l.isPaid) !== filters.paid) return false;

//       return true;
//     });
//   }, [leaves, filters]);

//   /* ================= CALENDAR HELPERS ================= */
//   const [currentMonth, setCurrentMonth] = useState(new Date());

//   const year = currentMonth.getFullYear();
//   const month = currentMonth.getMonth(); // 0-based

//   const daysInMonth = new Date(year, month + 1, 0).getDate();
//   const startDay = new Date(year, month, 1).getDay(); // 0=Sun

//   // Map: YYYY-MM-DD -> Leave[]
//   const calendarMap = useMemo(() => {
//     const map: Record<string, Leave[]> = {};

//     filteredLeaves.forEach((l) => {
//       if (l.singleDate) {
//         map[l.singleDate] = [...(map[l.singleDate] || []), l];
//       } else if (l.startDate && l.endDate) {
//         let d = new Date(l.startDate);
//         const end = new Date(l.endDate);

//         while (d <= end) {
//           const key = d.toISOString().split("T")[0];
//           map[key] = [...(map[key] || []), l];
//           d.setDate(d.getDate() + 1);
//         }
//       }
//     });

//     return map;
//   }, [filteredLeaves]);


//   /* ================= ACTIONS (UNCHANGED) ================= */
//   const approveLeave = async (id: number) => {
//     const token = localStorage.getItem("accessToken");
//     if (!token) return;

//     setLoadingId(id);
//     await fetch(`${BASE_URL}/employee/api/leaves/${id}/status`, {
//       method: "PATCH",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ status: "APPROVED" }),
//     });
//     await fetchLeaves();
//     setLoadingId(null);
//   };

//   const rejectLeave = async (id: number, reason: string) => {
//     const token = localStorage.getItem("accessToken");
//     if (!token || !reason) return;

//     setLoadingId(id);
//     await fetch(`${BASE_URL}/employee/api/leaves/${id}/status`, {
//       method: "PATCH",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         status: "REJECTED",
//         rejectionReason: reason,
//       }),
//     });
//     await fetchLeaves();
//     setLoadingId(null);
//   };

//   /* ================= HELPERS (UNCHANGED) ================= */
//   const getDisplayDates = (leave: Leave) => {
//     if (leave.singleDate) return leave.singleDate;
//     if (leave.startDate && leave.endDate)
//       return `${leave.startDate} to ${leave.endDate}`;
//     return "N/A";
//   };

//   const getStatusClass = (status: string) => {
//     switch (status) {
//       case "APPROVED":
//         return "bg-green-100 text-green-800";
//       case "REJECTED":
//         return "bg-red-100 text-red-800";
//       case "PENDING":
//         return "bg-yellow-100 text-yellow-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   return (
//     <div className="p-6 bg-white rounded-lg shadow-md">

//       {/* ================= ACTION BUTTONS (ALWAYS) ================= */}
//       <div className="flex justify-between items-center mb-4">
//         <button className="bg-blue-600 text-white px-4 py-2 rounded">
//           + New Leave
//         </button>

//         <div className="flex gap-2">
//           <button onClick={() => setView("LIST")}>📋</button>
//           <button onClick={() => setView("CALENDAR")}>📅</button>
//           <button onClick={() => setView("PROFILE")}>👤</button>
//         </div>
//       </div>

//       {/* ================= FILTER (ONLY LIST) ================= */}
//       {view === "LIST" && (
//         <div className="flex flex-wrap gap-3 mb-6 border-b pb-4">
//           <input type="date" onChange={e => setFilters(f => ({ ...f, fromDate: e.target.value }))} />
//           <input type="date" onChange={e => setFilters(f => ({ ...f, toDate: e.target.value }))} />

//           <select onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
//             <option value="">Status</option>
//             <option value="APPROVED">Approved</option>
//             <option value="PENDING">Pending</option>
//             <option value="REJECTED">Rejected</option>
//           </select>

//           <select onChange={e => setFilters(f => ({ ...f, leaveType: e.target.value }))}>
//             <option value="">Leave Type</option>
//             <option value="SICK">Sick</option>
//             <option value="CASUAL">Casual</option>
//             <option value="EARNED">Earned</option>
//           </select>

//           <select onChange={e => setFilters(f => ({ ...f, paid: e.target.value }))}>
//             <option value="">Paid</option>
//             <option value="true">Paid</option>
//             <option value="false">Unpaid</option>
//           </select>
//         </div>
//       )}

//       {/* ================= TABLE (UNCHANGED) ================= */}
//       {view === "LIST" && (
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredLeaves.map((leave) => (
//                 <tr key={leave.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4">{leave.employeeName}</td>
//                   <td className="px-6 py-4">{leave.leaveType}</td>
//                   <td className="px-6 py-4">{leave.durationType}</td>
//                   <td className="px-6 py-4">{getDisplayDates(leave)}</td>
//                   <td className="px-6 py-4 max-w-xs truncate">{leave.reason}</td>
//                   <td className="px-6 py-4">
//                     <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(leave.status)}`}>
//                       {leave.status}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4">
//                     {leave.status === "PENDING" && (
//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => approveLeave(leave.id)}
//                           disabled={loadingId === leave.id}
//                           className="bg-green-600 text-white px-3 py-1 rounded"
//                         >
//                           Approve
//                         </button>
//                         <button
//                           onClick={() => {
//                             const r = prompt("Enter rejection reason:");
//                             if (r) rejectLeave(leave.id, r);
//                           }}
//                           disabled={loadingId === leave.id}
//                           className="bg-red-600 text-white px-3 py-1 rounded"
//                         >
//                           Reject
//                         </button>
//                       </div>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* ================= CALENDAR ================= */}
//       {view === "CALENDAR" && (
//         <div>

//           {/* ===== MONTH HEADER ===== */}
//           <div className="flex justify-between items-center mb-4">
//             <button
//               className="px-3 py-1 border rounded"
//               onClick={() => setCurrentMonth(new Date(year, month - 1))}
//             >
//               ←
//             </button>

//             <h2 className="text-lg font-semibold">
//               {currentMonth.toLocaleString("default", { month: "long" })} {year}
//             </h2>

//             <button
//               className="px-3 py-1 border rounded"
//               onClick={() => setCurrentMonth(new Date(year, month + 1))}
//             >
//               →
//             </button>
//           </div>

//           {/* ===== WEEK HEADER ===== */}
//           <div className="grid grid-cols-7 text-center font-medium mb-2">
//             {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
//               <div key={d}>{d}</div>
//             ))}
//           </div>

//           {/* ===== DATE GRID ===== */}
//           <div className="grid grid-cols-7 gap-2 text-sm">

//             {/* Empty cells before month start */}
//             {Array.from({ length: startDay }).map((_, i) => (
//               <div key={`empty-${i}`} />
//             ))}

//             {/* Dates */}
//             {Array.from({ length: daysInMonth }).map((_, i) => {
//               const day = i + 1;
//               const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

//               return (
//                 <div
//                   key={dateKey}
//                   className="border rounded p-1 min-h-[90px] bg-gray-50"
//                 >
//                   <div className="font-semibold mb-1">{day}</div>

//                   {calendarMap[dateKey]?.map((l) => (
//                     <div
//                       key={l.id}
//                       className={`text-xs mb-1 px-1 rounded
//                   ${l.status === "APPROVED"
//                           ? "bg-green-100 text-green-800"
//                           : l.status === "REJECTED"
//                             ? "bg-red-100 text-red-800"
//                             : "bg-yellow-100 text-yellow-800"
//                         }`}
//                     >
//                       {l.employeeName} ({l.leaveType})
//                     </div>
//                   ))}
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}


//       {/* ================= PROFILE ================= */}
//       {view === "PROFILE" && (
//         <div className="overflow-x-auto">
//           <table className="min-w-full border">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="p-3 text-left">Leave Type</th>
//                 <th className="p-3">Total</th>
//                 <th className="p-3">Monthly</th>
//                 <th className="p-3">Taken</th>
//                 <th className="p-3">Over</th>
//                 <th className="p-3">Remaining</th>
//               </tr>
//             </thead>
//             <tbody>
//               {quota.map(q => (
//                 <tr key={q.id} className="border-t">
//                   <td className="p-3">{q.leaveType}</td>
//                   <td className="p-3">{q.totalLeaves}</td>
//                   <td className="p-3">{q.monthlyLimit}</td>
//                   <td className="p-3">{q.totalTaken}</td>
//                   <td className="p-3">{q.overUtilized}</td>
//                   <td className="p-3">{q.remainingLeaves}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }







"use client";
import { useEffect, useMemo, useState } from "react";
import LeaveActionMenu from "./LeaveActionMenu";
import { useRouter } from "next/navigation";
import NewLeaveDrawer from "./NewLeaveDrawer";
import { Calendar, List, User } from "lucide-react";

/* ================= TYPES ================= */
interface Leave {
  id: number;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  durationType: string;
  startDate: string | null;
  endDate: string | null;
  singleDate: string | null;
  reason: string;
  status: string;
  rejectionReason: string | null;
  approvedByName: string | null;
  isPaid: boolean;
  approvedAt: string | null;
  rejectedAt: string | null;
  documentUrls: string[];
  createdAt: string;
  updatedAt: string;
}

interface LeaveQuota {
  id: number;
  leaveType: string;
  totalLeaves: number;
  monthlyLimit: number;
  totalTaken: number;
  overUtilized: number;
  remainingLeaves: number;
}

interface EmployeeProfile {
  employeeId: string;
  name: string;
  profilePictureUrl?: string;
  designationName?: string;
  departmentName?: string;
  createdAt?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_MAIN;

export default function LeavesList() {
  /* ================= BASIC STATE ================= */
  const [view, setView] = useState<"LIST" | "CALENDAR" | "PROFILE">("LIST");
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [quota, setQuota] = useState<LeaveQuota[]>([]);
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [openNewLeave, setOpenNewLeave] = useState(false);
  const Router = useRouter();

  /* ================= FILTER STATE ================= */
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    status: "",
    leaveType: "",
    paid: "",
  });

  /* ================= FETCH LEAVES ================= */
  const fetchLeaves = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const res = await fetch(`${BASE_URL}/employee/api/leaves/my-leaves`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLeaves(await res.json());
  };

  /* ================= FETCH QUOTA ================= */
  const fetchQuota = async () => {
    const empId = localStorage.getItem("employeeId");
    const token = localStorage.getItem("accessToken");
    if (!empId || !token) return;

    const res = await fetch(
      `${BASE_URL}/employee/leave-quota/me`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setQuota(await res.json());
  };

  /* ================= FETCH EMPLOYEE ================= */
  const fetchEmployee = async () => {
    const empId = localStorage.getItem("employeeId");
    const token = localStorage.getItem("accessToken");
    if (!empId || !token) return;

    const res = await fetch(`${BASE_URL}/employee/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setEmployee(await res.json());
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  useEffect(() => {
    if (view === "PROFILE") {
      fetchQuota();
      fetchEmployee();
    }
  }, [view]);

  /* ================= FILTER LOGIC ================= */
  const filteredLeaves = useMemo(() => {
    return leaves.filter((l) => {
      const date = l.singleDate ?? l.startDate;
      if (!date) return false;

      if (filters.fromDate && date < filters.fromDate) return false;
      if (filters.toDate && date > filters.toDate) return false;
      if (filters.status && l.status !== filters.status) return false;
      if (filters.leaveType && l.leaveType !== filters.leaveType) return false;
      if (filters.paid !== "" && String(l.isPaid) !== filters.paid) return false;

      return true;
    });
  }, [leaves, filters]);

  /* ================= CALENDAR HELPERS ================= */
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const calendarMap = useMemo(() => {
    const map: Record<string, Leave[]> = {};
    filteredLeaves.forEach((l) => {
      if (l.singleDate) {
        map[l.singleDate] = [...(map[l.singleDate] || []), l];
      } else if (l.startDate && l.endDate) {
        let d = new Date(l.startDate);
        const end = new Date(l.endDate);
        while (d <= end) {
          const key = d.toISOString().split("T")[0];
          map[key] = [...(map[key] || []), l];
          d.setDate(d.getDate() + 1);
        }
      }
    });
    return map;
  }, [filteredLeaves]);

  /* ================= HELPERS ================= */
  const remainingLeaves = useMemo(
    () => quota.reduce((s, q) => s + q.remainingLeaves, 0),
    [quota]
  );

  const getDisplayDates = (leave: Leave) => {
    if (leave.singleDate) return leave.singleDate;
    if (leave.startDate && leave.endDate)
      return `${leave.startDate} to ${leave.endDate}`;
    return "N/A";
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "text-green-700 flex items-center gap-2";
      case "REJECTED":
        return "text-red-600 flex items-center gap-2";
      case "PENDING":
        return "text-yellow-600 flex items-center gap-2";
      default:
        return "text-gray-600";
    }
  };

  /* ================= ACTIONS ================= */
  const approveLeave = async (id: number) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    setLoadingId(id);
    await fetch(`${BASE_URL}/employee/api/leaves/${id}/status`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "APPROVED" }),
    });
    await fetchLeaves();
    setLoadingId(null);
  };

  const rejectLeave = async (id: number, reason: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token || !reason) return;
    setLoadingId(id);
    await fetch(`${BASE_URL}/employee/api/leaves/${id}/status`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "REJECTED", rejectionReason: reason }),
    });
    await fetchLeaves();
    setLoadingId(null);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">

      {/* ================= TOP BAR ================= */}
      <div className="flex justify-between items-center mb-4">
        {view !== "PROFILE" && (
          <>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => setOpenNewLeave(true)}
            >
              + New Leave
            </button>

            <NewLeaveDrawer
              open={openNewLeave}
              onClose={() => setOpenNewLeave(false)}
              onSuccess={fetchLeaves}
            />
          </>
        )}


         {/* ================= PROFILE HEADER ================= */}
      {view === "PROFILE" && employee && (
        <div className="flex gap-6 mb-6">
          <div className="flex items-center gap-4 border rounded-xl p-4 w-1/2">
            <img
              src={employee.profilePictureUrl || "/avatar.png"}
              className="w-14 h-14 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold">{employee.name}</h3>
              <p className="text-sm text-gray-500">
                {employee.designationName} · {employee.departmentName}
              </p>
              <p className="text-xs text-gray-400">
                Last login: {employee.createdAt?.split("T")[0]}
              </p>
            </div>
          </div>

          <div className="border rounded-xl p-4 w-1/2">
            <p className="text-sm text-gray-500">Remaining Leaves</p>
            <p className="text-2xl font-semibold text-blue-600">
              {remainingLeaves}
            </p>
          </div>
        </div>
      )}


        <div className="flex gap-2">
          <List onClick={() => setView("LIST")} />
          <Calendar onClick={() => setView("CALENDAR")} />
          <User onClick={() => setView("PROFILE")} />
        </div>
      </div>

     


 {/* ================= LEAVE QUOTA TABLE (RESTORED) ================= */}
      {view === "PROFILE" && (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Leave Type</th>
                <th className="p-3">Total</th>
                <th className="p-3">Monthly</th>
                <th className="p-3">Taken</th>
                <th className="p-3">Over</th>
                <th className="p-3">Remaining</th>
              </tr>
            </thead>
            <tbody>
              {quota.map((q) => (
                <tr key={q.id} className="border-t">
                  <td className="p-3">{q.leaveType}</td>
                  <td className="p-3">{q.totalLeaves}</td>
                  <td className="p-3">{q.monthlyLimit}</td>
                  <td className="p-3">{q.totalTaken}</td>
                  <td className="p-3">{q.overUtilized}</td>
                  <td className="p-3">{q.remainingLeaves}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}




      {/* ================= LIST VIEW ================= */}
      {view === "LIST" && (
        <>
          {/* FILTERS */}
          <div className="flex flex-wrap gap-3 mb-6">
            <input type="date" className="border py-3 px-6 rounded-2xl"
              onChange={(e) => setFilters(f => ({ ...f, fromDate: e.target.value }))} />
            <input type="date" className="border py-3 px-6 rounded-2xl"
              onChange={(e) => setFilters(f => ({ ...f, toDate: e.target.value }))} />
            <select className="border py-3 px-6 rounded-2xl"
              onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}>
              <option value="">Status</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <select className="border py-3 px-6 rounded-2xl"
              onChange={(e) => setFilters(f => ({ ...f, leaveType: e.target.value }))}>
              <option value="">Leave Type</option>
              <option value="SICK">Sick</option>
              <option value="CASUAL">Casual</option>
              <option value="EARNED">Earned</option>
            </select>
            <select className="border py-3 px-6 rounded-2xl"
              onChange={(e) => setFilters(f => ({ ...f, paid: e.target.value }))}>
              <option value="">Paid</option>
              <option value="true">Paid</option>
              <option value="false">Unpaid</option>
            </select>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Leave Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{leave.employeeName}</td>
                    <td className="px-6 py-4">{leave.leaveType}</td>
                    <td className="px-6 py-4">{leave.durationType}</td>
                    <td className="px-6 py-4">{getDisplayDates(leave)}</td>
                    <td className="px-6 py-4 max-w-xs truncate">{leave.reason}</td>
                    <td className="px-6 py-4">
                      <span className={getStatusClass(leave.status)}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <LeaveActionMenu
                        status={leave.status}
                        loading={loadingId === leave.id}
                        onView={() => Router.push(`/hr/leave/admin/${leave.id}`)}
                        onApprove={() => approveLeave(leave.id)}
                        onReject={() => {
                          const reason = prompt("Enter rejection reason");
                          if (reason) rejectLeave(leave.id, reason);
                        }}  
                        onDelete={() => confirm("Delete this leave?")}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ================= CALENDAR VIEW ================= */}
      {view === "CALENDAR" && (
        <div>
          <div className="flex justify-between mb-4">
            <button onClick={() => setCurrentMonth(new Date(year, month - 1))}>←</button>
            <h2 className="font-semibold">
              {currentMonth.toLocaleString("default", { month: "long" })} {year}
            </h2>
            <button onClick={() => setCurrentMonth(new Date(year, month + 1))}>→</button>
          </div>

          <div className="grid grid-cols-7 text-center font-medium mb-2">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <div key={d}>{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: startDay }).map((_, i) => <div key={i} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const key = `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
              return (
                <div key={key} className="border rounded p-1 min-h-[90px]">
                  <div className="font-semibold">{day}</div>
                  {calendarMap[key]?.map(l => (
                    <div key={l.id} className="text-xs bg-blue-100 rounded px-1 mt-1">
                      {l.employeeName} ({l.leaveType})
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
