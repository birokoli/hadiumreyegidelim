"use client";
// Satış dosyası (14 Ekim): sekmeler Teklif · Yolculuk · Ödeme · Belgeler · Müşteri · Geçmiş. Teklif WhatsApp mesajı ve
// voucher bu ekrandan gönderilir; teklif kalemleri onaydan sonra yolculuk planı olur (oteller tekrar yazılmaz).
import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { durakSayisi, ZIYARET_ROTALARI } from "@/lib/satis/ziyaret";
import { SATIS_TURLERI } from "@/lib/satis/ortak";
import { ASAMALAR, KALEM_TURLERI, KART_PAYI, KDV_ETIKETI, KDV_ORANI, alisToplam, genelToplam, kartla, kartPayiOf, kdvTutari, asamaIndex, asamaLabel, geceSayisi, kalemToplam, tarihTers, faturaGece, gunEkle, odemeDagilimi, odenen, onaylandiMi, toplam, trTarih, usd, waNumara, type Dosya, type DosyaData, type Kalem, type KalemTur, type Odeme } from "@/lib/satis/ortak";
import { teklifLinki, teklifMesaji, voucherLinki, voucherMesaji, waLink } from "@/lib/satis/mesaj";
import type { TeklifAcilis } from "@/lib/satis/acilis";

type Otel = { slug: string; ad: string; sehir: string; kabe: number | null };
type Kutuphane = { id: string; kategori: string; ad: string; alis: number; satis: number | null };
type Uye = { id: string; name: string; email: string };
type Belge = { id: string; ad: string; tur: string; boyut: number };
type Yanit = { dosya: Dosya; belgeler: Belge[]; oneri: Uye[]; bagliUye: Uye | null; ekip: { id: string; name: string }[]; oteller: Otel[]; kutuphane: Kutuphane[]; acilislar?: TeklifAcilis[] };

const SEKMELER = ["Teklif", "Yolculuk", "Ödeme", "Belgeler", "Müşteri", "Geçmiş"] as const;
const inp = "w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg px-2.5 py-2 text-xs outline-none focus:border-primary/40";
const lbl = "block text-[10px] font-bold uppercase text-outline mb-1";
const KUT_TUR: Record<string, KalemTur> = { vize: "vize", hotel: "otel_mekke", transfer: "transfer", tur: "tur", flight: "diger", extra: "diger" };
const uid = () => Math.random().toString(36).slice(2, 10);

