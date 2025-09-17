"use client";

import { useState } from "react";

export default function EditClientForm({ client }: { client: any }) {
  const [name, setName] = useState(client?.name || "");
  const [email, setEmail] = useState(client?.email || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updated client:", { name, email });
    // 🔹 Here you can call API to update client in DB
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 shadow rounded-xl">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save Changes
      </button>
    </form>
  );
}
