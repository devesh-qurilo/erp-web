// 'use client';

// import { useEffect, useState } from 'react';
// import Link from 'next/link';

// interface Employee {
//   employeeId: string;
//   name: string;
//   email: string;
//   profilePictureUrl: string | null;
//   gender: string;
//   birthday: string;
//   bloodGroup: string;
//   joiningDate: string;
//   language: string;
//   country: string;
//   mobile: string;
//   address: string;
//   about: string;
//   departmentId: number | null;
//   departmentName: string | null;
//   designationId: number | null;
//   designationName: string | null;
//   reportingToId: string | null;
//   reportingToName: string | null;
//   role: string;
//   loginAllowed: boolean;
//   receiveEmailNotification: boolean;
//   hourlyRate: number;
//   slackMemberId: string;
//   skills: string[];
//   probationEndDate: string | null;
//   noticePeriodStartDate: string | null;
//   noticePeriodEndDate: string | null;
//   employmentType: string;
//   maritalStatus: string;
//   businessAddress: string;
//   officeShift: string;
//   active: boolean;
//   createdAt: string;
// }

// interface ApiResponse {
//   content: Employee[];
//   pageable: {
//     pageNumber: number;
//     pageSize: number;
//     sort: {
//       empty: boolean;
//       unsorted: boolean;
//       sorted: boolean;
//     };
//     offset: number;
//     unpaged: boolean;
//     paged: boolean;
//   };
//   last: boolean;
//   totalPages: number;
//   totalElements: number;
//   first: boolean;
//   size: number;
//   number: number;
//   sort: {
//     empty: boolean;
//     unsorted: boolean;
//     sorted: boolean;
//   };
//   numberOfElements: number;
//   empty: boolean;
// }

// export default function EmployeePage() {
//   const [employees, setEmployees] = useState<Employee[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [activeFilter, setActiveFilter] = useState('all');
//   const [currentPage, setCurrentPage] = useState(0);
//   const PAGE_SIZE = 10;

//   const fetchEmployees = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('accessToken');
//       if (!token) throw new Error('No access token found');
//       const response = await fetch('/api/hr/employee?page=0&size=100', {
//         headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
//       });

//       if (!response.ok) {
//         if (response.status === 401) {
//           throw new Error('Unauthorized: Invalid or missing token');
//         }
//         throw new Error('Failed to fetch employees');
//       }
//       const data: ApiResponse = await response.json();
//       setEmployees(data.content);
//       setLoading(false);
//     } catch (err: any) {
//       setError(err.message);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchEmployees();
//   }, []);

//   const deleteEmployee = async (id: string) => {
//     if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) return;
//     try {
//       const token = localStorage.getItem('accessToken');
//       if (!token) throw new Error('No access token found');
//       const response = await fetch(`/api/hr/employee/${id}`, {
//         method: 'DELETE',
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!response.ok) throw new Error('Failed to delete employee');
//       fetchEmployees(); // Refetch the list
//     } catch (err: any) {
//       alert(`Error deleting employee: ${err.message}`);
//     }
//   };

//   const filteredEmployees = employees.filter((emp) => {
//     const matchesSearch =
//       !searchTerm ||
//       emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesFilter =
//       activeFilter === 'all' ||
//       (activeFilter === 'yes' && emp.active) ||
//       (activeFilter === 'no' && !emp.active);
//     return matchesSearch && matchesFilter;
//   });

//   const paginatedEmployees = filteredEmployees.slice(
//     currentPage * PAGE_SIZE,
//     (currentPage + 1) * PAGE_SIZE
//   );

//   const totalPages = Math.ceil(filteredEmployees.length / PAGE_SIZE);
//   const handlePageChange = (newPage: number) => {
//     if (newPage >= 0 && newPage < totalPages) {
//       setCurrentPage(newPage);
//     }
//   };

//   if (loading) {
//     return <div className="text-center py-10">Loading...</div>;
//   }

//   if (error) {
//     return <div className="text-center py-10 text-red-500">Error: {error}</div>;
//   }

//   return (
//     <div className="container mx-auto p-4">
//       <div className="mb-6 flex justify-between items-center">
//         <h1 className="text-3xl font-bold text-gray-800">Employee List</h1>
//         <Link
//           href="/hr/employee/new"
//           className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition-colors"
//         >
//           Add Employee
//         </Link>
//       </div>

