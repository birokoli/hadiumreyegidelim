import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET — list files
export async function GET() {
  const cookieStore = await cookies();
  if (cookieStore.get('admin_session')?.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await fetch(`${supabaseUrl}/storage/v1/object/list/uploads`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prefix: '', limit: 500, offset: 0, sortBy: { column: 'created_at', order: 'desc' } }),
      cache: 'no-store',
    });
    const files = await res.json();
    const clean = Array.isArray(files)
      ? files.filter((f: any) => f.name !== '.emptyFolderPlaceholder' && f.metadata)
      : [];
    return NextResponse.json(clean);
  } catch (err) {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}

// DELETE — remove a file
export async function DELETE(request: NextRequest) {
  const cookieStore = await cookies();
  if (cookieStore.get('admin_session')?.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { fileName } = await request.json();
  if (!fileName) return NextResponse.json({ error: 'fileName required' }, { status: 400 });

  try {
    const res = await fetch(`${supabaseUrl}/storage/v1/object/uploads/${encodeURIComponent(fileName)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
      },
    });
    if (!res.ok) {
      const body = await res.text();
      return NextResponse.json({ error: body }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
