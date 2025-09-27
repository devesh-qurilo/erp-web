'use client';

import { useEffect, useState } from 'react';

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
  

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
         const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No access token found');
        const response = await fetch('/api/hr/employee', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

        if (!response.ok) {
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

    fetchEmployees();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Employee List</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Employee ID</th>
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">Email</th>
              <th className="py-2 px-4 border-b text-left">Department</th>
              <th className="py-2 px-4 border-b text-left">Designation</th>
              <th className="py-2 px-4 border-b text-left">Role</th>
              <th className="py-2 px-4 border-b text-left">Skills</th>
              <th className="py-2 px-4 border-b text-left">Active</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.employeeId} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{employee.employeeId}</td>
                <td className="py-2 px-4 border-b">{employee.name}</td>
                <td className="py-2 px-4 border-b">{employee.email}</td>
                <td className="py-2 px-4 border-b">{employee.departmentName || 'N/A'}</td>
                <td className="py-2 px-4 border-b">{employee.designationName || 'N/A'}</td>
                <td className="py-2 px-4 border-b">{employee.role}</td>
                <td className="py-2 px-4 border-b">{employee.skills.join(', ')}</td>
                <td className="py-2 px-4 border-b">
                  {employee.active ? (
                    <span className="text-green-500">Yes</span>
                  ) : (
                    <span className="text-red-500">No</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}