//       <div className="mb-6 flex flex-col sm:flex-row gap-4">
//         <input
//           type="text"
//           placeholder="Search by name, email, or ID..."
//           className="flex-1 border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           value={searchTerm}
//           onChange={(e) => {
//             setSearchTerm(e.target.value);
//             setCurrentPage(0); // Reset to first page on search
//           }}
//         />
//         <select
//           className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           value={activeFilter}
//           onChange={(e) => {
//             setActiveFilter(e.target.value);
//             setCurrentPage(0); // Reset to first page on filter
//           }}
//         >
//           <option value="all">All Status</option>
//           <option value="yes">Active Only</option>
//           <option value="no">Inactive Only</option>
//         </select>
//       </div>

//       <div className="overflow-x-auto bg-white rounded-lg shadow-md">
//         <table className="min-w-full">
//           <thead>
//             <tr className="bg-gray-50">
//               <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
//                 Employee ID
//               </th>
//               <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
//                 Name
//               </th>
//               <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
//                 Email
//               </th>
//               <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
//                 Department
//               </th>
//               <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
//                 Designation
//               </th>
//               <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
//                 Role
//               </th>
//               <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
//                 Skills
//               </th>
//               <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
//                 Active
//               </th>
//               <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {paginatedEmployees.length === 0 ? (
//               <tr>
//                 <td colSpan={9} className="py-8 text-center text-gray-500">
//                   No employees match the criteria.
//                 </td>
//               </tr>
//             ) : (
//               paginatedEmployees.map((employee) => (
//                 <tr key={employee.employeeId} className="hover:bg-gray-50">
//                   <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b">
//                     {employee.employeeId}
//                   </td>
//                   <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900 border-b">
//                     {employee.name}
//                   </td>
//                   <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900 border-b">
//                     {employee.email}
//                   </td>
//                   <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900 border-b">
//                     {employee.departmentName || 'N/A'}
//                   </td>
//                   <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900 border-b">
//                     {employee.designationName || 'N/A'}
//                   </td>
//                   <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900 border-b">
//                     {employee.role}
//                   </td>
//                   <td className="py-4 px-4 text-sm text-gray-900 border-b max-w-xs">
//                     {employee.skills.slice(0, 3).join(', ') +
//                       (employee.skills.length > 3 ? '...' : '')}
//                   </td>
//                   <td className="py-4 px-4 whitespace-nowrap text-sm border-b">
//                     <span
//                       className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${employee.active
//                           ? 'bg-green-100 text-green-800'
//                           : 'bg-red-100 text-red-800'
//                         }`}
//                     >
//                       {employee.active ? 'Yes' : 'No'}
//                     </span>
//                   </td>
//                   <td className="py-4 px-4 whitespace-nowrap text-sm font-medium border-b">
//                     <div className="flex space-x-2">
//                       <Link
//                         href={`/hr/employee/${employee.employeeId}`}
//                         className="text-blue-600 hover:text-blue-900 text-xs"
//                       >
//                         View
//                       </Link>
//                       <Link
//                         href={`/hr/employee/${employee.employeeId}/edit`}
//                         className="text-green-600 hover:text-green-900 text-xs"
//                       >
//                         Edit
//                       </Link>
//                       <button
//                         onClick={() => deleteEmployee(employee.employeeId)}
//                         className="text-red-600 hover:text-red-900 text-xs"
//                       >
//                         Delete
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {totalPages > 1 && (
//         <div className="flex justify-center mt-6 space-x-4">
//           <button
//             onClick={() => handlePageChange(currentPage - 1)}
//             disabled={currentPage === 0}
//             className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             Previous
//           </button>
//           <span className="px-4 py-2 text-sm font-medium text-gray-700">
//             Page {currentPage + 1} of {totalPages}
//           </span>
//           <button
//             onClick={() => handlePageChange(currentPage + 1)}
//             disabled={currentPage >= totalPages - 1}
//             className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }









// 'use client';

// import { useEffect, useState } from 'react';
// import Link from 'next/link';

// interface Employee {
//   employeeId: string;
//   name: string;
//   email: string;
//   departmentName: string | null;
//   designationName: string | null;
//   role: string;
//   skills: string[];
//   active: boolean;
// }



// const BASE_URL = process.env.NEXT_PUBLIC_MAIN;
// export default function EmployeePage() {
//   const [employees, setEmployees] = useState<Employee[]>([]);
//   const [loading, setLoading] = useState(true);

//   // 🔹 FILTER STATES
//   const [search, setSearch] = useState('');
//   const [status, setStatus] = useState('all');

//   // 🔹 PAGINATION
//   const PAGE_SIZE = 9;
//   const [page, setPage] = useState(0);

//   // ================= FETCH =================
//   useEffect(() => {
//     const fetchEmployees = async () => {
//       const token = localStorage.getItem('accessToken');
//       const res = await fetch(`${BASE_URL}/employee?page=0&size=2000`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       setEmployees(data.content);
//       setLoading(false);
//     };
//     fetchEmployees();
//   }, []);

//   // ================= FILTER LOGIC =================
//   const filtered = employees.filter((e) => {
//     const matchSearch =
//       e.name.toLowerCase().includes(search.toLowerCase()) ||
//       e.email.toLowerCase().includes(search.toLowerCase()) ||
//       e.employeeId.toLowerCase().includes(search.toLowerCase());

//     const matchStatus =
//       status === 'all' ||
//       (status === 'active' && e.active) ||
//       (status === 'inactive' && !e.active);

//     return matchSearch && matchStatus;
//   });

//   const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
//   const data = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

//   if (loading) return <div className="p-6">Loading...</div>;

//   return (
//     <div className="p-6 space-y-6">

//       {/* ================= 1️⃣ FILTER SECTION ================= */}
//       <div className="bg-white rounded-lg border p-4 flex flex-wrap gap-4 items-center">
//         <input
//           placeholder="Search employee..."
//           className="border px-3 py-2 rounded w-64"
//           value={search}
//           onChange={(e) => {
//             setSearch(e.target.value);
//             setPage(0);
//           }}
//         />

//         <select
//           className="border px-3 py-2 rounded"
//           value={status}
//           onChange={(e) => {
//             setStatus(e.target.value);
//             setPage(0);
//           }}
//         >
//           <option value="all">All Status</option>
//           <option value="active">Active</option>
//           <option value="inactive">Inactive</option>
//         </select>
//       </div>

//       {/* ================= 2️⃣ ACTION BUTTON SECTION ================= */}
//       <div className="flex justify-between items-center">
//         <h1 className="text-xl font-semibold">Employees</h1>

//         <div className="flex gap-3">
//           <Link
//             href="/hr/employee/new"
//             className="bg-blue-600 text-white px-4 py-2 rounded"
//           >
//             + Add Employee
//           </Link>

//           <button className="border px-4 py-2 rounded">
//             + Invite Employee
//           </button>
//         </div>
//       </div>

//       {/* ================= 3️⃣ TABLE SECTION ================= */}
//       <div className="bg-white border rounded-lg overflow-x-auto">
//         <table className="w-full text-sm">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="p-3 text-left">Employee ID</th>
//               <th className="p-3 text-left">Name</th>
//               <th className="p-3 text-left">Email</th>
//               <th className="p-3 text-left">Department</th>
//               <th className="p-3 text-left">Designation</th>
//               <th className="p-3 text-left">Role</th>
//               <th className="p-3 text-left">Status</th>
//               <th className="p-3 text-left">Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {data.map((e) => (
//               <tr key={e.employeeId} className="border-t">
//                 <td className="p-3">{e.employeeId}</td>
//                 <td className="p-3">{e.name}</td>
//                 <td className="p-3">{e.email}</td>
//                 <td className="p-3">{e.departmentName || '—'}</td>
//                 <td className="p-3">{e.designationName || '—'}</td>
//                 <td className="p-3">{e.role}</td>
//                 <td className="p-3">
//                   <span
//                     className={`px-2 py-1 rounded text-xs ${e.active
//                       ? 'bg-green-100 text-green-700'
//                       : 'bg-red-100 text-red-700'
//                       }`}
//                   >
//                     {e.active ? 'Active' : 'Inactive'}
//                   </span>
//                 </td>
//                 <td className="p-3">
//                   <Link
//                     href={`/hr/employee/${e.employeeId}`}
//                     className="text-blue-600 text-xs mr-3"
//                   >
//                     View
//                   </Link>
//                   <Link
//                     href={`/hr/employee/${e.employeeId}/edit`}
//                     className="text-green-600 text-xs"
//                   >
//                     Edit
//                   </Link>
//                 </td>
//               </tr>
//             ))}

//             {data.length === 0 && (
//               <tr>
//                 <td colSpan={8} className="p-6 text-center text-gray-500">
//                   No employees found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* ================= PAGINATION ================= */}
//       {totalPages > 1 && (
//         <div className="flex justify-center gap-4">
//           <button
//             disabled={page === 0}
//             onClick={() => setPage(page - 1)}
//             className="px-3 py-1 border rounded disabled:opacity-50"
//           >
//             Prev
//           </button>
//           <span>
//             Page {page + 1} of {totalPages}
//           </span>
//           <button
//             disabled={page >= totalPages - 1}
//             onClick={() => setPage(page + 1)}
//             className="px-3 py-1 border rounded disabled:opacity-50"
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }




'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Employee {
  employeeId: string;
  name: string;
  email: string;
  departmentName: string | null;
  designationName: string | null;
  role: string;
  skills: string[];
  active: boolean;
}

