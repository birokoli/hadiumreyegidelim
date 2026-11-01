// Üye kampanyaları (web: /admin/uye-kampanyalari): üyelere özel tarihli kampanyalar + paketlerde üye fiyatı kuralı.
import { useState } from "react";
import { Alert, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { istek } from "@/api/istemci";
import { useIslem } from "@/veri/sorgular";
import { KayitEkrani } from "@/ui/form";
import AltSayfa from "@/ui/AltSayfa";
import { Alan, Dugme, Kart, Satir, Segment, Yazi, Ayrac } from "@/ui/temel";
import { usd } from "@/ui/bicim";

type Kampanya = {
  id: string; baslik: string; aciklama: string; gorsel: string | null; hat: string | null; gidis: string | null; donus: string | null;
  mekkeGece: number | string | null; medineGece: number | string | null; mekkeOtel: string | null; medineOtel: string | null; dahil: string;
  uyeFiyat: number | string | null; normalFiyat: number | string | null; kontenjan: number | string | null; sonTarih: string | null; hedef: string | null;
  durum: "taslak" | "yayinda" | "kapali"; sira: number;
};
type Paket = { slug: string; title: string; fiyat: number; para: string; kural: { tip: "yuzde" | "tutar"; deger: number } | null };
type Veri = { kampanyalar: Kampanya[]; sayac: Record<string, { talep: number; kisi: number; satis: number }>; paketler: Paket[] };
const DURUM = [{ deger: "taslak", etiket: "Taslak" }, { deger: "yayinda", etiket: "Yayında" }, { deger: "kapali", etiket: "Kapalı" }];
const sayi = (v: unknown) => (v === "" || v == null ? null : Number(String(v).replace(",", ".")));

export default function UyeKampanyalari() {
  const q = useQuery({ queryKey: ["uye-kampanyalari"], queryFn: () => istek<Veri>("/api/admin/uye-kampanyalari") });
  const [paket, setPaket] = useState<{ p: Paket; tip: "yuzde" | "tutar"; deger: string } | null>(null);
  const kural = useIslem((g: { slug: string; tip: string; deger: string }) => istek("/api/admin/uye-kampanyalari", { govde: { action: "paket-uye", ...g } }), [["uye-kampanyalari"]]);
  const paketler = q.data?.paketler ?? [];
  return (
    <>
      <KayitEkrani<Kampanya>
        baslik="Üye kampanyaları"
        q={q}
        anahtar={["uye-kampanyalari"]}
        veri={q.data?.kampanyalar ?? []}
        bos="Kampanya yok"
        suzgec={{ secenekler: [{ deger: "tumu", etiket: "Tümü" }, ...DURUM], uygula: (k, d) => d === "tumu" || k.durum === d }}
        satir={(k) => {
          const s = q.data?.sayac[k.id];
          return { baslik: k.baslik.replace(/\*/g, ""), alt: [k.gidis, k.uyeFiyat ? `üye ${usd(Number(k.uyeFiyat))}` : null, s ? `${s.talep} talep · ${s.satis} satış` : null].filter(Boolean).join(" · "), ikon: "kampanya2", rozet: { metin: DURUM.find((d) => d.deger === k.durum)?.etiket ?? k.durum, ton: k.durum === "yayinda" ? "yesil" : "gri" } };
        }}
        ust={paketler.length ? (
          <Kart style={{ padding: 0, overflow: "hidden" }}>
            <View style={{ padding: 14, paddingBottom: 4 }}><Yazi tur="etiket">Paketlerde üye fiyatı</Yazi></View>
            {paketler.map((p, i) => (
              <View key={p.slug}>
                {i ? <Ayrac /> : null}
                <Satir ikon="paket" baslik={p.title} alt={`${p.fiyat} ${p.para}${p.kural ? ` · üyeye ${p.kural.tip === "yuzde" ? `%${p.kural.deger}` : `${p.kural.deger} $`} indirim` : " · üye indirimi yok"}`} onPress={() => setPaket({ p, tip: p.kural?.tip ?? "yuzde", deger: p.kural ? String(p.kural.deger) : "" })} />
              </View>
            ))}
          </Kart>
        ) : undefined}
        alanlar={[
          { k: "baslik", etiket: "Başlık", alt: "*yıldızlı* kısım italik görünür" },
          { k: "durum", etiket: "Durum", tur: "secim", secenekler: DURUM },
          { k: "aciklama", etiket: "Açıklama", tur: "uzun" },
          { k: "gorsel", etiket: "Görsel", tur: "gorsel" },
          { k: "gidis", etiket: "Gidiş (YYYY-AA-GG)" },
          { k: "donus", etiket: "Dönüş (YYYY-AA-GG)" },
          { k: "mekkeGece", etiket: "Mekke gece", tur: "sayi" },
          { k: "mekkeOtel", etiket: "Mekke oteli" },
          { k: "medineGece", etiket: "Medine gece", tur: "sayi" },
          { k: "medineOtel", etiket: "Medine oteli" },
          { k: "dahil", etiket: "Dahil olanlar (satır satır)", tur: "uzun" },
          { k: "uyeFiyat", etiket: "Üye fiyatı, kişi başı ($)", tur: "sayi" },
          { k: "normalFiyat", etiket: "Normal fiyat ($)", tur: "sayi" },
          { k: "kontenjan", etiket: "Kontenjan (kişi, boşsa sınırsız)", tur: "sayi" },
          { k: "sonTarih", etiket: "Son başvuru (YYYY-AA-GG)" },
          { k: "hedef", etiket: "Hedef dönem", yer: "2026-12 ya da ramazan", alt: "Bu dönemi planlayan üyelere gösterilir" },
          { k: "hat", etiket: "Arapça süs yazısı" },
        ]}
        yeni={() => ({ id: "", baslik: "", aciklama: "", gorsel: null, hat: "", gidis: "", donus: "", mekkeGece: "", medineGece: "", mekkeOtel: "", medineOtel: "", dahil: "", uyeFiyat: "", normalFiyat: "", kontenjan: "", sonTarih: "", hedef: "", durum: "taslak", sira: 0 })}
        kaydet={(k, yeni) => istek("/api/admin/uye-kampanyalari", { govde: { kampanya: { ...k, id: yeni ? undefined : k.id, mekkeGece: sayi(k.mekkeGece), medineGece: sayi(k.medineGece), uyeFiyat: sayi(k.uyeFiyat), normalFiyat: sayi(k.normalFiyat), kontenjan: sayi(k.kontenjan), gidis: k.gidis || null, donus: k.donus || null, sonTarih: k.sonTarih || null, hedef: k.hedef || null } } })}
        sil={(k) => istek("/api/admin/uye-kampanyalari", { govde: { action: "delete", id: k.id } })}
      />
      <AltSayfa acik={!!paket} kapat={() => setPaket(null)} baslik={paket?.p.title ?? ""}>
        <Yazi tur="kucuk">Giriş yapmış üyeye paket fiyatından bu indirim düşülerek gösterilir. Boş bırakırsanız üye indirimi kalkar.</Yazi>
        <Segment secenekler={[{ deger: "yuzde", etiket: "Yüzde" }, { deger: "tutar", etiket: "Tutar ($)" }]} deger={paket?.tip ?? "yuzde"} degisti={(tip) => setPaket((o) => (o ? { ...o, tip } : o))} />
        <Alan etiket={paket?.tip === "tutar" ? "İndirim ($)" : "İndirim % (en fazla 50)"} value={paket?.deger ?? ""} onChangeText={(deger) => setPaket((o) => (o ? { ...o, deger } : o))} keyboardType="decimal-pad" />
        <Dugme metin="Kaydet" yukleniyor={kural.isPending} onPress={() => paket && kural.mutate({ slug: paket.p.slug, tip: paket.tip, deger: paket.deger }, { onSuccess: () => setPaket(null), onError: (e) => Alert.alert("Kaydedilemedi", e.message) })} />
      </AltSayfa>
    </>
  );
}
