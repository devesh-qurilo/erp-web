import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // take accessToken from browser's localStorage equivalent (client must send it in headers)
    const accessToken = req.headers.get("authorization")?.replace("Bearer ", "");

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch("https://6jnqmj85-80.inc1.devtunnels.ms/employee/api/leaves", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
