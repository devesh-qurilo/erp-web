// src/app/dashboard/hr/designation/page.tsx
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

type DesignationTree = Designation & { children: DesignationTree[] };

const fetcher = async (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  if (!token) throw new Error("Access token not found");

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch designations');
  }
  return res.json();
};

export default function DesignationsPage() {
  const { data, error, isLoading } = useSWR<Designation[]>('/api/hr/designation', fetcher);

  const [designationName, setDesignationName] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No access token found");

      const res = await fetch('/api/hr/designation', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          designationName,
          parentDesignationId: parentId || null,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create designation');
      }

      setDesignationName('');
      setParentId(null);

      // Refresh SWR cache
      mutate('/api/hr/designation');
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (designations: Designation[]): DesignationTree[] => {
    const map = new Map<number, DesignationTree>();
    const tree: DesignationTree[] = [];

    designations.forEach((d) => {
      map.set(d.id, { ...d, children: [] });
    });

    designations.forEach((d) => {
      if (d.parentDesignationId === null) {
        tree.push(map.get(d.id)!);
      } else {
        const parent = map.get(d.parentDesignationId);
        if (parent) parent.children.push(map.get(d.id)!);
      }
    });

    return tree;
  };

  const renderTree = (nodes: DesignationTree[], level = 0) => (
    <ul className={`ml-${level * 4}`}>
      {nodes.map((node) => (
        <li key={node.id} className="my-2">
          <div className="flex items-center">
            <span className="font-medium">{node.designationName}</span>
            <span className="ml-2 text-gray-500 text-sm">
              (Created: {new Date(node.createDate).toLocaleDateString()})
            </span>
          </div>
          {node.children.length > 0 && renderTree(node.children, level + 1)}
        </li>
      ))}
    </ul>
  );

  if (isLoading) return <div className="text-center mt-8">Loading...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{(error as Error).message}</div>;

  const tree = buildTree(data || []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Designations Hierarchy</h1>

      {/* ✅ Add New Designation Form */}
      <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg shadow-sm bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Add Designation</h2>
        
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
          <option value="">No Parent (Top-level)</option>
          {data?.map((d) => (
            <option key={d.id} value={d.id}>
              {d.designationName}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>

        {formError && <p className="text-red-500 mt-2">{formError}</p>}
      </form>

      {/* ✅ Tree Display */}
      {tree.length > 0 ? renderTree(tree) : <p className="text-gray-500">No designations found.</p>}
    </div>
  );
}
