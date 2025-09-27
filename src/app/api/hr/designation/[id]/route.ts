import { NextRequest, NextResponse } from 'next/server';

const API_URL = 'https://6jnqmj85-8080.inc1.devtunnels.ms/admin/designations';

// ✅ GET single designation
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization');
    if (!token) return NextResponse.json({ error: 'Authorization token missing' }, { status: 401 });

    const res = await fetch(`${API_URL}/${params.id}`, {
      method: 'GET',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) throw new Error('Failed to fetch designation from external API');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch designation' }, { status: 500 });
  }
}

// ✅ PUT update designation
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization');
    if (!token) return NextResponse.json({ error: 'Authorization token missing' }, { status: 401 });

    const body = await request.json();
    const res = await fetch(`${API_URL}/${params.id}`, {
      method: 'PUT',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error('Failed to update designation in external API');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update designation' }, { status: 500 });
  }
}

// ✅ DELETE designation
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization');
    if (!token) return NextResponse.json({ error: 'Authorization token missing' }, { status: 401 });

    const res = await fetch(`${API_URL}/${params.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) throw new Error('Failed to delete designation in external API');
    return NextResponse.json({ message: 'Designation deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete designation' }, { status: 500 });
  }
}
