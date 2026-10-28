// Ortak liste: yenileme, hata, boş durum ve satır ayracı tek yerde.
import type { ReactElement } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { Ayrac, Bos, HataKutusu, Yukleniyor } from "./temel";
import { R } from "@/tema";

export default function Liste<T>({ q, veri, anahtar, satir, bos, kart, ust }: { q: { isPending: boolean; isRefetching: boolean; error: unknown; refetch: () => unknown; data?: unknown }; veri: T[]; anahtar: (t: T) => string; satir: (t: T) => ReactElement; bos: string; kart?: boolean; ust?: ReactElement }) {
  if (q.isPending && !q.data) return <Yukleniyor />;
  return (
    <FlatList
      data={veri}
      keyExtractor={anahtar}
      ItemSeparatorComponent={kart ? () => <View style={{ height: 12 }} /> : Ayrac}
      contentContainerStyle={kart ? { padding: 16, paddingBottom: 60 } : { paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => void q.refetch()} colors={[R.lacivert]} />}
      ListHeaderComponent={q.error && !q.data ? <View style={{ padding: 16 }}><HataKutusu hata={q.error} tekrar={() => void q.refetch()} /></View> : ust}
      ListEmptyComponent={<Bos baslik={bos} />}
      renderItem={({ item }) => satir(item)}
    />
  );
}
