"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Loader2, Clock } from "lucide-react";

type Employee = {
  employeeId: string;
  name: string;
  profileUrl: string;
  designation?: string | null;
  department?: string | null;
};

type Timesheet = {
  id: number;
  projectId: number;
  taskId: number;
  employeeId: string;
  employees: Employee[];
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  memo: string;
  durationHours: number;
  createdAt: string;
};

export default function TimesheetsPage() {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimesheets = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("/api/work/project/employee", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        setTimesheets(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch timesheets");
      } finally {
        setLoading(false);
      }
    };

    fetchTimesheets();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin w-6 h-6 mr-2" /> Loading timesheets...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  if (!timesheets.length) {
    return <div className="text-center text-gray-500 mt-10">No timesheets found</div>;
  }

  return (
    <div className="p-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5" /> My Timesheets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Duration (hrs)</TableHead>
                <TableHead>Memo</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timesheets.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.id}</TableCell>
                  <TableCell>{t.projectId}</TableCell>
                  <TableCell>{t.taskId}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {t.employees?.[0]?.profileUrl && (
                        <img
                          src={t.employees[0].profileUrl}
                          alt={t.employees[0].name}
                          className="w-8 h-8 rounded-full border"
                        />
                      )}
                      <span>{t.employees?.[0]?.name || "N/A"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {t.startDate} {t.startTime}
                  </TableCell>
                  <TableCell>
                    {t.endDate} {t.endTime}
                  </TableCell>
                  <TableCell>{t.durationHours}h</TableCell>
                  <TableCell>{t.memo}</TableCell>
                  <TableCell>
                    {new Date(t.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
