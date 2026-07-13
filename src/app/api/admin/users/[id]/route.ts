import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { ADMIN_PERMISSIONS, canManageUsers, getAdminSession, normalizePermissions } from '@/lib/admin-auth';
import { Prisma } from '@/generated/prisma';

const ROLE_LABELS = new Set(['super_admin', 'admin', 'editor', 'viewer']);

function parsePermissions(value: unknown) {
  const requested = normalizePermissions(value);
  return requested.filter(permission => ADMIN_PERMISSIONS.includes(permission as typeof ADMIN_PERMISSIONS[number]));
}

function sanitizeAdminUser(user: {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  permissions: string;
  status: string;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...user,
    permissions: normalizePermissions(user.permissions),
  };
}

function isPrismaKnownError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!canManageUsers(session)) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const role = ROLE_LABELS.has(body.role) ? body.role : 'editor';
  const permissions = role === 'super_admin' ? [...ADMIN_PERMISSIONS] : parsePermissions(body.permissions);
  const password = String(body.password || '');

  if (session?.id === id && body.status === 'passive') {
    return NextResponse.json({ error: 'Kendi hesabınızı pasife alamazsınız.' }, { status: 400 });
  }

  const data: {
    name: string;
    username: string;
    email: string;
    role: string;
    status: string;
    permissions: string;
    password?: string;
  } = {
    name: String(body.name || '').trim(),
    username: String(body.username || '').trim(),
    email: String(body.email || '').trim().toLowerCase(),
    role,
    status: body.status === 'passive' ? 'passive' : 'active',
    permissions: JSON.stringify(permissions),
  };

  if (!data.name || !data.username || !data.email) {
    return NextResponse.json({ error: 'Ad, kullanıcı adı ve e-posta zorunlu.' }, { status: 400 });
  }

  if (password) {
    if (password.length < 8) {
      return NextResponse.json({ error: 'Şifre en az 8 karakter olmalı.' }, { status: 400 });
    }
    data.password = await bcrypt.hash(password, 12);
  }

  try {
    const user = await prisma.adminUser.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        permissions: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user: sanitizeAdminUser(user) });
  } catch (error: unknown) {
    if (isPrismaKnownError(error) && error.code === 'P2002') {
      return NextResponse.json({ error: 'Bu kullanıcı adı veya e-posta zaten kullanılıyor.' }, { status: 409 });
    }

    console.error('Admin User Update Error:', error);
    return NextResponse.json({ error: 'Kullanıcı güncellenemedi.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!canManageUsers(session)) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 });
  }

  const { id } = await params;
  if (session?.id === id) {
    return NextResponse.json({ error: 'Kendi hesabınızı silemezsiniz.' }, { status: 400 });
  }

  await prisma.adminUser.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
