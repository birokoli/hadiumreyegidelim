"use client";
// Şavt modu (13 Ekim, kullanıcı: üyelere özel ayrıcalık): kitapçık telefonda ekran ekran okunur.
// Başlangıç → 7 şavt → bitiş. Yazı boyutu ve kaldığı yer tarayıcıda saklanır; ekran açık kalsın (Wake Lock) seçeneği;
// sağa/sola kaydırma ve ok tuşlarıyla geçiş.
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import HugIcon from "@/components/icons/HugIcon";
import Accent from "@/components/home/Accent";
import type { Bolum, Kitapcik, Oge, Sabit } from "@/lib/kitapcik";

const BOYUTLAR = [16, 18, 20, 23, 26];

type WakeLockSentinelLike = { release: () => Promise<void> };

function DuaSatiri({ o, boyut }: { o: Extract<Oge, { tur: "dua" }>; boyut: number }) {
  const anlati = o.okunus.startsWith("~ ");
  return (
    <div className="border-b border-[var(--h-sky)]/50 py-5 last:border-0">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <p className="font-bold text-[var(--h-blue)]" style={{ fontSize: boyut * 0.82 }}>{o.ad}</p>
        {o.kaynak && <span className="text-[#8a94ab]" style={{ fontSize: boyut * 0.7 }}>{o.kaynak}</span>}
        {o.kez && <span className="rounded-full bg-[var(--h-sand)] px-2.5 py-0.5 font-bold text-[#5a4612]" style={{ fontSize: boyut * 0.68 }}>{o.kez}</span>}
      </div>
      {anlati ? (
        <p className="mt-2 leading-relaxed text-[#14213d]" style={{ fontSize: boyut }}>{o.okunus.slice(2)}</p>
      ) : (
        <>
          <p className="mt-2 font-semibold leading-relaxed text-[#14213d]" style={{ fontSize: boyut * 1.06 }}>{o.okunus}</p>
          {o.anlam && <p className="mt-2 leading-relaxed text-[#5b6680]" style={{ fontSize: boyut * 0.86 }}>{o.anlam}</p>}
        </>
      )}
    </div>
  );
}

function BolumBlok({ b, boyut }: { b: Bolum; boyut: number }) {
  const munacat = b.ad === "Münâcât";
  const kapanis = b.ad.startsWith("Yeşil ışıktan");
  return (
    <section className="mt-8">
      <h3 className={`border-b-2 pb-2 text-[11px] font-bold uppercase tracking-[0.22em] ${kapanis ? "border-[#2f7d55] text-[#2f7d55]" : "border-[var(--h-blue)] text-[var(--h-blue)]"}`}>{b.ad}</h3>
      {munacat ? (
        <div className="mt-4 space-y-3">
          {b.ogeler.map((o, i) =>
            o.tur === "hitap" ? (
              <p key={i} className="font-['Noto_Serif',Georgia,serif] italic leading-snug text-[var(--h-blue)]" style={{ fontSize: boyut * 1.12 }}>{o.metin}</p>
            ) : o.tur === "paragraf" ? (
              <p key={i} className="leading-relaxed text-[#14213d]" style={{ fontSize: boyut }}>{o.metin}</p>
            ) : null,
          )}
        </div>
      ) : (
        b.ogeler.map((o, i) =>
          o.tur === "dua" ? <DuaSatiri key={i} o={o} boyut={boyut} /> : <p key={i} className="mt-4 leading-relaxed text-[#14213d]" style={{ fontSize: boyut }}>{o.tur === "hitap" || o.tur === "paragraf" ? o.metin : ""}</p>,
        )
      )}
    </section>
  );
}

