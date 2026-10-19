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
};

export const otelGalerisi = (slug: string | null | undefined): GaleriFoto[] => (slug ? OTEL_GALERI[slug] ?? [] : []);
export const otelKapagi = (slug: string | null | undefined): string | null => otelGalerisi(slug)[0]?.src ?? null;
