"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAiVis } from "@/components/admin/ai-vis/AiVisProvider";
import { N, Pct, RunBar, RunProgress } from "@/components/admin/ai-vis/parts";
import { ErrorLine, PageHead, Section } from "@/components/admin/seo/ui";
import { competitorBoard, contentGaps, latestRuns } from "@/lib/ai-vis/metrics";
import type { Subject } from "@/lib/ai-vis/types";

const splitList = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

export default function CompetitorsPage() {
  const { data, error, saveConfig } = useAiVis();
  const view = useMemo(() => {
    if (!data) return null;
    const runs = latestRuns(data.cells, data.config);
    return { n: runs.filter((r) => r.a.countable).length, board: competitorBoard(runs, data.config), gaps: contentGaps(runs, data.config) };
  }, [data]);

  if (!data || !view) return <ErrorLine>{error}</ErrorLine>;

  return (
    <>
      <PageHead
        n="05"
        title="Marka ve rakipler"
        lede="AI yanıtlarında kimin, ne sıklıkla anıldığı. Rakip adları ve alan adları yazılınca geçmiş yanıtlar da yeniden hesaplanır; yeni sorgu gerekmez."
      >
        <RunBar />
      </PageHead>
      <RunProgress />
      <ErrorLine>{error}</ErrorLine>

      {view.n > 0 && (
        <section>
          <div className="mb-5 flex items-baseline gap-3">
            <h2 className="text-[22px] font-bold tracking-tight">Ses payı</h2>
            <N n={view.n} />
          </div>
          <div className="max-w-[760px]">
            {view.board.map((row) => (
              <div key={row.name} className="grid grid-cols-[minmax(0,180px)_1fr_64px_64px] items-center gap-4 py-2.5">
                <span className={`truncate text-[15px] ${row.ours ? "font-extrabold text-[var(--seo-mark)]" : "font-semibold"}`}>{row.name}</span>
                <span className="h-2.5 rounded-full bg-[var(--seo-paper-2)]" aria-hidden>
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${(row.sov ?? 0) * 100}%`, background: row.ours ? "var(--seo-mark)" : "#6b7690" }}
                  />
                </span>
                <span className="text-right text-[16px] font-extrabold tabular-nums"><Pct value={row.sov} /></span>
                <span className="text-right text-[13px] tabular-nums text-[var(--seo-ink-3)]" title="Anıldığı yanıt oranı"><Pct value={row.visibility} /></span>
              </div>
            ))}
            <p className="mt-3 text-[12px] text-[var(--seo-ink-3)]">Büyük sayı ses payı, küçük sayı anıldığı yanıtların oranı.</p>
          </div>
        </section>
      )}

      {view.gaps.length > 0 && (
        <Section title="İçerik boşlukları" aside="rakiplerin anılıp markanın hiçbir motorda anılmadığı sorular">
          <ul>
            {view.gaps.map((g) => (
              <li key={g.prompt.id} className="grid gap-2 py-3 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-6">
                <Link href={`/admin/ai-visibility/yanitlar?p=${g.prompt.id}`} className="text-[16px] font-semibold hover:underline">{g.prompt.text}</Link>
                <span className="text-[13px] text-[var(--seo-ink-3)]">{g.competitors.join(", ")}</span>
                <Link
                  href={`/admin/seo/blog?topic=${encodeURIComponent(g.prompt.text)}`}
                  className="seo-btn text-[12px] py-1 px-2.5 whitespace-nowrap"
                >
                  Bu soru için yazı üret →
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 max-w-[640px] text-[13px] text-[var(--seo-ink-3)]">
            Her biri için sitede o soruyu doğrudan cevaplayan bir sayfa ya da bölüm olmalı. Hangi sitelerin kaynak gösterildiğini Yanıtlar sayfasında görebilirsiniz.
          </p>
        </Section>
      )}

      <Section title="Marka">
        <SubjectForm subject={data.config.brand} onSave={(brand) => saveConfig({ brand })} />
      </Section>

      <Section title="Rakipler" aside="en fazla 10">
        <div className="space-y-10">
          {data.config.competitors.map((c, i) => (
            <SubjectForm
              key={`${c.name}-${i}`}
              subject={c}
              onSave={(next) => saveConfig({ competitors: data.config.competitors.map((x, j) => (j === i ? next : x)) })}
              onRemove={() => saveConfig({ competitors: data.config.competitors.filter((_, j) => j !== i) })}
            />
          ))}
          <SubjectForm
            key={`new-${data.config.competitors.length}`}
            subject={{ name: "", aliases: [], domains: [] }}
            submitLabel="Rakip ekle"
            onSave={(next) => saveConfig({ competitors: [...data.config.competitors, next] })}
          />
        </div>
      </Section>
    </>
  );
}

function SubjectForm({ subject, onSave, onRemove, submitLabel = "Kaydet" }: { subject: Subject; onSave: (s: Subject) => void; onRemove?: () => void; submitLabel?: string }) {
  const [name, setName] = useState(subject.name);
  const [aliases, setAliases] = useState(subject.aliases.join(", "));
  const [domains, setDomains] = useState(subject.domains.join(", "));
  const dirty = name !== subject.name || aliases !== subject.aliases.join(", ") || domains !== subject.domains.join(", ");

  return (
    <form
      className="grid max-w-[900px] gap-3 sm:grid-cols-[1fr_1.3fr_1.3fr_auto] sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim()) onSave({ name: name.trim(), aliases: splitList(aliases), domains: splitList(domains) });
      }}
    >
      <label className="flex flex-col gap-1 text-[12px] font-semibold text-[var(--seo-ink-3)]">
        Ad
        <input className="seo-input text-[15px] text-[var(--seo-ink)]" value={name} onChange={(e) => setName(e.target.value)} placeholder="Firma adı" />
      </label>
      <label className="flex flex-col gap-1 text-[12px] font-semibold text-[var(--seo-ink-3)]">
        Diğer yazılışlar (virgülle)
        <input className="seo-input text-[15px] text-[var(--seo-ink)]" value={aliases} onChange={(e) => setAliases(e.target.value)} placeholder="Kısaltma, eski ad" />
      </label>
      <label className="flex flex-col gap-1 text-[12px] font-semibold text-[var(--seo-ink-3)]">
        Alan adları (virgülle)
        <input className="seo-input seo-mono text-[14px] text-[var(--seo-ink)]" value={domains} onChange={(e) => setDomains(e.target.value)} placeholder="ornek.com" />
      </label>
      <div className="flex items-center gap-4 pb-1">
        <button className="seo-btn" disabled={!name.trim() || (!dirty && submitLabel === "Kaydet")}>{submitLabel}</button>
        {onRemove && (
          <button type="button" className="text-[13px] font-semibold text-[var(--seo-ink-3)] hover:text-[var(--seo-danger)]" onClick={onRemove}>
            Sil
          </button>
        )}
      </div>
    </form>
  );
}
