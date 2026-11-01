// Sayfa metinleri: sitedeki sayfaların başlık ve yazıları; dokununca o sayfanın alanları.
import { router } from "expo-router";
import { KayitEkrani } from "@/ui/form";
import { useSayfaMetinleri, type SayfaTanim } from "@/veri/sayfaMetinleri";

export default function SayfaMetinleri() {
  const q = useSayfaMetinleri();
  const deger = q.data?.values ?? {};
  return (
    <KayitEkrani<SayfaTanim>
      baslik="Sayfa metinleri"
      q={q}
      anahtar={["sayfa-metinleri"]}
      veri={q.data?.pages ?? []}
      bos="Sayfa yok"
      satir={(p) => {
        const n = Object.keys(deger[p.id] ?? {}).length;
        return { baslik: p.label, alt: `${p.path} · ${p.fields.length} alan`, ikon: "belge", rozet: n ? { metin: `${n} değişik`, ton: "kum" } : undefined };
      }}
      sec={(p) => router.push({ pathname: "/site/sayfa/[id]", params: { id: p.id } })}
    />
  );
}
