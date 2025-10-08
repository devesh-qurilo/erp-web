"use client";

import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

type EmployeeMeta = {
  employeeId: string;
  name: string;
  designation: string;
  department: string;
  profileUrl?: string;
};

type Lead = {
  id: number;
  name: string;
  email: string;
  clientCategory: string;
  leadSource: string;
  leadOwner: string;
  addedBy: string;
  leadOwnerMeta?: EmployeeMeta;
  addedByMeta?: EmployeeMeta;
  createDeal: boolean;
  autoConvertToClient: boolean;
  companyName: string;
  mobileNumber: string;
  city: string;
  country: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  notes: unknown[];
  deals: unknown[];
};

const fetcher = async (url: string) => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    throw new Error("No access token found. Please log in.");
  }

  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    let errorMessage = "Failed to load lead details.";
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = (await res.text()) || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return res.json();
};

function OwnerCell({ meta, fallback }: { meta?: EmployeeMeta; fallback: string }) {
  const src = meta?.profileUrl || "/placeholder.svg?height=32&width=32&query=profile-avatar";
  return (
    <div className="flex items-center gap-3">
      <img
        src={src}
        alt={meta?.name ? `Profile photo of ${meta.name}` : "Profile avatar"}
        className="h-8 w-8 rounded-full object-cover border"
        crossOrigin="anonymous"
      />
      <div className="flex flex-col">
        <span className="text-sm font-medium">{meta?.name || fallback}</span>
        <span className="text-xs text-muted-foreground">{meta?.designation || "—"}</span>
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

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            aria-label="Go back to leads list"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-balance">
              Lead Details
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Detailed information about the selected lead.</p>
          </div>
        </div>
      </header>
      <Card className="p-4 md:p-6">
        {isLoading ? (
          <div className="py-10 text-center text-muted-foreground">Loading lead details…</div>
        ) : error ? (
          <div className="py-10 text-center">
            <p className="text-destructive">Failed to load lead details.</p>
            <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
            <Button className="mt-4" onClick={() => router.back()}>
              Back to Leads
            </Button>
          </div>
        ) : !data ? (
          <div className="py-10 text-center text-muted-foreground">No lead found.</div>
        ) : (
          <div className="grid gap-6">
            <div>
              <h2 className="text-lg font-semibold">Lead Information</h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Name</label>
                  <p className="text-sm font-medium">{data.name}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="text-sm font-medium">{data.email}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Mobile Number</label>
                  <p className="text-sm font-medium">{data.mobileNumber || "—"}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Status</label>
                  <Badge variant="secondary" aria-label={`Status ${data.status}`}>
                    {data.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Company Information</h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Company Name</label>
                  <p className="text-sm font-medium">{data.companyName}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Client Category</label>
                  <p className="text-sm font-medium">{data.clientCategory || "—"}</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Location</h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">City</label>
                  <p className="text-sm font-medium">{data.city || "—"}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Country</label>
                  <p className="text-sm font-medium">{data.country || "—"}</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Assignment</h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Lead Owner</label>
                  <OwnerCell meta={data.leadOwnerMeta} fallback={data.leadOwner} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Added By</label>
                  <OwnerCell meta={data.addedByMeta} fallback={data.addedBy} />
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Source and Dates</h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Lead Source</label>
                  <p className="text-sm font-medium">{data.leadSource || "—"}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Created At</label>
                  <p className="text-sm font-medium">{new Date(data.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Updated At</label>
                  <p className="text-sm font-medium">{new Date(data.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Additional Information</h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Create Deal</label>
                  <p className="text-sm font-medium">{data.createDeal ? "Yes" : "No"}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Auto Convert to Client</label>
                  <p className="text-sm font-medium">{data.autoConvertToClient ? "Yes" : "No"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </main>
  );
}