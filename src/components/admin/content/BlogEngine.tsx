"use client";

// İçerik Stüdyosu → Blog İçerikleri'nin üstündeki blog motoru: otomatik yazı, yeni yazı
// üretimi (fırsat kuyruğu dahil) ve iç link araçları. Taslaklar ayrı bir listede değil,
// İçerik Stüdyosu'nun kendi listesinde görünür; üretilen taslak doğrudan düzenleyicide açılır.

import { useCallback, useEffect, useState } from "react";
import AutoBlogPanel from "@/components/admin/seo/AutoBlogPanel";
import { deskGrotesk, deskMono } from "@/components/admin/seo/fonts";
import { api, ErrorLine } from "@/components/admin/seo/ui";
import type { BlogOpportunity } from "@/lib/geo-blog/opportunities";
import type { PostLinkAnalysis } from "@/lib/geo-blog/links";
import "@/app/(admin)/admin/seo/seo.css";

type Tab = "auto" | "new" | "links";
type Step = { step: string; message?: string; error?: string; data?: { postId?: string; gateReport?: { score: number; passed: boolean; issues: { message: string }[] } } };

const SOURCE_LABEL: Record<BlogOpportunity["source"], string> = {
  content_gap: "rakip anılıyor, biz yokuz",
  fan_out_query: "AI'ın arattığı",
  tracked_keyword: "SEO kelimesi",
  prompt: "AI sorusu",
};

