"use client";
// Ramazan 2027 rezervasyonları (25 Ekim): oda bazında 6 blok, rezervasyon listesi, ödendi / iptal. Tek oda kuralı: bir oda
// dolmadan sitede yeni oda açılmaz; oda dolunca otelden yeni oda alınır.
import { useCallback, useEffect, useState } from "react";
import { RAMAZAN, RAMAZAN_PAKETLERI, paketTarihleri } from "@/lib/ramazan/paketler";

type Blok = { no: number; kod: string | null; durum: "bos" | "bekliyor" | "odendi" };
type Oda = { oda: number; blok: Blok[]; gelirUsd: number; dolu: boolean };
type Kayit = {
  id: string; kod: string; oda: number; bloklar: string; paket: string; kisi: number; adSoyad: string; telefon: string; eposta: string | null;
  yolcular: string; kisiBasiUsd: number; toplamUsd: number; durum: "bekliyor" | "odendi" | "iptal"; sonOdeme: string; pazarlamaIzni: boolean; not: string | null; createdAt: string; aktif: boolean;
  odemeYontemi: string | null; odemeRef: string | null; odemeTarihi: string | null;
};

const usd = (n: number) => `${n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
const tarihSaat = (s: string) => new Date(s).toLocaleString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });
const blokEtiket = (no: number) => paketTarihleri({ id: "", tur: 5, grup: no, bloklar: [no], ad: "" });
const ODA_MALIYET_USD = RAMAZAN.odaAlisSar / RAMAZAN.sar;

export default function RamazanAdmin() {
  const [odalar, setOdalar] = useState<Oda[]>([]);
  const [liste, setListe] = useState<Kayit[]>([]);
  const [hata, setHata] = useState("");
  const [mesgul, setMesgul] = useState<string | null>(null);

  const yukle = useCallback(async () => {
    const r = await fetch("/api/admin/ramazan", { cache: "no-store" });
    if (!r.ok) return setHata(r.status === 401 || r.status === 403 ? "Oturumunuzun süresi dolmuş; yeniden giriş yapın." : "Liste alınamadı.");
    const d = await r.json();
    setOdalar(d.odalar); setListe(d.liste); setHata("");
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- açılışta veriler bir kez okunur
    yukle();
  }, [yukle]);

  const degistir = async (id: string, durum: Kayit["durum"]) => {
    if (durum === "iptal" && !confirm("Rezervasyon iptal edilsin mi? Yeri hemen satışa açılır.")) return;
    setMesgul(id);
    const r = await fetch("/api/admin/ramazan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, durum }) });
    const d = await r.json().catch(() => ({}));
    setMesgul(null);
    if (!r.ok) setHata(d.error || "Güncellenemedi.");
    yukle();
  };

  const dolanOda = odalar.filter((o) => o.dolu);
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">Ramazan 2027</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          {RAMAZAN.otelAdi} · oda {RAMAZAN.odaAlisSar} SAR alış ({usd(ODA_MALIYET_USD)}), {RAMAZAN.odaSatisSar} SAR satış · 30 gece = 6 blok × 5 gece. Bir oda dolmadan sitede yeni oda açılmaz.
          {" "}<a href="/ramazan-umresi-paketi" target="_blank" className="font-semibold text-primary underline">Satış sayfası</a>
        </p>
      </div>
      {hata && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{hata}</p>}
      {dolanOda.length > 0 && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Dolan oda: {dolanOda.map((o) => `Oda ${o.oda}`).join(", ")}. Bu odalar otelden satın alınmış olmalı; sitede bir sonraki oda satışa açıldı.
        </p>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Odalar</h2>
        {odalar.length === 0 && <p className="text-sm text-on-surface-variant">Henüz rezervasyon yok. Sitede Oda 1 satışta.</p>}
        {odalar.map((o) => {
          const doluGece = o.blok.filter((b) => b.durum !== "bos").length * RAMAZAN.blokGece;
          return (
            <div key={o.oda} className="rounded-2xl border border-outline-variant/30 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold text-on-surface">Oda {o.oda} {o.dolu ? <span className="ml-2 rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">dolu</span> : <span className="ml-2 rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700">satışta</span>}</p>
                <p className="text-xs text-on-surface-variant">{doluGece}/30 gece · tahsilat (brüt) {usd(o.gelirUsd)} · oda maliyeti {usd(ODA_MALIYET_USD)}</p>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 md:grid-cols-6">
                {o.blok.map((b) => {
                  const t = blokEtiket(b.no);
                  const renk = b.durum === "odendi" ? "bg-emerald-600 text-white" : b.durum === "bekliyor" ? "bg-amber-400 text-amber-950" : "bg-surface-container-low text-on-surface-variant";
                  return (
                    <div key={b.no} className={`rounded-lg px-2 py-2 text-xs ${renk}`}>
                      <p className="font-bold">{t.ramazan}</p>
                      <p className="opacity-80">{t.giris} – {t.cikis}</p>
                      <p className="mt-1 font-mono">{b.kod ?? "boş"}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Rezervasyonlar</h2>
        <div className="overflow-x-auto rounded-2xl border border-outline-variant/30 bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low text-on-surface-variant">
              <tr><th className="p-3">Kod</th><th className="p-3">Oda · paket</th><th className="p-3">Müşteri</th><th className="p-3">Yolcular</th><th className="p-3">Tutar</th><th className="p-3">Durum</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {liste.map((r) => {
                const p = RAMAZAN_PAKETLERI.find((x) => x.id === r.paket);
                const t = p ? paketTarihleri(p) : null;
                const sureDoldu = r.durum === "bekliyor" && !r.aktif;
                return (
                  <tr key={r.id} className={`border-t border-outline-variant/20 ${r.durum === "iptal" || sureDoldu ? "opacity-50" : ""}`}>
                    <td className="p-3 font-mono font-bold">{r.kod}</td>
                    <td className="p-3">Oda {r.oda} · {p?.ad ?? r.paket}<br /><span className="text-on-surface-variant">{t ? `${t.ramazan} · ${t.giris} – ${t.cikis}` : ""}</span></td>
                    <td className="p-3">{r.adSoyad}<br /><a className="text-primary underline" href={`https://wa.me/${r.telefon.replace(/\D/g, "")}`} target="_blank">{r.telefon}</a>{r.eposta ? <><br />{r.eposta}</> : null}</td>
                    <td className="p-3">{(JSON.parse(r.yolcular) as string[]).join(", ")}</td>
                    <td className="p-3 whitespace-nowrap">{usd(r.toplamUsd)}<br /><span className="text-on-surface-variant">{r.kisi} × {usd(r.kisiBasiUsd)}</span></td>
                    <td className="p-3 whitespace-nowrap">
                      {r.durum === "odendi" ? <span className="font-bold text-emerald-700">Ödendi{r.odemeTarihi ? <><br /><span className="font-normal text-on-surface-variant">{tarihSaat(r.odemeTarihi)} · {r.odemeYontemi === "whatsapp" ? "elle" : r.odemeYontemi}{r.odemeRef ? ` · ${r.odemeRef}` : ""}</span></> : null}</span>
                        : r.durum === "iptal" ? <span className="text-on-surface-variant">İptal</span>
                        : sureDoldu ? <span className="text-red-700">Süresi doldu</span>
                        : <span className="text-amber-700">Ödeme bekliyor<br />son: {tarihSaat(r.sonOdeme)}</span>}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {r.durum !== "odendi" && <button disabled={mesgul === r.id} onClick={() => degistir(r.id, "odendi")} className="mr-2 rounded-lg bg-emerald-600 px-3 py-1.5 font-bold text-white disabled:opacity-50">Ödendi</button>}
                      {r.durum !== "iptal" && <button disabled={mesgul === r.id} onClick={() => degistir(r.id, "iptal")} className="rounded-lg border border-outline-variant/40 px-3 py-1.5 font-bold text-on-surface-variant disabled:opacity-50">İptal</button>}
                    </td>
                  </tr>
                );
              })}
              {liste.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-on-surface-variant">Henüz rezervasyon yok.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
