// Otel fotoğraf galerileri (19 Ekim, kullanıcı): otelin kendi verdiği tanıtım fotoğrafları, public/images/oteller/<slug>/.
// İlk fotoğraf otelin kapağıdır (admin'de görsel girilmemişse planlayıcıda ve paylaşım görselinde de kullanılır).
// Yapay zekâ görseli kullanılmaz: gerçek bir oteli üretilmiş görselle göstermek müşteriyi yanıltır.

export type GaleriFoto = { src: string; alt: string };

const yol = (slug: string, dosya: string) => `/images/oteller/${slug}/${dosya}.jpg`;

export const OTEL_GALERI: Record<string, GaleriFoto[]> = {
  "address-jabal-omar-makkah": [
    ["01-dis-cephe-gece", "Address Jabal Omar Makkah ve arkada Saat Kulesi, gece"],
    ["03-deluxe-oda-sehir-manzarali", "Deluxe oda, iki yataklı, şehir manzaralı"],
    ["05-harem-manzarasi", "Otel odasından Mescid-i Haram manzarası"],
    ["04-premier-oda-harem-manzarali", "Premier oda, kısmi Harem manzaralı"],
    ["06-oda-harem-manzarali", "İki yataklı oda, kısmi Harem manzaralı"],
    ["07-restoran", "The Restaurant: kahvaltı ve akşam yemeği"],
    ["08-mescit", "Otelin üst katındaki mescit"],
    ["09-lobi", "Lobi oturma alanı"],
    ["10-banyo", "Deluxe oda banyosu"],
    ["02-dis-cephe", "Address Jabal Omar Makkah dış cephe"],
  ].map(([d, alt]) => ({ src: yol("address-jabal-omar-makkah", d), alt })),
  "mehd-al-resaleh-3": [
    ["01-dis-cephe", "Mehd Al Resaleh 3 otel binası"],
    ["02-uc-kisilik-oda", "Üç yataklı oda"],
    ["03-oda", "Oda"],
    ["04-oda-dolap-ve-masa", "Oda: dolap, çalışma masası ve televizyon"],
    ["05-banyo", "Banyo"],
    ["06-restoran", "Restoran"],
    ["07-lobi", "Lobi oturma alanı"],
    ["08-resepsiyon", "Resepsiyon"],
  ].map(([d, alt]) => ({ src: yol("mehd-al-resaleh-3", d), alt })),
  "holiday-inn-makkah-al-aziziah": [
    ["01-dis-cephe", "Holiday Inn Makkah Al Aziziah otel binası"],
    ["02-uc-kisilik-oda", "Üç yataklı oda"],
    ["03-iki-kisilik-oda", "İki yataklı oda"],
    ["04-cift-kisilik-oda", "Çift kişilik yataklı oda"],
    ["05-kahvalti-bufesi", "Kahvaltı büfesi"],
    ["06-restoran", "Restoran"],
    ["07-resepsiyon", "Resepsiyon"],
    ["08-lobi", "Lobi"],
    ["09-havuz", "Havuz ve teras"],
  ].map(([d, alt]) => ({ src: yol("holiday-inn-makkah-al-aziziah", d), alt })),
  "fairmont-makkah": [
    ["01-suit-kabe-manzarali", "Kâbe manzaralı süit"],
    ["02-oda-kabe-manzarali", "Kâbe ve Harem manzaralı oda"],
    ["03-cift-kisilik-oda-harem-manzarali", "Çift kişilik yataklı oda, Harem manzaralı"],
    ["04-iki-yatakli-oda-harem-manzarali", "İki yataklı oda, Harem manzaralı"],
    ["05-uc-yatakli-oda", "Üç yataklı oda"],
    ["06-iki-yatakli-oda", "İki yataklı oda"],
    ["07-gece-harem-manzarasi", "Otelden gece Harem manzarası"],
    ["08-giris", "Otel girişi"],
    ["09-restoran", "Restoran"],
    ["10-banyo", "Banyo"],
  ].map(([d, alt]) => ({ src: yol("fairmont-makkah", d), alt })),
  "pullman-zamzam-makkah": [
    ["01-odadan-harem-manzarasi", "Odadan Mescid-i Haram manzarası"],
    ["02-kabe-manzarasi", "Pencereden Kâbe manzarası"],
    ["03-oda-harem-manzarali", "Harem manzaralı oda"],
    ["04-iki-yatakli-oda", "İki yataklı oda"],
    ["05-cift-kisilik-oda", "Çift kişilik yataklı oda"],
    ["06-suit-oturma-alani", "Süit oturma alanı"],
    ["07-oda", "Oda ve banyo girişi"],
    ["08-banyo", "Banyo"],
  ].map(([d, alt]) => ({ src: yol("pullman-zamzam-makkah", d), alt })),
  // Snood: kaynak fotoğraflar küçük (en büyüğü 800 px); yalnızca kullanılabilir boyuttakiler alındı
  "snood-ajyad": [
    ["01-dis-cephe", "Snood Ajyad otel binası"],
    ["02-oda", "Oda"],
    ["03-uc-yatakli-oda", "Üç yataklı oda"],
    ["04-lobi", "Lobi ve resepsiyon"],
    ["05-banyo", "Banyo"],
  ].map(([d, alt]) => ({ src: yol("snood-ajyad", d), alt })),
  // Rotana: klasördeki Mekke ve Kâbe genel fotoğrafları otele ait olmadığı için alınmadı
  "rotana-jabal-omar": [
    ["01-oda", "Oda"],
    ["02-resepsiyon", "Resepsiyon"],
    ["03-oturma-salonu", "Oturma salonu"],
    ["04-kafe", "Kafe"],
    ["05-koridor", "Kat koridoru"],
  ].map(([d, alt]) => ({ src: yol("rotana-jabal-omar", d), alt })),
  "al-safwah-tower-3": [
    ["01-dis-cephe", "Al Safwah Tower 3 otel binası"],
    ["02-uc-yatakli-oda", "Üç yataklı oda"],
    ["03-iki-yatakli-oda", "İki yataklı oda"],
    ["04-uc-yatakli-oda-oturma", "Üç yataklı oda ve oturma köşesi"],
    ["05-manzarali-oturma-kosesi", "Manzaralı oturma köşesi"],
    ["06-restoran", "Restoran"],
    ["07-lobi", "Lobi"],
    ["08-banyo", "Banyo"],
  ].map(([d, alt]) => ({ src: yol("al-safwah-tower-3", d), alt })),
};

export const otelGalerisi = (slug: string | null | undefined): GaleriFoto[] => (slug ? OTEL_GALERI[slug] ?? [] : []);
export const otelKapagi = (slug: string | null | undefined): string | null => otelGalerisi(slug)[0]?.src ?? null;

/** Paket görseli (19 Ekim): admin'de paket görseli yoksa ya da ortak Kâbe görseliyse paketin otelinin kapağı. */
export function paketGorseli(imageUrl: string | null | undefined, hotelSlug: string | null | undefined): string | null {
  const ortak = !imageUrl || imageUrl.includes("hero-kabe");
  return ortak ? (otelKapagi(hotelSlug) ?? imageUrl ?? null) : imageUrl;
}
