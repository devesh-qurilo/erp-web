'use client';

import useSWR from 'swr';

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
      'Authorization': `Bearer ${token}`,   // ✅ FIX
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
      {tree.length > 0 ? renderTree(tree) : <p className="text-gray-500">No designations found.</p>}
    </div>
  );
}
