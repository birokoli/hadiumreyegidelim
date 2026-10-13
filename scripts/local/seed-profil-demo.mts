// YALNIZCA YEREL TEST: test üyesine (scripts/local/.test-uye.json) örnek teklifler ve umre dosyaları kurar; e-postasını
// doğrulanmış sayar. Canlıda çalışmaz. Kullanım: DATABASE_URL=...127.0.0.1:5432... npx tsx scripts/local/seed-profil-demo.mts
import { readFileSync } from "node:fs";
import { prisma } from "@/lib/prisma";
import { markEmailVerified } from "@/lib/members";
import { addBelge, listBelgeler, openDosya, saveDosya, saveProfilKampanyalari } from "@/lib/umre";
import { directoryHotels } from "@/lib/catalog/hotel-directory";

if (!/@(127\.0\.0\.1|localhost):5432\//.test(process.env.DATABASE_URL ?? "")) throw new Error("Güvenlik: yalnızca yerel veritabanı.");
const cred = JSON.parse(readFileSync(new URL("./.test-uye.json", import.meta.url), "utf8"));
const uye = await prisma.user.findFirst({ where: { email: cred.email } });
if (!uye) throw new Error("Önce test üyesini oluşturun (profil/uye-ol).");
await markEmailVerified(uye.id);
await prisma.user.update({ where: { id: uye.id }, data: { phone: uye.phone ?? "+905321112233" } });

const items = (toplam: number) => [
  { category: "vize", name: "Umre vizesi", saleTotalUsd: Math.round(toplam * 0.12), sortOrder: 0 },
  { category: "hotel", name: "Mekke oteli · 6 gece", saleTotalUsd: Math.round(toplam * 0.5), sortOrder: 1 },
  { category: "hotel", name: "Medine oteli · 4 gece", saleTotalUsd: Math.round(toplam * 0.28), sortOrder: 2 },
  { category: "transfer", name: "Karşılama ve transferler", saleTotalUsd: Math.round(toplam * 0.1), sortOrder: 3 },
];
async function teklif(no: string, status: string, travelDate: string, adults: number, toplam: number) {
  await prisma.quotation.deleteMany({ where: { quotationNo: no } });
  return prisma.quotation.create({
    data: { quotationNo: no, customerName: uye!.name, customerEmail: uye!.email, customerPhone: "+905321112233", adultsCount: adults, travelDate, startDate: travelDate, validUntil: "3 iş günü", status, items: { create: items(toplam) } },
  });
}

await prisma.$executeRawUnsafe(`DELETE FROM "UmreBelge"`).catch(() => {});
await prisma.$executeRawUnsafe(`DELETE FROM "UmreDosyasi"`).catch(() => {});
const q1 = await teklif("TKF-2026-0142", "accepted", "14-24 Kasım 2026", 2, 4000);
await teklif("TKF-2026-0187", "sent", "8-18 Mart 2027 (Ramazan)", 4, 9800);
await teklif("TKF-2026-0098", "expired", "Eylül 2026", 2, 3600);
const q0 = await teklif("TKF-2026-0031", "accepted", "10-20 Nisan 2026", 2, 3700);

const oteller = await directoryHotels({ all: true });
const mekke = oteller.find((h) => h.city === "mekke" && (h.kaabaMeters ?? 9999) < 900) ?? oteller.find((h) => h.city === "mekke");
const medineSvc = await prisma.service.findFirst({ where: { type: "HOTEL", extraData: { contains: "Medine" } } });
const medine = oteller.find((h) => h.city === "medine") ?? (medineSvc ? { slug: `svc:${medineSvc.id}`, name: medineSvc.name } : undefined);

const d1 = await openDosya(q1.id);
await saveDosya(d1.id, {
  status: "vize_cikti",
  userId: uye.id,
  data: {
    gidis: "2026-11-14", donus: "2026-11-24", onceSehir: "mekke", yetiskin: 2, cocuk: 0,
    mekke: { slug: mekke?.slug, ad: mekke?.name ?? "Mekke oteli", giris: "2026-11-14", cikis: "2026-11-20", onayNo: "88412", oda: "2 kişilik oda" },
    medine: { slug: medine?.slug, ad: medine?.name ?? "Medine oteli", giris: "2026-11-20", cikis: "2026-11-24", onayNo: "51907", oda: "2 kişilik oda" },
    karsilamaYeri: "Cidde Havalimanı · Terminal 1", karsilayanAd: "Mustafa Bey",
    tren: "20 Kasım · 10:30 · Mekke → Medine · ekonomi, 2 bilet", donusTransfer: "Otelden Medine Havalimanı'na özel araç",
    toplamUsd: 4000, odenenUsd: 2400, sonOdeme: "2026-11-07",
    not: "İhram için Mikat'tan önce niyet edin; havalimanında Mustafa Bey çıkışta isminizin yazılı olduğu kartla bekleyecek.",
    asamaTarihleri: { teklif: "2026-10-02", onaylandi: "2026-10-04", odeme: "2026-10-06", vize_basvuru: "2026-10-08", vize_cikti: "2026-10-11" },
  },
});
if ((await listBelgeler(d1.id)).length === 0) {
  const pdf = readFileSync(new URL("../../public/indir/tavaf-el-kitabi-2026.pdf", import.meta.url)).toString("base64");
  await addBelge(d1.id, { ad: "ornek-vize-belgesi.pdf", tur: "vize", mime: "application/pdf", base64: pdf });
  await addBelge(d1.id, { ad: "ornek-otel-mekke.pdf", tur: "otel", mime: "application/pdf", base64: pdf });
}

const d0 = await openDosya(q0.id);
await saveDosya(d0.id, {
  status: "tamamlandi",
  userId: uye.id,
  data: { gidis: "2026-04-10", donus: "2026-04-20", onceSehir: "medine", yetiskin: 2, mekke: { ad: mekke?.name ?? "Mekke oteli" }, medine: { ad: medine?.name ?? "Medine oteli" }, toplamUsd: 3700, odenenUsd: 3700 },
});

await saveProfilKampanyalari([{ id: "ramazan27", baslik: "Ramazan 2027 umresi *erken kayıt*", aciklama: "Son 10 gün oteller dolmadan yerinizi ayırtın.", link: "/bireysel-umre", hat: "رمضان", aktif: true }]);
console.log("hazır:", { dosya: d1.no, gecmis: d0.no, mekke: mekke?.name, medine: medine?.name });
await prisma.$disconnect();
