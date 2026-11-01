// SEO Masası (web: /admin/seo): site sağlığı ve denetim sorunları (düzeltildi işareti, yeniden denetim), takip edilen kelimelerin
// Google sırası (ekle, çıkar, şimdi kontrol et), Search Console özeti ve kelime araştırması (DataForSEO, ücretli).
import { useState } from "react";
import { Alert, View } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { istek } from "@/api/istemci";
import AltSayfa from "@/ui/AltSayfa";
import { Alan, Ayrac, Baslik, Bolum, Bos, Dugme, Ekran, Kart, Rozet, Sayac, Segment, Yazi, Yukleniyor, HataKutusu } from "@/ui/temel";
import { goreli } from "@/ui/bicim";
import { BOSLUK, R, Y } from "@/tema";

type Sorun = { code: string; category: string; severity: "kritik" | "yüksek" | "orta" | "düşük"; title: string; fix: string; pages: string[]; detail?: string };
type Denetim = { report: null | { score: number; finishedAt: string; pageCount: number; issues: Sorun[] }; fixed: Record<string, boolean> };
type Kelime = { keyword: string; addedAt: string; history: { date: string; position: number | null; url: string | null }[]; topThree?: { position: number; domain: string; title: string }[] };
type Gsc = { configured: boolean; error?: string; totals?: { clicks: number; impressions: number; ctr: number; position: number }; prevTotals?: { clicks: number; impressions: number; ctr: number; position: number }; queries?: { key: string; clicks: number; impressions: number; position: number; prevPosition: number | null }[]; pages?: { key: string; clicks: number; impressions: number; position: number }[] };
type Arastirma = { keyword: string; volume: number | null; cpc: number | null; difficulty: number | null; intent: string | null };
const ONEM = { kritik: 0, "yüksek": 1, orta: 2, "düşük": 3 } as const;
const ONEM_AD = { kritik: "Kritik", "yüksek": "Yüksek", orta: "Orta", "düşük": "Düşük" } as const;

