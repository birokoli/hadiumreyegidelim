// Rehberler / hocalar (web: /admin/guides)
import { useQuery } from "@tanstack/react-query";
import { istek } from "@/api/istemci";
import { KayitEkrani } from "@/ui/form";
import { usd } from "@/ui/bicim";

type Rehber = { id: string; slug: string | null; name: string; title: string; price: number | string; image: string | null; biography: string | null; quote: string | null; youtubeUrl: string | null; expertise: string | null; publications: string | null };

export default function Rehberler() {
  const q = useQuery({ queryKey: ["rehberler"], queryFn: () => istek<Rehber[]>("/api/guides") });
  return (
    <KayitEkrani<Rehber>
      baslik="Rehberler"
      q={q}
      anahtar={["rehberler"]}
      veri={q.data ?? []}
      bos="Rehber yok"
      satir={(r) => ({ baslik: r.name, alt: `${r.title} · ${usd(Number(r.price))}`, ikon: "rehber" })}
      alanlar={[
        { k: "name", etiket: "Ad soyad" },
        { k: "title", etiket: "Unvan" },
        { k: "slug", etiket: "Adres (slug)" },
        { k: "price", etiket: "Ücret ($)", tur: "sayi" },
        { k: "image", etiket: "Fotoğraf", tur: "gorsel" },
        { k: "biography", etiket: "Biyografi", tur: "uzun" },
        { k: "quote", etiket: "Söz", tur: "uzun" },
        { k: "expertise", etiket: "Uzmanlık alanları" },
        { k: "publications", etiket: "Yayınlar", tur: "uzun" },
        { k: "youtubeUrl", etiket: "YouTube adresi" },
      ]}
      yeni={() => ({ id: "", slug: "", name: "", title: "", price: "", image: null, biography: "", quote: "", youtubeUrl: "", expertise: "", publications: "" })}
      kaydet={(r, yeni) => {
        const { id, ...govde } = r;
        return yeni ? istek("/api/guides", { govde: { ...govde, price: Number(r.price) || 0 } }) : istek(`/api/guides?id=${id}`, { method: "PUT", govde: { ...govde, price: Number(r.price) || 0 } });
      }}
      sil={(r) => istek(`/api/guides?id=${r.id}`, { method: "DELETE" })}
    />
  );
}
