"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Stage } from "@/types/stages";

type Employee = {
  employeeId: string;
  name: string;
};

export default function CreateDealPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    leadId: "",
    pipeline: "",
    dealStage: "",
    dealCategory: "",
    dealAgent: "",
    dealWatchers: [] as string[],
    value: "",
    expectedCloseDate: "",
    dealContact: "",
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(false);
  const [stagesLoading, setStagesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch employees and stages
  useEffect(() => {
    const fetchEmployeesAndStages = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("No access token found. Please log in.");
          return;
        }

        // Fetch employees
        const empRes = await fetch("/api/hr/employee", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!empRes.ok) throw new Error("Failed to fetch employees");
        const empData = await empRes.json();
        setEmployees(empData.content || []);

        // Fetch stages
        const stageRes = await fetch("/api/deals/stages", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!stageRes.ok) throw new Error("Failed to fetch deal stages");
        const stageData: Stage[] = await stageRes.json();
        setStages(stageData);
        if (stageData.length > 0) {
          setFormData((prev) => ({ ...prev, dealStage: stageData[0].name }));
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setStagesLoading(false);
      }
    };

    fetchEmployeesAndStages();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleWatcherChange = (employeeId: string, checked: boolean) => {
    setFormData((prev) => {
      const current = prev.dealWatchers || [];
      const updated = checked
        ? [...current, employeeId]
        : current.filter((id) => id !== employeeId);
      return { ...prev, dealWatchers: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (
      !formData.title ||
      !formData.pipeline ||
      !formData.dealStage ||
      !formData.dealCategory ||
      !formData.dealAgent ||
      !formData.value ||
      !formData.expectedCloseDate
    ) {
      setError("Please fill all required fields.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("No access token found. Please log in.");
        return;
      }

      const payload = {
        title: formData.title,
        leadId: formData.leadId ? Number(formData.leadId) : undefined,
        pipeline: formData.pipeline,
        dealStage: formData.dealStage,
        dealCategory: formData.dealCategory,
        dealAgent: formData.dealAgent,
        dealWatchers: formData.dealWatchers,
        value: parseFloat(formData.value),
        expectedCloseDate: formData.expectedCloseDate,
        dealContact: formData.dealContact,
      };

      const res = await fetch("/api/deals/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create deal");

      setSuccess("Deal created successfully!");
      setTimeout(() => router.push("/deals/get"), 2000);
    } catch (err) {
      console.error(err);
      setError("Failed to create deal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (stagesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg font-semibold">
        Loading form...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Deal</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 border rounded-2xl shadow-sm">
        {error && <div className="mb-4 text-red-600 text-sm font-semibold">{error}</div>}
        {success && <div className="mb-4 text-green-600 text-sm font-semibold">{success}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lead ID</label>
            <input
              type="number"
              name="leadId"
              value={formData.leadId}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pipeline *</label>
            <input
              type="text"
              name="pipeline"
              value={formData.pipeline}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deal Stage *</label>
            <select
              name="dealStage"
              value={formData.dealStage}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
            >
              {stages.map((stage) => (
                <option key={stage.id} value={stage.name}>
                  {stage.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <input
              type="text"
              name="dealCategory"
              value={formData.dealCategory}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deal Agent *</label>
            <select
              name="dealAgent"
              value={formData.dealAgent}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Select Deal Agent</option>
              {employees.map((emp) => (
                <option key={emp.employeeId} value={emp.employeeId}>
                  {emp.name} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Value ($) *</label>
            <input
              type="number"
              name="value"
              value={formData.value}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Close Date *
            </label>
            <input
              type="date"
              name="expectedCloseDate"
              value={formData.expectedCloseDate}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deal Contact</label>
            <input
              type="text"
              name="dealContact"
              value={formData.dealContact}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Watchers */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Deal Watchers</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {employees.map((emp) => (
              <label key={emp.employeeId} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.dealWatchers.includes(emp.employeeId)}
                  onChange={(e) => handleWatcherChange(emp.employeeId, e.target.checked)}
                />
                {emp.name} ({emp.employeeId})
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Creating..." : "Create Deal"}
          </button>
          <Link href="/deals/get" className="px-4 py-2 text-blue-600 hover:underline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
