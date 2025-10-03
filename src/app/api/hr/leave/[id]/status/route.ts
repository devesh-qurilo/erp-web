import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json(); // { status: "APPROVED" } or { status: "REJECTED", rejectionReason: "..." }

    const accessToken = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiRes = await fetch(
      `https://6jnqmj85-8080.inc1.devtunnels.ms/employee/api/leaves/${id}/status`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await apiRes.json();
    return NextResponse.json(data, { status: apiRes.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
