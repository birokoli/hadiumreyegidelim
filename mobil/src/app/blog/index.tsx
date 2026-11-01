// Blog yazıları (web: /admin/content): yayında / taslak / zamanlanmış; dokununca yazı düzenleyici.
import { router } from "expo-router";
import { KayitEkrani } from "@/ui/form";
import { useYazilar, type Yazi } from "@/veri/blog";
import { goreli, tarih } from "@/ui/bicim";

export default function Yazilar() {
  const q = useYazilar();
  const veri = q.data ?? [];
  const zamanli = (y: Yazi) => !y.published && !!y.scheduledAt;
  return (
    <KayitEkrani<Yazi>
      baslik="Blog yazıları"
      q={q}
      anahtar={["yazilar"]}
      veri={veri}
      bos="Yazı yok"
      ara={(y) => `${y.title} ${y.slug} ${y.focusKeyword ?? ""}`}
      suzgec={{ secenekler: [
        { deger: "tumu", etiket: "Tümü" },
        { deger: "yayinda", etiket: "Yayında", sayi: veri.filter((y) => y.published).length },
        { deger: "taslak", etiket: "Taslak", sayi: veri.filter((y) => !y.published && !y.scheduledAt).length || undefined },
        { deger: "zamanli", etiket: "Zamanlanmış", sayi: veri.filter(zamanli).length || undefined },
      ], uygula: (y, d) => d === "tumu" || (d === "yayinda" ? y.published : d === "zamanli" ? zamanli(y) : !y.published && !y.scheduledAt) }}
      satir={(y) => ({ baslik: y.title, alt: [y.category?.name, y.published ? tarih(y.createdAt, true) : y.scheduledAt ? `yayın ${tarih(y.scheduledAt)}` : `düzenlendi ${goreli(y.updatedAt)}`, y.seoScore != null ? `SEO ${y.seoScore}` : null].filter(Boolean).join(" · "), ikon: "kalem", rozet: y.published ? { metin: "Yayında", ton: "yesil" } : zamanli(y) ? { metin: "Zamanlı", ton: "kum" } : { metin: "Taslak", ton: "gri" } })}
      sec={(y) => router.push({ pathname: "/blog/[id]", params: { id: y.id } })}
      ekle={() => router.push({ pathname: "/blog/[id]", params: { id: "yeni" } })}
    />
  );
}
