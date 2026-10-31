// Satış masası: istemcide de kullanılan ortak tipler ve hesaplar (veritabanı yok).

export const ASAMALAR = [
  { key: "talep", label: "Talep" },
  { key: "teklif", label: "Teklif gönderildi" },
  { key: "onaylandi", label: "Onaylandı" },
  { key: "odeme", label: "Ödeme alındı" },
  { key: "vize_basvuru", label: "Vize başvurusu" },
  { key: "vize_cikti", label: "Vize çıktı" },
  { key: "yolculuk", label: "Yolculuk" },
  { key: "tamamlandi", label: "Tamamlandı" },
] as const;
export type Asama = (typeof ASAMALAR)[number]["key"];
export const asamaIndex = (k: string) => Math.max(0, ASAMALAR.findIndex((a) => a.key === k));
export const asamaLabel = (k: string) => (k === "iptal" ? "İptal" : ASAMALAR.find((a) => a.key === k)?.label ?? k);
/** Müşteriye "umre dosyası" olarak görünen aşamalar (onaydan sonrası) */
export const onaylandiMi = (k: string) => asamaIndex(k) >= asamaIndex("onaylandi") && k !== "iptal";

/** Satış türü kodu (15 Ekim, kullanıcı): dosya numarasının 7–8. haneleri. HUG + YY + AA + tür + o ay o türdeki müşteri sırası. */
export const SATIS_TURLERI = {
  "01": "Bireysel umre",
  "02": "Grup umre / tur",
  "03": "Yalnızca vize",
  "04": "Yalnızca otel",
  "05": "Transfer ve diğer hizmetler",
} as const;
export type SatisTuru = keyof typeof SATIS_TURLERI;

export const KALEM_TURLERI = {
  otel_mekke: { label: "Mekke oteli", ikon: "otel", odeme: "onden" },
  otel_medine: { label: "Medine oteli", ikon: "medine", odeme: "onden" },
  vize: { label: "Umre vizesi", ikon: "vize", odeme: "onden" },
  transfer: { label: "Transfer", ikon: "transfer", odeme: "varis" },
  tren: { label: "Haremeyn treni", ikon: "tren", odeme: "onden" },
  rehber: { label: "Hoca / rehberlik", ikon: "rehber", odeme: "yari" },
  tur: { label: "Ziyaret turu", ikon: "kabe", odeme: "onden" },
  diger: { label: "Diğer", ikon: "paket", odeme: "onden" },
} as const;
export type KalemTur = keyof typeof KALEM_TURLERI;

export type Otel = { slug?: string; ad: string; giris?: string; cikis?: string; oda?: string; onayNo?: string };
export type Kalem = {
  id: string;
  tur: KalemTur;
  ad: string;
  aciklama?: string;
  adet: number; // otel: oda sayısı; diğerleri: kişi/araç/adet
  birim: number; // satış birim fiyatı ($); otel: gecelik oda fiyatı
  alis?: number; // birim alış ($), yalnızca admin görür
  otel?: Otel;
  /** Ziyaret turu rotası (15 Ekim): "mekke" | "medine"; duraklar src/lib/satis/ziyaret.ts */
  rota?: "mekke" | "medine";
};
/** tutar borçtan düşen kısımdır; kartla ödemede karttan çekilen = tutar + kartPayi (16 Ekim'den önceki ödemelerde kartPayi yok) */
/**
 * Teklif seçeneği (31 Ekim, kullanıcı: "genelde ayrım otelde, yemekli otel / ekonomik otel; geri kalan hizmetler aynı;
 * en fazla bir de farklı araç soruyorlar; müşteri bir şey ayarlamasın"). Dosyanın kendi kalemleri 1. seçenektir (adı anaAd).
 * Diğer seçenekler yalnızca otel kalemlerini, istenirse transferleri (araç farkı) ve indirimi değiştirir; vize, tur, tren ortak.
 * Müşteri bir seçeneği onaylayınca o seçenek dosyanın kalemleri olur, eskisi seçeneklere geçer (secenekOnayla).
 */
