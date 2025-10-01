"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

type EmergencyContactPayload = {
  name: string;
  email: string;
  mobile: string;
  address: string;
  relationship: string;
};

export default function AddEmergencyContactPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const employeeId = params?.id;

  const [form, setForm] = useState<EmergencyContactPayload>({
    name: "",
    email: "",
    mobile: "",
    address: "",
    relationship: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeId) {
      setError("Missing employee ID in route");
      return;
    }

    // Basic client-side validation
    if (!form.name || !form.email || !form.mobile || !form.relationship) {
      setError("Name, email, mobile, and relationship are required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Invalid email format");
      return;
    }
    if (!/^\d{10}$/.test(form.mobile)) {
      setError("Mobile number must be 10 digits");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      if (!token) {
        throw new Error("Authentication required");
      }

      const res = await fetch(`/api/hr/employee/${employeeId}/emergency-contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const contentType = res.headers.get("content-type") || "application/json";
      const raw = await res.text();
      let data: any = raw;
      if (contentType.includes("application/json")) {
        try {
          data = JSON.parse(raw);
        } catch {
          // Fallback to raw text
        }
      }

      if (!res.ok) {
        const message = typeof data === "string" && data.trim().length > 0
          ? data
          : (data?.error || `Failed to create emergency contact (status ${res.status})`);
        throw new Error(message);
      }

      alert("Emergency contact saved successfully");
      router.push(`/hr/employee/${employeeId}`);
    } catch (err: any) {
      setError(err?.message || "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-4 max-w-2xl">
      <h1 className="text-xl font-semibold mb-4">Add Emergency Contact</h1>
      {error ? (
        <div className="mb-4 text-red-600 text-sm">{error}</div>
      ) : null}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm">Name</span>
            <input
              type="text"
              className="border rounded px-3 py-2"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              placeholder="John Doe"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm">Email</span>
            <input
              type="email"
              className="border rounded px-3 py-2"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              placeholder="john.e@example.com"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm">Mobile</span>
            <input
              type="text"
              className="border rounded px-3 py-2"
              value={form.mobile}
              onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))}
              required
              placeholder="9876543210"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm">Relationship</span>
            <input
              type="text"
              className="border rounded px-3 py-2"
              value={form.relationship}
              onChange={(e) => setForm((f) => ({ ...f, relationship: e.target.value }))}
              required
              placeholder="Brother"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Address</span>
          <textarea
            className="border rounded px-3 py-2 min-h-[100px]"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            placeholder="New Delhi, India"
          />
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save Emergency Contact"}
          </button>
          <button
            type="button"
            className="border px-4 py-2 rounded"
            onClick={() => router.back()}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}