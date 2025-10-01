"use client";

import { useState } from "react";

export default function AwardPage() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateAward = async () => {
    if (!iconFile) {
      alert("Please upload an icon file!");
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      // ✅ get token from localStorage
      const token = localStorage.getItem("accessToken");

      if (!token) {
        alert("No token found in localStorage");
        setLoading(false);
        return;
      }

      // Build FormData
      const formData = new FormData();
      formData.append("title", title);
      formData.append("summary", summary);
      formData.append("iconFile", iconFile); // 👈 ensure this key matches backend

      // Call Next.js API
      const res = await fetch("/api/hr/awards", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      setResponse(data);
    } catch (error: any) {
      setResponse({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Create Award</h1>

      <div className="flex flex-col gap-3 mb-4">
        <input
          type="text"
          placeholder="Award Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Award Summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="file"
          onChange={(e) => setIconFile(e.target.files?.[0] || null)}
          className="border px-3 py-2 rounded"
        />

        <button
          onClick={handleCreateAward}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Creating..." : "Create Award"}
        </button>
      </div>

      {response && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <h2 className="font-semibold">Response:</h2>
          <pre className="text-sm">{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
