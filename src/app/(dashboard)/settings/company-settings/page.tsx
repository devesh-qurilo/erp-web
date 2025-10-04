"use client";
import { useEffect, useState } from "react";

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
        setCompanies(Array.isArray(data) ? data : [data]); // handles single or multiple records
      } catch (error) {
        console.error("Failed to fetch companies:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Company Profiles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {companies.map((company) => (
          <div key={company.id} className="p-4 border rounded-lg shadow-sm bg-white">
            <img
              src={company.logoUrl}
              alt={company.companyName}
              className="w-24 h-24 object-cover rounded-full mb-3"
            />
            <h3 className="text-lg font-semibold">{company.companyName}</h3>
            <p>{company.email}</p>
            <p>{company.contactNo}</p>
            <p>{company.website}</p>
            <p className="text-sm text-gray-600">{company.address}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
