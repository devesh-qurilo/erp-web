// "use client";

// import { useState } from "react";

// export default function EditClientPage() {
//   const [formData, setFormData] = useState({
//     name: "John Doe",
//     email: "asdf@gmail.com",
//     mobile: "9999999999",
//     country: "",
//     gender: "Male",
//     language: "English",
//     category: "",
//     subCategory: "",
//     receiveEmail: "Yes",
//     status: "Active",
//     companyName: "",
//     website: "",
//     officePhone: "",
//     taxName: "",
//     vatNo: "",
//     city: "",
//     state: "",
//     postalCode: "",
//     companyAddress: "",
//     shippingAddress: "",
//     profilePicture: null as File | null,
//   });

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData((prev) => ({
//       ...prev,
//       profilePicture: e.target.files ? e.target.files[0] : null,
//     }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log("Updated Client Data:", formData);
//     // 👉 Send API request here
//   };

//   return (
//     <>
//     <div className="p-6">
//       <h1 className="text-2xl font-semibold mb-6">Update Client Details</h1>

//       <form
//         onSubmit={handleSubmit}
//         className="space-y-6 bg-white p-6 shadow rounded-xl"
//       >
//         {/* Account Details */}
//         <div>
//           <h2 className="text-lg font-semibold mb-4">Account Details</h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               placeholder="Client Name"
//               className="border rounded-lg px-3 py-2"
//               required
//             />
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               placeholder="Email"
//               className="border rounded-lg px-3 py-2"
//               required
//             />
//             <input
//               type="text"
//               name="mobile"
//               value={formData.mobile}
//               onChange={handleChange}
//               placeholder="Mobile Number"
//               className="border rounded-lg px-3 py-2"
//               required
//             />
//             <input
//               type="text"
//               name="country"
//               value={formData.country}
//               onChange={handleChange}
//               placeholder="Country"
//               className="border rounded-lg px-3 py-2"
//               required
//             />
//             <select
//               name="gender"
//               value={formData.gender}
//               onChange={handleChange}
//               className="border rounded-lg px-3 py-2"
//             >
//               <option>Male</option>
//               <option>Female</option>
//               <option>Other</option>
//             </select>
//             <select
//               name="language"
//               value={formData.language}
//               onChange={handleChange}
//               className="border rounded-lg px-3 py-2"
//             >
//               <option>English</option>
//               <option>Hindi</option>
//               <option>Other</option>
//             </select>
//             <input
//               type="text"
//               name="category"
//               value={formData.category}
//               onChange={handleChange}
//               placeholder="Client Category"
//               className="border rounded-lg px-3 py-2"
//             />
//             <input
//               type="text"
//               name="subCategory"
//               value={formData.subCategory}
//               onChange={handleChange}
//               placeholder="Sub Category"
//               className="border rounded-lg px-3 py-2"
//             />

//             {/* Profile Picture */}
//             <div className="flex flex-col items-center justify-center border rounded-lg px-3 py-6">
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleFileChange}
//                 className="hidden"
//                 id="profilePic"
//               />
//               <label
//                 htmlFor="profilePic"
//                 className="cursor-pointer text-sm text-gray-500"
//               >
//                 Choose a file
//               </label>
//             </div>
//           </div>

//           {/* Radio Options */}
//           <div className="mt-4 flex gap-6">
//             <div>
//               <label className="block text-sm font-medium">
//                 Receive Email Notifications?
//               </label>
//               <div className="flex gap-3 mt-1">
//                 <label>
//                   <input
//                     type="radio"
//                     name="receiveEmail"
//                     value="Yes"
//                     checked={formData.receiveEmail === "Yes"}
//                     onChange={handleChange}
//                   />{" "}
//                   Yes
//                 </label>
//                 <label>
//                   <input
//                     type="radio"
//                     name="receiveEmail"
//                     value="No"
//                     checked={formData.receiveEmail === "No"}
//                     onChange={handleChange}
//                   />{" "}
//                   No
//                 </label>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium">Status?</label>
//               <div className="flex gap-3 mt-1">
//                 <label>
//                   <input
//                     type="radio"
//                     name="status"
//                     value="Active"
//                     checked={formData.status === "Active"}
//                     onChange={handleChange}
//                   />{" "}
//                   Active
//                 </label>
//                 <label>
//                   <input
//                     type="radio"
//                     name="status"
//                     value="Inactive"
//                     checked={formData.status === "Inactive"}
//                     onChange={handleChange}
//                   />{" "}
//                   Inactive
//                 </label>
//               </div>
//             </div>
//           </div>
//         </div>
//         </form>

//         {/* Company Details */}



//         <div className="space-y-4">
//           <h2 className="text-lg font-semibold mb-4">Company Details</h2>

//           <form>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <input
//               type="text"
//               name="companyName"
//               value={formData.companyName}
//               onChange={handleChange}
//               placeholder="Company Name"
//               className="border rounded-lg px-3 py-2"
//             />
//             <input
//               type="text"
//               name="website"
//               value={formData.website}
//               onChange={handleChange}
//               placeholder="Official Website"
//               className="border rounded-lg px-3 py-2"
//             />
//             <input
//               type="text"
//               name="officePhone"
//               value={formData.officePhone}
//               onChange={handleChange}
//               placeholder="Office Phone Number"
//               className="border rounded-lg px-3 py-2"
//             />
//             <input
//               type="text"
//               name="taxName"
//               value={formData.taxName}
//               onChange={handleChange}
//               placeholder="Tax Name"
//               className="border rounded-lg px-3 py-2"
//             />
//             <input
//               type="text"
//               name="vatNo"
//               value={formData.vatNo}
//               onChange={handleChange}
//               placeholder="GST/VAT No."
//               className="border rounded-lg px-3 py-2"
//             />
//             <input
//               type="text"
//               name="city"
//               value={formData.city}
//               onChange={handleChange}
//               placeholder="City"
//               className="border rounded-lg px-3 py-2"
//             />
//             <input
//               type="text"
//               name="state"
//               value={formData.state}
//               onChange={handleChange}
//               placeholder="State"
//               className="border rounded-lg px-3 py-2"
//             />
//             <input
//               type="text"
//               name="postalCode"
//               value={formData.postalCode}
//               onChange={handleChange}
//               placeholder="Postal Code"
//               className="border rounded-lg px-3 py-2"
//             />
//             <input
//               type="text"
//               name="companyAddress"
//               value={formData.companyAddress}
//               onChange={handleChange}
//               placeholder="Company Address"
//               className="border rounded-lg px-3 py-2"
//             />
//             <input
//               type="text"
//               name="shippingAddress"
//               value={formData.shippingAddress}
//               onChange={handleChange}
//               placeholder="Shipping Address"
//               className="border rounded-lg px-3 py-2"
//             />
//           </div>
//         </div>

//         {/* Submit */}
//         <div className="flex justify-end">
//           <button
//             type="submit"
//             className="bg-blue-600 text-white px-6 py-2 rounded-lg"
//           >
//             Save Changes
//           </button>
//         </div>
//         </form>
//     </div>
//     </>
//   );
// }


"use client";

import { useState } from "react";

export default function EditClientPage() {
    const [formData, setFormData] = useState({
        name: "John Doe",
        email: "asdf@gmail.com",
        mobile: "9999999999",
        country: "",
        gender: "Male",
        language: "English",
        category: "",
        subCategory: "",
        receiveEmail: "Yes",
        status: "Active",
        companyName: "",
        website: "",
        officePhone: "",
        taxName: "",
        vatNo: "",
        city: "",
        state: "",
        postalCode: "",
        companyAddress: "",
        shippingAddress: "",
        skype: "",
        linkedIn: "",
        twitter: "",
        facebook: "",
        addedBy: "",
        profilePicture: null as File | null,
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            profilePicture: e.target.files ? e.target.files[0] : null,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Updated Client Data:", formData);
        // 👉 API call goes here
    };

    return (
        <div className="">
            <div className="p-6 space-y-8 bg-white  shadow rounded-xl">
                <h1 className="text-2xl font-semibold mb-6">Update Client Details</h1>


                {/* Account Details */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">Account Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Client Name"
                            className="border rounded-lg px-3 py-2"
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            className="border rounded-lg px-3 py-2"
                            required
                        />
                        <input
                            type="text"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            placeholder="Mobile Number"
                            className="border rounded-lg px-3 py-2"
                            required
                        />
                        <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            placeholder="Country"
                            className="border rounded-lg px-3 py-2"
                        />
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="border rounded-lg px-3 py-2"
                        >
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                        </select>
                        <select
                            name="language"
                            value={formData.language}
                            onChange={handleChange}
                            className="border rounded-lg px-3 py-2"
                        >
                            <option>English</option>
                            <option>Hindi</option>
                            <option>Other</option>
                        </select>
                        <input
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            placeholder="Client Category"
                            className="border rounded-lg px-3 py-2"
                        />
                        <input
                            type="text"
                            name="subCategory"
                            value={formData.subCategory}
                            onChange={handleChange}
                            placeholder="Sub Category"
                            className="border rounded-lg px-3 py-2"
                        />

                        {/* Profile Picture */}
                        <div className="flex flex-col items-center justify-center border rounded-lg px-3 py-6">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                id="profilePic"
                            />
                            <label
                                htmlFor="profilePic"
                                className="cursor-pointer text-sm text-gray-500"
                            >
                                Choose a file
                            </label>
                        </div>
                    </div>

                    {/* Radio Options */}
                    <div className="mt-4 flex gap-6">
                        <div>
                            <label className="block text-sm font-medium">
                                Receive Email Notifications?
                            </label>
                            <div className="flex gap-3 mt-1">
                                <label>
                                    <input
                                        type="radio"
                                        name="receiveEmail"
                                        value="Yes"
                                        checked={formData.receiveEmail === "Yes"}
                                        onChange={handleChange}
                                    />{" "}
                                    Yes
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="receiveEmail"
                                        value="No"
                                        checked={formData.receiveEmail === "No"}
                                        onChange={handleChange}
                                    />{" "}
                                    No
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Status?</label>
                            <div className="flex gap-3 mt-1">
                                <label>
                                    <input
                                        type="radio"
                                        name="status"
                                        value="Active"
                                        checked={formData.status === "Active"}
                                        onChange={handleChange}
                                    />{" "}
                                    Active
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="status"
                                        value="Inactive"
                                        checked={formData.status === "Inactive"}
                                        onChange={handleChange}
                                    />{" "}
                                    Inactive
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">

                {/* Company Details */}
                <div className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Company Details</h2>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-8 bg-white p-6 shadow rounded-xl"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                placeholder="Company Name"
                                className="border rounded-lg px-3 py-2"
                            />
                            <input
                                type="text"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                placeholder="Official Website"
                                className="border rounded-lg px-3 py-2"
                            />
                            <input
                                type="text"
                                name="officePhone"
                                value={formData.officePhone}
                                onChange={handleChange}
                                placeholder="Office Phone Number"
                                className="border rounded-lg px-3 py-2"
                            />
                            <input
                                type="text"
                                name="taxName"
                                value={formData.taxName}
                                onChange={handleChange}
                                placeholder="Tax Name"
                                className="border rounded-lg px-3 py-2"
                            />
                            <input
                                type="text"
                                name="vatNo"
                                value={formData.vatNo}
                                onChange={handleChange}
                                placeholder="GST/VAT No."
                                className="border rounded-lg px-3 py-2"
                            />
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="City"
                                className="border rounded-lg px-3 py-2"
                            />
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                placeholder="State"
                                className="border rounded-lg px-3 py-2"
                            />
                            <input
                                type="text"
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleChange}
                                placeholder="Postal Code"
                                className="border rounded-lg px-3 py-2"
                            />
                            <input
                                type="text"
                                name="companyAddress"
                                value={formData.companyAddress}
                                onChange={handleChange}
                                placeholder="Company Address"
                                className="border rounded-lg px-3 py-2"
                            />
                            <input
                                type="text"
                                name="shippingAddress"
                                value={formData.shippingAddress}
                                onChange={handleChange}
                                placeholder="Shipping Address"
                                className="border rounded-lg px-3 py-2"
                            />

                            <input
                                type="text"
                                name="skype"
                                value={formData.skype}
                                onChange={handleChange}
                                placeholder="Skype ID"
                                className="border rounded-lg px-3 py-2"
                            />

                            <input
                                type="text"
                                name="linkedIn"
                                value={formData.linkedIn}
                                onChange={handleChange}
                                placeholder="LinkedIn Profile"
                                className="border rounded-lg px-3 py-2"
                            />

                            <input
                                type="text"
                                name="twitter"
                                value={formData.twitter}
                                onChange={handleChange}
                                placeholder="Twitter Handle"
                                className="border rounded-lg px-3 py-2"
                            />

                            <input
                                type="text"
                                name="facebook"
                                value={formData.facebook}
                                onChange={handleChange}
                                placeholder="Facebook Profile"
                                className="border rounded-lg px-3 py-2"
                            />

                            <div className="flex flex-col items-center justify-center border rounded-lg px-3 py-6">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                 placeholder="Company Logo"
                                id="profilePic"
                            />
                            <label
                                htmlFor="profilePic"
                                className="cursor-pointer text-sm text-gray-500"
                            >
                                Choose a file
                            </label>
                        </div>

                        <input
                                type="text"
                                name="addedBy"
                                value={formData.addedBy}
                                onChange={handleChange}
                                placeholder="Added By"
                                className="border rounded-lg px-3 py-2"
                            />

                                
                        </div>


                        
                        
                    </form>
                </div>
            </div>
            {/* Submit */}
            <div className="flex justify-center mt-6 gap-4">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg"
                            >
                                Update
                            </button>
                             <button
                                type="submit"
                                className=" border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-lg"
                            >
                                Cancel
                            </button>
                            </div>

        </div>
    );
}
