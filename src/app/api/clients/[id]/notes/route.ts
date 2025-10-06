import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = authHeader.split(" ")[1];

    // Fetch notes from external API
    const response = await fetch(
      `https://6jnqmj85-8080.inc1.devtunnels.ms/clients/${id}/notes`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch client notes" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching client notes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const id = params.id;
  
      // Parse request body
      const body = await request.json();
      const { title, detail, type } = body;
  
      if (!title || !detail || !type) {
        return NextResponse.json(
          { error: "Title, detail, and type are required" },
          { status: 400 }
        );
      }
  
      // Get auth token from headers
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const accessToken = authHeader.split(" ")[1];
  
      // Call external API to create the note
      const response = await fetch(
        `https://6jnqmj85-8080.inc1.devtunnels.ms/clients/${id}/notes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ title, detail, type }),
        }
      );
  
      if (!response.ok) {
        const errData = await response.json();
        return NextResponse.json(
          { error: errData.error || "Failed to create note" },
          { status: response.status }
        );
      }
  
      const data = await response.json();
      return NextResponse.json(data, { status: 201 });
    } catch (error) {
      console.error("Error creating client note:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

  export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const id = params.id;
      const noteId = request.headers.get("Note-Id");
      if (!noteId) {
        return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
      }
  
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const accessToken = authHeader.split(" ")[1];
  
      const response = await fetch(
        `https://6jnqmj85-8080.inc1.devtunnels.ms/clients/${id}/notes/${noteId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
  
      // Handle empty response safely
      const text = await response.text();
      const data = text ? JSON.parse(text) : null;
  
      if (!response.ok) {
        return NextResponse.json(
          { error: data?.error || "Failed to delete note" },
          { status: response.status }
        );
      }
  
      return NextResponse.json({ message: "Note deleted successfully" });
    } catch (error) {
      console.error("Error deleting note:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }