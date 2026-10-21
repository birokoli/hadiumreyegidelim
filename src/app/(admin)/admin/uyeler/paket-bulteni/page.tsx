"use client";
// Paket bülteni (21 Ekim): pazarlama izni verenlere (izinli üyeler + kitapçık formunda izin veren, adresi doğrulanmış kayıtlar)
// net fiyatlı paketlerin e-postası. Paket seç → metinleri düzenle → önizleme ve alıcı sayısı → kendine deneme → "GÖNDER".
// Aynı gönderim kodu aynı adrese bir kez gider. Sunucu: src/lib/paket-bulteni
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import HubTabs from "@/components/admin/HubTabs";

type Kart = { slug: string; otel: string; not: string; gorsel: string | null; fiyat: number; fiyatEtiket: string; ay: string };
type Onizleme = { konu: string; html: string; alici: number; uye: number; havuz: number; dogrulanmamis: number; engelli: number; zatenGitti: number; izniKapali: number };
type Gecmis = { id: string; konu: string; anahtar: string; toplam: number; gonderilen: number; hatali: number; durum: string; kim: string | null; createdAt: string; teslim: number; acildi: number; tiklandi: number; geriDondu: number };

const btn = "inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition active:scale-95 disabled:opacity-50";
const alan = "w-full rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-3 py-2 text-xs outline-none focus:border-primary/40";
const usd = (n: number) => `${n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;

export default function PaketBulteni() {
  const [secenekler, setSecenekler] = useState<Kart[]>([]);
  const [secili, setSecili] = useState<string[]>([]);
  const [kod, setKod] = useState("paketler-2026-11");
  const [konu, setKonu] = useState("");
  const [kicker, setKicker] = useState("Kasım 2026 · Mekke umre paketleri");
  const [baslik, setBaslik] = useState("");
  const [giris, setGiris] = useState("Kasım için vize dahil umre paketlerimizi hazırladık. Gece ve kişi sayınızı seçip fiyatınızı hemen görebilirsiniz.");
  const [o, setO] = useState<Onizleme | null>(null);
  const [gecmis, setGecmis] = useState<Gecmis[]>([]);
  const [deneme, setDeneme] = useState("");
  const [onay, setOnay] = useState("");
  const [busy, setBusy] = useState("");
  const [mesaj, setMesaj] = useState<{ tip: "ok" | "hata"; metin: string } | null>(null);
  const [ilk, setIlk] = useState(true);

  const ayar = useCallback(() => ({ kod, konu, kicker, baslik, giris, paketler: secili }), [kod, konu, kicker, baslik, giris, secili]);

  const yukle = useCallback(async () => {
    const a = ayar();
    const q = new URLSearchParams({ ...a, paketler: a.paketler.join(",") });
    const r = await fetch(`/api/admin/paket-bulteni?${q}`);
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return setMesaj({ tip: "hata", metin: d.error || "Yüklenemedi." });
    setSecenekler(d.secenekler ?? []);
    setO(d.onizleme);
    setGecmis(d.gecmis ?? []);
    // İlk açılışta bütün paketler seçili; konu ve başlık paket sayısı ve en düşük fiyattan
    if (ilk && d.secenekler?.length) {
      setIlk(false);
      const ks = d.secenekler as Kart[];
      const sayi = ["", "Tek otel", "İki otel", "Üç otel", "Dört otel", "Beş otel"][ks.length] ?? `${ks.length} otel`;
      setSecili(ks.map((k) => k.slug));
      setBaslik(`${sayi}, vize dahil`);
      setKonu(`${ks[0].ay}'da Mekke: vize dahil umre paketleri ${usd(Math.min(...ks.map((k) => k.fiyat)))}'dan`);
    }
  }, [ayar, ilk]);

  useEffect(() => {
    const t = setTimeout(yukle, 400);
    return () => clearTimeout(t);
  }, [yukle]);

  const post = async (body: Record<string, unknown>) => {
    const r = await fetch("/api/admin/paket-bulteni", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...ayar(), ...body }) });
    return { r, d: await r.json().catch(() => ({})) };
  };
  const denemeGonder = async () => {
    setBusy("deneme");
    const { r, d } = await post({ action: "deneme", adres: deneme });
    setBusy("");
    setMesaj(r.ok ? { tip: "ok", metin: `Deneme e-postası ${deneme} adresine gönderildi.` } : { tip: "hata", metin: d.error });
  };
  const gonder = async () => {
    setBusy("gonder");
    const { r, d } = await post({ action: "gonder", onay });
    setBusy("");
    setOnay("");
    setMesaj(r.ok ? { tip: "ok", metin: `${d.gonderilen} kişiye gönderildi${d.hatali ? `, ${d.hatali} hata` : ""}.` } : { tip: "hata", metin: d.error });
    yukle();
  };
  const sec = (slug: string, v: boolean) => setSecili((l) => (v ? [...l, slug] : l.filter((x) => x !== slug)));

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-surface text-on-surface">
      <HubTabs hub="satis" />
      <div className="pb-6 border-b border-outline-variant/15">
        <Link href="/admin/uyeler/gonder" className="text-xs font-bold text-primary">← Üyelere gönderim</Link>
        <h1 className="font-headline text-2xl font-bold tracking-tight text-primary mt-2">Paket bülteni</h1>
        <p className="text-xs text-on-surface-variant mt-0.5">
          Pazarlama e-postasına izin verenlere gider: e-posta izni olan üyeler ve kitapçık formunda izin verip adresini doğrulayan kayıtlar. Her e-postada abonelikten çıkma bağlantısı vardır; aynı gönderim kodu aynı adrese bir kez gider.
        </p>
      </div>

      {mesaj && <p className={`rounded-xl px-4 py-3 text-xs font-bold ${mesaj.tip === "ok" ? "bg-secondary/10 text-secondary" : "bg-error/10 text-error"}`}>{mesaj.metin}</p>}

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-5 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Paketler</p>
          {secenekler.length === 0 && <p className="text-xs text-outline">Yayında net fiyatlı paket yok.</p>}
          {secenekler.map((k) => (
            <label key={k.slug} className="flex items-center gap-3 rounded-xl border border-outline-variant/20 p-2.5 text-xs">
              <input type="checkbox" checked={secili.includes(k.slug)} onChange={(e) => sec(k.slug, e.target.checked)} className="accent-primary" />
              {k.gorsel && <img src={k.gorsel} alt="" className="h-10 w-14 rounded-md object-cover" />}
              <span className="min-w-0 flex-1"><b className="text-primary">{k.otel}</b><span className="block text-outline">{k.not}</span></span>
              <span className="text-right font-bold">{usd(k.fiyat)}<span className="block text-[10px] font-normal text-outline">{k.ay}</span></span>
            </label>
          ))}
        </div>
        <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-5 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-outline">E-posta</p>
          <label className="block text-[11px] font-bold text-on-surface-variant">Konu<input value={konu} onChange={(e) => setKonu(e.target.value)} className={`${alan} mt-1`} /></label>
          <label className="block text-[11px] font-bold text-on-surface-variant">Üst başlık<input value={kicker} onChange={(e) => setKicker(e.target.value)} className={`${alan} mt-1`} /></label>
          <label className="block text-[11px] font-bold text-on-surface-variant">Başlık<input value={baslik} onChange={(e) => setBaslik(e.target.value)} className={`${alan} mt-1`} /></label>
          <label className="block text-[11px] font-bold text-on-surface-variant">Giriş metni<textarea value={giris} onChange={(e) => setGiris(e.target.value)} rows={3} className={`${alan} mt-1`} /></label>
          <label className="block text-[11px] font-bold text-on-surface-variant">Gönderim kodu <span className="font-normal text-outline">(aynı kod aynı adrese bir kez gider; yeni bülten için yeni kod)</span><input value={kod} onChange={(e) => setKod(e.target.value.toLowerCase())} className={`${alan} mt-1 font-mono`} /></label>
        </div>
      </section>

      {o && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="overflow-hidden rounded-2xl border border-outline-variant/15 bg-surface-container-lowest">
            <div className="border-b border-outline-variant/15 px-4 py-3 text-xs"><span className="text-outline">Konu:</span> <b>{o.konu}</b></div>
            <iframe title="E-posta önizleme" srcDoc={o.html} className="h-[820px] w-full bg-[#f3f5f9]" />
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Alıcılar</p>
              <p className="font-headline text-3xl font-bold text-primary mt-1">{o.alici} <span className="text-sm font-medium text-outline">kişi</span></p>
              <ul className="mt-2 space-y-0.5 text-[11px] text-on-surface-variant">
                <li>E-posta izni olan üye: {o.uye}</li>
                <li>Kitapçık formunda izin veren (doğrulanmış): {o.havuz}</li>
                <li>İzin verip adresini doğrulamamış (gönderilmez): {o.dogrulanmamis}</li>
                <li>Üye olup izni kapatmış (gönderilmez): {o.izniKapali}</li>
                <li>Adresi geçersiz ya da spam bildirmiş (atlanır): {o.engelli}</li>
                <li>Bu kodla daha önce almış (atlanır): {o.zatenGitti}</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-5 space-y-2">
              <p className="text-xs font-bold">1. Kendinize deneme gönderin</p>
              <input value={deneme} onChange={(e) => setDeneme(e.target.value)} placeholder="sizin@adresiniz.com" className={alan} />
              <button type="button" disabled={!!busy || !deneme} onClick={denemeGonder} className={`${btn} border border-outline-variant/25 text-primary`}>{busy === "deneme" ? "Gönderiliyor…" : "Deneme gönder"}</button>
            </div>
            <div className="rounded-2xl border border-error/20 bg-surface-container-lowest p-5 space-y-2">
              <p className="text-xs font-bold">2. Gönder</p>
              <p className="text-[11px] text-on-surface-variant">{o.alici} kişiye gidecek; geri alınamaz. Onaylamak için kutuya <b>GÖNDER</b> yazın.</p>
              <input value={onay} onChange={(e) => setOnay(e.target.value)} placeholder="GÖNDER" className={alan} />
              <button type="button" disabled={!!busy || onay !== "GÖNDER" || o.alici === 0} onClick={gonder} className={`${btn} w-full justify-center bg-primary text-white`}>
                {busy === "gonder" ? "Gönderiliyor… (sayfayı kapatmayın)" : `${o.alici} kişiye gönder`}
              </button>
            </div>
          </div>
        </div>
      )}

      <section>
        <h2 className="font-headline text-lg font-bold text-primary mb-3">Paket bülteni geçmişi</h2>
        <div className="overflow-x-auto rounded-2xl border border-outline-variant/15 bg-surface-container-lowest">
          {gecmis.length === 0 ? (
            <p className="py-10 text-center text-xs text-outline">Henüz gönderim yok.</p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                <tr><th className="px-4 py-3">Tarih</th><th className="px-4 py-3">Konu · kod</th><th className="px-4 py-3">Gönderilen</th><th className="px-4 py-3">Teslim</th><th className="px-4 py-3">Açılan</th><th className="px-4 py-3">Tıklayan</th><th className="px-4 py-3">Geri dönen</th></tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {gecmis.map((g) => (
                  <tr key={g.id}>
                    <td className="px-4 py-3 font-mono text-outline whitespace-nowrap">{new Date(g.createdAt).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="px-4 py-3"><b>{g.konu}</b><div className="text-[10px] text-outline">{g.anahtar.replace(/^paket:/, "")} · {g.kim ?? ""}{g.durum !== "bitti" ? " · sürüyor" : ""}</div></td>
                    <td className="px-4 py-3">{g.gonderilen}/{g.toplam}{g.hatali ? <span className="text-error"> · {g.hatali} hata</span> : null}</td>
                    <td className="px-4 py-3">{g.teslim}</td>
                    <td className="px-4 py-3">{g.acildi}{g.gonderilen ? <span className="text-outline"> (%{Math.round((g.acildi / g.gonderilen) * 100)})</span> : null}</td>
                    <td className="px-4 py-3">{g.tiklandi}</td>
                    <td className="px-4 py-3">{g.geriDondu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