function SabitEkran({ s, boyut, ust }: { s: Sabit; boyut: number; ust: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--h-blue)]/60">{ust}</p>
      <h2 className="mt-2 text-3xl font-bold text-[var(--h-blue)]"><Accent text={s.baslik} /></h2>
      {s.aciklama && <p className="mt-3 leading-relaxed text-[#5b6680]" style={{ fontSize: boyut * 0.9 }}>{s.aciklama}</p>}
      {s.dualar?.map((d) => (
        <div key={d.ad} className="mt-6 rounded-[24px] bg-[var(--h-white)] p-5">
          <p className="font-bold text-[var(--h-blue)]" style={{ fontSize: boyut * 0.82 }}>{d.ad}</p>
          {d.arapca && <p dir="rtl" className="mt-3 text-right font-['Amiri','Noto_Naskh_Arabic',serif] leading-loose text-[var(--h-blue)]" style={{ fontSize: boyut * 1.35 }}>{d.arapca}</p>}
          <p className="mt-2 font-semibold leading-relaxed text-[#14213d]" style={{ fontSize: boyut * 1.06 }}>{d.okunus}</p>
          {d.anlam && <p className="mt-2 leading-relaxed text-[#5b6680]" style={{ fontSize: boyut * 0.86 }}>{d.anlam}</p>}
        </div>
      ))}
      {s.maddeler && (
        <ol className="mt-6 space-y-3">
          {s.maddeler.map((m, i) => (
            <li key={m.ad} className="flex gap-4 rounded-[24px] bg-white p-5 ring-1 ring-[var(--h-sky)]/50">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--h-blue)] font-bold text-white">{i + 1}</span>
              <div>
                <p className="font-bold text-[var(--h-blue)]" style={{ fontSize: boyut * 0.92 }}>{m.ad}</p>
                <p className="mt-1 leading-relaxed text-[#3d4a66]" style={{ fontSize: boyut * 0.88 }}>{m.metin}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function Okuyucu({ k }: { k: Kitapcik }) {
  const toplam = k.savtlar.length + 2; // başlangıç + şavtlar + bitiş
  const [adim, setAdim] = useState(0);
  const [boyutIdx, setBoyutIdx] = useState(1);
  const [hazir, setHazir] = useState(false);
  const [ekranAcik, setEkranAcik] = useState(false);
  const lock = useRef<WakeLockSentinelLike | null>(null);
  const icerik = useRef<HTMLDivElement>(null);
  const dokunus = useRef<{ x: number; y: number } | null>(null);
  const anahtar = `okuyucu:${k.slug}`;

  // Kaldığı yer ve yazı boyutu
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(anahtar) ?? "{}");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- tarayıcıda saklanan ilerleme açılışta bir kez okunur
      if (Number.isInteger(d.adim) && d.adim >= 0 && d.adim < toplam) setAdim(d.adim);
      if (Number.isInteger(d.boyut) && d.boyut >= 0 && d.boyut < BOYUTLAR.length) setBoyutIdx(d.boyut);
    } catch { /* gizli pencere */ }
    setHazir(true);
  }, [anahtar, toplam]);

  useEffect(() => {
    if (!hazir) return;
    try { localStorage.setItem(anahtar, JSON.stringify({ adim, boyut: boyutIdx })); } catch { /* gizli pencere */ }
  }, [adim, boyutIdx, hazir, anahtar]);

  const git = useCallback((n: number) => {
    if (n < 0 || n >= toplam) return;
    setAdim(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [toplam]);

  useEffect(() => {
    const tus = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") git(adim + 1);
      if (e.key === "ArrowLeft") git(adim - 1);
    };
    window.addEventListener("keydown", tus);
    return () => window.removeEventListener("keydown", tus);
  }, [adim, git]);

  // Ekran açık kalsın: sekme arka plana gidince kilit düşer, geri gelince yeniden istenir
  const kilitAl = useCallback(async () => {
    try {
      const wl = (navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<WakeLockSentinelLike> } }).wakeLock;
      if (!wl) return false;
      lock.current = await wl.request("screen");
      return true;
    } catch {
      return false;
    }
  }, []);
  useEffect(() => {
    if (!ekranAcik) {
      lock.current?.release().catch(() => {});
      lock.current = null;
      return;
    }
    kilitAl();
    const gorunur = () => { if (document.visibilityState === "visible") kilitAl(); };
    document.addEventListener("visibilitychange", gorunur);
    return () => document.removeEventListener("visibilitychange", gorunur);
  }, [ekranAcik, kilitAl]);

  const boyut = BOYUTLAR[boyutIdx];
  const savt = adim >= 1 && adim <= k.savtlar.length ? k.savtlar[adim - 1] : null;
  const etiket = (n: number) => (n === 0 ? "Başlangıç" : n === toplam - 1 ? "Bitiş" : `${n}. şavt`);

  return (
    <div className="pb-36 pt-24 md:pt-28">
      {/* Üst çubuk */}
      <div className="sticky top-16 z-30 border-b border-[var(--h-sky)]/60 bg-[var(--h-white)]/95 backdrop-blur md:top-20">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-2.5">
          <Link href="/profil/kitaplik" className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--h-blue)] hover:bg-white" aria-label="Kitaplığa dön">
            <HugIcon name="ok" size={18} className="rotate-180" />
          </Link>
          <p className="min-w-0 flex-1 truncate text-sm font-bold text-[var(--h-blue)]">{k.ad}</p>
          <div className="flex items-center rounded-xl bg-white ring-1 ring-[var(--h-sky)]/60">
            <button type="button" onClick={() => setBoyutIdx((b) => Math.max(0, b - 1))} disabled={boyutIdx === 0} className="px-2.5 py-1.5 text-sm font-bold text-[var(--h-blue)] disabled:opacity-30" aria-label="Yazıyı küçült">A−</button>
            <span className="h-5 w-px bg-[var(--h-sky)]" />
            <button type="button" onClick={() => setBoyutIdx((b) => Math.min(BOYUTLAR.length - 1, b + 1))} disabled={boyutIdx === BOYUTLAR.length - 1} className="px-2.5 py-1.5 text-base font-bold text-[var(--h-blue)] disabled:opacity-30" aria-label="Yazıyı büyüt">A+</button>
          </div>
          <button
            type="button"
            onClick={() => setEkranAcik((v) => !v)}
            aria-pressed={ekranAcik}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold ring-1 transition ${ekranAcik ? "bg-[var(--h-blue)] text-white ring-[var(--h-blue)]" : "bg-white text-[var(--h-blue)] ring-[var(--h-sky)]/60"}`}
          >
            {ekranAcik ? "Ekran açık" : "Ekranı açık tut"}
          </button>
        </div>
        {/* İlerleme */}
        <div className="mx-auto flex max-w-3xl gap-1 px-4 pb-2.5">
          {Array.from({ length: toplam }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => git(i)}
              aria-label={etiket(i)}
              aria-current={i === adim ? "step" : undefined}
              className={`flex h-7 flex-1 items-center justify-center rounded-lg text-[11px] font-bold transition ${
                i === adim ? "bg-[var(--h-blue)] text-white" : i < adim ? "bg-[var(--h-sky)] text-[var(--h-blue)]" : "bg-white text-[#8a94ab] ring-1 ring-[var(--h-sky)]/60"
              }`}
            >
              {i === 0 ? "•" : i === toplam - 1 ? "✓" : i}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={icerik}
        className="mx-auto max-w-3xl px-4 pt-6"
        onTouchStart={(e) => { dokunus.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
        onTouchEnd={(e) => {
          const s = dokunus.current;
          dokunus.current = null;
          if (!s) return;
          const dx = e.changedTouches[0].clientX - s.x;
          const dy = e.changedTouches[0].clientY - s.y;
          if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) git(adim + (dx < 0 ? 1 : -1));
        }}
      >
        <article className="rounded-[28px] bg-white p-5 shadow-[0_24px_48px_-32px_rgba(18,41,90,0.45)] ring-1 ring-[var(--h-sky)]/50 md:p-8">
          {adim === 0 && <SabitEkran s={k.giris} boyut={boyut} ust={`${k.ad} · başlarken`} />}
          {adim === toplam - 1 && <SabitEkran s={k.bitis} boyut={boyut} ust="Allah kabul etsin" />}
          {savt && (
            <div>
              <div className="flex items-center gap-4">
                <span className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full bg-[var(--h-blue)] leading-none text-white">
                  <b className="text-2xl">{savt.no}</b>
                  <span className="mt-1 text-[9px] font-bold tracking-[0.2em] text-[var(--h-sand)]">ŞAVT</span>
                </span>
                <div className="min-w-0">
                  <h2 className="text-2xl font-bold leading-tight text-[var(--h-blue)] md:text-3xl">{savt.baslik}</h2>
                  {savt.yon && <span className="mt-2 inline-flex rounded-full border border-[var(--h-sky)] px-3 py-0.5 text-xs font-bold text-[var(--h-blue)]">{savt.yon.replace("'dan ", " → ").replace("'den ", " → ").replace(/'(ye|ya)$/, "")}</span>}
                </div>
              </div>
              <p className="mt-5 rounded-r-2xl border-l-4 border-[var(--h-blue)] bg-[var(--h-white)] px-4 py-3 leading-relaxed text-[#14213d]" style={{ fontSize: boyut * 0.92 }}>
                <b className="text-[var(--h-blue)]">Niyet:</b> {savt.niyet}
              </p>
              {savt.bolumler.map((b) => (
                <div key={b.ad}>
                  {k.hervele && b.ad.startsWith("Yeşil ışıktan") && (
                    <div className="mt-8 rounded-r-2xl border-l-4 border-[#2f7d55] bg-[#e8f3ec] px-4 py-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#2f7d55]">Yeşil ışıklar arası · Hervele</p>
                      <p className="mt-2 font-semibold leading-relaxed text-[#14213d]" style={{ fontSize: boyut * 1.06 }}>{k.hervele.okunus}</p>
                      <p className="mt-2 leading-relaxed text-[#5b6680]" style={{ fontSize: boyut * 0.86 }}>{k.hervele.anlam}</p>
                      <p className="mt-2 text-xs text-[#5b6680]">Erkekler adımlarını hızlandırır; kadınlar vakarla normal yürür.</p>
                    </div>
                  )}
                  <BolumBlok b={b} boyut={boyut} />
                </div>
              ))}
              {(savt.varis || k.savtSonu) && (
                <div className="mt-8 rounded-[24px] bg-[var(--h-blue)] px-5 py-4 text-white">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--h-sand)]">{savt.varis ? "Tepeye varınca" : k.savtSonu?.ad}</p>
                  {savt.varis ? (
                    <p className="mt-1.5 leading-relaxed" style={{ fontSize: boyut * 0.92 }}>{savt.varis}</p>
                  ) : (
                    <>
                      <p className="mt-1.5 font-semibold leading-relaxed" style={{ fontSize: boyut * 1.02 }}>{k.savtSonu?.okunus}</p>
                      <p className="mt-1.5 leading-relaxed text-white/80" style={{ fontSize: boyut * 0.84 }}>{k.savtSonu?.anlam}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </article>
        {adim === toplam - 1 && (
          <p className="mt-6 text-center font-['Noto_Serif',Georgia,serif] text-lg italic text-[var(--h-blue)]">Dualarınızda bizleri de unutmayın.</p>
        )}
      </div>

      {/* Alt gezinme */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--h-sky)]/60 bg-white/95 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl gap-2 px-4">
          <button type="button" onClick={() => git(adim - 1)} disabled={adim === 0} className="flex items-center justify-center gap-1.5 rounded-2xl border border-[var(--h-sky)] px-4 py-3.5 text-sm font-bold text-[var(--h-blue)] disabled:opacity-30">
            <HugIcon name="ok" size={16} className="rotate-180" /> {adim > 0 ? etiket(adim - 1) : "Geri"}
          </button>
          {adim < toplam - 1 ? (
            <button type="button" onClick={() => git(adim + 1)} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--h-blue)] px-4 py-3.5 text-[15px] font-bold text-white shadow-[0_12px_24px_-12px_rgba(29,66,138,0.8)]">
              {adim === 0 ? "1. şavta başla" : adim === toplam - 2 ? `${k.kisa} bitti` : `${adim + 1}. şavta geç`} <HugIcon name="ok" size={18} className="text-[var(--h-sand)]" />
            </button>
          ) : (
            <button type="button" onClick={() => git(0)} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--h-sand)] px-4 py-3.5 text-[15px] font-bold text-[var(--h-blue-deep)]">
              Baştan başla
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
