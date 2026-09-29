"use client";

import { useEffect, useState } from "react";
import { api, Cost, ErrorLine, formatDate, formatNumber, NeedsKey, PageHead, Section, useDataforseoReady } from "@/components/admin/seo/ui";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";
import type { CompetitorSnapshot } from "@/lib/seo/types";

type Stored = { domains: string[]; snapshot: CompetitorSnapshot | null };

export default function CompetitorsPage() {
  const [input, setInput] = useState("");
  const [data, setData] = useState<Stored | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsKeyError, setNeedsKey] = useState(false);
  const dfsReady = useDataforseoReady();
  const needsKey = needsKeyError || dfsReady === false;

  useEffect(() => {
    api<Stored>("/api/admin/seo/competitors")
      .then((d) => {
        setData(d);
        setInput(d.domains.join("\n"));
      })
      .catch((e) => setError(e.message));
  }, []);

  const compare = async () => {
    setLoading(true);
    setError("");
    try {
      const domains = input.split(/\n|,/).map((d) => d.trim()).filter(Boolean);
      setData(await api<Stored>("/api/admin/seo/competitors", { method: "POST", body: JSON.stringify({ domains }) }));
    } catch (e) {
      const err = e as Error & { needsKey?: boolean };
      if (err.needsKey) setNeedsKey(true);
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const snap = data?.snapshot;

  return (
    <>
      <PageHead
        n="05"
        title="Rakipler"
        lede="Sitemizi en fazla beş rakip alan adıyla yan yana koyar: Google'da kaç kelimede sıralandıkları, tahmini aylık ziyaret ve kaç siteden link aldıkları."
      />

      {needsKey && <div className="mb-12"><NeedsKey /></div>}

      <form
        className="grid max-w-[760px] gap-4 sm:grid-cols-[1fr_auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          compare();
        }}
      >
        <div>
          <label htmlFor="domains" className="text-[16px] font-bold">Rakip alan adları</label>
          <p className="mt-1 text-[13px] text-[var(--seo-ink-3)]">Her satıra bir alan adı, en fazla beş.</p>
          <textarea
            id="domains"
            rows={4}
            className="seo-input mt-3 w-full resize-y seo-mono text-[14px]"
            placeholder={"rakip-umre.com\nornek-turizm.com.tr"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <button className="seo-btn justify-center" disabled={loading || needsKey}>{loading ? "Çekiliyor" : "Karşılaştır"}</button>
      </form>

      <ErrorLine>{error}</ErrorLine>
      {loading && <p className="mt-8" aria-live="polite"><TextShimmer className="text-[20px] font-bold">Alan adı verileri çekiliyor</TextShimmer></p>}

      {snap && !loading && (
        <>
          <Section title="Karşılaştırma" aside={<span className="flex gap-4"><span>{formatDate(snap.checkedAt)}</span><Cost usd={snap.cost} /></span>}>
            <div className="overflow-x-auto">
              <table className="seo-table">
                <thead>
                  <tr>
                    <th>Alan adı</th>
                    <th className="num">Sıralandığı kelime</th>
                    <th className="num">Tahmini aylık ziyaret</th>
                    <th className="num">İlk 3</th>
                    <th className="num">İlk 10</th>
                    <th className="num">Link veren site</th>
                    <th className="num">Toplam link</th>
                  </tr>
                </thead>
                <tbody>
                  {snap.rows.map((r, i) => (
                    <tr key={r.domain} className={i === 0 ? "font-bold" : ""}>
                      <td className="seo-mono text-[13px]">{r.domain}{i === 0 && <span className="ml-2 font-sans text-[12px] text-[var(--seo-mark)]">biz</span>}</td>
                      <td className="num">{formatNumber(r.keywords)}</td>
                      <td className="num">{formatNumber(r.etv)}</td>
                      <td className="num">{formatNumber(r.top3)}</td>
                      <td className="num">{formatNumber(r.top10)}</td>
                      <td className="num">{formatNumber(r.backlinks?.referringDomains)}</td>
                      <td className="num">{formatNumber(r.backlinks?.backlinks)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {snap.backlinkError && (
              <p className="mt-4 max-w-[640px] text-[13px] text-[var(--seo-ink-3)]">
                Link verisi alınamadı: {snap.backlinkError}. DataForSEO Backlinks API ayrı abonelik ister; açılmadıysa bu iki sütun boş kalır.
              </p>
            )}
          </Section>

          <Section title="Google'da sıralandığımız kelimeler" aside="Tahmini ziyarete göre ilk 30">
            {snap.ours.length === 0 ? (
              <p className="text-[var(--seo-ink-2)]">DataForSEO bu alan adı için sıralanan kelime bulamadı.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="seo-table">
                  <thead>
                    <tr><th className="num">Sıra</th><th>Kelime</th><th className="num">Aylık arama</th><th>Sayfa</th></tr>
                  </thead>
                  <tbody>
                    {snap.ours.map((k) => (
                      <tr key={k.keyword + k.url}>
                        <td className="num text-[18px] font-extrabold">{k.position}</td>
                        <td className="font-semibold">{k.keyword}</td>
                        <td className="num">{formatNumber(k.volume)}</td>
                        <td className="seo-mono max-w-[320px] truncate text-[13px] text-[var(--seo-ink-2)]">{k.url.replace(/^https?:\/\/(www\.)?[^/]+/, "") || "/"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </>
      )}
    </>
  );
}
