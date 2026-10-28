// Sunucudan gelen veri tipleri (yalnızca uygulamanın kullandığı alanlar). Satış Masası tipleri sitenin ortak dosyasından.
export type { Dosya, DosyaData, Kalem, Odeme, Kayit, Asama, KalemTur } from "@ortak/ortak";

export type Ozet = {
  ad: string;
  yetkiler: { siparis: boolean; pazarlama: boolean };
  sayac: { yeniTalep: number; yeniUye: number; yorum: number; icerik: number; basvuru: number; destek: number; whatsapp: number; okunmamis: number; ramazanAktif: number; ramazanBekleyen: number; dosya: Record<string, number> };
  yaklasan: { no: string; musteri: string; gidis: string | null; kalan: number | null; status: string }[];
  bekleyenTeklif: { no: string; musteri: string; tarih: string }[];
};
export type Bildirim = { id: string; olay: string; baslik: string; govde: string; yol: string | null; okundu: boolean; createdAt: string };
export type Iletisim = { id: string; name: string; phone: string; package: string | null; message: string | null; status: string; createdAt: string; updatedAt: string };
export type CrmAktivite = { id: string; type: string; content: string; createdBy: string; createdAt: string };
export type CrmKayit = { id: string; name: string; phone: string; email: string | null; stage: string; valueUSD: number; source: string; preferredPackage: string | null; notes: string | null; assignedTo: string | null; lostReason: string | null; createdAt: string; updatedAt: string; activities?: CrmAktivite[] };
export type HavuzKayit = { id: string; name: string | null; email: string; phone: string | null; source: string; marketingConsent: boolean; emailVerified: boolean; status: string; note: string | null; createdAt: string };
export type Rezervasyon = { id: string; kod: string; oda: number; paket: string; kisi: number; adSoyad: string; telefon: string; eposta: string | null; yolcular: string; kisiBasiUsd: number; toplamUsd: number; durum: "bekliyor" | "odendi" | "iptal"; sonOdeme: string; not: string | null; createdAt: string };
export type Yorum = { id: string; customerName: string; displayName: string | null; city: string | null; umreMonth: string | null; rating: number | null; text: string | null; photoUrl: string | null; status: string; source: string; reply: string | null; submittedAt: string | null; createdAt: string; url?: string };
export type Uye = { id: string; ad: string; eposta: string; telefon: string | null; uyelik: string; yeni: boolean; dogrulandi: boolean; izinEposta: boolean; izinWhatsapp: boolean; dosyaSayisi: number; sonDosyaNo: string | null; sonDosyaDurum: string | null; plan: { donem: string | null; kisi: number | null; kimle: string | null; otel: string | null }; sonGiris: string | null };
export type Influencer = { id: string; fullName: string; email: string; phone: string; instagramHandle: string | null; instagramFollowers: number; tiktokHandle: string | null; youtubeHandle: string | null; tier: string; status: string; uniqueCode: string; totalSales: number; totalEarnings: number; pendingEarnings: number; totalClicks: number; createdAt: string };
export type Icerik = { id: string; platform: string; link: string | null; gorsel: string | null; tarih: string; aciklama: string | null; durum: string; redNedeni: string | null; olusturma: string; influencer: { id: string; fullName: string; instagramHandle: string | null }; kampanya: string | null; ekipNotu: string | null };
export type Aday = { id: string; platform: string; handle: string; name: string | null; url: string; followers: number | null; score: number | null; stage: string; note: string | null; source: string | null; createdAt: string };
export type Kampanya = { id: string; title: string; slug: string; description: string | null; type: string; discountType: string | null; discountValue: number | null; status: string; startDate: string | null; endDate: string | null; commissionPct: number | null; imageUrl: string | null; _count?: { participants?: number } };
export type DestekMesaj = { id: string; senderType: string; content: string; createdAt: string };
export type DestekSohbet = { id: string; status: string; lastMessageAt: string; unreadByAdmin: number; influencer: { id: string; fullName: string; email?: string; instagramHandle?: string | null }; messages: DestekMesaj[] };
export type WaMesaj = { id: string; direction: "INBOUND" | "OUTBOUND"; source: string; content: string; createdAt: string };
export type WaKonusma = { id: string; phone: string; name: string | null; status: string; leadType: string | null; leadScore: number | null; handoffReason: string | null; lastMessageAt: string; messages: WaMesaj[] };
