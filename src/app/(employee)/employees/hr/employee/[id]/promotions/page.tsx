// "use client"

// import useSWR from "swr"
// import Link from "next/link"
// import { Badge } from "@/components/ui/badge"
// import React from "react"

// interface Employee {
//   employeeId: string
//   name: string
//   email: string
//   profilePictureUrl: string | null
//   role: string
//   active: boolean
//   departmentName: string | null
//   designationName: string | null
// }

// interface Promotion {
//   id: number
//   employeeId: string
//   employeeName: string
//   oldDepartmentId: number
//   oldDepartmentName: string
//   newDepartmentId: number
//   newDepartmentName: string
//   oldDesignationId: number
//   oldDesignationName: string
//   newDesignationId: number
//   newDesignationName: string
//   isPromotion: boolean
//   sendNotification: boolean
//   createdAt: string
//   remarks: string | null
// }

// const fetcher = async (url: string) => {
//   const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
//   if (!token) {
//     const err = new Error("No access token found")
//     ;(err as any).status = 401
//     throw err
//   }
//   const res = await fetch(url, { 
//     headers: { Authorization: `Bearer ${token}` }, 
//     cache: "no-store" 
//   })
//   if (!res.ok) {
//     const text = await res.text()
//     throw new Error(text || "Failed to load data")
//   }
//   return res.json()
// }

// export default function PromotionsTab({ params }: { params: { id: string } }) {
//   const id = params?.id

//   const { data: employee, error: empError } = useSWR<Employee>(
//     id ? `/api/hr/employee/${id}` : null, 
//     fetcher, 
//     {
//       revalidateOnFocus: false,
//     }
//   )

//   const { data: promotions, error: promError, isLoading } = useSWR<Promotion[]>(
//     id ? `/api/hr/employee/${id}/promotions` : null,
//     fetcher,
//     {
//       revalidateOnFocus: false,
//     }
//   )

//   const tabs = [
//     { id: "profile", label: "Profile", href: `/hr/employee/${id}` },
//     { id: "emergency", label: "Emergency Contact", href: `/hr/employee/${id}/emergency-contacts` },
//     { id: "promotions", label: "Promotions", href: `/hr/employee/${id}/promotions` },
//   ]

//   return (
//     <main className="container mx-auto p-4">
//       <div className="mb-4 flex items-center justify-between">
//         <Link href={`/hr/employee/${id}`} className="text-sm text-primary underline">
//           ← Back to Profile
//         </Link>
//         <Link 
//           href={`/hr/employee/${id}/promotions/add`} 
//           className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
//         >
//           Add Promotion
//         </Link>
//       </div>

//       {empError ? (
//         <div role="alert" className="text-sm text-destructive mb-4">
//           Failed to load employee data
//         </div>
//       ) : (
//         <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
//           <div className="flex items-center gap-4">
//             <div className="h-16 w-16 overflow-hidden rounded-full border border-border bg-muted">
//               {employee?.profilePictureUrl ? (
//                 <img
//                   src={employee.profilePictureUrl || "/placeholder.svg"}
//                   alt={`${employee.name} avatar`}
//                   className="h-full w-full object-cover"
//                   crossOrigin="anonymous"
//                 />
//               ) : (
//                 <img src="/employee-avatar.png" alt="Employee avatar" className="h-full w-full object-cover" />
//               )}
//             </div>
//             <div>
//               <h1 className="text-xl font-semibold">{employee?.name ?? `Employee ${id}`}</h1>
//               <div className="text-muted-foreground">{employee?.email ?? ""}</div>
//               <div className="text-xs text-muted-foreground">{id}</div>
//             </div>
//           </div>
//           {employee && (
//             <div className="flex items-center gap-2">
//               <span className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground">
//                 {employee.role?.replace(/^ROLE_/, "")}
//               </span>
//               {employee.active ? (
//                 <span className="inline-flex items-center rounded-full bg-green-600/15 px-2 py-1 text-xs text-green-700 dark:text-green-400">
//                   Active
//                 </span>
//               ) : (
//                 <span className="inline-flex items-center rounded-full bg-destructive/15 px-2 py-1 text-xs text-destructive-foreground">
//                   Inactive
//                 </span>
//               )}
//             </div>
//           )}
//         </div>
//       )}

//       <nav className="mb-6 flex items-center gap-4" aria-label="Employee detail tabs">
//         {tabs.map((tab) => (
//           <Link
//             key={tab.id}
//             href={tab.href}
//             className={`text-sm underline-offset-4 hover:underline ${tab.id === "promotions" ? "font-medium" : ""}`}
//           >
//             {tab.label}
//           </Link>
//         ))}
//       </nav>

