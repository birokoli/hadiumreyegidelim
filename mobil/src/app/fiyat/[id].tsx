// Tek kalemin aylık satış fiyatları (web: Aylık fiyatlar tablosunun bir satırı). Otelde 2/3/4 kişilik oda fiyatı ayrı girilir.
// Boş bırakılan hücre silinir (sunucu kuralı). Kaydet yalnızca değişen hücreleri gönderir.
import { useEffect, useMemo, useState } from "react";
import { Alert, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { istek } from "@/api/istemci";
import { Baslik, Dugme, Ekran, Kart, Yazi, Yukleniyor } from "@/ui/temel";
import { OTEL_VARYANT, ayAdi, type AyFiyat } from "@/veri/katalog";
import { KOSE, R, Y } from "@/tema";

export default function KalemFiyatlari() {
  const { id, ad, kat } = useLocalSearchParams<{ id: string; ad?: string; kat?: string }>();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["fiyatlar", 18], queryFn: () => istek<{ months: string[]; prices: AyFiyat[] }>("/api/admin/service-prices?n=18") });
  const otel = kat === "hotel";
  const varyantlar = otel ? [{ deger: "", etiket: "Oda / gece (tek fiyat)" }, ...OTEL_VARYANT] : [{ deger: "", etiket: "Satış fiyatı" }];
  const ilk = useMemo(() => {
    const m: Record<string, string> = {};
    for (const p of q.data?.prices ?? []) if (p.serviceId === id) m[`${p.month}|${p.variant}`] = String(p.salePriceUsd);
    return m;
  }, [q.data, id]);
  const [deger, setDeger] = useState<Record<string, string>>({});
  useEffect(() => setDeger(ilk), [ilk]);
  const [mesgul, setMesgul] = useState(false);
  const degisen = Object.keys({ ...ilk, ...deger }).filter((k) => (ilk[k] ?? "") !== (deger[k] ?? ""));
  const kaydet = async () => {
    setMesgul(true);
    try {
      const cells = degisen.map((k) => {
        const [month, variant] = k.split("|");
        const v = (deger[k] ?? "").replace(",", ".").trim();
        return { serviceId: id, month, variant, salePriceUsd: v ? Number(v) : null };
      });
      await istek("/api/admin/service-prices", { method: "PUT", govde: { cells } });
      await qc.invalidateQueries({ queryKey: ["fiyatlar"] });
      Alert.alert("Kaydedildi", `${cells.length} fiyat güncellendi.`);
    } catch (e) {
      Alert.alert("Kaydedilemedi", e instanceof Error ? e.message : "");
    } finally {
      setMesgul(false);
    }
  };
  const oncekiniKopyala = (i: number) => {
    const aylar = q.data?.months ?? [];
    if (i === 0) return;
    setDeger((o) => {
      const n = { ...o };
      for (const v of varyantlar) n[`${aylar[i]}|${v.deger}`] = o[`${aylar[i - 1]}|${v.deger}`] ?? "";
      return n;
    });
  };
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik={ad ?? "Fiyatlar"} alt="Satış fiyatı, $ · KDV hariç · boş = fiyat yok" geri />
      {q.isPending ? <Yukleniyor /> : (
        <Ekran yenile={q.refetch} yenileniyor={q.isRefetching}>
          {otel ? <Yazi tur="kucuk">Otelde fiyat 1 odanın 1 gecesidir. 2/3/4 kişilik oda fiyatı girilirse planlayıcı kişileri odalara dağıtıp her odayı kendi fiyatıyla hesaplar.</Yazi> : null}
          {(q.data?.months ?? []).map((m, i) => (
            <Kart key={m} style={{ gap: 8 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Yazi tur="altBaslik" style={{ flex: 1 }}>{ayAdi(m)}</Yazi>
                {i > 0 ? <Dugme metin="Önceki ay" kucuk tur="hafif" onPress={() => oncekiniKopyala(i)} /> : null}
              </View>
              {varyantlar.map((v) => {
                const k = `${m}|${v.deger}`;
                const degisti = (ilk[k] ?? "") !== (deger[k] ?? "");
                return (
                  <View key={k} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Yazi style={{ flex: 1 }} tur="kucuk">{v.etiket}</Yazi>
                    <TextInput
                      value={deger[k] ?? ""}
                      onChangeText={(x) => setDeger((o) => ({ ...o, [k]: x }))}
                      keyboardType="decimal-pad"
                      placeholder="—"
                      placeholderTextColor={R.soluk}
                      style={{ width: 120, minHeight: 44, borderRadius: KOSE.s, borderWidth: 1, borderColor: degisti ? R.altin : R.cizgi, backgroundColor: degisti ? "#FBF3DE" : R.kart, paddingHorizontal: 12, fontFamily: Y.kalin, fontSize: 16, color: R.yazi, textAlign: "right" }}
                    />
                  </View>
                );
              })}
            </Kart>
          ))}
        </Ekran>
      )}
      {degisen.length ? (
        <View style={{ padding: 16, backgroundColor: R.kart, borderTopWidth: 1, borderTopColor: R.cizgi }}>
          <Dugme metin={`${degisen.length} değişikliği kaydet`} ikon="tik" yukleniyor={mesgul} onPress={kaydet} />
        </View>
      ) : null}
    </View>
  );
}
