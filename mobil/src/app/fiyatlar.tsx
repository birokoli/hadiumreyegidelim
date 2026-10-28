// Hizmet fiyatları (salt okunur): seçilen ayın satış fiyatları. Düzenleme web panelinde (toplu tablo).
import { useMemo, useState } from "react";
import { View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { istek } from "@/api/istemci";
import { useFiyatlar } from "@/veri/sorgular";
import { Arama, Baslik, IkonDugme, Satir, Segment, Yazi } from "@/ui/temel";
import { router } from "expo-router";
import Liste from "@/ui/Liste";
import { usd } from "@/ui/bicim";
import { Y } from "@/tema";

const AY = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
const KAT: Record<string, string> = { hotel: "otel", transfer: "transfer", vize: "vize", tur: "kabe", extra: "paket", flight: "ucak" };

export default function Fiyatlar() {
  const f = useFiyatlar();
  const k = useQuery({ queryKey: ["kutuphane"], queryFn: () => istek<{ services: { id: string; name: string; category: string; city: string | null; isActive: boolean }[] }>("/api/admin/service-library") });
  const aylar = f.data?.months ?? [];
  const [ay, setAy] = useState<string | null>(null);
  const [t, setT] = useState("");
  const secAy = ay ?? aylar[0];
  const liste = useMemo(() => (k.data?.services ?? []).filter((s) => s.isActive && (!t || s.name.toLocaleLowerCase("tr-TR").includes(t.toLocaleLowerCase("tr-TR")))).map((s) => {
    const p = (f.data?.prices ?? []).filter((x) => x.serviceId === s.id && x.month === secAy);
    return { ...s, fiyat: p.length ? Math.min(...p.map((x) => x.salePriceUsd)) : null, cesit: p.length };
  }), [k.data, f.data, secAy, t]);
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik="Hizmet fiyatları" alt={f.data?.payment.usdTry ? `1 $ = ${f.data.payment.usdTry} TL · IBAN +%${f.data.payment.ibanPercent} · kart +%${f.data.payment.cardPercent}` : undefined} geri sag={<IkonDugme ikon="kalem" etiket="Fiyatları düzenle" onPress={() => router.push({ pathname: "/panel", params: { yol: "/admin/fiyat-teklifleri/hizmetler/fiyatlar", baslik: "Aylık fiyatlar" } })} />} />
      <View style={{ paddingHorizontal: 16, gap: 8, paddingBottom: 8 }}>
        <Arama deger={t} degisti={setT} yer="Otel, transfer, vize…" />
        <Segment secenekler={aylar.map((m) => ({ deger: m, etiket: `${AY[Number(m.slice(5, 7)) - 1]} ${m.slice(2, 4)}` }))} deger={secAy ?? ""} degisti={setAy} />
      </View>
      <Liste q={k} veri={liste} anahtar={(s) => s.id} bos="Hizmet yok" satir={(s) => (
        <Satir ikon={KAT[s.category] ?? "paket"} baslik={s.name} alt={[s.city, s.cesit > 1 ? `${s.cesit} fiyat çeşidi, en düşük` : null].filter(Boolean).join(" · ")} sag={<Yazi style={{ fontFamily: Y.kalin }}>{usd(s.fiyat)}</Yazi>} />
      )} />
    </View>
  );
}
