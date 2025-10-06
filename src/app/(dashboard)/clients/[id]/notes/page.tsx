"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Note {
  id: number;
  clientId: number;
  title: string;
  detail: string;
  type: string;
  createdBy: string;
  createdAt: string;
}

export default function ClientNotesPage() {
  const { id } = useParams();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotes = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/clients/${id}/notes`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch notes");

      const data = await res.json();
      setNotes(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noteId: number) => {
    if (!id) return;

    try {
      const res = await fetch(`/api/clients/${id}/notes`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
          "Note-Id": noteId.toString(),
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete note");
      }

      // Remove note from state
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [id]);

  if (loading) return <p>Loading notes...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <Card key={note.id}>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>{note.title}</CardTitle>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(note.id)}
            >
              Delete
            </Button>
          </CardHeader>
          <CardContent>
            <p>{note.detail}</p>
            <p className="text-sm text-gray-500 mt-2">
              Type: {note.type} | By: {note.createdBy} | {new Date(note.createdAt).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
