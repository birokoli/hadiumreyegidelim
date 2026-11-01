// Influencer kampanyaları (web: /admin/campaigns): yeni kampanya (indirim, kod şablonu, tarih, story metinleri), durum (aktif,
// duraklatıldı, bitti) ve silme. Sunucu yalnızca durum değişikliğine izin verir; diğer alanlar oluştururken girilir.
import { useKampanyalar } from "@/veri/sorgular";
import { istek } from "@/api/istemci";
import { KayitEkrani } from "@/ui/form";
import { tarih } from "@/ui/bicim";
import type { Kampanya } from "@/veri/tipler";

type K = Kampanya & { codeTemplate?: string; maxParticipants?: string | number | null; storyEyebrow?: string; storyTitle?: string; storySub?: string; storyFeats?: string[] };
const DURUM = [{ deger: "active", etiket: "Aktif" }, { deger: "paused", etiket: "Duraklatıldı" }, { deger: "ended", etiket: "Bitti" }];
const TUR = [{ deger: "all", etiket: "Hepsi" }, { deger: "package", etiket: "Paket" }, { deger: "hotel", etiket: "Otel" }, { deger: "transfer", etiket: "Transfer" }, { deger: "flight", etiket: "Uçuş" }];
const yeniMi = (k: K) => !k.id;

export default function Kampanyalar() {
  const q = useKampanyalar();
  return (
    <KayitEkrani<K>
      baslik="Kampanyalar"
      q={q}
      anahtar={["kampanyalar"]}
      veri={(q.data?.campaigns ?? []) as K[]}
      bos="Kampanya yok"
      suzgec={{ secenekler: [{ deger: "tumu", etiket: "Tümü" }, ...DURUM], uygula: (k, d) => d === "tumu" || k.status === d }}
      satir={(k) => ({ baslik: k.title, alt: [k.discountValue ? (k.discountType === "fixed" ? `${k.discountValue} TL` : `%${k.discountValue}`) : null, k.startDate && `${tarih(k.startDate)} – ${tarih(k.endDate)}`, k._count?.participants != null ? `${k._count.participants} katılımcı` : null].filter(Boolean).join(" · "), ikon: "kampanya2", rozet: { metin: DURUM.find((d) => d.deger === k.status)?.etiket ?? k.status, ton: k.status === "active" ? "yesil" : "gri" } })}
      alanlar={[
        { k: "status", etiket: "Durum", tur: "secim", secenekler: DURUM, gizli: yeniMi },
        { k: "title", etiket: "Başlık", gizli: (k) => !yeniMi(k) },
        { k: "description", etiket: "Açıklama", tur: "uzun", gizli: (k) => !yeniMi(k) },
        { k: "type", etiket: "Kapsam", tur: "secim", secenekler: TUR, gizli: (k) => !yeniMi(k) },
        { k: "discountType", etiket: "İndirim tipi", tur: "secim", secenekler: [{ deger: "percent", etiket: "Yüzde" }, { deger: "fixed", etiket: "Sabit TL" }], gizli: (k) => !yeniMi(k) },
        { k: "discountValue", etiket: "İndirim değeri", tur: "sayi", gizli: (k) => !yeniMi(k) },
        { k: "codeTemplate", etiket: "Kod şablonu (influencer adına eklenir)", yer: "TRANSFER10", gizli: (k) => !yeniMi(k) },
        { k: "startDate", etiket: "Başlangıç (YYYY-AA-GG)", gizli: (k) => !yeniMi(k) },
        { k: "endDate", etiket: "Bitiş (YYYY-AA-GG)", gizli: (k) => !yeniMi(k) },
        { k: "maxParticipants", etiket: "En fazla katılımcı (boşsa sınırsız)", tur: "sayi", gizli: (k) => !yeniMi(k) },
        { k: "commissionPct", etiket: "Komisyon % (gösterim)", tur: "sayi", gizli: (k) => !yeniMi(k) },
        { k: "imageUrl", etiket: "Görsel", tur: "gorsel", gizli: (k) => !yeniMi(k) },
        { k: "storyEyebrow", etiket: "Story üst yazı", gizli: (k) => !yeniMi(k) },
        { k: "storyTitle", etiket: "Story başlığı", gizli: (k) => !yeniMi(k) },
        { k: "storySub", etiket: "Story alt yazı", gizli: (k) => !yeniMi(k) },
        { k: "storyFeats", etiket: "Story maddeleri", tur: "satirlar", gizli: (k) => !yeniMi(k) },
      ]}
      yeni={() => ({ id: "", title: "", slug: "", description: "", type: "all", discountType: "percent", discountValue: null, status: "active", startDate: "", endDate: "", commissionPct: null, imageUrl: null, codeTemplate: "", maxParticipants: "", storyEyebrow: "", storyTitle: "", storySub: "", storyFeats: [] })}
      kaydet={(k, yeni) => (yeni
        ? istek("/api/admin/campaigns", { govde: { ...k, storyFeats: (k.storyFeats ?? []).map((s) => s.trim()).filter(Boolean) } })
        : istek(`/api/admin/campaigns/${k.id}`, { method: "PATCH", govde: { status: k.status } }))}
      sil={(k) => istek(`/api/admin/campaigns/${k.id}`, { method: "DELETE" })}
      silUyari="Kampanya, katılımcıları ve kod kullanım kayıtlarıyla birlikte kalıcı olarak silinir. Yalnızca durdurmak için durumu Bitti yapın."
    />
  );
}
