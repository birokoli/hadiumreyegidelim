"use client";
// Üyelere gönderim (Profil 2, 14 Ekim): hesap duyurusu (tüm üyeler, bir kez) ya da kampanya (yalnızca izinli üyeler).
// Önizleme → kendine deneme → "GÖNDER" yazıp onay. Kampanyada ayrıca WhatsApp izni olanların elle gönderim listesi.
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import HubTabs from "@/components/admin/HubTabs";
import { donemLabel, type Kampanya } from "@/lib/uye-kampanya/ortak";

type Onizleme = { konu: string; html: string; alici: number; toplamUye: number; izinsiz: number; engelli: number; zatenGitti: number };
type Gecmis = { id: string; tur: string; konu: string; toplam: number; gonderilen: number; hatali: number; durum: string; kim: string | null; createdAt: string; teslim: number; acildi: number; tiklandi: number; geriDondu: number };
type WaUye = { id: string; name: string; phone: string; gonderildi: boolean; planDonem: string | null };

const SITE = "https://hadiumreyegidelim.com";
const btn = "inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition active:scale-95 disabled:opacity-50";

function waUrl(phone: string, text: string) {
  let p = phone.replace(/\D/g, "");
  if (p.startsWith("0")) p = "9" + p;
  if (!p.startsWith("90")) p = "90" + p;
  return `https://wa.me/${p}?text=${encodeURIComponent(text)}`;
}

