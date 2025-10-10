// app/api/deals/get/[id]/comments/route.ts
import { NextRequest, NextResponse } from "next/server"

const BASE_URL = "https://6jnqmj85-8080.inc1.devtunnels.ms"

// GET: Fetch all comments for a deal
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dealId = params.id
    const authHeader = request.headers.get("Authorization")
    
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const accessToken = authHeader.split(" ")[1]

    const res = await fetch(`${BASE_URL}/deals/${dealId}/comments`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || `Failed to fetch comments: ${res.statusText}`)
    }

    const externalData = await res.json()
    const transformed = { data: Array.isArray(externalData) ? externalData : [] }
    return NextResponse.json(transformed)
  } catch (error: any) {
    console.error("[GET /comments] error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}