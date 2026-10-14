// Üyelere özel kampanyalar (admin, 14 Ekim): liste + sayaçlar, kaydet, sil. Kayıttan sonra kampanya bandı olan sayfalar yenilenir.
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-auth";
import { deleteKampanya, kampanyaSayaclari, listKampanyalar, saveKampanya } from "@/lib/uye-kampanya";
import { prisma } from "@/lib/prisma";
import { getSiteSettings, revalidateSiteSettings } from "@/lib/site-settings";
import { UYE_PAKET_KEY, uyeKurallari, type UyeKural } from "@/lib/pricing/uye";
import { packageDisplayPrices } from "@/lib/pricing/package-server";

export const dynamic = "force-dynamic";

const yenile = () => {
  for (const p of ["/", "/paketler", "/paketler/[slug]"]) revalidatePath(p, p.includes("[") ? "page" : undefined);
};

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const [kampanyalar, sayac, settings, paketler] = await Promise.all([
    listKampanyalar(),
    kampanyaSayaclari(),
    getSiteSettings().catch(() => ({} as Record<string, string>)),
    prisma.package.findMany({ where: { published: true }, select: { slug: true, title: true, price: true, currency: true }, orderBy: { title: "asc" } }).then(packageDisplayPrices),
  ]);
  const kurallar = uyeKurallari(settings);
  return NextResponse.json({ kampanyalar, sayac, paketler: paketler.map((p) => ({ slug: p.slug, title: p.title, fiyat: p.price, para: p.currency, kural: kurallar[p.slug] ?? null })) });
}

export async function POST(req: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  // Paket başına üyelerimize özel fiyat: kişi başı yüzde ya da tutar indirimi; değer boş/0 ise o pakette gösterilmez
  if (b.action === "paket-uye" && typeof b.slug === "string") {
    const kurallar = uyeKurallari(await getSiteSettings().catch(() => ({} as Record<string, string>)));
    const deger = Number(String(b.deger ?? "").replace(",", "."));
    if (Number.isFinite(deger) && deger > 0) kurallar[b.slug] = { tip: b.tip === "tutar" ? "tutar" : "yuzde", deger: b.tip === "tutar" ? Math.round(deger) : Math.min(50, deger) } satisfies UyeKural;
    else delete kurallar[b.slug];
    const v = JSON.stringify(kurallar);
    await prisma.setting.upsert({ where: { key: UYE_PAKET_KEY }, update: { value: v }, create: { key: UYE_PAKET_KEY, value: v } });
    revalidateSiteSettings();
    yenile();
    return NextResponse.json({ ok: true, kural: kurallar[b.slug] ?? null });
  }
  if (b.action === "delete" && typeof b.id === "string") {
    await deleteKampanya(b.id);
    yenile();
    return NextResponse.json({ ok: true });
  }
  const k = await saveKampanya(b.kampanya ?? {});
  yenile();
  return NextResponse.json({ ok: true, kampanya: k });
}
