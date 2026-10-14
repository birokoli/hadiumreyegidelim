// Üye kendi hesabını kapatır (Profil 2, 14 Ekim): User, tercih ve kodlar silinir; satış dosyalarında bağ kaldırılır
// (dosyanın kendisi muhasebe ve yasal saklama için kalır). Oturum çerezi silinir.
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { uyeOturumu } from "@/lib/members/guard";
import { SESSION_COOKIE } from "@/lib/members";
import { ensureUyeKampanyaSchema } from "@/lib/uye-kampanya";

export async function POST() {
  const o = await uyeOturumu();
  if (!o) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  await ensureUyeKampanyaSchema();
  const id = o.m.id;
  await prisma.$executeRawUnsafe(`UPDATE "SatisDosyasi" SET "userId" = NULL WHERE "userId" = $1`, id);
  for (const t of ["UyeTercih", "UyeMeta", "UyeKod"]) await prisma.$executeRawUnsafe(`DELETE FROM "${t}" WHERE "userId" = $1`, id).catch(() => null);
  await prisma.order.updateMany({ where: { userId: id }, data: { userId: null } });
  await prisma.user.delete({ where: { id } });
  (await cookies()).delete(SESSION_COOKIE);
  console.log(`[uyelik] hesap kapatıldı ${id}`);
  return NextResponse.json({ ok: true });
}