function Kart({ baslik, aciklama, children }: { baslik: string; aciklama?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-5">
      <h3 className="text-sm font-bold text-on-surface">{baslik}</h3>
      {aciklama && <p className="mt-0.5 text-xs text-on-surface-variant">{aciklama}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function SatisDosyasi({ params }: { params: Promise<{ no: string }> }) {
  const { no } = use(params);
  const [y, setY] = useState<Yanit | null>(null);
  const [data, setData] = useState<DosyaData | null>(null);
  const [status, setStatus] = useState<string>("talep");
  const [kisi, setKisi] = useState({ email: "", phone: "", sorumluId: "" });
  const [kirli, setKirli] = useState(false);
  const [bildir, setBildir] = useState(true);
  const [sekme, setSekme] = useState<(typeof SEKMELER)[number]>("Teklif");
  const [mesaj, setMesaj] = useState<{ tur: "teklif" | "voucher"; metin: string } | null>(null);
  const [durum, setDurum] = useState("");
  const [busy, setBusy] = useState(false);
  const [not, setNot] = useState("");
  const [belgeTur, setBelgeTur] = useState("vize");
  const [yeniOdeme, setYeniOdeme] = useState<Odeme>({ id: "", tarih: new Date().toISOString().slice(0, 10), tutar: 0, yontem: "havale", yer: "onden", aciklama: "" });

  // Kaydetme cevabı otel listesi, kütüphane ve ekibi içermez; öncekileri koru
  const al = (d: Partial<Yanit> & { dosya: Dosya }) => {
    setY((prev) => ({ ...(prev ?? { belgeler: [], oneri: [], bagliUye: null, ekip: [], oteller: [], kutuphane: [] }), ...d }) as Yanit);
    setData(d.dosya.data);
    setStatus(d.dosya.status);
    setKisi({ email: d.dosya.email ?? "", phone: d.dosya.phone ?? "", sorumluId: d.dosya.sorumluId ?? "" });
    setKirli(false);
  };
  const [yukHata, setYukHata] = useState("");
  const yukle = useCallback(async () => {
    const r = await fetch(`/api/admin/satis/${encodeURIComponent(no)}`);
    if (r.ok) return al(await r.json());
    setYukHata(r.status === 401 || r.status === 403 ? "oturum" : r.status === 404 ? "Dosya bulunamadı." : "Dosya açılamadı; sayfayı yenileyin.");
  }, [no]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- açılışta veriler bir kez okunur
    yukle();
  }, [yukle]);

  const set = <K extends keyof DosyaData>(k: K, v: DosyaData[K]) => {
    setData((d) => (d ? { ...d, [k]: v } : d));
    setKirli(true);
  };
  const setKalem = (id: string, patch: Partial<Kalem>) => set("kalemler", (data?.kalemler ?? []).map((k) => (k.id === id ? { ...k, ...patch, otel: patch.otel ? { ...(k.otel ?? { ad: "" }), ...patch.otel } : k.otel } : k)));
  // Kişi başı fiyatlanan kalemler: adet = kişi sayısı, birim = kişi başı fiyat. 15 Ekim (kullanıcı): ziyaret turu ve transfer
  // araç bazlı; adet = araç sayısı, birim = araç başı fiyat
  const kisiBasi = (k: Kalem) => ["vize", "tren"].includes(k.tur);
  const aracBasi = (k: Kalem) => ["tur", "transfer"].includes(k.tur);
  const adetEtiketi = (k: Kalem) => (kisiBasi(k) ? "Kişi" : aracBasi(k) ? "Araç" : "Adet");
  const birimEtiketi = (k: Kalem, ne: "satış" | "alış") => `${kisiBasi(k) ? "Kişi başı" : aracBasi(k) ? "Araç başı" : "Birim"} ${ne} $`;
  const yuvarla = (n: number) => Math.round(n * 100) / 100;
  const kalemEkle = (tur: KalemTur, extra: Partial<Kalem> = {}) => {
    const kisiSayisi = (data?.yetiskin ?? 1) + (data?.cocuk ?? 0);
    const base: Kalem = { id: uid(), tur, ad: KALEM_TURLERI[tur].label, adet: tur.startsWith("otel_") ? 1 : ["vize", "tren"].includes(tur) ? kisiSayisi : 1, birim: 0, ...extra };
    if (tur.startsWith("otel_")) base.otel = { ad: "", giris: tur === "otel_mekke" ? data?.gidis : undefined, cikis: tur === "otel_medine" ? data?.donus : undefined, oda: "" };
    set("kalemler", [...(data?.kalemler ?? []), base]);
  };

  const kaydet = async (ek: Record<string, unknown> = {}) => {
    if (!data) return null;
    setBusy(true);
    setDurum("");
    const r = await fetch(`/api/admin/satis/${encodeURIComponent(no)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, data, ...kisi, bildir, ...ek }) });
    setBusy(false);
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return setDurum(d.error || "Kaydedilemedi."), null;
    al(d);
    setDurum(d.bildirim && d.bildirim !== "hata" ? `Kaydedildi; ${d.bildirim} adresine e-posta gitti.` : d.bildirim === "hata" ? "Kaydedildi; e-posta gönderilemedi." : "Kaydedildi.");
    return { ...(y as Yanit), ...d } as Yanit;
  };
  const islem = async (body: Record<string, unknown>) => {
    const r = await fetch(`/api/admin/satis/${encodeURIComponent(no)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (r.ok) {
      const d = await r.json();
      setY((o) => (o ? { ...o, ...d } : o));
      setData((cur) => (cur ? { ...cur, gecmis: d.dosya.data.gecmis, teklifGonderildi: d.dosya.data.teklifGonderildi } : cur));
      setStatus(d.dosya.status);
    }
  };

  const mesajAc = async (tur: "teklif" | "voucher") => {
    const d = kirli ? await kaydet() : y;
    if (!d) return;
    setMesaj({ tur, metin: tur === "teklif" ? teklifMesaji(d.dosya) : voucherMesaji(d.dosya) });
  };

  const belgeYukle = async (f: File) => {
    if (!y) return;
    if (f.size > 3.5 * 1024 * 1024) return setDurum("Belge en fazla 3,5 MB olabilir.");
    const base64 = await new Promise<string>((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(String(fr.result).split(",")[1] ?? "");
      fr.onerror = rej;
      fr.readAsDataURL(f);
    });
    const r = await fetch("/api/admin/satis/belge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dosyaId: y.dosya.id, ad: f.name, tur: belgeTur, mime: f.type, base64 }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return setDurum(d.error || "Yüklenemedi.");
    setY({ ...y, belgeler: d.belgeler });
  };

  const hesap = useMemo(() => (data ? { t: toplam(data), g: genelToplam(data), kdv: kdvTutari(data), a: alisToplam(data), o: odenen(data), dag: odemeDagilimi(data) } : null), [data]);
  if (yukHata) return (
    <div className="p-8 text-sm text-on-surface">
      {yukHata === "oturum" ? <>Oturumunuzun süresi dolmuş ya da bu sayfaya yetkiniz yok. <Link href="/admin/login" className="font-bold text-primary underline">Yeniden giriş yapın</Link>.</> : yukHata}
    </div>
  );
  if (!y || !data || !hesap) return <div className="p-8 text-xs text-on-surface-variant">Dosya yükleniyor…</div>;
  const d = y.dosya;
  const tel = waNumara(kisi.phone);
  const kisiSayisi = data.yetiskin + data.cocuk;

  return (
    <div className="min-h-screen bg-surface pb-28 text-on-surface">
      {/* Başlık */}
      <div className="border-b border-outline-variant/15 bg-surface-container-lowest px-6 py-5 lg:px-8">
        <Link href="/admin/satis" className="text-xs font-bold text-outline hover:text-primary">← Satış masası</Link>
        <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs font-bold text-secondary">{d.no}{data.satisTuru && <span className="ml-2 font-sans font-semibold text-on-surface-variant">· {SATIS_TURLERI[data.satisTuru]}</span>}</p>
            <h1 className="font-headline text-2xl font-bold text-primary">{data.musteriAdi}</h1>
            <p className="text-xs text-on-surface-variant">{kisiSayisi} kişi{data.gidis ? ` · ${trTarih(data.gidis)} – ${trTarih(data.donus)}` : ""}{hesap.g ? ` · ${usd(hesap.g)}` : ""}{y.bagliUye ? " · profile bağlı" : ""}</p>
            {/* Teklif bağlantısı açıldı mı (21 Ekim): müşterinin açışları; bot, önizleme ve admin sayılmaz */}
            {(y.acilislar?.length ?? 0) > 0 ? (
              <p className="mt-1.5 inline-flex rounded-lg bg-secondary/10 px-2.5 py-1 text-[11px] font-bold text-secondary">
                Müşteri teklifi açtı · {y.acilislar!.length} kez · son {new Date(y.acilislar![0].at).toLocaleString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} ({y.acilislar![0].cihaz})
              </p>
            ) : data.teklifGonderildi ? (
              <p className="mt-1.5 inline-flex rounded-lg bg-[#fef3c7] px-2.5 py-1 text-[11px] font-bold text-[#92400e]">Teklif gönderildi, müşteri henüz açmadı</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => mesajAc("teklif")} disabled={!data.kalemler.length} className="rounded-xl bg-[#25D366] px-4 py-2 text-xs font-bold text-white disabled:opacity-40">Teklifi WhatsApp&apos;tan gönder</button>
            <span className="flex flex-col items-center">
              <button type="button" onClick={() => mesajAc("voucher")} disabled={!onaylandiMi(status)} className="rounded-xl border border-[#25D366] px-4 py-2 text-xs font-bold text-[#1a8f47] disabled:opacity-40">Voucher gönder</button>
              {!onaylandiMi(status) && <span className="mt-1 text-[10px] text-outline">Onaylandıktan sonra açılır</span>}
            </span>
            <a href={`${teklifLinki(d).replace("https://hadiumreyegidelim.com", "")}?onizleme=1`} target="_blank" className="rounded-xl border border-outline-variant/25 px-3 py-2 text-xs font-bold text-primary">Teklif sayfası</a>
            {onaylandiMi(status) && <a href={voucherLinki(d).replace("https://hadiumreyegidelim.com", "")} target="_blank" className="rounded-xl border border-outline-variant/25 px-3 py-2 text-xs font-bold text-primary">Voucher</a>}
          </div>
        </div>
        {/* Aşamalar */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {ASAMALAR.map((a) => {
            const i = asamaIndex(a.key);
            const cur = status !== "iptal" ? asamaIndex(status) : -1;
            return (
              <button key={a.key} type="button" onClick={() => { setStatus(a.key); setKirli(true); }} className={`rounded-lg border px-3 py-1.5 text-[11px] font-bold transition ${status === a.key ? "border-primary bg-primary text-white" : i < cur ? "border-secondary/30 bg-secondary/10 text-secondary" : "border-outline-variant/25 bg-surface-container-lowest text-on-surface-variant"}`}>
                {i < cur ? "✓ " : ""}{a.label}
              </button>
            );
          })}
          <button type="button" onClick={() => { setStatus(status === "iptal" ? "talep" : "iptal"); setKirli(true); }} className={`ml-2 rounded-lg px-3 py-1.5 text-[11px] font-bold ${status === "iptal" ? "bg-error text-white" : "text-outline hover:text-error"}`}>{status === "iptal" ? "İptal (geri al)" : "İptal et"}</button>
        </div>
        <div className="mt-4 flex gap-1 overflow-x-auto">
          {SEKMELER.map((s) => (
            <button key={s} type="button" onClick={() => setSekme(s)} className={`rounded-lg px-4 py-2 text-xs font-bold ${sekme === s ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-surface-container-low"}`}>{s}{s === "Belgeler" && y.belgeler.length ? ` (${y.belgeler.length})` : ""}</button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-4 p-6 lg:p-8">
        {sekme === "Teklif" && (
          <>
            <Kart baslik="Yolcular ve tarihler">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
                <label><span className={lbl}>Yetişkin</span><input type="number" min={1} className={inp} value={data.yetiskin} onChange={(e) => set("yetiskin", Number(e.target.value) || 1)} /></label>
                <label><span className={lbl}>Çocuk</span><input type="number" min={0} className={inp} value={data.cocuk} onChange={(e) => set("cocuk", Number(e.target.value) || 0)} /></label>
                <label><span className={lbl}>Bebek</span><input type="number" min={0} className={inp} value={data.bebek} onChange={(e) => set("bebek", Number(e.target.value) || 0)} /></label>
                <label><span className={lbl}>Gidiş</span><input type="date" className={inp} value={data.gidis ?? ""} onChange={(e) => set("gidis", e.target.value)} /></label>
                <label><span className={lbl}>Dönüş</span><input type="date" min={data.gidis || undefined} className={`${inp} ${tarihTers(data.gidis, data.donus) ? "!border-error" : ""}`} value={data.donus ?? ""} onChange={(e) => set("donus", e.target.value)} /></label>
                <label><span className={lbl}>Önce</span><select className={inp} value={data.onceSehir ?? "mekke"} onChange={(e) => set("onceSehir", e.target.value as "mekke" | "medine")}><option value="mekke">Mekke</option><option value="medine">Medine</option></select></label>
              </div>
              {tarihTers(data.gidis, data.donus) && <p className="mt-3 rounded-lg bg-error/10 px-3 py-2 text-xs font-semibold text-error">Dönüş tarihi gidişten önce görünüyor ({trTarih(data.gidis)} → {trTarih(data.donus)}). Ay ya da yılı kontrol edin.</p>}
              {data.talepNotu && <p className="mt-3 rounded-lg bg-surface-container-low px-3 py-2 text-xs text-on-surface-variant"><b>Talep notu:</b> {data.talepNotu}</p>}
            </Kart>

            <Kart baslik="Teklif kalemleri" aciklama="Fiyatlar satış fiyatıdır ($). Alış sütununu yalnızca siz görürsünüz. Otel: gecelik oda fiyatı × oda × gece.">
              <div className="space-y-2">
                {data.kalemler.length === 0 && <p className="rounded-lg border border-dashed border-outline-variant/40 p-6 text-center text-xs text-outline">Aşağıdaki düğmelerle otel, vize, transfer ve diğer kalemleri ekleyin.</p>}
                {data.kalemler.map((k) => {
                  const otel = k.tur.startsWith("otel_");
                  const sehir = k.tur === "otel_mekke" ? "mekke" : "medine";
                  const g = geceSayisi(k.otel?.giris, k.otel?.cikis);
                  return (
                    <div key={k.id} className="rounded-xl border border-outline-variant/15 bg-surface-container-low/50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{KALEM_TURLERI[k.tur].label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-on-surface-variant">{k.birim ? (otel ? `${k.adet} oda × ${faturaGece(k)} gece × ${usd(k.birim)}` : aracBasi(k) ? `${k.adet} araç × ${usd(k.birim)}` : k.adet > 1 ? `${k.adet} × ${usd(k.birim)}` : "") : ""}</span>
                          <span className="font-mono text-sm font-bold text-primary">{usd(kalemToplam(k))}</span>
                          <button type="button" onClick={() => set("kalemler", data.kalemler.filter((x) => x.id !== k.id))} className="text-xs text-outline hover:text-error">sil</button>
                        </div>
                      </div>
                      {otel ? (
                        <>
                        <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-[2fr_1fr_64px_1fr_64px_1.1fr_1fr_1fr]">
                          <label><span className={lbl}>Otel</span>
                            <select className={inp} value={k.otel?.slug ?? (k.otel?.ad ? "__elle" : "")} onChange={(e) => { const h = y.oteller.find((o) => o.slug === e.target.value); setKalem(k.id, { otel: { slug: h?.slug, ad: h?.ad ?? "" }, ad: h?.ad ?? KALEM_TURLERI[k.tur].label }); }}>
                              <option value="">Seçin</option>
                              {y.oteller.filter((o) => o.sehir === sehir).map((o) => <option key={o.slug} value={o.slug}>{o.ad}{o.kabe ? ` · ${o.kabe} m` : ""}</option>)}
                              <option value="__elle">Listede yok, elle yaz</option>
                            </select>
                            {!k.otel?.slug && <input className={`${inp} mt-1`} placeholder="Otel adı" value={k.otel?.ad ?? ""} onChange={(e) => setKalem(k.id, { otel: { ad: e.target.value }, ad: e.target.value })} />}
                          </label>
                          <label><span className={lbl}>Giriş</span><input type="date" className={inp} value={k.otel?.giris ?? ""} onChange={(e) => {
                            // Giriş değişince gece sayısı korunur, çıkış kayar (28 Ekim: ters tarih olmasın)
                            const yeni = e.target.value; const eski = g;
                            setKalem(k.id, { otel: { ad: k.otel?.ad ?? "", giris: yeni, ...(yeni && eski ? { cikis: gunEkle(yeni, eski) } : {}) } });
                          }} /></label>
                          <label><span className={lbl}>Gece</span><input type="number" min={1} className={inp} value={g || ""} placeholder="—" disabled={!k.otel?.giris} title={k.otel?.giris ? "Gece sayısını yazın, çıkış tarihi hesaplanır" : "Önce giriş tarihini seçin"}
                            onChange={(e) => { const n = Number(e.target.value); if (k.otel?.giris && n > 0) setKalem(k.id, { otel: { ad: k.otel?.ad ?? "", cikis: gunEkle(k.otel.giris, n) } }); }} /></label>
                          <label><span className={lbl}>Çıkış</span><input type="date" min={k.otel?.giris ? gunEkle(k.otel.giris, 1) : undefined} className={`${inp} ${tarihTers(k.otel?.giris, k.otel?.cikis) ? "!border-error" : ""}`} value={k.otel?.cikis ?? ""} onChange={(e) => setKalem(k.id, { otel: { ad: k.otel?.ad ?? "", cikis: e.target.value } })} /></label>
                          <label><span className={lbl}>Oda</span><input type="number" min={1} className={inp} value={k.adet} onChange={(e) => setKalem(k.id, { adet: Number(e.target.value) || 1 })} /></label>
                          <label><span className={lbl}>Oda tipi</span><input className={inp} placeholder="2 kişilik" value={k.otel?.oda ?? ""} onChange={(e) => setKalem(k.id, { otel: { ad: k.otel?.ad ?? "", oda: e.target.value } })} /></label>
                          <label><span className={lbl}>Gecelik satış $</span><input type="number" min={0} className={inp} value={k.birim || ""} onChange={(e) => setKalem(k.id, { birim: Number(e.target.value) || 0 })} /></label>
                          <label><span className={lbl}>Gecelik alış $</span><input type="number" min={0} className={inp} value={k.alis || ""} onChange={(e) => setKalem(k.id, { alis: Number(e.target.value) || 0 })} /></label>
                        </div>
                        {tarihTers(k.otel?.giris, k.otel?.cikis) && (
                          <p className="mt-2 rounded-lg bg-error/10 px-3 py-2 text-xs font-semibold text-error">Çıkış ({trTarih(k.otel?.cikis)}) girişten ({trTarih(k.otel?.giris)}) önce; bu otel 0 gece sayılıyor. Çıkış tarihini düzeltin ya da “Gece” kutusuna gece sayısını yazın.</p>
                        )}
                        </>
                      ) : (
                        <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-[1.4fr_1.4fr_64px_1fr_1fr_1fr_1fr]">
                          <label><span className={lbl}>Hizmet</span><input className={inp} value={k.ad} onChange={(e) => setKalem(k.id, { ad: e.target.value })} /></label>
                          {k.tur === "tur" ? (
                            <label><span className={lbl}>Rota (müşteri durakları görür)</span>
                              <select className={inp} value={k.rota ?? ""} onChange={(e) => { const r = e.target.value as "mekke" | "medine" | ""; setKalem(k.id, r ? { rota: r, ad: ZIYARET_ROTALARI[r].ad, aciklama: undefined } : { rota: undefined }); }}>
                                <option value="mekke">Mekke ziyaret turu ({durakSayisi(ZIYARET_ROTALARI.mekke)} durak)</option>
                                <option value="medine">Medine ziyaret turu ({durakSayisi(ZIYARET_ROTALARI.medine)} durak)</option>
                                <option value="">Özel tur (açıklamayla)</option>
                              </select>
                              {!k.rota && <input className={`${inp} mt-1`} placeholder="Açıklama" value={k.aciklama ?? ""} onChange={(e) => setKalem(k.id, { aciklama: e.target.value })} />}
                            </label>
                          ) : (
                            <label><span className={lbl}>Açıklama (müşteri görür)</span><input className={inp} value={k.aciklama ?? ""} onChange={(e) => setKalem(k.id, { aciklama: e.target.value })} /></label>
                          )}
                          <label><span className={lbl}>{adetEtiketi(k)}</span><input type="number" min={1} className={inp} value={k.adet} onChange={(e) => setKalem(k.id, { adet: Number(e.target.value) || 1 })} /></label>
                          <label><span className={lbl}>{birimEtiketi(k, "satış")}</span><input type="number" min={0} className={inp} value={k.birim || ""} onChange={(e) => setKalem(k.id, { birim: Number(e.target.value) || 0 })} /></label>
                          {/* 15 Ekim: Excel'deki toplamı yazınca birim fiyat kendiliğinden hesaplanır (toplam ÷ adet) */}
                          <label><span className={lbl}>Toplam satış $</span><input type="number" min={0} className={`${inp} font-bold`} value={k.birim ? yuvarla(k.birim * k.adet) : ""} onChange={(e) => setKalem(k.id, { birim: yuvarla((Number(e.target.value) || 0) / Math.max(1, k.adet)) })} /></label>
                          <label><span className={lbl}>{birimEtiketi(k, "alış")}</span><input type="number" min={0} className={inp} value={k.alis || ""} onChange={(e) => setKalem(k.id, { alis: Number(e.target.value) || 0 })} /></label>
                          <label><span className={lbl}>Toplam alış $</span><input type="number" min={0} className={inp} value={k.alis ? yuvarla(k.alis * k.adet) : ""} onChange={(e) => setKalem(k.id, { alis: yuvarla((Number(e.target.value) || 0) / Math.max(1, k.adet)) })} /></label>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(Object.keys(KALEM_TURLERI) as KalemTur[]).flatMap((t) =>
                  t === "tur"
                    ? (["mekke", "medine"] as const).map((r) => (
                        <button key={`tur-${r}`} type="button" onClick={() => kalemEkle("tur", { rota: r, ad: ZIYARET_ROTALARI[r].ad })} className="rounded-lg border border-primary/25 px-3 py-1.5 text-[11px] font-bold text-primary hover:bg-primary/5">+ {ZIYARET_ROTALARI[r].ad}</button>
                      ))
                    : [<button key={t} type="button" onClick={() => kalemEkle(t)} className="rounded-lg border border-primary/25 px-3 py-1.5 text-[11px] font-bold text-primary hover:bg-primary/5">+ {KALEM_TURLERI[t].label}</button>],
                )}
                {y.kutuphane.length > 0 && (
                  <select className={`${inp} w-60`} value="" onChange={(e) => { const s = y.kutuphane.find((x) => x.id === e.target.value); if (s) kalemEkle(KUT_TUR[s.kategori] ?? "diger", { ad: s.ad, birim: s.satis ?? 0, alis: s.alis || undefined }); }}>
                    <option value="">Hizmet kütüphanesinden ekle…</option>
                    {y.kutuphane.map((s) => <option key={s.id} value={s.id}>{s.ad}{s.satis ? ` · ${s.satis} $` : ""}</option>)}
                  </select>
                )}
              </div>
              <div className="mt-4 rounded-xl bg-surface-container-low p-4">
                <label className="mb-3 flex items-center gap-2 text-xs font-bold text-on-surface-variant">
                  <input type="checkbox" checked={!!data.kdv} onChange={(e) => set("kdv", e.target.checked)} />
                  Fiyatlara %{Math.round(KDV_ORANI * 100)} KDV ekle <span className="font-normal text-outline">(kalem fiyatları KDV hariç girilir; kartla ödemede ayrıca %{Math.round(KART_PAYI * 100)} kart payı)</span>
                </label>
                <div className="grid gap-3 md:grid-cols-4">
                  <div><p className={lbl}>KDV hariç</p><p className="font-mono text-lg font-bold">{usd(hesap.t)}</p></div>
                  <div><p className={lbl}>{KDV_ETIKETI}</p><p className="font-mono text-lg font-bold">{data.kdv ? usd(hesap.kdv) : "—"}</p></div>
                  <div><p className={lbl}>Toplam · havale/EFT</p><p className="font-mono text-lg font-bold text-primary">{usd(hesap.g)}</p></div>
                  <div><p className={lbl}>Toplam · kartla</p><p className="font-mono text-lg font-bold text-primary">{usd(kartla(hesap.g))}</p></div>
                </div>
              </div>
              <div className="mt-3 grid gap-3 rounded-xl bg-surface-container-low p-4 md:grid-cols-3">
                <div><p className={lbl}>Kişi başı (havale)</p><p className="font-mono text-lg font-bold">{kisiSayisi ? usd(hesap.g / kisiSayisi) : "—"}</p></div>
                <div><p className={lbl}>Alış</p><p className="font-mono text-lg font-bold text-on-surface-variant">{hesap.a ? usd(hesap.a) : "—"}</p></div>
                <div><p className={lbl}>Kâr (KDV hariç)</p><p className={`font-mono text-lg font-bold ${hesap.t - hesap.a >= 0 ? "text-secondary" : "text-error"}`}>{hesap.a ? `${usd(hesap.t - hesap.a)} · %${hesap.t ? Math.round(((hesap.t - hesap.a) / hesap.t) * 100) : 0}` : "—"}</p></div>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-[200px_1fr]">
                <label><span className={lbl}>Geçerlilik</span><input type="date" className={inp} value={data.gecerlilik ?? ""} onChange={(e) => set("gecerlilik", e.target.value)} /></label>
                <label><span className={lbl}>Teklif notu (mesajda ve teklif sayfasında)</span><input className={inp} value={data.teklifNotu ?? ""} onChange={(e) => set("teklifNotu", e.target.value)} placeholder="Fiyatlar müsaitliğe göre değişebilir…" /></label>
              </div>
              {data.teklifGonderildi && <p className="mt-2 text-[11px] text-secondary">Son gönderim: {new Date(data.teklifGonderildi).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}</p>}
            </Kart>
          </>
        )}

        {sekme === "Yolculuk" && (
          <>
            <Kart baslik="Uçuş" aciklama="Müşteri profilinden de ekleyebilir.">
              <div className="grid gap-3 md:grid-cols-2">
                <label><span className={lbl}>Gidiş uçuşu</span><input className={inp} value={data.ucusGidis ?? ""} onChange={(e) => set("ucusGidis", e.target.value)} placeholder="TK 98 · 14 Kas 09:40 → 13:05" /></label>
                <label><span className={lbl}>Dönüş uçuşu</span><input className={inp} value={data.ucusDonus ?? ""} onChange={(e) => set("ucusDonus", e.target.value)} /></label>
              </div>
            </Kart>
            <Kart baslik="Karşılama, rehber ve ulaşım">
              <div className="grid gap-3 md:grid-cols-3">
                <label><span className={lbl}>Karşılama noktası</span><input className={inp} value={data.karsilamaYeri ?? ""} onChange={(e) => set("karsilamaYeri", e.target.value)} placeholder="Cidde Havalimanı · Terminal 1" /></label>
                <label><span className={lbl}>Karşılayan kişi</span><input className={inp} value={data.karsilayanAd ?? ""} onChange={(e) => set("karsilayanAd", e.target.value)} /></label>
                <label><span className={lbl}>Telefonu (boşsa bizim hat)</span><input className={inp} value={data.karsilayanTel ?? ""} onChange={(e) => set("karsilayanTel", e.target.value)} /></label>
                <label><span className={lbl}>Hoca / rehber</span><input className={inp} value={data.rehberAd ?? ""} onChange={(e) => set("rehberAd", e.target.value)} /></label>
                <label><span className={lbl}>Hocanın telefonu</span><input className={inp} value={data.rehberTel ?? ""} onChange={(e) => set("rehberTel", e.target.value)} /></label>
                <label><span className={lbl}>Tren</span><input className={inp} value={data.tren ?? ""} onChange={(e) => set("tren", e.target.value)} placeholder="20 Kas · 10:30 · Mekke → Medine" /></label>
                <label className="md:col-span-3"><span className={lbl}>Dönüş transferi</span><input className={inp} value={data.donusTransfer ?? ""} onChange={(e) => set("donusTransfer", e.target.value)} placeholder="Otelden Medine Havalimanı'na özel araç" /></label>
              </div>
            </Kart>
            <Kart baslik="Otel onay numaraları" aciklama="Oteller teklif kalemlerinden gelir.">
              {data.kalemler.filter((k) => k.tur.startsWith("otel_")).length === 0 ? <p className="text-xs text-outline">Teklifte otel yok.</p> : (
                <div className="space-y-2">
                  {data.kalemler.filter((k) => k.tur.startsWith("otel_")).map((k) => (
                    <div key={k.id} className="grid items-center gap-2 md:grid-cols-[2fr_1fr]">
                      <p className="text-xs font-bold">{k.otel?.ad || KALEM_TURLERI[k.tur].label} <span className="font-normal text-outline">· {trTarih(k.otel?.giris, { day: "numeric", month: "short" })} – {trTarih(k.otel?.cikis, { day: "numeric", month: "short" })}</span></p>
                      <input className={inp} placeholder="Onay no" value={k.otel?.onayNo ?? ""} onChange={(e) => setKalem(k.id, { otel: { ad: k.otel?.ad ?? "", onayNo: e.target.value } })} />
                    </div>
                  ))}
                </div>
              )}
            </Kart>
            <Kart baslik="Müşteriye not" aciklama="Profilde ve voucher'da görünür.">
              <textarea className={`${inp} min-h-20`} value={data.musteriyeNot ?? ""} onChange={(e) => set("musteriyeNot", e.target.value)} placeholder="Havalimanında çıkışta isminizin yazılı olduğu kartla bekleyeceğiz…" />
            </Kart>
          </>
        )}

        {sekme === "Ödeme" && (
          <>
            <Kart baslik="Ödeme planı">
              <div className="flex flex-wrap gap-2">
                {(["tek", "bolunmus"] as const).map((p) => (
                  <button key={p} type="button" onClick={() => set("odemePlani", p)} className={`rounded-xl border px-4 py-2 text-xs font-bold ${data.odemePlani === p ? "border-primary bg-primary text-white" : "border-outline-variant/25"}`}>{p === "tek" ? "Tek seferde" : "Bölünmüş (önden + Cidde'de)"}</button>
                ))}
              </div>
              {data.odemePlani === "bolunmus" && (
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl bg-surface-container-low p-3"><p className={lbl}>Önden (otel, vize, hocanın yarısı)</p><p className="font-mono text-lg font-bold">{usd(hesap.dag.onden)}</p></div>
                  <div className="rounded-xl bg-surface-container-low p-3"><p className={lbl}>Cidde&apos;de (transfer, hocanın yarısı)</p><p className="font-mono text-lg font-bold">{usd(hesap.dag.varis)}</p></div>
                </div>
              )}
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div><p className={lbl}>Toplam{data.kdv ? " (KDV dahil)" : ""}</p><p className="font-mono text-lg font-bold">{usd(hesap.g)}</p></div>
                <div><p className={lbl}>Alınan</p><p className="font-mono text-lg font-bold text-secondary">{usd(hesap.o)}</p></div>
                <div><p className={lbl}>Kalan</p><p className={`font-mono text-lg font-bold ${hesap.g - hesap.o > 0.5 ? "text-error" : "text-secondary"}`}>{usd(Math.max(0, hesap.g - hesap.o))}</p>{hesap.g - hesap.o > 0.5 && <p className="text-[11px] text-outline">Kartla: {usd(kartla(hesap.g - hesap.o))}</p>}</div>
              </div>
            </Kart>
            <Kart baslik="Alınan ödemeler">
              <div className="space-y-1.5">
                {data.odemeler.length === 0 && <p className="text-xs text-outline">Henüz ödeme kaydı yok.</p>}
                {data.odemeler.map((o) => (
                  <div key={o.id} className="flex flex-wrap items-center gap-3 rounded-lg bg-surface-container-low px-3 py-2 text-xs">
                    <span className="font-mono">{trTarih(o.tarih, { day: "numeric", month: "short", year: "numeric" })}</span>
                    <b className="font-mono">{usd(o.tutar)}</b>
                    {o.kartPayi ? <span className="text-outline">+ {usd(o.kartPayi)} kart payı = {usd(o.tutar + o.kartPayi)} çekildi</span> : null}
                    <span>{o.yontem === "havale" ? "Havale/EFT" : o.yontem === "kart" ? "Kart" : "Nakit"}</span>
                    <span className="text-outline">{o.yer === "cidde" ? "Cidde'de" : "Önden"}</span>
                    <span className="flex-1 text-on-surface-variant">{o.aciklama}</span>
                    <button type="button" onClick={() => set("odemeler", data.odemeler.filter((x) => x.id !== o.id))} className="text-outline hover:text-error">sil</button>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-[140px_110px_130px_130px_1fr_auto]">
                <input type="date" className={inp} value={yeniOdeme.tarih} onChange={(e) => setYeniOdeme({ ...yeniOdeme, tarih: e.target.value })} />
                <input type="number" min={0} className={inp} placeholder="Borçtan düşen $" value={yeniOdeme.tutar || ""} onChange={(e) => setYeniOdeme({ ...yeniOdeme, tutar: Number(e.target.value) || 0 })} />
                <select className={inp} value={yeniOdeme.yontem} onChange={(e) => setYeniOdeme({ ...yeniOdeme, yontem: e.target.value as Odeme["yontem"] })}><option value="havale">Havale/EFT</option><option value="kart">Kart</option><option value="nakit">Nakit</option></select>
                <select className={inp} value={yeniOdeme.yer} onChange={(e) => setYeniOdeme({ ...yeniOdeme, yer: e.target.value as Odeme["yer"] })}><option value="onden">Önden</option><option value="cidde">Cidde&apos;de</option></select>
                <input className={inp} placeholder="Açıklama" value={yeniOdeme.aciklama ?? ""} onChange={(e) => setYeniOdeme({ ...yeniOdeme, aciklama: e.target.value })} />
                <button type="button" disabled={!yeniOdeme.tutar} onClick={() => { set("odemeler", [...data.odemeler, { ...yeniOdeme, id: uid(), kartPayi: yeniOdeme.yontem === "kart" ? kartPayiOf(yeniOdeme.tutar) : undefined }]); setYeniOdeme({ ...yeniOdeme, tutar: 0, aciklama: "" }); }} className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-40">Ekle</button>
              </div>
              {yeniOdeme.yontem === "kart" && yeniOdeme.tutar > 0 && <p className="mt-2 text-[11px] text-on-surface-variant">Karttan çekilecek: <b>{usd(kartla(yeniOdeme.tutar))}</b> ({usd(yeniOdeme.tutar)} + %{Math.round(KART_PAYI * 100)} kart payı {usd(kartPayiOf(yeniOdeme.tutar))})</p>}
            </Kart>
          </>
        )}

        {sekme === "Belgeler" && (
          <Kart baslik="Belgeler" aciklama="Vize, otel belgesi, bilet. Yalnızca dosyanın sahibi üye indirebilir (en fazla 3,5 MB).">
            <div className="flex flex-wrap items-center gap-2">
              <select className={`${inp} w-40`} value={belgeTur} onChange={(e) => setBelgeTur(e.target.value)}>
                <option value="vize">Vize</option><option value="otel">Otel belgesi</option><option value="tren">Tren bileti</option><option value="ucak">Uçak bileti</option><option value="diger">Diğer</option>
              </select>
              <label className="cursor-pointer rounded-lg border border-dashed border-primary/40 px-3 py-2 text-xs font-bold text-primary">
                PDF ya da fotoğraf seç
                <input type="file" accept="application/pdf,image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) belgeYukle(f); e.target.value = ""; }} />
              </label>
            </div>
            <div className="mt-3 space-y-1.5">
              {y.belgeler.length === 0 && <p className="text-xs text-outline">Henüz belge yok.</p>}
              {y.belgeler.map((b) => (
                <div key={b.id} className="flex items-center gap-3 rounded-lg bg-surface-container-low px-3 py-2 text-xs">
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">{b.tur}</span>
                  <span className="flex-1 truncate">{b.ad}</span>
                  <span className="text-outline">{Math.round(b.boyut / 1024)} KB</span>
                  <button type="button" onClick={async () => { if (!confirm("Belge silinsin mi?")) return; const r = await fetch(`/api/admin/satis/belge?id=${b.id}&dosyaId=${d.id}`, { method: "DELETE" }); if (r.ok) setY({ ...y, belgeler: (await r.json()).belgeler }); }} className="text-outline hover:text-error">sil</button>
                </div>
              ))}
            </div>
          </Kart>
        )}

        {sekme === "Müşteri" && (
          <>
            <Kart baslik="İletişim">
              <div className="grid gap-3 md:grid-cols-3">
                <label><span className={lbl}>Ad soyad</span>
                  <span className="flex gap-1.5">
                    <input className={inp} value={data.musteriAdi} onChange={(e) => set("musteriAdi", e.target.value)} />
                    <select className={`${inp} w-24`} value={data.hitap ?? ""} onChange={(e) => set("hitap", (e.target.value || undefined) as DosyaData["hitap"])} title="Teklif, voucher ve mesajlarda hitap">
                      <option value="">Hitap</option>
                      <option value="hanim">Hanım</option>
                      <option value="bey">Bey</option>
                    </select>
                  </span>
                </label>
                <label><span className={lbl}>Telefon (WhatsApp)</span><input className={inp} value={kisi.phone} onChange={(e) => { setKisi({ ...kisi, phone: e.target.value }); setKirli(true); }} /></label>
                <label><span className={lbl}>E-posta (profil eşleşmesi)</span><input className={inp} value={kisi.email} onChange={(e) => { setKisi({ ...kisi, email: e.target.value }); setKirli(true); }} /></label>
                <label className="md:col-span-2"><span className={lbl}>Talep notu</span><input className={inp} value={data.talepNotu ?? ""} onChange={(e) => set("talepNotu", e.target.value)} /></label>
                <label><span className={lbl}>Sorumlu</span><select className={inp} value={kisi.sorumluId} onChange={(e) => { setKisi({ ...kisi, sorumluId: e.target.value }); setKirli(true); }}><option value="">—</option>{y.ekip.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
              </div>
            </Kart>
            <Kart baslik="Profil" aciklama="Dosya, e-postası doğrulanmış aynı e-postalı üyeye kendiliğinden bağlanır. Telefonla eşleşen üyeyi buradan bağlayın.">
              {y.bagliUye ? (
                <p className="text-xs">Bağlı üye: <b>{y.bagliUye.name}</b> ({y.bagliUye.email}) <button type="button" onClick={() => islem({ action: "link", userId: null })} className="ml-2 text-outline underline">kaldır</button></p>
              ) : y.oneri.length ? (
                <div className="flex flex-wrap gap-2">{y.oneri.map((u) => <button key={u.id} type="button" onClick={() => islem({ action: "link", userId: u.id })} className="rounded-lg border border-secondary/30 px-3 py-1.5 text-xs font-bold text-secondary">{u.name} · {u.email} → bağla</button>)}</div>
              ) : (
                <p className="text-xs text-outline">Bu telefon ya da e-postayla üye yok. Müşteriye üye olmasını söyleyebilirsiniz: hadiumreyegidelim.com/profil/uye-ol</p>
              )}
            </Kart>
          </>
        )}

        {sekme === "Geçmiş" && (
          <Kart baslik="Dosya geçmişi">
            <div className="flex gap-2">
              <input className={inp} placeholder="Not ekle (müşteri görmez)" value={not} onChange={(e) => setNot(e.target.value)} />
              <button type="button" disabled={!not.trim()} onClick={async () => { await islem({ action: "not", metin: not }); setNot(""); }} className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-40">Ekle</button>
            </div>
            <ol className="mt-4 space-y-2">
              {[...data.gecmis, ...(y.acilislar ?? []).map((a) => ({ id: a.id, t: a.at, kim: "müşteri", metin: `Müşteri teklifi açtı${a.cihaz ? ` (${a.cihaz})` : ""}` }))]
                .sort((a, b) => a.t.localeCompare(b.t))
                .reverse()
                .map((g) => (
                <li key={g.id} className="flex gap-3 text-xs">
                  <span className="w-28 shrink-0 font-mono text-outline">{new Date(g.t).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  <span className="flex-1">{g.metin}</span>
                  <span className="text-outline">{g.kim}</span>
                </li>
              ))}
            </ol>
          </Kart>
        )}
      </div>

      {/* Kaydet çubuğu */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-outline-variant/15 bg-surface-container-lowest/95 px-6 py-3 backdrop-blur lg:pl-[300px]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-end gap-3">
          {durum && <span className="text-xs font-bold text-secondary">{durum}</span>}
          {kirli && <span className="text-xs text-outline">Kaydedilmemiş değişiklik var</span>}
          {status !== d.status && <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={bildir} onChange={(e) => setBildir(e.target.checked)} />Aşama değişikliğini müşteriye e-postayla bildir ({asamaLabel(status)})</label>}
          <button type="button" disabled={busy || !kirli} onClick={() => kaydet()} className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white disabled:opacity-40">{busy ? "Kaydediliyor…" : "Kaydet"}</button>
        </div>
      </div>

      {mesaj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={(e) => { if (e.target === e.currentTarget) setMesaj(null); }}>
          <div className="w-full max-w-lg rounded-2xl bg-surface-container-lowest p-6 shadow-2xl">
            <h2 className="font-headline text-lg font-bold text-primary">{mesaj.tur === "teklif" ? "Teklif mesajı" : "Voucher mesajı"}</h2>
            <p className="text-xs text-on-surface-variant">İsterseniz düzenleyin; WhatsApp&apos;ta hazır açılır, siz gönderirsiniz.</p>
            <textarea className={`${inp} mt-3 min-h-72 font-sans text-[13px] leading-relaxed`} value={mesaj.metin} onChange={(e) => setMesaj({ ...mesaj, metin: e.target.value })} />
            {!tel && <p className="mt-2 text-xs font-bold text-error">Telefon numarası yok ya da geçersiz; Müşteri sekmesinden ekleyin ya da mesajı kopyalayın.</p>}
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setMesaj(null)} className="rounded-xl border border-outline-variant/25 px-4 py-2 text-xs font-bold">Kapat</button>
              <button type="button" onClick={async () => { await navigator.clipboard.writeText(mesaj.metin).catch(() => {}); setDurum("Mesaj kopyalandı."); }} className="rounded-xl border border-outline-variant/25 px-4 py-2 text-xs font-bold text-primary">Kopyala</button>
              {tel && (
                <a href={waLink(tel, mesaj.metin)} target="_blank" rel="noopener noreferrer" onClick={() => { islem({ action: mesaj.tur === "teklif" ? "teklif_gonderildi" : "voucher_gonderildi" }); setMesaj(null); }} className="rounded-xl bg-[#25D366] px-4 py-2 text-xs font-bold text-white">WhatsApp&apos;ta aç</a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
