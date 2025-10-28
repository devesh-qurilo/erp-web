import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = authHeader.split(" ")[1];
    const body = await request.json();

    console.log("🟡 PUT /api/deals/create/[id]", params.id, body);

    const res = await fetch(`https://chat.swiftandgo.in/deals/${params.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("🟠 Remote API response:", res.status, res.statusText);

    const text = await res.text();
    console.log("🔵 Remote API raw body:", text);

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream failed: ${res.status} ${res.statusText}`, details: text },
        { status: res.status }
      );
    }

    return NextResponse.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Error updating deal:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
