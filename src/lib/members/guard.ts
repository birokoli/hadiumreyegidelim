// Üye API'leri için ortak: oturumdaki üye + e-posta doğrulama durumu.
import { getMember, isEmailVerified, type Member } from "@/lib/members";

export async function uyeOturumu(): Promise<{ m: Member; dogrulandi: boolean } | null> {
  const m = await getMember();
  if (!m) return null;
  return { m, dogrulandi: await isEmailVerified(m.id) };
}
