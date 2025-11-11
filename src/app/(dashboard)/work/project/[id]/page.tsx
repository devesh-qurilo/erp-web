"use client";

import { useEffect, useState } from "react";
import ProjectsList from "../components/ProjectMembersTable";
import { useParams } from "next/navigation";
import { UserIcon } from "@heroicons/react/24/outline";
import { FileText as FileTextIcon, Activity as ActivityIcon, Notebook } from "lucide-react";
import TasksTable from "../components/TasksTable";
import ProjectMembersTable from "../components/ProjectMembersTable";
import TimesheetsTable from "../components/TimesheetsTableNew";
import MilestonesTable from "../components/MilestonesTable";
import TimesheetsTableNew from "../components/TimesheetsTableNew";

interface Project {
  id: number;
  shortCode: string;
  name: string;
  startDate: string;
  deadline?: string;
  noDeadline?: boolean;
  category?: string;
  client?: { name: string; profilePictureUrl?: string } | null;
  summary?: string;
  currency: string;
  budget: number;
  hoursEstimate?: number;
  assignedEmployees?: { employeeId: string; name: string; profileUrl?: string; designation?: string; department?: string }[];
  progressPercent?: number | null;
  totalTimeLoggedMinutes?: number | null;
  createdBy?: string;
  createdAt?: string;
  pinned?: boolean;
  pinnedAt?: string | null;
  archived?: boolean;
  archivedAt?: string | null;
}

