"use client";

import { useEffect, useState } from "react";

interface DealTagsProps {
  dealId: string;
}

export default function DealTags({ dealId }: DealTagsProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      if (!dealId) {
        setError("Deal ID not found");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("No access token found. Please log in.");
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/deals/get/${dealId}/tags`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch tags: ${res.statusText}`);
        }

        const data = await res.json();
        if (!Array.isArray(data.data)) {
          throw new Error("Invalid response format: tags should be an array");
        }

        setTags(data.data);
      } catch (err: any) {
        console.error("Failed to fetch tags:", err);
        setError(err.message || "Failed to load tags. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, [dealId]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Tags</h3>
        <p className="text-sm text-gray-500">Loading tags...</p>
      </div>
    );
  }

  if (error || !tags.length) {
    return null; // Don't render anything if there's an error or no tags
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Tags</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}