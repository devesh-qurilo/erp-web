"use client"

import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import useSWR from "swr"

interface Employee {
  employeeId: string
  name: string
  email: string
  profilePictureUrl: string | null
  role: string
  active: boolean
  departmentName: string | null
  designationName: string | null
}

interface EmergencyContact {
  id: number
  name: string
  email: string
  mobile: string
  relationship: string
  address: string
  employeeId: string
}

const authedFetcher = async (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
  if (!token) {
    const err = new Error("No access token found")
    ;(err as any).status = 401
    throw err
  }
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || "Failed to fetch")
  }
  return res.json()
}

export default function EmployeeEmergencyContactsPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const pathname = usePathname()

  // fetch employee to render consistent header
  const { data: employee, error: empError } = useSWR<Employee>(id ? `/api/hr/employee/${id}` : null, authedFetcher, {
    revalidateOnFocus: false,
  })

  // fetch emergency contacts
  const {
    data: contacts,
    error: contactsError,
    isLoading,
  } = useSWR<EmergencyContact[]>(id ? `/api/hr/employee/${id}/emergency-contacts` : null, authedFetcher, {
    revalidateOnFocus: false,
  })

  const tabs = [
    { id: "profile", label: "Profile", href: `/hr/employee/${id}` },
    { id: "emergency", label: "Emergency Contact", href: `/hr/employee/${id}/emergency-contacts` },
    { id: "promotions", label: "Promotions", href: `/hr/employee/${id}/promotions` },
  ]

  return (
    <main className="container mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/hr/employee" className="text-sm text-primary underline">
          ← Back to Employees
        </Link>
        <Link 
          href={`/hr/employee/${id}/emergency-contacts/add`} 
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Add Emergency Contact
        </Link>
      </div>

      <section className="rounded-lg border border-border bg-card p-4">
        {/* Header (uses employee when available) */}
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full border border-border bg-muted">
              {employee?.profilePictureUrl ? (
                <img
                  src={employee.profilePictureUrl}
                  alt={`${employee.name} avatar`}
                  className="h-full w-full object-cover"
                  crossOrigin="anonymous"
                />
              ) : (
                <img src="/placeholder.svg" alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-semibold">{employee?.name ?? `Employee ${id}`}</h1>
              <div className="text-muted-foreground">{employee?.email ?? ""}</div>
              <div className="text-xs text-muted-foreground">{id}</div>
            </div>
          </div>
          {employee && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                {employee.role?.replace(/^ROLE_/, "")}
              </span>
              {employee.active ? (
                <span className="inline-flex items-center rounded-full bg-green-600/15 px-2 py-1 text-xs text-green-700 dark:text-green-400">
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-destructive/15 px-2 py-1 text-xs text-destructive-foreground">
                  Inactive
                </span>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mt-6 flex border-b border-border">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`px-4 py-2 -mb-px text-sm font-medium ${
                  isActive ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>

        {/* Emergency Contacts content */}
        <div className="mt-6">
          {isLoading && <div>Loading emergency contacts…</div>}
          {contactsError && (
            <div className="text-destructive">
              Error: {contactsError instanceof Error ? contactsError.message : "Unable to load contacts"}
            </div>
          )}
          {!isLoading && !contactsError && (!contacts || contacts.length === 0) && (
            <div className="text-muted-foreground">No emergency contacts found.</div>
          )}
          {contacts && contacts.length > 0 && (
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="min-w-full bg-card text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="py-2 px-4 text-left">Name</th>
                    <th className="py-2 px-4 text-left">Relationship</th>
                    <th className="py-2 px-4 text-left">Email</th>
                    <th className="py-2 px-4 text-left">Mobile</th>
                    <th className="py-2 px-4 text-left">Address</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c) => (
                    <tr key={c.id} className="border-t border-border">
                      <td className="py-3 px-4">{c.name}</td>
                      <td className="py-3 px-4">{c.relationship}</td>
                      <td className="py-3 px-4">{c.email}</td>
                      <td className="py-3 px-4">{c.mobile}</td>
                      <td className="py-3 px-4">{c.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}