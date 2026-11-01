// Paketler (web: /admin/packages): liste, yayın durumu, düzenleme, galeri ve "dahil olanlar".
import { useQuery } from "@tanstack/react-query";
import { istek } from "@/api/istemci";
import { KayitEkrani } from "@/ui/form";
import { jsonDizi, temizDizi } from "@/veri/json";

type Paket = { id: string; slug: string; title: string; description: string; price: number | string; currency: string; duration: string; imageUrl: string | null; gallery: unknown; includes: unknown; isPopular: boolean; published: boolean };

export default function Paketler() {
  const q = useQuery({ queryKey: ["paketler"], queryFn: () => istek<Paket[]>("/api/packages") });
  const veri = (q.data ?? []).map((p) => ({ ...p, gallery: jsonDizi(p.gallery), includes: jsonDizi(p.includes) }));
  return (
    <KayitEkrani<Paket>
      baslik="Paketler"
      q={q}
      anahtar={["paketler"]}
      veri={veri}
      bos="Paket yok"
      suzgec={{ secenekler: [{ deger: "tumu", etiket: "Tümü" }, { deger: "yayinda", etiket: "Yayında" }, { deger: "taslak", etiket: "Yayında değil" }], uygula: (p, d) => d === "tumu" || (d === "yayinda" ? p.published : !p.published) }}
      satir={(p) => ({ baslik: p.title, alt: `${p.duration} · ${p.price} ${p.currency}${p.isPopular ? " · Popüler" : ""}`, ikon: "paket", rozet: p.published ? { metin: "Yayında", ton: "yesil" } : { metin: "Taslak", ton: "gri" } })}
      alanlar={[
        { k: "title", etiket: "Paket adı" },
        { k: "slug", etiket: "Adres (slug)", yer: "ramazan-umresi-15-gece" },
        { k: "price", etiket: "Başlangıç fiyatı", tur: "sayi" },
        { k: "currency", etiket: "Para birimi", tur: "secim", secenekler: [{ deger: "USD", etiket: "USD" }, { deger: "TRY", etiket: "TL" }, { deger: "EUR", etiket: "EUR" }, { deger: "SAR", etiket: "SAR" }] },
        { k: "duration", etiket: "Süre", yer: "7 gece 8 gün" },
        { k: "description", etiket: "Açıklama", tur: "uzun" },
        { k: "includes", etiket: "Dahil olanlar", tur: "satirlar" },
        { k: "imageUrl", etiket: "Kapak görseli", tur: "gorsel" },
        { k: "gallery", etiket: "Galeri adresleri", tur: "satirlar", yer: "Her satıra bir görsel adresi" },
        { k: "isPopular", etiket: "Popüler", tur: "anahtar" },
        { k: "published", etiket: "Yayında", tur: "anahtar" },
      ]}
      yeni={() => ({ id: "", slug: "", title: "", description: "", price: "", currency: "USD", duration: "", imageUrl: null, gallery: [], includes: [], isPopular: false, published: false })}
      kaydet={(p, yeni) => {
        const govde = { ...p, price: Number(p.price) || 0, gallery: temizDizi(p.gallery), includes: temizDizi(p.includes) };
        return yeni ? istek("/api/packages", { govde }) : istek(`/api/packages?id=${p.id}`, { method: "PUT", govde });
      }}
      sil={(p) => istek(`/api/packages?id=${p.id}`, { method: "DELETE" })}
      silUyari="Paket siteden kalıcı olarak silinir. Yalnızca gizlemek için 'Yayında' anahtarını kapatın."
    />
  );
}
