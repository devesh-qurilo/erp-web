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

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Employee Leaves</h2>
      <ul>
        {leaves.map((leave) => (
          <li
            key={leave.id}
            className="border p-2 mb-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-2"
          >
            <div>
              <strong>{leave.employeeName}</strong> ({leave.leaveType}) -{" "}
              {leave.status}
              {leave.status === "REJECTED" && leave.rejectionReason && (
                <div className="text-red-600">Reason: {leave.rejectionReason}</div>
              )}
            </div>

            {leave.status === "PENDING" && (
              <div className="flex gap-2">
                <button
                  onClick={() => approveLeave(leave.id)}
                  disabled={loadingId === leave.id}
                  className="px-3 py-1 bg-green-600 text-white rounded"
                >
                  {loadingId === leave.id ? "Processing..." : "Approve"}
                </button>

                <button
                  onClick={() => {
                    const reason = prompt("Enter rejection reason") || "";
                    rejectLeave(leave.id, reason);
                  }}
                  disabled={loadingId === leave.id}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  {loadingId === leave.id ? "Processing..." : "Reject"}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
