// components/TaskViewModal.tsx
"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

type Employee = { employeeId: string; name: string; profileUrl?: string | null };
type Label = { id: number; name: string };
type Milestone = { id: number; title: string };

export type TaskForView = {
  id: number;
  title?: string;
  projectId?: number;
  projectName?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  createdOn?: string | null;
  noDueDate?: boolean;
  assignedEmployees?: Employee[] | null;
  assignedEmployeeIds?: string[];
  description?: string | null;
  labels?: Label[];
  milestone?: Milestone | null;
  milestoneId?: number | null;
  priority?: string | null;
  isPrivate?: boolean;
  timeEstimateMinutes?: number | null;
  isDependent?: boolean;
  attachments?: { name?: string; url?: string }[] | null;
  taskStage?: { id?: number; name?: string } | null;
  hoursLoggedMinutes?: number | null;
};

export default function TaskViewModal({
  open,
  task,
  onClose,
  onMarkComplete,
}: {
  open: boolean;
  task: TaskForView | null;
  onClose: () => void;
  onMarkComplete?: (taskId: number) => void;
}) {
  const [tab, setTab] = useState<"files" | "subtask" | "timesheet" | "notes">(
    "files"
  );
  const [isVisible, setIsVisible] = useState(false);

  // menu state for 3-dot popup (now inside left big card)
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuBtnRef = useRef<HTMLButtonElement | null>(null);

  // reminder confirmation modal state
  const [reminderConfirmOpen, setReminderConfirmOpen] = useState(false);
  const reminderModalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) setIsVisible(true);
    else {
      setIsVisible(false);
      setMenuOpen(false);
      setReminderConfirmOpen(false);
    }
  }, [open]);

  // close menu on outside click or Escape
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        menuBtnRef.current &&
        !menuBtnRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }

      // also close reminder modal on outside click
      if (
        reminderConfirmOpen &&
        reminderModalRef.current &&
        !reminderModalRef.current.contains(e.target as Node)
      ) {
        setReminderConfirmOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setReminderConfirmOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen, reminderConfirmOpen]);

  const priorityDot = useMemo(() => {
    const priority = (task?.priority || "").toLowerCase();

    switch (priority) {
      case "low":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-400";
      case "high":
        return "bg-orange-500";
      case "urgent":
        return "bg-red-600";
      default:
        return "bg-gray-400";
    }
  }, [task?.priority]);

  if (!open || !task) return null;

  const fmtDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString() : "--";
  const fmtDateTime = (d?: string | null) =>
    d ? new Date(d).toLocaleString() : "--";
  const minsToHuman = (mins?: number | null) => {
    if (mins === null || mins === undefined) return "--";
    const h = Math.floor((mins || 0) / 60);
    const m = (mins || 0) % 60;
    if (h && m) return `${h}h ${m}m`;
    if (h) return `${h}h`;
    return `${m}m`;
  };

  // actual send reminder action (placeholder)
  const sendReminderAction = () => {
    // keep existing placeholder behavior (alert) — user can replace with real API call
    alert("Reminder sent to assigned employees");
  };

  // menu item handlers (placeholders)
  const handleSendReminderMenu = () => {
    // close menu and open the confirmation modal that matches the provided image
    setMenuOpen(false);
    setReminderConfirmOpen(true);
  };
  const handleEditTask = () => {
    setMenuOpen(false);
    alert("Edit Task clicked");
  };
  const handlePinTask = () => {
    setMenuOpen(false);
    alert("Pin Task clicked");
  };
  const handleCopyTaskLink = () => {
    setMenuOpen(false);
    const link = `${typeof window !== "undefined" ? window.location.origin : ""}/tasks/${task.id}`;
    try {
      navigator.clipboard?.writeText(link);
      alert("Task link copied to clipboard");
    } catch {
      alert("Task link: " + link);
    }
  };

  const handleConfirmYes = () => {
    // perform the action and close modal
    sendReminderAction();
    setReminderConfirmOpen(false);
  };

  const handleConfirmCancel = () => {
    setReminderConfirmOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/0  ">
      {/* Slide-over panel: ~80% of screen, full height, right -> left */}
      <div
        className={[
          "relative h-full w-[83vw] max-w-[83vw] bg-white shadow-xl border-l",
          "transform transition-transform duration-300",
          isVisible ? "translate-x-0" : "translate-x-full",
          "flex flex-col",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <div className="text-sm text-gray-500">
              Task #
              {task.projectId
                ? `RTA-${String(task.id).padStart(2, "0")}`
                : `RTA-${String(task.id)}`}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <div className="text-lg font-semibold">
                {task.title ?? "Task Name"}
              </div>
            </div>
          </div>

          {/* Close button remains on header right */}
          <button
            aria-label="close"
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-100"
            title="Close"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 overflow-hidden">
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left big card */}
            {/* keep relative for absolute positioning of menu */}
            <div className="lg:col-span-2 bg-white border rounded-lg p-5 relative">
              {/* Mark As Complete stays in original card, left side */}
              <div className="flex items-start justify-between">
                <div>
                  <button
                    onClick={() => task.id && onMarkComplete?.(task.id)}
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 text-sm"
                  >
                    Mark As Complete
                  </button>
                </div>

                {/* right side → 3 dot + close */}
                <div className="flex items-center gap-2 relative">
                  {/* 3-dot menu */}
                  <button
                    ref={menuBtnRef}
                    onClick={() => setMenuOpen((s) => !s)}
                    className="p-2 rounded hover:bg-gray-100"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor">
                      <circle cx="5" cy="12" r="1.5" />
                      <circle cx="12" cy="12" r="1.5" />
                      <circle cx="19" cy="12" r="1.5" />
                    </svg>
                  </button>

                  {/* menu popup */}
                  {menuOpen && (
                    <div
                      ref={menuRef}
                      className="absolute right-10 top-10 w-48 bg-white border rounded-lg shadow-md p-2 z-50"
                    >
                      <button
                        onClick={handleSendReminderMenu}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                      >
                        🔔 Send Reminder
                      </button>
                      <button
                        onClick={handleEditTask}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                      >
                        ✏️ Edit Task
                      </button>
                      <button
                        onClick={handlePinTask}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                      >
                        📌 Pin Task
                      </button>
                      <button
                        onClick={handleCopyTaskLink}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                      >
                        🔗 Copy Task Link
                      </button>
                    </div>
                  )}

                  {/* close (kept as placeholder to match original structure) */}
                  <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
                    {/* intentionally left blank to preserve layout (original had a close icon here removed) */}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-6 text-sm">
                <div className="text-gray-500">Project</div>
                <div className="font-medium">
                  {task.projectName ?? `Project ${task.projectId ?? "--"}`}
                </div>

                <div className="text-gray-500">Priority</div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${priorityDot}`} />
                  <span className="font-medium">
                    {task.priority ?? "Low"}
                  </span>
                </div>

                <div className="text-gray-500">Assigned to</div>
                <div className="font-medium">
                  {task.assignedEmployees && task.assignedEmployees.length
                    ? task.assignedEmployees.map((a) => a.name).join(", ")
                    : task.assignedEmployeeIds &&
                      task.assignedEmployeeIds.length
                    ? task.assignedEmployeeIds.join(", ")
                    : "--"}
                </div>

                <div className="text-gray-500">Project Code</div>
                <div className="font-medium">
                  RTA-{String(task.id).padStart(2, "0")}
                </div>

                <div className="text-gray-500">Milestones</div>
                <div className="font-medium">
                  {task.milestone?.title ?? "----"}
                </div>

                <div className="text-gray-500">Label</div>
                <div className="font-medium">
                  {task.labels && task.labels.length
                    ? task.labels.map((l) => l.name).join(", ")
                    : "--"}
                </div>

                <div className="text-gray-500">Task Category</div>
                <div className="font-medium">--</div>

                <div className="text-gray-500">Description</div>
                <div className="font-medium whitespace-pre-wrap">
                  {task.description ?? "--"}
                </div>
              </div>
            </div>

            {/* Right small card */}
            <div className="bg-white border rounded-lg p-5">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <div className="font-medium">
                  {task.taskStage?.name ?? "Doing"}
                </div>
              </div>

              <div className="mt-4 text-sm">
                <div className="flex justify-between py-2">
                  <div className="text-gray-500">Created On</div>
                  <div className="font-medium">
                    {fmtDateTime(task.createdOn)}
                  </div>
                </div>

                <div className="flex justify-between py-2">
                  <div className="text-gray-500">Start Date</div>
                  <div className="font-medium">
                    {fmtDate(task.startDate)}
                  </div>
                </div>

                <div className="flex justify-between py-2">
                  <div className="text-gray-500">Due Date</div>
                  <div className="font-medium">
                    {task.noDueDate ? "--" : fmtDate(task.dueDate)}
                  </div>
                </div>

                <div className="flex justify-between py-2">
                  <div className="text-gray-500">Hours Logged</div>
                  <div className="font-medium">
                    {minsToHuman(task.hoursLoggedMinutes ?? null)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs area */}
          <div className="px-6 pb-6">
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setTab("files")}
                    className={`pb-2 ${
                      tab === "files"
                        ? "border-b-2 border-blue-600 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    Files
                  </button>
                  <button
                    onClick={() => setTab("subtask")}
                    className={`pb-2 ${
                      tab === "subtask"
                        ? "border-b-2 border-blue-600 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    Sub Task
                  </button>
                  <button
                    onClick={() => setTab("timesheet")}
                    className={`pb-2 ${
                      tab === "timesheet"
                        ? "border-b-2 border-blue-600 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    Timesheet
                  </button>
                  <button
                    onClick={() => setTab("notes")}
                    className={`pb-2 ${
                      tab === "notes"
                        ? "border-b-2 border-blue-600 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    Notes
                  </button>
                </div>

                <div>
                  <button className="inline-flex items-center gap-2 text-blue-600 text-sm">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 5v14M5 12h14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Upload File</span>
                  </button>
                </div>
              </div>

              <div className="mt-4 h-60 border rounded-lg p-4 overflow-auto bg-gray-50">
                {tab === "files" && (
                  <div>
                    {task.attachments && task.attachments.length ? (
                      <ul className="space-y-2 text-sm">
                        {task.attachments.map((a, i) => (
                          <li
                            key={i}
                            className="flex items-center justify-between"
                          >
                            <div>{a.name ?? a.url ?? "attachment"}</div>
                            <div className="text-xs text-gray-500">
                              {a.url ? (
                                <a href={a.url} className="underline">
                                  Download
                                </a>
                              ) : null}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-500">No files uploaded</div>
                    )}
                  </div>
                )}

                {tab === "subtask" && (
                  <div className="text-gray-500">Sub tasks list (placeholder)</div>
                )}
                {tab === "timesheet" && (
                  <div className="text-gray-500">Timesheet (placeholder)</div>
                )}
                {tab === "notes" && (
                  <div className="text-gray-500">Notes (placeholder)</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reminder confirmation modal (matches the attached image) */}
      {reminderConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 px-4">
          <div
            ref={reminderModalRef}
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md bg-white rounded-lg shadow-lg p-6"
          >
            <div className="text-center">
              <h3 className="text-xl font-semibold">Are You Sure?</h3>
              <p className="mt-3 text-sm text-gray-500">
                You want to send reminder to the assigned employees.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={handleConfirmCancel}
                className="px-6 py-2 border border-blue-600 text-blue-600 rounded-full text-sm hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmYes}
                className="px-6 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
