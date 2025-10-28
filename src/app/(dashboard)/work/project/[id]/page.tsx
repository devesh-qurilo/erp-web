"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ChevronRightIcon, UserIcon, CurrencyDollarIcon, ClockIcon, CalendarIcon, CheckCircleIcon, UsersIcon } from "@heroicons/react/24/outline";
import { ActivityIcon, FileTextIcon, Notebook } from "lucide-react";
import Link from "next/link";

interface Project {
  id: number;
  shortCode: string;
  name: string;
  startDate: string;
  deadline?: string;
  noDeadline?: boolean;
  category?: string;
  departmentId?: number;
  clientId?: string;
  client?: {
    name: string;
    profilePictureUrl?: string;
  } | null;
  summary?: string;
  tasksNeedAdminApproval?: boolean;
  companyFiles?: any[];
  currency: string;
  budget: number;
  hoursEstimate?: number;
  allowManualTimeLogs?: boolean;
  addedBy?: string;
  companyFile?: any | null;
  assignedEmployeeIds?: string[];
  assignedEmployees?: {
    employeeId: string;
    name: string;
    profileUrl?: string;
    designation?: string;
    department?: string;
  }[];
  projectStatus?: any | null;
  progressPercent?: number | null;
  calculateProgressThroughTasks?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string | null;
  updatedAt?: string | null;
  totalTimeLoggedMinutes?: number | null;
  expenses?: any | null;
  profit?: any | null;
  earning?: any | null;
  pinned?: boolean;
  pinnedAt?: string;
  archived?: boolean;
  archivedAt?: string | null;
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const { id } = params;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'payments' | 'files' | 'notes' | 'activity'>('overview');

