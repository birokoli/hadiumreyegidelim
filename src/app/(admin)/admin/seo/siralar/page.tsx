"use client";

import { useEffect, useState } from "react";
import { api, Cost, Delta, ErrorLine, formatDate, NeedsKey, PageHead, Sparkline, useDataforseoReady } from "@/components/admin/seo/ui";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";
import type { TrackedKeyword } from "@/lib/seo/types";

export default function RankTrackingPage() {
  const [tracked, setTracked] = useState<TrackedKeyword[] | null>(null);
  const [input, setInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [cost, setCost] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [needsKeyError, setNeedsKey] = useState(false);
  const dfsReady = useDataforseoReady();
  const needsKey = needsKeyError || dfsReady === false;
  const [problems, setProblems] = useState<string[]>([]);

  useEffect(() => {
    api<{ tracked: TrackedKeyword[] }>("/api/admin/seo/ranks").then((d) => setTracked(d.tracked)).catch((e) => setError(e.message));
  }, []);

  const call = async (body: unknown) => {
    setError("");
    try {
      const d = await api<{ tracked: TrackedKeyword[]; cost?: number; errors?: string[] }>("/api/admin/seo/ranks", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setTracked(d.tracked);
      if (d.cost != null) setCost(d.cost);
      setProblems(d.errors ?? []);
      return true;
    } catch (e) {
      const err = e as Error & { needsKey?: boolean };
      if (err.needsKey) setNeedsKey(true);
      else setError(err.message);
      return false;
    }
  };

  const add = async () => {
    const keywords = input.split(/\n|,/).map((k) => k.trim()).filter(Boolean);
    if (!keywords.length) return;
    if (await call({ action: "add", keywords })) setInput("");
  };

  const check = async () => {
    setChecking(true);
    await call({ action: "check" });
    setChecking(false);
  };

  const list = tracked ?? [];
  const lastCheck = list.map((t) => t.history.at(-1)?.date).filter(Boolean).sort().at(-1);
  const withPos = list.filter((t) => t.history.length);
  const count = (fn: (p: number | null) => boolean) => withPos.filter((t) => fn(t.history.at(-1)!.position)).length;

  return (
    <>
      <PageHead
        n="04"
        title="Sıra takibi"
        lede="Seçtiğiniz kelimelerde sitenin Google'daki yeri; Türkiye, mobil sonuçlar, ilk 50 sıra. Her kontrol ayrı ücretlendirilir, bu yüzden otomatik değil, siz başlatırsınız."
      >
        <button className="seo-btn" onClick={check} disabled={checking || list.length === 0 || needsKey}>
          {checking ? "Kontrol ediliyor" : `${list.length} kelimeyi kontrol et`}
        </button>
      </PageHead>

      {needsKey && <div className="mb-12"><NeedsKey /></div>}
      <ErrorLine>{error}</ErrorLine>
      {problems.length > 0 && (
        <ul className="mt-3 text-[13px] text-[var(--seo-danger)]">{problems.map((p) => <li key={p}>{p}</li>)}</ul>
      )}

      {checking && (
        <p className="mb-10" aria-live="polite">
          <TextShimmer className="text-[20px] font-bold">Google sonuçları okunuyor</TextShimmer>
        </p>
      )}

      {withPos.length > 0 && (
        <div className="mb-16 flex flex-wrap items-end gap-x-14 gap-y-6">
          {[
            ["İlk 3", count((p) => p != null && p <= 3)],
            ["İlk 10", count((p) => p != null && p <= 10)],
            ["11–50", count((p) => p != null && p > 10)],
            ["İlk 50'de yok", count((p) => p == null)],
          ].map(([label, n]) => (
            <div key={label as string}>
              <p className="seo-figure text-[64px]">{n}</p>
              <p className="seo-label mt-2">{label}</p>
            </div>
          ))}
          <div className="ml-auto text-right">
            <p className="text-[13px] text-[var(--seo-ink-3)]">Son kontrol {formatDate(lastCheck)}</p>
            <Cost usd={cost} />
          </div>
        </div>
      )}

      {tracked && list.length === 0 && (
        <p className="mb-10 max-w-[560px] text-[16px] text-[var(--seo-ink-2)]">
          Takip edilen kelime yok. Aşağıya satır satır yazın ya da Kelimeler sayfasından seçin.
        </p>
      )}

      {list.length > 0 && (
        <ol>
          {list.map((t) => {
            const last = t.history.at(-1);
            const prev = t.history.at(-2);
            return (
              <li key={t.keyword} className="grid grid-cols-[72px_1fr] gap-x-5 border-t border-[var(--seo-rule)] py-5 first:border-t-0 sm:grid-cols-[88px_1fr_auto_auto]">
                <span className="seo-figure text-[44px] sm:text-[52px]">{last ? (last.position ?? "50+") : "·"}</span>
                <div className="min-w-0">
                  <p className="text-[18px] font-semibold">{t.keyword}</p>
                  {last?.url ? (
                    <p className="seo-mono mt-1 truncate text-[13px] text-[var(--seo-ink-2)]">{last.url.replace(/^https?:\/\/(www\.)?/, "")}</p>
                  ) : (
                    <p className="mt-1 text-[13px] text-[var(--seo-ink-3)]">{last ? "Sitemizden sayfa ilk 50'de yok" : "Henüz kontrol edilmedi"}</p>
                  )}
                  {t.topThree && t.topThree.length > 0 && (
                    <p className="mt-2 text-[13px] text-[var(--seo-ink-3)]">
                      İlk üç: {t.topThree.map((s) => s.domain).join(", ")}
                    </p>
                  )}
                </div>
                <div className="col-start-2 mt-3 flex items-center gap-5 sm:col-start-auto sm:mt-0">
                  <Delta now={last?.position ?? null} prev={prev ? prev.position : null} />
                  <Sparkline values={t.history.slice(-20).map((h) => h.position ?? 51)} invert />
                </div>
                <button
                  className="col-start-2 mt-2 justify-self-start text-[13px] font-semibold text-[var(--seo-ink-3)] hover:text-[var(--seo-danger)] sm:col-start-auto sm:mt-0 sm:justify-self-end"
                  onClick={() => call({ action: "remove", keyword: t.keyword })}
                  aria-label={`${t.keyword} takibini bırak`}
                >
                  Bırak
                </button>
              </li>
            );
          })}
        </ol>
      )}

      <form
        className="mt-16 max-w-[560px]"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <label htmlFor="kw" className="text-[16px] font-bold">Kelime ekle</label>
        <p className="mt-1 text-[13px] text-[var(--seo-ink-3)]">Her satıra bir kelime. En fazla 50 kelime takip edilir.</p>
        <textarea
          id="kw"
          rows={4}
          className="seo-input mt-3 w-full resize-y"
          placeholder={"umre turları\nistanbul çıkışlı umre"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="seo-btn mt-3" disabled={!input.trim()}>Ekle</button>
      </form>
    </>
  );
}
