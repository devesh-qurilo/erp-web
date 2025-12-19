// "use client";

// import { useEffect, useState } from "react";

// interface Holiday {
//   id: number;
//   date: string;
//   day: string;
//   occasion: string;
//   isDefaultWeekly: boolean;
//   isActive: boolean;
// }

// export default function HolidayPage() {
//   const [holidays, setHolidays] = useState<Holiday[]>([]);
//   const [filteredHolidays, setFilteredHolidays] = useState<Holiday[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [year, setYear] = useState(new Date().getFullYear());
//   const [month, setMonth] = useState(new Date().getMonth() + 1);
//   const [search, setSearch] = useState("");
//   const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
//   const [addingHoliday, setAddingHoliday] = useState(false);
//   // const [newHoliday, setNewHoliday] = useState({ date: "", occasion: "" });
//   const [newHolidays, setNewHolidays] = useState([
//     { date: "", occasion: "" },
//   ]);
//   const [openActionId, setOpenActionId] = useState<number | null>(null);
//   const [deleteId, setDeleteId] = useState<number | null>(null);


//   const [saving, setSaving] = useState(false);

//   const fetchHolidays = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const token = localStorage.getItem("accessToken");
//       if (!token) {
//         setError("No token found in localStorage");
//         setLoading(false);
//         return;
//       }

//       const res = await fetch(`/api/hr/holidays`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!res.ok) {
//         throw new Error("Failed to fetch holidays");
//       }

