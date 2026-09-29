"use client";

import { useEffect, useState } from "react";
import { AnimatedNumber } from "@/components/motion-primitives/animated-number";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";
import { api, Cost, ErrorLine, formatNumber, NeedsKey, PageHead, Section } from "@/components/admin/seo/ui";
import type { Candidate, Pattern } from "@/lib/seo/programmatic";

type Analysis = {
  city: {
    pageCount: number;
    inSitemap: number;
    similarity: number | null;
    samples: { path: string; status: number; title: string; description: string; words: number }[];
  };
  patterns: (Omit<Pattern, "candidates"> & { candidates: (Candidate & { covered: boolean })[] })[];
};

export default function ProgrammaticPage() {
  const [data, setData] = useState<Analysis | null>(null);
  const [error, setError] = useState("");
  const [volumes, setVolumes] = useState<Record<string, number | null> | null>(null);
  const [cost, setCost] = useState<number | null>(null);
  const [loadingVolumes, setLoadingVolumes] = useState(false);
  const [needsKey, setNeedsKey] = useState(false);

  useEffect(() => {
    api<Analysis>("/api/admin/seo/programmatic").then(setData).catch((e) => setError(e.message));
  }, []);

  const fetchVolumes = async () => {
    if (!data) return;
    setLoadingVolumes(true);
    setError("");
    try {
      const keywords = data.patterns.flatMap((p) => p.candidates.map((c) => c.keyword));
      const d = await api<{ volumes: Record<string, number | null>; cost: number }>("/api/admin/seo/programmatic", {
        method: "POST",
        body: JSON.stringify({ keywords }),
      });
      setVolumes(d.volumes);
      setCost(d.cost);
    } catch (e) {
      const err = e as Error & { needsKey?: boolean };
      if (err.needsKey) setNeedsKey(true);
      else setError(err.message);
    } finally {
      setLoadingVolumes(false);
    }
  };

  const sim = data?.city.similarity;
  const simPct = sim == null ? null : Math.round(sim * 100);

  return (
    <>
      <PageHead
        n="06"
        title="Programatik sayfalar"
        lede="Şablondan üretilen sayfaların birbirinden ne kadar farklı olduğunu ölçer ve aynı kalıpla açılabilecek yeni sayfa gruplarını listeler. Her sayfa kendi bilgisini taşımıyorsa Google onu ince içerik sayar."
      />
      <ErrorLine>{error}</ErrorLine>
      {!data && !error && (
        <p aria-live="polite"><TextShimmer className="text-[20px] font-bold">Şehir sayfaları karşılaştırılıyor</TextShimmer></p>
      )}

      {data && (
        <>
          <div className="grid gap-12 lg:grid-cols-[auto_1fr] lg:items-end">
            <div>
              <p className="seo-label">Şehir sayfalarının ortak metni</p>
              <p className="mt-3 flex items-baseline gap-1">
                {simPct == null ? (
                  <span className="seo-figure text-[120px]">—</span>
                ) : (
                  <>
                    <span className="text-[56px] font-extrabold text-[var(--seo-ink-3)]">%</span>
                    <AnimatedNumber value={simPct} className={`seo-figure text-[140px] sm:text-[176px] ${simPct >= 70 ? "text-[var(--seo-danger)]" : ""}`} />
                  </>
                )}
              </p>
            </div>
            <div className="max-w-[540px] pb-3">
              <p className="text-[18px] font-semibold leading-snug">
                {data.city.pageCount} il için <span className="seo-mono text-[15px]">/{"{şehir}"}-cikisli-bireysel-umre</span> sayfası var,{" "}
                {data.city.inSitemap === data.city.pageCount ? "hepsi sitemap'te." : `${data.city.inSitemap} tanesi sitemap'te.`}
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-[var(--seo-ink-2)]">
                {simPct == null
                  ? "Örnek sayfalar okunamadı."
                  : simPct >= 70
                    ? `Altı örnek sayfanın metni ortalama %${simPct} oranında birebir aynı. Sayfalar şehir adı dışında neredeyse aynı içeriği taşıyor. Her sayfaya o ile özgü bilgi ekleyin: kalkış havalimanı ve aktarma, uçuş süresi, o ilden kalkan paketler ve fiyatları, toplanma noktası, o ilden umreye gidenlerin sık sorduğu sorular.`
                    : simPct >= 40
                      ? `Örnek sayfalarda ortak metin oranı %${simPct}. Kabul edilebilir, ama sayfaya özgü bölümleri (uçuş, paket, fiyat) büyütmek sıralamayı güçlendirir.`
                      : `Örnek sayfalarda ortak metin oranı yalnızca %${simPct}; sayfalar yeterince farklı.`}
              </p>
            </div>
          </div>

          <Section title="Karşılaştırılan örnekler">
            <div className="overflow-x-auto">
              <table className="seo-table">
                <thead>
                  <tr><th>Sayfa</th><th>Title</th><th className="num">Kelime</th></tr>
                </thead>
                <tbody>
                  {data.city.samples.map((s) => (
                    <tr key={s.path}>
                      <td className="seo-mono text-[13px]">{s.path}</td>
                      <td className="text-[14px]">{s.status === 200 ? s.title : <span className="text-[var(--seo-danger)]">{s.status || "yanıt yok"}</span>}</td>
                      <td className="num">{s.words}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section
            title="Açılabilecek sayfa grupları"
            aside={
              <span className="flex items-center gap-4">
                <Cost usd={cost} />
                <button className="seo-btn" onClick={fetchVolumes} disabled={loadingVolumes}>
                  {loadingVolumes ? "Hacimler çekiliyor" : volumes ? "Hacimleri yenile" : "Arama hacimlerini getir"}
                </button>
              </span>
            }
          >
            {needsKey && <div className="mb-10"><NeedsKey compact /></div>}
            <p className="mb-12 max-w-[640px] text-[15px] text-[var(--seo-ink-2)]">
              Her grup bir şablon ve onu dolduracak bir veri kaynağıdır. Önce aranma hacmi olan kelimelerle başlayın; hacimsiz kelime için sayfa açmak tarama bütçesini boşa harcar.
            </p>
            <div className="grid gap-x-16 gap-y-16 lg:grid-cols-2">
              {data.patterns.map((p) => {
                const covered = p.candidates.filter((c) => c.covered).length;
                return (
                  <article key={p.id}>
                    <p className="text-[13px] font-semibold text-[var(--seo-mark)]">{p.playbook}</p>
                    <h3 className="mt-1 text-[24px] font-extrabold tracking-tight">{p.template}</h3>
                    <p className="seo-mono mt-2 text-[13px] text-[var(--seo-ink-2)]">{p.urlTemplate}</p>
                    <p className="mt-2 text-[13px] text-[var(--seo-ink-3)]">Veri: {p.data}</p>
                    <p className="mt-4 text-[13px] font-semibold">
                      {covered}/{p.candidates.length} kelimenin sayfası var
                    </p>
                    <ul className="mt-3">
                      {p.candidates.map((c) => (
                        <li key={c.keyword} className="grid grid-cols-[1fr_auto_auto] items-baseline gap-4 py-1.5 text-[15px]">
                          <span className={c.covered ? "" : "font-semibold"}>{c.keyword}</span>
                          <span className="tabular-nums text-[14px] font-bold">
                            {volumes ? formatNumber(volumes[c.keyword]) : ""}
                          </span>
                          <span className={`text-[12px] font-semibold ${c.covered ? "text-[var(--seo-ink-3)]" : "text-[var(--seo-mark)]"}`}>
                            {c.covered ? "sayfa var" : "sayfa yok"}
                          </span>
                        </li>
                      ))}
                      {p.candidates.length === 0 && <li className="text-[14px] text-[var(--seo-ink-3)]">Veri tablosu boş.</li>}
                    </ul>
                  </article>
                );
              })}
            </div>
          </Section>
        </>
      )}
    </>
  );
}