const BASE_URL = process.env.NEXT_PUBLIC_MAIN;

export default function EmployeePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  // pagination
  const PAGE_SIZE = 9;
  const [page, setPage] = useState(0);

  // invite modal
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);


  /* ================= FETCH EMPLOYEES ================= */
  useEffect(() => {
    const fetchEmployees = async () => {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${BASE_URL}/employee?page=0&size=200`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEmployees(data.content);
      setLoading(false);
    };
    fetchEmployees();
  }, []);

  /* ================= INVITE API ================= */
  const sendInvite = async () => {
    if (!inviteEmail) {
      alert('Email is required');
      return;
    }

    setInviteLoading(true);
    try {
      const token = localStorage.getItem('accessToken');

      const res = await fetch(`${BASE_URL}/employee/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: inviteEmail,
          message: inviteMessage,
        }),
      });

      if (!res.ok) throw new Error('Failed to send invite');

      setInviteOpen(false);
      setInviteEmail('');
      setInviteMessage('');
      alert('Invitation sent successfully');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setInviteLoading(false);
    }
  };

  /* ================= FILTER LOGIC ================= */
  const filtered = employees.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      status === 'all' ||
      (status === 'active' && e.active) ||
      (status === 'inactive' && !e.active);

    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const data = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (loading) return <div className="p-6">Loading...</div>;


  const deleteEmployee = async (id: string) => {
    // if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
   const token = localStorage.getItem('accessToken');
      await fetch(`${BASE_URL}/employee/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      setEmployees((prev) => prev.filter((e) => e.employeeId !== id));
    } catch {
      alert('Failed to delete employee');
    }
  };


  return (
    <div className="p-6 space-y-6">

      {/* ================= FILTER ================= */}
      <div className="bg-white rounded-lg border p-4 flex gap-4">
        <input
          placeholder="Search employee..."
          className="border px-3 py-2 rounded w-64"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />

        <select
          className="border px-3 py-2 rounded"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Employees</h1>

        <div className="flex gap-3">
          <Link
            href="/hr/employee/new"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            + Add Employee
          </Link>

          <button
            onClick={() => setInviteOpen(true)}
            className="border px-4 py-2 rounded"
          >
            + Invite Employee
          </button>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Employee ID</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Department</th>
              <th className="p-3 text-left">Designation</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((e) => (
              <tr key={e.employeeId} className="border-t">
                <td className="p-3">{e.employeeId}</td>
                <td className="p-3">{e.name}</td>
                <td className="p-3">{e.email}</td>
                <td className="p-3">{e.departmentName || '—'}</td>
                <td className="p-3">{e.designationName || '—'}</td>
                <td className="p-3">{e.role}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs rounded ${e.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {e.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3 relative">
                  <button
                    onClick={() =>
                      setOpenMenuId(
                        openMenuId === e.employeeId ? null : e.employeeId
                      )
                    }
                    className="px-2 py-1 rounded hover:bg-gray-100"
                  >
                    ⋮
                  </button>

                  {openMenuId === e.employeeId && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-50">
                      <Link
                        href={`/hr/employee/${e.employeeId}`}
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={() => setOpenMenuId(null)}
                      >
                        View
                      </Link>

                      {/* <Link
                        href={`/hr/employee/${e.employeeId}/edit`}
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={() => setOpenMenuId(null)}
                      >
                        Edit
                      </Link> */}

                      <Link
                        href={`/hr/employee/${e.employeeId}/edit`}
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => {
                 
                          setOpenMenuId(null);
                          deleteEmployee(e.employeeId);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= INVITE MODAL ================= */}
      {inviteOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-xl p-6 relative">
            <button
              onClick={() => setInviteOpen(false)}
              className="absolute right-4 top-4 text-gray-400 text-xl"
            >
              ×
            </button>

            <h2 className="text-xl font-semibold mb-3">Invite Employee</h2>

            <div className="border rounded p-3 text-sm text-gray-600 mb-4">
              Employees will receive an email to log in and update their profile through the self-service portal.
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email *</label>
                <input
                  className="w-full border rounded px-3 py-2 mt-1"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Message</label>
                <textarea
                  className="w-full border rounded px-3 py-2 mt-1"
                  rows={4}
                  placeholder="Add a message (optional)"
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                />
              </div>

              <div className="flex justify-center mt-6">
                <button
                  disabled={inviteLoading}
                  onClick={sendInvite}
                  className="bg-blue-600 text-white px-8 py-2 rounded-lg"
                >
                  {inviteLoading ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
