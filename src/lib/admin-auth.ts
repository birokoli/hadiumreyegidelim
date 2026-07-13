import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

const ADMIN_JWT_SECRET = process.env.JWT_SECRET || 'HADI_UMREYE_GELENE_ALLAH_RAZI_OLSUN_12345';
const adminKey = new TextEncoder().encode(ADMIN_JWT_SECRET);

export const ADMIN_PERMISSIONS = [
  'dashboard',
  'orders',
  'content',
  'operations',
  'marketing',
  'settings',
  'users',
] as const;

export type AdminPermission = typeof ADMIN_PERMISSIONS[number];

export type AdminSession = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  legacy?: boolean;
};

export function hashLegacyAdminPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'hug-salt-2026').digest('hex');
}

export function normalizePermissions(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  if (typeof value !== 'string' || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export function canManageUsers(session: AdminSession | null): boolean {
  if (!session) return false;
  return session.legacy || session.role === 'super_admin' || session.permissions.includes('users');
}

export async function createAdminToken(session: Omit<AdminSession, 'legacy'>) {
  return new SignJWT(session)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(adminKey);
}

export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, adminKey);
    if (!payload.id || !payload.email || !payload.username) return null;

    return {
      id: String(payload.id),
      name: String(payload.name || 'Yönetici'),
      username: String(payload.username),
      email: String(payload.email),
      role: String(payload.role || 'editor'),
      permissions: normalizePermissions(payload.permissions),
    };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const legacySession = cookieStore.get('admin_session')?.value === 'true';
  if (!legacySession) return null;

  const token = cookieStore.get('admin_token')?.value;
  if (!token) {
    return {
      id: 'legacy-admin',
      name: 'Yönetici',
      username: 'Yasin',
      email: '',
      role: 'super_admin',
      permissions: [...ADMIN_PERMISSIONS],
      legacy: true,
    };
  }

  const session = await verifyAdminToken(token);
  if (!session) return null;

  const admin = await prisma.adminUser.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      permissions: true,
      status: true,
    },
  });

  if (!admin || admin.status !== 'active') return null;

  return {
    id: admin.id,
    name: admin.name,
    username: admin.username,
    email: admin.email,
    role: admin.role,
    permissions: normalizePermissions(admin.permissions),
  };
}
