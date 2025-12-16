// "use client";

// import React, { useEffect, useState } from "react";
// import { X, MoreVertical, Upload } from "lucide-react";

// const BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE ||
//   "https://6jnqmj85-80.inc1.devtunnels.ms";

// /* ================= TYPES ================= */
// type MessageItem = {
//   id: number;
//   content?: string;
//   messageType: "TEXT" | "FILE";
//   fileUrl?: string;
//   fileName?: string;
//   createdAt: string;
//   sender?: {
//     name: string;
//     profileUrl?: string;
//   };
//   isBestReply?: boolean;
// };

// type DiscussionDetail = {
//   id: number;
//   title: string;
//   createdAt: string;
//   category: {
//     categoryName: string;
//     colorCode: string;
//   };
//   messages: MessageItem[];
// };

// export default function DiscussionDetailPage({
//   projectId,
//   roomId,
//   onClose,
// }: {
//   projectId: number;
//   roomId: number;
//   onClose?: () => void;
// }) {
//   /* ================= STATE ================= */
//   const [detail, setDetail] = useState<DiscussionDetail | null>(null);
//   const [reply, setReply] = useState("");
//   const [file, setFile] = useState<File | null>(null);
//   const [loading, setLoading] = useState(false);

//   /* ================= HELPERS ================= */
//   const formatTime = (dateStr: string) => {
//     const d = new Date(dateStr);
//     return `${d.toLocaleDateString("en-GB")} | ${d.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//     })}`;
//   };

//   /* ================= LOAD DETAIL ================= */
//   const loadDiscussionDetail = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch(
//         `${BASE_URL}/api/projects/${projectId}/discussion-rooms/${roomId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//           },
//         }
//       );
//       const data = await res.json();
//       setDetail(data);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadDiscussionDetail();
//   }, [roomId]);

//   /* ================= SEND REPLY ================= */
//   const sendReply = async () => {
//     if (!reply && !file) return;

//     const fd = new FormData();
//     if (reply) fd.append("content", reply);
//     if (file) fd.append("file", file);

//     await fetch(
//       `${BASE_URL}/api/projects/${projectId}/discussion-rooms/${roomId}/messages`,
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//         },
//         body: fd,
//       }
//     );

//     setReply("");
//     setFile(null);
//     loadDiscussionDetail();
//   };

//   if (!detail) return null;

//   return (
//     <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
//       {/* ================= HEADER ================= */}
//       <div className="flex justify-between items-center px-6 py-4 border-b">
//         <h3 className="text-lg font-medium">Discussion</h3>
//         <X className="cursor-pointer" onClick={onClose} />
//       </div>

//       {/* ================= TITLE ================= */}
//       <div className="px-6 py-4 border-b">
//         <div className="flex justify-between items-center">
//           <div>
//             <h2 className="font-medium text-lg">{detail.title}</h2>
//             <p className="text-sm text-gray-400">
//               Requested On {formatTime(detail.createdAt)}
//             </p>
//           </div>

//           <span className="flex items-center gap-2 text-sm">
//             <span
//               className="h-2 w-2 rounded-full"
//               style={{ background: detail.category.colorCode }}
//             />
//             {detail.category.categoryName}
//           </span>
//         </div>
//       </div>

//       {/* ================= MESSAGES ================= */}
//       <div className="px-6 py-4 space-y-4">
//         {detail.messages?.map((m) => (
//           <div key={m.id} className="border rounded-lg p-4">
//             <div className="flex justify-between items-start">
//               <div className="flex gap-3">
//                 <img
//                   src={m.sender?.profileUrl || "/avatar.png"}
//                   className="h-9 w-9 rounded-full"
//                 />
//                 <div>
//                   <p className="font-medium">{m.sender?.name}</p>
//                   <p className="text-sm text-gray-500">
//                     {m.content}
//                   </p>

//                   {m.messageType === "FILE" && (
//                     <img
//                       src={m.fileUrl}
//                       className="h-24 mt-2 rounded"
//                     />
//                   )}
//                 </div>
//               </div>

//               <div className="text-xs text-gray-400 flex items-center gap-2">
//                 {m.isBestReply && (
//                   <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded">
//                     Best Reply
//                   </span>
//                 )}
//                 {formatTime(m.createdAt)}
//                 <MoreVertical size={16} />
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* ================= REPLY BOX ================= */}
//       <div className="border-t px-6 py-4">
//         <label className="block text-sm font-medium mb-2">Reply *</label>
//         <textarea
//           value={reply}
//           onChange={(e) => setReply(e.target.value)}
//           className="border rounded px-3 py-2 w-full mb-3 min-h-[80px]"
//         />

//         <label className="border border-dashed rounded flex flex-col items-center justify-center py-6 cursor-pointer text-gray-400 mb-4">
//           <Upload />
//           <span className="text-sm mt-2">Choose a file</span>
//           <input
//             type="file"
//             hidden
//             onChange={(e) => setFile(e.target.files?.[0] || null)}
//           />
//         </label>

