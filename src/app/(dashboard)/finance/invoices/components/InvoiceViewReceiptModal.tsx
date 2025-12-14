


// "use client";

// import { useEffect, useState } from "react";
// import Modal from "./Modal";
// import InvoiceReceiptModal from "./InvoiceReceiptModal"; // ✅ ADD RECEIPT FORM
// import { Button } from "@/components/ui/button";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { MoreVertical, Plus } from "lucide-react";

// const BASE_URL = "https://6jnqmj85-80.inc1.devtunnels.ms";

// export default function InvoiceViewReceiptModal({
//   open,
//   onClose,
//   invoice,
// }: {
//   open: boolean;
//   onClose: () => void;
//   invoice: any;
// }) {
//   const [receipts, setReceipts] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);

//   // ✅ Add Receipt Modal state
//   const [showAddReceipt, setShowAddReceipt] = useState(false);

//   // 🔥 FINAL + GUARANTEED fetch logic
//   async function loadReceipts() {
//     const invoiceId =
//       invoice?.invoiceId ||
//       invoice?.invoiceNumber ||
//       invoice?.invoiceNo;

//     if (!invoiceId) {
//       setReceipts([]);
//       return;
//     }

//     try {
//       setLoading(true);
//       const res = await fetch(
//         `${BASE_URL}/api/invoice/receipt/${invoiceId}`,
//         {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//         },
//       });


//     //   );
//       const text = await res.text();
//       if (!text) {
//         setReceipts([]);
//         return;
//       }
//       const data = JSON.parse(text);
//       setReceipts(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("❌ Failed to load receipts", err);
//       setReceipts([]);
//     } finally {
//       setLoading(false);
//     }
//   }

//   // ✅ Reload when modal opens
//   useEffect(() => {
//     if (open) {
//       loadReceipts();
//     }
//   }, [open, invoice]);

//   if (!invoice) return null;

//   return (
//     <>
//       {/* ================= VIEW RECEIPTS MODAL ================= */}
//       <Modal
//         open={open}
//         onClose={onClose}
//         title="Receipts"
//         className="max-w-6xl"
//       >
//         {/* Add Receipt Button */}
//         <div className="mb-4">
//           <Button onClick={() => setShowAddReceipt(true)}>
//             <Plus className="w-4 h-4 mr-2" />
//             Add a Receipt
//           </Button>
//         </div>

