import { NextRequest, NextResponse } from 'next/server';

const API_URL = 'https://6jnqmj85-80.inc1.devtunnels.ms/employee?page=0&size=20';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization'); // optional if your external API requires it

    const res = await fetch(API_URL, {
      headers: {
        'Authorization': token || '',
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
