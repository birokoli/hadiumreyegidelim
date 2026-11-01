// AI Görünürlük (web: /admin/ai-visibility): takip edilen sorularda markanın ChatGPT, Gemini, Perplexity, Google AI yanıtlarında
// anılma oranı, ses payı, kaynak payı; motor bazında özet, rakiplerin anılıp bizim anılmadığımız sorular, soruyu şimdi sorma,
// haftalık ölçüm ve AI hazırlık puanı. Hesaplar sitenin src/lib/ai-vis/metrics.ts dosyasından (aynı formül).
import { useMemo, useState } from "react";
import { Alert, View } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { istek } from "@/api/istemci";
import { byEngine, contentGaps, latestRuns, summarize, trend } from "@site/lib/ai-vis/metrics";
import { ENGINES, type AiVisConfig, type DailyStat, type EngineId, type Run } from "@site/lib/ai-vis/types";
import AltSayfa from "@/ui/AltSayfa";
import { Alan, Ayrac, Baslik, Bolum, Dugme, Ekran, Kart, Rozet, Sayac, Segment, Yazi, Yukleniyor } from "@/ui/temel";
import { goreli } from "@/ui/bicim";
import { BOSLUK, R, Y } from "@/tema";

type Veri = { config: AiVisConfig; cells: Record<string, Run[]>; daily: DailyStat[]; available: EngineId[]; readiness: { score: number; checkedAt: string } | null };
type Haftalik = { state: { week: string; total: number; done: number; errors: number; spent: number } | null; cap: number; currentWeek: string; schedule: string };
const yuzde = (v: number | null) => (v == null ? "—" : `%${Math.round(v * 100)}`);

