"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

interface Message {
  id: number;
  chatRoomId: string;
  senderId: string;
  receiverId: string;
  content: string | null;
  messageType: "TEXT" | "FILE";
  fileAttachment?: {
    fileName: string;
    fileUrl: string;
  } | null;
  createdAt: string;
  senderDetails: {
    employeeId: string;
    name: string;
    profileUrl: string | null;
  };
  receiverDetails: {
    employeeId: string;
    name: string;
    profileUrl: string | null;
  };
}

interface ChatWindowProps {
  receiverId: string; // e.g. "EMP-008"
  employeeid: string; // e.g. "EMP-009"
}

export default function ChatWindow({ receiverId, employeeid }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!receiverId) {
      setError("Receiver ID is missing");
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("No access token found. Please log in.");
          return;
        }
        const res = await fetch(`/api/chats/history/${receiverId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch messages");
        }
        const data = await res.json();
        setMessages(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [receiverId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) return <p className="text-center text-gray-500">Loading chat...</p>;

  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="flex flex-col h-[80vh] bg-gray-50 rounded-2xl shadow p-4 overflow-y-auto">
      {messages.length === 0 && (
        <p className="text-center text-gray-400 mt-10">No messages yet</p>
      )}

      {messages.map((msg) => {
        const isSender = msg.senderId === employeeid;

        return (
          <div
            key={msg.id}
            className={`flex items-end mb-3 ${
              isSender ? "justify-end" : "justify-start"
            }`}
          >
            {!isSender && msg.senderDetails.profileUrl && (
              <Image
                src={msg.senderDetails.profileUrl}
                alt={msg.senderDetails.name}
                width={35}
                height={35}
                className="rounded-full mr-2"
              />
            )}

            <div
              className={`max-w-xs p-3 rounded-2xl text-sm ${
                isSender
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              {msg.messageType === "TEXT" && <p>{msg.content}</p>}

              {msg.messageType === "FILE" && msg.fileAttachment && (
                <a
                  href={msg.fileAttachment.fileUrl}
                  target="_blank"
                  className="underline text-blue-200"
                >
                  📎 {msg.fileAttachment.fileName}
                </a>
              )}

              <p className="text-[10px] text-right mt-1 opacity-70">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </p>
            </div>

            {isSender && msg.senderDetails.profileUrl && (
              <Image
                src={msg.senderDetails.profileUrl}
                alt={msg.senderDetails.name}
                width={35}
                height={35}
                className="rounded-full ml-2"
              />
            )}
          </div>
        );
      })}

      <div ref={messagesEndRef} />
    </div>
  );
}