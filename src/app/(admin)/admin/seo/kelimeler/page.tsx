"use client";

import { useState } from "react";
import { api, Cost, ErrorLine, formatNumber, NeedsKey, PageHead, Sparkline, useDataforseoReady } from "@/components/admin/seo/ui";
import type { KeywordRow } from "@/lib/seo/dataforseo";

const INTENT: Record<string, string> = {
  informational: "bilgi",
  commercial: "araştırma",
  transactional: "satın alma",
  navigational: "marka",
};

const EXAMPLES = ["umre turları", "bireysel umre", "umre fiyatları 2026", "umre vizesi"];

export default function KeywordResearchPage() {
  const [seed, setSeed] = useState("");
  const [mode, setMode] = useState<"suggestions" | "related">("suggestions");
  const [rows, setRows] = useState<KeywordRow[] | null>(null);
  const [cost, setCost] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsKeyError, setNeedsKey] = useState(false);
  const dfsReady = useDataforseoReady();
  const needsKey = needsKeyError || dfsReady === false;
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState("");

  const search = async (value = seed) => {
    if (!value.trim()) return;
    setSeed(value);
    setLoading(true);
    setError("");
    setNotice("");
    setSelected(new Set());
    try {
      const d = await api<{ rows: KeywordRow[]; cost: number }>("/api/admin/seo/keywords", {
        method: "POST",
        body: JSON.stringify({ seed: value, mode }),
      });
      setRows(d.rows);
      setCost(d.cost);
    } catch (e) {
      const err = e as Error & { needsKey?: boolean };
      if (err.needsKey) setNeedsKey(true);
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const track = async () => {
    try {
      await api("/api/admin/seo/ranks", { method: "POST", body: JSON.stringify({ action: "add", keywords: [...selected] }) });
      setNotice(`${selected.size} kelime sıra takibine eklendi.`);
      setSelected(new Set());
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const toggle = (k: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  return (
    <>
      <PageHead
        n="03"
        title="Kelime araştırması"
        lede="Bir kelime yazın; Türkiye'de Google'da aranan benzer kelimeleri aylık hacim, zorluk ve arama niyetiyle getirir. Beğendiklerinizi sıra takibine ekleyin."
      />

      {needsKey ? (
        <NeedsKey />
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            search();
          }}
          className="max-w-[760px]"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="seed">Kelime</label>
            <input
              id="seed"
              className="seo-input flex-1 text-[18px]"
              placeholder="ör. bireysel umre"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
            />
            <button className="seo-btn justify-center" disabled={loading || !seed.trim()}>
              {loading ? "Aranıyor" : "Ara"}
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px]">
            <fieldset className="flex gap-5">
              <legend className="sr-only">Arama türü</legend>
              {(
                [
                  ["suggestions", "Kelimeyi içerenler"],
                  ["related", "İlişkili aramalar"],
                ] as const
              ).map(([value, label]) => (
                <label key={value} className="flex cursor-pointer items-center gap-2 font-semibold">
                  <input type="radio" name="mode" checked={mode === value} onChange={() => setMode(value)} className="accent-[var(--seo-ink)]" />
                  {label}
                </label>
              ))}
            </fieldset>
            <span className="text-[var(--seo-ink-3)]">
              Örnek:{" "}
              {EXAMPLES.map((ex, i) => (
                <span key={ex}>
                  <button type="button" className="seo-link" onClick={() => search(ex)}>{ex}</button>
                  {i < EXAMPLES.length - 1 && ", "}
                </span>
              ))}
            </span>
          </div>
        </form>
      )}

      <ErrorLine>{error}</ErrorLine>
      {notice && <p className="mt-4 text-[14px] font-semibold">{notice}</p>}

      {rows && (
        <div className="mt-14">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
            <p className="text-[18px] font-bold">{rows.length} kelime</p>
            <div className="flex items-center gap-5">
              <Cost usd={cost} />
              <button className="seo-btn" disabled={selected.size === 0} onClick={track}>
                {selected.size ? `${selected.size} kelimeyi takibe al` : "Takip için seçin"}
              </button>
            </div>
          </div>
          {rows.length === 0 ? (
            <p className="text-[var(--seo-ink-2)]">Bu kelime için veri yok. Daha genel bir kelime deneyin.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="seo-table">
                <thead>
                  <tr>
                    <th className="w-8"><span className="sr-only">Seç</span></th>
                    <th>Kelime</th>
                    <th className="num">Aylık arama</th>
                    <th className="num">Zorluk</th>
                    <th className="num">TBM</th>
                    <th>Niyet</th>
                    <th>Son 12 ay</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.keyword}>
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`${r.keyword} seç`}
                          checked={selected.has(r.keyword)}
                          onChange={() => toggle(r.keyword)}
                          className="h-4 w-4 accent-[var(--seo-ink)]"
                        />
                      </td>
                      <td className="font-semibold">{r.keyword}</td>
                      <td className="num font-bold">{formatNumber(r.volume)}</td>
                      <td className="num">
                        {r.difficulty == null ? "—" : (
                          <span className={r.difficulty >= 60 ? "font-bold text-[var(--seo-danger)]" : ""}>{r.difficulty}</span>
                        )}
                      </td>
                      <td className="num">{r.cpc == null ? "—" : `$${r.cpc.toFixed(2)}`}</td>
                      <td className="text-[13px] text-[var(--seo-ink-2)]">{r.intent ? INTENT[r.intent] ?? r.intent : "—"}</td>
                      <td><Sparkline values={r.trend} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-4 text-[13px] text-[var(--seo-ink-3)]">
                Zorluk 0–100 arasıdır; 60 ve üstü kırmızı. TBM, Google Ads&apos;te tıklama başına ortalama ücrettir (USD).
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
