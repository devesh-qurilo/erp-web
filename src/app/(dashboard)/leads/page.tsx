"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FaEllipsisV,
  FaSearch,
  FaTh,
  FaThList,
  FaFilter,
  FaTimes,
} from "react-icons/fa";

interface Lead {
  id: string;
  contactName: string;
  contactDetails: string;
  leadOwner: string;
  addedBy: string;
  createdOn: string;
}

const leads: Lead[] = [
  {
    id: "101",
    contactName: "John Doe",
    contactDetails: "john@example.com",
    leadOwner: "Owner A",
    addedBy: "User 1",
    createdOn: "2025-08-01",
  },
  {
    id: "102",
    contactName: "Jane Smith",
    contactDetails: "jane@example.com",
    leadOwner: "Owner B",
    addedBy: "User 2",
    createdOn: "2025-08-03",
  },
  {
    id: "103",
    contactName: "Bob Johnson",
    contactDetails: "bob@example.com",
    leadOwner: "Owner A",
    addedBy: "User 3",
    createdOn: "2025-08-05",
  },
];

const Page: React.FC = () => {
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    leadOwner: "",
  });

  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  // Close action menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setActionMenuOpenId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handlers
  const handleView = (id: string) => alert(`View ${id}`);
  const handleEdit = (id: string) => alert(`Edit ${id}`);
  const handleDelete = (id: string) => {
    if (window.confirm(`Are you sure you want to delete ${id}?`)) {
      alert(`Deleted ${id}`);
    }
  };
  const handleMoveToClients = (id: string) => alert(`Moved ${id} to clients`);

  // Apply filters
  const filteredLeads = leads.filter((lead) => {
    return filters.leadOwner ? lead.leadOwner === filters.leadOwner : true;
  });

  // Group by owner (for Kanban view)
  const groupedLeads = filteredLeads.reduce<Record<string, Lead[]>>((acc, lead) => {
    if (!acc[lead.leadOwner]) acc[lead.leadOwner] = [];
    acc[lead.leadOwner].push(lead);
    return acc;
  }, {});

  // Action menu
  const renderActionMenu = (id: string) => (
    <div
      ref={actionMenuRef}
      className="absolute right-0 top-full mt-1 w-40 bg-white border rounded shadow-lg z-10"
    >
      <button
        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
        onClick={() => {
          handleView(id);
          setActionMenuOpenId(null);
        }}
      >
        View
      </button>
      <button
        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
        onClick={() => {
          handleEdit(id);
          setActionMenuOpenId(null);
        }}
      >
        Edit
      </button>
      <button
        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
        onClick={() => {
          handleMoveToClients(id);
          setActionMenuOpenId(null);
        }}
      >
        Move to Clients
      </button>
      <button
        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
        onClick={() => {
          handleDelete(id);
          setActionMenuOpenId(null);
        }}
      >
        Delete
      </button>
    </div>
  );

  // Sidebar filter
  const FilterSidebar = () => (
    <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg p-6 z-50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Filters</h2>
        <button
          className="text-gray-600 hover:text-gray-900"
          onClick={() => setShowFilters(false)}
        >
          <FaTimes />
        </button>
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Lead Owner</label>
        <select
          value={filters.leadOwner}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, leadOwner: e.target.value }))
          }
          className="w-full border rounded px-2 py-1"
        >
          <option value="">All</option>
          {[...new Set(leads.map((l) => l.leadOwner))].map((owner) => (
            <option key={owner} value={owner}>
              {owner}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className="p-4">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="space-x-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium">
            + Add
          </button>
          <button className="border px-4 py-2 rounded text-sm font-medium">
            Export
          </button>
          <button className="border px-4 py-2 rounded text-sm font-medium">
            Import
          </button>
        </div>
        <div className="flex items-center gap-3">
          <FaSearch className="text-gray-500" />
          <FaFilter
            className="text-gray-500 cursor-pointer"
            onClick={() => setShowFilters(true)}
          />
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 border rounded ${
              viewMode === "table" ? "bg-gray-200" : ""
            }`}
          >
            <FaThList />
          </button>
          <button
            onClick={() => setViewMode("kanban")}
            className={`p-2 border rounded ${
              viewMode === "kanban" ? "bg-gray-200" : ""
            }`}
          >
            <FaTh />
          </button>
        </div>
      </div>

      {/* Leads */}
      <h3 className="text-lg font-semibold mb-2">Leads</h3>
      {viewMode === "table" ? (
        <table className="w-full border border-gray-300 rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">Lead ID</th>
              <th className="border px-2 py-1">Contact Name</th>
              <th className="border px-2 py-1">Contact Details</th>
              <th className="border px-2 py-1">Lead Owner</th>
              <th className="border px-2 py-1">Added By</th>
              <th className="border px-2 py-1">Created On</th>
              <th className="border px-2 py-1">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="border px-2 py-1">{lead.id}</td>
                <td className="border px-2 py-1">{lead.contactName}</td>
                <td className="border px-2 py-1">{lead.contactDetails}</td>
                <td className="border px-2 py-1">{lead.leadOwner}</td>
                <td className="border px-2 py-1">{lead.addedBy}</td>
                <td className="border px-2 py-1">{lead.createdOn}</td>
                <td className="relative px-2 py-1 border">
                  <button
                    onClick={() =>
                      setActionMenuOpenId(
                        actionMenuOpenId === lead.id ? null : lead.id
                      )
                    }
                    className="p-1"
                  >
                    <FaEllipsisV />
                  </button>
                  {actionMenuOpenId === lead.id && renderActionMenu(lead.id)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {Object.keys(groupedLeads).map((owner) => (
            <div key={owner} className="bg-gray-100 p-3 rounded shadow">
              <h4 className="font-semibold mb-2">{owner}</h4>
              {groupedLeads[owner].map((lead) => (
                <div
                  key={lead.id}
                  className="bg-white p-2 mb-2 rounded shadow border"
                >
                  <p className="font-medium">{lead.contactName}</p>
                  <p className="text-sm text-gray-600">{lead.contactDetails}</p>
                  <p className="text-xs text-gray-500">{lead.leadOwner}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Sidebar */}
      {showFilters && <FilterSidebar />}
    </div>
  );
};

export default Page;
