// Gelen kutusu kaydı: mesajın tamamı, ara / WhatsApp, okundu işaretleme ve tek dokunuşla Satış Masası dosyası açma.
import { Alert, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { istek } from "@/api/istemci";
import { useIletisim, useIslem } from "@/veri/sorgular";
import { Baslik, Dugme, Ekran, Kart, Rozet, Yazi, Yukleniyor } from "@/ui/temel";
import { ara, tarihSaat, whatsappAc } from "@/ui/bicim";
import { BOSLUK } from "@/tema";

export default function Talep() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = useIletisim();
  const c = q.data?.find((x) => x.id === id);
  const durum = useIslem((status: string) => istek(`/api/admin/contact/${id}`, { method: "PATCH", govde: { status } }), [["iletisim"]]);
  const dosya = useIslem(() => istek<{ dosya: { no: string } }>("/api/admin/satis", { govde: { musteriAdi: c?.name, phone: c?.phone, talepNotu: [c?.package, c?.message].filter(Boolean).join("\n").slice(0, 1000) } }), [["satis"]]);

  if (!c) return (<><Baslik baslik="Talep" geri />{q.isPending ? <Yukleniyor /> : <Ekran><Yazi>Kayıt bulunamadı.</Yazi></Ekran>}</>);
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik={c.name} alt={tarihSaat(c.createdAt)} geri />
      <Ekran>
        <View style={{ flexDirection: "row", gap: BOSLUK.s }}>
          <Dugme metin="Ara" ikon="tel" tur="ikincil" kucuk style={{ flex: 1 }} onPress={() => ara(c.phone)} />
          <Dugme metin="WhatsApp" ikon="whatsapp" tur="whatsapp" kucuk style={{ flex: 1 }} onPress={() => whatsappAc(c.phone, `Selamün aleyküm ${c.name.split(" ")[0]}, Hadi Umreye Gidelim'den yazıyorum.`)} />
        </View>
        <Kart style={{ gap: 8 }}>
          {c.package ? <Rozet metin={c.package} /> : null}
          <Yazi tur="kucuk">{c.phone}</Yazi>
          <Yazi tur="govde">{c.message || "Mesaj yok."}</Yazi>
        </Kart>
        <Dugme metin="Satış dosyası aç" ikon="dosya" yukleniyor={dosya.isPending} onPress={async () => {
          try {
            const r = await dosya.mutateAsync(undefined);
            durum.mutate("CONTACTED");
            router.replace(`/satis/${r.dosya.no}`);
          } catch (e) {
            Alert.alert("Açılamadı", e instanceof Error ? e.message : "");
          }
        }} />
        <View style={{ flexDirection: "row", gap: BOSLUK.s }}>
          <Dugme metin="İletişime geçildi" tur={c.status === "CONTACTED" ? "ana" : "hafif"} kucuk style={{ flex: 1 }} onPress={() => durum.mutate("CONTACTED")} />
          <Dugme metin="Çözüldü" tur={c.status === "RESOLVED" ? "ana" : "hafif"} kucuk style={{ flex: 1 }} onPress={() => durum.mutate("RESOLVED")} />
        </View>
      </Ekran>
    </View>
  );
}