//         <div className="flex justify-end">
//           <button
//             onClick={sendReply}
//             className="bg-blue-600 text-white px-6 py-2 rounded"
//           >
//             Reply
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import React, { useEffect, useState } from "react";
import { X, MoreVertical, Upload, FileText } from "lucide-react";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://6jnqmj85-80.inc1.devtunnels.ms";

/* ================= TYPES ================= */
type MessageItem = {
  id: number;
  content?: string;
  messageType: "TEXT" | "FILE";
  fileUrl?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  createdAt: string;
  sender?: {
    name: string;
    profileUrl?: string;
  };
  isBestReply?: boolean;
};

type DiscussionDetail = {
  id: number;
  title: string;
  createdAt: string;
  category: {
    categoryName: string;
    colorCode: string;
  };
};

/* ================= COMPONENT ================= */
export default function DiscussionDetailPage({
  projectId,
  roomId,
  onClose,
}: {
  projectId: number;
  roomId: number;
  onClose?: () => void;
}) {
  /* ================= STATE ================= */
  const [detail, setDetail] = useState<DiscussionDetail | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [reply, setReply] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  /* ================= HELPERS ================= */
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString("en-GB")} | ${d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const isImage = (mime?: string | null) =>
    mime?.startsWith("image/");

  /* ================= LOAD DETAIL ================= */
  const loadDiscussionDetail = async () => {
    const res = await fetch(
      `${BASE_URL}/api/projects/${projectId}/discussion-rooms/${roomId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
    const data = await res.json();
    setDetail(data);
  };

  /* ================= LOAD MESSAGES (NEW API) ================= */
  const loadMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${BASE_URL}/api/projects/discussion-rooms/${roomId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      const data = await res.json();
      setMessages(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiscussionDetail();
    loadMessages();
  }, [roomId]);

  /* ================= SEND REPLY ================= */
  const sendReply = async () => {
    if (!reply && !file) return;

    const fd = new FormData();
    if (reply) fd.append("content", reply);
    if (file) fd.append("file", file);

    await fetch(
      `${BASE_URL}/api/projects/${projectId}/discussion-rooms/${roomId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: fd,
      }
    );

    setReply("");
    setFile(null);
    loadMessages();
  };

  if (!detail) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <h3 className="text-lg font-medium">Discussion</h3>
        <X className="cursor-pointer" onClick={onClose} />
      </div>

      {/* ================= TITLE ================= */}
      <div className="px-6 py-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-medium text-lg">{detail.title}</h2>
            <p className="text-sm text-gray-400">
              Requested On {formatTime(detail.createdAt)}
            </p>
          </div>

          <span className="flex items-center gap-2 text-sm">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: detail.category.colorCode }}
            />
            {detail.category.categoryName}
          </span>
        </div>
      </div>

      {/* ================= MESSAGES ================= */}
      <div className="px-6 py-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <img
                  src={m.sender?.profileUrl || "/avatar.png"}
                  className="h-9 w-9 rounded-full"
                />

                <div>
                  <p className="font-medium">{m.sender?.name}</p>

                  {/* TEXT */}
                  {m.messageType === "TEXT" && (
                    <p className="text-sm text-gray-600 mt-1">
                      {m.content}
                    </p>
                  )}

                  {/* FILE */}
                  {m.messageType === "FILE" && m.fileUrl && (
                    <>
                      {isImage(m.mimeType) ? (
                        <img
                          src={m.fileUrl}
                          className="h-28 mt-2 rounded border"
                        />
                      ) : (
                        <a
                          href={m.fileUrl}
                          target="_blank"
                          className="flex items-center gap-2 mt-2 border rounded p-2 text-sm text-blue-600"
                        >
                          <FileText size={16} />
                          {m.fileName}
                        </a>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-400 flex items-center gap-2">
                {m.isBestReply && (
                  <span className="bg-green-500 text-white px-2 py-0.5 rounded">
                    Best Reply
                  </span>
                )}
                {formatTime(m.createdAt)}
                <MoreVertical size={16} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= REPLY BOX ================= */}
      <div className="border-t px-6 py-4">
        <label className="block text-sm font-medium mb-2">Reply *</label>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          className="border rounded px-3 py-2 w-full mb-3 min-h-[80px]"
        />

        <label className="border border-dashed rounded flex flex-col items-center justify-center py-6 cursor-pointer text-gray-400 mb-4">
          <Upload />
          <span className="text-sm mt-2">
            {file ? file.name : "Choose a file"}
          </span>
          <input
            type="file"
            hidden
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>

        <div className="flex justify-end">
          <button
            onClick={sendReply}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            Reply
          </button>
        </div>
      </div>
    </div>
  );
}
