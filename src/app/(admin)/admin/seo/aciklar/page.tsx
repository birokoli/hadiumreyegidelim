"use client";

// 08 Açıklar: bize kim link veriyor, rakiplere kim veriyor, rakiplerin alıp bizim almadığımız linkler ve
// rakiplerin ilk 10'da olup bizim olmadığımız kelimeler (src/lib/seo/gaps.ts).
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, Cost, ErrorLine, formatDate, formatNumber, NeedsKey, PageHead, Section, useDataforseoReady } from "@/components/admin/seo/ui";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";
import type { GapSnapshot } from "@/lib/seo/gaps";

type Data = { snapshot: GapSnapshot | null; competitors: string[] };

const path = (url: string) => url.replace(/^https?:\/\/(www\.)?[^/]+/, "") || "/";
// DataForSEO tarihi "2026-09-14 10:22:33 +00:00" biçiminde; Safari bunu ayrıştıramıyor, yalnızca gün alınır
const day = (v: string | null) => {
  const m = v?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : "-";
};

function Spam({ v }: { v: number | null }) {
  if (v == null) return <span>-</span>;
  return <span className={v >= 60 ? "font-bold text-[var(--seo-mark)]" : ""}>{v}</span>;
}

function More({ total, shown, open, onToggle }: { total: number; shown: number; open: boolean; onToggle: () => void }) {
  if (total <= shown && !open) return null;
  return (
    <button type="button" className="mt-4 text-[13px] font-bold underline" onClick={onToggle}>
      {open ? "Daha az göster" : `Tümünü göster (${formatNumber(total)})`}
    </button>
  );
}

