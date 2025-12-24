
"use client"

import { useState } from "react"

const BASE_URL = process.env.NEXT_PUBLIC_MAIN

export default function AttendanceDetailModal({
    open,
    onClose,
    data,
    onUpdated,
}: {
    open: boolean
    onClose: () => void
    data: any
    onUpdated?: () => void
}) {
    const [menuOpen, setMenuOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [mode, setMode] = useState<"view" | "edit">("view")

    if (!open || !data) return null

    const employeeId = data.employeeId
    const date = data.date

    /* ================= DELETE ================= */

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this attendance?")) return

        try {
            setLoading(true)
            const token = localStorage.getItem("accessToken")

            await fetch(
                `${BASE_URL}/employee/attendance/delete?employeeId=${employeeId}&date=${date}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            )

            onClose()
            onUpdated?.()
        } catch {
            alert("Failed to delete attendance")
        } finally {
            setLoading(false)
        }
    }

    /* ================= VIEW ================= */

    const formatTime = (t?: string) =>
        t
            ? new Date(`1970-01-01T${t}`).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            })
            : "--"

    const duration =
        data.clockInTime && data.clockOutTime
            ? calcDuration(data.clockInTime, data.clockOutTime)
            : "—"

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-4xl rounded-xl shadow-lg relative">

                {/* ================= HEADER ================= */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold">
                        {mode === "view" ? "Attendance Details" : "Edit Attendance"}
                    </h2>

                    <div className="flex items-center gap-3 relative">
                        {mode === "view" && (
                            <>
                                <button
                                    onClick={() => setMenuOpen(v => !v)}
                                    className="text-xl px-2 hover:bg-gray-100 rounded"
                                >
                                    ⋮
                                </button>

                                {menuOpen && (
                                    <div className="absolute right-0 top-10 w-32 bg-white border rounded-lg shadow-md z-10">
                                        <button
                                            onClick={() => {
                                                setMenuOpen(false)
                                                setMode("edit")
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-50"
                                        >
                                            ✏ Edit
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            disabled={loading}
                                            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                                        >
                                            🗑 Delete
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        <button onClick={onClose} className="text-2xl">×</button>
                    </div>
                </div>

                {/* ================= BODY ================= */}
                {mode === "view" ? (
                    <div className="grid grid-cols-2 gap-6 p-6">
                        {/* LEFT */}
                        <div className="border rounded-lg p-4 space-y-4">
                            <h3 className="font-medium">
                                Date – {data.date} (
                                {new Date(data.date).toLocaleDateString("en-US", {
                                    weekday: "long",
                                })}
                                )
                            </h3>

                            <Info label="Clock In" value={formatTime(data.clockInTime)} />

                            <div className="flex justify-center py-6">
                                <div className="w-32 h-32 rounded-full border-4 border-blue-500 flex items-center justify-center text-lg font-semibold">
                                    {duration}
                                </div>
                            </div>

                            <Info label="Clock Out" value={formatTime(data.clockOutTime)} />
                        </div>

                        {/* RIGHT */}
                        <div className="border rounded-lg p-4 space-y-6">
                            <Activity
                                title="Clock In"
                                time={formatTime(data.clockInTime)}
                                location={data.clockInLocation}
                                workingFrom={data.clockInWorkingFrom}
                                late={data.late}
                            />

                            <Activity
                                title="Clock Out"
                                time={
                                    data.clockOutTime
                                        ? formatTime(data.clockOutTime)
                                        : "Did not clock out"
                                }
                                location={data.clockOutLocation}
                                workingFrom={data.clockOutWorkingFrom}
                            />

                            <div className="flex flex-wrap gap-2 pt-2 text-sm">
                                {data.holiday && badge("Holiday", "⭐")}
                                {data.leave && badge("Leave", "⛔")}
                                {data.late && badge("Late", "⏰")}
                                {data.halfDay && badge("Half Day", "½")}
                                {data.isPresent && badge("Present", "✔")}
                            </div>
                        </div>
                    </div>
                ) : (
                    <EditAttendanceForm
                        data={data}
                        onCancel={() => setMode("view")}
                        onSaved={() => {
                            setMode("view")
                            onUpdated?.()
                            onClose()
                        }}
                    />
                )}
            </div>
        </div>
    )
}

/* ================= EDIT FORM ================= */

function EditAttendanceForm({
    data,
    onCancel,
    onSaved,
}: {
    data: any
    onCancel: () => void
    onSaved: () => void
}) {
    const [saving, setSaving] = useState(false)

    const [form, setForm] = useState({
        clockInTime: data.clockInTime || "",
        clockInLocation: data.clockInLocation || "",
        clockInWorkingFrom: data.clockInWorkingFrom || "",
        clockOutTime: data.clockOutTime || "",
        clockOutLocation: data.clockOutLocation || "",
        clockOutWorkingFrom: data.clockOutWorkingFrom || "",
        late: !!data.late,
        halfDay: !!data.halfDay,
    })

    const handleSave = async () => {
        try {
            setSaving(true)
            const token = localStorage.getItem("accessToken")

            await fetch(
                `${BASE_URL}/employee/attendance/edit?employeeId=${data.employeeId}&date=${data.date}&overwrite=true&markedBy=ADMIN`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(form),
                }
            )

            onSaved()
        } catch {
            alert("Failed to update attendance")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <Input label="Clock In Time" type="time" value={form.clockInTime}
                    onChange={v => setForm({ ...form, clockInTime: v })} />

                <Input label="Clock Out Time" type="time" value={form.clockOutTime}
                    onChange={v => setForm({ ...form, clockOutTime: v })} />

                <Input label="Clock In Location" value={form.clockInLocation}
                    onChange={v => setForm({ ...form, clockInLocation: v })} />

                <Input label="Clock Out Location" value={form.clockOutLocation}
                    onChange={v => setForm({ ...form, clockOutLocation: v })} />

                <Input label="Working From (In)" value={form.clockInWorkingFrom}
                    onChange={v => setForm({ ...form, clockInWorkingFrom: v })} />

                <Input label="Working From (Out)" value={form.clockOutWorkingFrom}
                    onChange={v => setForm({ ...form, clockOutWorkingFrom: v })} />
            </div>

            <div className="flex gap-6">
                <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.late}
                        onChange={e => setForm({ ...form, late: e.target.checked })} />
                    Late
                </label>

                <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.halfDay}
                        onChange={e => setForm({ ...form, halfDay: e.target.checked })} />
                    Half Day
                </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button onClick={onCancel} className="px-4 py-2 border rounded">
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    Save Changes
                </button>
            </div>
        </div>
    )
}

/* ================= HELPERS ================= */

const Info = ({ label, value }: any) => (
    <div className="bg-gray-50 border rounded-lg p-3">
        <div className="text-sm text-gray-500">{label}</div>
        <div className="font-medium">{value}</div>
    </div>
)

const Activity = ({ title, time, location, workingFrom, late }: any) => (
    <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-gray-600 flex gap-3 items-center">
            ⏱ {time}
            {location && <>📍 {location}</>}
            {workingFrom && <>({workingFrom})</>}
            {late && <span className="text-red-500">⚠ Late</span>}
        </div>
    </div>
)

const badge = (label: string, icon: string) => (
    <span className="flex items-center gap-1 px-2 py-1 border rounded text-xs">
        {icon} {label}
    </span>
)

function Input({ label, value, onChange, type = "text" }: any) {
    return (
        <div>
            <label className="text-sm text-gray-500">{label}</label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full border rounded px-3 py-2"
            />
        </div>
    )
}

function calcDuration(start: string, end: string) {
    const s = new Date(`1970-01-01T${start}`)
    const e = new Date(`1970-01-01T${end}`)
    const diff = (e.getTime() - s.getTime()) / 1000
    const h = Math.floor(diff / 3600)
    const m = Math.floor((diff % 3600) / 60)
    return `${h}h ${m}m`
}
