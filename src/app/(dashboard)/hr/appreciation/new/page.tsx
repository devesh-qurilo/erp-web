"use client";

import { useEffect, useState } from "react";

interface Award {
  id: number;
  title: string;
}

interface Employee {
  employeeId: string;
  name: string;
}

export default function AppreciationForm() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [awardId, setAwardId] = useState("");
  const [givenToEmployeeId, setGivenToEmployeeId] = useState("");
  const [date, setDate] = useState("");
  const [summary, setSummary] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch awards
  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const res = await fetch("/api/hr/awards", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch awards");
        const data: Award[] = await res.json();
        setAwards(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAwards();
  }, []);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const res = await fetch("/api/hr/employee", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch employees");
        const data = await res.json();
        setEmployees(data.content); // assuming API returns { content: Employee[] }
      } catch (err) {
        console.error(err);
      }
    };
    fetchEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile) return alert("Please select a photo");

    setLoading(true);
    setResponse(null); // reset previous response

    try {
      const formData = new FormData();
      formData.append("awardId", awardId);
      formData.append("givenToEmployeeId", givenToEmployeeId);
      formData.append("date", date);
      formData.append("summary", summary);
      formData.append("photoFile", photoFile);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("No token found in localStorage");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/hr/appreciations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      setResponse(data);

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit appreciation");
      }

      // Optionally reset form on success
      setAwardId("");
      setGivenToEmployeeId("");
      setDate("");
      setSummary("");
      setPhotoFile(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error submitting appreciation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Add Appreciation</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <select
          value={awardId}
          onChange={(e) => setAwardId(e.target.value)}
          required
          className="border p-2 rounded"
        >
          <option value="">Select Award</option>
          {awards.map((award) => (
            <option key={award.id} value={award.id}>
              {award.title}
            </option>
          ))}
        </select>

        <select
          value={givenToEmployeeId}
          onChange={(e) => setGivenToEmployeeId(e.target.value)}
          required
          className="border p-2 rounded"
        >
          <option value="">Select Employee</option>
          {employees.map((emp) => (
            <option key={emp.employeeId} value={emp.employeeId}>
              {emp.name} ({emp.employeeId})
            </option>
          ))}
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <textarea
          placeholder="Summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>

      {response && (
        <div className="mt-4 p-2 border rounded">
          <h3 className="font-bold">Response:</h3>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
