'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';

interface Designation {
  id: number;
  designationName: string;
  parentDesignationId: number | null;
  parentDesignationName: string | null;
  createDate: string;
}

// 🔹 Fetcher for SWR
const fetcher = async (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (!token) throw new Error('Access token not found');

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
};

export default function DesignationsPage() {
  const { data, error, isLoading } = useSWR<Designation[]>('/api/hr/designation', fetcher);

  // 🔹 Form state
  const [designationName, setDesignationName] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // 🔹 Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editParentId, setEditParentId] = useState<number | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // ✅ Create new designation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No access token found');

      const res = await fetch('/api/hr/designation', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ designationName, parentDesignationId: parentId || null }),
      });

      if (!res.ok) throw new Error('Failed to create designation');

      setDesignationName('');
      setParentId(null);
      mutate('/api/hr/designation');
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load designation for editing
  const loadDesignation = async (id: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No access token found');

      const res = await fetch(`/api/hr/designation/${id}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('Failed to fetch designation');

      const data: Designation = await res.json();
      setEditName(data.designationName);
      setEditParentId(data.parentDesignationId);
      setEditingId(data.id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ✅ Update designation
  const handleUpdate = async (id: number) => {
    setEditLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No access token found');

      const res = await fetch(`/api/hr/designation/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ designationName: editName, parentDesignationId: editParentId || null }),
      });

      if (!res.ok) throw new Error('Failed to update designation');

      setEditingId(null);
      mutate('/api/hr/designation');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  // ✅ Delete designation
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this designation?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No access token found');

      const res = await fetch(`/api/hr/designation/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('Failed to delete designation');
      mutate('/api/hr/designation');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (isLoading) return <div className="text-center mt-8">Loading...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{(error as Error).message}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">All Designations</h1>

      {/* 🔹 Add New Designation Form */}
      <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg shadow-sm bg-gray-50">
        <input
          type="text"
          placeholder="Designation name"
          value={designationName}
          onChange={(e) => setDesignationName(e.target.value)}
          required
          className="border rounded px-3 py-2 mr-2 w-64"
        />
        <select
          value={parentId ?? ''}
          onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
          className="border rounded px-3 py-2 mr-2"
        >
          <option value="">No Parent</option>
          {data?.map((d) => (
            <option key={d.id} value={d.id}>{d.designationName}</option>
          ))}
        </select>
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400">
          {loading ? 'Adding...' : 'Add'}
        </button>
        {formError && <p className="text-red-500 mt-2">{formError}</p>}
      </form>

      {/* 🔹 Designations Table */}
      {data && data.length > 0 ? (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">ID</th>
              <th className="border px-4 py-2 text-left">Name</th>
              <th className="border px-4 py-2 text-left">Parent</th>
              <th className="border px-4 py-2 text-left">Created</th>
              <th className="border px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{d.id}</td>
                <td className="border px-4 py-2">
                  {editingId === d.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="border px-2 py-1 rounded w-full"
                    />
                  ) : d.designationName}
                </td>
                <td className="border px-4 py-2">
                  {editingId === d.id ? (
                    <select
                      value={editParentId ?? ''}
                      onChange={(e) => setEditParentId(e.target.value ? Number(e.target.value) : null)}
                      className="border px-2 py-1 rounded w-full"
                    >
                      <option value="">No Parent</option>
                      {data.map((opt) => (
                        <option key={opt.id} value={opt.id}>{opt.designationName}</option>
                      ))}
                    </select>
                  ) : d.parentDesignationName || '-'}
                </td>
                <td className="border px-4 py-2">{new Date(d.createDate).toLocaleDateString()}</td>
                <td className="border px-4 py-2 space-x-2">
                  {editingId === d.id ? (
                    <>
                      <button
                        onClick={() => handleUpdate(d.id)}
                        disabled={editLoading}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        {editLoading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => loadDesignation(d.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500">No designations found.</p>
      )}
    </div>
  );
}
