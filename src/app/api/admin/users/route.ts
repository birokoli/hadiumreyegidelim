import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { ADMIN_PERMISSIONS, canManageUsers, getAdminSession, normalizePermissions } from '@/lib/admin-auth';
import { Prisma } from '@/generated/prisma';

const ROLE_LABELS = new Set(['super_admin', 'admin', 'editor', 'viewer']);

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

function parsePermissions(value: unknown) {
  const requested = normalizePermissions(value);
  return requested.filter(permission => ADMIN_PERMISSIONS.includes(permission as typeof ADMIN_PERMISSIONS[number]));
}

export async function GET() {
  const session = await getAdminSession();
  if (!canManageUsers(session)) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 });
  }

  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: 'desc' },
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

  return NextResponse.json({ users: users.map(sanitizeAdminUser), currentAdminId: session?.id });
}

function isPrismaKnownError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!canManageUsers(session)) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const username = String(body.username || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const role = ROLE_LABELS.has(body.role) ? body.role : 'editor';
    const status = body.status === 'passive' ? 'passive' : 'active';
    const permissions = role === 'super_admin' ? [...ADMIN_PERMISSIONS] : parsePermissions(body.permissions);

    if (!name || !username || !email || !password) {
      return NextResponse.json({ error: 'Ad, kullanıcı adı, e-posta ve şifre zorunlu.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Şifre en az 8 karakter olmalı.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.adminUser.create({
      data: {
        name,
        username,
        email,
        password: passwordHash,
        role,
        status,
        permissions: JSON.stringify(permissions),
      },
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

    return NextResponse.json({ user: sanitizeAdminUser(user) }, { status: 201 });
  } catch (error: unknown) {
    if (isPrismaKnownError(error) && error.code === 'P2002') {
      return NextResponse.json({ error: 'Bu kullanıcı adı veya e-posta zaten kullanılıyor.' }, { status: 409 });
    }

    console.error('Admin User Create Error:', error);
    return NextResponse.json({ error: 'Kullanıcı oluşturulamadı.' }, { status: 500 });
  }
}
