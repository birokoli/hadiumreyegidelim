import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }

  return NextResponse.json({
    admin: {
      id: session.id,
      name: session.name,
      username: session.username,
      email: session.email,
      role: session.role,
      permissions: session.permissions,
      legacy: Boolean(session.legacy),
    },
  });
}
