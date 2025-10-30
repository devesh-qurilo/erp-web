"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

type Employee = {
  employeeId: string;
  name: string;
  profileUrl: string;
  designation: string;
  department: string;
};

type CompanyFile = {
  id: number;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
};

type Project = {
  id: number;
  shortCode: string;
  name: string;
  startDate: string;
  deadline: string | null;
  category: string;
  currency: string;
  budget: number;
  clientId: string;
  summary: string;
  pinned: boolean;
  companyFiles: CompanyFile[];
  assignedEmployees: Employee[];
  createdAt: string;
  projectStatus: string | null;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
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
        setProjects(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin w-6 h-6 mr-2" /> Loading projects...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  if (!projects.length) {
    return <div className="text-center text-gray-500 mt-10">No projects found</div>;
  }

  return (
    <div className="p-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Short Code</TableHead>
                <TableHead>Project Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Client ID</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.shortCode}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>
                    {p.currency} {p.budget.toLocaleString()}
                  </TableCell>
                  <TableCell>{p.clientId}</TableCell>
                  <TableCell>
                    {new Date(p.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex -space-x-2">
                      {p.assignedEmployees?.slice(0, 3).map((emp) => (
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
                    {p.projectStatus || (
                      <span className="text-gray-400 italic">Pending</span>
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
