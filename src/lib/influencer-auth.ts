import { SignJWT, jwtVerify } from 'jose';
import { getJwtKey } from '@/lib/jwt-key';
import { cookies } from 'next/headers';


export async function createInfluencerSession(payload: { id: string; email: string; fullName: string; uniqueCode: string }) {
  const token = await new SignJWT({ ...payload, role: 'influencer' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(await getJwtKey());
  return token;
}

export async function verifyInfluencerToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, await getJwtKey());
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
