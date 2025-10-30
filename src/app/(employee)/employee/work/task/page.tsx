"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

type Employee = {
  employeeId: string;
  name: string;
  profileUrl: string;
  designation?: string | null;
  department?: string | null;
};

type Label = {
  id: number;
  name: string;
  colorCode: string;
};

type TaskStage = {
  id: number;
  name: string;
  labelColor?: string;
};

type Milestone = {
  id: number;
  title: string;
  milestoneCost: number;
  status: string;
};

type Task = {
  id: number;
  title: string;
  description: string;
  priority: string;
  projectId: number;
  startDate: string;
  dueDate: string;
  assignedEmployees: Employee[];
  labels: Label[];
  taskStage: TaskStage;
  milestone: Milestone;
  pinned: boolean;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("/api/work/task/employee", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        setTasks(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin w-6 h-6 mr-2" /> Loading tasks...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  if (!tasks.length) {
    return <div className="text-center text-gray-500 mt-10">No tasks found</div>;
  }

  return (
    <div className="p-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">My Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Project ID</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Labels</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Milestone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>{task.projectId}</TableCell>
                  <TableCell>
                    <Badge
                      style={{
                        backgroundColor: `#${task.taskStage?.labelColor || "cccccc"}`,
                      }}
                    >
                      {task.taskStage?.name || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        task.priority === "HIGH"
                          ? "destructive"
                          : task.priority === "MEDIUM"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex -space-x-2">
                      {task.assignedEmployees?.map((emp) => (
                        <img
                          key={emp.employeeId}
                          src={emp.profileUrl}
                          alt={emp.name}
                          title={emp.name}
                          className="w-8 h-8 rounded-full border-2 border-white"
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {task.labels?.map((label) => (
                        <Badge
                          key={label.id}
                          style={{ backgroundColor: label.colorCode }}
                        >
                          {label.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(task.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {task.milestone?.title || (
                      <span className="text-gray-400 italic">No milestone</span>
                    )}
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
