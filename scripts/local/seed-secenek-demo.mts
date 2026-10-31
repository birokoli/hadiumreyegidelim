// YALNIZCA YEREL TEST (31 Ekim): seçenekli ve indirimli örnek teklif (önce Medine). Kullanım: DATABASE_URL=...127.0.0.1:5432... npx tsx scripts/local/seed-secenek-demo.mts
import { createDosya, saveDosya, type Kalem } from "@/lib/satis";
import { teklifLinki as link } from "@/lib/satis/mesaj";
if (!/@(127\.0\.0\.1|localhost):5432\//.test(process.env.DATABASE_URL ?? "")) throw new Error("Güvenlik: yalnızca yerel veritabanı.");
const d = await createDosya({ musteriAdi: "Leyla Deneme", phone: "5550000000", yetiskin: 4, gidis: "2026-12-02", donus: "2026-12-12", kim: "Test" });
const otel = (id: string, tur: Kalem["tur"], ad: string, giris: string, cikis: string, birim: number, alis: number, oda = "2 kişilik · yemekli"): Kalem => ({ id, tur, ad, adet: 2, birim, alis, otel: { ad, giris, cikis, oda } });
const ortak: Kalem[] = [
  { id: "v", tur: "vize", ad: "Umre vizesi", adet: 4, birim: 150, alis: 125 },
  { id: "t1", tur: "transfer", ad: "Medine Havalimanı → Medine oteli", adet: 1, birim: 55.2, alis: 48 },
  { id: "t2", tur: "transfer", ad: "Medine oteli → Mekke oteli", adet: 1, birim: 147.2, alis: 128 },
  { id: "t3", tur: "transfer", ad: "Mekke oteli → Cidde Havalimanı", adet: 1, birim: 70.53, alis: 61.33 },
];
await saveDosya(d.id, { data: {
  onceSehir: "medine",
  anaAd: "Yemekli",
  kalemler: [otel("o1", "otel_medine", "Dar Al Iman InterContinental", "2026-12-02", "2026-12-06", 210, 180), otel("o2", "otel_mekke", "Address Jabal Omar Makkah", "2026-12-06", "2026-12-12", 310, 269.33), ...ortak],
  indirim: 250,
  secenekler: [{ id: "eko", ad: "Ekonomik", indirim: 150, oteller: [otel("e1", "otel_medine", "Al Haram Hotel", "2026-12-02", "2026-12-06", 120, 100, "2 kişilik · kahvaltılı"), otel("e2", "otel_mekke", "Safwah Al Talayie", "2026-12-06", "2026-12-12", 41, 35.2, "2 kişilik · yemekli")] }],
  onerilen: "ana",
  gecerlilik: "2026-11-10",
} }, "Test");
console.log(d.no, link(d).replace("https://hadiumreyegidelim.com", "http://localhost:3002"));
