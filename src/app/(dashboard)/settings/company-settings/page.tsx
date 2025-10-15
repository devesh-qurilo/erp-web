"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Mail, Phone, Globe, MapPin, Plus, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Company {
  id: number;
  companyName: string;
  email: string;
  contactNo: string;
  website: string;
  address: string;
  logoUrl: string;
  createdAt: string;
}

export default function CompanyList() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const res = await fetch("/api/company/company-settings", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
          },
        });

        const data = await res.json();
        setCompanies(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error("Failed to fetch companies:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Company Profiles</h1>
            <p className="text-slate-600">Manage your company information and settings</p>
          </div>
          <Link href="/settings/company-settings/add">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </Button>
          </Link>
        </div>

        {companies.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-300">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Building2 className="w-16 h-16 text-slate-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No companies yet</h3>
              <p className="text-slate-600 mb-6">Get started by creating your first company profile</p>
              <Link href="/settings/company-settings/add">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Company
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <Card key={company.id} className="group hover:shadow-xl transition-all duration-300 border-slate-200 bg-white overflow-hidden">
                <CardHeader className="pb-4 bg-gradient-to-br from-slate-50 to-white">
                  <div className="flex items-start justify-between mb-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-white shadow-md bg-white">
                        <img
                          src={company.logoUrl}
                          alt={company.companyName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <Link href={`/settings/company-settings/${company.id}/edit`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900">
                    {company.companyName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center text-sm text-slate-600">
                    <Mail className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{company.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Phone className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
                    <span>{company.contactNo}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Globe className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate hover:text-blue-600 transition-colors"
                    >
                      {company.website}
                    </a>
                  </div>
                  <div className="flex items-start text-sm text-slate-600">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 text-slate-400 flex-shrink-0" />
                    <span className="line-clamp-2">{company.address}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
