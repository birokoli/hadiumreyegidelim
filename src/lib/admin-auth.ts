import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getJwtKey } from '@/lib/jwt-key';

/** Ayarlar tablosundaki tek yönetici hesabının (eski giriş) token kimliği */
export const LEGACY_ADMIN_ID = 'legacy-admin';

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
    .sign(await getJwtKey());
}

export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, await getJwtKey());
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

export function legacyAdminSession(username: string): Omit<AdminSession, 'legacy'> {
  return {
    id: LEGACY_ADMIN_ID,
    name: 'Yönetici',
    username,
    email: 'legacy-admin@hadiumreyegidelim.com',
    role: 'super_admin',
    permissions: [...ADMIN_PERMISSIONS],
  };
}

/**
 * Oturum yalnızca imzalı admin_token ile geçerlidir; admin_session=true çerezi tek başına
 * yetki vermez (herkes tarayıcısında o çerezi yazabilir).
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return null;

  const session = await verifyAdminToken(token);
  if (!session) return null;
  if (session.id === LEGACY_ADMIN_ID) return { ...session, legacy: true };

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