export default function UyeGonderim() {
  const [tur, setTur] = useState<"duyuru" | "kampanya">("duyuru");
  const [kampanyaId, setKampanyaId] = useState("");
  const [o, setO] = useState<Onizleme | null>(null);
  const [gecmis, setGecmis] = useState<Gecmis[]>([]);
  const [kampanyalar, setKampanyalar] = useState<Kampanya[]>([]);
  const [wa, setWa] = useState<WaUye[]>([]);
  const [deneme, setDeneme] = useState("");
  const [onay, setOnay] = useState("");
  const [busy, setBusy] = useState("");
  const [mesaj, setMesaj] = useState<{ tip: "ok" | "hata"; metin: string } | null>(null);

  const yukle = useCallback(async () => {
    const q = new URLSearchParams({ tur, ...(kampanyaId ? { kampanya: kampanyaId } : {}) });
    const r = await fetch(`/api/admin/uyeler/gonder?${q}`);
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return setMesaj({ tip: "hata", metin: d.error || "Yüklenemedi." });
    setO(d.onizleme);
    setGecmis(d.gecmis);
    setKampanyalar(d.kampanyalar);
    setWa(d.whatsapp ?? []);
  }, [tur, kampanyaId]);
  useEffect(() => {
    const t = setTimeout(yukle, 0);
    return () => clearTimeout(t);
  }, [yukle]);

  const k = kampanyalar.find((x) => x.id === kampanyaId);
  const waMetni = useMemo(
    () => (k ? `Selamün aleyküm, Hadi Umreye Gidelim'den yazıyoruz. Üyelerimize özel "${k.baslik.replace(/\*/g, "")}" tarihleri açıldı. Ayrıntılar ve teklif için profilinizdeki Size Özel bölümüne bakabilirsiniz: ${SITE}/profil/size-ozel . Bu mesajları almak istemezseniz "dur" yazmanız yeterli.` : ""),
    [k],
  );

  const post = async (body: Record<string, unknown>) => {
    const r = await fetch("/api/admin/uyeler/gonder", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tur, kampanyaId, ...body }) });
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
  const waIsaretle = async (u: WaUye, v: boolean) => {
    setWa((l) => l.map((x) => (x.id === u.id ? { ...x, gonderildi: v } : x)));
    await post({ action: "whatsapp", userId: u.id, phone: u.phone, gonderildi: v });
  };

  const yayinda = kampanyalar.filter((x) => x.durum === "yayinda");

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-surface text-on-surface">
      <HubTabs hub="satis" />
      <div className="pb-6 border-b border-outline-variant/15">
        <Link href="/admin/uyeler" className="text-xs font-bold text-primary">← Üyeler</Link>
        <h1 className="font-headline text-2xl font-bold tracking-tight text-primary mt-2">Üyelere gönderim</h1>
        <p className="text-xs text-on-surface-variant mt-0.5">Hesap duyurusu bilgilendirmedir, bütün üyelere bir kez gider. Kampanya e-postası ve WhatsApp yalnızca izin verenlere gider.</p>
        <Link href="/admin/uyeler/paket-bulteni" className="mt-2 inline-block text-xs font-bold text-primary">Paket bülteni: pazarlama izni verenlere paket e-postası →</Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["duyuru", "kampanya"] as const).map((t) => (
          <button key={t} type="button" onClick={() => { setTur(t); setO(null); setMesaj(null); }} className={`${btn} border ${tur === t ? "bg-primary text-white border-primary" : "bg-surface-container-lowest border-outline-variant/25 text-on-surface-variant"}`}>
            {t === "duyuru" ? "Hesap duyurusu (tüm üyeler)" : "Kampanya (izinli üyeler)"}
          </button>
        ))}
        {tur === "kampanya" && (
          <select value={kampanyaId} onChange={(e) => setKampanyaId(e.target.value)} className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest px-3 py-2 text-xs">
            <option value="">Kampanya seçin</option>
            {yayinda.map((x) => <option key={x.id} value={x.id}>{x.baslik.replace(/\*/g, "")}</option>)}
          </select>
        )}
        {tur === "kampanya" && yayinda.length === 0 && <Link href="/admin/uye-kampanyalari" className="text-xs font-bold text-primary">Önce bir kampanya yayınlayın →</Link>}
      </div>

      {mesaj && <p className={`rounded-xl px-4 py-3 text-xs font-bold ${mesaj.tip === "ok" ? "bg-secondary/10 text-secondary" : "bg-error/10 text-error"}`}>{mesaj.metin}</p>}

      {o && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="overflow-hidden rounded-2xl border border-outline-variant/15 bg-surface-container-lowest">
            <div className="border-b border-outline-variant/15 px-4 py-3 text-xs"><span className="text-outline">Konu:</span> <b>{o.konu}</b></div>
            <iframe title="E-posta önizleme" srcDoc={o.html} className="h-[720px] w-full bg-[#edf1fe]" />
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Alıcılar</p>
              <p className="font-headline text-3xl font-bold text-primary mt-1">{o.alici} <span className="text-sm font-medium text-outline">kişi</span></p>
              <ul className="mt-2 space-y-0.5 text-[11px] text-on-surface-variant">
                <li>Toplam üye: {o.toplamUye}</li>
                {tur === "kampanya" && <li>E-posta izni olmayan (gönderilmez): {o.izinsiz}</li>}
                <li>Adresi geçersiz ya da spam bildirmiş (atlanır): {o.engelli}</li>
                <li>Bu e-postayı daha önce almış (atlanır): {o.zatenGitti}</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-5 space-y-2">
              <p className="text-xs font-bold">1. Kendinize deneme gönderin</p>
              <input value={deneme} onChange={(e) => setDeneme(e.target.value)} placeholder="sizin@adresiniz.com" className="w-full rounded-lg border border-outline-variant/25 px-3 py-2 text-xs outline-none focus:border-primary/40" />
              <button type="button" disabled={!!busy || !deneme} onClick={denemeGonder} className={`${btn} border border-outline-variant/25 text-primary`}>{busy === "deneme" ? "Gönderiliyor…" : "Deneme gönder"}</button>
            </div>
            <div className="rounded-2xl border border-error/20 bg-surface-container-lowest p-5 space-y-2">
              <p className="text-xs font-bold">2. Gönder</p>
              <p className="text-[11px] text-on-surface-variant">{o.alici} kişiye gidecek; geri alınamaz. Onaylamak için kutuya <b>GÖNDER</b> yazın.</p>
              <input value={onay} onChange={(e) => setOnay(e.target.value)} placeholder="GÖNDER" className="w-full rounded-lg border border-outline-variant/25 px-3 py-2 text-xs outline-none focus:border-error/40" />
              <button type="button" disabled={!!busy || onay !== "GÖNDER" || o.alici === 0} onClick={gonder} className={`${btn} w-full justify-center bg-primary text-white`}>
                {busy === "gonder" ? "Gönderiliyor… (sayfayı kapatmayın)" : `${o.alici} kişiye gönder`}
              </button>
            </div>
          </div>
        </div>
      )}

      {tur === "kampanya" && k && (
        <section className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-headline text-lg font-bold text-primary">WhatsApp listesi</h2>
              <p className="text-xs text-on-surface-variant">WhatsApp izni olan {wa.length} üye. &quot;WhatsApp&apos;ta aç&quot; mesajı hazır açar; gönderince işaretleyin.</p>
            </div>
            <span className="text-xs font-bold text-secondary">{wa.filter((u) => u.gonderildi).length} / {wa.length} gönderildi</span>
          </div>
          <p className="mt-3 rounded-xl bg-surface-container-low p-3 text-[11px] text-on-surface-variant">{waMetni}</p>
          <div className="mt-3 divide-y divide-outline-variant/10">
            {wa.length === 0 && <p className="py-6 text-center text-xs text-outline">WhatsApp izni veren üye yok.</p>}
            {wa.map((u) => (
              <div key={u.id} className="flex flex-wrap items-center gap-3 py-2.5 text-xs">
                <span className="min-w-0 flex-1 font-bold">{u.name} <span className="font-mono font-normal text-outline">{u.phone}</span>{u.planDonem && <span className="ml-2 font-normal text-outline">plan: {donemLabel(u.planDonem)}</span>}</span>
                <a href={waUrl(u.phone, waMetni.replace("Selamün aleyküm,", `Selamün aleyküm ${u.name.split(" ")[0]},`))} target="_blank" rel="noopener noreferrer" className={`${btn} bg-[#25D366] text-white`}>WhatsApp&apos;ta aç</a>
                <label className="flex items-center gap-1.5 font-bold text-on-surface-variant"><input type="checkbox" checked={u.gonderildi} onChange={(e) => waIsaretle(u, e.target.checked)} className="accent-primary" /> Gönderildi</label>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-headline text-lg font-bold text-primary mb-3">Gönderim geçmişi</h2>
        <div className="overflow-x-auto rounded-2xl border border-outline-variant/15 bg-surface-container-lowest">
          {gecmis.length === 0 ? (
            <p className="py-10 text-center text-xs text-outline">Henüz gönderim yok.</p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                <tr><th className="px-4 py-3">Tarih</th><th className="px-4 py-3">Tür · konu</th><th className="px-4 py-3">Gönderilen</th><th className="px-4 py-3">Teslim</th><th className="px-4 py-3">Açılan</th><th className="px-4 py-3">Tıklayan</th><th className="px-4 py-3">Geri dönen</th></tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {gecmis.map((g) => (
                  <tr key={g.id}>
                    <td className="px-4 py-3 font-mono text-outline whitespace-nowrap">{new Date(g.createdAt).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="px-4 py-3"><b>{g.tur === "duyuru" ? "Duyuru" : g.tur === "paket" ? "Paket bülteni" : "Kampanya"}</b> · {g.konu}<div className="text-[10px] text-outline">{g.kim ?? ""}{g.durum !== "bitti" ? " · sürüyor" : ""}</div></td>
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
        <p className="mt-2 text-[11px] text-outline">Teslim, açılma ve tıklama sayıları Resend olaylarıyla dolar (webhook ve Resend&apos;de açılma/tıklama izleme açık olmalı).</p>
      </section>
    </div>
  );
}
