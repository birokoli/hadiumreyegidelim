"use client";

import { useMemo, useState } from "react";

// Blog takvimi: hangi günde yazı var, hangisi boş. Tarihler Türkiye saatine göre gün gün gruplanır.
// Yayındaki yazı: createdAt (zamanlanan yazı yayına girince cron createdAt'i yayın anı yapar, scheduledAt'i siler).
// Zamanlanmış yazı: published=false ve scheduledAt dolu.

export type Post = { id: string; title: string; slug: string; published: boolean; createdAt: string; scheduledAt?: string | null };
type Olay = { post: Post; tur: "yayinda" | "zamanli"; saat: string };

const AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const GUNLER = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];
const TZ = "Europe/Istanbul";

const gunAnahtari = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: TZ }); // YYYY-MM-DD
const saatYaz = (d: Date) => d.toLocaleTimeString("tr-TR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
const anahtar = (y: number, m: number, g: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(g).padStart(2, "0")}`;
export const trTarih = (k: string) => {
  const [, m, g] = k.split("-").map(Number);
  return `${g} ${AYLAR[m - 1]}`;
};

// Yazının takvimde düştüğü gün (Türkiye saati); tarihsiz taslak için null
export function yaziGunu(p: Post): string | null {
  const t = p.published ? p.createdAt : p.scheduledAt;
  if (!t) return null;
  const d = new Date(t);
  return isNaN(d.getTime()) ? null : gunAnahtari(d);
}

// Bugünden itibaren yazısı olmayan ilk N gün (YYYY-MM-DD). 09:00 geçtiyse bugün atlanır
// (zamanlanan saat geçmiş olur, yazı hemen yayına girerdi). haricId: düzenlenen yazının kendi günü boş sayılır.
export function bosGunler(posts: Post[], adet = 3, haricId?: string | null): string[] {
  const dolu = new Set(posts.filter((p) => p.id !== haricId).map(yaziGunu).filter(Boolean) as string[]);
  const bugun = gunAnahtari(new Date());
  const saat = Number(new Date().toLocaleString("en-GB", { timeZone: TZ, hour: "2-digit", hour12: false }));
  const [y, m, g] = bugun.split("-").map(Number);
  const sonuc: string[] = [];
  for (let i = saat >= 9 ? 1 : 0; i < 400 && sonuc.length < adet; i++) {
    const k = new Date(Date.UTC(y, m - 1, g + i, 12)).toISOString().slice(0, 10);
    if (!dolu.has(k)) sonuc.push(k);
  }
  return sonuc;
}

export default function BlogTakvim({ posts, onEdit }: { posts: Post[]; onEdit: (post: Post) => void }) {
  const bugun = gunAnahtari(new Date());
  const [ay, setAy] = useState(() => {
    const [y, m] = bugun.split("-").map(Number);
    return { y, m: m - 1 };
  });
  const [secili, setSecili] = useState<string | null>(null);

  const harita = useMemo(() => {
    const h = new Map<string, Olay[]>();
    for (const p of posts) {
      let tarih: Date | null = null;
      let tur: Olay["tur"] | null = null;
      if (p.published) { tarih = new Date(p.createdAt); tur = "yayinda"; }
      else if (p.scheduledAt) { tarih = new Date(p.scheduledAt); tur = "zamanli"; }
      if (!tarih || !tur || isNaN(tarih.getTime())) continue;
      const k = gunAnahtari(tarih);
      if (!h.has(k)) h.set(k, []);
      h.get(k)!.push({ post: p, tur, saat: saatYaz(tarih) });
    }
    for (const liste of h.values()) liste.sort((a, b) => a.saat.localeCompare(b.saat));
    return h;
  }, [posts]);

  // Özet: önümüzdeki 30 gün, son planlı gün, boş günler
  const ozet = useMemo(() => {
    const zamanli = posts.filter((p) => !p.published && p.scheduledAt).length;
    const taslak = posts.filter((p) => !p.published && !p.scheduledAt).length;
    const [y, m, g] = bugun.split("-").map(Number);
    const bos: string[] = [];
    let sonPlanli: string | null = null;
    for (let i = 0; i < 30; i++) {
      const d = new Date(Date.UTC(y, m - 1, g + i, 12));
      const k = d.toISOString().slice(0, 10);
      if (harita.get(k)?.length) sonPlanli = k; else bos.push(k);
    }
    // Bugünden itibaren kesintisiz dolu gün sayısı: akış nereye kadar gidiyor
    let kesintisiz = 0;
    for (let i = 0; i < 365; i++) {
      const k = new Date(Date.UTC(y, m - 1, g + i, 12)).toISOString().slice(0, 10);
      if (harita.get(k)?.length) kesintisiz++; else break;
    }
    const ilkBos = bos[0] ?? null;
    return { zamanli, taslak, bos, sonPlanli, ilkBos, kesintisiz };
  }, [posts, harita, bugun]);

  const ilkGun = (() => { const d = new Date(ay.y, ay.m, 1).getDay(); return d === 0 ? 6 : d - 1; })();
  const gunSayisi = new Date(ay.y, ay.m + 1, 0).getDate();
  const hucreler: (number | null)[] = [...Array(ilkGun).fill(null), ...Array.from({ length: gunSayisi }, (_, i) => i + 1)];
  while (hucreler.length % 7) hucreler.push(null);

  const ayDegis = (fark: number) => {
    setSecili(null);
    setAy(({ y, m }) => { const d = new Date(y, m + fark, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  };

  const seciliOlaylar = secili ? harita.get(secili) ?? [] : [];

  return (
    <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-[0px_32px_64px_-12px_rgba(0,55,129,0.06)] overflow-hidden">
      <div className="p-6 border-b border-outline-variant/10 bg-surface-container-low/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="font-headline text-2xl text-primary font-bold">Yayın Takvimi</h3>
          <p className="text-xs text-on-surface-variant mt-1">Hangi gün yazı var, hangi gün boş. Bir güne tıklayınca o günün yazıları açılır.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-[#b8862f]/10 text-[#8a6420] font-bold">{ozet.zamanli} zamanlanmış</span>
          <span className="px-3 py-1.5 rounded-lg bg-outline-variant/20 text-on-surface-variant font-bold">{ozet.taslak} tarihsiz taslak</span>
          <span className={`px-3 py-1.5 rounded-lg font-bold ${ozet.kesintisiz > 0 ? "bg-primary/10 text-primary" : "bg-error/10 text-error"}`}>
            {ozet.kesintisiz > 0
              ? `Akış ${ozet.kesintisiz} gün kesintisiz`
              : "Bugün yazı yok"}
          </span>
          {ozet.ilkBos && (
            <span className="px-3 py-1.5 rounded-lg bg-error/10 text-error font-bold">
              İlk boş gün: {ozet.ilkBos === bugun ? "bugün" : trTarih(ozet.ilkBos)} · 30 günde {ozet.bos.length} boş gün
            </span>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => ayDegis(-1)} className="p-2 rounded-lg hover:bg-surface-container text-primary" aria-label="Önceki ay">
            <span className="material-symbols-outlined block">chevron_left</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="font-headline text-lg font-bold text-primary">{AYLAR[ay.m]} {ay.y}</span>
            <button
              onClick={() => { const [y, m] = bugun.split("-").map(Number); setAy({ y, m: m - 1 }); setSecili(null); }}
              className="text-[11px] font-bold px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20"
            >
              Bugün
            </button>
          </div>
          <button onClick={() => ayDegis(1)} className="p-2 rounded-lg hover:bg-surface-container text-primary" aria-label="Sonraki ay">
            <span className="material-symbols-outlined block">chevron_right</span>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {GUNLER.map((g) => (
            <div key={g} className="text-center text-[10px] font-bold tracking-widest text-outline uppercase pb-1">{g}</div>
          ))}
          {hucreler.map((g, i) => {
            if (g === null) return <div key={`b${i}`} />;
            const k = anahtar(ay.y, ay.m, g);
            const olaylar = harita.get(k) ?? [];
            const gecmis = k < bugun;
            const bugunMu = k === bugun;
            const bos = olaylar.length === 0;
            const zamanli = olaylar.filter((o) => o.tur === "zamanli").length;
            const yayinda = olaylar.length - zamanli;
            const renk = bos
              ? gecmis ? "bg-surface-container-low/40 border-transparent" : "bg-error/5 border-error/25 border-dashed"
              : zamanli ? "bg-[#b8862f]/10 border-[#b8862f]/40" : "bg-primary/8 border-primary/25";
            return (
              <button
                key={k}
                onClick={() => setSecili(secili === k ? null : k)}
                className={`relative min-h-[64px] sm:min-h-[92px] rounded-lg border p-1.5 sm:p-2 text-left flex flex-col gap-1 transition-all hover:shadow-sm ${renk} ${secili === k ? "ring-2 ring-primary" : ""} ${bugunMu ? "outline outline-2 outline-secondary outline-offset-1" : ""}`}
              >
                <span className={`text-xs font-bold ${gecmis && bos ? "text-outline/60" : "text-on-surface"}`}>{g}</span>
                {/* Mobilde sayı rozeti, masaüstünde başlıklar */}
                {!bos && (
                  <span className="sm:hidden text-[10px] font-bold text-primary">{olaylar.length} yazı</span>
                )}
                <div className="hidden sm:flex flex-col gap-0.5">
                  {olaylar.slice(0, 2).map((o) => (
                    <span
                      key={o.post.id}
                      className={`text-[10px] leading-tight line-clamp-2 font-medium ${o.tur === "zamanli" ? "text-[#8a6420]" : "text-primary"}`}
                      title={o.post.title}
                    >
                      {o.saat} {o.post.title}
                    </span>
                  ))}
                  {olaylar.length > 2 && <span className="text-[10px] font-bold text-outline">+{olaylar.length - 2} yazı</span>}
                </div>
                {bos && !gecmis && <span className="text-[10px] font-bold text-error/70 mt-auto">Boş</span>}
                {!bos && (
                  <span className="absolute top-1.5 right-1.5 flex gap-0.5">
                    {yayinda > 0 && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    {zamanli > 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#b8862f]" />}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-4 mt-4 text-[11px] text-on-surface-variant">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Yayında</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#b8862f]" /> Zamanlanmış</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded border border-dashed border-error/50 bg-error/5" /> Boş gün</span>
        </div>

        {secili && (
          <div className="mt-5 rounded-xl border border-outline-variant/20 bg-surface-container-low/40 p-4">
            <p className="text-sm font-bold text-primary mb-3">{trTarih(secili)} {secili.slice(0, 4)}</p>
            {seciliOlaylar.length === 0 ? (
              <p className="text-sm text-on-surface-variant">
                Bu gün boş. Bir taslağı açıp yayın ayarından &quot;Zamanla&quot; ile bu tarihi seçebilirsin.
              </p>
            ) : (
              <ul className="space-y-2">
                {seciliOlaylar.map((o) => (
                  <li key={o.post.id} className="flex items-center justify-between gap-3 bg-white rounded-lg px-3 py-2 border border-outline-variant/15">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-on-surface truncate">{o.post.title}</p>
                      <p className={`text-[11px] font-bold ${o.tur === "zamanli" ? "text-[#8a6420]" : "text-primary"}`}>
                        {o.saat} · {o.tur === "zamanli" ? "Zamanlanmış" : "Yayında"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {o.tur === "yayinda" && (
                        <a href={`/blog/${o.post.slug}`} target="_blank" rel="noreferrer" className="p-2 rounded-lg text-outline hover:bg-surface-container" title="Sitede aç">
                          <span className="material-symbols-outlined text-[18px] block">open_in_new</span>
                        </a>
                      )}
                      <button onClick={() => onEdit(o.post)} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white" title="Düzenle">
                        <span className="material-symbols-outlined text-[18px] block">edit</span>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