//         {/* Table */}
//         <div className="border rounded-lg overflow-hidden">
//           <Table>
//             <TableHeader className="bg-blue-50">
//               <TableRow>
//                 <TableHead>Invoice No.</TableHead>
//                 <TableHead>Product</TableHead>
//                 <TableHead>Client</TableHead>
//                 <TableHead>Amount</TableHead>
//                 <TableHead>Issue Date</TableHead>
//                 <TableHead className="text-right">Action</TableHead>
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {loading && (
//                 <TableRow>
//                   <TableCell
//                     colSpan={6}
//                     className="text-center text-sm text-gray-500"
//                   >
//                     Loading receipts...
//                   </TableCell>
//                 </TableRow>
//               )}

//               {!loading && receipts.length === 0 && (
//                 <TableRow>
//                   <TableCell
//                     colSpan={6}
//                     className="text-center text-sm text-gray-500"
//                   >
//                     No receipts available
//                   </TableCell>
//                 </TableRow>
//               )}

//               {!loading &&
//                 receipts.map((r) => (
//                   <TableRow key={r.id}>
//                     <TableCell>{r.invoiceId}</TableCell>
//                     <TableCell>{r.productName}</TableCell>
//                     <TableCell>{r.buyerCleintName}</TableCell>
//                     <TableCell>
//                       {r.currency} {r.totalAmount}
//                     </TableCell>
//                     <TableCell>
//                       {new Date(r.issueDate).toLocaleDateString()}
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                           <Button variant="ghost" size="icon">
//                             <MoreVertical className="w-4 h-4" />
//                           </Button>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent align="end">
//                           <DropdownMenuItem>View</DropdownMenuItem>
//                           <DropdownMenuItem>Edit</DropdownMenuItem>
//                           <DropdownMenuItem className="text-red-600">
//                             Delete
//                           </DropdownMenuItem>
//                         </DropdownMenuContent>
//                       </DropdownMenu>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//             </TableBody>
//           </Table>
//         </div>
//       </Modal>

//       {/* ================= ADD RECEIPT MODAL ================= */}
//       <InvoiceReceiptModal
//         open={showAddReceipt}
//         invoice={invoice}
//         onClose={() => {
//           setShowAddReceipt(false);
//           loadReceipts(); // 🔥 auto refresh after add
//         }}
//       />
//     </>
//   );
// }


// "use client";

// import { useEffect, useState } from "react";
// import Modal from "./Modal";
// import InvoiceReceiptModal from "./InvoiceReceiptModal";
// import { Button } from "@/components/ui/button";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { MoreVertical, Plus, Eye, Download, Trash } from "lucide-react";

// const BASE_URL = "https://6jnqmj85-80.inc1.devtunnels.ms";

// export default function InvoiceViewReceiptModal({
//   open,
//   onClose,
//   invoice,
// }: {
//   open: boolean;
//   onClose: () => void;
//   invoice: any;
// }) {
//   const [receipts, setReceipts] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [showAddReceipt, setShowAddReceipt] = useState(false);

//   async function loadReceipts() {
//     const invoiceId =
//       invoice?.invoiceId ||
//       invoice?.invoiceNumber ||
//       invoice?.invoiceNo;

//     if (!invoiceId) {
//       setReceipts([]);
//       return;
//     }

//     try {
//       setLoading(true);
//       const res = await fetch(
//         `${BASE_URL}/api/invoice/receipt/${invoiceId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//           },
//         }
//       );

//       const text = await res.text();
//       if (!text) {
//         setReceipts([]);
//         return;
//       }
//       const data = JSON.parse(text);
//       setReceipts(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("❌ Failed to load receipts", err);
//       setReceipts([]);
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     if (open) {
//       loadReceipts();
//     }
//   }, [open, invoice]);

//   if (!invoice) return null;

//   return (
//     <>
//       <Modal
//         open={open}
//         onClose={onClose}
//         title="Receipts"
//         className="max-w-6xl"
//       >
//         <div className="mb-4">
//           <Button onClick={() => setShowAddReceipt(true)}>
//             <Plus className="w-4 h-4 mr-2" />
//             Add a Receipt
//           </Button>
//         </div>

//         <div className="border rounded-lg overflow-hidden">
//           <Table>
//             <TableHeader className="bg-blue-50">
//               <TableRow>
//                 <TableHead>Invoice No.</TableHead>
//                 <TableHead>Product</TableHead>
//                 <TableHead>Client</TableHead>
//                 <TableHead>Amount</TableHead>
//                 <TableHead>Issue Date</TableHead>
//                 <TableHead className="text-right">Action</TableHead>
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {loading && (
//                 <TableRow>
//                   <TableCell colSpan={6} className="text-center text-sm text-gray-500">
//                     Loading receipts...
//                   </TableCell>
//                 </TableRow>
//               )}

//               {!loading && receipts.length === 0 && (
//                 <TableRow>
//                   <TableCell colSpan={6} className="text-center text-sm text-gray-500">
//                     No receipts available
//                   </TableCell>
//                 </TableRow>
//               )}

//               {!loading &&
//                 receipts.map((r) => (
//                   <TableRow key={r.id}>
//                     <TableCell>{r.invoiceId}</TableCell>
//                     <TableCell>{r.productName}</TableCell>
//                     <TableCell>{r.buyerCleintName}</TableCell>
//                     <TableCell>
//                       {r.currency} {r.totalAmount}
//                     </TableCell>
//                     <TableCell>
//                       {new Date(r.issueDate).toLocaleDateString()}
//                     </TableCell>

//                     {/* ✅ UPDATED ACTION MENU */}
//                     <TableCell className="text-right">
//                       <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                           <Button variant="ghost" size="icon">
//                             <MoreVertical className="w-4 h-4" />
//                           </Button>
//                         </DropdownMenuTrigger>

//                         <DropdownMenuContent align="end">
//                           <DropdownMenuItem
//                             onClick={() => window.open(r.viewUrl || "#", "_blank")}
//                           >
//                             <Eye className="w-4 h-4 mr-2" />
//                             View
//                           </DropdownMenuItem>

//                           <DropdownMenuItem
//                             onClick={() =>
//                               window.open(r.pdfUrl || r.fileUrl || "#", "_blank")
//                             }
//                           >
//                             <Download className="w-4 h-4 mr-2" />
//                             Download as PDF
//                           </DropdownMenuItem>

//                           <DropdownMenuItem
//                             className="text-red-600"
//                             onClick={() => console.log("Delete receipt", r.id)}
//                           >
//                             <Trash className="w-4 h-4 mr-2" />
//                             Delete
//                           </DropdownMenuItem>
//                         </DropdownMenuContent>
//                       </DropdownMenu>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//             </TableBody>
//           </Table>
//         </div>
//       </Modal>

//       <InvoiceReceiptModal
//         open={showAddReceipt}
//         invoice={invoice}
//         onClose={() => {
//           setShowAddReceipt(false);
//           loadReceipts();
//         }}
//       />
//     </>
//   );
// }




// "use client";

// import { useEffect, useState } from "react";
// import Modal from "./Modal";
// import InvoiceReceiptModal from "./InvoiceReceiptModal";
// import { Button } from "@/components/ui/button";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   MoreVertical,
//   Plus,
//   Eye,
//   Download,
//   Trash,
// } from "lucide-react";

// const BASE_URL = "https://6jnqmj85-80.inc1.devtunnels.ms";

// export default function InvoiceViewReceiptModal({
//   open,
//   onClose,
//   invoice,
// }: {
//   open: boolean;
//   onClose: () => void;
//   invoice: any;
// }) {
//   const [receipts, setReceipts] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [showAddReceipt, setShowAddReceipt] = useState(false);

//   // ✅ VIEW MODAL STATE
//   const [viewReceipt, setViewReceipt] = useState<any>(null);

//   async function loadReceipts() {
//     const invoiceId =
//       invoice?.invoiceId ||
//       invoice?.invoiceNumber ||
//       invoice?.invoiceNo;

//     if (!invoiceId) {
//       setReceipts([]);
//       return;
//     }

//     try {
//       setLoading(true);
//       const res = await fetch(
//         `${BASE_URL}/api/invoice/receipt/${invoiceId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//           },
//         }
//       );

//       const text = await res.text();
//       if (!text) {
//         setReceipts([]);
//         return;
//       }
//       const data = JSON.parse(text);
//       setReceipts(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("❌ Failed to load receipts", err);
//       setReceipts([]);
//     } finally {
//       setLoading(false);
//     }
//   }

//   // ✅ DELETE RECEIPT
//   async function deleteReceipt(id: string) {
//     if (!confirm("Are you sure you want to delete this receipt?")) return;

//     await fetch(`${BASE_URL}/api/invoice/receipt/${id}`, {
//       method: "DELETE",
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//       },
//     });

//     loadReceipts();
//   }

//   // ✅ DOWNLOAD PDF
//   function downloadPDF(r: any) {
//     window.open(
//       `${BASE_URL}/api/invoice/receipt/pdf/${r.id}`,
//       "_blank"
//     );
//   }

//   useEffect(() => {
//     if (open) loadReceipts();
//   }, [open, invoice]);

//   if (!invoice) return null;

//   return (
//     <>
//       {/* ================= RECEIPT LIST MODAL ================= */}
//       <Modal open={open} onClose={onClose} title="Receipts" className="max-w-6xl">
//         <div className="mb-4">
//           <Button onClick={() => setShowAddReceipt(true)}>
//             <Plus className="w-4 h-4 mr-2" />
//             Add a Receipt
//           </Button>
//         </div>

//         <div className="border rounded-lg overflow-hidden">
//           <Table>
//             <TableHeader className="bg-blue-50">
//               <TableRow>
//                 <TableHead>Invoice No.</TableHead>
//                 <TableHead>Product</TableHead>
//                 <TableHead>Client</TableHead>
//                 <TableHead>Amount</TableHead>
//                 <TableHead>Issue Date</TableHead>
//                 <TableHead className="text-right">Action</TableHead>
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {loading && (
//                 <TableRow>
//                   <TableCell colSpan={6} className="text-center text-sm text-gray-500">
//                     Loading receipts...
//                   </TableCell>
//                 </TableRow>
//               )}

//               {!loading && receipts.length === 0 && (
//                 <TableRow>
//                   <TableCell colSpan={6} className="text-center text-sm text-gray-500">
//                     No receipts available
//                   </TableCell>
//                 </TableRow>
//               )}

//               {!loading &&
//                 receipts.map((r) => (
//                   <TableRow key={r.id}>
//                     <TableCell>{r.invoiceId}</TableCell>
//                     <TableCell>{r.productName}</TableCell>
//                     <TableCell>{r.buyerCleintName}</TableCell>
//                     <TableCell>
//                       {r.currency} {r.totalAmount}
//                     </TableCell>
//                     <TableCell>
//                       {new Date(r.issueDate).toLocaleDateString()}
//                     </TableCell>

//                     <TableCell className="text-right">
//                       <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                           <Button variant="ghost" size="icon">
//                             <MoreVertical className="w-4 h-4" />
//                           </Button>
//                         </DropdownMenuTrigger>

//                         <DropdownMenuContent align="end">
//                           <DropdownMenuItem onClick={() => setViewReceipt(r)}>
//                             <Eye className="w-4 h-4 mr-2" />
//                             View
//                           </DropdownMenuItem>

//                           <DropdownMenuItem onClick={() => downloadPDF(r)}>
//                             <Download className="w-4 h-4 mr-2" />
//                             Download as PDF
//                           </DropdownMenuItem>

//                           <DropdownMenuItem
//                             className="text-red-600"
//                             onClick={() => deleteReceipt(r.id)}
//                           >
//                             <Trash className="w-4 h-4 mr-2" />
//                             Delete
//                           </DropdownMenuItem>
//                         </DropdownMenuContent>
//                       </DropdownMenu>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//             </TableBody>
//           </Table>
//         </div>
//       </Modal>

//       {/* ================= VIEW RECEIPT MODAL (IMAGE JAISE UI) ================= */}
//       {viewReceipt && (
//         <Modal
//           open={true}
//           onClose={() => setViewReceipt(null)}
//           title={viewReceipt.invoiceId}
//           className="max-w-4xl"
//         >
//           <div className="border p-6 bg-white text-sm">
//             <h2 className="text-lg font-semibold mb-2">Proforma Invoice</h2>
//             <p>Invoice No.: {viewReceipt.invoiceId}</p>
//             <p>Issue Date: {new Date(viewReceipt.issueDate).toDateString()}</p>

//             <div className="grid grid-cols-2 gap-6 mt-4 border p-4">
//               <div>
//                 <h3 className="font-semibold mb-1">Seller</h3>
//                 <p>{viewReceipt.sellerCompanyName}</p>
//                 <p>{viewReceipt.sellerCompanyAddress}</p>
//                 <p>Bank: {viewReceipt.sellerCompanyBankName}</p>
//               </div>

//               <div>
//                 <h3 className="font-semibold mb-1">Buyer</h3>
//                 <p>{viewReceipt.buyerCompanyName}</p>
//                 <p>{viewReceipt.buyerCompanyAddress}</p>
//                 <p>Client: {viewReceipt.buyerCleintName}</p>
//               </div>
//             </div>

//             <div className="mt-4 text-right font-semibold">
//               Total: {viewReceipt.currency} {viewReceipt.totalAmount}
//             </div>
//           </div>
//         </Modal>
//       )}

//       {/* ================= ADD RECEIPT MODAL ================= */}
//       <InvoiceReceiptModal
//         open={showAddReceipt}
//         invoice={invoice}
//         onClose={() => {
//           setShowAddReceipt(false);
//           loadReceipts();
//         }}
//       />
//     </>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import InvoiceReceiptModal from "./InvoiceReceiptModal";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Plus,
  Eye,
  Download,
  Trash,
} from "lucide-react";

const BASE_URL = "https://6jnqmj85-80.inc1.devtunnels.ms";

export default function InvoiceViewReceiptModal({
  open,
  onClose,
  invoice,
}: {
  open: boolean;
  onClose: () => void;
  invoice: any;
}) {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddReceipt, setShowAddReceipt] = useState(false);

  const [viewReceipt, setViewReceipt] = useState<any>(null);

  async function loadReceipts() {
    const invoiceId =
      invoice?.invoiceId ||
      invoice?.invoiceNumber ||
      invoice?.invoiceNo;

    if (!invoiceId) {
      setReceipts([]);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${BASE_URL}/api/invoice/receipt/${invoiceId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      const text = await res.text();
      if (!text) {
        setReceipts([]);
        return;
      }
      const data = JSON.parse(text);
      setReceipts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Failed to load receipts", err);
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  }

  async function deleteReceipt(id: string) {
    if (!confirm("Are you sure you want to delete this receipt?")) return;

    await fetch(`${BASE_URL}/api/invoice/receipt/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    loadReceipts();
  }

  // ✅ UPDATED PDF DOWNLOAD (PI FORMAT – SAME AS ATTACHED PDF)
  function downloadPDF(r: any) {
    const createdIdInr = r.createdIdInr || r.id;

    window.open(
      `${BASE_URL}/api/invoice/${createdIdInr}/pdf?disposition=attachment`,
      "_blank"
    );
  }

  useEffect(() => {
    if (open) loadReceipts();
  }, [open, invoice]);

  if (!invoice) return null;

  return (
    <>
      <Modal open={open} onClose={onClose} title="Receipts" className="max-w-6xl">
        <div className="mb-4">
          <Button onClick={() => setShowAddReceipt(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add a Receipt
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-blue-50">
              <TableRow>
                <TableHead>Invoice No.</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-gray-500">
                    Loading receipts...
                  </TableCell>
                </TableRow>
              )}

              {!loading && receipts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-gray-500">
                    No receipts available
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                receipts.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.invoiceId}</TableCell>
                    <TableCell>{r.productName}</TableCell>
                    <TableCell>{r.buyerCleintName}</TableCell>
                    <TableCell>
                      {r.currency} {r.totalAmount}
                    </TableCell>
                    <TableCell>
                      {new Date(r.issueDate).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewReceipt(r)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => downloadPDF(r)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download as PDF
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => deleteReceipt(r.id)}
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </Modal>

      {viewReceipt && (
        <Modal
          open={true}
          onClose={() => setViewReceipt(null)}
          title={viewReceipt.invoiceId}
          className="max-w-4xl"
        >
          <div className="border p-6 bg-white text-sm">
            <h2 className="text-lg font-semibold mb-2">Proforma Invoice</h2>
            <p>Invoice No.: {viewReceipt.invoiceId}</p>
            <p>Issue Date: {new Date(viewReceipt.issueDate).toDateString()}</p>

            <div className="grid grid-cols-2 gap-6 mt-4 border p-4">
              <div>
                <h3 className="font-semibold mb-1">Seller</h3>
                <p>{viewReceipt.sellerCompanyName}</p>
                <p>{viewReceipt.sellerCompanyAddress}</p>
                <p>Bank: {viewReceipt.sellerCompanyBankName}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Buyer</h3>
                <p>{viewReceipt.buyerCompanyName}</p>
                <p>{viewReceipt.buyerCompanyAddress}</p>
                <p>Client: {viewReceipt.buyerCleintName}</p>
              </div>
            </div>

            <div className="mt-4 text-right font-semibold">
              Total: {viewReceipt.currency} {viewReceipt.totalAmount}
            </div>
          </div>
        </Modal>
      )}

      <InvoiceReceiptModal
        open={showAddReceipt}
        invoice={invoice}
        onClose={() => {
          setShowAddReceipt(false);
          loadReceipts();
        }}
      />
    </>
  );
}
