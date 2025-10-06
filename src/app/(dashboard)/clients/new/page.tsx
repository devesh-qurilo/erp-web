"use client"

import React, { useState } from "react"
import { Camera, Building2, User, Mail, Phone, Globe, AlertCircle, CheckCircle, X } from "lucide-react"

export default function NewClientPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [mobile, setMobile] = useState("")
  const [country, setCountry] = useState("")
  const [gender, setGender] = useState("")
  const [category, setCategory] = useState("")
  const [subCategory, setSubCategory] = useState("")
  const [language, setLanguage] = useState("")
  const [receiveEmail, setReceiveEmail] = useState(false)
  const [skype, setSkype] = useState("")
  const [linkedIn, setLinkedIn] = useState("")
  const [twitter, setTwitter] = useState("")
  const [facebook, setFacebook] = useState("")

  const [companyName, setCompanyName] = useState("")
  const [website, setWebsite] = useState("")
  const [officePhone, setOfficePhone] = useState("")
  const [taxName, setTaxName] = useState("")
  const [gstVatNo, setGstVatNo] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [shippingAddress, setShippingAddress] = useState("")

  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null)
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null)
  const [profilePreview, setProfilePreview] = useState<string>("")
  const [logoPreview, setLogoPreview] = useState<string>("")

  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = "Name is required"
    if (!email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format"
    if (!mobile.trim()) newErrors.mobile = "Mobile is required"
    if (!country.trim()) newErrors.country = "Country is required"
    if (!companyName.trim()) newErrors.companyName = "Company name is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfilePictureFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setProfilePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleCompanyLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCompanyLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setLogoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const clearMessage = () => {
    setMessage("")
    setMessageType("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessage()

    if (!validateForm()) {
      setMessage("Please fix the errors before submitting")
      setMessageType("error")
      return
    }

    setIsSubmitting(true)

    const clientData = {
      name,
      email,
      mobile,
      country,
      gender,
      category,
      subCategory,
      language,
      receiveEmail,
      skype,
      linkedIn,
      twitter,
      facebook,
      company: {
        companyName,
        website,
        officePhone,
        taxName,
        gstVatNo,
        address,
        city,
        state,
        postalCode,
        shippingAddress,
      },
    }

    const formData = new FormData()
    formData.append("client", JSON.stringify(clientData))
    if (profilePictureFile) formData.append("profilePicture", profilePictureFile)
    if (companyLogoFile) formData.append("companyLogo", companyLogoFile)

    try {
      const token = sessionStorage.getItem("accessToken") || ""
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.message || "Request failed")

      setMessage("Client created successfully!")
      setMessageType("success")
      
      // Reset form after success
      setTimeout(() => {
        resetForm()
      }, 2000)
      
    } catch (err: any) {
      setMessage(err.message || "Failed to create client")
      setMessageType("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setName("")
    setEmail("")
    setMobile("")
    setCountry("")
    setGender("")
    setCategory("")
    setSubCategory("")
    setLanguage("")
    setReceiveEmail(false)
    setSkype("")
    setLinkedIn("")
    setTwitter("")
    setFacebook("")
    setCompanyName("")
    setWebsite("")
    setOfficePhone("")
    setTaxName("")
    setGstVatNo("")
    setAddress("")
    setCity("")
    setState("")
    setPostalCode("")
    setShippingAddress("")
    setProfilePictureFile(null)
    setCompanyLogoFile(null)
    setProfilePreview("")
    setLogoPreview("")
    setErrors({})
    clearMessage()
  }

  return (
    <div>
      <div className="container mx-auto ">
        <div className="bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <User className="w-8 h-8" />
              Create New Client
            </h1>
            <p className="text-blue-100 mt-2">Add a new client to your database</p>
          </div>

          {/* Alert Message */}
          {message && (
            <div className={`mx-8 mt-6 p-4 rounded-lg flex items-start gap-3 ${
              messageType === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
            }`}>
              {messageType === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <p className={`flex-1 ${messageType === "success" ? "text-green-800" : "text-red-800"}`}>
                {message}
              </p>
              <button onClick={clearMessage} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Client Information */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">Client Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (errors.name) setErrors({...errors, name: ""})
                    }}
                    className={`w-full border ${errors.name ? "border-red-500" : "border-gray-300"} p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (errors.email) setErrors({...errors, email: ""})
                      }}
                      className={`w-full border ${errors.email ? "border-red-500" : "border-gray-300"} pl-11 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={mobile}
                      onChange={(e) => {
                        setMobile(e.target.value)
                        if (errors.mobile) setErrors({...errors, mobile: ""})
                      }}
                      className={`w-full border ${errors.mobile ? "border-red-500" : "border-gray-300"} pl-11 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                    />
                  </div>
                  {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="United States"
                      value={country}
                      onChange={(e) => {
                        setCountry(e.target.value)
                        if (errors.country) setErrors({...errors, country: ""})
                      }}
                      className={`w-full border ${errors.country ? "border-red-500" : "border-gray-300"} pl-11 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                    />
                  </div>
                  {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <input
                    type="text"
                    placeholder="English"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    placeholder="Premium"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sub Category</label>
                  <input
                    type="text"
                    placeholder="VIP"
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skype</label>
                  <input
                    type="text"
                    placeholder="john.skype"
                    value={skype}
                    onChange={(e) => setSkype(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                  <input
                    type="text"
                    placeholder="linkedin.com/in/johndoe"
                    value={linkedIn}
                    onChange={(e) => setLinkedIn(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                  <input
                    type="text"
                    placeholder="@johndoe"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                  <input
                    type="text"
                    placeholder="facebook.com/johndoe"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 mt-6 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={receiveEmail}
                  onChange={(e) => setReceiveEmail(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700 group-hover:text-gray-900 transition">Receive Email Notifications</span>
              </label>
            </section>

            {/* Company Information */}
            <section className="border-t pt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <Building2 className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">Company Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Acme Corporation"
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value)
                      if (errors.companyName) setErrors({...errors, companyName: ""})
                    }}
                    className={`w-full border ${errors.companyName ? "border-red-500" : "border-gray-300"} p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                  />
                  {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Office Phone</label>
                  <input
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={officePhone}
                    onChange={(e) => setOfficePhone(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax Name</label>
                  <input
                    type="text"
                    placeholder="GST, VAT, etc."
                    value={taxName}
                    onChange={(e) => setTaxName(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GST/VAT Number</label>
                  <input
                    type="text"
                    placeholder="123456789"
                    value={gstVatNo}
                    onChange={(e) => setGstVatNo(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    placeholder="New York"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    placeholder="NY"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                  <input
                    type="text"
                    placeholder="10001"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    placeholder="123 Main Street"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address</label>
                  <input
                    type="text"
                    placeholder="456 Shipping Lane"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            </section>

            {/* File Uploads */}
            <section className="border-t pt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Camera className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">Uploads</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                      id="profile-upload"
                    />
                    <label htmlFor="profile-upload" className="cursor-pointer">
                      {profilePreview ? (
                        <img src={profilePreview} alt="Profile" className="w-32 h-32 object-cover rounded-full mx-auto" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <Camera className="w-12 h-12 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Click to upload</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCompanyLogoChange}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="w-32 h-32 object-contain mx-auto" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <Building2 className="w-12 h-12 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Click to upload</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? "Creating..." : "Create Client"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-8 bg-gray-200 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}