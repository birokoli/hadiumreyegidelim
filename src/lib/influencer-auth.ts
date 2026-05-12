import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'HADI_UMREYE_GELENE_ALLAH_RAZI_OLSUN_12345';
const key = new TextEncoder().encode(JWT_SECRET);

export async function createInfluencerSession(payload: { id: string; email: string; fullName: string; uniqueCode: string }) {
  const token = await new SignJWT({ ...payload, role: 'influencer' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(key);
  return token;
}

export async function verifyInfluencerToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key);
    if ((payload as any).role !== 'influencer') return null;
    return payload as { id: string; email: string; fullName: string; uniqueCode: string; role: string };
  } catch {
    return null;
  }
}

export async function getInfluencerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('influencer_session')?.value;
  if (!token) return null;
  return verifyInfluencerToken(token);
}
