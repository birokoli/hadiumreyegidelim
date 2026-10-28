// Bildirimler: sunucudaki geçmiş (anlık bildirim izni kapalı olsa da burada görünür). Dokununca ilgili ekran açılır.
import { FlatList, RefreshControl, View } from "react-native";
import { router } from "expo-router";
import { istek } from "@/api/istemci";
import { useBildirimler, useIslem } from "@/veri/sorgular";
import { Ayrac, Baslik, Bos, Dugme, HataKutusu, Satir, Yukleniyor } from "@/ui/temel";
import { goreli } from "@/ui/bicim";
import { R } from "@/tema";

const IKON: Record<string, string> = { talep: "gelen", teklif: "dosya", odeme: "odeme", ramazan: "kabe", hatirlatma: "saat", uye: "kullanici", yorum: "yorum", icerik: "icerik", basvuru: "davet", destek: "sohbet", whatsapp: "whatsapp" };

export default function Bildirimler() {
  const q = useBildirimler();
  const okundu = useIslem((g: { idler?: string[]; hepsi?: boolean }) => istek("/api/mobil/bildirimler", { govde: g }), [["bildirimler"]]);
  const liste = q.data?.bildirimler ?? [];
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik="Bildirimler" alt={q.data?.okunmamis ? `${q.data.okunmamis} okunmamış` : undefined} sag={q.data?.okunmamis ? <Dugme metin="Tümü okundu" kucuk tur="hafif" onPress={() => okundu.mutate({ hepsi: true })} /> : undefined} />
      {q.isPending && !q.data ? <Yukleniyor /> : (
        <FlatList
          data={liste}
          keyExtractor={(b) => b.id}
          ItemSeparatorComponent={Ayrac}
          refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => void q.refetch()} colors={[R.lacivert]} />}
          ListHeaderComponent={q.error && !q.data ? <View style={{ padding: 16 }}><HataKutusu hata={q.error} tekrar={q.refetch} /></View> : undefined}
          ListEmptyComponent={<Bos ikon="zil" baslik="Bildirim yok" alt="Yeni talep, ödeme, yorum gibi olaylar burada görünür." />}
          renderItem={({ item: b }) => (
            <View style={{ backgroundColor: b.okundu ? R.kart : R.maviZemin }}>
              <Satir
                ikon={IKON[b.olay] ?? "zil"}
                baslik={b.baslik}
                alt={`${b.govde ? `${b.govde} · ` : ""}${goreli(b.createdAt)}`}
                onPress={() => {
                  if (!b.okundu) okundu.mutate({ idler: [b.id] });
                  if (b.yol) router.push(b.yol as never);
                }}
              />
            </View>
          )}
        />
      )}
    </View>
  );
}
