"use client"
import React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import Row from "./Row"


export const ProfileSection: React.FC<{ client: any }> = ({ client }) => (
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
<div className="lg:col-span-2">
<Card>
<CardHeader>
<CardTitle>Profile Information</CardTitle>
<CardDescription>Details about client </CardDescription>
</CardHeader>
<CardContent>
<div className="grid grid-cols-1 gap-0">
<Row label="Name" value={client.name} />
<Row label="Email" value={client.email} />
<Row label="Gender" value={"—"} />
<Row label="Company Name" value={client.company?.companyName ?? "—"} />
<Row label="Company Logo" value={client.companyLogoUrl ? "Uploaded" : "—"} />
<Row label="Mobile" value={client.mobile ?? "—"} />
<Row label="Office Phone No." value={"—"} />
<Row label="Official Website" value={"—"} />
<Row label="GST/VAT No." value={"—"} />
<Row label="Address" value={"—"} />
<Row label="State" value={client.company?.state ?? "—"} />
<Row label="Country" value={client.country ?? "India"} />
<Row label="Postal Code" value={"—"} />
<Row label="Language" value={"English"} />
</div>
</CardContent>
</Card>
</div>


<div className="space-y-4">
<Card>
<CardHeader>
<CardTitle>Projects</CardTitle>
</CardHeader>
<CardContent>
<div className="h-40 flex items-center justify-center">
<div className="w-28 h-28 rounded-full bg-blue-500/90" />
</div>
</CardContent>
</Card>


<Card>
<CardHeader>
<CardTitle>Invoices</CardTitle>
</CardHeader>
<CardContent>
<div className="h-40 flex items-center justify-center">
<div className="w-32 h-32 rounded-full bg-green-600/90" />
</div>
</CardContent>
</Card>
</div>
</div>
)


export default ProfileSection