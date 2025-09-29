"use client"

import { useParams, usePathname } from "next/navigation"
import useSWR from "swr"
import Link from "next/link"

interface Employee {
  employeeId: string
  name: string
  email: string
  profilePictureUrl: string | null
  gender: string
  birthday: string
  bloodGroup: string
  joiningDate: string
  language: string
  country: string
  mobile: string
  address: string
  about: string
  departmentId: number | null
  departmentName: string | null
  designationId: number | null
  designationName: string | null
  reportingToId: string | null
  reportingToName: string | null
  role: string
  loginAllowed: boolean
  receiveEmailNotification: boolean
  hourlyRate: number
  slackMemberId: string
  skills: string[]
  probationEndDate: string | null
  noticePeriodStartDate: string | null
  noticePeriodEndDate: string | null
  employmentType: string
  maritalStatus: string
  businessAddress: string
  officeShift: string
  active: boolean
  createdAt: string
}

const fetcher = async (url: string) => {
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

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const {
    data: employee,
    error,
    isLoading,
  } = useSWR<Employee>(id ? `/api/hr/employee/${id}` : null, fetcher, { revalidateOnFocus: false })

  const pathname = usePathname()
  const tabs = [
    { id: "profile", label: "Profile", href: `/hr/employee/${id}` },
    { id: "emergency", label: "Emergency Contact", href: `/hr/employee/${id}/emergency-contacts` },
  ]

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading employee…</div>
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-destructive">
        Error: {error instanceof Error ? error.message : "Unable to load employee"}
      </div>
    )
  }

  if (!employee) {
    return <div className="container mx-auto p-4">Employee not found.</div>
  }

  return (
    <main className="container mx-auto p-4">
      <div className="mb-4">
        <Link href="/hr/employee" className="text-sm text-primary underline">
          ← Back to Employees
        </Link>
      </div>

      <section className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full border border-border bg-muted">
              {employee.profilePictureUrl ? (
                <img
                  src={employee.profilePictureUrl || "/placeholder.svg"}
                  alt={`${employee.name} avatar`}
                  className="h-full w-full object-cover"
                  crossOrigin="anonymous"
                />
              ) : (
                <img src="/employee-avatar.png" alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-semibold">{employee.name}</h1>
              <div className="text-muted-foreground">{employee.email}</div>
              <div className="text-xs text-muted-foreground">{employee.employeeId}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground">
              {employee.role.replace(/^ROLE_/, "")}
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
        </div>

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

        {pathname === `/hr/employee/${id}` && (
          <>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-md border border-border p-4">
                <h2 className="mb-2 text-sm font-medium">Work</h2>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <dt className="text-muted-foreground">Department</dt>
                  <dd>{employee.departmentName || "N/A"}</dd>
                  <dt className="text-muted-foreground">Designation</dt>
                  <dd>{employee.designationName || "N/A"}</dd>
                  <dt className="text-muted-foreground">Joining Date</dt>
                  <dd>{employee.joiningDate || "N/A"}</dd>
                  <dt className="text-muted-foreground">Employment</dt>
                  <dd>{employee.employmentType || "N/A"}</dd>
                  <dt className="text-muted-foreground">Office Shift</dt>
                  <dd>{employee.officeShift || "N/A"}</dd>
                  <dt className="text-muted-foreground">Hourly Rate</dt>
                  <dd>{employee.hourlyRate != null ? `₹ ${employee.hourlyRate}` : "N/A"}</dd>
                </dl>
              </div>

              <div className="rounded-md border border-border p-4">
                <h2 className="mb-2 text-sm font-medium">Personal</h2>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <dt className="text-muted-foreground">Gender</dt>
                  <dd>{employee.gender || "N/A"}</dd>
                  <dt className="text-muted-foreground">Birthday</dt>
                  <dd>{employee.birthday || "N/A"}</dd>
                  <dt className="text-muted-foreground">Blood Group</dt>
                  <dd>{employee.bloodGroup || "N/A"}</dd>
                  <dt className="text-muted-foreground">Marital Status</dt>
                  <dd>{employee.maritalStatus || "N/A"}</dd>
                  <dt className="text-muted-foreground">Language</dt>
                  <dd>{employee.language || "N/A"}</dd>
                  <dt className="text-muted-foreground">Country</dt>
                  <dd>{employee.country || "N/A"}</dd>
                </dl>
              </div>

              <div className="rounded-md border border-border p-4 md:col-span-2">
                <h2 className="mb-2 text-sm font-medium">Contact & Other</h2>
                <dl className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
                  <dt className="text-muted-foreground">Mobile</dt>
                  <dd>{employee.mobile || "N/A"}</dd>
                  <dt className="text-muted-foreground">Business Address</dt>
                  <dd className="col-span-2">{employee.businessAddress || "N/A"}</dd>
                  <dt className="text-muted-foreground">Reporting To</dt>
                  <dd className="col-span-2">
                    {employee.reportingToName
                      ? `${employee.reportingToName}${employee.reportingToId ? ` (${employee.reportingToId})` : ""}`
                      : "N/A"}
                  </dd>
                  <dt className="text-muted-foreground">Probation End</dt>
                  <dd>{employee.probationEndDate || "N/A"}</dd>
                  <dt className="text-muted-foreground">Notice Period</dt>
                  <dd>
                    {employee.noticePeriodStartDate && employee.noticePeriodEndDate
                      ? `${employee.noticePeriodStartDate} → ${employee.noticePeriodEndDate}`
                      : "N/A"}
                  </dd>
                  <dt className="text-muted-foreground">Skills</dt>
                  <dd className="col-span-2">
                    {employee.skills?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {employee.skills.map((s) => (
                          <span
                            key={`${employee.employeeId}-${s}`}
                            className="rounded-md border border-border px-2 py-0.5 text-xs"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </dd>
                  <dt className="text-muted-foreground">About</dt>
                  <dd className="col-span-2">{employee.about || "N/A"}</dd>
                </dl>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  )
}
