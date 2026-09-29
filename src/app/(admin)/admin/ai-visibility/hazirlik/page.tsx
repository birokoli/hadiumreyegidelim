"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatedNumber } from "@/components/motion-primitives/animated-number";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";
import { api, ErrorLine, formatDate, PageHead, Section } from "@/components/admin/seo/ui";
import type { Check, Readiness } from "@/lib/ai-vis/readiness";

export default function ReadinessPage() {
  const [data, setData] = useState<Readiness | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ readiness: Readiness | null }>("/api/admin/ai-vis/readiness")
      .then((d) => setData(d.readiness))
      .catch((e) => setError(e.message))
      .finally(() => setLoaded(true));
  }, []);

  const runCheck = async () => {
    setRunning(true);
    setError("");
    try {
      const d = await api<{ readiness: Readiness; saveError: string | null }>("/api/admin/ai-vis/readiness", { method: "POST" });
      setData(d.readiness);
      if (d.saveError) setError(d.saveError);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <>
      <PageHead
        n="06"
        title="AI'a hazırlık"
        lede="Sitenin AI motorlarınca bulunup alıntılanabilmesi için ölçülebilir sinyaller: botların erişimi, llms.txt, yapısal veri, sayfanın ilk paragrafta cevabı vermesi, soru biçimli başlıklar, tarih, rakam ve kaynak. Ücretsizdir."
      >
        <button className="seo-btn" onClick={runCheck} disabled={running}>{running ? "Denetleniyor" : data ? "Yeniden denetle" : "Denetimi başlat"}</button>
      </PageHead>
      <ErrorLine>{error}</ErrorLine>

      {running && (
        <p className="mb-12" aria-live="polite">
          <TextShimmer className="text-[20px] font-bold" baseColor="#6b7690" highlightColor="#003781">Sayfalar okunuyor</TextShimmer>
        </p>
      )}

      {loaded && !data && !running && (
        <p className="max-w-[560px] text-[16px] text-[var(--seo-ink-2)]">
          Henüz denetim yok. Ana sayfa, bireysel umre, paketler, vize, bir blog yazısı, bir paket ve bir şehir sayfası kontrol edilir.
        </p>
      )}

      {data && !running && (
        <>
          <div className="grid gap-12 lg:grid-cols-[auto_1fr] lg:items-end">
            <p className="flex items-baseline gap-2">
              <AnimatedNumber value={data.score} className="seo-figure text-[140px] sm:text-[176px]" />
              <span className="text-[28px] font-bold text-[var(--seo-ink-3)]">/100</span>
            </p>
            <div className="max-w-[540px] pb-4">
              <p className="text-[18px] font-semibold leading-snug">
                {data.pages.length} sayfada {data.site.length + data.pages.reduce((s, p) => s + p.checks.length, 0)} kontrol yapıldı; puan geçen kontrollerin oranı.
              </p>
              <p className="mt-2 text-[14px] text-[var(--seo-ink-3)]">{formatDate(data.checkedAt)}</p>
              <p className="mt-3 text-[13px] text-[var(--seo-ink-3)]">
                Title, canonical ve hız gibi klasik kontroller <Link href="/admin/seo/denetim" className="seo-link">SEO Masası denetiminde</Link>.
              </p>
            </div>
          </div>

          <Section title="Site geneli">
            <CheckList checks={data.site} />
          </Section>

          {data.pages.map((p) => (
            <Section
              key={p.path}
              title={p.path}
              aside={p.status === 200 ? `${p.checks.filter((c) => c.pass).length}/${p.checks.length} geçti` : `yanıt: ${p.status || "yok"}`}
            >
              {p.checks.length ? <CheckList checks={p.checks} /> : <p className="text-[14px] text-[var(--seo-danger)]">Sayfa okunamadı.</p>}
            </Section>
          ))}
        </>
      )}
    </>
  );
}

function CheckList({ checks }: { checks: Check[] }) {
  return (
    <ul>
      {checks
        .slice()
        .sort((a, b) => Number(a.pass) - Number(b.pass))
        .map((c) => (
          <li key={c.id} className="grid gap-x-6 gap-y-1 py-3 sm:grid-cols-[80px_minmax(0,1fr)_minmax(0,1.3fr)]">
            <span className={`text-[12px] font-bold ${c.pass ? "text-[var(--seo-ink-3)]" : "text-[var(--seo-danger)]"}`}>{c.pass ? "geçti" : "eksik"}</span>
            <div>
              <p className={`text-[16px] font-semibold ${c.pass ? "text-[var(--seo-ink-2)]" : ""}`}>{c.label}</p>
              <p className="mt-0.5 text-[13px] text-[var(--seo-ink-3)]">{c.detail}</p>
            </div>
            {!c.pass && <p className="text-[14px] leading-relaxed">{c.fix}</p>}
          </li>
        ))}
    </ul>
  );
}
