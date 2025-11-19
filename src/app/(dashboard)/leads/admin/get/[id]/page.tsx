"use client";

import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

type EmployeeMeta = {
  employeeId?: string;
  name?: string;
  designation?: string | null;
  department?: string | null;
  profileUrl?: string | null;
};

type Lead = {
  id: number;
  name?: string;
  email?: string;
  clientCategory?: string;
  leadSource?: string;
  leadOwner?: string;
  addedBy?: string;
  leadOwnerMeta?: EmployeeMeta;
  addedByMeta?: EmployeeMeta;
  createDeal?: boolean;
  autoConvertToClient?: boolean;
  companyName?: string;
  mobileNumber?: string;
  city?: string;
  country?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  notes?: unknown[];
  deals?: unknown[];
  officePhone?: string;
  officialWebsite?: string;
  postalCode?: string;
  companyAddress?: string;
};

const fetcher = async (url: string) => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) throw new Error("No access token found. Please log in.");

  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    let message = "Failed to load lead details.";
    try {
      const json = await res.json();
      message = json?.message || json?.error || message;
    } catch {
      message = (await res.text()) || message;
    }
    throw new Error(message);
  }
  return res.json();
};

function OwnerCell({ meta, fallback }: { meta?: EmployeeMeta; fallback?: string }) {
  const src = meta?.profileUrl ?? "/placeholder.svg";
  return (
    <div className="flex items-center gap-3">
      <img
        src={src}
        alt={meta?.name ? `Profile photo of ${meta.name}` : "Profile avatar"}
        className="h-8 w-8 rounded-full object-cover border"
        crossOrigin="anonymous"
      />
      <div className="flex flex-col">
        <span className="text-sm font-medium">{meta?.name ?? fallback ?? "—"}</span>
        <span className="text-xs text-muted-foreground">{meta?.designation ?? "—"}</span>
      </div>
    </div>
  );
}

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data, error, isLoading } = useSWR<Lead>(`/api/leads/admin/get/${params.id}`, fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  });

  const [activeTab, setActiveTab] = useState<"profile" | "deals" | "notes">("profile");

  const fmt = (v?: string | null) => (v && v !== "null" ? v : "--");
  const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleString() : "--");

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-semibold">{data?.name ?? "—"}</h1>
          </div>

          <div className="flex items-center gap-4">
            <button aria-label="notifications" className="p-2 rounded hover:bg-slate-100">
              <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
              </svg>
            </button>
            <img
              src={data?.leadOwnerMeta?.profileUrl ?? "/placeholder.svg"}
              alt={data?.leadOwnerMeta?.name ?? "avatar"}
              className="w-9 h-9 rounded-full object-cover border"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 border-b bg-white rounded-t">
          <nav className="flex items-center gap-6 px-4">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-3 text-sm ${activeTab === "profile" ? "border-b-2 border-sky-600 text-sky-600" : "text-muted-foreground"}`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("deals")}
              className={`py-3 text-sm ${activeTab === "deals" ? "border-b-2 border-sky-600 text-sky-600" : "text-muted-foreground"}`}
            >
              Deals
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`py-3 text-sm ${activeTab === "notes" ? "border-b-2 border-sky-600 text-sky-600" : "text-muted-foreground"}`}
            >
              Notes
            </button>
          </nav>
        </div>

        {/* Card with Profile Information */}
        <Card className="p-6">
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Loading lead details…</div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-destructive">Failed to load lead details.</p>
              <p className="text-sm text-muted-foreground mt-2">{(error as Error)?.message}</p>
              <div className="mt-4">
                <Button variant="ghost" onClick={() => router.back()}>
                  Back to Leads
                </Button>
              </div>
            </div>
          ) : !data ? (
            <div className="py-12 text-center text-muted-foreground">No lead found.</div>
          ) : (
            <div>
              {/* header row with title + three dots */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Profile Information</h3>
                </div>
                <div>
                  <button className="p-2 rounded hover:bg-slate-100" aria-label="actions">
                    <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="5" cy="12" r="1.5" />
                      <circle cx="12" cy="12" r="1.5" />
                      <circle cx="19" cy="12" r="1.5" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* main two-column layout: labels (left) + values (right) */}
              <div className="rounded-lg border p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* left: labels column (narrow) */}
                  <dl className="space-y-4 md:block hidden md:col-span-1">
                    <dt className="text-sm text-muted-foreground">Name</dt>
                    <dt className="text-sm text-muted-foreground">Email</dt>
                    <dt className="text-sm text-muted-foreground">Lead Owner</dt>
                    <dt className="text-sm text-muted-foreground">Source</dt>
                    <dt className="text-sm text-muted-foreground">Company Name</dt>
                    <dt className="text-sm text-muted-foreground">Website</dt>
                    <dt className="text-sm text-muted-foreground">Mobile</dt>
                    <dt className="text-sm text-muted-foreground">Office Phone Number</dt>
                    <dt className="text-sm text-muted-foreground">City</dt>
                    <dt className="text-sm text-muted-foreground">State</dt>
                    <dt className="text-sm text-muted-foreground">Country</dt>
                    <dt className="text-sm text-muted-foreground">Postal Code</dt>
                    <dt className="text-sm text-muted-foreground">Address</dt>
                  </dl>

                  {/* right: values column (spans two cols on md) */}
                  <div className="md:col-span-2">
                    <div className="grid grid-cols-1 gap-y-3">
                      <div className="flex items-start gap-6">
                        <div className="w-48 md:hidden text-sm text-muted-foreground">Name</div>
                        <div className="text-sm">{fmt(data?.name)}</div>
                      </div>

                      <div className="flex items-start gap-6">
                        <div className="w-48 md:hidden text-sm text-muted-foreground">Email</div>
                        <div className="text-sm">{fmt(data?.email)}</div>
                      </div>

                      <div className="flex items-start gap-6">
                        <div className="w-48 md:hidden text-sm text-muted-foreground">Lead Owner</div>
                        <div className="text-sm">{data?.leadOwnerMeta?.name ?? data?.leadOwner ?? "--"}</div>
                      </div>

                      <div className="flex items-start gap-6">
                        <div className="w-48 md:hidden text-sm text-muted-foreground">Source</div>
                        <div className="text-sm">{fmt(data?.leadSource)}</div>
                      </div>

                      <div className="flex items-start gap-6">
                        <div className="w-48 md:hidden text-sm text-muted-foreground">Company Name</div>
                        <div className="text-sm">{fmt(data?.companyName)}</div>
                      </div>

                      <div className="flex items-start gap-6">
                        <div className="w-48 md:hidden text-sm text-muted-foreground">Website</div>
                        <div className="text-sm">{fmt((data as any)?.officialWebsite)}</div>
                      </div>

                      <div className="flex items-start gap-6">
                        <div className="w-48 md:hidden text-sm text-muted-foreground">Mobile</div>
                        <div className="text-sm">{fmt(data?.mobileNumber)}</div>
                      </div>

                      <div className="flex items-start gap-6">
                        <div className="w-48 md:hidden text-sm text-muted-foreground">Office Phone Number</div>
                        <div className="text-sm">{fmt(data?.officePhone)}</div>
                      </div>

                      <div className="flex items-start gap-6">
                        <div className="w-48 md:hidden text-sm text-muted-foreground">City</div>
                        <div className="text-sm">{fmt(data?.city)}</div>
                      </div>

                      <div className="flex items-start gap-6">
                        <div className="w-48 md:hidden text-sm text-muted-foreground">State</div>
                        <div className="text-sm">{fmt(data?.state)}</div>
                      </div>

                      <div className="flex items-start gap-6">
                        <div className="w-48 md:hidden text-sm text-muted-foreground">Country</div>
                        <div className="text-sm">{fmt(data?.country)}</div>
                      </div>

                      <div className="flex items-start gap-6">
                        <div className="w-48 md:hidden text-sm text-muted-foreground">Postal Code</div>
                        <div className="text-sm">{fmt(data?.postalCode)}</div>
                      </div>

                      <div className="flex items-start gap-6">
                        <div className="w-48 md:hidden text-sm text-muted-foreground">Address</div>
                        <div className="text-sm">{fmt(data?.companyAddress)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* tabs area below (Profile / Deals / Notes) */}
              <div className="mt-6">
                <div className="border-b" />
                <div className="mt-4">
                  {activeTab === "profile" && (
                    <div className="bg-white rounded-lg border p-4 min-h-[120px]">
                      {/* Duplicate or extended profile content could go here */}
                      <p className="text-sm text-muted-foreground">Profile section — more fields or notes can be added here.</p>
                    </div>
                  )}

                  {activeTab === "deals" && (
                    <div className="bg-white rounded-lg border p-4 min-h-[120px]">
                      <p className="text-sm text-muted-foreground">Deals — no deals available.</p>
                    </div>
                  )}

                  {activeTab === "notes" && (
                    <div className="bg-white rounded-lg border p-4 min-h-[120px]">
                      <p className="text-sm text-muted-foreground">Notes — no notes available.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
