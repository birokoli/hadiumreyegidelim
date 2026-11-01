// Blog yazarları (web: /admin/authors)
import { useQuery } from "@tanstack/react-query";
import { istek } from "@/api/istemci";
import { KayitEkrani } from "@/ui/form";

type Yazar = { id: string; name: string; bio: string | null; image: string | null; expertise: string | null; linkedin: string | null; twitter: string | null; _count?: { posts: number } };

export default function Yazarlar() {
  const q = useQuery({ queryKey: ["yazarlar"], queryFn: () => istek<Yazar[]>("/api/authors") });
  return (
    <KayitEkrani<Yazar>
      baslik="Yazarlar"
      q={q}
      anahtar={["yazarlar"]}
      veri={q.data ?? []}
      bos="Yazar yok"
      satir={(y) => ({ baslik: y.name, alt: [y.expertise, `${y._count?.posts ?? 0} yazı`].filter(Boolean).join(" · "), ikon: "kullanici" })}
      alanlar={[
        { k: "name", etiket: "Ad soyad" },
        { k: "expertise", etiket: "Uzmanlık" },
        { k: "bio", etiket: "Biyografi", tur: "uzun" },
        { k: "image", etiket: "Fotoğraf", tur: "gorsel" },
        { k: "linkedin", etiket: "LinkedIn adresi" },
        { k: "twitter", etiket: "X / Twitter adresi" },
      ]}
      yeni={() => ({ id: "", name: "", bio: "", image: null, expertise: "", linkedin: "", twitter: "" })}
      kaydet={(y, yeni) => {
        const { id, _count, ...govde } = y;
        return yeni ? istek("/api/authors", { govde }) : istek(`/api/authors?id=${id}`, { method: "PUT", govde });
      }}
      sil={(y) => istek(`/api/authors?id=${y.id}`, { method: "DELETE" })}
      silUyari="Yazar silinir; yazıları silinmez, yazarsız kalır."
    />
  );
}
