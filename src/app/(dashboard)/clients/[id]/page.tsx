

"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Upload, MoreVertical,Globe } from "lucide-react";
import Image from "next/image";

export default function ViewClient() {
  const { id } = useParams();
  const [tab, setTab] = useState<
    "profile" | "invoices" | "payments" | "documents" | "notes"
  >("profile");

 
  interface Note {
  title: string;
  type: "Public" | "Private";
}

  
  const [files, setFiles] = useState<File[]>([]);
   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const [notes, setNotes] = useState<Note[]>([
    { title: "My Note", type: "Public" },
  ]);

  

  return (
    <div className="p-6">
      {/* Title */}
      <h1 className="text-2xl font-semibold mb-4">John Doe</h1>

      {/* Tabs */}
      <div className="flex gap-6 border-b mb-6">
        {["profile", "invoices", "payments", "documents", "notes"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`pb-2 transition ${
              tab === t ? "border-b-2 border-blue-600 text-blue-600" : ""
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ---------------- PROFILE TAB ---------------- */}
      {tab === "profile" && (
        <div>
          {/* Top Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 border rounded-xl shadow-sm">
              <img
                src="/Images/john.png"
                alt="profile"
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-medium">John Doe</p>
                <p className="text-sm text-gray-500">Qurilo Solutions</p>
                <p className="text-xs text-gray-400">Last login: --</p>
              </div>
            </div>
            <div className="p-4 border rounded-xl shadow-sm">
              <p className="text-sm text-gray-500">Total Projects</p>
              <p className="text-xl font-semibold">01</p>
            </div>
            <div className="p-4 border rounded-xl shadow-sm">
              <p className="text-sm text-gray-500">Total Earnings</p>
              <p className="text-xl font-semibold">00</p>
            </div>
            <div className="p-4 border rounded-xl shadow-sm">
              <p className="text-sm text-gray-500">Due Invoices</p>
              <p className="text-xl font-semibold">00</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Information */}
            <div className="col-span-2 p-4 border rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <p className="font-medium">Name</p>
                <p>John Doe</p>
                <p className="font-medium">Email</p>
                <p>email@gmail.com</p>
                <p className="font-medium">Company Name</p>
                <p>Qurilo Solutions</p>
                <p className="font-medium">Company Logo</p>
                <p>--</p>
                <p className="font-medium">Mobile</p>
                <p>+91 9999999999</p>
                <p className="font-medium">Office Phone No.</p>
                <p>--</p>
                <p className="font-medium">Official Website</p>
                <p>--</p>
                <p className="font-medium">GST/VAT No.</p>
                <p>--</p>
                <p className="font-medium">Address</p>
                <p>--</p>
                <p className="font-medium">State</p>
                <p>--</p>
                <p className="font-medium">Country</p>
                <p>India</p>
                <p className="font-medium">Postal Code</p>
                <p>--</p>
                <p className="font-medium">Language</p>
                <p>English</p>
              </div>
            </div>

            {/* Right Side Charts */}
            <div className="space-y-6">
              <div className="p-4 border rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Projects</h2>
                <div className="flex justify-center">
                  <div className="w-32 h-32 rounded-full bg-blue-500"></div>
                </div>
                <ul className="mt-4 space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 inline-block rounded"></span>{" "}
                    Finished
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-yellow-500 inline-block rounded"></span>{" "}
                    To Do
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-500 inline-block rounded"></span>{" "}
                    In Progress
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 inline-block rounded"></span>{" "}
                    Cancelled
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-gray-400 inline-block rounded"></span>{" "}
                    Not Started
                  </li>
                </ul>
              </div>

              <div className="p-4 border rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Invoices</h2>
                <div className="flex justify-center">
                  <div className="w-32 h-32 rounded-full bg-green-500"></div>
                </div>
                <ul className="mt-4 space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 inline-block rounded"></span>{" "}
                    Paid
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-yellow-500 inline-block rounded"></span>{" "}
                    Credit Note
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 inline-block rounded"></span>{" "}
                    Unpaid
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- INVOICES TAB ---------------- */}
      {tab === "invoices" && (
        <div className="space-y-6">
          {/* Invoice Section */}
          <div className="border rounded-xl shadow-sm">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50 rounded-t-xl">
              <h2 className="text-lg font-semibold">Invoice</h2>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search"
                  className="border rounded-md px-3 py-1 text-sm"
                />
                <select className="border rounded-md px-2 py-1 text-sm">
                  <option>Status: All</option>
                  <option>Paid</option>
                  <option>Unpaid</option>
                  <option>Draft</option>
                </select>
              </div>
            </div>

            <div className="p-4">
              <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
                + Create Invoice
              </button>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="p-2 border">Code</th>
                      <th className="p-2 border">Invoice</th>
                      <th className="p-2 border">Project</th>
                      <th className="p-2 border">Client</th>
                      <th className="p-2 border">Total</th>
                      <th className="p-2 border">Invoice Date</th>
                      <th className="p-2 border">Status</th>
                      <th className="p-2 border">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border">ERP-01</td>
                      <td className="p-2 border">INV#014</td>
                      <td className="p-2 border">ERP System</td>
                      <td className="p-2 border">
                        <div className="flex items-center gap-2">
                          <img
                            src="/Images/john.png"
                            alt="client"
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <p className="font-medium">Jack Smith</p>
                            <p className="text-xs text-gray-500">Project</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 border text-sm">
                        <p>Total: $37,000.00</p>
                        <p className="text-green-600">Paid: $37,000.00</p>
                        <p className="text-red-600">Unpaid: $0.00</p>
                      </td>
                      <td className="p-2 border">27/08/2025</td>
                      <td className="p-2 border text-green-600">● Paid</td>
                      <td className="p-2 border text-center">⋮</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Credit Notes Section */}
          <div className="border rounded-xl shadow-sm">
            <div className="p-4 border-b bg-gray-50 rounded-t-xl">
              <h2 className="text-lg font-semibold">Credit Notes</h2>
            </div>
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-sm border">
                <thead className="bg-blue-50 text-left">
                  <tr>
                    <th className="p-2 border">Credit Note</th>
                    <th className="p-2 border">Invoice</th>
                    <th className="p-2 border">Client</th>
                    <th className="p-2 border">Total</th>
                    <th className="p-2 border">Credit Note Date</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border">CN#091</td>
                    <td className="p-2 border">INV#014</td>
                    <td className="p-2 border">
                      <div className="flex items-center gap-2">
                        <img
                          src="/Images/JackSmith.png"
                          alt="client"
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="font-medium">Jack Smith</p>
                          <p className="text-xs text-gray-500">Project</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 border text-sm">
                      <p>Total: $37,000.00</p>
                      <p>Adjustment: 0.00</p>
                      <p className="text-red-600">Used: $20,000.00</p>
                      <p className="text-green-600">Remaining: $17,000.00</p>
                    </td>
                    <td className="p-2 border">27/08/2025</td>
                    <td className="p-2 border text-green-600">● Open</td>
                    <td className="p-2 border text-center">⋮</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- OTHER TABS ---------------- */}
      {tab === "payments" && (
        <div className="space-y-6">
            {/* Payments Section */}
          <div className="p-4">
              <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
                + Add Payment
              </button>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border">
                  <thead className="bg[#E1EEFF] text-left">
                    <tr>
                      <th className="p-2 border">Code</th>
                      <th className="p-2 border">Invoice</th>
                      <th className="p-2 border">Project</th>
                      <th className="p-2 border">Client</th>
                      <th className="p-2 border">Order#</th>
                      <th className="p-2 border">Amount</th>
                      <th className="p-2 border">Paid On</th>
                      <th className="p-2 border">Payment Gateway</th>
                      <th className="p-2 border">Status</th>
                      <th className="p-2 border">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border">ERP-01</td>
                      <td className="p-2 border">INV#014</td>
                      <td className="p-2 border">ERP System</td>
                      <td className="p-2 border">
                        <div className="flex items-center gap-2">
                          <img
                            src="/Images/john.png"
                            alt="client"
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <p className="font-medium">Jack Smith</p>
                            <p className="text-xs text-gray-500">Project</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 border text-sm">
                        <p>Total: $37,000.00</p>
                        <p className="text-green-600">Paid: $37,000.00</p>
                        <p className="text-red-600">Unpaid: $0.00</p>
                      </td>
                      <td className="p-2 border">27/08/2025</td>
                      <td className="p-2 border text-green-600">$37,000.00</td>
                      <td className="p-2 border text-center text-green-600">-----</td>
                      <td className="p-2 border text-center">Completed</td>
                        <td className="p-2 border text-center">⋮</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>  

        </div>
      )
      }
      {tab === "documents" && (
       <div>
        <div className="p-6">
        <div className="bg-white rounded-2xl shadow p-6">
          {/* Upload area */}
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50"
          >
            <Upload className="h-10 w-10 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">Choose a file</p>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {/* File list */}
          <div className="mt-6 space-y-4">
            {/* Example static file */}
            <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-3">
              <Image
                src="/example.jpg" // replace with actual file path
                alt="Screenshot"
                width={100}
                height={70}
                className="rounded"
              />
              <div className="flex-1">
                <p className="text-sm text-gray-700">Screenshot1.jpg</p>
              </div>
              <button className="p-2 hover:bg-gray-200 rounded-full">
                <MoreVertical className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Uploaded files */}
            {files.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 bg-gray-50 rounded-lg p-3"
              >
                <div className="w-[100px] h-[70px] flex items-center justify-center bg-gray-200 rounded">
                  <span className="text-xs text-gray-500">Preview</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{file.name}</p>
                </div>
                <button className="p-2 hover:bg-gray-200 rounded-full">
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
       </div>)}
      {tab === "notes" && (
        <div>
            <div className="p-6">
        <div className="bg-white rounded-2xl shadow p-6">
          {/* Add Note Button */}
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700">
            + Add Note
          </button>

          {/* Notes Table */}
          <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-indigo-50 text-gray-700">
                <tr>
                  <th className="px-6 py-3 font-medium">Note Title</th>
                  <th className="px-6 py-3 font-medium">Note Type</th>
                  <th className="px-6 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {notes.map((note, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-3">{note.title}</td>
                    <td className="px-6 py-3 flex items-center gap-2 text-gray-600">
                      <Globe className="w-4 h-4" />
                      {note.type}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button className="p-2 hover:bg-gray-200 rounded-full">
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
        </div>
        
      )}
    </div>
  );
}

