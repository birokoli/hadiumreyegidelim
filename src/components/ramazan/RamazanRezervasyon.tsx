"use client";
// Ramazan 2027 rezervasyonu: paket türü → grup (tarih) → oda tipi (2/3/4 kişi) → yolcu bilgileri → yer anında ayrılır.
// Müsaitlik açılışta /api/ramazan'dan tazelenir; kapalı gruplar seçilemez.
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import WhatsAppIcon from "@/components/home/WhatsAppIcon";
import type { Secenek } from "@/lib/ramazan";

const TURLER = [30, 15, 10, 5] as const;
const usd = (n: number) => `${n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
const inp = "w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3 text-[15px] text-on-surface outline-none transition focus:border-primary";

type Sonuc = { odemeUrl: string | null; kod: string; paket: string; kisi: number; kisiBasiUsd: number; toplamUsd: number; sonOdeme: string; ramazan: string; giris: string; cikis: string };

export default function RamazanRezervasyon({ ilk, whatsapp }: { ilk: Secenek[] | null; whatsapp: string }) {
  const [secenekler, setSecenekler] = useState<Secenek[] | null>(ilk);
  const [tur, setTur] = useState<(typeof TURLER)[number]>(15);
  const [paketId, setPaketId] = useState<string | null>(null);
  const [kisi, setKisi] = useState(4);
  const [f, setF] = useState({ adSoyad: "", telefon: "", eposta: "", kvkk: false, pazarlama: false, website: "" });
  const [yolcular, setYolcular] = useState<string[]>(["", "", "", ""]);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [hata, setHata] = useState("");
  const [sonuc, setSonuc] = useState<Sonuc | null>(null);

  const tazele = () =>
    fetch("/api/ramazan", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.secenekler && setSecenekler(d.secenekler))
      .catch(() => {});
  useEffect(() => { tazele(); }, []);

  // Seçili sürede açık tarih kalmadıysa açık tarihi olan ilk süreye geçilir (müşteri "dolu" ekranında kalmasın)
  useEffect(() => {
    if (!secenekler || secenekler.some((s) => s.tur === tur && s.musait)) return;
    const acik = TURLER.find((t) => secenekler.some((s) => s.tur === t && s.musait));
    if (acik) setTur(acik);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- yalnızca müsaitlik değişince
  }, [secenekler]);

  const gruplar = useMemo(() => (secenekler ?? []).filter((s) => s.tur === tur), [secenekler, tur]);
  const secili = secenekler?.find((s) => s.id === paketId) ?? null;
  const fiyat = secili?.fiyatlar.find((x) => x.kisi === kisi) ?? null;
  // Tür değişince ya da seçili grup kapanınca ilk açık grup seçilir
  useEffect(() => {
    if (secili && secili.tur === tur && secili.musait) return;
    setPaketId(gruplar.find((g) => g.musait)?.id ?? null);
  }, [tur, gruplar, secili]);

  const enDusukTur = (t: number) => {
    const fs = (secenekler ?? []).filter((s) => s.tur === t && s.musait).flatMap((s) => s.fiyatlar.map((x) => x.kisiBasiUsd));
    return fs.length ? Math.min(...fs) : null;
  };

  const gonder = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata("");
    if (!secili) return setHata("Önce açık bir tarih seçin.");
    const adlar = yolcular.slice(0, kisi).map((y) => y.trim());
    if (adlar.some((a) => a.length < 5 || !a.includes(" "))) return setHata(`${kisi} yolcunun adını ve soyadını pasaporttaki gibi yazın.`);
    if (!f.kvkk) return setHata("Devam etmek için KVKK Aydınlatma Metni'ni onaylayın.");
    setGonderiliyor(true);
    const r = await fetch("/api/ramazan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paketId: secili.id, kisi, adSoyad: f.adSoyad, telefon: f.telefon, eposta: f.eposta, yolcular: adlar, kvkk: f.kvkk, pazarlama: f.pazarlama, website: f.website }),
    }).catch(() => null);
    const d = r ? await r.json().catch(() => null) : null;
    setGonderiliyor(false);
    if (!r || !r.ok || !d?.ok) {
      setHata(d?.error || "Bağlantı sorunu; tekrar deneyin ya da WhatsApp'tan yazın.");
      tazele();
      return;
    }
    setSonuc(d);
    tazele();
  };

  if (!secenekler) {
    return (
      <div className="rounded-3xl bg-white p-6 text-[15px] text-on-surface-variant">
        Fiyatlar şu an yüklenemedi. <a className="font-bold text-primary underline" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener">WhatsApp&apos;tan yazın</a>, hemen yardımcı olalım.
      </div>
    );
  }

  if (sonuc) {
    const son = new Date(sonuc.sonOdeme).toLocaleString("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });
    const wa = `https://wa.me/${whatsapp}?text=${encodeURIComponent(`Merhaba, ${sonuc.kod} kodlu Ramazan rezervasyonum için ödeme bilgilerini rica ediyorum.`)}`;
    return (
      <div className="rounded-3xl bg-white p-6 shadow-[0_20px_50px_-24px_rgba(0,55,129,0.35)] md:p-8" role="status">
        <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-primary/70">Yeriniz ayrıldı</p>
        <p className="mt-1 font-headline text-[30px] font-bold text-primary">{sonuc.kod}</p>
        <p className="mt-3 text-[15px] text-on-surface">
          <b>{sonuc.paket}</b> · {sonuc.ramazan} · {sonuc.giris} – {sonuc.cikis} · {sonuc.kisi} kişi
        </p>
        <p className="mt-1 text-[15px] text-on-surface">Toplam <b>{usd(sonuc.toplamUsd)}</b> (kişi başı {usd(sonuc.kisiBasiUsd)})</p>
        <p className="mt-4 rounded-xl bg-[var(--h-sand)]/40 px-4 py-3 text-[14px] leading-relaxed text-on-surface">
          {sonuc.odemeUrl ? "Ödemeyi şimdi yapabilirsiniz." : "Ödeme bilgilerini WhatsApp'tan iletiyoruz."} Ödeme <b>{son}</b>&apos;a kadar yapılmazsa yer serbest kalır.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {sonuc.odemeUrl && (
            <a href={sonuc.odemeUrl} className="inline-flex min-h-[52px] items-center rounded-xl bg-[var(--h-sand)] px-6 text-[15px] font-bold text-[var(--h-blue-deep)]">Şimdi öde</a>
          )}
          <a href={wa} target="_blank" rel="noopener" className={`inline-flex min-h-[52px] items-center gap-2 rounded-xl px-6 text-[15px] font-bold ${sonuc.odemeUrl ? "border border-primary/30 text-primary" : "bg-primary text-white"}`}>
            <WhatsAppIcon className="h-5 w-5" /> {sonuc.odemeUrl ? "WhatsApp'tan sorun" : "Ödeme bilgilerini isteyin"}
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={gonder} className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-3xl bg-white p-5 md:p-7">
        {/* 1 · Paket */}
        <p className="text-[13px] font-bold text-on-surface">1 · Kaç gece?</p>
        <div className="mt-2 grid grid-cols-4 gap-2" role="radiogroup" aria-label="Paket süresi">
          {TURLER.map((t) => {
            const d = enDusukTur(t);
            const aktif = t === tur;
            return (
              <button key={t} type="button" role="radio" aria-checked={aktif} onClick={() => setTur(t)}
                className={`rounded-xl border px-2 py-3 text-center transition ${aktif ? "border-primary bg-primary text-white" : "border-outline-variant/40 bg-white text-on-surface hover:border-primary/50"}`}>
                <span className="block text-[17px] font-bold leading-tight">{t}</span>
                <span className={`block text-[11px] ${aktif ? "text-white/80" : "text-on-surface-variant"}`}>Ramazan</span>
                <span className={`mt-1 block text-[11px] font-semibold ${aktif ? "text-[var(--h-sand)]" : "text-primary"}`}>{d ? `${Math.floor(d)} $'dan` : "dolu"}</span>
              </button>
            );
          })}
        </div>

        {/* 2 · Grup / tarih */}
        <p className="mt-6 text-[13px] font-bold text-on-surface">2 · Hangi tarihler?</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Tarih">
          {gruplar.map((g) => {
            const aktif = g.id === paketId;
            return (
              <button key={g.id} type="button" role="radio" aria-checked={aktif} disabled={!g.musait} onClick={() => setPaketId(g.id)}
                className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${aktif ? "border-primary bg-primary/[0.06] ring-1 ring-primary" : "border-outline-variant/40 bg-white hover:border-primary/50"}`}>
                <span>
                  <span className="block text-[15px] font-bold text-on-surface">{g.grup ? `${g.grup}. grup · ` : ""}{g.ramazan}</span>
                  <span className="block text-[13px] text-on-surface-variant">{g.giris} – {g.cikis} · {g.gece} gece</span>
                </span>
                <span className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-bold ${g.musait ? "bg-emerald-50 text-emerald-700" : "bg-surface-container-low text-on-surface-variant"}`}>{g.musait ? "Açık" : "Dolu"}</span>
              </button>
            );
          })}
        </div>

        {/* 3 · Oda */}
        <p className="mt-6 text-[13px] font-bold text-on-surface">3 · Odada kaç kişi?</p>
        <div className="mt-2 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Kişi sayısı">
          {[2, 3, 4].map((k) => {
            const fk = secili?.fiyatlar.find((x) => x.kisi === k);
            const aktif = k === kisi;
            return (
              <button key={k} type="button" role="radio" aria-checked={aktif} onClick={() => { setKisi(k); setYolcular((y) => [...y, "", "", ""].slice(0, 4)); }}
                className={`rounded-xl border px-2 py-3 text-center transition ${aktif ? "border-primary bg-primary text-white" : "border-outline-variant/40 bg-white text-on-surface hover:border-primary/50"}`}>
                <span className="block text-[15px] font-bold">{k} kişi</span>
                <span className={`block text-[12px] ${aktif ? "text-white/80" : "text-on-surface-variant"}`}>{fk ? `${usd(fk.kisiBasiUsd)} / kişi` : "–"}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[12px] text-on-surface-variant">Oda 4 kişiliktir ve yalnızca sizin grubunuza ayrılır.</p>
      </div>

      {/* Özet + form */}
      <div className="rounded-3xl bg-white p-5 shadow-[0_20px_50px_-24px_rgba(0,55,129,0.35)] md:p-7">
        {secili && fiyat ? (
          <div className="border-b border-outline-variant/30 pb-4">
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-primary/70">{secili.ad}</p>
            <p className="mt-1 text-[14px] text-on-surface">{secili.ramazan} · {secili.giris} – {secili.cikis} · {kisi} kişi</p>
            <p className="mt-2 font-headline text-[34px] font-bold leading-none text-primary">{usd(fiyat.kisiBasiUsd)}<span className="text-[14px] font-semibold text-on-surface-variant"> / kişi</span></p>
            <p className="mt-1 text-[13px] text-on-surface-variant">Toplam {usd(fiyat.toplamUsd)} · vize, otel (sahur ve iftar), transfer dahil</p>
          </div>
        ) : (
          <p className="border-b border-outline-variant/30 pb-4 text-[14px] text-on-surface-variant">Bu süre için açık tarih kalmadı; başka bir süre seçin.</p>
        )}

        <div className="mt-4 grid gap-3">
          <input className={inp} placeholder="Adınız soyadınız" autoComplete="name" value={f.adSoyad} onChange={(e) => setF({ ...f, adSoyad: e.target.value })} required />
          <input className={inp} placeholder="Telefon (WhatsApp)" type="tel" autoComplete="tel" inputMode="tel" value={f.telefon} onChange={(e) => setF({ ...f, telefon: e.target.value })} required />
          <input className={inp} placeholder="E-posta (isteğe bağlı)" type="email" autoComplete="email" value={f.eposta} onChange={(e) => setF({ ...f, eposta: e.target.value })} />
          <p className="mt-1 text-[13px] font-bold text-on-surface">Yolcular (pasaporttaki gibi)</p>
          {Array.from({ length: kisi }, (_, i) => (
            <input key={i} className={inp} placeholder={`${i + 1}. yolcu adı soyadı`} value={yolcular[i] ?? ""} onChange={(e) => setYolcular((y) => y.map((v, j) => (j === i ? e.target.value : v)))} required />
          ))}
          <input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} />
          <label className="mt-1 flex cursor-pointer items-start gap-3 text-[13px] leading-snug text-on-surface">
            <input type="checkbox" className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[var(--h-blue)]" checked={f.kvkk} onChange={(e) => setF({ ...f, kvkk: e.target.checked })} />
            <span><Link href="/kvkk" target="_blank" className="font-bold text-primary underline underline-offset-2">KVKK Aydınlatma Metni</Link>&apos;ni okudum; kişisel verilerimin rezervasyon için işlenmesine ilişkin bilgilendirildim.</span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-snug text-on-surface-variant">
            <input type="checkbox" className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[var(--h-blue)]" checked={f.pazarlama} onChange={(e) => setF({ ...f, pazarlama: e.target.checked })} />
            <span>Umre programları ve bilgilendirmeler için benimle iletişime geçilmesine izin veriyorum (isteğe bağlı).</span>
          </label>
          {hata && <p className="rounded-xl bg-red-50 px-4 py-3 text-[14px] text-red-700" role="alert">{hata}</p>}
          <button type="submit" disabled={gonderiliyor || !secili}
            className="mt-1 inline-flex min-h-[54px] items-center justify-center rounded-xl bg-[var(--h-sand)] px-6 text-[16px] font-bold text-[var(--h-blue-deep)] transition hover:brightness-95 disabled:opacity-50">
            {gonderiliyor ? "Yeriniz ayrılıyor…" : "Rezervasyonu tamamla"}
          </button>
          <p className="text-[12px] leading-snug text-on-surface-variant">Yeriniz hemen ayrılır. Ödeme bilgilerini WhatsApp&apos;tan iletiriz; 24 saat içinde ödeme yapılmazsa yer serbest kalır.</p>
        </div>
      </div>
    </form>
  );
}