export default function GapsPage() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsKeyError, setNeedsKey] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const dfsReady = useDataforseoReady();
  const needsKey = needsKeyError || dfsReady === false;
  const toggle = (k: string) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  useEffect(() => {
    api<Data>("/api/admin/seo/gaps").then(setData).catch((e) => setError(e.message));
  }, []);

  const run = async () => {
    setLoading(true);
    setError("");
    try {
      setData(await api<Data>("/api/admin/seo/gaps", { method: "POST" }));
    } catch (e) {
      const err = e as Error & { needsKey?: boolean };
      if (err.needsKey) setNeedsKey(true);
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const snap = data?.snapshot;
  const gapVolume = snap?.keywordGap.reduce((s, k) => s + (k.volume ?? 0), 0) ?? 0;
  const linkRows = snap ? (open.links ? snap.ours.links : snap.ours.links.slice(0, 40)) : [];
  const gapRows = snap ? (open.linkGap ? snap.linkGap : snap.linkGap.slice(0, 50)) : [];
  const kwRows = snap ? (open.kw ? snap.keywordGap : snap.keywordGap.slice(0, 50)) : [];

  return (
    <>
      <PageHead
        n="08"
        title="Açıklar"
        lede="Rakiplerin önde olduğu her yer: bize kim link veriyor, rakiplere kim veriyor, rakiplerin alıp bizim almadığımız linkler ve rakiplerin Google'da ilk 10'da olup bizim olmadığımız kelimeler."
      />

      {needsKey && <div className="mb-12"><NeedsKey /></div>}

      <div className="flex flex-wrap items-end gap-6">
        <div className="max-w-[560px] text-[14px] text-[var(--seo-ink-2)]">
          {data?.competitors.length ? (
            <>Rakipler: <span className="seo-mono text-[13px]">{data.competitors.join(", ")}</span>. Değiştirmek için <Link href="/admin/seo/rakipler" className="underline">Rakipler</Link> sayfasını kullanın.</>
          ) : (
            <>Önce <Link href="/admin/seo/rakipler" className="underline">Rakipler</Link> sayfasında rakip alan adlarını girin.</>
          )}
        </div>
        <button className="seo-btn" onClick={run} disabled={loading || needsKey || !data?.competitors.length}>{loading ? "Çekiliyor" : snap ? "Yenile" : "Analizi çalıştır"}</button>
        <span className="text-[12px] text-[var(--seo-ink-3)]">Bir analiz yaklaşık 0,3–0,6 $ tutar.</span>
      </div>

      <ErrorLine>{error}</ErrorLine>
      {loading && <p className="mt-8" aria-live="polite"><TextShimmer className="text-[20px] font-bold">Link ve kelime verileri çekiliyor (1–2 dakika)</TextShimmer></p>}

      {snap && !loading && (
        <>
          {snap.errors.length > 0 && (
            <div className="mt-8 max-w-[760px] text-[13px] text-[var(--seo-ink-2)]">
              {snap.errors.map((e) => <p key={e}>Alınamadı: {e}</p>)}
            </div>
          )}

          <Section title="Özet" aside={<span className="flex gap-4"><span>{formatDate(snap.checkedAt)}</span><Cost usd={snap.cost} /></span>}>
            <div className="overflow-x-auto">
              <table className="seo-table">
                <thead>
                  <tr><th>Alan adı</th><th className="num">Link veren site</th><th className="num">Güçlü site (rank 300+)</th></tr>
                </thead>
                <tbody>
                  <tr className="font-bold">
                    <td className="seo-mono text-[13px]">biz</td>
                    <td className="num">{formatNumber(snap.ours.domains.length)}</td>
                    <td className="num">{formatNumber(snap.ours.domains.filter((d) => (d.rank ?? 0) >= 300).length)}</td>
                  </tr>
                  {snap.competitors.map((c) => (
                    <tr key={c.domain}>
                      <td className="seo-mono text-[13px]">{c.domain}</td>
                      <td className="num">{c.error ? "-" : formatNumber(c.domains.length)}{c.domains.length >= 300 ? "+" : ""}</td>
                      <td className="num">{formatNumber(c.domains.filter((d) => (d.rank ?? 0) >= 300).length)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 max-w-[760px] text-[15px]">
              Rakiplere link verip bize vermeyen <b>{formatNumber(snap.linkGap.length)}</b> site var. Rakiplerden en az birinin Google'da ilk 10'da olup bizim olmadığımız <b>{formatNumber(snap.keywordGap.length)}</b> kelime var; bunların toplam aylık araması <b>{formatNumber(gapVolume)}</b>.
            </p>
            <p className="mt-2 max-w-[760px] text-[12px] text-[var(--seo-ink-3)]">
              Rank: DataForSEO'nun 0–1000 arası site gücü. Spam: 0–100; 60 ve üzeri muhtemelen değersiz ya da zararlı link. Liste başına en güçlü 300 site çekilir.
            </p>
          </Section>

          <Section title="Bize link verenler" aside={`${formatNumber(snap.ours.links.length)} link · ${formatNumber(snap.ours.domains.length)} site`}>
            {snap.ours.links.length === 0 ? (
              <p className="text-[var(--seo-ink-2)]">DataForSEO bize link veren sayfa bulamadı.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="seo-table">
                  <thead>
                    <tr><th>Link veren sayfa</th><th>Bizim sayfa</th><th>Bağlantı metni</th><th>Tür</th><th className="num">Rank</th><th className="num">Spam</th><th>İlk görülme</th></tr>
                  </thead>
                  <tbody>
                    {linkRows.map((l, i) => (
                      <tr key={l.from + l.to + i}>
                        <td className="max-w-[320px]">
                          <a href={l.from} target="_blank" rel="noopener noreferrer nofollow" className="font-semibold underline">{l.fromDomain}</a>
                          <span className="seo-mono block truncate text-[12px] text-[var(--seo-ink-3)]">{path(l.from)}</span>
                        </td>
                        <td className="seo-mono max-w-[220px] truncate text-[13px]">{path(l.to)}</td>
                        <td className="max-w-[200px] truncate text-[13px]">{l.anchor || "-"}</td>
                        <td className="text-[13px]">{l.dofollow ? "dofollow" : "nofollow"}</td>
                        <td className="num">{formatNumber(l.domainRank)}</td>
                        <td className="num"><Spam v={l.spam} /></td>
                        <td className="text-[13px]">{day(l.firstSeen)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <More total={snap.ours.links.length} shown={40} open={!!open.links} onToggle={() => toggle("links")} />
          </Section>

          <Section title="Rakiplere link verenler" aside="En güçlü 25 site, tamamı açılır">
            <div className="grid gap-10">
              {snap.competitors.map((c) => {
                const rows = open[`c:${c.domain}`] ? c.domains : c.domains.slice(0, 25);
                return (
                  <div key={c.domain}>
                    <h3 className="seo-mono text-[15px] font-bold">{c.domain} <span className="font-sans text-[13px] font-normal text-[var(--seo-ink-3)]">· {formatNumber(c.domains.length)}{c.domains.length >= 300 ? "+" : ""} site</span></h3>
                    {c.error ? (
                      <p className="mt-2 text-[13px] text-[var(--seo-ink-2)]">Alınamadı: {c.error}</p>
                    ) : (
                      <div className="mt-3 overflow-x-auto">
                        <table className="seo-table">
                          <thead><tr><th>Site</th><th className="num">Rank</th><th className="num">Link</th><th className="num">Spam</th><th>İlk görülme</th><th>Bize de veriyor mu</th></tr></thead>
                          <tbody>
                            {rows.map((d) => (
                              <tr key={d.domain}>
                                <td><a href={`https://${d.domain}`} target="_blank" rel="noopener noreferrer nofollow" className="seo-mono text-[13px] underline">{d.domain}</a></td>
                                <td className="num">{formatNumber(d.rank)}</td>
                                <td className="num">{formatNumber(d.backlinks)}</td>
                                <td className="num"><Spam v={d.spam} /></td>
                                <td className="text-[13px]">{day(d.firstSeen)}</td>
                                <td className="text-[13px]">{snap.ours.domains.some((o) => o.domain === d.domain) ? "Evet" : "Hayır"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <More total={c.domains.length} shown={25} open={!!open[`c:${c.domain}`]} onToggle={() => toggle(`c:${c.domain}`)} />
                  </div>
                );
              })}
            </div>
          </Section>

          <Section title="Link açığı: rakiplere verip bize vermeyenler" aside="Kaç rakibe link verdiğine, sonra güce göre">
            <p className="mb-4 max-w-[760px] text-[14px] text-[var(--seo-ink-2)]">
              Birden çok rakibe link veren site, konu alanımızda link veriyor demektir; ilk iletişim listesi buradan çıkar. Spam puanı 40 ve üzeri olanlar ve her siteyi otomatik listeleyen “SEO checker / backlink” siteleri listeye alınmadı. Değişiklik bir sonraki analizde görünür.
            </p>
            {snap.linkGap.length === 0 ? (
              <p className="text-[var(--seo-ink-2)]">Açık bulunamadı.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="seo-table">
                  <thead><tr><th>Site</th><th>Link verdiği rakipler</th><th className="num">Rank</th><th className="num">Spam</th></tr></thead>
                  <tbody>
                    {gapRows.map((g) => (
                      <tr key={g.domain}>
                        <td><a href={`https://${g.domain}`} target="_blank" rel="noopener noreferrer nofollow" className="seo-mono text-[13px] font-semibold underline">{g.domain}</a></td>
                        <td className="text-[13px]">{g.linksTo.length > 1 && <b>{g.linksTo.length} rakip · </b>}{g.linksTo.join(", ")}</td>
                        <td className="num">{formatNumber(g.rank)}</td>
                        <td className="num"><Spam v={g.spam} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <More total={snap.linkGap.length} shown={50} open={!!open.linkGap} onToggle={() => toggle("linkGap")} />
          </Section>

          <Section title="Kelime açığı: rakipler ilk 10'da, biz değiliz" aside="Aylık aramaya göre">
            {snap.keywordGap.length === 0 ? (
              <p className="text-[var(--seo-ink-2)]">Açık bulunamadı.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="seo-table">
                  <thead><tr><th>Kelime</th><th className="num">Aylık arama</th><th>En iyi rakip</th><th>Rakip sayfası</th><th>Diğer rakipler</th><th className="num">Bizim sıra</th></tr></thead>
                  <tbody>
                    {kwRows.map((k) => (
                      <tr key={k.keyword}>
                        <td className="font-semibold">{k.keyword}</td>
                        <td className="num">{formatNumber(k.volume)}</td>
                        <td className="text-[13px]"><span className="seo-mono">{k.best.domain}</span> · {k.best.position}.</td>
                        <td className="seo-mono max-w-[240px] truncate text-[12px]"><a href={k.best.url} target="_blank" rel="noopener noreferrer nofollow" className="underline">{path(k.best.url)}</a></td>
                        <td className="text-[12px] text-[var(--seo-ink-2)]">{k.others.map((o) => `${o.domain} ${o.position}.`).join(", ") || "-"}</td>
                        <td className="num">{k.ourPosition ?? "yok"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <More total={snap.keywordGap.length} shown={50} open={!!open.kw} onToggle={() => toggle("kw")} />
          </Section>
        </>
      )}
    </>
  );
}
