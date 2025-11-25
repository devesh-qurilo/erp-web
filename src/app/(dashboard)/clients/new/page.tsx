"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Phone, Globe, Camera, Building2, CheckCircle, AlertCircle, X, ArrowRight } from "lucide-react"

export default function AddClientDetails() {
  const router = useRouter()

  // Personal fields
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [mobile, setMobile] = useState("")
  const [country, setCountry] = useState("")
  const [gender, setGender] = useState("")
  const [category, setCategory] = useState("")
  const [subCategory, setSubCategory] = useState("")
  const [language, setLanguage] = useState("")
  const [receiveEmail, setReceiveEmail] = useState(false)

  // Company fields
  const [companyName, setCompanyName] = useState("")
  const [website, setWebsite] = useState("")
  const [officePhone, setOfficePhone] = useState("")
  const [taxName, setTaxName] = useState("")
  const [gstVatNo, setGstVatNo] = useState("")
  const [address, setAddress] = useState("")
  const [shippingAddress, setShippingAddress] = useState("")
  const [city, setCity] = useState("")
  const [stateVal, setStateVal] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [skype, setSkype] = useState("")
  const [linkedIn, setLinkedIn] = useState("")
  const [twitter, setTwitter] = useState("")
  const [facebook, setFacebook] = useState("")

  // files + previews
  const [profileFile, setProfileFile] = useState<File | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [profilePreview, setProfilePreview] = useState<string>("")
  const [logoPreview, setLogoPreview] = useState<string>("")

  // UI state
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Validate (same checks as before)
  const validateForm = () => {
    const newErr: Record<string, string> = {}
    if (!name.trim()) newErr.name = "Name is required"
    if (!email.trim()) newErr.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(email)) newErr.email = "Invalid email"
    if (!mobile.trim()) newErr.mobile = "Mobile is required"
    if (!country.trim()) newErr.country = "Country is required"
    if (!companyName.trim()) newErr.companyName = "Company name is required"
    setErrors(newErr)
    return Object.keys(newErr).length === 0
  }

  const readPreview = (file: File, setter: (s: string) => void) => {
    const r = new FileReader()
    r.onloadend = () => setter(r.result as string)
    r.readAsDataURL(file)
  }

  const onProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setProfileFile(f)
    if (f) readPreview(f, setProfilePreview)
    else setProfilePreview("")
  }
  const onLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setLogoFile(f)
    if (f) readPreview(f, setLogoPreview)
    else setLogoPreview("")
  }

  const clearMessage = () => { setMessage(""); setMessageType("") }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessage()
    if (!validateForm()) { setMessage("Please fix errors"); setMessageType("error"); return }
    setIsSubmitting(true)

    const client = {
      name, email, mobile, country, gender, category, subCategory, language, receiveEmail,
      skype, linkedIn, twitter, facebook,
      company: { companyName, website, officePhone, taxName, gstVatNo, address, city, state: stateVal, postalCode, shippingAddress }
    }
    const fd = new FormData()
    fd.append("client", JSON.stringify(client))
    if (profileFile) fd.append("profilePicture", profileFile)
    if (logoFile) fd.append("companyLogo", logoFile)

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}` },
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || data?.message || "Failed")
      setMessage("Client created successfully")
      setMessageType("success")
      setTimeout(() => resetForm(), 1400)
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Request failed")
      setMessageType("error")
    } finally { setIsSubmitting(false) }
  }

  const resetForm = () => {
    setName(""); setEmail(""); setMobile(""); setCountry(""); setGender(""); setCategory(""); setSubCategory(""); setLanguage(""); setReceiveEmail(false)
    setCompanyName(""); setWebsite(""); setOfficePhone(""); setTaxName(""); setGstVatNo(""); setAddress(""); setShippingAddress(""); setCity(""); setStateVal(""); setPostalCode("")
    setSkype(""); setLinkedIn(""); setTwitter(""); setFacebook("")
    setProfileFile(null); setLogoFile(null); setProfilePreview(""); setLogoPreview(""); setErrors({}); clearMessage()
  }

  const inputClass = (err?: boolean) =>
    `w-full px-3 py-2 rounded-md border transition focus:outline-none ${err ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200" : "border-slate-200 bg-white focus:border-gray-300 focus:ring-0"}`

  // use the uploaded image as the placeholder shown in the screenshot
  const placeholderImg = "/mnt/data/Screenshot 2025-11-25 111308.png"

  // Close / back -> go to clients listing (hides dashboard navbar because this page doesn't render it)
  const handleClose = () => {
    router.push("/clients")
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center py-12">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {/* modal-like header (matches screenshot) */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-gray-50">
          <h3 className="text-lg font-medium text-slate-900">Add Client Details</h3>
          <button onClick={handleClose} className="text-slate-500 hover:text-slate-700"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {message && (
            <div className={`rounded-md p-3 ${messageType === "success" ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"} flex items-start gap-3`}>
              {messageType === "success" ? <CheckCircle className="text-emerald-600" /> : <AlertCircle className="text-red-600" />}
              <div className="text-sm font-medium">{message}</div>
              <button type="button" onClick={clearMessage} className="ml-auto text-slate-400"><X /></button>
            </div>
          )}

          {/* Account Details */}
          <div className="rounded-lg border border-slate-200 p-5">
            <h4 className="text-sm font-semibold mb-4 text-slate-800">Account Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-1 block">Client Name *</label>
                    <input value={name} onChange={(e)=>{setName(e.target.value); if(errors.name) setErrors({...errors, name:""})}} className={inputClass(Boolean(errors.name))} placeholder="John Doe" />
                    {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-1 block">Email *</label>
                    <input value={email} onChange={(e)=>{setEmail(e.target.value); if(errors.email) setErrors({...errors, email:""})}} className={inputClass(Boolean(errors.email))} placeholder="asdf@gmail.com" />
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-1 block">Mobile Number *</label>
                    <input value={mobile} onChange={(e)=>{setMobile(e.target.value); if(errors.mobile) setErrors({...errors, mobile:""})}} className={inputClass(Boolean(errors.mobile))} placeholder="9999999999" />
                    {errors.mobile && <p className="text-xs text-red-600 mt-1">{errors.mobile}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-1 block">Country *</label>
                    <input value={country} onChange={(e)=>{setCountry(e.target.value); if(errors.country) setErrors({...errors, country:""})}} className={inputClass(Boolean(errors.country))} placeholder="--" />
                    {errors.country && <p className="text-xs text-red-600 mt-1">{errors.country}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-1 block">Gender</label>
                    <select value={gender} onChange={(e)=>setGender(e.target.value)} className={inputClass()}>
                      <option value="">--</option><option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-1 block">Client Category</label>
                    <div className="flex gap-2">
                      <select value={category} onChange={(e)=>setCategory(e.target.value)} className={inputClass()}>
                        <option value="">--</option>
                      </select>
                      <button type="button" className="px-3 rounded-md bg-slate-100 border border-slate-200">Add</button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-1 block">Sub Category</label>
                    <div className="flex gap-2">
                      <select value={subCategory} onChange={(e)=>setSubCategory(e.target.value)} className={inputClass()}>
                        <option value="">--</option>
                      </select>
                      <button type="button" className="px-3 rounded-md bg-slate-100 border border-slate-200">Add</button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-1 block">Language</label>
                    <select value={language} onChange={(e)=>setLanguage(e.target.value)} className={inputClass()}>
                      <option value="">English</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs font-medium text-slate-700 mb-1 block">Receive Email Notifications ?</label>
                    <div className="flex items-center gap-4 text-sm">
                      <label className="flex items-center gap-2"><input type="radio" name="receive" checked={receiveEmail} onChange={()=>setReceiveEmail(true)} /> Yes</label>
                      <label className="flex items-center gap-2"><input type="radio" name="receive" checked={!receiveEmail} onChange={()=>setReceiveEmail(false)} /> No</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* right column: profile picture box */}
              <div>
                <label className="text-xs font-medium text-slate-700 mb-2 block">Profile Picture</label>
                <div className="rounded-md border border-dashed border-slate-300 p-4 text-center">
                  <input id="profile" type="file" accept="image/*" onChange={onProfileChange} className="hidden" />
                  <label htmlFor="profile" className="cursor-pointer block">
                    <div className="mx-auto mb-3 h-28 w-full max-w-xs">
                      {profilePreview ? (
                        <img src={profilePreview} alt="preview" className="mx-auto h-28 w-28 rounded-md object-cover" />
                      ) : (
                        <img src={placeholderImg} alt="placeholder" className="mx-auto h-28 w-28 rounded-md object-cover" />
                      )}
                    </div>
                    <div className="text-sm text-slate-500">Choose a file</div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Company details */}
          <div className="rounded-lg border border-slate-200 p-5">
            <h4 className="text-sm font-semibold mb-4 text-slate-800">Company Details</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Company Name *</label>
                <input value={companyName} onChange={(e)=>{setCompanyName(e.target.value); if(errors.companyName) setErrors({...errors, companyName:""})}} className={inputClass(Boolean(errors.companyName))} placeholder="--" />
                {errors.companyName && <p className="text-xs text-red-600 mt-1">{errors.companyName}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Official Website</label>
                <input value={website} onChange={(e)=>setWebsite(e.target.value)} className={inputClass()} placeholder="--" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Office Phone Number</label>
                <input value={officePhone} onChange={(e)=>setOfficePhone(e.target.value)} className={inputClass()} placeholder="--" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-4">
              <div><label className="text-xs">Tax Name</label><input value={taxName} onChange={(e)=>setTaxName(e.target.value)} className={inputClass()} placeholder="e.g. GST" /></div>
              <div><label className="text-xs">GST/VAT No.</label><input value={gstVatNo} onChange={(e)=>setGstVatNo(e.target.value)} className={inputClass()} placeholder="--" /></div>
              <div><label className="text-xs">City</label><input value={city} onChange={(e)=>setCity(e.target.value)} className={inputClass()} placeholder="--" /></div>
              <div><label className="text-xs">State</label><input value={stateVal} onChange={(e)=>setStateVal(e.target.value)} className={inputClass()} placeholder="--" /></div>
              <div className="md:col-span-2"><label className="text-xs">Postal Code</label><input value={postalCode} onChange={(e)=>setPostalCode(e.target.value)} className={inputClass()} placeholder="--" /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-xs font-medium mb-1 block">Company Address</label>
                <textarea value={address} onChange={(e)=>setAddress(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-200" rows={4} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Shipping Address</label>
                <textarea value={shippingAddress} onChange={(e)=>setShippingAddress(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-200" rows={4} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <input value={skype} onChange={(e)=>setSkype(e.target.value)} className={inputClass()} placeholder="Skype" />
              <input value={linkedIn} onChange={(e)=>setLinkedIn(e.target.value)} className={inputClass()} placeholder="LinkedIn" />
              <input value={twitter} onChange={(e)=>setTwitter(e.target.value)} className={inputClass()} placeholder="Twitter" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 items-end">
              <input value={facebook} onChange={(e)=>setFacebook(e.target.value)} className={inputClass()} placeholder="Facebook" />
              <input className={inputClass()} placeholder="Added by" />
              <div>
                <label className="text-xs font-medium text-slate-700 mb-2 block">Company Logo</label>
                <div className="rounded-md border border-dashed border-slate-300 p-3 text-center">
                  <input id="logo" type="file" accept="image/*" onChange={onLogoChange} className="hidden" />
                  <label htmlFor="logo" className="cursor-pointer block">
                    <div className="mb-2 h-24">
                      {logoPreview ? <img src={logoPreview} alt="logo" className="mx-auto h-24 object-contain" /> : <img src={placeholderImg} alt="logo-placeholder" className="mx-auto h-24 object-contain" />}
                    </div>
                    <div className="text-sm text-slate-500">Choose a file</div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* action buttons centered */}
          <div className="flex justify-center gap-4">
            <button type="button" onClick={resetForm} className="px-6 py-2 rounded-md border bg-white text-slate-700">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-md bg-blue-600 text-white flex items-center gap-2">
              {isSubmitting ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              {isSubmitting ? "Updating..." : "Update"} <ArrowRight />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
