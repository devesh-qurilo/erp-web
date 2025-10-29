"use client";

import { useEffect, useState } from "react";

interface Holiday {
  id: number;
  date: string;
  day: string;
  occasion: string;
  isDefaultWeekly: boolean;
  isActive: boolean;
}

export default function HolidayPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [filteredHolidays, setFilteredHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [search, setSearch] = useState("");
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [addingHoliday, setAddingHoliday] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ date: "", occasion: "" });
  const [saving, setSaving] = useState(false);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("No token found in localStorage");
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/hr/holidays`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch holidays");
      }

      const data: Holiday[] = await res.json();
      setHolidays(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingHoliday) return;
    try {
      setSaving(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("No token found in localStorage");
        return;
      }

      const res = await fetch(`/api/hr/holidays/${editingHoliday.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: editingHoliday.date,
          occasion: editingHoliday.occasion,
        }),
      });

      if (!res.ok) throw new Error("Failed to update holiday");

      await fetchHolidays(); // refresh list
      setEditingHoliday(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!newHoliday.date || !newHoliday.occasion.trim()) {
      setError("Date and occasion are required");
      return;
    }
    try {
      setSaving(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("No token found in localStorage");
        return;
      }

      const res = await fetch(`/api/hr/holidays/bulk`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: newHoliday.date,
          occasion: newHoliday.occasion,
        }),
      });

      if (!res.ok) throw new Error("Failed to add holiday");

      await fetchHolidays(); // refresh list
      setAddingHoliday(false);
      setNewHoliday({ date: "", occasion: "" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  useEffect(() => {
    let filtered = holidays;

    // Filter by year and month
    if (year || month) {
      filtered = filtered.filter((holiday) => {
        const [hYear, hMonth] = holiday.date.split('-').map(Number);
        if (year && hYear !== year) return false;
        if (month && hMonth !== month) return false;
        return true;
      });
    }

    // Filter by search
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter((h) =>
        h.occasion.toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredHolidays(filtered);
  }, [holidays, year, month, search]);

  if (loading) return <p className="p-4 text-gray-600">Loading holidays...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Holiday Management</h1>
      
      </div>

     

      {/* Filters */}
      <div className="mb-6 bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Year:</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="border border-gray-300 p-2 rounded-md w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={2000}
              max={2100}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Month:</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Months</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(0, m - 1).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              setYear(new Date().getFullYear());
              setMonth(new Date().getMonth() + 1);
              setSearch("");
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md shadow-sm transition-colors"
          >
            Reset
          </button>
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by occasion..."
              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occasion</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weekly</th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th> */}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredHolidays.length > 0 ? (
              filteredHolidays.map((holiday) => (
                <tr key={holiday.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingHoliday?.id === holiday.id ? (
                      <input
                        type="date"
                        value={editingHoliday.date}
                        onChange={(e) =>
                          setEditingHoliday({ ...editingHoliday, date: e.target.value })
                        }
                        className="border border-gray-300 p-1 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{holiday.date}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{holiday.day}</div>
                  </td>
                  <td className="px-6 py-4">
                    {editingHoliday?.id === holiday.id ? (
                      <input
                        type="text"
                        value={editingHoliday.occasion}
                        onChange={(e) =>
                          setEditingHoliday({ ...editingHoliday, occasion: e.target.value })
                        }
                        className="border border-gray-300 p-1 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{holiday.occasion}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      holiday.isDefaultWeekly ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {holiday.isDefaultWeekly ? "Yes" : "No"}
                    </span>
                  </td>
                
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No holidays found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}