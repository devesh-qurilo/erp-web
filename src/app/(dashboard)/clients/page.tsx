"use client";

import { useState } from "react";
import {
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";



type Client = {
  id: number;
  name: string;
  email: string;
  mobile: string;
  category: string;
  status: "Active" | "Inactive" | "Pending";
  created: string;
};

const clients: Client[] = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  name: "John Doe",
  email: "example@qurilo.com",
  mobile: "+91 9999999999",
  category: "------",
  status: i % 3 === 0 ? "Active" : i % 3 === 1 ? "Pending" : "Inactive",
  created: "27/08/2025",
}));

export default function ClientsPage() {
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(9);

  // Filter search
  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile.includes(search)
  );

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / perPage);
  const startIndex = (page - 1) * perPage;
  const paginatedClients = filteredClients.slice(
    startIndex,
    startIndex + perPage
  );

  return (
    <div className="">
      {/* Top Title */}
      <h1 className="text-2xl font-semibold mb-4">Clients</h1>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 items-center mb-6 bg-white shadow-sm p-4 rounded-xl">
        <input type="date" className="border rounded-lg px-3 py-2" />
        <input type="date" className="border rounded-lg px-3 py-2" />
        <select className="border rounded-lg px-3 py-2">
          <option value="all">Client: All</option>
        </select>
        <select className="border rounded-lg px-3 py-2">
          <option value="all">Category: All</option>
        </select>
        <button className="ml-auto border px-4 py-2 rounded-lg bg-gray-100">
          Filters
        </button>
      </div>

      {/* Add Client + Search */}
      <div className="flex justify-between items-center mb-4">
        
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow">
          + Add Client
        </button>
        <input
          type="text"
          placeholder="Search..."
          className="border rounded-lg px-3 py-2 w-64"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-xl">
        {/* Scrollable Table Container */}
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr className="text-left text-sm text-gray-600">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Mobile</th>
                <th className="p-3">Category</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedClients.map((client) => (
                <tr key={client.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{client.name}</td>
                  <td className="p-3">{client.email}</td>
                  <td className="p-3">{client.mobile}</td>
                  <td className="p-3">{client.category}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium
                      ${
                        client.status === "Active"
                          ? "bg-green-100 text-green-600"
                          : client.status === "Pending"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {client.status}
                    </span>
                  </td>
                  <td className="p-3">{client.created}</td>
                  <td className="p-3 relative">
                    <button
                      onClick={() =>
                        setOpenMenu(openMenu === client.id ? null : client.id)
                      }
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {/* Action Dropdown */}
                    {openMenu === client.id && (
                      <div
                        className="absolute right-0 mt-2 w-36 bg-white shadow-lg rounded-lg z-10"
                        onMouseLeave={() => setOpenMenu(null)}
                      >
                        <Link href={`/clients/${client.id}`}>
  <button className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100">
    <Eye size={16} /> View
  </button>
</Link>

                       <Link href={`/clients/${client.id}/edit`}>
  <button className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100">
    <Edit size={16} /> Edit
  </button>
</Link>

                        <button className="flex items-center gap-2 px-4 py-2 w-full text-red-600 hover:bg-gray-100">
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span>Results per page:</span>
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="border rounded-lg px-2 py-1"
          >
            <option value={5}>5</option>
            <option value={9}>9</option>
            <option value={15}>15</option>
          </select>
        </div>
        <div>
          Page {page} of {totalPages}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded disabled:opacity-50"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded disabled:opacity-50"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

