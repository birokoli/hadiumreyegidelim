"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatedNumber } from "@/components/motion-primitives/animated-number";
import { api, Delta, ErrorLine, formatDate, formatNumber, NeedsKey, PageHead, Section, SEVERITY_ORDER, SeverityWord } from "@/components/admin/seo/ui";

type Status = {
  dataforseo: boolean;
  audit: null | {
    score: number;
    finishedAt: string;
    pageCount: number;
    issues: { code: string; severity: keyof typeof SEVERITY_ORDER; title: string; category: string; count: number; fixed: boolean }[];
  };
  tracked: { keyword: string; position: number | null; previous: number | null; checkedAt: string | null }[];
  ours: null | { keywords: number | null; etv: number | null; top3: number | null; top10: number | null };
};

export default function SeoOverviewPage() {
  const [data, setData] = useState<Status | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Status>("/api/admin/seo/status").then(setData).catch((e) => setError(e.message));
  }, []);

  const open = (data?.audit?.issues ?? [])
    .filter((i) => !i.fixed)
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || b.count - a.count);
  const checked = (data?.tracked ?? []).filter((t) => t.checkedAt);
  const top3 = checked.filter((t) => t.position != null && t.position <= 3).length;
  const top10 = checked.filter((t) => t.position != null && t.position <= 10).length;
  const missing = checked.filter((t) => t.position == null).length;

  return (
    <>
      <PageHead
        n="01"
        title="Sitenin arama durumu"
        lede="hadiumreyegidelim.com'un Google'daki ve AI aramalarındaki yeri. Denetim ücretsiz çalışır; kelime, sıra ve rakip verisi DataForSEO'dan gelir."
      />
      <ErrorLine>{error}</ErrorLine>

      {!data && !error && <p className="text-[var(--seo-ink-3)]">Yükleniyor…</p>}

      {data && (
        <>
          <div className="grid gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <div>
              <p className="seo-label">Site sağlığı</p>
              {data.audit ? (
                <>
                  <p className="mt-3 flex items-baseline gap-2">
                    <AnimatedNumber value={data.audit.score} className="seo-figure text-[140px] sm:text-[176px]" />
                    <span className="text-[28px] font-bold text-[var(--seo-ink-3)]">/100</span>
                  </p>
                  <p className="mt-4 text-[14px] text-[var(--seo-ink-2)]">
                    {formatDate(data.audit.finishedAt)} denetimi, {data.audit.pageCount} sayfa.{" "}
                    <Link href="/admin/seo/denetim" className="seo-link">Ayrıntılar</Link>
                  </p>
                </>
              ) : (
                <div className="mt-4 max-w-[380px]">
                  <p className="text-[18px] font-semibold leading-snug">Henüz denetim yapılmadı.</p>
                  <p className="mt-2 text-[14px] text-[var(--seo-ink-2)]">
                    Denetim sitemap&apos;teki her sayfayı açar; title, açıklama, H1, canonical, şema ve hızı kontrol eder. Ücretsizdir.
                  </p>
                  <Link href="/admin/seo/denetim" className="seo-btn mt-5">İlk denetimi başlat</Link>
                </div>
              )}
            </div>

            <div>
              <p className="seo-label">Önce bunları düzeltin</p>
              {open.length === 0 ? (
                <p className="mt-4 text-[15px] text-[var(--seo-ink-2)]">
                  {data.audit ? "Açık sorun kalmadı." : "Denetimden sonra burada en önemli sorunlar sıralanır."}
                </p>
              ) : (
                <ol className="mt-4">
                  {open.slice(0, 6).map((i) => (
                    <li key={i.code} className="grid grid-cols-[64px_1fr_auto] items-baseline gap-4 py-3">
                      <SeverityWord severity={i.severity} />
                      <Link href={`/admin/seo/denetim#${i.code}`} className="text-[16px] font-semibold leading-snug hover:underline">
                        {i.title}
                      </Link>
                      <span className="text-[13px] tabular-nums text-[var(--seo-ink-3)]">{i.count ? `${i.count} sayfa` : "site geneli"}</span>
                    </li>
                  ))}
                </ol>
              )}
              {open.length > 6 && (
                <p className="mt-2 text-[13px] text-[var(--seo-ink-3)]">ve {open.length - 6} sorun daha</p>
              )}
            </div>
          </div>

          <Section title="Takip edilen kelimeler" aside={<Link href="/admin/seo/siralar" className="seo-link">Sıralar</Link>}>
            {data.tracked.length === 0 ? (
              <p className="max-w-[560px] text-[15px] text-[var(--seo-ink-2)]">
                Henüz kelime takip edilmiyor. <Link href="/admin/seo/kelimeler" className="seo-link">Kelime araştırmasından</Link>{" "}seçin
                ya da <Link href="/admin/seo/siralar" className="seo-link">elle ekleyin</Link>.
              </p>
            ) : (
              <>
                <div className="mb-8 flex flex-wrap gap-x-14 gap-y-4">
                  {[
                    ["İlk 3", top3],
                    ["İlk 10", top10],
                    ["İlk 50'de yok", missing],
                  ].map(([label, n]) => (
                    <div key={label as string}>
                      <p className="seo-figure text-[56px]">{n}</p>
                      <p className="seo-label mt-2">{label}</p>
                    </div>
                  ))}
                </div>
                <ul className="grid gap-x-12 sm:grid-cols-2">
                  {data.tracked.slice(0, 10).map((t) => (
                    <li key={t.keyword} className="grid grid-cols-[52px_1fr_auto] items-baseline gap-3 py-2.5">
                      <span className="text-[26px] font-extrabold tabular-nums tracking-tight">
                        {t.checkedAt ? (t.position ?? "50+") : "·"}
                      </span>
                      <span className="text-[15px] font-medium">{t.keyword}</span>
                      <Delta now={t.position} prev={t.previous} />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Section>

          <Section title="Google'daki görünürlük" aside={data.dataforseo ? <Link href="/admin/seo/rakipler" className="seo-link">Rakiplerle karşılaştır</Link> : null}>
            {!data.dataforseo ? (
              <NeedsKey compact />
            ) : data.ours ? (
              <dl className="flex flex-wrap gap-x-14 gap-y-6">
                {[
                  ["Sıralandığı kelime", data.ours.keywords],
                  ["Tahmini aylık ziyaret", data.ours.etv],
                  ["İlk 3'teki kelime", data.ours.top3],
                  ["İlk 10'daki kelime", data.ours.top10],
                ].map(([label, n]) => (
                  <div key={label as string}>
                    <dd className="seo-figure text-[56px]">{formatNumber(n as number | null)}</dd>
                    <dt className="seo-label mt-2">{label}</dt>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-[15px] text-[var(--seo-ink-2)]">
                DataForSEO bağlı. Alan adı verisi için <Link href="/admin/seo/rakipler" className="seo-link">Rakipler</Link>{" "}sayfasında ilk karşılaştırmayı çalıştırın.
              </p>
            )}
          </Section>
        </>
      )}
    </>
  );
}
