// Hizmet kütüphanesi (web: /admin/fiyat-teklifleri/hizmetler): oteller, transferler, vize, turlar. Maliyet yalnızca panelde görünür;
// sitede görünen alanlar (isPublic, adres, görsel, açıklama) ve aylık satış fiyatları ayrı ekranda (/fiyat/[id]).
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { istek } from "@/api/istemci";
import { KayitEkrani } from "@/ui/form";
import { Dugme } from "@/ui/temel";
import { usd } from "@/ui/bicim";
import { FIYAT_TIPI, KATEGORI, KAT_IKON, SEHIR, type KutuphaneKalem } from "@/veri/katalog";

const sayiYa = (v: unknown) => (v === "" || v == null ? null : Number(v));

export default function Kutuphane() {
  const q = useQuery({ queryKey: ["kutuphane"], queryFn: () => istek<{ services: KutuphaneKalem[] }>("/api/admin/service-library") });
  const veri = q.data?.services ?? [];
  return (
    <KayitEkrani<KutuphaneKalem>
      baslik="Hizmet kütüphanesi"
      q={q}
      anahtar={["kutuphane"]}
      veri={veri}
      bos="Kalem yok"
      suzgec={{ secenekler: [{ deger: "tumu", etiket: "Tümü" }, ...KATEGORI.map((k) => ({ ...k, sayi: veri.filter((s) => s.category === k.deger).length || undefined }))], uygula: (s, d) => d === "tumu" || s.category === d }}
      satir={(s) => ({ baslik: s.name, alt: [s.city, `maliyet ${usd(Number(s.defaultCostUsd))}`, FIYAT_TIPI.find((t) => t.deger === s.defaultPricingType)?.etiket].filter(Boolean).join(" · "), ikon: KAT_IKON[s.category] ?? "paket", rozet: s.isPublic ? { metin: "Sitede", ton: "yesil" } : undefined })}
      formUst={(s) => (s.id ? <Dugme metin="Aylık satış fiyatları" ikon="fiyat2" tur="hafif" onPress={() => router.push({ pathname: "/fiyat/[id]", params: { id: s.id, ad: s.name, kat: s.category } })} /> : null)}
      alanlar={[
        { k: "category", etiket: "Kategori", tur: "secim", secenekler: KATEGORI },
        { k: "name", etiket: "Ad" },
        { k: "defaultPricingType", etiket: "Fiyatlandırma", tur: "secim", secenekler: FIYAT_TIPI, gizli: (s) => s.category === "hotel" },
        { k: "defaultCostUsd", etiket: "Maliyet ($, sitede görünmez)", tur: "sayi", alt: "Otelde 1 odanın 1 gecelik maliyeti" },
        { k: "defaultVehicleType", etiket: "Araç tipi", yer: "camry, staria, gmc…", gizli: (s) => s.category !== "transfer" && s.category !== "tur" },
        { k: "description", etiket: "İç not / açıklama", tur: "uzun" },
        { k: "isPublic", etiket: "Sitede göster", tur: "anahtar", alt: "Planlayıcı ve katalogda görünür" },
        { k: "city", etiket: "Şehir", tur: "secim", secenekler: SEHIR },
        { k: "slug", etiket: "Adres (boşsa addan)", gizli: (s) => !s.isPublic },
        { k: "hotelStars", etiket: "Yıldız", tur: "sayi", gizli: (s) => s.category !== "hotel" },
        { k: "distanceMeters", etiket: "Harem'e mesafe (m)", tur: "sayi", gizli: (s) => s.category !== "hotel" },
        { k: "imageUrl", etiket: "Görsel", tur: "gorsel", gizli: (s) => !s.isPublic },
        { k: "publicDescription", etiket: "Sitedeki açıklama", tur: "uzun", gizli: (s) => !s.isPublic },
      ]}
      yeni={() => ({ id: "", category: "hotel", name: "", description: "", defaultPricingType: "per_room", defaultCostUsd: "", defaultVehicleType: null, defaultChildPercent: 0, defaultExtraBedPrice: 0, isActive: true, sortOrder: 0, isPublic: false, slug: "", city: "mekke", imageUrl: null, publicDescription: "", hotelStars: null, distanceMeters: null })}
      kaydet={(s, yeni) => {
        const govde = { ...s, defaultCostUsd: Number(s.defaultCostUsd) || 0, hotelStars: sayiYa(s.hotelStars), distanceMeters: sayiYa(s.distanceMeters) };
        return yeni ? istek("/api/admin/service-library", { govde }) : istek(`/api/admin/service-library/${s.id}`, { method: "PUT", govde });
      }}
      sil={(s) => istek(`/api/admin/service-library/${s.id}`, { method: "PUT", govde: { ...s, defaultCostUsd: Number(s.defaultCostUsd) || 0, isActive: false } })}
      silUyari="Kalem arşivlenir (web panelindeki gibi listeden kalkar); teklif ve fiyat geçmişi korunur."
    />
  );
}
