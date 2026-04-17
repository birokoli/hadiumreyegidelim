import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import crypto from 'crypto';

function hashPassword(pw: string): string {
  return crypto.createHash('sha256').update(pw + 'hug-salt-2026').digest('hex');
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get('admin_session')?.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword, newUsername } = await request.json();

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: 'Yeni şifre en az 8 karakter olmalı.' }, { status: 400 });
    }

    // Verify current password
    const customPasswordSetting = await prisma.setting.findUnique({ where: { key: 'ADMIN_PASSWORD_HASH' } });
    const inputHash = hashPassword(currentPassword);
    const fallbackValid = currentPassword === 'Harun.28122017';
    const hashValid = customPasswordSetting ? customPasswordSetting.value === inputHash : false;

    if (!fallbackValid && !hashValid) {
      return NextResponse.json({ error: 'Mevcut şifre hatalı.' }, { status: 401 });
    }

    // Save new password hash
    const newHash = hashPassword(newPassword);
    await prisma.setting.upsert({
      where: { key: 'ADMIN_PASSWORD_HASH' },
      update: { value: newHash },
      create: { key: 'ADMIN_PASSWORD_HASH', value: newHash },
    });

    // Save username if provided
    if (newUsername && newUsername.trim()) {
      await prisma.setting.upsert({
        where: { key: 'ADMIN_USERNAME' },
        update: { value: newUsername.trim() },
        create: { key: 'ADMIN_USERNAME', value: newUsername.trim() },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
  }
}
