// Otel rehberi (web: /admin/otel-rehberi): Mekke otel sayfaları. Google verisi çekme, bölge, yapay zekâ metni yazdırma,
// metni okuyup düzenleyerek onaylama (sayfa yayına girer) ya da yayından kaldırma.
import { useState } from "react";
import { Alert, View } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { istek } from "@/api/istemci";
import { KayitEkrani, Secim } from "@/ui/form";
import AltSayfa from "@/ui/AltSayfa";
import { Alan, Dugme, Kart, Rozet, Yazi } from "@/ui/temel";
import { R } from "@/tema";

type Otel = {
  slug: string; name: string; district: string; districtLabel: string; kaabaMeters: number | null; stars: number | null; published: boolean;
  google: { title: string; matchScore: number; about: boolean; amenities: number; neighborhood: string | null } | null;
  content: { description: string; faq: { q: string; a: string }[]; note: string | null; approved: boolean; writtenAt: string } | null;
};
type Veri = { hotels: Otel[]; failed: { slug: string; name: string; reason: string }[]; fetched: number };
const BOLGE = [
  { deger: "ajyad", etiket: "Ajyad" }, { deger: "cebel-omer", etiket: "Cebel Ömer" }, { deger: "cerval", etiket: "Cerval" }, { deger: "mescid-i-cin", etiket: "Mescid-i Cin" },
  { deger: "mahbes", etiket: "Mahbes" }, { deger: "nuzha", etiket: "Nüzha" }, { deger: "misfele", etiket: "Misfele" }, { deger: "aziziye", etiket: "Aziziye" }, { deger: "utaybiye", etiket: "Utaybiye" }, { deger: "diger", etiket: "Mekke (diğer)" },
];
const HEDEF = new Set(["ajyad", "cebel-omer", "cerval", "mescid-i-cin", "mahbes", "nuzha", "misfele"]);

