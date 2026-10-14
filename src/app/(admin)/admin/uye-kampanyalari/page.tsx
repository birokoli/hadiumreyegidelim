"use client";
// Üyelere özel kampanyalar (Profil 2, 14 Ekim): oluştur, yayınla, kapat; talep / kişi / satış sayaçları satış masasından.
// Yayındaki kampanya üyenin profilinde "Size Özel"de görünür. Üstte paket başına üye fiyatı (UYE_PAKET_FIYATLARI): yalnızca girilen paketlerde açılır.
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import HubTabs from "@/components/admin/HubTabs";
import { donemLabel, donemSecenekleri, geceToplam, trGun, usdTam, type Kampanya, type KampanyaSayac } from "@/lib/uye-kampanya/ortak";

const inp = "w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/40";
const lbl = "block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1";
const DURUM: Record<Kampanya["durum"], { ad: string; cls: string }> = {
  yayinda: { ad: "Yayında", cls: "bg-secondary/10 text-secondary" },
  taslak: { ad: "Taslak", cls: "bg-outline-variant/20 text-outline" },
  kapali: { ad: "Kapalı", cls: "bg-error/10 text-error" },
};

type Form = Partial<Kampanya>;
type PaketSatir = { slug: string; title: string; fiyat: number; para: string; kural: { tip: "yuzde" | "tutar"; deger: number } | null; tip: "yuzde" | "tutar"; deger: string; durum: string };
const BOS: Form = { baslik: "", aciklama: "", dahil: "Umre vizesi\nKarşılama ve özel transfer\nHaremeyn treni\nTürkçe hoca", durum: "taslak", hat: "عمرة" };

