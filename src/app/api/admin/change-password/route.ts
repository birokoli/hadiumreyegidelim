import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { getAdminSession, hashLegacyAdminPassword } from '@/lib/admin-auth';

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

    const session = await getAdminSession();
    if (session && !session.legacy) {
      const admin = await prisma.adminUser.findUnique({ where: { id: session.id } });
      if (!admin || !await bcrypt.compare(currentPassword, admin.password)) {
        return NextResponse.json({ error: 'Mevcut şifre hatalı.' }, { status: 401 });
      }

      await prisma.adminUser.update({
        where: { id: session.id },
        data: {
          password: await bcrypt.hash(newPassword, 12),
          ...(newUsername?.trim() ? { username: newUsername.trim() } : {}),
        },
      });

      return NextResponse.json({ success: true });
    }

    // Verify legacy password
    const customPasswordSetting = await prisma.setting.findUnique({ where: { key: 'ADMIN_PASSWORD_HASH' } });
    const inputHash = hashLegacyAdminPassword(currentPassword);
    const fallbackValid = currentPassword === 'Harun.28122017';
    const hashValid = customPasswordSetting ? customPasswordSetting.value === inputHash : false;

    if (!fallbackValid && !hashValid) {
      return NextResponse.json({ error: 'Mevcut şifre hatalı.' }, { status: 401 });
    }

    // Save new password hash
    const newHash = hashLegacyAdminPassword(newPassword);
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
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
  }
}
