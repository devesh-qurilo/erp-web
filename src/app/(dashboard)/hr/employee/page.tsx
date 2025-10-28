'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Employee {
  employeeId: string;
  name: string;
  email: string;
  profilePictureUrl: string | null;
  gender: string;
  birthday: string;
  bloodGroup: string;
  joiningDate: string;
  language: string;
  country: string;
  mobile: string;
  address: string;
  about: string;
  departmentId: number | null;
  departmentName: string | null;
  designationId: number | null;
  designationName: string | null;
  reportingToId: string | null;
  reportingToName: string | null;
  role: string;
  loginAllowed: boolean;
  receiveEmailNotification: boolean;
  hourlyRate: number;
  slackMemberId: string;
  skills: string[];
  probationEndDate: string | null;
  noticePeriodStartDate: string | null;
  noticePeriodEndDate: string | null;
  employmentType: string;
  maritalStatus: string;
  businessAddress: string;
  officeShift: string;
  active: boolean;
  createdAt: string;
}

interface ApiResponse {
  content: Employee[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    unsorted: boolean;
    sorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

export default function EmployeePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const PAGE_SIZE = 10;

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No access token found');
      const response = await fetch('/api/hr/employee?page=0&size=100', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Invalid or missing token');
        }
        throw new Error('Failed to fetch employees');
      }
      const data: ApiResponse = await response.json();
      setEmployees(data.content);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const deleteEmployee = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No access token found');
      const response = await fetch(`/api/hr/employee/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete employee');
      fetchEmployees(); // Refetch the list
    } catch (err: any) {
      alert(`Error deleting employee: ${err.message}`);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      !searchTerm ||
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'yes' && emp.active) ||
      (activeFilter === 'no' && !emp.active);
    return matchesSearch && matchesFilter;
  });

  const paginatedEmployees = filteredEmployees.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE
  );

  const totalPages = Math.ceil(filteredEmployees.length / PAGE_SIZE);
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Employee List</h1>
        <Link
          href="/hr/employee/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition-colors"
        >
          Add Employee
        </Link>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by name, email, or ID..."
          className="flex-1 border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(0); // Reset to first page on search
          }}
        />
        <select
          className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={activeFilter}
          onChange={(e) => {
            setActiveFilter(e.target.value);
            setCurrentPage(0); // Reset to first page on filter
          }}
        >
          <option value="all">All Status</option>
          <option value="yes">Active Only</option>
          <option value="no">Inactive Only</option>
        </select>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Employee ID
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Name
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Email
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Department
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Designation
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Role
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Skills
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Active
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedEmployees.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-500">
                  No employees match the criteria.
                </td>
              </tr>
            ) : (
              paginatedEmployees.map((employee) => (
                <tr key={employee.employeeId} className="hover:bg-gray-50">
                  <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b">
                    {employee.employeeId}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900 border-b">
                    {employee.name}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900 border-b">
                    {employee.email}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900 border-b">
                    {employee.departmentName || 'N/A'}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900 border-b">
                    {employee.designationName || 'N/A'}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900 border-b">
                    {employee.role}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900 border-b max-w-xs">
                    {employee.skills.slice(0, 3).join(', ') +
                      (employee.skills.length > 3 ? '...' : '')}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm border-b">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        employee.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {employee.active ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm font-medium border-b">
                    <div className="flex space-x-2">
                      <Link
                        href={`/hr/employee/${employee.employeeId}`}
                        className="text-blue-600 hover:text-blue-900 text-xs"
                      >
                        View
                      </Link>
                      <Link
                        href={`/hr/employee/${employee.employeeId}/edit`}
                        className="text-green-600 hover:text-green-900 text-xs"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteEmployee(employee.employeeId)}
                        className="text-red-600 hover:text-red-900 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm font-medium text-gray-700">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}