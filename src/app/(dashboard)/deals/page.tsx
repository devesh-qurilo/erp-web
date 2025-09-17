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

interface Deal {
  id: string;
  dealName: string;
  contactDetails: string;
  value: number;
  closeDate: string;
  followUp: string;
  dealAgent: string;
  dealWatcher: string;
  stage: string;
  priority: string;
  tags: string;
}

const deals: Deal[] = [
  {
    id: "001",
    dealName: "Deal 1",
    contactDetails: "contact1@example.com",
    value: 1000,
    closeDate: "2025-09-15",
    followUp: "2025-09-10",
    dealAgent: "Agent A",
    dealWatcher: "Watcher A",
    stage: "Qualification",
    priority: "High",
    tags: "Important, Follow-up",
  },
  {
    id: "002",
    dealName: "Deal 2",
    contactDetails: "contact2@example.com",
    value: 2000,
    closeDate: "2025-09-20",
    followUp: "2025-09-18",
    dealAgent: "Agent B",
    dealWatcher: "Watcher B",
    stage: "Negotiation",
    priority: "Medium",
    tags: "Urgent",
  },
  {
    id: "003",
    dealName: "Deal 3",
    contactDetails: "contact3@example.com",
    value: 1500,
    closeDate: "2025-09-25",
    followUp: "2025-09-22",
    dealAgent: "Agent C",
    dealWatcher: "Watcher C",
    stage: "Closed Won",
    priority: "Low",
    tags: "Closed",
  },
];

const page: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"Leads" | "Deals">("Deals");
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    leadOwner: "",
    dealAgent: "",
  });
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);

  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  // Close action menu if clicked outside
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

  // Handlers for action menu
  const handleView = (id: string) => alert(`View ${id}`);
  const handleEdit = (id: string) => alert(`Edit ${id}`);
  const handleDelete = (id: string) => {
    if (window.confirm(`Are you sure you want to delete ${id}?`)) {
      alert(`Deleted ${id}`);
    }
  };

  // Filtered data based on filters
  const filteredDeals = deals.filter((deal) =>
    filters.dealAgent ? deal.dealAgent === filters.dealAgent : true
  );


const groupedDeals = filteredDeals.reduce<Record<string, Deal[]>>((acc, deal) => {
    if (!acc[deal.stage]) acc[deal.stage] = [];
    acc[deal.stage].push(deal);
    return acc;
  }, {});

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
      
      <div>
        <label className="block font-medium mb-1">Deal Agent</label>
        <select
          value={filters.dealAgent}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, dealAgent: e.target.value }))
          }
          className="w-full border rounded px-2 py-1"
        >
          <option value="">All</option>
          {[...new Set(deals.map((d) => d.dealAgent))].map((agent) => (
            <option key={agent} value={agent}>
              {agent}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

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
          handleEdit(id);
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
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
            className={`p-2 border rounded ${viewMode === "table" ? "bg-gray-200" : ""
              }`}
          >
            <FaThList />
          </button>
          <button
            onClick={() => setViewMode("kanban")}
            className={`p-2 border rounded ${viewMode === "kanban" ? "bg-gray-200" : ""
              }`}
          >
            <FaTh />
          </button>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-2">Deals</h3>
          {viewMode === "table" ? (
            <table className="w-full border border-gray-300 rounded">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1">Deal ID</th>
                  <th className="border px-2 py-1">Deal Name</th>
                  <th className="border px-2 py-1">Contact Details</th>
                  <th className="border px-2 py-1">Value</th>
                  <th className="border px-2 py-1">Close Date</th>
                  <th className="border px-2 py-1">Follow Up</th>
                  <th className="border px-2 py-1">Agent</th>
                  <th className="border px-2 py-1">Watcher</th>
                  <th className="border px-2 py-1">Stage</th>
                  <th className="border px-2 py-1">Priority</th>
                  <th className="border px-2 py-1">Tags</th>
                  <th className="border px-2 py-1">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-gray-50">
                    <td className="border px-2 py-1">{deal.id}</td>
                    <td className="border px-2 py-1">{deal.dealName}</td>
                    <td className="border px-2 py-1">{deal.contactDetails}</td>
                    <td className="border px-2 py-1">${deal.value}</td>
                    <td className="border px-2 py-1">{deal.closeDate}</td>
                    <td className="border px-2 py-1">{deal.followUp}</td>
                    <td className="border px-2 py-1">{deal.dealAgent}</td>
                    <td className="border px-2 py-1">{deal.dealWatcher}</td>
                    <td className="border px-2 py-1">{deal.stage}</td>
                    <td className="border px-2 py-1">{deal.priority}</td>
                    <td className="border px-2 py-1">{deal.tags}</td>
                    <td className="relative px-2 py-1 border">
                      <button
                        onClick={() =>
                          setActionMenuOpenId(
                            actionMenuOpenId === deal.id ? null : deal.id
                          )
                        }
                        className="p-1"
                      >
                        <FaEllipsisV />
                      </button>
                      {actionMenuOpenId === deal.id && renderActionMenu(deal.id)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {Object.keys(groupedDeals).map((stage) => (
                <div key={stage} className="bg-gray-100 p-3 rounded shadow">
                  <h4 className="font-semibold mb-2">{stage}</h4>
                  {groupedDeals[stage].map((deal) => (
                    <div
                      key={deal.id}
                      className="bg-white p-2 mb-2 rounded shadow border"
                    >
                      <p className="font-medium">{deal.dealName}</p>
                      <p className="text-sm text-gray-600">${deal.value}</p>
                      <p className="text-sm text-gray-600">{deal.contactDetails}</p>
                      <p className="text-xs text-gray-500">{deal.tags}</p>
                      <p className="text-xs text-gray-500">{deal.dealAgent}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}


    </div>
  )
}

export default page