//       const data: Holiday[] = await res.json();
//       setHolidays(data);
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addRow = () => {
//     setNewHolidays([...newHolidays, { date: "", occasion: "" }]);
//   };

//   const removeRow = (index: number) => {
//     setNewHolidays(newHolidays.filter((_, i) => i !== index));
//   };

//   const updateRow = (index: number, field: "date" | "occasion", value: string) => {
//     const updated = [...newHolidays];
//     updated[index][field] = value;
//     setNewHolidays(updated);
//   };


//   const handleUpdate = async () => {
//     if (!editingHoliday) return;
//     try {
//       setSaving(true);
//       const token = localStorage.getItem("accessToken");
//       if (!token) {
//         setError("No token found in localStorage");
//         return;
//       }

//       const res = await fetch(`/api/hr/holidays/${editingHoliday.id}`, {
//         method: "PUT",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           date: editingHoliday.date,
//           occasion: editingHoliday.occasion,
//         }),
//       });

//       if (!res.ok) throw new Error("Failed to update holiday");

//       await fetchHolidays(); // refresh list
//       setEditingHoliday(null);
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleAdd = async () => {
//     const validHolidays = newHolidays.filter(
//       (h) => h.date && h.occasion.trim()
//     );

//     if (validHolidays.length === 0) {
//       setError("At least one valid holiday is required");
//       return;
//     }

//     try {
//       setSaving(true);
//       setError("");

//       const token = localStorage.getItem("accessToken");
//       if (!token) {
//         setError("No token found");
//         return;
//       }

//       const payload = { holidays: validHolidays };

//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_MAIN}/employee/api/holidays/bulk`,
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(payload),
//         }
//       );

//       if (!res.ok) {
//         const text = await res.text();
//         throw new Error(text || "Failed to add holidays");
//       }

//       await fetchHolidays();
//       setAddingHoliday(false);
//       setNewHolidays([{ date: "", occasion: "" }]);
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = async (id: number) => {
//     const confirmDelete = window.confirm(
//       "Are you sure you want to delete this holiday?"
//     );
//     if (!confirmDelete) return;

//     try {
//       setSaving(true);
//       setError("");

//       const token = localStorage.getItem("accessToken");
//       if (!token) {
//         setError("No token found");
//         return;
//       }

//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_MAIN}/employee/api/holidays/${id}`,
//         {
//           method: "DELETE",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (!res.ok) {
//         const text = await res.text();
//         throw new Error(text || "Failed to delete holiday");
//       }

//       await fetchHolidays(); // refresh table
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setSaving(false);
//     }
//   };




//   useEffect(() => {
//     fetchHolidays();
//   }, []);

//   useEffect(() => {
//     let filtered = holidays;

//     // Filter by year and month
//     if (year || month) {
//       filtered = filtered.filter((holiday) => {
//         const [hYear, hMonth] = holiday.date.split('-').map(Number);
//         if (year && hYear !== year) return false;
//         if (month && hMonth !== month) return false;
//         return true;
//       });
//     }

//     // Filter by search
//     if (search.trim()) {
//       const lowerSearch = search.toLowerCase();
//       filtered = filtered.filter((h) =>
//         h.occasion.toLowerCase().includes(lowerSearch)
//       );
//     }

//     setFilteredHolidays(filtered);
//   }, [holidays, year, month, search]);

//   if (loading) return <p className="p-4 text-gray-600">Loading holidays...</p>;
//   if (error) return <p className="p-4 text-red-500">Error: {error}</p>;

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-gray-900">Holiday Management</h1>
//         <button
//           onClick={() => {
//             setAddingHoliday(!addingHoliday);
//             if (!addingHoliday) setNewHoliday({ date: "", occasion: "" });
//           }}
//           className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-sm transition-colors"
//           disabled={saving}
//         >
//           {addingHoliday ? "Cancel Add" : "Add Holiday"}
//         </button>
//       </div>

//       {/* Add Holiday Form */}
//       {addingHoliday && (
//         <div className="mb-6 p-6 bg-white border rounded-lg shadow-sm">
//           <h2 className="text-lg font-semibold mb-4">Add Multiple Holidays</h2>

//           <div className="space-y-4">
//             {newHolidays.map((holiday, index) => (
//               <div
//                 key={index}
//                 className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
//               >
//                 <div className="md:col-span-2">
//                   <label className="block text-sm mb-1">Date</label>
//                   <input
//                     type="date"
//                     value={holiday.date}
//                     onChange={(e) => updateRow(index, "date", e.target.value)}
//                     className="w-full border rounded-md px-3 py-2"
//                   />
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-sm mb-1">Occasion</label>
//                   <input
//                     type="text"
//                     value={holiday.occasion}
//                     onChange={(e) => updateRow(index, "occasion", e.target.value)}
//                     placeholder="Occasion name"
//                     className="w-full border rounded-md px-3 py-2"
//                   />
//                 </div>

//                 <div className="flex gap-2">
//                   {newHolidays.length > 1 && (
//                     <button
//                       onClick={() => removeRow(index)}
//                       className="bg-red-500 text-white px-3 py-2 rounded-md"
//                     >
//                       ✕
//                     </button>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="flex gap-3 mt-6">
//             <button
//               onClick={addRow}
//               className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
//             >
//               + Add Row
//             </button>

//             <button
//               onClick={handleAdd}
//               disabled={saving}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
//             >
//               {saving ? "Saving..." : "Save Holidays"}
//             </button>

//             <button
//               onClick={() => {
//                 setAddingHoliday(false);
//                 setNewHolidays([{ date: "", occasion: "" }]);
//               }}
//               className="bg-gray-400 text-white px-4 py-2 rounded-md"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}

//       {deleteId !== null && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-2">
//               Delete Holiday
//             </h3>
//             <p className="text-sm text-gray-600 mb-6">
//               Are you sure you want to delete this holiday?
//               This action cannot be undone.
//             </p>

//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => setDeleteId(null)}
//                 className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={() => {
//                   handleDelete(deleteId);
//                   setDeleteId(null);
//                 }}
//                 disabled={saving}
//                 className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white"
//               >
//                 {saving ? "Deleting..." : "Delete"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}



//       {/* Filters */}
//       <div className="mb-6 bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
//         <div className="flex flex-wrap gap-3 items-center">
//           <div className="flex items-center gap-2">
//             <label className="text-sm font-medium text-gray-700">Year:</label>
//             <input
//               type="number"
//               value={year}
//               onChange={(e) => setYear(Number(e.target.value))}
//               className="border border-gray-300 p-2 rounded-md w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               min={2000}
//               max={2100}
//             />
//           </div>
//           <div className="flex items-center gap-2">
//             <label className="text-sm font-medium text-gray-700">Month:</label>
//             <select
//               value={month}
//               onChange={(e) => setMonth(Number(e.target.value))}
//               className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="">All Months</option>
//               {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
//                 <option key={m} value={m}>
//                   {new Date(0, m - 1).toLocaleString("default", { month: "long" })}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <button
//             onClick={() => {
//               setYear(new Date().getFullYear());
//               setMonth(new Date().getMonth() + 1);
//               setSearch("");
//             }}
//             className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md shadow-sm transition-colors"
//           >
//             Reset
//           </button>
//           <div className="flex-1 min-w-[200px]">
//             <input
//               type="text"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="Search by occasion..."
//               className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
//         <table className="w-full">
//           <thead>
//             <tr className="bg-gray-50">
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occasion</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weekly</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200">
//             {filteredHolidays.length > 0 ? (
//               filteredHolidays.map((holiday) => (
//                 <tr key={holiday.id} className="hover:bg-gray-50 transition-colors">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {editingHoliday?.id === holiday.id ? (
//                       <input
//                         type="date"
//                         value={editingHoliday.date}
//                         onChange={(e) =>
//                           setEditingHoliday({ ...editingHoliday, date: e.target.value })
//                         }
//                         className="border border-gray-300 p-1 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       />
//                     ) : (
//                       <div className="text-sm text-gray-900">{holiday.date}</div>
//                     )}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm text-gray-900">{holiday.day}</div>
//                   </td>
//                   <td className="px-6 py-4">
//                     {editingHoliday?.id === holiday.id ? (
//                       <input
//                         type="text"
//                         value={editingHoliday.occasion}
//                         onChange={(e) =>
//                           setEditingHoliday({ ...editingHoliday, occasion: e.target.value })
//                         }
//                         className="border border-gray-300 p-1 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       />
//                     ) : (
//                       <div className="text-sm text-gray-900">{holiday.occasion}</div>
//                     )}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${holiday.isDefaultWeekly ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
//                       }`}>
//                       {holiday.isDefaultWeekly ? "Yes" : "No"}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
//                     {editingHoliday?.id === holiday.id ? (
//                       <div className="flex gap-2">
//                         <button
//                           onClick={handleUpdate}
//                           disabled={saving}
//                           className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-xs"
//                         >
//                           {saving ? "Saving..." : "Save"}
//                         </button>
//                         <button
//                           onClick={() => setEditingHoliday(null)}
//                           className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-1 rounded-md text-xs"
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     ) : (
//                       <>
//                         {/* 3 DOT BUTTON */}
//                         <button
//                           onClick={() =>
//                             setOpenActionId(openActionId === holiday.id ? null : holiday.id)
//                           }
//                           className="p-2 rounded-full hover:bg-gray-100"
//                         >
//                           ⋮
//                         </button>

//                         {/* DROPDOWN */}
//                         {openActionId === holiday.id && (
//                           <div className="absolute right-0 mt-2 w-36 bg-white border rounded-md shadow-lg z-20">
//                             <button
//                               onClick={() => {
//                                 setEditingHoliday(holiday);
//                                 setOpenActionId(null);
//                               }}
//                               className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
//                             >
//                               ✏️ Edit
//                             </button>

//                             <button
//                               onClick={() => {
//                                 setOpenActionId(null);
//                                 handleDelete(holiday.id);
//                               }}
//                               className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
//                             >
//                               🗑 Delete
//                             </button>
//                           </div>
//                         )}
//                       </>
//                     )}
//                   </td>



//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
//                   No holidays found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }




"use client";

import { useEffect, useState } from "react";
import { MoreVertical, Pencil, Trash2, X } from "lucide-react";

interface Holiday {
  id: number;
  date: string;
  day: string;
  occasion: string;
  isDefaultWeekly: boolean;
  isActive: boolean;
}

export default function HolidayPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [filteredHolidays, setFilteredHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [search, setSearch] = useState("");

  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [actionHoliday, setActionHoliday] = useState<Holiday | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [saving, setSaving] = useState(false);

  // ---------------- FETCH ----------------
  const fetchHolidays = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch("/api/hr/holidays", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch holidays");
      const data = await res.json();
      setHolidays(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UPDATE ----------------
  const handleUpdate = async () => {
    if (!editingHoliday) return;
    try {
      setSaving(true);
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch(`/api/hr/holidays/${editingHoliday.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: editingHoliday.date,
          occasion: editingHoliday.occasion,
        }),
      });

      if (!res.ok) throw new Error("Update failed");
      setEditingHoliday(null);
      fetchHolidays();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id: number) => {
    try {
      setSaving(true);
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_MAIN}/employee/api/holidays/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Delete failed");
      fetchHolidays();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    fetchHolidays();
  }, []);

  useEffect(() => {
    let data = holidays;

    data = data.filter((h) => {
      const [y, m] = h.date.split("-").map(Number);
      if (year && y !== year) return false;
      if (month && m !== month) return false;
      if (search && !h.occasion.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });

    setFilteredHolidays(data);
  }, [holidays, year, month, search]);

  if (loading) return <p className="p-4">Loading…</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Holiday Management</h1>

      {/* TABLE */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Day</th>
              <th className="px-6 py-3 text-left">Occasion</th>
              <th className="px-6 py-3 text-left">Weekly</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filteredHolidays.map((holiday) => (
              <tr key={holiday.id}>
                <td className="px-6 py-4">
                  {editingHoliday?.id === holiday.id ? (
                    <input
                      type="date"
                      value={editingHoliday.date}
                      onChange={(e) =>
                        setEditingHoliday({
                          ...editingHoliday,
                          date: e.target.value,
                        })
                      }
                      className="border rounded p-1"
                    />
                  ) : (
                    holiday.date
                  )}
                </td>

                <td className="px-6 py-4">{holiday.day}</td>

                <td className="px-6 py-4">
                  {editingHoliday?.id === holiday.id ? (
                    <input
                      value={editingHoliday.occasion}
                      onChange={(e) =>
                        setEditingHoliday({
                          ...editingHoliday,
                          occasion: e.target.value,
                        })
                      }
                      className="border rounded p-1"
                    />
                  ) : (
                    holiday.occasion
                  )}
                </td>

                <td className="px-6 py-4">
                  {holiday.isDefaultWeekly ? "Yes" : "No"}
                </td>

                <td className="px-6 py-4">
                  {editingHoliday?.id === holiday.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdate}
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingHoliday(null)}
                        className="bg-gray-300 px-3 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActionHoliday(holiday)}
                      className="p-2 rounded-full hover:bg-gray-100"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ACTION MODAL */}
      {actionHoliday && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-64 shadow-lg">
            <div className="flex justify-between items-center px-4 py-3 border-b">
              <span className="font-semibold">Actions</span>
              <button onClick={() => setActionHoliday(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => {
                setEditingHoliday(actionHoliday);
                setActionHoliday(null);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100"
            >
              <Pencil className="w-4 h-4 text-blue-600" />
              Edit
            </button>

            <button
              onClick={() => {
                setDeleteId(actionHoliday.id);
                setActionHoliday(null);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-80 p-6">
            <h3 className="font-semibold mb-3">Delete Holiday</h3>
            <p className="text-sm mb-5">
              Are you sure you want to delete this holiday?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDelete(deleteId);
                  setDeleteId(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
