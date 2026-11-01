// Rehber sayfaları (web: /admin/content/rehber): sözlük, karşılaştırma, kişiye ve döneme göre umre sayfaları.
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { istek } from "@/api/istemci";
import { KayitEkrani } from "@/ui/form";

type Satir = { slug: string; group: string; path: string; h1: string; keyword: string; reviewed: string; edited: boolean; savedAt: string | null; codeNewer: boolean };
const GRUP = [{ deger: "tumu", etiket: "Tümü" }, { deger: "sozluk", etiket: "Sözlük" }, { deger: "karsilastirma", etiket: "Karşılaştırma" }, { deger: "kisi", etiket: "Kime göre" }, { deger: "zaman", etiket: "Döneme göre" }];

export default function RehberSayfalari() {
  const q = useQuery({ queryKey: ["rehber-sayfalari"], queryFn: () => istek<{ pages: Satir[] }>("/api/admin/content-pages") });
  return (
    <KayitEkrani<Satir & { id: string }>
      baslik="Rehber sayfaları"
      q={q}
      anahtar={["rehber-sayfalari"]}
      veri={(q.data?.pages ?? []).map((p) => ({ ...p, id: p.slug }))}
      bos="Sayfa yok"
      ara={(p) => `${p.h1} ${p.keyword} ${p.path}`}
      suzgec={{ secenekler: GRUP, uygula: (p, d) => d === "tumu" || p.group === d }}
      satir={(p) => ({ baslik: p.h1, alt: `${p.path} · ${p.keyword} · gözden geçirme ${p.reviewed}`, ikon: "rehber", rozet: p.codeNewer ? { metin: "Kodda yeni sürüm", ton: "turuncu" } : p.edited ? { metin: "Düzenlendi", ton: "mavi" } : undefined })}
      sec={(p) => router.push({ pathname: "/site/rehber/[slug]", params: { slug: p.slug } })}
    />
  );
}
