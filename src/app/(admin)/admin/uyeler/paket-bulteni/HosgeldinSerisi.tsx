"use client";
// Hoş geldin serisi yönetimi (18 Kasım): aç/kapat, adımlar, önizleme, deneme. Sunucu: src/lib/hosgeldin, /api/admin/hosgeldin
import { useCallback, useEffect, useState } from "react";

type Adim = { no: number; gun: number; ad: string; konu: string | null; gonderilen: number; acilan: number; tiklanan: number; bugun: number };
type Durum = { aktif: boolean; baslangic: string | null; epostaHazir: boolean; adimlar: Adim[] };

const btn = "inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition active:scale-95 disabled:opacity-50";
const alan = "w-full rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-3 py-2 text-xs outline-none focus:border-primary/40";

export default function HosgeldinSerisi() {
  const [d, setD] = useState<Durum | null>(null);
  const [onizleme, setOnizleme] = useState<{ no: number; konu: string; html: string } | null>(null);
  const [adres, setAdres] = useState("");
  const [busy, setBusy] = useState("");
  const [mesaj, setMesaj] = useState<{ tip: "ok" | "hata"; metin: string } | null>(null);

  const yukle = useCallback(async () => {
    const r = await fetch("/api/admin/hosgeldin");
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return setMesaj({ tip: "hata", metin: j.error || "Yüklenemedi." });
    setD(j);
  }, []);
  useEffect(() => {
    const t = setTimeout(yukle, 0);
    return () => clearTimeout(t);
  }, [yukle]);

  const post = async (body: Record<string, unknown>) => {
    const r = await fetch("/api/admin/hosgeldin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return { r, j: await r.json().catch(() => ({})) };
  };
  const ayarla = async (aktif: boolean) => {
    setBusy("ayar");
    const { r, j } = await post({ action: "ayar", aktif });
    setBusy("");
    setMesaj(r.ok ? { tip: "ok", metin: aktif ? "Seri açıldı. Bundan sonra gelen izinli kişilere gidecek." : "Seri kapatıldı." } : { tip: "hata", metin: j.error });
    yukle();
  };
  const onizle = async (no: number) => {
    if (onizleme?.no === no) return setOnizleme(null);
    setBusy(`o${no}`);
    const r = await fetch(`/api/admin/hosgeldin?onizleme=${no}`);
    const j = await r.json().catch(() => ({}));
    setBusy("");
    if (!r.ok || !j.onizleme) return setMesaj({ tip: "hata", metin: j.error || "Bu adım şu an gönderilemez (yayında paket yok)." });
    setOnizleme({ no, ...j.onizleme });
  };
  const deneme = async (no: number) => {
    setBusy(`d${no}`);
    const { r, j } = await post({ action: "deneme", adim: no, adres });
    setBusy("");
    setMesaj(r.ok ? { tip: "ok", metin: `${no}. adımın denemesi ${adres} adresine gönderildi.` } : { tip: "hata", metin: j.error });
  };

  if (!d) return null;
  return (
    <section className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-headline text-lg font-bold text-primary">Hoş geldin serisi</h2>
          <p className="mt-1 max-w-2xl text-[11px] text-on-surface-variant">
            Kitapçık indirip pazarlama izni veren ya da e-posta izniyle üye olan kişiye kayıttan 2, 5 ve 10 gün sonra kendiliğinden giden 3 e-posta. Kitapçık e-postası zaten kayıt anında gidiyor.
            Yalnızca seriyi açtığınız andan sonra gelen kişilere gider; eski kayıtlara gitmez. Her e-postada abonelikten çıkma bağlantısı vardır.
          </p>
          {d.baslangic && <p className="mt-1 text-[11px] text-outline">Başlangıç: {new Date(d.baslangic).toLocaleString("tr-TR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>}
          {!d.epostaHazir && <p className="mt-1 text-[11px] font-bold text-error">E-posta servisi yapılandırılmamış; seri açık olsa da gönderim yapılmaz.</p>}
        </div>
        <button type="button" disabled={!!busy} onClick={() => ayarla(!d.aktif)} className={`${btn} ${d.aktif ? "border border-error/30 text-error" : "bg-primary text-white"}`}>
          {d.aktif ? "Seriyi kapat" : "Seriyi aç"}
        </button>
      </div>
      <p className={`inline-block rounded-lg px-3 py-1 text-[11px] font-bold ${d.aktif ? "bg-secondary/10 text-secondary" : "bg-surface-container-low text-outline"}`}>{d.aktif ? "Açık · her gün 09:00 sonrası çalışır" : "Kapalı"}</p>

      {mesaj && <p className={`rounded-xl px-4 py-3 text-xs font-bold ${mesaj.tip === "ok" ? "bg-secondary/10 text-secondary" : "bg-error/10 text-error"}`}>{mesaj.metin}</p>}

      <div className="overflow-x-auto rounded-xl border border-outline-variant/15">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-container-low text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
            <tr><th className="px-4 py-3">Adım</th><th className="px-4 py-3">Konu</th><th className="px-4 py-3">Bugün</th><th className="px-4 py-3">Gönderilen</th><th className="px-4 py-3">Açılan</th><th className="px-4 py-3">Tıklayan</th><th className="px-4 py-3" /></tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {d.adimlar.map((a) => (
              <tr key={a.no}>
                <td className="px-4 py-3 whitespace-nowrap"><b>{a.no}.</b> {a.gun}. gün</td>
                <td className="px-4 py-3"><b>{a.konu ?? "—"}</b><div className="text-[10px] text-outline">{a.ad}</div></td>
                <td className="px-4 py-3">{a.bugun}</td>
                <td className="px-4 py-3">{a.gonderilen}</td>
                <td className="px-4 py-3">{a.acilan}{a.gonderilen ? <span className="text-outline"> (%{Math.round((a.acilan / a.gonderilen) * 100)})</span> : null}</td>
                <td className="px-4 py-3">{a.tiklanan}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right space-x-2">
                  <button type="button" disabled={!!busy} onClick={() => onizle(a.no)} className="text-[11px] font-bold text-primary">{onizleme?.no === a.no ? "Kapat" : "Önizle"}</button>
                  <button type="button" disabled={!!busy || !adres} onClick={() => deneme(a.no)} className="text-[11px] font-bold text-primary disabled:text-outline">{busy === `d${a.no}` ? "Gönderiliyor…" : "Deneme gönder"}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <label className="block max-w-sm text-[11px] font-bold text-on-surface-variant">Deneme adresi<input value={adres} onChange={(e) => setAdres(e.target.value)} placeholder="sizin@adresiniz.com" className={`${alan} mt-1`} /></label>

      {onizleme && (
        <div className="overflow-hidden rounded-2xl border border-outline-variant/15">
          <div className="border-b border-outline-variant/15 px-4 py-3 text-xs"><span className="text-outline">Konu:</span> <b>{onizleme.konu}</b></div>
          <iframe title="Hoş geldin e-postası önizleme" srcDoc={onizleme.html} className="h-[720px] w-full bg-[#f3f5f9]" />
        </div>
      )}
    </section>
  );
}