export type Secenek = { id: string; ad: string; oteller: Kalem[]; transferler?: Kalem[]; indirim?: number };
export const SECENEK_SINIRI = 3;
export type Odeme = { id: string; tarih: string; tutar: number; yontem: "havale" | "kart" | "nakit"; yer: "onden" | "cidde"; aciklama?: string; kartPayi?: number };
export type Kayit = { id: string; t: string; kim: string; metin: string };

export type DosyaData = {
  musteriAdi: string;
  /** Satış türü kodu (numarada da yer alır); eski dosyalarda yok */
  satisTuru?: SatisTuru;
  /** Hitap (15 Ekim, kullanıcı: "Neriman Hanım, Yasin Bey gibi olmalı"); admin seçer, isimden tahmin edilmez */
  hitap?: "bey" | "hanim";
  yetiskin: number;
  cocuk: number;
  bebek: number;
  gidis?: string;
  donus?: string;
  onceSehir?: "mekke" | "medine";
  talepNotu?: string;
  /** Talep üyeye özel bir kampanyadan geldiyse (Profil 2, 14 Ekim) */
  kampanyaId?: string;
  kampanyaBaslik?: string;
  kalemler: Kalem[];
  /**
   * İndirim (31 Ekim, kullanıcı: "kâra indirim olacak, büyük bir şey gibi görünmeli"): KDV hariç $, kalem toplamından düşer.
   * Müşteri kalemlerin gerçek toplamını üstü çizili, indirimi ve indirimli fiyatı görür. Kârı aşmaması admin ekranında denetlenir.
   */
  indirim?: number;
  /** 1. seçeneğin adı ("Yemekli"); seçenek yoksa kullanılmaz */
  anaAd?: string;
  secenekler?: Secenek[];
  /** Önerilen seçenek: "ana" ya da seçenek id'si */
  onerilen?: string;
  gecerlilik?: string; // teklif son geçerlilik tarihi
  teklifNotu?: string;
  teklifGonderildi?: string;
  // Yolculuk
  ucusGidis?: string;
  ucusDonus?: string;
  karsilamaYeri?: string;
  karsilayanAd?: string;
  karsilayanTel?: string;
  rehberAd?: string;
  rehberTel?: string;
  tren?: string;
  donusTransfer?: string;
  musteriyeNot?: string;
  // Ödeme
  odemePlani: "tek" | "bolunmus";
  odemeler: Odeme[];
  /** KDV eklenir mi (16 Ekim; oran KDV_ORANI). Yeni dosyalarda true; eski dosyalarda yok, toplamları değişmesin diye KDV'siz kalır. */
  kdv?: boolean;
  // Geçmiş
  asamaTarihleri: Partial<Record<Asama, string>>;
  gecmis: Kayit[];
};

export type Dosya = {
  id: string;
  no: string;
  token: string;
  userId: string | null;
  sorumluId: string | null;
  email: string | null;
  phone: string | null;
  status: Asama | "iptal";
  data: DosyaData;
  createdAt: Date;
  updatedAt: Date;
};

