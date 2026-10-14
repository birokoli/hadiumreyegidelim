// Üyelere özel kampanyalar ve üye tercihleri: istemci ve sunucu ortak tipleri (Profil 2, 14 Ekim).

export type KampanyaDurum = "taslak" | "yayinda" | "kapali";

export type Kampanya = {
  id: string;
  baslik: string; // *yıldızlı* kısım italik (Accent)
  aciklama: string;
  gorsel: string | null;
  hat: string | null; // Arapça süs yazısı
  gidis: string | null; // YYYY-MM-DD
  donus: string | null;
  mekkeGece: number | null;
  medineGece: number | null;
  mekkeOtel: string | null;
  medineOtel: string | null;
  dahil: string; // satır satır: vize, transfer, tren...
  uyeFiyat: number | null; // kişi başı USD
  normalFiyat: number | null;
  kontenjan: number | null; // kişi; boşsa sınırsız
  sonTarih: string | null; // son başvuru, YYYY-MM-DD
  hedef: string | null; // umre planıyla eşleşme: "2026-11", "ramazan"
  durum: KampanyaDurum;
  sira: number;
  createdAt: string;
  updatedAt: string;
};

/** Kampanyaya gelen talepler (satış masasından sayılır). */
export type KampanyaSayac = { talep: number; kisi: number; satis: number };

export type UyeTercih = {
  userId: string;
  planDonem: string | null; // "2026-11" | "ramazan" | "belirsiz"
  planKisi: number | null;
  planKimle: string | null; // "es" | "aile" | "anne-baba" | "arkadas" | "yalniz"
  planOtel: string | null; // "yakin" | "ekonomik" | "fark-etmez"
  izinEposta: boolean;
  izinWhatsapp: boolean;
  izinTarihi: string | null;
  izinSoruldu: string | null; // tek seferlik pencere cevaplandı
  sonGiris: string | null;
};

export const KIMLE: Record<string, string> = { es: "Eşimle", aile: "Ailemle (çocuklarla)", "anne-baba": "Anne-babamla", arkadas: "Arkadaşlarla", yalniz: "Yalnız" };
export const OTEL: Record<string, string> = { yakin: "Harem'e yürüme mesafesi", ekonomik: "Ekonomik, servisli", "fark-etmez": "Bana en uygununu önerin" };

export const IZIN_METNI =
  "Üyelere özel umre tarihleri, fiyatlar ve bilgilendirmeler için Hadi Umreye Gidelim'in (MBD Travel LLC) benimle e-posta ve/veya WhatsApp üzerinden iletişime geçmesine izin veriyorum. Bu izni profilimdeki Hesap bölümünden istediğim zaman geri alabilirim.";

const AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

/** Önümüzdeki 12 ay + Ramazan + belirsiz: umre planı seçenekleri. */
export function donemSecenekleri(bugun: Date): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(bugun.getFullYear(), bugun.getMonth() + i, 1);
    out.push({ value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: `${AYLAR[d.getMonth()]} ${d.getFullYear()}` });
  }
  out.push({ value: "ramazan", label: "Ramazan umresi" }, { value: "belirsiz", label: "Henüz belli değil" });
  return out;
}

export function donemLabel(v: string | null): string {
  if (!v) return "";
  if (v === "ramazan") return "Ramazan umresi";
  if (v === "belirsiz") return "Henüz belli değil";
  const [y, m] = v.split("-").map(Number);
  return m ? `${AYLAR[m - 1]} ${y}` : v;
}

/** Kampanyanın dönemi: hedef alanı ya da gidiş tarihinin ayı. */
export const kampanyaDonem = (k: Pick<Kampanya, "hedef" | "gidis">) => k.hedef || (k.gidis ? k.gidis.slice(0, 7) : null);

export const geceToplam = (k: Pick<Kampanya, "mekkeGece" | "medineGece">) => (k.mekkeGece ?? 0) + (k.medineGece ?? 0);

export const usdTam = (n: number | null | undefined) => (n == null ? "" : `$${Math.round(n).toLocaleString("en-US")}`);

export function trGun(iso: string | null, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" }) {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("tr-TR", opts);
}
