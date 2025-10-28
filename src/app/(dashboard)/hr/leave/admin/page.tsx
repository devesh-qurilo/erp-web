"use client";
import { useEffect, useState } from "react";

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

export default function LeavesList() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  // Fetch leaves
  const fetchLeaves = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    const res = await fetch("/api/hr/leave", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setLeaves(data);
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Approve leave
  const approveLeave = async (leaveId: number) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    setLoadingId(leaveId);
    await fetch(`/api/hr/leave/${leaveId}/status`, {
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

  // Reject leave
  const rejectLeave = async (leaveId: number, reason: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    if (!reason) {
      alert("Please enter a reason for rejection.");
      return;
    }
    setLoadingId(leaveId);
    await fetch(`/api/hr/leave/${leaveId}/status`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "REJECTED",
        rejectionReason: reason,
      }),
    });
    await fetchLeaves();
    setLoadingId(null);
  };

  // Get display dates
  const getDisplayDates = (leave: Leave) => {
    if (leave.singleDate) {
      return leave.singleDate;
    }
    if (leave.startDate && leave.endDate) {
      return `${leave.startDate} to ${leave.endDate}`;
    }
    return "N/A";
  };

  // Get status color class
  const getStatusClass = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (leaves.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">No leaves found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Employee Leaves</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Leave Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaves.map((leave) => (
              <tr key={leave.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {leave.employeeName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {leave.leaveType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {leave.durationType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getDisplayDates(leave)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                  {leave.reason}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(
                      leave.status
                    )}`}
                  >
                    {leave.status}
                  </span>
                  {leave.status === "REJECTED" && leave.rejectionReason && (
                    <div className="mt-1 text-xs text-red-600">
                      Reason: {leave.rejectionReason}
                    </div>
                  )}
                  {leave.status === "APPROVED" && leave.approvedByName && (
                    <div className="mt-1 text-xs text-green-600">
                      Approved by: {leave.approvedByName}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {leave.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveLeave(leave.id)}
                        disabled={loadingId === leave.id}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loadingId === leave.id ? "Processing..." : "Approve"}
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt("Enter rejection reason:");
                          if (reason) {
                            rejectLeave(leave.id, reason);
                          }
                        }}
                        disabled={loadingId === leave.id}
                        className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loadingId === leave.id ? "Processing..." : "Reject"}
                      </button>
                    </div>
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