// ─── Hesaplar ──────────────────────────────────────────────────────────────
export const geceSayisi = (giris?: string, cikis?: string) => {
  if (!giris || !cikis) return 0;
  const n = Math.round((new Date(cikis).getTime() - new Date(giris).getTime()) / 86_400_000);
  return n > 0 ? n : 0;
};
/** İki tarih de girilmiş ama çıkış girişten sonra değilse (28 Ekim: ters tarih sessizce "1 gece" sayılıyordu) */
export const tarihTers = (giris?: string, cikis?: string) => !!giris && !!cikis && geceSayisi(giris, cikis) === 0;
/** Fiyata giren gece: tarihler eksikse 1 (taslak), ikisi de varsa gerçek gece sayısı (ters tarihte 0, uyarı gösterilir) */
export const faturaGece = (k: Kalem) => (k.otel?.giris && k.otel?.cikis ? geceSayisi(k.otel.giris, k.otel.cikis) : 1);
/** "2027-01-28" + 5 gün → "2027-02-02" (saat dilimi kaymasın diye UTC) */
export const gunEkle = (tarih: string, gun: number) => {
  const d = new Date(`${tarih}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + gun);
  return d.toISOString().slice(0, 10);
};
export const kalemToplam = (k: Kalem) => (k.tur.startsWith("otel_") ? k.adet * k.birim * faturaGece(k) : k.adet * k.birim);
export const kalemAlis = (k: Kalem) => (k.alis ? (k.tur.startsWith("otel_") ? k.adet * k.alis * faturaGece(k) : k.adet * k.alis) : 0);
/** Kalemlerin indirimsiz toplamı (KDV hariç) */
export const araToplam = (d: DosyaData) => d.kalemler.reduce((s, k) => s + kalemToplam(k), 0);
export const indirimOf = (d: DosyaData) => Math.min(Math.max(0, d.indirim ?? 0), araToplam(d));
/** İndirimli toplam (KDV hariç); kâr ve KDV bunun üstünden hesaplanır */
export const toplam = (d: DosyaData) => araToplam(d) - indirimOf(d);
export const alisToplam = (d: DosyaData) => d.kalemler.reduce((s, k) => s + kalemAlis(k), 0);
export const odenen = (d: DosyaData) => d.odemeler.reduce((s, o) => s + o.tutar, 0);

// KDV ve kart payı (16 Ekim, kullanıcı): kalem fiyatları KDV hariçtir; havale/nakitte KDV eklenir,
// kartla ödenen kısma ayrıca KDV'li tutarın %5'i kart payı eklenir. Kâr hesabı KDV hariç tutarla yapılır.
// 19 Ekim (kullanıcı): fatura Dubai'den kesiliyor; BAE KDV'si %5 (önce %20 idi)
export const KDV_ORANI = 0.05;
export const KDV_ETIKETI = `KDV %${Math.round(KDV_ORANI * 100)}`;
export const KART_PAYI = 0.05;
const kdvCarpani = (d: DosyaData) => (d.kdv ? 1 + KDV_ORANI : 1);
export const kdvTutari = (d: DosyaData) => (d.kdv ? toplam(d) * KDV_ORANI : 0);
/** Müşterinin havale/nakitle ödeyeceği toplam (KDV dahil) */
export const genelToplam = (d: DosyaData) => toplam(d) * kdvCarpani(d);
/** Müşteriye üstü çizili gösterilen indirimsiz toplam ve indirim tutarı (KDV dahilse KDV'li) */
export const indirimsizGenel = (d: DosyaData) => araToplam(d) * kdvCarpani(d);
export const indirimGenel = (d: DosyaData) => indirimOf(d) * kdvCarpani(d);
/** Bir tutarın kartla ödenince çekilecek hali */
export const kartla = (tutar: number) => tutar * (1 + KART_PAYI);
export const kartPayiOf = (tutar: number) => Math.round(tutar * KART_PAYI * 100) / 100;

/** Bölünmüş ödemede önden ve Cidde'de alınacak tutarlar. */
export function odemeDagilimi(d: DosyaData) {
  let onden = 0;
  let varis = 0;
  for (const k of d.kalemler) {
    const t = kalemToplam(k);
    const kural = KALEM_TURLERI[k.tur]?.odeme ?? "onden";
    if (kural === "varis") varis += t;
    else if (kural === "yari") {
      onden += t / 2;
      varis += t / 2;
    } else onden += t;
  }
  // İndirim önden ödenen kısımdan düşer; önden kısım yetmezse kalanı Cidde'dekinden
  const ind = indirimOf(d);
  const ondenInd = Math.min(onden, ind);
  onden -= ondenInd;
  varis = Math.max(0, varis - (ind - ondenInd));
  const c = kdvCarpani(d);
  return { onden: Math.round(onden * c), varis: Math.round(varis * c) };
}

export const oteller = (d: DosyaData) => {
  const ilk = d.onceSehir === "medine" ? "otel_medine" : "otel_mekke";
  return d.kalemler.filter((k) => k.tur.startsWith("otel_") && k.otel?.ad).sort((a, b) => (a.otel?.giris ?? "").localeCompare(b.otel?.giris ?? "") || (a.tur === ilk ? -1 : 0) - (b.tur === ilk ? -1 : 0));
};

// ─── Seçenekler ────────────────────────────────────────────────────────────
const otelMi = (k: Kalem) => k.tur.startsWith("otel_");
/** Seçenek uygulanmış dosya verisi: otel kalemleri (ve araç farkı varsa transferler) ile indirim seçeneğinkiyle değişir */
export function secenekUygula(d: DosyaData, s: Secenek | null | undefined): DosyaData {
  if (!s) return d;
  const kalan = d.kalemler.filter((k) => !otelMi(k) && !(s.transferler && k.tur === "transfer"));
  return { ...d, kalemler: [...s.oteller, ...kalan, ...(s.transferler ?? [])], indirim: s.indirim };
}
/** Dosyanın kendi kalemleri seçenek olarak (onayda öteki seçeneklere geçer) */
export const anaSecenek = (d: DosyaData, id = "ana"): Secenek => ({
  id,
  ad: d.anaAd || "1. seçenek",
  oteller: d.kalemler.filter(otelMi),
  transferler: d.secenekler?.some((s) => s.transferler) ? d.kalemler.filter((k) => k.tur === "transfer") : undefined,
  indirim: d.indirim,
});
/** Müşteriye gösterilecek seçenekler: ana + diğerleri (seçenek yoksa boş) */
export const tumSecenekler = (d: DosyaData): Secenek[] => (d.secenekler?.length ? [anaSecenek(d), ...d.secenekler] : []);
/** Müşteri seçeneği onayladı: seçenek dosyanın kalemleri olur, eski kalemler seçenek olarak saklanır */
export function secenekOnayla(d: DosyaData, id: string): Partial<DosyaData> | null {
  if (id === "ana" || !d.secenekler?.length) return {};
  const s = d.secenekler.find((x) => x.id === id);
  if (!s) return null;
  const yeni = secenekUygula(d, s);
  const eski = { ...anaSecenek(d, `s_${Date.now().toString(36)}`), transferler: s.transferler ? d.kalemler.filter((k) => k.tur === "transfer") : undefined };
  return { kalemler: yeni.kalemler, indirim: s.indirim, anaAd: s.ad, onerilen: d.onerilen === id ? "ana" : d.onerilen === "ana" ? eski.id : d.onerilen, secenekler: [...d.secenekler.filter((x) => x.id !== id), eski] };
}

export const usd = (n: number) => `${Math.round(n).toLocaleString("tr-TR")} $`;
export const trTarih = (iso?: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" }) =>
  iso ? new Date(iso).toLocaleDateString("tr-TR", { timeZone: "UTC", ...opts }) : "";
export function gunKaldi(gidis?: string): number | null {
  if (!gidis) return null;
  const bugun = new Date(new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(new Date()));
  const g = new Date(gidis);
  return Number.isNaN(g.getTime()) ? null : Math.round((g.getTime() - bugun.getTime()) / 86_400_000);
}
export const phoneDigits = (p: string | null | undefined) => {
  const d = String(p ?? "").replace(/\D/g, "");
  return d.length >= 10 ? d.slice(-10) : null;
};
export const waNumara = (p: string | null | undefined) => {
  let d = String(p ?? "").replace(/\D/g, "");
  if (d.startsWith("0")) d = "90" + d.slice(1);
  if (d.length === 10 && d.startsWith("5")) d = "90" + d;
  return d.length >= 11 ? d : "";
};


/** Teklifin geçerlilik tarihi geçti mi (o gün dahil geçerli). */
export const teklifSuresiDoldu = (gecerlilik?: string) => !!gecerlilik && new Date(gecerlilik).getTime() + 86_400_000 < Date.now();

/** "Neriman Hanım" / "Yasin Bey"; hitap seçilmemişse yalnızca ad. */
export function hitapAdi(x: Pick<DosyaData, "musteriAdi" | "hitap">): string {
  const ilk = x.musteriAdi.trim().split(/\s+/)[0] ?? "";
  const ad = ilk ? `${ilk[0].toLocaleUpperCase("tr-TR")}${ilk.slice(1).toLocaleLowerCase("tr-TR")}` : "";
  return x.hitap === "bey" ? `${ad} Bey` : x.hitap === "hanim" ? `${ad} Hanım` : ad;
}