export default function Seo() {
  const qc = useQueryClient();
  const [sekme, setSekme] = useState<"denetim" | "sira" | "gsc" | "arastir">("denetim");
  const den = useQuery({ queryKey: ["seo-denetim"], queryFn: () => istek<Denetim>("/api/admin/seo/audit") });
  const sira = useQuery({ queryKey: ["seo-sira"], queryFn: () => istek<{ tracked: Kelime[] }>("/api/admin/seo/ranks"), enabled: sekme === "sira" });
  const [gun, setGun] = useState(28);
  const gsc = useQuery({ queryKey: ["seo-gsc", gun], queryFn: () => istek<Gsc>(`/api/admin/seo/gsc?days=${gun}`), enabled: sekme === "gsc" });
  const [mesgul, setMesgul] = useState<string | null>(null);
  const [ac, setAc] = useState<Sorun | null>(null);
  const [yeniKelime, setYeniKelime] = useState("");
  const [tohum, setTohum] = useState("");
  const [sonuc, setSonuc] = useState<{ rows: Arastirma[]; cost: number } | null>(null);
  const is = async (ad: string, f: () => Promise<unknown>) => {
    setMesgul(ad);
    try { await f(); } catch (e) { Alert.alert("Olmadı", e instanceof Error ? e.message : ""); } finally { setMesgul(null); }
  };
  const acik = (den.data?.report?.issues ?? []).filter((i) => !den.data?.fixed[i.code]).sort((a, b) => ONEM[a.severity] - ONEM[b.severity] || b.pages.length - a.pages.length);
  const duzelen = (den.data?.report?.issues ?? []).filter((i) => den.data?.fixed[i.code]);
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik="SEO Masası" alt={den.data?.report ? `Site sağlığı ${den.data.report.score} / 100` : undefined} geri />
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <Segment secenekler={[{ deger: "denetim", etiket: `Denetim${acik.length ? ` · ${acik.length}` : ""}` }, { deger: "sira", etiket: "Sıralar" }, { deger: "gsc", etiket: "Search Console" }, { deger: "arastir", etiket: "Kelime araştır" }]} deger={sekme} degisti={setSekme} />
      </View>
      <Ekran yenile={() => { den.refetch(); if (sekme === "sira") sira.refetch(); if (sekme === "gsc") gsc.refetch(); }} yenileniyor={den.isRefetching}>
        {sekme === "denetim" ? (
          den.isPending ? <Yukleniyor /> : (
            <>
              {den.data?.report ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: BOSLUK.m }}>
                  <Sayac etiket="Site sağlığı" deger={den.data.report.score} ikon="tik" ton={den.data.report.score >= 85 ? "yesil" : den.data.report.score >= 70 ? "turuncu" : "kirmizi"} />
                  <Sayac etiket="Taranan sayfa" deger={den.data.report.pageCount} ikon="belge" />
                  <Sayac etiket="Açık sorun" deger={acik.length} ikon="uyari2" ton={acik.length ? "turuncu" : "yesil"} />
                </View>
              ) : <Kart><Bos ikon="ara2" baslik="Henüz denetim yok" /></Kart>}
              {den.data?.report ? <Yazi tur="kucuk">{`Son denetim ${goreli(den.data.report.finishedAt)}`}</Yazi> : null}
              <Dugme metin="Şimdi denetle" ikon="yenile" tur="hafif" yukleniyor={mesgul === "denetle"} onPress={() => is("denetle", async () => { await istek("/api/admin/seo/audit", { govde: {} }); await qc.invalidateQueries({ queryKey: ["seo-denetim"] }); })} />
              <Bolum baslik="Önce bunları düzeltin">
                {acik.length ? (
                  <Kart style={{ padding: 0, overflow: "hidden" }}>
                    {acik.map((i, n) => (
                      <View key={i.code}>
                        {n ? <Ayrac /> : null}
                        <View style={{ padding: 14, gap: 4 }}>
                          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                            <Rozet metin={ONEM_AD[i.severity]} ton={i.severity === "kritik" ? "kirmizi" : i.severity === "yüksek" ? "turuncu" : "gri"} />
                            <Yazi tur="kucuk">{`${i.pages.length} sayfa`}</Yazi>
                          </View>
                          <Yazi style={{ fontFamily: Y.yari }} >{i.title}</Yazi>
                          <Dugme metin="Ayrıntı" kucuk tur="hafif" onPress={() => setAc(i)} style={{ alignSelf: "flex-start" }} />
                        </View>
                      </View>
                    ))}
                  </Kart>
                ) : <Yazi tur="kucuk">Açık sorun yok.</Yazi>}
              </Bolum>
              {duzelen.length ? <Yazi tur="kucuk">{`${duzelen.length} sorun düzeltildi olarak işaretli.`}</Yazi> : null}
            </>
          )
        ) : null}
        {sekme === "sira" ? (
          sira.isPending ? <Yukleniyor /> : (
            <>
              <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-end" }}>
                <View style={{ flex: 1 }}><Alan etiket="Kelime ekle" value={yeniKelime} onChangeText={setYeniKelime} autoCapitalize="none" placeholder="bireysel umre" /></View>
                <Dugme metin="Ekle" kucuk devreDisi={!yeniKelime.trim()} yukleniyor={mesgul === "ekle"} onPress={() => is("ekle", async () => { const r = await istek<{ tracked: Kelime[] }>("/api/admin/seo/ranks", { govde: { action: "add", keywords: yeniKelime.split(",").map((s) => s.trim()).filter(Boolean) } }); qc.setQueryData(["seo-sira"], r); setYeniKelime(""); })} />
              </View>
              <Dugme metin="Hepsinin sırasını şimdi kontrol et (ücretli)" ikon="yenile" tur="hafif" yukleniyor={mesgul === "kontrol"} onPress={() => is("kontrol", async () => { const r = await istek<{ tracked: Kelime[] }>("/api/admin/seo/ranks", { govde: { action: "check" } }); qc.setQueryData(["seo-sira"], r); })} />
              {sira.error ? <HataKutusu hata={sira.error} /> : null}
              <Kart style={{ padding: 0, overflow: "hidden" }}>
                {(sira.data?.tracked ?? []).map((k, n) => {
                  const son = k.history[k.history.length - 1];
                  const once = k.history[k.history.length - 2];
                  const fark = son?.position != null && once?.position != null ? once.position - son.position : null;
                  return (
                    <View key={k.keyword}>
                      {n ? <Ayrac /> : null}
                      <View style={{ padding: 14, flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <View style={{ flex: 1 }}>
                          <Yazi style={{ fontFamily: Y.yari }}>{k.keyword}</Yazi>
                          <Yazi tur="kucuk" satir={1}>{son ? `${son.url ?? "sitede yok"} · ${goreli(son.date)}` : "henüz kontrol edilmedi"}</Yazi>
                        </View>
                        {fark ? <Yazi tur="kucuk" renk={fark > 0 ? R.yesil : R.kirmizi}>{fark > 0 ? `▲${fark}` : `▼${-fark}`}</Yazi> : null}
                        <Rozet metin={son?.position != null ? `#${son.position}` : "—"} ton={son?.position != null && son.position <= 3 ? "yesil" : son?.position != null && son.position <= 10 ? "mavi" : "gri"} />
                        <Dugme metin="Çıkar" kucuk tur="tehlike" onPress={() => is(`c${k.keyword}`, async () => { const r = await istek<{ tracked: Kelime[] }>("/api/admin/seo/ranks", { govde: { action: "remove", keyword: k.keyword } }); qc.setQueryData(["seo-sira"], r); })} />
                      </View>
                    </View>
                  );
                })}
              </Kart>
            </>
          )
        ) : null}
        {sekme === "gsc" ? (
          <>
            <Segment secenekler={[{ deger: "7", etiket: "7 gün" }, { deger: "28", etiket: "28 gün" }, { deger: "90", etiket: "90 gün" }]} deger={String(gun)} degisti={(v) => setGun(Number(v))} />
            {gsc.isPending ? <Yukleniyor /> : gsc.error ? <HataKutusu hata={gsc.error} tekrar={gsc.refetch} /> : !gsc.data?.configured ? <Kart><Yazi>Search Console bağlı değil.</Yazi></Kart> : gsc.data.error ? <HataKutusu hata={new Error(gsc.data.error)} /> : (
              <>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: BOSLUK.m }}>
                  <Sayac etiket={`Tıklama (önceki ${gsc.data.prevTotals?.clicks ?? 0})`} deger={gsc.data.totals?.clicks ?? 0} ikon="tikla" />
                  <Sayac etiket={`Gösterim (önceki ${gsc.data.prevTotals?.impressions ?? 0})`} deger={gsc.data.totals?.impressions ?? 0} ikon="goz" />
                  <Sayac etiket="Ortalama sıra" deger={Math.round((gsc.data.totals?.position ?? 0) * 10) / 10} ikon="ara2" />
                  <Sayac etiket="Tıklama oranı" deger={`%${Math.round((gsc.data.totals?.ctr ?? 0) * 1000) / 10}`} ikon="tikla" />
                </View>
                <Bolum baslik="En çok aranan sorgular">
                  <Kart style={{ gap: 8 }}>
                    {(gsc.data.queries ?? []).slice(0, 30).map((s) => (
                      <View key={s.key} style={{ flexDirection: "row", gap: 8 }}>
                        <Yazi tur="kucuk" style={{ flex: 1 }} satir={1}>{s.key}</Yazi>
                        <Yazi tur="kucuk">{`${s.clicks} tık · ${s.impressions} göst. · #${Math.round(s.position)}`}</Yazi>
                      </View>
                    ))}
                  </Kart>
                </Bolum>
                <Bolum baslik="En çok tıklanan sayfalar">
                  <Kart style={{ gap: 8 }}>
                    {(gsc.data.pages ?? []).slice(0, 20).map((s) => (
                      <View key={s.key} style={{ flexDirection: "row", gap: 8 }}>
                        <Yazi tur="kucuk" style={{ flex: 1 }} satir={1}>{s.key.replace(/^https?:\/\/[^/]+/, "") || "/"}</Yazi>
                        <Yazi tur="kucuk">{`${s.clicks} tık · #${Math.round(s.position)}`}</Yazi>
                      </View>
                    ))}
                  </Kart>
                </Bolum>
              </>
            )}
          </>
        ) : null}
        {sekme === "arastir" ? (
          <>
            <Yazi tur="kucuk">Bir kelime yazın; arama hacmi, zorluk ve benzer aramalar gelir. Her araştırma DataForSEO'dan küçük bir ücretle çalışır.</Yazi>
            <Alan etiket="Kelime" value={tohum} onChangeText={setTohum} autoCapitalize="none" placeholder="umre fiyatları" />
            <Dugme metin="Araştır" ikon="ara2" devreDisi={!tohum.trim()} yukleniyor={mesgul === "arastir"} onPress={() => is("arastir", async () => setSonuc(await istek<{ rows: Arastirma[]; cost: number }>("/api/admin/seo/keywords", { govde: { seed: tohum.trim(), mode: "suggestions" } })))} />
            {sonuc ? (
              <Kart style={{ gap: 8 }}>
                <Yazi tur="kucuk">{`${sonuc.rows.length} kelime · maliyet ${sonuc.cost} $`}</Yazi>
                {sonuc.rows.slice(0, 60).map((k) => (
                  <View key={k.keyword} style={{ flexDirection: "row", gap: 8 }}>
                    <Yazi tur="kucuk" style={{ flex: 1 }}>{k.keyword}</Yazi>
                    <Yazi tur="kucuk">{`${k.volume ?? "—"} / ay${k.difficulty != null ? ` · zorluk ${k.difficulty}` : ""}`}</Yazi>
                  </View>
                ))}
              </Kart>
            ) : null}
          </>
        ) : null}
      </Ekran>
      <AltSayfa acik={!!ac} kapat={() => setAc(null)} baslik={ac?.title ?? ""}>
        {ac ? (
          <>
            <Rozet metin={`${ONEM_AD[ac.severity]} · ${ac.category}`} ton={ac.severity === "kritik" ? "kirmizi" : "turuncu"} />
            <Yazi>{ac.fix}</Yazi>
            {ac.detail ? <Yazi tur="kucuk">{ac.detail}</Yazi> : null}
            <Bolum baslik={`Sayfalar (${ac.pages.length})`}>
              <Kart style={{ gap: 4 }}>{ac.pages.slice(0, 40).map((p) => <Yazi key={p} tur="kucuk">{p}</Yazi>)}</Kart>
            </Bolum>
            <Dugme metin="Düzeltildi olarak işaretle" ikon="tik" yukleniyor={mesgul === "duzelt"} onPress={() => is("duzelt", async () => { await istek("/api/admin/seo/audit", { method: "PATCH", govde: { code: ac.code, fixed: true } }); await qc.invalidateQueries({ queryKey: ["seo-denetim"] }); setAc(null); })} />
          </>
        ) : null}
      </AltSayfa>
    </View>
  );
}
