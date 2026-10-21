// Satış masası: tek dosya (admin). GET: dosya + belgeler + üye önerisi + otel listesi + hizmet kütüphanesi fiyatları.
// PUT: kaydet (aşama değişince istenirse müşteriye e-posta). POST: üyeye bağla, not ekle, mesaj gönderildi kaydı.
import { NextRequest, NextResponse } from "next/server";
import { acilislar } from "@/lib/satis/acilis";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { ASAMALAR, asamaLabel, getDosya, listBelgeler, phoneDigits, saveDosya, type Dosya, type DosyaData } from "@/lib/satis";
import { directoryHotels } from "@/lib/catalog/hotel-directory";
import { sendUmreGuncelleme } from "@/lib/leads/mailer";

export const dynamic = "force-dynamic";

const ACIKLAMA: Record<string, string> = {
  onaylandi: "Umreniz onaylandı; dosyanız açıldı. Oteller, karşılama ve belgeleriniz profilinizde.",
  odeme: "Ödemeniz kaydedildi. Teşekkür ederiz.",
  vize_basvuru: "Vize başvurunuz yapıldı; sonuçlanınca haber vereceğiz.",
  vize_cikti: "Vizeniz çıktı. Vize belgenizi profilinizdeki dosyanızdan indirebilirsiniz.",
  yolculuk: "Yolculuğunuz başladı. Karşılama bilgileri ve belgeleriniz dosyanızda; Rabbim kolaylaştırsın.",
  tamamlandi: "Umreniz tamamlandı. Allah kabul etsin; görüşlerinizi duymayı çok isteriz.",
};

async function ozet(d: Dosya) {
  const ph = phoneDigits(d.phone);
  const or = [...(d.email ? [{ email: { equals: d.email, mode: "insensitive" as const } }] : []), ...(ph ? [{ phone: { endsWith: ph } }] : [])];
  const [belgeler, oneri, bagliUye] = await Promise.all([
    listBelgeler(d.id),
    or.length ? prisma.user.findMany({ where: { OR: or }, select: { id: true, name: true, email: true }, take: 5 }) : [],
    d.userId ? prisma.user.findUnique({ where: { id: d.userId }, select: { id: true, name: true, email: true } }) : null,
  ]);
  const acilis = await acilislar(d.id).catch(() => []);
  return { dosya: d, belgeler, oneri: oneri.filter((u) => u.id !== d.userId), bagliUye, acilislar: acilis };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const d = await getDosya("no", (await params).id);
  if (!d) return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 404 });
  const ay = new Date().toISOString().slice(0, 7);
  const [o, rehber, katalog, kutuphane, ekip] = await Promise.all([
    ozet(d),
    directoryHotels({ all: true }).catch(() => []),
    prisma.service.findMany({ where: { type: "HOTEL" }, select: { id: true, name: true, extraData: true } }).catch(() => []),
    prisma.serviceLibrary.findMany({ where: { isActive: true }, select: { id: true, category: true, name: true, defaultCostUsd: true, prices: { where: { month: ay }, select: { salePriceUsd: true, variant: true } } }, orderBy: [{ category: "asc" }, { sortOrder: "asc" }] }).catch(() => []),
    prisma.adminUser.findMany({ where: { status: "active" }, select: { id: true, name: true } }).catch(() => []),
  ]);
  const katalogOtel = katalog
    .map((h) => {
      let city = "";
      try { city = String(JSON.parse(h.extraData ?? "{}").city ?? ""); } catch { /* bozuk veri */ }
      return { slug: `svc:${h.id}`, ad: h.name, sehir: /medine/i.test(city) ? "medine" : /mekke/i.test(city) ? "mekke" : "", kabe: null as number | null };
    })
    .filter((h) => h.sehir && !rehber.some((r) => r.name === h.ad));
  return NextResponse.json({
    ...o,
    asamalar: ASAMALAR,
    ekip,
    oteller: [...rehber.map((h) => ({ slug: h.slug, ad: h.name, sehir: h.city, kabe: h.kaabaMeters })), ...katalogOtel],
    kutuphane: kutuphane.map((k) => ({ id: k.id, kategori: k.category, ad: k.name, alis: k.defaultCostUsd, satis: k.prices[0]?.salePriceUsd ?? null })),
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const a = await getAdminSession();
  if (!a) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const d = await getDosya("no", (await params).id);
  if (!d) return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 404 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const status = [...ASAMALAR.map((x) => x.key), "iptal"].includes(String(b.status)) ? (b.status as Dosya["status"]) : undefined;
  const data = (b.data && typeof b.data === "object" ? b.data : {}) as Partial<DosyaData>;
  delete (data as Record<string, unknown>).gecmis;
  delete (data as Record<string, unknown>).asamaTarihleri;
  const r = await saveDosya(d.id, {
    status,
    email: typeof b.email === "string" ? b.email : undefined,
    phone: typeof b.phone === "string" ? b.phone : undefined,
    sorumluId: typeof b.sorumluId === "string" ? b.sorumluId || null : undefined,
    data,
  }, a.name);

  let bildirim: string | null = null;
  if (b.bildir === true && status && status !== r.onceki && ACIKLAMA[status]) {
    const uye = r.dosya.userId ? await prisma.user.findUnique({ where: { id: r.dosya.userId }, select: { email: true, name: true } }) : null;
    const to = uye?.email ?? r.dosya.email;
    if (to) {
      try {
        await sendUmreGuncelleme({ to, name: uye?.name ?? r.dosya.data.musteriAdi, no: r.dosya.no, asama: asamaLabel(status), aciklama: ACIKLAMA[status] });
        bildirim = to;
        await saveDosya(d.id, {}, a.name, `E-posta gönderildi: ${asamaLabel(status)} (${to})`);
      } catch (e) {
        console.error("[satis] bildirim", e);
        bildirim = "hata";
      }
    }
  }
  return NextResponse.json({ ...(await ozet((await getDosya("id", d.id))!)), bildirim });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const a = await getAdminSession();
  if (!a) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const d = await getDosya("no", (await params).id);
  if (!d) return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 404 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (b.action === "link") {
    const userId = typeof b.userId === "string" && b.userId ? b.userId : null;
    await saveDosya(d.id, { userId }, a.name, userId ? "Üye hesabına bağlandı" : "Üye bağlantısı kaldırıldı");
  } else if (b.action === "not") {
    const metin = String(b.metin ?? "").trim().slice(0, 1000);
    if (metin) await saveDosya(d.id, {}, a.name, metin);
  } else if (b.action === "teklif_gonderildi") {
    await saveDosya(d.id, { status: d.status === "talep" ? "teklif" : undefined, data: { teklifGonderildi: new Date().toISOString() } }, a.name, "Teklif WhatsApp'tan gönderildi");
  } else if (b.action === "voucher_gonderildi") {
    await saveDosya(d.id, {}, a.name, "Voucher WhatsApp'tan gönderildi");
  } else return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
  return NextResponse.json(await ozet((await getDosya("id", d.id))!));
}
