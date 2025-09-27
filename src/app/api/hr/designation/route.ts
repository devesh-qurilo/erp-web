import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization'); // "Bearer <token>"

    if (!token) {
      return NextResponse.json({ error: 'Authorization token missing' }, { status: 401 });
    }

    const response = await fetch('https://6jnqmj85-8080.inc1.devtunnels.ms/admin/designations', {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch designations from external API');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch designations' }, { status: 500 });
  }
}
