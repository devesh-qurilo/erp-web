// app/api/deals/get/[id]/tags/route.ts
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

const BASE_URL = "https://6jnqmj85-8080.inc1.devtunnels.ms";

/* -------------------------------------------------
   GET – fetch existing tags (unchanged)
   ------------------------------------------------- */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dealId = params.id;

    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const accessToken = authHeader.split(" ")[1];

    const res = await fetch(`${BASE_URL}/deals/${dealId}/tags`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to fetch tags: ${res.statusText}`);
    }

    const externalData = await res.json();
    const transformed = { data: Array.isArray(externalData) ? externalData : [] };
    return NextResponse.json(transformed);
  } catch (error: any) {
    console.error("[GET /tags] error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dealId = params.id;

    // ---- 1. Auth ----
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const accessToken = authHeader.split(" ")[1];

    // ---- 2. Parse body ----
    const body = await request.json();
    if (!body || typeof body.tagName !== "string" || !body.tagName.trim()) {
      return NextResponse.json(
        { error: "Invalid payload – send { tagName: string }" },
        { status: 400 }
      );
    }

    const tagName = body.tagName.trim();

    // ---- 3. Forward POST to external API ----
    const res = await fetch(`${BASE_URL}/deals/${dealId}/tags`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ tagName }),
    });

    // ---- 4. Safely handle response ----
    const raw = await res.text();
    let result: any = null;

    // Try to parse JSON if possible
    try {
      result = JSON.parse(raw);
    } catch {
      // not JSON, likely plain "Success"
    }

    if (!res.ok) {
      const msg =
        (result && result.message) ||
        raw ||
        `Failed to add tag: ${res.statusText}`;
      throw new Error(msg);
    }

    // If we got a plain "Success" response, re-fetch the updated tags
    if (!result || typeof result === "string") {
      const refetch = await fetch(`${BASE_URL}/deals/${dealId}/tags`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const refetchText = await refetch.text();
      try {
        result = JSON.parse(refetchText);
      } catch {
        throw new Error("Failed to parse tags from refetch response");
      }
    }

    // ---- 5. Return consistent structure ----
    return NextResponse.json({
      data: Array.isArray(result) ? result : [],
    });
  } catch (error: any) {
    console.error("[POST /tags] error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}