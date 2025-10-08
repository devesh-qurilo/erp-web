

import { NextRequest, NextResponse } from "next/server";

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
      `https://6jnqmj85-8080.inc1.devtunnels.ms/clients/${id}/documents`,
   
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch client documents" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching client documents:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}



export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = authHeader.split(" ")[1];

    // Create new FormData to send to backend
    const backendForm = new FormData();
    backendForm.append("file", file);

    const backendRes = await fetch(`https://6jnqmj85-8080.inc1.devtunnels.ms/clients/${id}/documents`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        // ❌ Don’t manually set Content-Type here — fetch handles it with FormData
      },
      body: backendForm,
    });

    if (!backendRes.ok) {
      const text = await backendRes.text();
      return NextResponse.json(
        { error: text || "Failed to upload file" },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error uploading document:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = authHeader.split(" ")[1];
    const documentId = request.headers.get("Document-Id");

    if (!documentId) {
      return NextResponse.json({ error: "Missing Document-Id header" }, { status: 400 });
    }

    const backendRes = await fetch(`https://6jnqmj85-8080.inc1.devtunnels.ms/clients/${id}/documents/${documentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!backendRes.ok) {
      const text = await backendRes.text();
      return NextResponse.json({ error: text || "Failed to delete document" }, { status: backendRes.status });
    }

    return NextResponse.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
