"use client";

import useSWR from "swr";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

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
    let errorMessage = "Failed to load leads.";
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

export default function LeadsPage() {
  const { data, error, isLoading, mutate } = useSWR<Lead[]>("/api/leads/admin/get", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  });
  const [query, setQuery] = useState("");

  const leads = data || [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((l) =>
      [
        l.name,
        l.email,
        l.companyName,
        l.city,
        l.country,
        l.status,
      ].some((field) => field?.toLowerCase().includes(q))
    );
  }, [leads, query]);

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-balance">Leads</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse and search all captured leads from your sources.</p>
        <Button>
          <Link href={`/leads/admin/create`} >
          Create Lead
          </Link>
          </Button>
      </header>
      <Card className="p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg md:text-xl font-semibold text-balance">Leads</h2>
       
          <div className="flex items-center gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search leads by name, email, company..."
              aria-label="Search leads"
              className="w-64"
            />
            <Button variant="secondary" onClick={() => mutate()} aria-label="Refresh leads">
              Refresh
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-muted-foreground">Loading leads…</div>
        ) : error ? (
          <div className="py-10 text-center">
            <p className="text-destructive">Failed to load leads.</p>
            <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
            <Button className="mt-4" onClick={() => mutate()}>
              Retry
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">No leads found.</div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[220px]">Lead</TableHead>
                  <TableHead>Company</TableHead>
             
                  <TableHead>Owner</TableHead>
              
                  <TableHead>Status</TableHead>
                
                  <TableHead className="text-right">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                    <Link href={`/leads/admin/get/${lead.id}`} key={lead.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{lead.name}</span>
                        <span className="text-xs text-muted-foreground">{lead.email}</span>
                        <span className="text-xs text-muted-foreground">{lead.mobileNumber}</span>
                      </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{lead.companyName}</span>
                        <span className="text-xs text-muted-foreground">{lead.clientCategory}</span>
                      </div>
                    </TableCell>
                  
                    <TableCell>
                      <OwnerCell meta={lead.leadOwnerMeta} fallback={lead.leadOwner} />
                    </TableCell>
                   
                    <TableCell>
                      <Badge variant="secondary" aria-label={`Status ${lead.status}`}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                 
                    <TableCell className="text-right">
                      <span className="text-sm">{new Date(lead.createdAt).toLocaleString()}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </main>
  );
}