  const getProjectDetails = async (accessToken: string) => {
    try {
      const res = await fetch(`/api/work/project/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch project details");

      const data = await res.json();
      // Handle if API returns an array (as in example), take first item; otherwise assume single object
      setProject(Array.isArray(data) ? data[0] : data);
    } catch (error) {
      console.error("Error loading project:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      getProjectDetails(token);
    } else {
      setLoading(false);
    }
  }, [id]);

  if (loading) return <p className="p-8 text-center">Loading project...</p>;
  if (!project) return <p className="p-8 text-center text-red-600">Project not found</p>;

  const totalHours = project.totalTimeLoggedMinutes ? Math.floor(project.totalTimeLoggedMinutes / 60) : 0;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              {project.category && (
                <p className="text-sm text-gray-500 mb-2">Category: {project.category}</p>
              )}
              {project.summary && (
                <p className="text-gray-600">{project.summary}</p>
              )}
            </div>

            {/* Client Info */}
            <div className="flex items-center gap-4 p-4 bg-white border rounded-lg">
              {project.client?.profilePictureUrl ? (
                <img
                  src={project.client.profilePictureUrl}
                  alt="Client"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-gray-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {project.client?.name || `Client ID: ${project.clientId}`}
                </h3>
                <p className="text-sm text-gray-500">Client</p>
              </div>
            </div>

            {/* Key Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 border rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                  <span>Project Code</span>
                </h3>
                <p className="text-lg font-semibold">{project.shortCode}</p>
              </div>
              <div className="bg-white p-4 border rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                  <CurrencyDollarIcon className="w-4 h-4" />
                  Budget
                </h3>
                <p className="text-lg font-semibold">{project.currency} {project.budget.toLocaleString()}</p>
              </div>
              {project.hoursEstimate && (
                <div className="bg-white p-4 border rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    Hours Estimate
                  </h3>
                  <p className="text-lg font-semibold">{project.hoursEstimate}</p>
                </div>
              )}
              <div className="bg-white p-4 border rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  Start Date
                </h3>
                <p className="text-lg font-semibold">{new Date(project.startDate).toLocaleDateString()}</p>
              </div>
              <div className="bg-white p-4 border rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  Deadline
                </h3>
                <p className="text-lg font-semibold">{project.noDeadline ? "No Deadline" : project.deadline ? new Date(project.deadline).toLocaleDateString() : "TBD"}</p>
              </div>
              {project.progressPercent !== null && (
                <div className="bg-white p-4 border rounded-lg md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                    <CheckCircleIcon className="w-4 h-4" />
                    Progress
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progressPercent}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{project.progressPercent}%</span>
                  </div>
                </div>
              )}
              {project.projectStatus && (
                <div className="bg-white p-4 border rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
                  <p className="text-lg font-semibold capitalize">{project.projectStatus}</p>
                </div>
              )}
              {project.totalTimeLoggedMinutes !== null && (
                <div className="bg-white p-4 border rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    Total Time Logged
                  </h3>
                  <p className="text-lg font-semibold">{totalHours} hours</p>
                </div>
              )}
            </div>

            {/* Assigned Employees */}
            <div className="bg-white border rounded-lg">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <UsersIcon className="w-5 h-5" />
                  Assigned Employees
                </h3>
              </div>
              <div className="p-4">
                {project.assignedEmployees && project.assignedEmployees.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {project.assignedEmployees.map((emp) => (
                      <div key={emp.employeeId} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                        {emp.profileUrl ? (
                          <img
                            src={emp.profileUrl}
                            alt={emp.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-gray-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{emp.name}</p>
                          <p className="text-xs text-gray-500">
                            {emp.designation && `${emp.designation}, `}{emp.department}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No employees assigned</p>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>Created by: {project.createdBy} on {new Date(project.createdAt || '').toLocaleDateString()}</p>
              {project.pinned && <p>Pinned on {new Date(project.pinnedAt || '').toLocaleDateString()}</p>}
              {project.archived && <p>Archived on {new Date(project.archivedAt || '').toLocaleDateString()}</p>}
            </div>
          </div>
        );
      case 'invoices':
        return (
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileTextIcon className="w-5 h-5" />
              Invoices
            </h3>
            <p className="text-gray-500">Invoices content will be displayed here. Add a table or list of invoices with amounts, dates, and status.</p>
          </div>
        );
      case 'payments':
        return (
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CurrencyDollarIcon className="w-5 h-5" />
              Payments
            </h3>
            <p className="text-gray-500">Payments content will be displayed here. Include payment history, totals, and pending items.</p>
          </div>
        );
      case 'files':
        return (
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileTextIcon className="w-5 h-5" />
              Files
            </h3>
            <p className="text-gray-500">Files content will be displayed here. Upload and manage project files with previews.</p>
          </div>
        );
      case 'notes':
        return (
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Notebook className="w-5 h-5" />
              Notes
            </h3>
            <p className="text-gray-500">Notes content will be displayed here. Add, edit, and organize notes with timestamps.</p>
          </div>
        );
      case 'activity':
        return (
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ActivityIcon className="w-5 h-5" />
              Activity
            </h3>
            <p className="text-gray-500">Activity content will be displayed here. Show a timeline of updates, comments, and changes.</p>
          </div>
        );
      default:
        return null;
    }
  };

  const TabButton = ({ key, label, icon: Icon }: { key: typeof activeTab; label: string; icon: React.ComponentType<any> }) => (
    <button
      onClick={() => setActiveTab(key)}
      className={`flex items-center gap-2 px-6 py-3 text-sm font-medium cursor-pointer transition-all duration-200 group ${
        activeTab === key
          ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
      {label}
    </button>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">{project.name}</h1>
        {project.category && <p className="text-sm text-gray-500">• {project.category}</p>}
      </div>

      {/* Sub Navbar */}
      <nav className="bg-white shadow-sm rounded-lg mb-6 overflow-hidden">
      <div className="flex">
      <Link href={`/work/project/${project.id}`} className="flex-1">
          <TabButton key="overview" label="Overview" icon={ChevronRightIcon} />
        </Link>

        <Link href="/deals/invoices" className="flex-1">
          <TabButton key="invoices" label="Invoices" icon={FileTextIcon} />
        </Link>

        <Link href="/deals/payments" className="flex-1">
          <TabButton key="payments" label="Payments" icon={CurrencyDollarIcon} />
        </Link>

        <Link href="/deals/files" className="flex-1">
          <TabButton key="files" label="Files" icon={FileTextIcon} />
        </Link>

        <Link href="/deals/notes" className="flex-1">
          <TabButton key="notes" label="Notes" icon={Notebook} />
        </Link>

        <Link href="/deals/activity" className="flex-1">
          <TabButton key="activity" label="Activity" icon={ActivityIcon} />
        </Link>
      </div>
    </nav>

      {/* Tab Content */}
      <div>{renderTabContent()}</div>
    </div>
  );
}