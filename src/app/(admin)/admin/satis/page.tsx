"use client";
// Satış masası (14 Ekim): her müşteri tek dosya; aşama sütunları. Yeni dosya buradan açılır.
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HubTabs from "@/components/admin/HubTabs";
import { ASAMALAR, gunKaldi, SATIS_TURLERI, toplam, trTarih, usd, type Dosya } from "@/lib/satis/ortak";

type Ekip = { id: string; name: string };
const inp = "w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 text-xs outline-none focus:border-primary/40";

export default function SatisMasasi() {
  const router = useRouter();
  const [dosyalar, setDosyalar] = useState<Dosya[]>([]);
  const [ekip, setEkip] = useState<Ekip[]>([]);
  const [ben, setBen] = useState<Ekip | null>(null);
  const [ara, setAra] = useState("");
  const [sadeceBen, setSadeceBen] = useState(false);
  const [iptal, setIptal] = useState(false);
  const [yeni, setYeni] = useState(false);
  const [f, setF] = useState({ musteriAdi: "", phone: "", email: "", yetiskin: 2, cocuk: 0, gidis: "", donus: "", talepNotu: "", satisTuru: "01" });
  const [hata, setHata] = useState("");

  const yukle = useCallback(async () => {
    const r = await fetch("/api/admin/satis");
    if (!r.ok) return setHata(r.status === 401 || r.status === 403 ? "Oturumunuzun süresi dolmuş; /admin/login adresinden yeniden giriş yapın." : "Liste alınamadı; sayfayı yenileyin.");
    const d = await r.json();
    setDosyalar(d.dosyalar);
    setEkip(d.ekip);
    setBen(d.ben);
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- açılışta veriler bir kez okunur
    yukle();
  }, [yukle]);

  const liste = useMemo(() => {
    const q = ara.trim().toLocaleLowerCase("tr-TR");
    return dosyalar.filter((d) => {
      if (!iptal && d.status === "iptal") return false;
      if (sadeceBen && ben && d.sorumluId !== ben.id) return false;
      return !q || `${d.no} ${d.data.musteriAdi} ${d.phone ?? ""} ${d.email ?? ""}`.toLocaleLowerCase("tr-TR").includes(q);
    });
  }, [dosyalar, ara, sadeceBen, iptal, ben]);

  const olustur = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata("");
    const r = await fetch("/api/admin/satis", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return setHata(d.error || "Dosya açılamadı.");
    router.push(`/admin/satis/${d.dosya.no}`);
  };

  const ekipAdi = (id: string | null) => ekip.find((x) => x.id === id)?.name ?? "";

  const sutunlar = [...ASAMALAR.map((a) => ({ key: a.key as string, label: a.label })), ...(iptal ? [{ key: "iptal", label: "İptal" }] : [])];

  return (
    <div className="p-6 lg:p-8 space-y-6 min-h-screen bg-surface text-on-surface">
      <div className="max-w-7xl"><HubTabs hub="satis" /></div>
      <div className="flex flex-col gap-4 border-b border-outline-variant/15 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">Satış & Operasyon</span>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-primary mt-1">Satış Masası</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">Her müşteri tek dosya: talep, teklif, onay, ödeme, vize, yolculuk. Müşteri onaydan sonra her şeyi profilinde görür.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input value={ara} onChange={(e) => setAra(e.target.value)} placeholder="Ad, telefon, dosya no" className={`${inp} w-56`} />
          <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={sadeceBen} onChange={(e) => setSadeceBen(e.target.checked)} />Benim dosyalarım</label>
          <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={iptal} onChange={(e) => setIptal(e.target.checked)} />İptalleri göster</label>
          <button type="button" onClick={() => setYeni(true)} className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white">+ Yeni dosya</button>
        </div>
      </div>

      {hata && !yeni && <p className="rounded-xl bg-error/10 px-4 py-3 text-sm font-bold text-error">{hata} {hata.includes("giriş") && <Link href="/admin/login" className="underline">Giriş yap</Link>}</p>}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {sutunlar.map((s) => {
          const kartlar = liste.filter((d) => d.status === s.key);
          return (
            <section key={s.key} className="w-52 shrink-0 rounded-2xl bg-surface-container-low p-2.5">
              <div className="flex items-center justify-between px-1.5 pb-2">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{s.label}</h2>
                <span className="rounded-full bg-surface-container-lowest px-2 py-0.5 text-[10px] font-bold text-outline">{kartlar.length}</span>
              </div>
              <div className="space-y-2">
                {kartlar.map((d) => {
                  const g = gunKaldi(d.data.gidis);
                  const t = toplam(d.data);
                  return (
                    <Link key={d.id} href={`/admin/satis/${d.no}`} className="block rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-3 transition hover:border-primary/40 hover:shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] font-bold text-primary">{d.no}</span>
                        {g != null && g >= 0 && d.status !== "tamamlandi" && <span className="text-[10px] font-bold text-secondary">{g === 0 ? "bugün" : `${g} gün`}</span>}
                      </div>
                      <p className="mt-1 text-sm font-bold text-on-surface">{d.data.musteriAdi}</p>
                      <p className="text-[11px] text-on-surface-variant">
                        {d.data.yetiskin + d.data.cocuk} kişi{d.data.gidis ? ` · ${trTarih(d.data.gidis, { day: "numeric", month: "short" })}` : ""}{t ? ` · ${usd(t)}` : ""}
                      </p>
                      {ekipAdi(d.sorumluId) && <p className="mt-1.5 text-[10px] text-outline">Sorumlu: {ekipAdi(d.sorumluId)}</p>}
                    </Link>
                  );
                })}
                {kartlar.length === 0 && <p className="px-1.5 py-4 text-center text-[11px] text-outline">—</p>}
              </div>
            </section>
          );
        })}
      </div>

      <Link href="/admin/uye-kampanyalari" className="block max-w-7xl rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-4 hover:border-primary/40">
        <span className="text-sm font-bold">Üyelere özel kampanyalar</span>
        <span className="block text-xs text-on-surface-variant">Profilde &quot;Size Özel&quot; sekmesinde görünen tarihler ve paketlerdeki üye fiyatı oranı; talepler bu panoya düşer.</span>
      </Link>

      {yeni && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={(e) => { if (e.target === e.currentTarget) setYeni(false); }}>
          <form onSubmit={olustur} className="w-full max-w-lg space-y-3 rounded-2xl bg-surface-container-lowest p-6 shadow-2xl">
            <h2 className="font-headline text-lg font-bold text-primary">Yeni müşteri dosyası</h2>
            <p className="text-xs text-on-surface-variant">WhatsApp&apos;tan ya da telefonla gelen talep için. Teklifi dosyanın içinde hazırlarsınız.</p>
            <input className={inp} placeholder="Müşteri adı soyadı *" value={f.musteriAdi} onChange={(e) => setF({ ...f, musteriAdi: e.target.value })} autoFocus />
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Satış türü (dosya numarasında yer alır)</span>
              <select className={inp} value={f.satisTuru} onChange={(e) => setF({ ...f, satisTuru: e.target.value })}>
                {Object.entries(SATIS_TURLERI).map(([k, v]) => <option key={k} value={k}>{k} · {v}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input className={inp} placeholder="Telefon (WhatsApp)" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
              <input className={inp} placeholder="E-posta (profil için)" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <label className="text-[10px] font-bold uppercase text-outline">Yetişkin<input type="number" min={1} className={inp} value={f.yetiskin} onChange={(e) => setF({ ...f, yetiskin: Number(e.target.value) || 1 })} /></label>
              <label className="text-[10px] font-bold uppercase text-outline">Çocuk<input type="number" min={0} className={inp} value={f.cocuk} onChange={(e) => setF({ ...f, cocuk: Number(e.target.value) || 0 })} /></label>
              <label className="text-[10px] font-bold uppercase text-outline">Gidiş<input type="date" className={inp} value={f.gidis} onChange={(e) => setF({ ...f, gidis: e.target.value })} /></label>
              <label className="text-[10px] font-bold uppercase text-outline">Dönüş<input type="date" className={inp} value={f.donus} onChange={(e) => setF({ ...f, donus: e.target.value })} /></label>
            </div>
            <textarea className={`${inp} min-h-16`} placeholder="Talep notu (otel beklentisi, bütçe, özel durum)" value={f.talepNotu} onChange={(e) => setF({ ...f, talepNotu: e.target.value })} />
            {hata && <p className="text-xs font-bold text-error">{hata}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setYeni(false)} className="rounded-xl border border-outline-variant/25 px-4 py-2 text-xs font-bold">Vazgeç</button>
              <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white">Dosyayı aç</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
