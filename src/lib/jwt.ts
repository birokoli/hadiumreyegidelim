import { SignJWT, jwtVerify } from 'jose';
import { getJwtKey } from '@/lib/jwt-key';


export async function createSessionCookie(payload: { id: string; email: string; name: string }) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(await getJwtKey());
  return token;
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, await getJwtKey());
    return payload as { id: string; email: string; name: string };
  } catch (error) {
    return null;
  }
}
