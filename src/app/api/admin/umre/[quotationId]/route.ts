// Bir teklifin umre dosyası (admin): oku, aç, kaydet, üyeye bağla. Aşama değişince istenirse müşteriye e-posta gider.
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { ASAMALAR, asamaLabel, getDosyaByQuotation, linkTeklif, listBelgeler, openDosya, phoneDigits, saveDosya, type AsamaKey, type DosyaData } from "@/lib/umre";
import { directoryHotels } from "@/lib/catalog/hotel-directory";
import { sendUmreGuncelleme } from "@/lib/leads/mailer";

export const dynamic = "force-dynamic";

const ACIKLAMA: Record<AsamaKey, string> = {
  teklif: "Teklifiniz hazırlandı.",
  onaylandi: "Umreniz onaylandı; dosyanız açıldı. Otel, karşılama ve belgeleriniz profilinizde.",
  odeme: "Ödemeniz kaydedildi.",
  vize_basvuru: "Vize başvurunuz yapıldı; sonuçlanınca haber vereceğiz.",
  vize_cikti: "Vizeniz çıktı. Vize belgenizi profilinizdeki dosyanızdan indirebilirsiniz.",
  yolculuk: "Yolculuğunuz başladı. Karşılama bilgileri ve belgeleriniz dosyanızda; Rabbim kolaylaştırsın.",
  tamamlandi: "Umreniz tamamlandı. Allah kabul etsin; görüşlerinizi duymayı çok isteriz.",
};

async function uyeOnerisi(email: string | null, phone: string | null) {
  const ph = phoneDigits(phone);
  const or = [
    ...(email ? [{ email: { equals: email, mode: "insensitive" as const } }] : []),
    ...(ph ? [{ phone: { endsWith: ph } }] : []),
  ];
  if (!or.length) return [];
  return prisma.user.findMany({ where: { OR: or }, select: { id: true, name: true, email: true, phone: true }, take: 5 });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ quotationId: string }> }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const { quotationId } = await params;
  const q = await prisma.quotation.findUnique({ where: { id: quotationId }, select: { id: true, quotationNo: true, customerName: true, customerPhone: true, customerEmail: true, status: true } });
  if (!q) return NextResponse.json({ error: "Teklif bulunamadı." }, { status: 404 });
  const dosya = await getDosyaByQuotation(quotationId);
  const [belgeler, oneri, oteller] = await Promise.all([
    dosya ? listBelgeler(dosya.id) : [],
    uyeOnerisi(dosya?.email ?? q.customerEmail, dosya?.phone ?? q.customerPhone),
    directoryHotels({ all: true }).catch(() => []),
  ]);
  // Katalogdaki oteller (Medine dahil); rehber sayfası olmadığı için yalnızca ad
  const katalog = await prisma.service.findMany({ where: { type: "HOTEL" }, select: { id: true, name: true, extraData: true } }).catch(() => []);
  const katalogOtel = katalog.map((h) => {
    let city = "";
    try { city = String(JSON.parse(h.extraData ?? "{}").city ?? ""); } catch { /* bozuk veri */ }
    return { slug: `svc:${h.id}`, ad: h.name, sehir: /medine/i.test(city) ? "medine" : /mekke/i.test(city) ? "mekke" : null, kabe: null };
  }).filter((h) => h.sehir && !oteller.some((o) => o.name === h.ad));
  const bagliUye = dosya?.userId ? await prisma.user.findUnique({ where: { id: dosya.userId }, select: { id: true, name: true, email: true } }) : null;
  return NextResponse.json({
    teklif: q,
    dosya,
    belgeler,
    bagliUye,
    oneri,
    asamalar: ASAMALAR,
    oteller: [...oteller.map((h) => ({ slug: h.slug, ad: h.name, sehir: h.city, kabe: h.kaabaMeters })), ...katalogOtel],
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ quotationId: string }> }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const { quotationId } = await params;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  if (b.action === "open") {
    const dosya = await openDosya(quotationId);
    await prisma.quotation.update({ where: { id: quotationId }, data: { status: "accepted" } }).catch(() => {});
    return NextResponse.json({ dosya });
  }

  const dosya = await getDosyaByQuotation(quotationId);
  if (!dosya) return NextResponse.json({ error: "Önce dosyayı açın." }, { status: 400 });

  if (b.action === "link") {
    const userId = typeof b.userId === "string" && b.userId ? b.userId : null;
    if (userId) await linkTeklif(userId, quotationId);
    const r = await saveDosya(dosya.id, { userId });
    return NextResponse.json({ dosya: r.dosya });
  }

  // Kaydet
  const status = ASAMALAR.some((a) => a.key === b.status) ? (b.status as AsamaKey) : undefined;
  const data = (b.data && typeof b.data === "object" ? b.data : {}) as Partial<DosyaData>;
  const r = await saveDosya(dosya.id, {
    status,
    email: typeof b.email === "string" ? b.email : undefined,
    phone: typeof b.phone === "string" ? b.phone : undefined,
    data,
  });

  let bildirim: string | null = null;
  if (b.bildir === true && status && status !== r.onceki) {
    const uye = r.dosya.userId ? await prisma.user.findUnique({ where: { id: r.dosya.userId }, select: { email: true, name: true } }) : null;
    const to = uye?.email ?? r.dosya.email;
    if (to) {
      try {
        await sendUmreGuncelleme({ to, name: uye?.name ?? r.dosya.data.musteriAdi, no: r.dosya.no, asama: asamaLabel(status), aciklama: ACIKLAMA[status] });
        bildirim = to;
      } catch (e) {
        console.error("[umre] bildirim", e);
        bildirim = "hata";
      }
    }
  }
  return NextResponse.json({ dosya: r.dosya, bildirim });
}
