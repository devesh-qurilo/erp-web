// app/api/holidays/[id]/route.ts
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Missing Authorization Header" }, { status: 401 });
    }

    const body = await req.json();

    const response = await fetch(
      `https://chat.swiftandgo.in/employee/api/holidays/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to update holiday" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
