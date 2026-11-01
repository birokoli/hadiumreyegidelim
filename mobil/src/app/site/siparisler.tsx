// Siparişler (web: /admin/orders): eski paket sihirbazından gelen siparişler; durum değiştirme, müşteriyle iletişim.
import { useState } from "react";
import { Alert, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { istek } from "@/api/istemci";
import { useIslem } from "@/veri/sorgular";
import { jsonNesne } from "@/veri/json";
import AltSayfa from "@/ui/AltSayfa";
import { KayitEkrani, Secim } from "@/ui/form";
import { Dugme, Kart, Yazi } from "@/ui/temel";
import { ara, epostaAc, tarihSaat, usd, whatsappAc } from "@/ui/bicim";

type Siparis = { id: string; pax: number; totalUSD: number; status: string; flight: string | null; hotel: string | null; transfer: string | null; guide: string | null; extras: string | null; contactInfo: string | null; createdAt: string };
const DURUM = [{ deger: "PENDING", etiket: "Beklemede" }, { deger: "CONFIRMED", etiket: "Onaylandı" }, { deger: "COMPLETED", etiket: "Tamamlandı" }, { deger: "CANCELLED", etiket: "İptal" }];
const TON = { PENDING: "turuncu", CONFIRMED: "mavi", COMPLETED: "yesil", CANCELLED: "gri" } as const;
const kisi = (s: Siparis) => jsonNesne<{ name?: string; email?: string; phone?: string }>(s.contactInfo) ?? {};

function Bilgi({ baslik, ham }: { baslik: string; ham: string | null }) {
  const n = jsonNesne(ham);
  if (!n && !ham) return null;
  const satirlar = n ? Object.entries(n).filter(([, v]) => v != null && v !== "" && typeof v !== "object").map(([k, v]) => `${k}: ${v}`) : [String(ham)];
  if (!satirlar.length) return null;
  return (
    <Kart style={{ gap: 2 }}>
      <Yazi tur="etiket">{baslik}</Yazi>
      {satirlar.map((s) => <Yazi key={s} tur="kucuk">{s}</Yazi>)}
    </Kart>
  );
}

export default function Siparisler() {
  const q = useQuery({ queryKey: ["siparisler"], queryFn: () => istek<Siparis[]>("/api/orders") });
  const [ac, setAc] = useState<Siparis | null>(null);
  const durum = useIslem((g: { id: string; status: string }) => istek(`/api/admin/orders/${g.id}`, { method: "PATCH", govde: { status: g.status } }), [["siparisler"]]);
  const k = ac ? kisi(ac) : {};
  return (
    <>
      <KayitEkrani<Siparis>
        baslik="Siparişler"
        q={q}
        anahtar={["siparisler"]}
        veri={q.data ?? []}
        bos="Sipariş yok"
        ara={(s) => `${kisi(s).name ?? ""} ${kisi(s).phone ?? ""} ${kisi(s).email ?? ""}`}
        suzgec={{ secenekler: [{ deger: "tumu", etiket: "Tümü" }, ...DURUM.map((d) => ({ ...d, sayi: (q.data ?? []).filter((s) => (s.status || "PENDING") === d.deger).length || undefined }))], uygula: (s, d) => d === "tumu" || (s.status || "PENDING") === d }}
        satir={(s) => ({ baslik: kisi(s).name || "İsimsiz", alt: `${s.pax} kişi · ${usd(s.totalUSD)} · ${tarihSaat(s.createdAt)}`, ikon: "paket", rozet: { metin: DURUM.find((d) => d.deger === (s.status || "PENDING"))?.etiket ?? s.status, ton: TON[(s.status || "PENDING") as keyof typeof TON] ?? "gri" } })}
        sec={setAc}
      />
      <AltSayfa acik={!!ac} kapat={() => setAc(null)} baslik={k.name || "Sipariş"}>
        {ac ? (
          <>
            <Yazi tur="kucuk">{`${ac.pax} kişi · ${usd(ac.totalUSD)} · ${tarihSaat(ac.createdAt)}`}</Yazi>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              {k.phone ? <Dugme metin="WhatsApp" ikon="whatsapp" tur="whatsapp" kucuk onPress={() => whatsappAc(k.phone)} /> : null}
              {k.phone ? <Dugme metin="Ara" ikon="tel" tur="hafif" kucuk onPress={() => ara(k.phone)} /> : null}
              {k.email ? <Dugme metin="E-posta" ikon="eposta" tur="hafif" kucuk onPress={() => epostaAc(k.email)} /> : null}
            </View>
            <Secim etiket="Durum" secenekler={DURUM} deger={ac.status || "PENDING"} degisti={(s) => durum.mutate({ id: ac.id, status: s }, { onSuccess: () => setAc({ ...ac, status: s }), onError: (e) => Alert.alert("Güncellenemedi", e.message) })} />
            <Bilgi baslik="İletişim" ham={ac.contactInfo} />
            <Bilgi baslik="Otel" ham={ac.hotel} />
            <Bilgi baslik="Uçuş" ham={ac.flight} />
            <Bilgi baslik="Transfer" ham={ac.transfer} />
            <Bilgi baslik="Rehber" ham={ac.guide} />
            <Bilgi baslik="Ekstralar" ham={ac.extras} />
          </>
        ) : null}
      </AltSayfa>
    </>
  );
}
