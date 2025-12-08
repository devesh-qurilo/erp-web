"use client";

import React, { useState } from "react";
import {
  X,
  Search,
  List,
  CalendarDays,
  Calendar,
  Bell,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type WeeklyTimesheetModalProps = {
  open: boolean;
  onClose: () => void;
};

type WeekDay = {
  date: string;
  month: string;
  label: string;
};

type Row = {
  task: string;
  hours: string[]; // 7 days
};

const weekDays: WeekDay[] = [
  { date: "25", month: "August", label: "Mon" },
  { date: "26", month: "August", label: "Tue" },
  { date: "27", month: "August", label: "Wed" },
  { date: "28", month: "August", label: "Thurs" },
  { date: "29", month: "August", label: "Fri" },
  { date: "30", month: "August", label: "Sat" },
  { date: "31", month: "August", label: "Sun" },
];

const WeeklyTimesheetModal: React.FC<WeeklyTimesheetModalProps> = ({
  open,
  onClose,
}) => {
  const [rows, setRows] = useState<Row[]>([
    { task: "", hours: Array(7).fill("0") },
  ]);

  const [weekLabel, setWeekLabel] = useState("25 Aug - 31 Aug");

  if (!open) return null;

  const handleChangeHour = (
    rowIndex: number,
    dayIndex: number,
    value: string
  ) => {
    setRows((prev) =>
      prev.map((row, i) =>
        i === rowIndex
          ? {
              ...row,
              hours: row.hours.map((h, j) =>
                j === dayIndex ? (value === "" ? "" : value.replace(/[^\d.]/g, "")) : h
              ),
            }
          : row
      )
    );
  };

  const handleChangeTask = (rowIndex: number, value: string) => {
    setRows((prev) =>
      prev.map((row, i) => (i === rowIndex ? { ...row, task: value } : row))
    );
  };

  const addRow = () => {
    setRows((prev) => [...prev, { task: "", hours: Array(7).fill("0") }]);
  };

  const totalPerDay = (dayIndex: number) => {
    return rows.reduce((sum, r) => {
      const v = parseFloat(r.hours[dayIndex] || "0");
      return sum + (Number.isNaN(v) ? 0 : v);
    }, 0);
  };

  return (
    // Positioning fixed to sit to the right of sidebar and below top header.
    // Responsive: on small screens takes full screen (left:0 top:0); on md+ uses left/top offsets.
    <div
      className="
        fixed
        left-0 top-0 right-0 bottom-0
        md:left-[260px] md:top-[64px] md:right-0 md:bottom-0
        bg-white flex flex-col
        z-[11000] overflow-hidden
      "
      aria-modal="true"
      role="dialog"
    >
      {/* Top bar */}
      <header className="flex items-center justify-between px-8 py-4 border-b bg-white shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Weekly Timesheet</h1>

        <div className="flex items-center gap-4">
          {/* search icon button */}
          <button className="w-9 h-9 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50">
            <Search className="w-4 h-4 text-gray-600" />
          </button>

          {/* view toggle buttons (list / weekly / calendar) */}
          <div className="flex items-center rounded-md border border-gray-200 overflow-hidden bg-white">
            <button
              className="px-3 h-9 flex items-center justify-center text-gray-600 text-sm hover:bg-gray-50"
              type="button"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              className="px-3 h-9 flex items-center justify-center text-white text-sm bg-indigo-500"
              type="button"
            >
              <CalendarDays className="w-4 h-4" />
            </button>
            <button
              className="px-3 h-9 flex items-center justify-center text-gray-600 text-sm hover:bg-gray-50"
              type="button"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>

          {/* bell + avatar */}
          <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50">
            <Bell className="w-4 h-4 text-gray-700" />
          </button>
          <div className="w-9 h-9 rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-700" />
          </div>

          {/* close */}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 ml-1"
            aria-label="Close weekly timesheet"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-[#f7f8fc]">
        <div className="max-w-6xl mx-auto w-full px-6 py-6">
          <h2 className="text-sm font-medium text-gray-800 mb-4">
            Add Weekly Timesheet
          </h2>

          {/* Week selector row */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm text-gray-700 w-16">Week</span>
            <div className="flex items-center border border-gray-200 rounded-md bg-white">
              <button className="h-9 px-3 border-r border-gray-200 hover:bg-gray-50">
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <div className="px-4 text-sm text-gray-800 min-w-[160px] text-center">
                {weekLabel}
              </div>
              <button className="h-9 px-3 border-l border-gray-200 hover:bg-gray-50">
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Weekly grid card */}
          <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
            {/* header row */}
            <div className="bg-[#e8f0ff] border-b border-gray-200">
              <div className="grid grid-cols-[180px_repeat(7,minmax(0,1fr))]">
                <div className="px-4 py-3 text-xs font-medium text-gray-700 flex items-end">
                  Task
                </div>
                {weekDays.map((d) => (
                  <div
                    key={d.label}
                    className="px-2 py-2 text-center border-l border-blue-100"
                  >
                    <div className="text-sm font-semibold text-gray-900">
                      {d.date}
                    </div>
                    <div className="text-[10px] text-gray-600 leading-tight">
                      {d.month}
                    </div>
                    <div className="text-[10px] text-gray-500">{d.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* data rows */}
            {rows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="border-b border-gray-200 last:border-b-0"
              >
                <div className="grid grid-cols-[180px_repeat(7,minmax(0,1fr))]">
                  {/* task select */}
                  <div className="px-4 py-3 border-r border-gray-200 flex items-center">
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 bg-white"
                      value={row.task}
                      onChange={(e) => handleChangeTask(rowIndex, e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="Task 1">Task 1</option>
                      <option value="Task 2">Task 2</option>
                      <option value="Task 3">Task 3</option>
                    </select>
                  </div>

                  {/* day inputs */}
                  {weekDays.map((d, dayIndex) => (
                    <div
                      key={`${rowIndex}-${d.label}`}
                      className="px-2 py-3 border-l border-gray-200 flex items-center justify-center"
                    >
                      <input
                        type="number"
                        min={0}
                        className="w-14 text-center border border-gray-300 rounded-md text-sm py-1"
                        value={row.hours[dayIndex]}
                        onChange={(e) =>
                          handleChangeHour(rowIndex, dayIndex, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* total row */}
            <div className="border-t border-gray-200 bg-white">
              <div className="grid grid-cols-[180px_repeat(7,minmax(0,1fr))]">
                <div className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                  Total
                </div>
                {weekDays.map((d, i) => (
                  <div
                    key={d.label}
                    className="px-2 py-3 border-l border-gray-200 text-center text-sm text-gray-700"
                  >
                    {totalPerDay(i)}hrs
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* footer buttons */}
          <div className="flex items-center justify-between mt-4">
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center px-4 py-2 border border-blue-500 text-blue-600 rounded-md text-sm font-medium bg-white hover:bg-blue-50"
            >
              + Add More
            </button>

            <button
              type="button"
              className="px-6 py-2 rounded-md bg-blue-600 text-white text-sm font-medium shadow-sm hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyTimesheetModal;
