// Blog kategorileri (web: /admin/categories)
import { useQuery } from "@tanstack/react-query";
import { istek } from "@/api/istemci";
import { KayitEkrani } from "@/ui/form";

type Kategori = { id: string; slug: string; name: string; description: string | null; _count?: { posts: number } };
const slugla = (s: string) => s.toLocaleLowerCase("tr-TR").replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function Kategoriler() {
  const q = useQuery({ queryKey: ["kategoriler"], queryFn: () => istek<Kategori[]>("/api/categories") });
  return (
    <KayitEkrani<Kategori>
      baslik="Kategoriler"
      q={q}
      anahtar={["kategoriler"]}
      veri={q.data ?? []}
      bos="Kategori yok"
      satir={(k) => ({ baslik: k.name, alt: `/${k.slug} · ${k._count?.posts ?? 0} yazı`, ikon: "etiket" })}
      alanlar={[{ k: "name", etiket: "Ad" }, { k: "slug", etiket: "Adres (boşsa addan)" }, { k: "description", etiket: "Açıklama", tur: "uzun" }]}
      yeni={() => ({ id: "", slug: "", name: "", description: "" })}
      kaydet={(k, yeni) => {
        const govde = { name: k.name.trim(), slug: k.slug.trim() || slugla(k.name), description: k.description || null };
        return yeni ? istek("/api/categories", { govde }) : istek(`/api/categories?id=${k.id}`, { method: "PUT", govde });
      }}
      sil={(k) => istek(`/api/categories?id=${k.id}`, { method: "DELETE" })}
      silUyari="Kategori silinir; içindeki yazılar silinmez ama kategorisiz kalır."
    />
  );
}
