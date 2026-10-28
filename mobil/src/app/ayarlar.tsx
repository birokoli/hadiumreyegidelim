// Ayarlar: olay bazında bildirim aç/kapat, sessiz saatler, açık cihazlar (tek tek kapatılabilir), çıkış, sürüm denetimi.
import { useEffect, useState } from "react";
import { Alert, Linking, Switch, View } from "react-native";
import * as Notifications from "expo-notifications";
import { useQuery } from "@tanstack/react-query";
import { API_URL, SURUM, istek } from "@/api/istemci";
import { useOturum } from "@/oturum/Oturum";
import { bildirimleriKur } from "@/bildirim/kurulum";
import { useIslem } from "@/veri/sorgular";
import { Ayrac, Baslik, Bolum, Dugme, Ekran, Kart, Rozet, Satir, Segment, Yazi } from "@/ui/temel";
import { goreli } from "@/ui/bicim";
import { R, Y } from "@/tema";

type Tercih = { olaylar: { anahtar: string; ad: string; acik: boolean }[]; sessizBas: string | null; sessizSon: string | null };
type Cihaz = { id: string; ad: string; surum: string | null; sonGorulme: string; buCihaz: boolean; bildirim: boolean };
type Surum = { surum: string; kod: number; apk: string | null; zorunlu: boolean; notlar: string[] };

export default function Ayarlar() {
  const { cikis } = useOturum();
  const t = useQuery({ queryKey: ["tercihler"], queryFn: () => istek<Tercih>("/api/mobil/tercihler") });
  const c = useQuery({ queryKey: ["cihazlar"], queryFn: () => istek<{ cihazlar: Cihaz[] }>("/api/mobil/cihazlar") });
  const s = useQuery({ queryKey: ["surum"], queryFn: () => fetch(`${API_URL}/api/mobil/surum`).then((r) => r.json() as Promise<Surum>) });
  const kaydet = useIslem((g: { kapali: string[]; sessizBas: string | null; sessizSon: string | null }) => istek("/api/mobil/tercihler", { method: "PUT", govde: g }), [["tercihler"]]);
  const kapatCihaz = useIslem((id: string) => istek(`/api/mobil/cihazlar?id=${id}`, { method: "DELETE" }), [["cihazlar"]]);
  const [izin, setIzin] = useState<string | null>(null);
  useEffect(() => {
    Notifications.getPermissionsAsync().then((p) => setIzin(p.granted ? "acik" : "kapali"));
  }, []);

  const olaylar = t.data?.olaylar ?? [];
  const sessiz = t.data?.sessizBas ? `${t.data.sessizBas}-${t.data.sessizSon}` : "yok";
  const gonder = (degisen: Partial<{ kapali: string[]; sessiz: string }>) => {
    const kapali = degisen.kapali ?? olaylar.filter((o) => !o.acik).map((o) => o.anahtar);
    const ss = degisen.sessiz ?? sessiz;
    const [bas, son] = ss === "yok" ? [null, null] : ss.split("-");
    kaydet.mutate({ kapali, sessizBas: bas, sessizSon: son });
  };
  const yeni = s.data && s.data.surum !== SURUM && s.data.apk;

  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik="Ayarlar" geri />
      <Ekran>
        {yeni ? (
          <Kart style={{ gap: 8, backgroundColor: R.maviZemin }}>
            <Yazi tur="altBaslik">Yeni sürüm: {s.data!.surum}</Yazi>
            {s.data!.notlar.map((n) => <Yazi key={n} tur="kucuk">• {n}</Yazi>)}
            <Dugme metin="Güncellemeyi indir" ikon="indir" onPress={() => Linking.openURL(s.data!.apk!)} />
          </Kart>
        ) : null}

        <Bolum baslik="Bildirimler">
          {izin === "kapali" ? (
            <Kart style={{ gap: 8, backgroundColor: R.turuncuZemin }}>
              <Yazi>Telefon bildirimleri kapalı. Uygulama içi liste yine çalışır.</Yazi>
              <Dugme metin="Bildirimleri aç" kucuk onPress={async () => setIzin(await bildirimleriKur())} />
            </Kart>
          ) : null}
          <Kart style={{ padding: 0, overflow: "hidden" }}>
            {olaylar.map((o, i) => (
              <View key={o.anahtar}>
                {i ? <Ayrac /> : null}
                <Satir baslik={o.ad} sag={<Switch value={o.acik} trackColor={{ true: R.lacivert }} onValueChange={(v) => gonder({ kapali: olaylar.filter((x) => (x.anahtar === o.anahtar ? !v : !x.acik)).map((x) => x.anahtar) })} />} />
              </View>
            ))}
          </Kart>
          <Yazi tur="etiket">Sessiz saatler</Yazi>
          <Segment secenekler={[{ deger: "yok", etiket: "Yok" }, { deger: "23:00-08:00", etiket: "23:00–08:00" }, { deger: "22:00-09:00", etiket: "22:00–09:00" }, { deger: "00:00-07:00", etiket: "00:00–07:00" }]} deger={sessiz} degisti={(v) => gonder({ sessiz: v })} />
          <Yazi tur="kucuk">Sessiz saatlerde telefona bildirim gelmez; olaylar Bildirimler listesinde görünür.</Yazi>
        </Bolum>

        <Bolum baslik="Açık cihazlar">
          <Kart style={{ padding: 0, overflow: "hidden" }}>
            {(c.data?.cihazlar ?? []).map((d, i) => (
              <View key={d.id}>
                {i ? <Ayrac /> : null}
                <Satir
                  ikon="kilit"
                  baslik={d.ad || "Android"}
                  alt={`${d.surum ? `Sürüm ${d.surum} · ` : ""}${goreli(d.sonGorulme)}${d.bildirim ? " · bildirim açık" : ""}`}
                  sag={d.buCihaz ? <Rozet metin="Bu cihaz" ton="yesil" /> : <Dugme metin="Kapat" kucuk tur="tehlike" onPress={() => Alert.alert("Cihazı kapat", `${d.ad} oturumu kapatılsın mı?`, [{ text: "Vazgeç" }, { text: "Kapat", style: "destructive", onPress: () => kapatCihaz.mutate(d.id) }])} />}
                />
              </View>
            ))}
          </Kart>
        </Bolum>

        <Dugme metin="Çıkış yap" ikon="cikis" tur="tehlike" onPress={() => Alert.alert("Çıkış", "Bu cihazdan çıkış yapılsın mı? Bildirimler de durur.", [{ text: "Vazgeç" }, { text: "Çıkış yap", style: "destructive", onPress: cikis }])} />
        <Yazi tur="kucuk" style={{ textAlign: "center", fontFamily: Y.yari }}>Hadi Yönetim {SURUM}</Yazi>
      </Ekran>
    </View>
  );
}