//       {isLoading ? (
//         <div className="text-sm opacity-80">Loading promotions…</div>
//       ) : promError ? (
//         <div role="alert" className="text-sm text-destructive">
//           {promError instanceof Error ? promError.message : "Failed to load promotions"}
//         </div>
//       ) : !promotions || promotions.length === 0 ? (
//         <div className="text-sm opacity-80">No promotions found.</div>
//       ) : (
//         <div className="overflow-x-auto rounded-lg border border-border">
//           <table className="min-w-full text-sm">
//             <thead className="bg-muted/50">
//               <tr>
//                 <th className="px-4 py-3 text-left font-medium">Date</th>
//                 <th className="px-4 py-3 text-left font-medium">From</th>
//                 <th className="px-4 py-3 text-left font-medium">To</th>
//                 <th className="px-4 py-3 text-left font-medium">Remarks</th>
//                 <th className="px-4 py-3 text-left font-medium">Flags</th>
//               </tr>
//             </thead>
//             <tbody>
//               {promotions.map((p) => {
//                 const d = new Date(p.createdAt)
//                 const dateStr = isNaN(d.getTime()) ? p.createdAt : d.toLocaleString()
//                 return (
//                   <tr key={p.id} className="border-t border-border">
//                     <td className="px-4 py-3 align-top">{dateStr}</td>
//                     <td className="px-4 py-3 align-top">
//                       <div className="flex flex-col">
//                         <span className="font-medium">{p.oldDepartmentName || "N/A"}</span>
//                         <span className="text-muted-foreground">{p.oldDesignationName || "N/A"}</span>
//                       </div>
//                     </td>
//                     <td className="px-4 py-3 align-top">
//                       <div className="flex flex-col">
//                         <span className="font-medium">{p.newDepartmentName || "N/A"}</span>
//                         <span className="text-muted-foreground">{p.newDesignationName || "N/A"}</span>
//                       </div>
//                     </td>
//                     <td className="px-4 py-3 align-top">
//                       {p.remarks ? p.remarks : <span className="opacity-60">—</span>}
//                     </td>
//                     <td className="px-4 py-3 align-top">
//                       <div className="flex flex-wrap gap-2">
//                         <Badge variant={p.isPromotion ? "default" : "secondary"}>
//                           {p.isPromotion ? "Promotion" : "Change"}
//                         </Badge>
//                         <Badge variant={p.sendNotification ? "default" : "secondary"}>
//                           {p.sendNotification ? "Notified" : "No Notification"}
//                         </Badge>
//                       </div>
//                     </td>
//                   </tr>
//                 )
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </main>
//   )
// }




"use client"

import useSWR from "swr"
import { useState } from "react"
import AddPromotionModal from "./AddPromotionModal"
import { MoreVertical } from "lucide-react"

const BASE_URL = process.env.NEXT_PUBLIC_MAIN

interface Promotion {
  id: number
  oldDepartmentName: string
  oldDesignationName: string
  newDepartmentName: string
  newDesignationName: string
  isPromotion: boolean
  remarks: string
  createdAt: string
}

const fetcher = async (url: string) => {
  const token = localStorage.getItem("accessToken")
  if (!token) throw new Error("No token")

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) throw new Error("Failed to fetch promotions")
  return res.json()
}

export default function PromotionsTab({ employeeId }: { employeeId: string }) {
  const [openAdd, setOpenAdd] = useState(false)

  const { data, isLoading, error, mutate } = useSWR<Promotion[]>(
    `${BASE_URL}/admin/api/promotions/employee/${employeeId}`,
    fetcher,
    { revalidateOnFocus: false }
  )

  return (
    <div className="bg-white border rounded-xl p-6 space-y-4">
      {/* HEADER */}
      <div className="flex justify-between">
        <button
          onClick={() => setOpenAdd(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
        >
          + Add Promotions
        </button>
      </div>

      <AddPromotionModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        employeeId={employeeId}
        onSuccess={mutate}
      />

      {/* CONTENT */}
      {isLoading && <div className="text-sm text-gray-500">Loading promotions…</div>}
      {error && <div className="text-sm text-red-500">Failed to load promotions</div>}

      {!isLoading && data?.length === 0 && (
        <div className="text-sm text-gray-500">No promotions found</div>
      )}

      <div className="space-y-4">
        {data?.map((p, index) => (
          <div
            key={p.id}
            className="border rounded-lg p-4 flex justify-between items-start"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="px-2 py-0.5 bg-gray-200 rounded text-xs">
                  {index + 1}
                </span>
                <span>
                  {new Date(p.createdAt).toLocaleDateString()} ( Promotion From Today )
                </span>
              </div>

              <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                Promotion
              </span>

              <div className="text-sm">
                <span className="text-blue-600">
                  {p.oldDesignationName}
                </span>{" "}
                →{" "}
                <span className="text-green-600">
                  {p.newDesignationName}
                </span>{" "}
                <span className="text-gray-500">(Designation)</span>
              </div>

              <div className="text-sm">
                <span className="text-blue-600">
                  {p.oldDepartmentName}
                </span>{" "}
                →{" "}
                <span className="text-green-600">
                  {p.newDepartmentName}
                </span>
              </div>

              {p.remarks && (
                <div className="text-xs text-gray-500">
                  {p.remarks}
                </div>
              )}
            </div>

            <button className="p-2 hover:bg-gray-100 rounded-full">
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
