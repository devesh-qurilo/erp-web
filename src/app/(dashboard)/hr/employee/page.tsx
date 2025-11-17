"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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
  // other fields omitted for brevity
}

export default function EmployeePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // search & filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [reportingToFilter, setReportingToFilter] = useState<"all" | string>(
    "all"
  );
  const [departmentFilter, setDepartmentFilter] = useState<"all" | string>(
    "all"
  );
  const [designationFilter, setDesignationFilter] = useState<"all" | string>(
    "all"
  );
  const [roleFilter, setRoleFilter] = useState<"all" | string>("all");

  // pagination
  const [currentPage, setCurrentPage] = useState(0);
  const PAGE_SIZE = 10;

  // actions modal
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No access token found");
      const resp = await fetch("/api/hr/employee?page=0&size=100", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!resp.ok) {
        if (resp.status === 401)
          throw new Error("Unauthorized: Invalid or missing token");
        throw new Error("Failed to fetch employees");
      }
      const data: ApiResponse = await resp.json();
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

  // derive filter option lists from employees (memoized)
  const {
    reportingToOptions,
    departmentOptions,
    designationOptions,
    roleOptions,
  } = useMemo(() => {
    const reportingSet = new Set<string>();
    const deptSet = new Set<string>();
    const desigSet = new Set<string>();
    const roleSet = new Set<string>();

    employees.forEach((e) => {
      reportingSet.add(e.reportingToName ?? "Unassigned");
      deptSet.add(e.departmentName ?? "Unassigned");
      desigSet.add(e.designationName ?? "Unassigned");
      roleSet.add(e.role ?? "Unassigned");
    });

    return {
      reportingToOptions: Array.from(reportingSet).sort(),
      departmentOptions: Array.from(deptSet).sort(),
      designationOptions: Array.from(desigSet).sort(),
      roleOptions: Array.from(roleSet).sort(),
    };
  }, [employees]);

  const deleteEmployee = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this employee? This action cannot be undone."
      )
    )
      return;
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No access token found");
      const resp = await fetch(`/api/hr/employee/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error("Failed to delete employee");
      // refresh
      setActionModalOpen(false);
      setSelectedEmployee(null);
      await fetchEmployees();
    } catch (err: any) {
      alert(`Error deleting employee: ${err.message}`);
    }
  };

  const openActionsFor = (employee: Employee) => {
    setSelectedEmployee(employee);
    setActionModalOpen(true);
  };

  const closeModal = () => {
    setActionModalOpen(false);
    setSelectedEmployee(null);
  };

  // Whenever any filter or search changes, reset to first page
  useEffect(() => {
    setCurrentPage(0);
  }, [
    searchTerm,
    statusFilter,
    reportingToFilter,
    departmentFilter,
    designationFilter,
    roleFilter,
  ]);

  // combined filtered list
  const filteredEmployees = employees.filter((emp) => {
    // search
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      emp.name.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      emp.employeeId.toLowerCase().includes(term);

    // status
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && emp.active) ||
      (statusFilter === "inactive" && !emp.active);

    // reportingToName
    const empReporting = emp.reportingToName ?? "Unassigned";
    const matchesReporting =
      reportingToFilter === "all" || reportingToFilter === empReporting;

    // department
    const empDept = emp.departmentName ?? "Unassigned";
    const matchesDept =
      departmentFilter === "all" || departmentFilter === empDept;

    // designation
    const empDesig = emp.designationName ?? "Unassigned";
    const matchesDesig =
      designationFilter === "all" || designationFilter === empDesig;

    // role
    const empRole = emp.role ?? "Unassigned";
    const matchesRole = roleFilter === "all" || roleFilter === empRole;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesReporting &&
      matchesDept &&
      matchesDesig &&
      matchesRole
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEmployees.length / PAGE_SIZE)
  );
  const paginatedEmployees = filteredEmployees.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) setCurrentPage(newPage);
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error)
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;

  return (
    <main className="container mx-auto p-17">
      {/* Header with Add + Invite */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Employee List</h1>
        <div className="flex gap-3">
          <Link
            href="/hr/employee/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md transition-colors"
          >
            Add Employee
          </Link>
          <Link
            href="/hr/employee/invite"
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 px-5 py-2 rounded-lg shadow-sm transition-colors"
          >
            + Invite Employee
          </Link>
        </div>
      </div>

      {/* Filters row */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <input
          type="text"
          placeholder="Search by name, email, or ID..."
          className="col-span-2 border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>

        <select
          value={reportingToFilter}
          onChange={(e) => setReportingToFilter(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none"
        >
          <option value="all">All Reporting To</option>
          {reportingToOptions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none"
        >
          <option value="all">All Departments</option>
          {departmentOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={designationFilter}
          onChange={(e) => setDesignationFilter(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none"
        >
          <option value="all">All Designations</option>
          {designationOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none"
        >
          <option value="all">All Roles</option>
          {roleOptions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
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
              <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
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
                <tr
                  key={employee.employeeId + employee.email}
                  className="hover:bg-gray-50"
                >
                  <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b">
                    {employee.employeeId}
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900 border-b">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                        {employee.profilePictureUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={employee.profilePictureUrl}
                            alt={employee.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm text-gray-600">
                            {employee.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </span>
                        )}
                      </div>
                      <div className="leading-tight">
                        <div className="font-medium text-gray-900 text-sm">
                          {employee.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {employee.designationName || "—"}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900 border-b">
                    {employee.email}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900 border-b">
                    {employee.departmentName || "Unassigned"}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900 border-b">
                    {employee.designationName || "Unassigned"}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900 border-b">
                    {employee.role}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900 border-b max-w-xs">
                    {employee.skills?.slice(0, 3).join(", ")}
                    {employee.skills && employee.skills.length > 3 ? "..." : ""}
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap text-sm border-b">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        employee.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {employee.active ? "Active" : "Inactive"}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {employee.reportingToName ?? "Reporting: Unassigned"}
                    </div>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap text-sm font-medium border-b text-right">
                    <button
                      onClick={() => openActionsFor(employee)}
                      aria-label={`Open actions for ${employee.name}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 focus:outline-none"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden
                      >
                        <path
                          d="M12 6a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM12 13.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM12 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
                          fill="currentColor"
                          className="text-gray-600"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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

      {/* Action Modal */}
      {actionModalOpen && selectedEmployee && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
        >
          <div
            onClick={closeModal}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-hidden
          />
          <div className="relative w-full max-w-sm bg-white rounded-xl shadow-xl overflow-hidden z-10">
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Actions</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Actions for{" "}
                <span className="font-semibold text-gray-900">
                  {selectedEmployee.name}
                </span>
              </div>
            </div>

            <div className="px-6 py-4 space-y-3">
              <Link
                href={`/hr/employee/${selectedEmployee.employeeId}`}
                onClick={() => setActionModalOpen(false)}
                className="block w-full text-left px-4 py-2 rounded-md hover:bg-gray-50"
              >
                View Profile
              </Link>
              <Link
                href={`/hr/employee/${selectedEmployee.employeeId}/edit`}
                onClick={() => setActionModalOpen(false)}
                className="block w-full text-left px-4 py-2 rounded-md hover:bg-gray-50"
              >
                Edit
              </Link>
              <button
                onClick={() => deleteEmployee(selectedEmployee.employeeId)}
                className="block w-full text-left px-4 py-2 rounded-md text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>

            <div className="px-6 py-3 border-t text-right">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
