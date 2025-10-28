import { type NextRequest, NextResponse } from "next/server"

const API_BASE = "https://chat.swiftandgo.in"


export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const authHeader = request.headers.get("authorization") || undefined
    
      const url = `${API_BASE}/admin/api/promotions/employee/${params.id}`
  
      const upstream = await fetch(url, {
        method: "GET",
        headers: {
          ...(authHeader ? { authorization: authHeader } : {}),
          "content-type": "application/json",
        },
        cache: "no-store",
      })
  
      const body = await upstream.text()
      const contentType = upstream.headers.get("content-type") || "application/json"
  
      return new Response(body, {
        status: upstream.status,
        headers: { "content-type": contentType },
      })
    } catch (e) {
      return new Response(JSON.stringify({ error: "Failed to fetch promotions" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      })
    }
  }
  

  export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      if (!params?.id) {
        return new Response(JSON.stringify({ error: "Missing employee ID" }), {
          status: 400,
          headers: { "content-type": "application/json" },
        })
      }
  
      const authHeader = request.headers.get("authorization") || undefined
      const body = await request.text()
  
      const url = `${API_BASE}/admin/api/promotions/employee/${encodeURIComponent(params.id)}`
  
      const upstream = await fetch(url, {
        method: "POST",
        headers: {
          ...(authHeader ? { authorization: authHeader } : {}),
          "content-type": "application/json",
        },
        body,
        cache: "no-store",
      })
  
      const responseBody = await upstream.text()
      const contentType = upstream.headers.get("content-type") || "application/json"
  
      return new Response(responseBody, {
        status: upstream.status,
        headers: { "content-type": contentType },
      })
    } catch (e) {
      console.error("Failed to create promotion:", e)
      return new Response(JSON.stringify({ error: "Failed to create promotion" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      })
    }
  }
  