export default function ProjectDetailsPage() {
  const params = useParams() as any;
  const { id } = params || {};

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'payments' | 'files' | 'notes' | 'activity' | 'discussion'>('overview');

  // Fetch project; fallback demo so UI always matches preview
  const getProjectDetails = async (accessToken: string) => {
    try {
      const res = await fetch(`/api/work/project/${id}`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProject(Array.isArray(data) ? data[0] : data);
    } catch (err) {
      // fallback demo data
      setProject({
        id: Number(id || 1),
        shortCode: "PRJ-001",
        name: "Project Name",
        category: "Website",
        startDate: "2025-08-02",
        deadline: "2025-09-12",
        client: { name: "John Doe", profilePictureUrl: "https://i.pravatar.cc/80?img=5" },
        summary: "Short description of the project and goals.",
        currency: "$",
        budget: 0,
        hoursEstimate: 40,
        assignedEmployees: [
          { employeeId: "1", name: "Aman Sharma", designation: "Developer", department: "Engineering" },
          { employeeId: "2", name: "Riya Singh", designation: "Designer", department: "Design" },
        ],
        progressPercent: 76,
        totalTimeLoggedMinutes: 300,
        createdBy: "Admin",
        createdAt: new Date().toISOString(),
        pinned: false,
        archived: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken") || "";
    getProjectDetails(token);
  }, [id]);

  if (loading) return <p className="p-8 text-center">Loading project...</p>;
  if (!project) return <p className="p-8 text-center text-red-600">Project not found</p>;

  const totalHours = project.totalTimeLoggedMinutes ? Math.floor(project.totalTimeLoggedMinutes / 60) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-semibold text-gray-800">{project.name}</h1>
        </div>

        {/* Tabs container (white bar with blue underline) */}
        <div className="bg-white rounded-t-lg shadow-sm border border-b-0">
          <div className="px-4">
            <nav className="flex items-center gap-6 h-14">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'invoices', label: 'Invoices' },
                { key: 'payments', label: 'Payments' },
                { key: 'files', label: 'Files' },
                { key: 'notes', label: 'Notes' },
                { key: 'activity', label: 'Activity' },
                { key: 'discussion', label: 'Discussion' },
              ].map(t => {
                const isActive = activeTab === (t.key as any);
                return (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key as any)}
                    className={`py-3 text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="relative inline-block">
                      {t.label}
                      {isActive && <span className="absolute -bottom-5 left-0 w-full h-0.5 bg-blue-400 rounded" />}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
          {/* thin full-width blue rule under tabs like screenshot */}
          <div className="h-1">
            <div className="border-t-2 border-blue-300" />
          </div>
        </div>

        {/* Content */}
        <div className="mt-6 space-y-6">
          {/* Top row: big card (progress + dates + summary) + client card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  {/* semicircle progress */}
                  <div className="w-36 h-20">
                    <svg viewBox="0 0 100 50" className="w-full h-full">
                      <path d="M5 50 A45 45 0 0 1 95 50" fill="none" stroke="#e6e6e6" strokeWidth="10" strokeLinecap="round" />
                      <path d="M5 50 A45 45 0 0 1 75 18" fill="none" stroke="#f5c518" strokeWidth="10" strokeLinecap="round" />
                      <text x="50" y="40" fontSize="8" textAnchor="middle" fill="#374151">{project.progressPercent}%</text>
                    </svg>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">{new Date(project.startDate).toLocaleDateString()}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium">{project.noDeadline ? "No Deadline" : (project.deadline ? new Date(project.deadline).toLocaleDateString() : "TBD")}</p>
                  </div>
                </div>

                <div className="hidden lg:block max-w-xs text-gray-600">
                  {project.summary ? <p>{project.summary}</p> : <p className="text-sm text-gray-400">No summary available</p>}
                </div>
              </div>
            </div>

            {/* client card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {project.client?.profilePictureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={project.client.profilePictureUrl} alt="client" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Client</p>
                <p className="font-medium">{project.client?.name || `Client ID: ${project.client?.name ?? ''}`}</p>
                <p className="text-xs text-gray-400">Qurilo Solutions</p>
              </div>
            </div>
          </div>

          {/* Middle row: Task statistics (left large) + metrics (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium mb-4">Task Statistics</h3>
              <div className="flex items-center gap-6">
                {/* pie placeholder */}
                <div className="w-48 h-48">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="40" fill="#10b981" />
                    <path d="M50 50 L50 10 A40 40 0 0 1 86 50 Z" fill="#f59e0b" />
                    <path d="M50 50 L86 50 A40 40 0 0 1 60 86 Z" fill="#3b82f6" />
                    <path d="M50 50 L60 86 A40 40 0 0 1 30 84 Z" fill="#ef4444" />
                    <path d="M50 50 L30 84 A40 40 0 0 1 14 52 Z" fill="#9ca3af" />
                  </svg>
                </div>

                <div className="flex-1">
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-3"><span className="w-4 h-4 bg-green-600 rounded-sm" /> Complete</li>
                    <li className="flex items-center gap-3"><span className="w-4 h-4 bg-yellow-400 rounded-sm" /> To Do</li>
                    <li className="flex items-center gap-3"><span className="w-4 h-4 bg-blue-600 rounded-sm" /> Doing</li>
                    <li className="flex items-center gap-3"><span className="w-4 h-4 bg-red-500 rounded-sm" /> Incomplete</li>
                    <li className="flex items-center gap-3"><span className="w-4 h-4 bg-gray-400 rounded-sm" /> Waiting to approval</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* right metrics */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Project Budget</p>
                <div className="text-2xl font-semibold text-blue-600 mt-2">{project.currency}{project.budget.toFixed(2)}</div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Hours Logged</p>
                <div className="text-2xl font-semibold text-blue-600 mt-2">{totalHours}hrs 0 min</div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
                  <p className="text-sm text-gray-500">Earnings</p>
                  <div className="text-lg font-semibold text-blue-600 mt-1">{project.currency}0.00</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
                  <p className="text-sm text-gray-500">Expenses</p>
                  <div className="text-lg font-semibold text-blue-600 mt-1">{project.currency}0.00</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
                  <p className="text-sm text-gray-500">Profit</p>
                  <div className="text-lg font-semibold text-blue-600 mt-1">{project.currency}0.00</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row: Assigned employees + metadata */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
              <div className="mb-4">
                <h4 className="text-lg font-medium">Assigned Employees</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {project.assignedEmployees && project.assignedEmployees.length ? (
                  project.assignedEmployees.map(emp => (
                    <div key={emp.employeeId} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                        {emp.profileUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={emp.profileUrl} alt={emp.name} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{emp.name}</p>
                        <p className="text-xs text-gray-500">{emp.designation ? emp.designation + ', ' : ''}{emp.department}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-6">No employees assigned</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h4 className="text-lg font-medium mb-2">Project Summary</h4>
              <div className="text-xs text-gray-500 space-y-2">
                <div>Created by: {project.summary}</div>
                <div>Created on: {new Date(project.createdAt || '').toLocaleDateString()}</div>
                {project.pinned && <div>Pinned on: {new Date(project.pinnedAt || '').toLocaleDateString()}</div>}
                {project.archived && <div>Archived on: {new Date(project.archivedAt || '').toLocaleDateString()}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

       {project && <TasksTable projectId={project.id} />}
       <ProjectMembersTable projectId={project.id} />;
       <TimesheetsTableNew gatewayPath="https://chat.swiftandgo.in/timesheets" />
       <MilestonesTable projectId={22} />

       
    </div>
    
  );
  
}