export default function AiGorunurluk() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["ai-vis"], queryFn: () => istek<Veri>("/api/admin/ai-vis/data") });
  const h = useQuery({ queryKey: ["ai-vis-hafta"], queryFn: () => istek<Haftalik>("/api/admin/ai-vis/weekly"), refetchInterval: 20_000 });
  const [sekme, setSekme] = useState<"ozet" | "sorular" | "acik" | "olcum">("ozet");
  const [soru, setSoru] = useState<string | null>(null);
  const [mesgul, setMesgul] = useState<string | null>(null);
  const [yeniSoru, setYeniSoru] = useState("");
  const [tavan, setTavan] = useState<string | null>(null);
  const g = useMemo(() => {
    if (!q.data) return null;
    const runs = latestRuns(q.data.cells, q.data.config);
    return { runs, ozet: summarize(runs), motor: byEngine(runs, q.data.config.engines), egilim: trend(q.data.daily), acik: contentGaps(runs, q.data.config) };
  }, [q.data]);
  const is = async (ad: string, f: () => Promise<unknown>) => {
    setMesgul(ad);
    try { await f(); } catch (e) { Alert.alert("Olmadı", e instanceof Error ? e.message : ""); } finally { setMesgul(null); }
  };
  if (q.isPending || !q.data || !g) return <View style={{ flex: 1 }}><Baslik baslik="AI Görünürlük" geri /><Yukleniyor /></View>;
  const c = q.data.config;
  const sor = (promptId: string, engine: EngineId) => is(`${promptId}|${engine}`, async () => {
    const r = await istek<{ run: Run }>("/api/admin/ai-vis/run", { govde: { promptId, engine } });
    await istek("/api/admin/ai-vis/save", { govde: { runs: [r.run] } });
    await qc.invalidateQueries({ queryKey: ["ai-vis"] });
  });
  const acikSoru = c.prompts.find((p) => p.id === soru);
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik="AI Görünürlük" alt={`${c.brand.name} · ${c.prompts.length} soru · ${c.engines.length} motor`} geri />
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <Segment secenekler={[{ deger: "ozet", etiket: "Özet" }, { deger: "sorular", etiket: "Sorular" }, { deger: "acik", etiket: `Açıklar${g.acik.length ? ` · ${g.acik.length}` : ""}` }, { deger: "olcum", etiket: "Ölçüm" }]} deger={sekme} degisti={setSekme} />
      </View>
      <Ekran yenile={() => { q.refetch(); h.refetch(); }} yenileniyor={q.isRefetching}>
        {sekme === "ozet" ? (
          <>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: BOSLUK.m }}>
              <Sayac etiket={`Anılma oranı (${g.ozet.n} yanıt)`} deger={yuzde(g.ozet.visibility)} ikon="yapayzeka" ton="yesil" />
              <Sayac etiket="Ses payı (rakiplere göre)" deger={yuzde(g.ozet.sov)} ikon="kullanicilar" />
              <Sayac etiket="Ortalama sıra" deger={g.ozet.avgPosition == null ? "—" : Math.round(g.ozet.avgPosition * 10) / 10} ikon="ara2" />
              <Sayac etiket="Kaynak payı (sitemiz)" deger={yuzde(g.ozet.citationShare)} ikon="link" />
              <Sayac etiket="Son 7 gün" deger={yuzde(g.egilim.last7.visibility)} ikon="takvim2" ton={g.egilim.last7.visibility != null && g.egilim.prev7.visibility != null && g.egilim.last7.visibility < g.egilim.prev7.visibility ? "kirmizi" : "mavi"} />
              <Sayac etiket="Önceki 7 gün" deger={yuzde(g.egilim.prev7.visibility)} ikon="takvim2" ton="gri" />
            </View>
            <Bolum baslik="Motorlara göre">
              <Kart style={{ padding: 0, overflow: "hidden" }}>
                {g.motor.map((m, i) => (
                  <View key={m.engine}>
                    {i ? <Ayrac /> : null}
                    <View style={{ padding: 14, flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Yazi style={{ fontFamily: Y.yari }}>{ENGINES[m.engine].label}</Yazi>
                        <Yazi tur="kucuk">{`${m.n} yanıt · ses payı ${yuzde(m.sov)}${m.errors ? ` · ${m.errors} hata` : ""}${!q.data!.available.includes(m.engine) ? " · bağlı değil" : ""}`}</Yazi>
                      </View>
                      <Rozet metin={yuzde(m.visibility)} ton={(m.visibility ?? 0) >= 0.5 ? "yesil" : (m.visibility ?? 0) > 0 ? "turuncu" : "gri"} />
                    </View>
                  </View>
                ))}
              </Kart>
            </Bolum>
            {q.data.readiness ? <Yazi tur="kucuk">{`AI hazırlık puanı ${q.data.readiness.score} / 100 · ${goreli(q.data.readiness.checkedAt)}`}</Yazi> : null}
            <Dugme metin="AI hazırlığını yeniden ölç" ikon="yenile" tur="hafif" yukleniyor={mesgul === "hazirlik"} onPress={() => is("hazirlik", async () => { await istek("/api/admin/ai-vis/readiness", { govde: {} }); await qc.invalidateQueries({ queryKey: ["ai-vis"] }); })} />
          </>
        ) : null}
        {sekme === "sorular" ? (
          <>
            <Kart style={{ padding: 0, overflow: "hidden" }}>
              {c.prompts.map((p, i) => {
                const pr = g.runs.filter((r) => r.promptId === p.id && r.a.countable);
                const anildi = pr.filter((r) => r.a.brandMentioned).length;
                return (
                  <View key={p.id}>
                    {i ? <Ayrac /> : null}
                    <View style={{ padding: 14, gap: 4 }}>
                      <Yazi>{p.text}</Yazi>
                      <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                        <Rozet metin={pr.length ? `${anildi} / ${pr.length} motorda anıldık` : "ölçülmedi"} ton={anildi ? "yesil" : pr.length ? "kirmizi" : "gri"} />
                        <Dugme metin="Yanıtlar" kucuk tur="hafif" onPress={() => setSoru(p.id)} />
                      </View>
                    </View>
                  </View>
                );
              })}
            </Kart>
            <Bolum baslik="Soru ekle">
              <Alan etiket="Soru (müşterinin yapay zekâya soracağı gibi)" value={yeniSoru} onChangeText={setYeniSoru} multiline />
              <Dugme metin="Ekle" devreDisi={!yeniSoru.trim()} yukleniyor={mesgul === "soru"} onPress={() => is("soru", async () => {
                await istek("/api/admin/ai-vis/config", { method: "PUT", govde: { prompts: [...c.prompts, { text: yeniSoru.trim(), tags: [] }] } });
                setYeniSoru("");
                await qc.invalidateQueries({ queryKey: ["ai-vis"] });
              })} />
            </Bolum>
          </>
        ) : null}
        {sekme === "acik" ? (
          g.acik.length ? g.acik.map((a) => (
            <Kart key={a.prompt.id} style={{ gap: 6 }}>
              <Yazi>{a.prompt.text}</Yazi>
              <Yazi tur="kucuk" renk={R.kirmizi}>{`Biz anılmadık; anılan rakipler: ${a.competitors.join(", ")}`}</Yazi>
              <Dugme metin="Yanıtları gör" kucuk tur="hafif" onPress={() => setSoru(a.prompt.id)} style={{ alignSelf: "flex-start" }} />
            </Kart>
          )) : <Yazi tur="kucuk">Rakiplerin anılıp bizim anılmadığımız soru yok.</Yazi>
        ) : null}
        {sekme === "olcum" ? (
          <Kart style={{ gap: 10 }}>
            <Yazi tur="altBaslik">Haftalık ölçüm</Yazi>
            <Yazi tur="kucuk">{h.data?.schedule ?? ""}</Yazi>
            {h.data?.state ? <Yazi>{`${h.data.state.week}: ${h.data.state.done} / ${h.data.state.total} ölçüldü · ${h.data.state.errors} hata · ${Math.round(h.data.state.spent * 100) / 100} $ harcandı`}</Yazi> : <Yazi tur="kucuk">Bu hafta ölçüm başlamadı.</Yazi>}
            <Alan etiket="Haftalık harcama tavanı ($, 0 = kapalı)" value={tavan ?? String(h.data?.cap ?? "")} onChangeText={setTavan} keyboardType="decimal-pad" />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Dugme metin="Tavanı kaydet" tur="ikincil" devreDisi={tavan == null} yukleniyor={mesgul === "tavan"} style={{ flex: 1 }} onPress={() => is("tavan", async () => { await istek("/api/admin/ai-vis/weekly", { govde: { cap: Number((tavan ?? "0").replace(",", ".")) } }); setTavan(null); await h.refetch(); })} />
              <Dugme metin="Şimdi bir adım çalıştır" yukleniyor={mesgul === "calistir"} style={{ flex: 1 }} onPress={() => is("calistir", async () => { const r = await istek<{ message: string }>("/api/admin/ai-vis/weekly", { govde: { action: "run" } }); Alert.alert("Başladı", r.message); })} />
            </View>
          </Kart>
        ) : null}
      </Ekran>
      <AltSayfa acik={!!acikSoru} kapat={() => setSoru(null)} baslik={acikSoru?.text ?? ""}>
        {acikSoru ? c.engines.map((e) => {
          const r = g.runs.find((x) => x.promptId === acikSoru.id && x.engine === e);
          return (
            <Kart key={e} style={{ gap: 6 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Yazi style={{ flex: 1, fontFamily: Y.yari }}>{ENGINES[e].label}</Yazi>
                {r ? <Rozet metin={r.status !== "ok" ? (r.status === "no_surface" ? "Yanıt yüzeyi yok" : "Hata") : r.a.brandMentioned ? `Anıldık${r.a.brandPosition ? ` · ${r.a.brandPosition}. sırada` : ""}` : "Anılmadık"} ton={r.a.brandMentioned ? "yesil" : "kirmizi"} /> : <Rozet metin="Ölçülmedi" ton="gri" />}
              </View>
              {r ? <Yazi tur="kucuk">{goreli(r.at)}</Yazi> : null}
              {r?.text ? <Yazi tur="kucuk" satir={12}>{r.text}</Yazi> : null}
              {r?.error ? <Yazi tur="kucuk" renk={R.kirmizi}>{r.error}</Yazi> : null}
              {r?.a.competitorsMentioned.length ? <Yazi tur="kucuk">{`Rakipler: ${r.a.competitorsMentioned.join(", ")}`}</Yazi> : null}
              {q.data!.available.includes(e) ? <Dugme metin="Şimdi sor (ücretli)" kucuk tur="hafif" yukleniyor={mesgul === `${acikSoru.id}|${e}`} onPress={() => sor(acikSoru.id, e)} /> : null}
            </Kart>
          );
        }) : null}
      </AltSayfa>
    </View>
  );
}
