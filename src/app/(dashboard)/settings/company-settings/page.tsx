// src/app/settings/company-settings/add/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

type CompanyPayload = {
  companyName: string;
  email: string;
  contactNo: string;
  website: string;
  address: string;
};

const API_BASE = "https://chat.swiftandgo.in";

export default function CompanySettingsFormPage() {
  const search = useSearchParams();
  const router = useRouter();
  const id = search?.get("id"); // if present => edit mode
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState<boolean>(!!id);
  const [saving, setSaving] = useState<boolean>(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [form, setForm] = useState<any>({
    companyName: "",
    email: "",
    contactNo: "",
    website: "",
    address: "",
    logoUrl: "",
  });

  // fetch existing company if edit
  useEffect(() => {
    if (!id) return setLoading(false);
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/company/${encodeURIComponent(id)}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}` },
        });
        if (!res.ok) {
          const t = await res.text().catch(() => "");
          console.error("Failed to load company:", res.status, t);
          return;
        }
        const data = await res.json();
        if (!mounted) return;
        setForm({
          companyName: data.companyName ?? "",
          email: data.email ?? "",
          contactNo: data.contactNo ?? "",
          website: data.website ?? "",
          address: data.address ?? "",
          logoUrl: data.logoUrl ?? "",
        });
        if (data.logoUrl) setLogoPreview(data.logoUrl);
      } catch (err) {
        console.error("Load company error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const handleFileChange = (f?: File | null) => {
    if (!f) {
      setLogoFile(null);
      setLogoPreview(form.logoUrl || null);
      return;
    }
    setLogoFile(f);
    const url = URL.createObjectURL(f);
    setLogoPreview(url);
  };

  const onPickFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      // Use FormData because logo file may be present
      const fd = new FormData();
      fd.append("companyName", form.companyName ?? "");
      fd.append("email", form.email ?? "");
      fd.append("contactNo", form.contactNo ?? "");
      fd.append("website", form.website ?? "");
      fd.append("address", form.address ?? "");
      if (logoFile) fd.append("logo", logoFile);

      // Create vs Update
      const method = id ? "PUT" : "POST";
      // endpoint: POST /api/company  ; PUT /api/company/{id}
      const url = id ? `${API_BASE}/api/company/${encodeURIComponent(id)}` : `${API_BASE}/api/company`;

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
          // NOTE: don't set Content-Type for FormData; browser will set multipart boundary
        },
        body: fd,
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        console.error("Save failed:", res.status, t);
        alert(`Save failed: ${res.status} (see console)`);
        setSaving(false);
        return;
      }

      const saved = await res.json();
      // success -> navigate back to list or show toast
      alert("Company saved successfully");
      // go to listing or edit page of saved resource
      router.push("/settings/company-settings");
    } catch (err) {
      console.error("Unexpected save error:", err);
      alert("Unexpected error while saving (see console)");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="w-full max-w-3xl bg-white rounded-lg border p-8 shadow">
          <div className="h-8 w-56 bg-gray-100 rounded mb-6 animate-pulse" />
          <div className="space-y-4">
            <div className="h-12 bg-gray-100 rounded animate-pulse" />
            <div className="h-12 bg-gray-100 rounded animate-pulse" />
            <div className="h-12 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Company Settings</h2>
            <p className="text-sm text-slate-600 mt-1">Manage company profile and logo</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/settings/company-settings">
              <Button variant="ghost">Back</Button>
            </Link>
            <Button onClick={onPickFileClick}>
              <Plus className="mr-2 w-4 h-4" /> Upload Logo
            </Button>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1">
              <div className="text-sm font-medium text-slate-700">Company Name <span className="text-red-500">*</span></div>
              <input
                required
                value={form.companyName}
                onChange={(e) => setForm((p: any) => ({ ...p, companyName: e.target.value }))}
                className="border rounded-md h-11 px-3 w-full"
                placeholder="--"
              />
            </label>

            <label className="space-y-1">
              <div className="text-sm font-medium text-slate-700">Email Id <span className="text-red-500">*</span></div>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((p: any) => ({ ...p, email: e.target.value }))}
                className="border rounded-md h-11 px-3 w-full"
                placeholder="--"
              />
            </label>

            <label className="space-y-1">
              <div className="text-sm font-medium text-slate-700">Contact No. <span className="text-red-500">*</span></div>
              <input
                required
                value={form.contactNo}
                onChange={(e) => setForm((p: any) => ({ ...p, contactNo: e.target.value }))}
                className="border rounded-md h-11 px-3 w-full"
                placeholder="--"
              />
            </label>

            <label className="space-y-1">
              <div className="text-sm font-medium text-slate-700">Company Website <span className="text-red-500">*</span></div>
              <input
                required
                value={form.website}
                onChange={(e) => setForm((p: any) => ({ ...p, website: e.target.value }))}
                className="border rounded-md h-11 px-3 w-full"
                placeholder="--"
              />
            </label>
          </div>

          <div className="mt-4">
            <label className="space-y-1 w-full">
              <div className="text-sm font-medium text-slate-700">Company Address <span className="text-red-500">*</span></div>
              <textarea
                required
                value={form.address}
                onChange={(e) => setForm((p: any) => ({ ...p, address: e.target.value }))}
                className="border rounded-md p-3 h-28 w-full"
                placeholder="--"
              />
            </label>
          </div>

          {/* Logo upload */}
          <div className="mt-6">
            <div className="text-sm font-medium text-slate-700 mb-2">Company Logo <span className="text-red-500">*</span></div>
            <div
              onClick={onPickFileClick}
              className="border rounded-md h-36 flex items-center justify-center cursor-pointer bg-white hover:bg-gray-50"
            >
              {logoPreview ? (
                <div className="flex items-center gap-4 px-4">
                  <img src={logoPreview} alt="logo preview" className="h-24 object-contain rounded-md border" />
                  <div className="text-sm text-slate-600">Click to change logo</div>
                </div>
              ) : (
                <div className="text-center text-slate-400">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="mx-auto mb-2">
                    <path d="M12 3v10" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 10l5-5 5 5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="text-sm">Choose a file</div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                handleFileChange(f);
              }}
            />
          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-center gap-4">
            <Button variant="outline" onClick={() => router.push("/settings/company-settings")}>Cancel</Button>
            <Button type="submit" onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : id ? "Save changes" : "Save"}
            </Button>
          </div>
        </form>

        {/* small footer / existing companies link */}
        <div className="mt-6 text-center text-sm text-slate-500">
          <Link href="/settings/company-settings" className="underline">Back to company list</Link>
        </div>
      </div>
    </div>
  );
}
