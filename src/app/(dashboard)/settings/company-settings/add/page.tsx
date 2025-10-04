"use client";

import { useState, useEffect } from "react";

export default function CompanyForm() {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [isExisting, setIsExisting] = useState(false);

  // Fetch existing company info (if already created)
  useEffect(() => {
    async function loadCompany() {
      try {
        const res = await fetch("/api/company/company-settings", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
          },
        });
        if (!res.ok) return;

        const data = await res.json();
        if (data && data.companyName) {
          setCompanyName(data.companyName);
          setEmail(data.email);
          setContactNo(data.contactNo);
          setWebsite(data.website);
          setAddress(data.address);
          setIsExisting(true);
        }
      } catch (err) {
        console.error("Error fetching company:", err);
      }
    }
    loadCompany();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("companyName", companyName);
    formData.append("email", email);
    formData.append("contactNo", contactNo);
    formData.append("website", website);
    formData.append("address", address);
    if (logoFile) formData.append("logoFile", logoFile);

    try {
      const res = await fetch("/api/company/company-settings", {
        method: isExisting ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Request failed");

      setMessage(
        isExisting
          ? "✅ Company profile updated successfully!"
          : "✅ Company profile created successfully!"
      );
      setIsExisting(true);
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white shadow-lg rounded-2xl">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        {isExisting ? "Update Company Profile" : "Create Company Profile"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="email"
          placeholder="Company Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Contact Number"
          value={contactNo}
          onChange={(e) => setContactNo(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="url"
          placeholder="Website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <textarea
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {isExisting ? "Update Company" : "Create Company"}
        </button>
      </form>

      {message && <p className="mt-4 text-center text-sm">{message}</p>}
    </div>
  );
}