export default function BlogEngine({ initialTopic = "", initialTab, onDraftCreated, onPostsChanged }: {
  initialTopic?: string;
  initialTab?: Tab;
  /** Üretilen taslağı düzenleyicide açmak için */
  onDraftCreated: (postId: string) => void;
  onPostsChanged: () => void;
}) {
  const [tab, setTab] = useState<Tab>(initialTab ?? (initialTopic ? "new" : "auto"));

  return (
    <section className={`seo-desk ${deskGrotesk.variable} ${deskMono.variable} rounded-2xl border border-outline-variant/15 px-6 pb-10 pt-6 sm:px-8`}>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h2 className="text-[26px] font-extrabold tracking-tight">Blog motoru</h2>
          <p className="mt-1 max-w-[720px] text-[14px] leading-relaxed text-[var(--seo-ink-2)]">
            Konuyu AI Görünürlük ve SEO verisinden seçer, web aramasıyla gerçek kaynaklardan araştırır, Google&apos;ın ve AI&apos;ın alıntılayabileceği yapıda yazar.
            {" Her yazı "}<b>taslak</b>{" olarak aşağıdaki listeye düşer; sitede görünmesi için Yayınla’ya basılır."}
          </p>
        </div>
        <nav className="flex gap-5 text-[14px] font-semibold" aria-label="Blog motoru bölümleri">
          {(
            [
              ["auto", "Otomatik yazı"],
              ["new", "Yeni yazı üret"],
              ["links", "İç linkler"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              aria-current={tab === k ? "page" : undefined}
              className={tab === k ? "text-[var(--seo-mark)] underline decoration-2 underline-offset-8" : "text-[var(--seo-ink-3)] hover:text-[var(--seo-ink)]"}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
      <div className="-mt-10">
        {tab === "auto" && <AutoBlogPanel onDraftCreated={onPostsChanged} />}
        {tab === "new" && <NewPost initialTopic={initialTopic} onDraftCreated={onDraftCreated} />}
        {tab === "links" && <LinkTools onChanged={onPostsChanged} />}
      </div>
    </section>
  );
}

function NewPost({ initialTopic, onDraftCreated }: { initialTopic: string; onDraftCreated: (postId: string) => void }) {
  const [topic, setTopic] = useState(initialTopic);
  const [ops, setOps] = useState<BlogOpportunity[] | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ opportunities: BlogOpportunity[] }>("/api/admin/geo-blog/opportunities")
      .then((d) => setOps(d.opportunities))
      .catch((e) => setError(e.message));
  }, []);

  const generate = async (t: string) => {
    const clean = t.trim();
    if (!clean || running) return;
    setTopic(clean);
    setRunning(true);
    setError("");
    setSteps([]);
    try {
      const res = await fetch("/api/admin/geo-blog/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: clean }) });
      if (!res.ok || !res.body) throw new Error((await res.json().catch(() => ({}))).error || `HTTP ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let savedId: string | null = null;
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const msg = JSON.parse(line) as Step & { data?: { message?: string } };
          const text = msg.message ?? (msg.data as { message?: string } | undefined)?.message;
          setSteps((s) => [...s, { ...msg, message: text }]);
          if (msg.step === "error") throw new Error(msg.error);
          if (msg.step === "saved" && msg.data?.postId) savedId = msg.data.postId;
        }
      }
      if (savedId) onDraftCreated(savedId);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRunning(false);
    }
  };

  const saved = steps.find((s) => s.step === "saved")?.data?.gateReport;

  return (
    <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)]">
      <div>
        <p className="text-[16px] font-bold">Konuyu yazın</p>
        <p className="mt-1 text-[13px] text-[var(--seo-ink-3)]">Bir soru ya da konu. Araştırma ve yazım 2–4 dakika sürer, yaklaşık 0,5–1 $ tutar.</p>
        <form
          className="mt-3 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            generate(topic);
          }}
        >
          <input className="seo-input flex-1" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="ör. Umre vizesi kaç günde çıkar?" disabled={running} />
          <button className="seo-btn justify-center" disabled={running || !topic.trim()}>{running ? "Yazılıyor" : "Araştır ve yaz"}</button>
        </form>
        <ErrorLine>{error}</ErrorLine>
        {steps.length > 0 && (
          <ol className="mt-5 space-y-1.5 text-[13px]" aria-live="polite">
            {steps.map((s, i) => (
              <li key={i} className={s.step === "error" ? "font-semibold text-[var(--seo-danger)]" : "text-[var(--seo-ink-2)]"}>
                {s.step === "saved" ? "Taslak kaydedildi; düzenleyicide açılıyor." : s.error ?? s.message}
              </li>
            ))}
          </ol>
        )}
        {saved && (
          <div className="mt-4 text-[13px]">
            <p className="font-bold">Kalite kapısı: {saved.score}/100 {saved.passed ? "(geçti)" : "(geçmedi, düzenleyicide gözden geçirin)"}</p>
            {saved.issues.length > 0 && <ul className="mt-1 list-disc pl-5 text-[var(--seo-ink-2)]">{saved.issues.map((i) => <li key={i.message}>{i.message}</li>)}</ul>}
          </div>
        )}
      </div>
      <div>
        <p className="text-[16px] font-bold">Ya da fırsatlardan seçin</p>
        <p className="mt-1 text-[13px] text-[var(--seo-ink-3)]">AI yanıtlarında rakiplerin geçip markanın geçmediği sorular, AI&apos;ın arattığı sorgular ve sıralamada olmadığımız kelimeler.</p>
        {!ops ? (
          <p className="mt-4 text-[13px] text-[var(--seo-ink-3)]">Fırsatlar yükleniyor…</p>
        ) : ops.length === 0 ? (
          <p className="mt-4 text-[13px] text-[var(--seo-ink-3)]">Şu an açık fırsat yok. AI Görünürlük&apos;te soru sorup SEO&apos;da kelime takibe alınca burası dolar.</p>
        ) : (
          <ul className="mt-3">
            {ops.slice(0, 10).map((o) => (
              <li key={o.topic} className="grid grid-cols-[1fr_auto] items-center gap-4 border-t border-[var(--seo-rule)] py-3 first:border-t-0">
                <div>
                  <p className="text-[15px] font-semibold leading-snug">{o.topic}</p>
                  <p className="mt-0.5 text-[12px] text-[var(--seo-ink-3)]">
                    <span className="font-semibold text-[var(--seo-mark)]">{SOURCE_LABEL[o.source]}</span> · {o.reason}
                  </p>
                </div>
                <button className="seo-link text-[13px]" disabled={running} onClick={() => generate(o.topic)}>Yaz</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function LinkTools({ onChanged }: { onChanged: () => void }) {
  const [items, setItems] = useState<PostLinkAnalysis[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    try {
      setItems((await api<{ analyses: PostLinkAnalysis[] }>("/api/admin/geo-blog/links?analyze=true")).analyses);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  type LinkResult = { fixedPostsCount?: number; fixedLinksTotal?: number; insertedLinkCount?: number; removedLinksTotal?: number; redirectedLinksTotal?: number };
  const post = async (body: unknown, key: string, okNote: (r: LinkResult) => string) => {
    setBusy(key);
    setError("");
    try {
      const r = await api<LinkResult>("/api/admin/geo-blog/links", { method: "POST", body: JSON.stringify(body) });
      setNote(okNote(r));
      await load();
      onChanged();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const broken = items?.filter((i) => i.hasRehberLinks).reduce((s, i) => s + i.rehberLinkCount, 0) ?? 0;
  const offDomain = items?.reduce((s, i) => s + (i.offDomainLinkCount ?? 0), 0) ?? 0;

  return (
    <div className="mt-16">
      <div className="flex flex-wrap items-center gap-4">
        <p className="text-[14px] text-[var(--seo-ink-2)]">
          Yazılarda geçen konular için ilgili sayfalara link önerileri. Link, metinde ilk geçtiği yere eklenir; başlıklara ve mevcut linklere dokunulmaz.
        </p>
        {broken > 0 && (
          <button className="seo-btn" disabled={busy !== null} onClick={() => post({ action: "fix_rehber" }, "fix", (r) => `${r.fixedPostsCount ?? 0} yazıda ${r.fixedLinksTotal ?? 0} kırık /rehber linki /rehberlik yapıldı.`)}>
            {busy === "fix" ? "Düzeltiliyor" : `${broken} kırık /rehber linkini düzelt`}
          </button>
        )}
        {offDomain > 0 && (
          <button className="seo-btn" disabled={busy !== null} onClick={() => post({ action: "strip_external" }, "strip", (r) => `${r.fixedPostsCount ?? 0} yazıda ${r.redirectedLinksTotal ?? 0} link kendi hizmet sayfamıza çevrildi, ${r.removedLinksTotal ?? 0} izinsiz dış link kaldırıldı.`)}>
            {busy === "strip" ? "Kaldırılıyor" : `${offDomain} izinsiz dış linki düzelt`}
          </button>
        )}
      </div>
      <p className="mt-2 text-[13px] text-[var(--seo-ink-3)]">
        Dış link kuralı: yalnızca Diyanet, Nusuk ve Suudi devlet sitelerinin bilgi sayfalarına, konu kelimesi üzerinden link verilir. Sattığımız hizmetler (vize, paket, otel, uçuş, transfer, tren, rehberlik) kendi sayfamıza bağlanır. Rakip firma siteleri ve adları yazılarda yer almaz.
      </p>
      <div>
      </div>
      <ErrorLine>{error}</ErrorLine>
      {note && <p className="mt-3 text-[13px] font-semibold text-[var(--seo-mark)]">{note}</p>}
      {!items ? (
        <p className="mt-4 text-[13px] text-[var(--seo-ink-3)]">Yazılar taranıyor…</p>
      ) : items.length === 0 ? (
        <p className="mt-4 text-[13px] text-[var(--seo-ink-3)]">Önerilecek iç link, kırık link ya da izinsiz dış link yok.</p>
      ) : (
        <ul className="mt-5">
          {items.map((it) => (
            <li key={it.postId} className="border-t border-[var(--seo-rule)] py-4 first:border-t-0">
              <p className="text-[15px] font-semibold">
                {it.postTitle}
                {it.hasRehberLinks && <span className="ml-2 text-[12px] font-bold text-[var(--seo-danger)]">{it.rehberLinkCount} kırık link</span>}
                {it.offDomainLinkCount > 0 && <span className="ml-2 text-[12px] font-bold text-[var(--seo-danger)]">{it.offDomainLinkCount} izinsiz dış link</span>}
                {it.competitorMentions.length > 0 && <span className="ml-2 text-[12px] font-bold text-[var(--seo-danger)]">Rakip adı geçiyor: {it.competitorMentions.join(", ")}</span>}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
                {it.suggestions.map((s) => {
                  const key = `${it.postId}-${s.targetPath}`;
                  return (
                    <button
                      key={key}
                      className="text-left text-[13px] hover:underline disabled:opacity-50"
                      disabled={busy !== null}
                      onClick={() => post({ action: "apply_suggestions", postId: it.postId, links: [{ term: s.term, targetPath: s.targetPath }] }, key, (r) => (r.insertedLinkCount ? `"${s.term}" → ${s.targetPath} eklendi.` : `"${s.term}" metinde bütün kelime olarak bulunamadı; eklenmedi.`))}
                    >
                      <span className="font-semibold">&ldquo;{s.term}&rdquo;</span> <span className="seo-mono text-[var(--seo-ink-3)]">→ {s.targetPath}</span>
                      <span className="ml-1 text-[var(--seo-mark)]">{busy === key ? "…" : "ekle"}</span>
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
