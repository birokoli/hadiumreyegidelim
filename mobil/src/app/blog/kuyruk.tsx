// Blog konu kuyruğu (web: /admin/blog-kuyrugu): yapay zekânın sıradaki yazı konuları, öne al / engelle, güncelleme önerileri.
import { useState } from "react";
import { Alert, Linking, View } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { API_URL, istek } from "@/api/istemci";
import { Ayrac, Baslik, Bolum, Bos, Dugme, Ekran, IkonDugme, Kart, Rozet, Yazi, Yukleniyor } from "@/ui/temel";
import { R } from "@/tema";

type Konu = { topic: string; source: string; score: number; finalScore: number; reason: string; cluster?: string; clusterName?: string };
type Oneri = { topic: string; postSlug: string; postTitle: string; reason: string; at: string };
type Veri = { queue: Konu[]; updates: Oneri[]; blocked: string[]; pinned: string[] };

export default function Kuyruk() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["blog-kuyruk"], queryFn: () => istek<Veri>("/api/admin/blog-topics") });
  const [mesgul, setMesgul] = useState<string | null>(null);
  const is = async (ad: string, govde: Record<string, string>) => {
    setMesgul(ad);
    try {
      const r = await istek<Veri>("/api/admin/blog-topics", { govde });
      qc.setQueryData(["blog-kuyruk"], r);
    } catch (e) {
      Alert.alert("Olmadı", e instanceof Error ? e.message : "");
    } finally {
      setMesgul(null);
    }
  };
  const d = q.data;
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik="Konu kuyruğu" alt="Sıradaki blog konuları" geri sag={<IkonDugme ikon="yenile" etiket="Yeniden hesapla" onPress={() => is("yenile", { action: "refresh" })} />} />
      {q.isPending ? <Yukleniyor /> : (
        <Ekran yenile={q.refetch} yenileniyor={q.isRefetching || mesgul === "yenile"}>
          {d?.updates.length ? (
            <Bolum baslik="Güncellenmesi önerilen yazılar">
              {d.updates.map((u) => (
                <Kart key={u.postSlug} style={{ gap: 6 }}>
                  <Yazi tur="altBaslik">{u.postTitle || u.postSlug}</Yazi>
                  {u.reason ? <Yazi tur="kucuk" renk={R.turuncu}>{u.reason}</Yazi> : null}
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <Dugme metin="Yazıyı aç" kucuk tur="hafif" ikon="disari" onPress={() => Linking.openURL(`${API_URL}/blog/${u.postSlug}`)} />
                    <Dugme metin="Kapat" kucuk tur="ikincil" yukleniyor={mesgul === u.postSlug} onPress={() => is(u.postSlug, { action: "dismissUpdate", postSlug: u.postSlug })} />
                  </View>
                </Kart>
              ))}
            </Bolum>
          ) : null}
          <Bolum baslik={`Sıradaki konular (${d?.queue.length ?? 0})`}>
            {d?.queue.length ? (
              <Kart style={{ padding: 0, overflow: "hidden" }}>
                {d.queue.map((k, i) => {
                  const one = d.pinned.includes(k.topic);
                  return (
                    <View key={k.topic}>
                      {i ? <Ayrac /> : null}
                      <View style={{ padding: 14, gap: 6 }}>
                        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                          <Yazi style={{ flex: 1 }}>{`${i + 1}. ${k.topic}`}</Yazi>
                          <Rozet metin={String(Math.round(k.finalScore ?? k.score))} ton={one ? "kum" : "mavi"} />
                        </View>
                        {k.reason ? <Yazi tur="kucuk">{k.reason}</Yazi> : null}
                        <View style={{ flexDirection: "row", gap: 8 }}>
                          <Dugme metin={one ? "Öne almayı kaldır" : "Öne al"} kucuk tur="hafif" yukleniyor={mesgul === `p${k.topic}`} onPress={() => is(`p${k.topic}`, { action: one ? "unpin" : "pin", topic: k.topic })} />
                          <Dugme metin="Engelle" kucuk tur="tehlike" yukleniyor={mesgul === `b${k.topic}`} onPress={() => is(`b${k.topic}`, { action: "block", topic: k.topic })} />
                        </View>
                      </View>
                    </View>
                  );
                })}
              </Kart>
            ) : <Kart><Bos ikon="kalem" baslik="Kuyruk boş" alt="Sağ üstten yeniden hesaplayın" /></Kart>}
          </Bolum>
          {d?.blocked.length ? (
            <Bolum baslik="Engelli konular">
              {d.blocked.map((t) => (
                <Kart key={t} style={{ flexDirection: "row", alignItems: "center", gap: 8, padding: 12 }}>
                  <Yazi style={{ flex: 1 }} tur="kucuk">{t}</Yazi>
                  <Dugme metin="Kaldır" kucuk tur="ikincil" onPress={() => is(`u${t}`, { action: "unblock", topic: t })} />
                </Kart>
              ))}
            </Bolum>
          ) : null}
        </Ekran>
      )}
    </View>
  );
}