export default function OtelRehberi() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["otel-rehberi"], queryFn: () => istek<Veri>("/api/admin/hotel-guide") });
  const [ac, setAc] = useState<Otel | null>(null);
  const [taslak, setTaslak] = useState("");
  const [mesgul, setMesgul] = useState<string | null>(null);
  const yap = async (ad: string, govde: Record<string, unknown>, mesaj?: (r: Record<string, unknown>) => string) => {
    setMesgul(ad);
    try {
      const r = await istek<Record<string, unknown>>("/api/admin/hotel-guide", { govde });
      if (r.ok === false) throw new Error(String(r.error ?? "Olmadı"));
      const yeni = await qc.fetchQuery({ queryKey: ["otel-rehberi"], queryFn: () => istek<Veri>("/api/admin/hotel-guide") });
      if (ac) {
        const o = yeni.hotels.find((h) => h.slug === ac.slug) ?? null;
        setAc(o);
        if (o?.content && ad === "yaz") setTaslak(o.content.description);
      }
      if (mesaj) Alert.alert("Tamam", mesaj(r));
    } catch (e) {
      Alert.alert("Olmadı", e instanceof Error ? e.message : "");
    } finally {
      setMesgul(null);
    }
  };
  const veri = (q.data?.hotels ?? []).slice().sort((a, b) => (a.kaabaMeters ?? 1e9) - (b.kaabaMeters ?? 1e9));
  return (
    <>
      <KayitEkrani<Otel & { id: string }>
        baslik="Otel rehberi"
        alt={q.data ? `${veri.filter((h) => h.published).length} yayında · Google verisi ${q.data.fetched} / ${veri.length}` : undefined}
        q={q}
        anahtar={["otel-rehberi"]}
        veri={veri.map((h) => ({ ...h, id: h.slug }))}
        bos="Otel yok"
        suzgec={{ secenekler: [{ deger: "hedef", etiket: "Harem çevresi" }, { deger: "bekleyen", etiket: "Onay bekleyen" }, { deger: "yayinda", etiket: "Yayında" }, { deger: "hepsi", etiket: "Hepsi" }], uygula: (h, d) => d === "hepsi" || (d === "hedef" ? HEDEF.has(h.district) : d === "yayinda" ? h.published : !!h.content && !h.content.approved) }}
        satir={(h) => ({ baslik: h.name, alt: [h.districtLabel, h.kaabaMeters != null ? `Kâbe'ye ${h.kaabaMeters} m` : null, h.stars ? `${h.stars}★` : null, h.google ? "Google ✓" : "Google verisi yok"].filter(Boolean).join(" · "), ikon: "otel", rozet: h.published ? { metin: "Yayında", ton: "yesil" } : h.content ? { metin: "Metin hazır", ton: "turuncu" } : undefined })}
        sec={(h) => { setAc(h); setTaslak(h.content?.description ?? ""); }}
        ust={
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Dugme metin="Google verisi çek (8)" kucuk tur="hafif" yukleniyor={mesgul === "cek"} style={{ flex: 1 }} onPress={() => yap("cek", { action: "fetch" }, (r) => `${Array.isArray(r.results) ? r.results.length : 0} otel denendi, ${String(r.remaining ?? 0)} otel kaldı.`)} />
            <Dugme metin="Tanıtım tamamla" kucuk tur="hafif" yukleniyor={mesgul === "about"} style={{ flex: 1 }} onPress={() => yap("about", { action: "about" }, (r) => `${r.checked} otel kontrol edildi, ${r.filled} tanıtım eklendi.`)} />
          </View>
        }
      />
      <AltSayfa acik={!!ac} kapat={() => setAc(null)} baslik={ac?.name ?? ""}>
        {ac ? (
          <>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              {ac.kaabaMeters != null ? <Rozet metin={`Kâbe'ye ${ac.kaabaMeters} m`} /> : null}
              {ac.google ? <Rozet metin={`Google eşleşme %${Math.round(ac.google.matchScore * 100)}`} ton="yesil" /> : <Rozet metin="Google verisi yok" ton="gri" />}
              {ac.published ? <Rozet metin="Yayında" ton="yesil" /> : null}
            </View>
            <Secim etiket="Bölge" secenekler={BOLGE} deger={ac.district} degisti={(district) => yap("bolge", { action: "district", slug: ac.slug, district })} />
            {!HEDEF.has(ac.district) ? <Yazi tur="kucuk" renk={R.turuncu}>Yalnızca Harem çevresindeki bölgelerin sayfası yayına alınır.</Yazi> : null}
            {ac.content ? (
              <>
                <Alan etiket="Sayfa metni (okuyup düzenleyin)" value={taslak} onChangeText={setTaslak} multiline style={{ minHeight: 220 }} />
                {ac.content.faq.length ? (
                  <Kart style={{ gap: 4, padding: 12 }}>
                    <Yazi tur="etiket">SSS</Yazi>
                    {ac.content.faq.map((f, i) => <Yazi key={i} tur="kucuk">{`${f.q} — ${f.a}`}</Yazi>)}
                  </Kart>
                ) : null}
                {ac.content.note ? <Yazi tur="kucuk" renk={R.turuncu}>{ac.content.note}</Yazi> : null}
                <Dugme metin={ac.published ? "Metni güncelle (yayında kalır)" : "Onayla ve yayınla"} ikon="tik" yukleniyor={mesgul === "onay"} devreDisi={!HEDEF.has(ac.district)} onPress={() => yap("onay", { action: "approve", slug: ac.slug, approved: true, description: taslak }, () => "Sayfa yayında.")} />
                {ac.published ? <Dugme metin="Yayından kaldır" tur="tehlike" yukleniyor={mesgul === "kaldir"} onPress={() => yap("kaldir", { action: "approve", slug: ac.slug, approved: false }, () => "Yayından kaldırıldı.")} /> : null}
                <Dugme metin="Metni yeniden yazdır" tur="hafif" ikon="yapayzeka" yukleniyor={mesgul === "yaz"} onPress={() => yap("yaz", { action: "write", slug: ac.slug })} />
              </>
            ) : (
              <Dugme metin="Yapay zekâya metin yazdır" ikon="yapayzeka" yukleniyor={mesgul === "yaz"} devreDisi={!ac.google} onPress={() => yap("yaz", { action: "write", slug: ac.slug })} />
            )}
          </>
        ) : null}
      </AltSayfa>
    </>
  );
}
