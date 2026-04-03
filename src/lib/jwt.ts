import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'HADI_UMREYE_GELENE_ALLAH_RAZI_OLSUN_12345';
const key = new TextEncoder().encode(JWT_SECRET);

export async function createSessionCookie(payload: { id: string; email: string; name: string }) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
  return token;
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as { id: string; email: string; name: string };
  } catch (error) {
    return null;
  }
}
