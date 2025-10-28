"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";

type Employee = {
    employeeId: string;
    name: string;
};

type Deal = {
    title: string;
    pipeline: string;
    dealStage: string;
    dealCategory: string;
    value: number;
    expectedCloseDate: string;
    dealAgent: string;
    dealWatchers: string[];
};

type LeadFormData = {
    name: string;
    email: string;
    mobileNumber: string;
    clientCategory: string;
    leadSource: string;
    leadOwner: string;
    addedBy: string;
    autoConvertToClient: boolean;
    companyName: string;
    city: string;
    country: string;
    createDeal?: boolean;
    deal?: Deal;
};

export default function LeadCreatePage() {
    const router = useRouter();
    const [formData, setFormData] = useState<LeadFormData>({
        name: "",
        email: "",
        mobileNumber: "",
        clientCategory: "",
        leadSource: "",
        leadOwner: "",
        addedBy: "",
        autoConvertToClient: false,
        companyName: "",
        city: "",
        country: "",
        createDeal: false,
        deal: {
            title: "",
            pipeline: "Default Pipeline",
            dealStage: "Win",
            dealCategory: "Enterprise",
            value: 0,
            expectedCloseDate: "",
            dealAgent: "",
            dealWatchers: [],
        },
    });
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch employees
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                if (!token) {
                    setError("No access token found. Please log in.");
                    return;
                }

                const res = await fetch("/api/hr/employee", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) throw new Error("Failed to fetch employees");
                const data = await res.json();
                setEmployees(data.content); // assuming API returns { content: Employee[] }
            } catch (err) {
                console.error(err);
                setError("Failed to load employees. Please try again.");
            }
        };
        fetchEmployees();
    }, []);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        if (name.startsWith("deal.")) {
            const dealField = name.split(".")[1];
            setFormData((prev) => ({
                ...prev,
                deal: { ...prev.deal!, [dealField]: value },
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleCheckboxChange = (checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            autoConvertToClient: checked,
            createDeal: checked,
        }));
    };

    const handleDealWatcherChange = (employeeId: string, checked: boolean) => {
        setFormData((prev) => {
            const currentWatchers = prev.deal?.dealWatchers || [];
            const updatedWatchers = checked
                ? [...currentWatchers, employeeId]
                : currentWatchers.filter((id) => id !== employeeId);
            return {
                ...prev,
                deal: { ...prev.deal!, dealWatchers: updatedWatchers },
            };
        });
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
      
        // Basic validation
        if (!formData.name || !formData.email || !formData.companyName) {
          setError("Name, email, and company name are required.");
          setIsSubmitting(false);
          return;
        }
      
        if (
          formData.autoConvertToClient &&
          formData.createDeal &&
          (!formData.deal?.title ||
            !formData.deal?.value ||
            !formData.deal?.expectedCloseDate ||
            !formData.deal?.dealAgent)
        ) {
          setError("Deal title, value, expected close date, and deal agent are required when creating a deal.");
          setIsSubmitting(false);
          return;
        }
      
        try {
          const accessToken = localStorage.getItem("accessToken");
          if (!accessToken) {
            throw new Error("No access token found. Please log in.");
          }
      
          // 🧹 Clean payload — ensure only IDs for employee-related fields
          const cleanDeal = formData.deal
            ? {
                ...formData.deal,
                dealAgent: formData.deal.dealAgent || "",
                dealWatchers: (formData.deal.dealWatchers || []).map((id) => id),
              }
            : undefined;
      
          const payload = {
            ...formData,
            leadOwner: formData.leadOwner || "",
            addedBy: formData.addedBy || "",
            deal: cleanDeal,
          };
      
          const response = await fetch("/api/leads/admin/create", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(payload),
          });
      
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.details || errorData.error || "Failed to create lead.");
          }
      
          const data = await response.json();
          router.push(`/leads/admin/get`);
        } catch (err: any) {
          setError(err.message || "An unexpected error occurred.");
        } finally {
          setIsSubmitting(false);
        }
      };
      

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
                            Create New Lead
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">Enter details to create a new lead.</p>
                    </div>
                </div>
            </header>
            <Card className="p-4 md:p-6">
                <form onSubmit={handleSubmit} className="grid gap-6">
                    {error && (
                        <div className="text-destructive text-sm text-center">{error}</div>
                    )}
                    <div>
                        <h2 className="text-lg font-semibold">Lead Information</h2>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="text-sm text-muted-foreground">Name *</label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter lead name"
                                    aria-required="true"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="text-sm text-muted-foreground">Email *</label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter email"
                                    aria-required="true"
                                />
                            </div>
                            <div>
                                <label htmlFor="mobileNumber" className="text-sm text-muted-foreground">Mobile Number</label>
                                <Input
                                    id="mobileNumber"
                                    name="mobileNumber"
                                    value={formData.mobileNumber}
                                    onChange={handleInputChange}
                                    placeholder="Enter mobile number"
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Company Information</h2>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="companyName" className="text-sm text-muted-foreground">Company Name *</label>
                                <Input
                                    id="companyName"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleInputChange}
                                    placeholder="Enter company name"
                                    aria-required="true"
                                />
                            </div>
                            <div>
                                <label htmlFor="clientCategory" className="text-sm text-muted-foreground">Client Category</label>
                                <Input
                                    id="clientCategory"
                                    name="clientCategory"
                                    value={formData.clientCategory}
                                    onChange={handleInputChange}
                                    placeholder="Enter client category"
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Location</h2>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="city" className="text-sm text-muted-foreground">City</label>
                                <Input
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    placeholder="Enter city"
                                />
                            </div>
                            <div>
                                <label htmlFor="country" className="text-sm text-muted-foreground">Country</label>
                                <Input
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    placeholder="Enter country"
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Assignment</h2>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="leadOwner" className="text-sm text-muted-foreground">Lead Owner</label>
                                <select
                                    id="leadOwner"
                                    name="leadOwner"
                                    value={formData.leadOwner}
                                    onChange={handleInputChange}
                                    className="w-full border rounded-md p-2 text-sm"
                                >
                                    <option value="" disabled>
                                        Select Lead Owner
                                    </option>
                                    {employees.map((employee) => (
                                        <option key={employee.employeeId} value={employee.employeeId}>
                                            {employee.name} ({employee.employeeId})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="addedBy" className="text-sm text-muted-foreground">Added By</label>
                                <select
                                    id="addedBy"
                                    name="addedBy"
                                    value={formData.addedBy}
                                    onChange={handleInputChange}
                                    className="w-full border rounded-md p-2 text-sm"
                                >
                                    <option value="" disabled>
                                        Select Added By
                                    </option>
                                    {employees.map((employee) => (
                                        <option key={employee.employeeId} value={employee.employeeId}>
                                          {employee.name}   ({employee.employeeId})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Source and Options</h2>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="leadSource" className="text-sm text-muted-foreground">Lead Source</label>
                                <Input
                                    id="leadSource"
                                    name="leadSource"
                                    value={formData.leadSource}
                                    onChange={handleInputChange}
                                    placeholder="Enter lead source"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="autoConvertToClient"
                                    checked={formData.autoConvertToClient}
                                    onCheckedChange={handleCheckboxChange}
                                />
                                <label htmlFor="autoConvertToClient" className="text-sm text-muted-foreground">
                                    Auto Convert to Client
                                </label>
                            </div>
                        </div>
                    </div>
                    {formData.autoConvertToClient && (
                        <div>
                            <h2 className="text-lg font-semibold">Deal Information</h2>
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="deal.title" className="text-sm text-muted-foreground">Deal Title *</label>
                                    <Input
                                        id="deal.title"
                                        name="deal.title"
                                        value={formData.deal?.title}
                                        onChange={handleInputChange}
                                        placeholder="Enter deal title"
                                        aria-required="true"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="deal.pipeline" className="text-sm text-muted-foreground">Pipeline</label>
                                    <Input
                                        id="deal.pipeline"
                                        name="deal.pipeline"
                                        value={formData.deal?.pipeline}
                                        onChange={handleInputChange}
                                        placeholder="Enter pipeline"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="deal.dealStage" className="text-sm text-muted-foreground">Deal Stage</label>
                                    <Input
                                        id="deal.dealStage"
                                        name="deal.dealStage"
                                        value={formData.deal?.dealStage}
                                        onChange={handleInputChange}
                                        placeholder="Enter deal stage"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="deal.dealCategory" className="text-sm text-muted-foreground">Deal Category</label>
                                    <Input
                                        id="deal.dealCategory"
                                        name="deal.dealCategory"
                                        value={formData.deal?.dealCategory}
                                        onChange={handleInputChange}
                                        placeholder="Enter deal category"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="deal.value" className="text-sm text-muted-foreground">Deal Value *</label>
                                    <Input
                                        id="deal.value"
                                        name="deal.value"
                                        type="number"
                                        value={formData.deal?.value}
                                        onChange={handleInputChange}
                                        placeholder="Enter deal value"
                                        aria-required="true"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="deal.expectedCloseDate" className="text-sm text-muted-foreground">Expected Close Date *</label>
                                    <Input
                                        id="deal.expectedCloseDate"
                                        name="deal.expectedCloseDate"
                                        type="date"
                                        value={formData.deal?.expectedCloseDate}
                                        onChange={handleInputChange}
                                        placeholder="Select expected close date"
                                        aria-required="true"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="deal.dealAgent" className="text-sm text-muted-foreground">Deal Agent *</label>
                                    <select
                                        id="deal.dealAgent"
                                        name="deal.dealAgent"
                                        value={formData.deal?.dealAgent}
                                        onChange={handleInputChange}
                                        className="w-full border rounded-md p-2 text-sm"
                                        aria-required="true"
                                    >
                                        <option value="" disabled>
                                            Select Deal Agent
                                        </option>
                                        {employees.map((employee) => (
                                            <option key={employee.employeeId} value={employee.employeeId}>
                                                {employee.name} ({employee.employeeId})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground">Deal Watchers</label>
                                    <div className="mt-2 space-y-2">
                                        {employees.map((employee) => (
                                            <div key={employee.employeeId} className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`dealWatcher-${employee.employeeId}`}
                                                    checked={formData.deal?.dealWatchers.includes(employee.employeeId)}
                                                    onCheckedChange={(checked) =>
                                                        handleDealWatcherChange(employee.employeeId, checked as boolean)
                                                    }
                                                />
                                                <label
                                                    htmlFor={`dealWatcher-${employee.employeeId}`}
                                                    className="text-sm text-muted-foreground"
                                                >
                                                    {employee.name} ({employee.employeeId})
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Creating..." : "Create Lead"}
                        </Button>
                    </div>
                </form>
            </Card>
        </main>
    );
}