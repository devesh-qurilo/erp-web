"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_MAIN;

type MarkBy = "DATE" | "MONTH";

interface Employee {
    employeeId: string;
    name: string;
    profilePictureUrl: string | null;
    role: string;
    active: boolean;
}

export default function MarkAttendanceModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [markBy, setMarkBy] = useState<MarkBy>("MONTH");
    const [dates, setDates] = useState<string[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [employeeOpen, setEmployeeOpen] = useState(false);
    const router = useRouter()

    const [form, setForm] = useState({
        employeeId: "",
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,

        clockInTime: "09:00",
        clockOutTime: "17:00",
        clockInLocation: "Office",
        clockOutLocation: "Office",
        clockInWorkingFrom: "Office",
        clockOutWorkingFrom: "Office",

        late: false,
        halfDay: false,
        overwrite: false,
    });

    /* ================= FETCH EMPLOYEES ================= */
    useEffect(() => {
        if (!open) return;

        const fetchEmployees = async () => {
            const token = localStorage.getItem("accessToken");
            if (!token) return;

            const res = await fetch(`${BASE_URL}/employee/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) return;

            const data = await res.json();
            setEmployees(data.filter((e: Employee) => e.active));
        };

        fetchEmployees();
    }, [open]);

    if (!open) return null;

    /* ================= SUBMIT ================= */
    const handleSubmit = async () => {
        if (!form.employeeId) {
            alert("Please select employee");
            return;
        }

        if (markBy === "DATE" && !dates.length) {
            alert("Please select date");
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem("accessToken");
            if (!token) throw new Error("Unauthorized");

            const payloadBase = {
                clockInTime: form.clockInTime,
                clockInLocation: form.clockInLocation,
                clockInWorkingFrom: form.clockInWorkingFrom,
                clockOutTime: form.clockOutTime,
                clockOutLocation: form.clockOutLocation,
                clockOutWorkingFrom: form.clockOutWorkingFrom,
                late: form.late,
                halfDay: form.halfDay,
            };

            let url = "";
            let body: any = {};

            if (markBy === "DATE") {
                url = `${BASE_URL}/employee/attendance/mark`;
                body = {
                    employeeIds: [form.employeeId],
                    dates,
                    payload: payloadBase,
                    overwrite: form.overwrite,
                    markedBy: form.employeeId,
                };
            } else {
                url = `${BASE_URL}/employee/attendance/mark/month`;
                body = {
                    year: form.year,
                    month: form.month,
                    employeeIds: [form.employeeId],
                    payload: payloadBase,
                    overwrite: form.overwrite,
                    markedBy: form.employeeId,
                };
            }

            const res = await fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error("Failed to mark attendance");
            router.push("/hr/attendence")
            onClose();

        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg">

                {/* HEADER */}
                <div className="flex justify-between px-6 py-4 border-b">
                    <h2 className="font-semibold">Mark Attendance</h2>
                    <button onClick={onClose}>×</button>
                </div>

                {/* BODY */}
                <div className="p-6 space-y-6">

                    {/* EMPLOYEE SELECT */}
                    <div className="relative">
                        <label className="text-sm font-medium">Employee *</label>

                        <button
                            onClick={() => setEmployeeOpen(!employeeOpen)}
                            className="w-full mt-1 border rounded-lg px-3 py-2 text-left"
                        >
                            {form.employeeId
                                ? employees.find(e => e.employeeId === form.employeeId)?.name
                                : "Select employee"}
                        </button>

                        {employeeOpen && (
                            <div className="absolute z-50 w-full bg-white border rounded-lg shadow mt-1 max-h-60 overflow-y-auto">
                                {employees.map(emp => (
                                    <div
                                        key={emp.employeeId}
                                        onClick={() => {
                                            setForm({ ...form, employeeId: emp.employeeId });
                                            setEmployeeOpen(false);
                                        }}
                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex gap-2"
                                    >
                                        {emp.profilePictureUrl ? (
                                            <img
                                                src={emp.profilePictureUrl}
                                                className="w-6 h-6 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                                                {emp.name[0]}
                                            </div>
                                        )}
                                        <span>{emp.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* MARK BY */}
                    <div className="flex gap-6 text-sm">
                        <span className="font-medium">Mark Attendance by</span>
                        <label>
                            <input
                                type="radio"
                                checked={markBy === "MONTH"}
                                onChange={() => setMarkBy("MONTH")}
                            />{" "}
                            Month
                        </label>
                        <label>
                            <input
                                type="radio"
                                checked={markBy === "DATE"}
                                onChange={() => setMarkBy("DATE")}
                            />{" "}
                            Date
                        </label>
                    </div>

                    {/* MONTH */}
                    {markBy === "MONTH" && (
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Year">
                                <input
                                    type="number"
                                    value={form.year}
                                    onChange={e => setForm({ ...form, year: +e.target.value })}
                                    className="input border rounded-xl py-2 px-4"
                                />
                            </Field>

                            <Field label="Month">
                                <select
                                    value={form.month}
                                    onChange={e => setForm({ ...form, month: +e.target.value })}
                                    className="input border rounded-xl py-2 px-4"
                                >
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <option key={i} value={i + 1}>
                                            {new Date(0, i).toLocaleString("default", { month: "long" })}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                    )}

                    {/* DATE */}
                    {markBy === "DATE" && (
                        <Field label="Select Date">
                            <input
                                type="date"
                                onChange={e => setDates([e.target.value])}
                                className="input border rounded-xl py-2 px-4"
                            />
                        </Field>
                    )}

                    {/* TIME */}
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Clock In">
                            <input
                                type="time"
                                value={form.clockInTime}
                                onChange={e => setForm({ ...form, clockInTime: e.target.value })}
                                className="input border rounded-xl py-2 px-4"
                            />
                        </Field>

                        <Field label="Clock Out">
                            <input
                                type="time"
                                value={form.clockOutTime}
                                onChange={e => setForm({ ...form, clockOutTime: e.target.value })}
                                className="input border rounded-xl py-2 px-4"
                            />
                        </Field>
                    </div>

                    {/* FLAGS */}
                    <div className="grid grid-cols-2 gap-4">
                        <Radio label="Late" value={form.late} onChange={v => setForm({ ...form, late: v })} />
                        <Radio label="Half Day" value={form.halfDay} onChange={v => setForm({ ...form, halfDay: v })} />
                    </div>

                    <label className="flex gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={form.overwrite}
                            onChange={e => setForm({ ...form, overwrite: e.target.checked })}
                        />
                        Attendance Overwrite
                    </label>
                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-4 px-6 py-4 border-t">
                    <button onClick={onClose} className="border px-4 py-2 rounded">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded"
                    >
                        {loading ? "Saving..." : "Update"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* HELPERS */
const Field = ({ label, children }: any) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-600">{label}</label>
        {children}
    </div>
);

const Radio = ({ label, value, onChange }: any) => (
    <div className="flex gap-4 text-sm">
        <span>{label}</span>
        <label>
            <input type="radio" checked={value} onChange={() => onChange(true)} /> Yes
        </label>
        <label>
            <input type="radio" checked={!value} onChange={() => onChange(false)} /> No
        </label>
    </div>
);
