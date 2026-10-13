"use client";
// Umre dosyaları (13 Ekim): kabul edilen tekliflerden açılan dosyaların listesi + profilde gösterilen kampanya kartları.
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import HubTabs from "@/components/admin/HubTabs";

type Dosya = { id: string; no: string; quotationId: string; userId: string | null; email: string | null; status: string; data: { musteriAdi?: string; gidis?: string; donus?: string; yetiskin?: number; cocuk?: number }; updatedAt: string };
type Kampanya = { id: string; baslik: string; aciklama: string; link: string; hat?: string; aktif: boolean };

const ASAMA: Record<string, string> = { teklif: "Teklif", onaylandi: "Onaylandı", odeme: "Ödeme", vize_basvuru: "Vize başvurusu", vize_cikti: "Vize çıktı", yolculuk: "Yolculuk", tamamlandi: "Tamamlandı" };
const tarih = (s?: string) => (s ? new Date(s).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", timeZone: "UTC" }) : "—");

export default function UmreDosyalariPage() {
  const [dosyalar, setDosyalar] = useState<Dosya[]>([]);
  const [kampanyalar, setKampanyalar] = useState<Kampanya[]>([]);
  const [filtre, setFiltre] = useState("aktif");
  const [kayit, setKayit] = useState("");

  const yukle = useCallback(async () => {
    const [a, b] = await Promise.all([fetch("/api/admin/umre").then((r) => r.json()), fetch("/api/admin/umre/kampanyalar").then((r) => r.json())]);
    setDosyalar(a.dosyalar ?? []);
    setKampanyalar(b.kampanyalar ?? []);
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- açılışta liste bir kez okunur
    yukle();
  }, [yukle]);

  const liste = useMemo(() => dosyalar.filter((d) => (filtre === "aktif" ? d.status !== "tamamlandi" : filtre === "hepsi" ? true : d.status === filtre)), [dosyalar, filtre]);

  const kampanyaKaydet = async () => {
    const r = await fetch("/api/admin/umre/kampanyalar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kampanyalar }) });
    const d = await r.json().catch(() => ({}));
    if (r.ok) {
      setKampanyalar(d.kampanyalar);
      setKayit("Kaydedildi.");
      setTimeout(() => setKayit(""), 2500);
    }
  };
  const kSet = (i: number, k: keyof Kampanya, v: string | boolean) => setKampanyalar((l) => l.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const inp = "w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 text-xs outline-none focus:border-primary/40";

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-surface text-on-surface">
      <HubTabs hub="satis" />
      <div className="pb-6 border-b border-outline-variant/15">
        <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">Satış & Operasyon</span>
        <h1 className="font-headline text-2xl font-bold tracking-tight text-primary mt-1">Umre Dosyaları</h1>
        <p className="text-xs text-on-surface-variant mt-0.5">Kabul edilen tekliflerden açılan dosyalar. Müşteri, üye hesabı bağlıysa her şeyi profilinde görür. Dosya açmak için teklifi açın, en alttaki &quot;Umre dosyası&quot; bölümünü kullanın.</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[["aktif", "Devam edenler"], ...Object.entries(ASAMA), ["hepsi", "Tümü"]].map(([k, v]) => (
          <button key={k} type="button" onClick={() => setFiltre(k)} className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${filtre === k ? "bg-primary text-white border-primary" : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/25"}`}>{v}</button>
        ))}
      </div>

      <div className="border border-outline-variant/15 rounded-2xl overflow-x-auto bg-surface-container-lowest">
        {liste.length === 0 ? (
          <p className="py-14 text-center text-xs text-outline">Bu filtrede dosya yok.</p>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low border-b border-outline-variant/15 text-on-surface-variant uppercase tracking-wider font-bold text-[10px]">
              <tr><th className="px-4 py-3">Dosya</th><th className="px-4 py-3">Müşteri</th><th className="px-4 py-3">Tarihler</th><th className="px-4 py-3">Aşama</th><th className="px-4 py-3">Profil</th><th className="px-4 py-3 text-right">İşlem</th></tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {liste.map((d) => (
                <tr key={d.id} className="hover:bg-primary/[0.03]">
                  <td className="px-4 py-3 font-mono font-bold text-primary">{d.no}</td>
                  <td className="px-4 py-3"><div className="font-bold">{d.data.musteriAdi}</div><div className="text-[10px] text-outline">{(d.data.yetiskin ?? 0) + (d.data.cocuk ?? 0)} kişi</div></td>
                  <td className="px-4 py-3 whitespace-nowrap text-on-surface-variant">{tarih(d.data.gidis)} → {tarih(d.data.donus)}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-secondary/10 px-2.5 py-1 text-[11px] font-bold text-secondary">{ASAMA[d.status] ?? d.status}</span></td>
                  <td className="px-4 py-3 text-[11px]">{d.userId ? <span className="font-bold text-secondary">Bağlı</span> : d.email ? <span className="text-outline">E-postayla bekliyor</span> : <span className="text-outline">Bağlı değil</span>}</td>
                  <td className="px-4 py-3 text-right"><Link href={`/admin/fiyat-teklifleri/${d.quotationId}#umre-dosyasi`} className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-bold text-white">Dosyayı aç</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <section className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-on-surface">Profilde gösterilen kampanyalar</h2>
            <p className="text-xs text-on-surface-variant">Üyelerin profil özetinde &quot;Size uygun&quot; kartı olarak görünür. Aktif ilk kart gösterilir.</p>
          </div>
          <div className="flex items-center gap-2">
            {kayit && <span className="text-[11px] font-bold text-secondary">{kayit}</span>}
            <button type="button" onClick={() => setKampanyalar((l) => [...l, { id: `k${Date.now()}`, baslik: "", aciklama: "", link: "/bireysel-umre", hat: "", aktif: true }])} className="rounded-lg border border-outline-variant/25 px-3 py-1.5 text-xs font-bold text-primary">+ Kampanya</button>
            <button type="button" onClick={kampanyaKaydet} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white">Kaydet</button>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {kampanyalar.length === 0 && <p className="text-xs text-outline">Kampanya yok; profilde kampanya kartı görünmez.</p>}
          {kampanyalar.map((k, i) => (
            <div key={k.id} className="grid gap-2 rounded-xl bg-surface-container-low p-3 md:grid-cols-[1.2fr_1.6fr_1fr_90px_auto_auto]">
              <input className={inp} placeholder="Başlık · ör. Ramazan 2027 *erken kayıt*" value={k.baslik} onChange={(e) => kSet(i, "baslik", e.target.value)} />
              <input className={inp} placeholder="Kısa açıklama" value={k.aciklama} onChange={(e) => kSet(i, "aciklama", e.target.value)} />
              <input className={inp} placeholder="/bireysel-umre" value={k.link} onChange={(e) => kSet(i, "link", e.target.value)} />
              <input className={inp} placeholder="Hat: رمضان" value={k.hat ?? ""} onChange={(e) => kSet(i, "hat", e.target.value)} />
              <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={k.aktif} onChange={(e) => kSet(i, "aktif", e.target.checked)} />Aktif</label>
              <button type="button" onClick={() => setKampanyalar((l) => l.filter((_, j) => j !== i))} className="text-xs text-outline hover:text-error">sil</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
