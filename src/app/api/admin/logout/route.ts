import { NextResponse } from 'next/server';

// Admin oturum çerezlerini siler
export async function POST() {
  const response = NextResponse.json({ success: true });
  for (const name of ['admin_session', 'admin_token']) {
    response.cookies.set({ name, value: '', path: '/', maxAge: 0 });
  }
  return response;
}
