"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface ChatRoom {
  id: string;
  participant1Id: string;
  participant2Id: string;
  participant1Details: {
    employeeId: string;
    name: string;
    profileUrl: string | null;
    designation: string | null;
    department: string | null;
  };
  participant2Details: {
    employeeId: string;
    name: string;
    profileUrl: string | null;
    designation: string | null;
    department: string | null;
  };
  lastMessage?: {
    content: string | null;
    messageType: "TEXT" | "FILE";
    fileAttachment?: {
      fileName: string;
      fileUrl: string;
    } | null;
    createdAt: string;
  };
  unreadCount: number;
}

export default function ChatRoomsList() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("No access token found. Please log in.");
          return;
        }
        const res = await fetch("/api/chats/rooms", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch chat rooms");
        const data = await res.json();
        setRooms(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading chats...</p>;

  if (!rooms.length)
    return <p className="text-center text-gray-500">No chat rooms found.</p>;

  const currentUserId = "EMP-009"; // from auth/session in real case

  return (
    <div className="space-y-3 p-4">
      {rooms.map((room) => {
        const partner =
          room.participant1Details.employeeId === currentUserId
            ? room.participant2Details
            : room.participant1Details;

        return (
          <Link
            key={room.id}
            href={`/messages/${partner.employeeId}`} // 👈 Dynamic route
            className="flex items-center gap-3 bg-gray-100 hover:bg-gray-200 p-3 rounded-2xl shadow-sm cursor-pointer transition"
          >
            <Image
              src={partner.profileUrl || "/default-avatar.png"}
              alt={partner.name}
              width={48}
              height={48}
              className="rounded-full"
            />
            <div className="flex-1">
              <h3 className="font-semibold">{partner.name}</h3>
              <p className="text-sm text-gray-600 truncate">
                {room.lastMessage?.messageType === "FILE"
                  ? `📎 ${room.lastMessage.fileAttachment?.fileName}`
                  : room.lastMessage?.content || "No messages yet"}
              </p>
            </div>
            {room.unreadCount > 0 && (
              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                {room.unreadCount}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
