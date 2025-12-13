"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function InvoiceFilters({ filters, setFilters, invoices }) {

    const projectList = ["All", ...new Set(invoices.map(i => i.project?.projectName).filter(Boolean))];
    const clientList = ["All", ...new Set(invoices.map(i => i.client?.name).filter(Boolean))];
    const statusList = ["All", ...new Set(invoices.map(i => i.status).filter(Boolean))];

    return (
        <div className="border rounded-md bg-white px-3 py-3 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">

                {/* Date Range */}
                <div className="flex gap-2 items-center border rounded px-2 py-2 bg-white">
                    <span className="text-sm text-gray-600">Duration</span>

                    <input
                        type="date"
                        className="text-xs border rounded px-2 py-1"
                        value={filters.startDate}
                        onChange={(e) => setFilters(p => ({ ...p, startDate: e.target.value }))}
                    />

                    <span className="text-sm text-gray-400">to</span>

                    <input
                        type="date"
                        className="text-xs border rounded px-2 py-1"
                        value={filters.endDate}
                        onChange={(e) => setFilters(p => ({ ...p, endDate: e.target.value }))}
                    />
                </div>

                {/* Client */}
                <Select value={filters.client} onValueChange={(v) => setFilters(f => ({ ...f, client: v }))}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Client" />
                    </SelectTrigger>
                    <SelectContent>
                        {clientList.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>

                {/* Project */}
                <Select value={filters.project} onValueChange={(v) => setFilters(f => ({ ...f, project: v }))}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Project" />
                    </SelectTrigger>
                    <SelectContent>
                        {projectList.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>

                {/* Status */}
                <Select value={filters.status} onValueChange={(v) => setFilters(f => ({ ...f, status: v }))}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        {statusList.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>

                {/* Search */}
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-2 top-2 text-gray-400" />
                    <Input
                        placeholder="Search invoice / project / client"
                        className="pl-8 w-[250px]"
                        value={filters.search}
                        onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                    />
                </div>
            </div>

            <Button variant="outline" className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" /> Filters
            </Button>
        </div>
    );
}
