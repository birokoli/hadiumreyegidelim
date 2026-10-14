// YALNIZCA YEREL TEST: satış masasına örnek dosyalar kurar; biri test üyesine (scripts/local/.test-uye.json) bağlı.
// Canlıda çalışmaz. Kullanım: DATABASE_URL=...127.0.0.1:5432... npx tsx scripts/local/seed-profil-demo.mts
import { readFileSync } from "node:fs";
import { prisma } from "@/lib/prisma";
import { markEmailVerified } from "@/lib/members";
import { addBelge, createDosya, ensureSatisSchema, saveDosya, type Kalem } from "@/lib/satis";
import { saveKampanya } from "@/lib/uye-kampanya";
import { directoryHotels } from "@/lib/catalog/hotel-directory";

if (!/@(127\.0\.0\.1|localhost):5432\//.test(process.env.DATABASE_URL ?? "")) throw new Error("Güvenlik: yalnızca yerel veritabanı.");
const cred = JSON.parse(readFileSync(new URL("./.test-uye.json", import.meta.url), "utf8"));
const uye = await prisma.user.findFirst({ where: { email: cred.email } });
if (!uye) throw new Error("Önce test üyesini oluşturun (profil/uye-ol).");
await markEmailVerified(uye.id);
await ensureSatisSchema();
await prisma.$executeRawUnsafe(`DELETE FROM "UmreBelge"`);
await prisma.$executeRawUnsafe(`DELETE FROM "SatisDosyasi"`);

const rehber = await directoryHotels({ all: true });
const mekke = rehber.find((h) => h.city === "mekke" && (h.kaabaMeters ?? 9999) < 900) ?? rehber.find((h) => h.city === "mekke");
const medineSvc = await prisma.service.findFirst({ where: { type: "HOTEL", extraData: { contains: "Medine" } } });
const id = () => Math.random().toString(36).slice(2, 10);
const kalemler = (g: string, ara: string, d: string, kisi: number, gecelik: [number, number]): Kalem[] => [
  { id: id(), tur: "otel_mekke", ad: mekke?.name ?? "Mekke oteli", adet: 1, birim: gecelik[0], alis: Math.round(gecelik[0] * 0.82), otel: { slug: mekke?.slug, ad: mekke?.name ?? "Mekke oteli", giris: g, cikis: ara, oda: "2 kişilik oda" } },
  { id: id(), tur: "otel_medine", ad: medineSvc?.name ?? "Medine oteli", adet: 1, birim: gecelik[1], alis: Math.round(gecelik[1] * 0.82), otel: { slug: medineSvc ? `svc:${medineSvc.id}` : undefined, ad: medineSvc?.name ?? "Medine oteli", giris: ara, cikis: d, oda: "2 kişilik oda" } },
  { id: id(), tur: "vize", ad: "Umre vizesi", aciklama: "Sigorta dahil", adet: kisi, birim: 180, alis: 150 },
  { id: id(), tur: "transfer", ad: "Karşılama ve transferler", aciklama: "Havalimanı – otel – istasyon, özel araç", adet: 1, birim: 260, alis: 190 },
  { id: id(), tur: "tren", ad: "Haremeyn hızlı treni", aciklama: "Mekke → Medine, ekonomi", adet: kisi, birim: 75, alis: 60 },
  { id: id(), tur: "rehber", ad: "Hoca rehberliği", aciklama: "Umre ibadeti ve ziyaretlerde Türkçe hoca", adet: 1, birim: 300, alis: 200 },
];

// 1) Onaylanmış, vizesi çıkmış dosya: test üyesine bağlı
const d1 = await createDosya({ musteriAdi: uye.name, phone: "+905321112233", email: uye.email, yetiskin: 2, gidis: "2026-11-14", donus: "2026-11-24", talepNotu: "Harem'e yakın otel, önce Mekke", kim: "Yerel test" });
await saveDosya(d1.id, {
  status: "vize_cikti",
  userId: uye.id,
  data: {
    onceSehir: "mekke",
    kalemler: kalemler("2026-11-14", "2026-11-20", "2026-11-24", 2, [310, 260]),
    gecerlilik: "2026-10-20",
    teklifGonderildi: "2026-10-03T10:00:00.000Z",
    karsilamaYeri: "Cidde Havalimanı · Terminal 1", karsilayanAd: "Mustafa Bey", rehberAd: "Ahmet Hoca",
    tren: "20 Kasım · 10:30 · Mekke → Medine", donusTransfer: "Otelden Medine Havalimanı'na özel araç",
    odemePlani: "bolunmus",
    odemeler: [{ id: id(), tarih: "2026-10-06", tutar: 3200, yontem: "havale", yer: "onden", aciklama: "Otel, vize, hoca yarısı" }],
    musteriyeNot: "İhram için Mikat'tan önce niyet edin; havalimanında Mustafa Bey çıkışta isminizin yazılı olduğu kartla bekleyecek.",
    asamaTarihleri: { talep: "2026-10-02", teklif: "2026-10-03", onaylandi: "2026-10-04", odeme: "2026-10-06", vize_basvuru: "2026-10-08", vize_cikti: "2026-10-11" },
  },
}, "Yerel test");
await saveDosya(d1.id, { data: { asamaTarihleri: { talep: "2026-10-02", teklif: "2026-10-03", onaylandi: "2026-10-04", odeme: "2026-10-06", vize_basvuru: "2026-10-08", vize_cikti: "2026-10-11" } } }, "Yerel test");
const pdf = readFileSync(new URL("../../public/indir/tavaf-el-kitabi-2026.pdf", import.meta.url)).toString("base64");
await addBelge(d1.id, { ad: "ornek-vize-belgesi.pdf", tur: "vize", mime: "application/pdf", base64: pdf });
await addBelge(d1.id, { ad: "ornek-otel-mekke.pdf", tur: "otel", mime: "application/pdf", base64: pdf });

// 2) Teklifi gönderilmiş, yanıt bekleyen dosya (Ramazan): test üyesine bağlı
const d2 = await createDosya({ musteriAdi: uye.name, phone: "+905321112233", email: uye.email, yetiskin: 4, gidis: "2027-03-08", donus: "2027-03-18", kim: "Yerel test" });
await saveDosya(d2.id, { status: "teklif", userId: uye.id, data: { onceSehir: "medine", kalemler: kalemler("2027-03-12", "2027-03-08", "2027-03-18", 4, [520, 380]).map((k) => (k.tur === "otel_mekke" ? { ...k, adet: 2, otel: { ...k.otel!, giris: "2027-03-12", cikis: "2027-03-18" } } : k.tur === "otel_medine" ? { ...k, adet: 2, otel: { ...k.otel!, giris: "2027-03-08", cikis: "2027-03-12" } } : k)), gecerlilik: "2026-10-25", teklifGonderildi: new Date().toISOString(), teklifNotu: "Ramazan'ın son on günü için oteller hızla doluyor; onayınızla yerinizi hemen ayırtıyoruz." } }, "Yerel test");

// 3) Yeni talep (panoda görünsün, üyeye bağlı değil)
await createDosya({ musteriAdi: "Ayşe Demir", phone: "05551234567", yetiskin: 2, cocuk: 1, gidis: "2026-12-20", donus: "2026-12-30", talepNotu: "Çocuklu aile, servisli otel olabilir", kim: "Yerel test" });

// 4) Tamamlanmış geçmiş umre
const d4 = await createDosya({ musteriAdi: uye.name, email: uye.email, yetiskin: 2, gidis: "2026-04-10", donus: "2026-04-20", kim: "Yerel test" });
await saveDosya(d4.id, { status: "tamamlandi", userId: uye.id, data: { kalemler: kalemler("2026-04-10", "2026-04-16", "2026-04-20", 2, [280, 230]), odemeler: [{ id: id(), tarih: "2026-03-20", tutar: 4370, yontem: "havale", yer: "onden" }] } }, "Yerel test");

await saveKampanya({ id: "uk_ornekkasim", baslik: "Kasım umresi *üyelere özel*", aciklama: "Okul tatiline denk gelen 10 gece; Harem'e yürüme mesafesinde oteller, Türkçe hoca eşliğinde.", hat: "عمرة", gidis: "2026-11-14", donus: "2026-11-24", mekkeGece: 6, medineGece: 4, mekkeOtel: mekke?.name ?? "Mekke oteli", medineOtel: medineSvc?.name ?? "Medine oteli", dahil: "Umre vizesi\nKarşılama ve özel transfer\nHaremeyn treni\nTürkçe hoca", uyeFiyat: 1690, normalFiyat: 1890, kontenjan: 24, sonTarih: "2026-11-01", durum: "yayinda" });
await saveKampanya({ id: "uk_ornekramazan", baslik: "Ramazan'ın son on günü *erken kayıt*", aciklama: "Kadir gecesi Mekke'de; oteller dolmadan yerinizi ayırtın.", hat: "رمضان", hedef: "ramazan", gidis: "2027-02-27", donus: "2027-03-09", mekkeGece: 7, medineGece: 3, dahil: "Umre vizesi\nTransferler\nTürkçe hoca", uyeFiyat: 2450, normalFiyat: 2690, kontenjan: 40, sonTarih: "2027-01-15", durum: "yayinda" });
console.log("hazır:", [d1.no, d2.no, d4.no]);
await prisma.$disconnect();
