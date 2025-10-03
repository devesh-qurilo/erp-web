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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const token = localStorage.getItem("accessToken")

        if (!token) {
          setError("No token found in localStorage");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/hr/holidays", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

    fetchHolidays();
  }, []);

  if (loading) return <p className="p-4">Loading holidays...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Holiday List</h1>
      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Date</th>
            <th className="border p-2">Day</th>
            <th className="border p-2">Occasion</th>
            <th className="border p-2">Weekly</th>
          </tr>
        </thead>
        <tbody>
          {holidays.map((holiday) => (
            <tr key={holiday.id} className="text-center">
              <td className="border p-2">{holiday.date}</td>
              <td className="border p-2">{holiday.day}</td>
              <td className="border p-2">{holiday.occasion}</td>
              <td className="border p-2">
                {holiday.isDefaultWeekly ? "Yes" : "No"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