export default function UyeKampanyalari() {
  const [list, setList] = useState<Kampanya[]>([]);
  const [sayac, setSayac] = useState<Record<string, KampanyaSayac>>({});
  const [paketler, setPaketler] = useState<PaketSatir[]>([]);
  const [f, setF] = useState<Form | null>(null);
  const [hata, setHata] = useState("");
  const [busy, setBusy] = useState(false);
  const [donemler] = useState(() => donemSecenekleri(new Date()));

  const yukle = useCallback(async () => {
    const r = await fetch("/api/admin/uye-kampanyalari");
    if (!r.ok) return setHata(r.status === 401 ? "Oturumunuzun süresi dolmuş; yeniden giriş yapın." : "Liste alınamadı.");
    const d = await r.json();
    setList(d.kampanyalar);
    setSayac(d.sayac);
    setPaketler((d.paketler ?? []).map((x: Omit<PaketSatir, "tip" | "deger" | "durum">) => ({ ...x, tip: x.kural?.tip ?? "yuzde", deger: x.kural ? String(x.kural.deger) : "", durum: "" })));
  }, []);
  useEffect(() => {
    const t = setTimeout(yukle, 0);
    return () => clearTimeout(t);
  }, [yukle]);

  const kaydet = async (e?: React.FormEvent, durum?: Kampanya["durum"]) => {
    e?.preventDefault();
    if (!f) return;
    setBusy(true);
    const r = await fetch("/api/admin/uye-kampanyalari", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kampanya: { ...f, durum: durum ?? f.durum } }) });
    setBusy(false);
    if (!r.ok) return setHata("Kaydedilemedi.");
    setF(null);
    yukle();
  };
  const durumDegis = async (k: Kampanya, durum: Kampanya["durum"]) => {
    await fetch("/api/admin/uye-kampanyalari", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kampanya: { ...k, durum } }) });
    yukle();
  };
  const sil = async (k: Kampanya) => {
    if (!confirm(`"${k.baslik.replace(/\*/g, "")}" kampanyası silinsin mi? Açılmış talepler satış masasında kalır.`)) return;
    await fetch("/api/admin/uye-kampanyalari", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", id: k.id }) });
    yukle();
  };
  const set = (k: keyof Kampanya) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: e.target.value }));

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-surface text-on-surface">
      <HubTabs hub="satis" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/15">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">Satış & CRM</span>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-primary mt-1">Üye kampanyaları</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">Üyelere özel tarih ve fiyatlar. Yayındaki kampanyalar üyenin profilinde &quot;Size Özel&quot; sekmesinde görünür.</p>
        </div>
        <button type="button" onClick={() => setF({ ...BOS })} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold self-start sm:self-auto">
          <span className="material-symbols-outlined text-[16px]">add</span> Yeni kampanya
        </button>
      </div>
      {hata && <p className="text-xs font-bold text-error">{hata}</p>}

      <section className="rounded-2xl border border-[#b8862f]/25 bg-surface-container-lowest p-5">
        <h2 className="text-sm font-bold">Paketlerde üyelerimize özel fiyat</h2>
        <p className="mt-0.5 max-w-3xl text-xs text-on-surface-variant">
          Yalnızca burada üye fiyatı girdiğiniz paketlerde, normal fiyatın yanında &quot;Üyelerimize özel&quot; fiyat görünür (üye olmayana bulanık). Kişi başı yüzde ya da tutar indirimi girin; pakette her otelin fiyatına aynı indirim uygulanır. Boş bırakıp kaydederseniz o pakette kapanır.
        </p>
        <div className="mt-4 divide-y divide-outline-variant/10">
          {paketler.length === 0 && <p className="py-4 text-xs text-outline">Yayında paket yok.</p>}
          {paketler.map((pk, i) => {
            const d = Number(pk.deger.replace(",", "."));
            const onizleme = pk.fiyat > 0 && d > 0 ? Math.floor(pk.tip === "yuzde" ? pk.fiyat * (1 - Math.min(50, d) / 100) : pk.fiyat - d) : null;
            const guncelle = (x: Partial<PaketSatir>) => setPaketler((l) => l.map((y, j) => (j === i ? { ...y, ...x, durum: "" } : y)));
            return (
              <div key={pk.slug} className="flex flex-wrap items-center gap-3 py-3 text-xs">
                <div className="min-w-[220px] flex-1">
                  <p className="font-bold text-on-surface">{pk.title}</p>
                  <p className="text-outline">Başlangıç {pk.fiyat > 0 ? `${pk.fiyat.toLocaleString("tr-TR")} $` : "fiyatsız"}{pk.kural ? <span className="ml-2 font-bold text-[#8a6a1c]">· üye fiyatı açık</span> : null}</p>
                </div>
                <select value={pk.tip} onChange={(e) => guncelle({ tip: e.target.value as "yuzde" | "tutar" })} className="rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-2 py-2">
                  <option value="yuzde">% indirim</option>
                  <option value="tutar">$ indirim (kişi başı)</option>
                </select>
                <input type="number" min={0} step={pk.tip === "yuzde" ? 0.5 : 5} value={pk.deger} onChange={(e) => guncelle({ deger: e.target.value })} placeholder="Boş: kapalı" className="w-28 rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-3 py-2 font-bold outline-none focus:border-primary/40" />
                <span className="w-36 text-on-surface-variant">{onizleme && onizleme > 0 && onizleme < pk.fiyat ? <>Üye: <b className="text-primary">{onizleme.toLocaleString("tr-TR")} $</b>&apos;dan</> : "–"}</span>
                <button
                  type="button"
                  onClick={async () => {
                    const r = await fetch("/api/admin/uye-kampanyalari", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "paket-uye", slug: pk.slug, tip: pk.tip, deger: pk.deger }) });
                    const res = await r.json().catch(() => ({}));
                    setPaketler((l) => l.map((y, j) => (j === i ? { ...y, kural: res.kural ?? null, deger: res.kural ? String(res.kural.deger) : "", durum: r.ok ? (res.kural ? "Açıldı" : "Kapatıldı") : "Hata" } : y)));
                  }}
                  className="rounded-xl bg-primary px-4 py-2 font-bold text-white"
                >
                  Kaydet
                </button>
                {pk.durum && <span className="font-bold text-secondary">{pk.durum}</span>}
              </div>
            );
          })}
        </div>
      </section>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest py-16 text-center text-xs text-outline">Henüz kampanya yok. &quot;Yeni kampanya&quot; ile ilkini oluşturun.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((k) => {
            const s = sayac[k.id] ?? { talep: 0, kisi: 0, satis: 0 };
            return (
              <div key={k.id} className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${DURUM[k.durum].cls}`}>{DURUM[k.durum].ad}</span>
                    <h2 className="mt-1.5 font-headline text-lg font-bold text-primary">{k.baslik.replace(/\*/g, "")}</h2>
                    <p className="text-xs text-on-surface-variant">
                      {[k.gidis ? `${trGun(k.gidis)} – ${trGun(k.donus, { day: "numeric", month: "long", year: "numeric" })}` : donemLabel(k.hedef), geceToplam(k) ? `${geceToplam(k)} gece` : "", k.uyeFiyat != null ? `üye ${usdTam(k.uyeFiyat)}` : "", k.normalFiyat != null ? `normal ${usdTam(k.normalFiyat)}` : ""].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button type="button" onClick={() => setF({ ...k })} className="rounded-lg border border-outline-variant/25 px-2.5 py-1 text-[11px] font-bold text-primary">Düzenle</button>
                    <button type="button" onClick={() => sil(k)} title="Sil" className="p-1 text-outline hover:text-error"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                  {[["Talep", s.talep], ["Satış", s.satis], ["Satılan kişi", s.kisi], ["Kontenjan", k.kontenjan == null ? "∞" : `${Math.max(0, k.kontenjan - s.kisi)} / ${k.kontenjan}`]].map(([a, b]) => (
                    <div key={String(a)} className="rounded-xl bg-surface-container-low py-2">
                      <p className="font-headline text-lg font-bold">{b}</p>
                      <p className="text-[10px] text-outline">{a}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-outline">
                  <span>{k.sonTarih ? `Son başvuru ${trGun(k.sonTarih)}` : "Son başvuru yok"}</span>
                  <span className="space-x-2">
                    {k.durum !== "yayinda" && <button type="button" onClick={() => durumDegis(k, "yayinda")} className="font-bold text-secondary">Yayınla</button>}
                    {k.durum === "yayinda" && <button type="button" onClick={() => durumDegis(k, "kapali")} className="font-bold text-error">Kapat</button>}
                    {s.talep > 0 && <Link href="/admin/satis" className="font-bold text-primary">Talepler →</Link>}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {f && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onClick={(e) => { if (e.target === e.currentTarget) setF(null); }}>
          <form onSubmit={kaydet} className="my-8 w-full max-w-2xl space-y-4 rounded-2xl bg-surface-container-lowest p-6 shadow-2xl">
            <h2 className="font-headline text-lg font-bold text-primary">{f.id ? "Kampanyayı düzenle" : "Yeni üye kampanyası"}</h2>
            <div>
              <label className={lbl}>Başlık (yıldızlı kısım italik olur)</label>
              <input required className={inp} value={f.baslik ?? ""} onChange={set("baslik")} placeholder="Kasım umresi *üyelere özel*" />
            </div>
            <div>
              <label className={lbl}>Kısa açıklama</label>
              <textarea rows={2} className={inp} value={f.aciklama ?? ""} onChange={set("aciklama")} placeholder="Okul tatiline denk gelen 10 gece; Harem'e yürüme mesafesinde oteller." />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div><label className={lbl}>Gidiş</label><input type="date" className={inp} value={f.gidis ?? ""} onChange={set("gidis")} /></div>
              <div><label className={lbl}>Dönüş</label><input type="date" className={inp} value={f.donus ?? ""} onChange={set("donus")} /></div>
              <div>
                <label className={lbl}>Dönem (plan eşleşmesi)</label>
                <select className={inp} value={f.hedef ?? ""} onChange={set("hedef")}>
                  <option value="">Gidiş tarihinin ayı</option>
                  {donemler.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <div><label className={lbl}>Mekke gece</label><input type="number" min={0} className={inp} value={f.mekkeGece ?? ""} onChange={set("mekkeGece")} /></div>
              <div className="sm:col-span-3"><label className={lbl}>Mekke oteli</label><input className={inp} value={f.mekkeOtel ?? ""} onChange={set("mekkeOtel")} placeholder="Otel adı" /></div>
              <div><label className={lbl}>Medine gece</label><input type="number" min={0} className={inp} value={f.medineGece ?? ""} onChange={set("medineGece")} /></div>
              <div className="sm:col-span-3"><label className={lbl}>Medine oteli</label><input className={inp} value={f.medineOtel ?? ""} onChange={set("medineOtel")} placeholder="Otel adı" /></div>
            </div>
            <div>
              <label className={lbl}>Dahil olanlar (her satır bir madde)</label>
              <textarea rows={4} className={inp} value={f.dahil ?? ""} onChange={set("dahil")} />
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <div><label className={lbl}>Üye fiyatı $ (kişi)</label><input type="number" min={0} className={inp} value={f.uyeFiyat ?? ""} onChange={set("uyeFiyat")} /></div>
              <div><label className={lbl}>Normal fiyat $</label><input type="number" min={0} className={inp} value={f.normalFiyat ?? ""} onChange={set("normalFiyat")} /></div>
              <div><label className={lbl}>Kontenjan (kişi)</label><input type="number" min={0} className={inp} value={f.kontenjan ?? ""} onChange={set("kontenjan")} placeholder="Boş: sınırsız" /></div>
              <div><label className={lbl}>Son başvuru</label><input type="date" className={inp} value={f.sonTarih ?? ""} onChange={set("sonTarih")} /></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2"><label className={lbl}>Görsel adresi (boş: Kâbe görseli)</label><input className={inp} value={f.gorsel ?? ""} onChange={set("gorsel")} placeholder="https://… ya da /images/…" /></div>
              <div><label className={lbl}>Hat (Arapça süs)</label><input className={inp} value={f.hat ?? ""} onChange={set("hat")} placeholder="رمضان" /></div>
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-outline-variant/15 pt-4">
              <button type="button" onClick={() => setF(null)} className="rounded-xl px-4 py-2 text-xs font-bold text-on-surface-variant">Vazgeç</button>
              {f.durum === "yayinda" ? (
                <button type="submit" disabled={busy} className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white">Kaydet</button>
              ) : (
                <>
                  <button type="button" disabled={busy} onClick={() => kaydet(undefined, "taslak")} className="rounded-xl border border-outline-variant/25 px-4 py-2 text-xs font-bold text-primary">Taslak olarak kaydet</button>
                  <button type="button" disabled={busy} onClick={() => kaydet(undefined, "yayinda")} className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white">Kaydet ve yayınla</button>
                </>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
