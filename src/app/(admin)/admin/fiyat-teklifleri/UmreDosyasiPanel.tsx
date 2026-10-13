"use client";
// Teklif sayfasındaki "Umre dosyası" bölümü (13 Ekim): satışı yapan kişi kabul edilen teklifin operasyon bilgilerini
// doldurur; müşteri profilinde (Umrelerim) görür. Aşama değişince istenirse müşteriye e-posta gider.
import { useCallback, useEffect, useState } from "react";

type Asama = { key: string; label: string };
type Otel = { slug: string; ad: string; sehir: "mekke" | "medine"; kabe: number | null };
type OtelBilgi = { slug?: string; ad: string; giris?: string; cikis?: string; onayNo?: string; oda?: string };
type Data = Record<string, unknown> & { mekke?: OtelBilgi; medine?: OtelBilgi; asamaTarihleri?: Record<string, string> };
type Dosya = { id: string; no: string; userId: string | null; email: string | null; phone: string | null; status: string; data: Data };
type Belge = { id: string; ad: string; tur: string; boyut: number };
type Uye = { id: string; name: string; email: string; phone?: string | null };
type Yanit = { teklif: { quotationNo: string; customerName: string; status: string }; dosya: Dosya | null; belgeler: Belge[]; bagliUye: Uye | null; oneri: Uye[]; asamalar: Asama[]; oteller: Otel[] };

const TURLER: Record<string, string> = { vize: "Vize", otel: "Otel belgesi", tren: "Tren bileti", ucak: "Uçak bileti", diger: "Diğer" };
const input = "w-full bg-surface-container-lowest border border-outline-variant/25 text-on-surface rounded-lg p-2 text-xs outline-none focus:border-primary/40";
const label = "block text-[10px] font-bold text-outline uppercase mb-1";

function Bolum({ no, baslik, children }: { no: string; baslik: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-4">
      <p className="text-[10px] font-bold tracking-widest text-secondary">{no}</p>
      <h3 className="text-sm font-bold text-on-surface">{baslik}</h3>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">{children}</div>
    </section>
  );
}

export default function UmreDosyasiPanel({ quotationId }: { quotationId: string }) {
  const [y, setY] = useState<Yanit | null>(null);
  const [status, setStatus] = useState("onaylandi");
  const [data, setData] = useState<Data>({});
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bildir, setBildir] = useState(true);
  const [busy, setBusy] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const [belgeTur, setBelgeTur] = useState("vize");

  const yukle = useCallback(async () => {
    const r = await fetch(`/api/admin/umre/${quotationId}`);
    if (!r.ok) return;
    const d: Yanit = await r.json();
    setY(d);
    if (d.dosya) {
      setStatus(d.dosya.status);
      setData(d.dosya.data);
      setEmail(d.dosya.email ?? "");
      setPhone(d.dosya.phone ?? "");
    }
  }, [quotationId]);
  useEffect(() => {
    yukle();
  }, [yukle]);

  const post = async (body: Record<string, unknown>) => {
    setBusy(true);
    setMesaj("");
    try {
      const r = await fetch(`/api/admin/umre/${quotationId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return setMesaj(d.error || "Kaydedilemedi.");
      if (body.action !== "open" && body.action !== "link") setMesaj(d.bildirim && d.bildirim !== "hata" ? `Kaydedildi; ${d.bildirim} adresine e-posta gitti.` : d.bildirim === "hata" ? "Kaydedildi; e-posta gönderilemedi." : "Kaydedildi.");
      await yukle();
    } finally {
      setBusy(false);
    }
  };

  const set = (k: string, v: unknown) => setData((d) => ({ ...d, [k]: v }));
  const setOtel = (sehir: "mekke" | "medine", k: keyof OtelBilgi, v: string) => setData((d) => ({ ...d, [sehir]: { ...(d[sehir] ?? { ad: "" }), [k]: v } }));

  const belgeYukle = async (f: File) => {
    if (!y?.dosya) return;
    if (f.size > 3.5 * 1024 * 1024) return setMesaj("Dosya en fazla 3,5 MB olabilir.");
    const base64 = await new Promise<string>((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(String(fr.result).split(",")[1] ?? "");
      fr.onerror = rej;
      fr.readAsDataURL(f);
    });
    setBusy(true);
    const r = await fetch("/api/admin/umre/belge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dosyaId: y.dosya.id, ad: f.name, tur: belgeTur, mime: f.type, base64 }) });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setMesaj(d.error || "Yüklenemedi.");
    setY({ ...y, belgeler: d.belgeler });
  };

  const belgeSil = async (id: string) => {
    if (!y?.dosya || !confirm("Belge silinsin mi?")) return;
    const r = await fetch(`/api/admin/umre/belge?id=${id}&dosyaId=${y.dosya.id}`, { method: "DELETE" });
    const d = await r.json().catch(() => ({}));
    if (r.ok) setY({ ...y, belgeler: d.belgeler });
  };

  if (!y) return null;

  if (!y.dosya) {
    return (
      <div className="rounded-2xl border border-dashed border-secondary/40 bg-secondary/5 p-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">Umre dosyası</p>
        <h2 className="mt-1 font-headline text-lg font-bold text-on-surface">Teklif kabul edildiyse dosyayı açın</h2>
        <p className="mt-1 max-w-2xl text-xs text-on-surface-variant">Dosya açılınca teklif &quot;Kabul edildi&quot; olur ve müşteri, üye hesabı bağlandığında umresinin aşamalarını, otelini, karşılayan kişiyi ve belgelerini profilinde görür.</p>
        <button type="button" disabled={busy} onClick={() => post({ action: "open" })} className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white disabled:opacity-60">Umre dosyası aç</button>
      </div>
    );
  }

  const d = y.dosya;
  const otelSec = (sehir: "mekke" | "medine") => {
    const liste = y.oteller.filter((o) => o.sehir === sehir);
    const o = (data[sehir] ?? { ad: "" }) as OtelBilgi;
    return (
      <>
        <div>
          <label className={label}>{sehir === "mekke" ? "Mekke oteli" : "Medine oteli"}</label>
          <select
            className={input}
            value={o.slug ?? (o.ad ? "__elle" : "")}
            onChange={(e) => {
              const h = liste.find((x) => x.slug === e.target.value);
              setData((dd) => ({ ...dd, [sehir]: { ...(dd[sehir] ?? {}), slug: h?.slug, ad: h?.ad ?? (e.target.value === "__elle" ? (o.ad || "") : "") } }));
            }}
          >
            <option value="">Seçin</option>
            {liste.map((h) => <option key={h.slug} value={h.slug}>{h.ad}{h.kabe ? ` · ${h.kabe} m` : ""}</option>)}
            <option value="__elle">Listede yok, elle yazacağım</option>
          </select>
          {!o.slug && (o.ad !== undefined) && <input className={`${input} mt-1.5`} placeholder="Otel adı" value={o.ad ?? ""} onChange={(e) => setOtel(sehir, "ad", e.target.value)} />}
          <span className="mt-1 block text-[10px] text-outline">Rehberdeki otel seçilirse müşteri haritayı ve uzaklığı görür.</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className={label}>Giriş</label><input type="date" className={input} value={o.giris ?? ""} onChange={(e) => setOtel(sehir, "giris", e.target.value)} /></div>
          <div><label className={label}>Çıkış</label><input type="date" className={input} value={o.cikis ?? ""} onChange={(e) => setOtel(sehir, "cikis", e.target.value)} /></div>
          <div><label className={label}>Onay no</label><input className={input} value={o.onayNo ?? ""} onChange={(e) => setOtel(sehir, "onayNo", e.target.value)} /></div>
          <div><label className={label}>Oda</label><input className={input} placeholder="2 kişilik" value={o.oda ?? ""} onChange={(e) => setOtel(sehir, "oda", e.target.value)} /></div>
        </div>
      </>
    );
  };
  const str = (k: string) => (typeof data[k] === "string" ? (data[k] as string) : "");
  const num = (k: string) => (typeof data[k] === "number" ? String(data[k]) : "");

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-secondary/25 bg-secondary/5 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">Umre dosyası</p>
          <h2 className="font-headline text-xl font-bold text-primary">{d.no} · {String(data.musteriAdi ?? y.teklif.customerName)}</h2>
          {y.bagliUye ? (
            <p className="mt-0.5 text-xs text-secondary">Üye hesabına bağlı: <b>{y.bagliUye.name}</b> ({y.bagliUye.email}) · müşteri profilinde görüyor <button type="button" onClick={() => post({ action: "link", userId: null })} className="ml-2 text-outline underline">bağlantıyı kaldır</button></p>
          ) : y.oneri.length > 0 ? (
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
              Aynı telefon ya da e-postayla üye:
              {y.oneri.map((u) => (
                <button key={u.id} type="button" onClick={() => post({ action: "link", userId: u.id })} className="rounded-lg border border-secondary/30 bg-white px-2 py-1 font-bold text-secondary">
                  {u.name} · {u.email} → bağla
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-0.5 text-xs text-on-surface-variant">Henüz üye hesabına bağlı değil. Müşteri, aşağıdaki e-postayla üye olup adresini doğrularsa dosya kendiliğinden bağlanır.</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <button type="button" disabled={busy} onClick={() => post({ status, email, phone, data, bildir })} className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white disabled:opacity-60">{busy ? "Kaydediliyor…" : "Dosyayı kaydet"}</button>
          {mesaj && <span className="text-[11px] font-bold text-secondary">{mesaj}</span>}
        </div>
      </div>

      <Bolum no="01" baslik="Durum">
        <div className="md:col-span-2 flex flex-wrap gap-1.5">
          {y.asamalar.map((a) => (
            <button key={a.key} type="button" onClick={() => setStatus(a.key)} className={`rounded-lg px-3 py-1.5 text-[11px] font-bold border ${status === a.key ? "bg-primary text-white border-primary" : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/25"}`}>
              {a.label}
            </button>
          ))}
        </div>
        <label className="md:col-span-2 flex items-center gap-2 text-xs text-on-surface">
          <input type="checkbox" checked={bildir} onChange={(e) => setBildir(e.target.checked)} /> Aşama değişince müşteriye e-posta gönder
        </label>
      </Bolum>

      <Bolum no="02" baslik="Müşteri ve yolculuk">
        <div><label className={label}>Müşteri e-postası (profil eşleşmesi)</label><input className={input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@gmail.com" /></div>
        <div><label className={label}>Telefon</label><input className={input} value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className={label}>Yetişkin</label><input type="number" className={input} value={num("yetiskin")} onChange={(e) => set("yetiskin", Number(e.target.value) || 0)} /></div>
          <div><label className={label}>Çocuk</label><input type="number" className={input} value={num("cocuk")} onChange={(e) => set("cocuk", Number(e.target.value) || 0)} /></div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div><label className={label}>Gidiş</label><input type="date" className={input} value={str("gidis")} onChange={(e) => set("gidis", e.target.value)} /></div>
          <div><label className={label}>Dönüş</label><input type="date" className={input} value={str("donus")} onChange={(e) => set("donus", e.target.value)} /></div>
          <div><label className={label}>Önce</label><select className={input} value={str("onceSehir") || "mekke"} onChange={(e) => set("onceSehir", e.target.value)}><option value="mekke">Mekke</option><option value="medine">Medine</option></select></div>
        </div>
        <div><label className={label}>Gidiş uçuşu</label><input className={input} value={str("ucusGidis")} onChange={(e) => set("ucusGidis", e.target.value)} placeholder="Müşteri de ekleyebilir · TK 98, 14 Kas 09:40" /></div>
        <div><label className={label}>Dönüş uçuşu</label><input className={input} value={str("ucusDonus")} onChange={(e) => set("ucusDonus", e.target.value)} /></div>
      </Bolum>

      <Bolum no="03" baslik="Konaklama">
        {otelSec("mekke")}
        {otelSec("medine")}
      </Bolum>

      <Bolum no="04" baslik="Karşılama ve ulaşım">
        <div><label className={label}>Karşılama noktası</label><input className={input} value={str("karsilamaYeri")} onChange={(e) => set("karsilamaYeri", e.target.value)} placeholder="Cidde Havalimanı · Terminal 1" /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className={label}>Karşılayan kişi</label><input className={input} value={str("karsilayanAd")} onChange={(e) => set("karsilayanAd", e.target.value)} /></div>
          <div><label className={label}>Telefonu (boşsa bizim hat)</label><input className={input} value={str("karsilayanTel")} onChange={(e) => set("karsilayanTel", e.target.value)} /></div>
        </div>
        <div><label className={label}>Tren</label><input className={input} value={str("tren")} onChange={(e) => set("tren", e.target.value)} placeholder="20 Kas · 10:30 · Mekke → Medine · ekonomi" /></div>
        <div><label className={label}>Dönüş transferi</label><input className={input} value={str("donusTransfer")} onChange={(e) => set("donusTransfer", e.target.value)} placeholder="Otelden Medine Havalimanı'na" /></div>
      </Bolum>

      <Bolum no="05" baslik="Ödeme (müşteri görür)">
        <div className="grid grid-cols-2 gap-2">
          <div><label className={label}>Toplam ($)</label><input type="number" className={input} value={num("toplamUsd")} onChange={(e) => set("toplamUsd", Number(e.target.value) || 0)} /></div>
          <div><label className={label}>Ödenen ($)</label><input type="number" className={input} value={num("odenenUsd")} onChange={(e) => set("odenenUsd", Number(e.target.value) || 0)} /></div>
        </div>
        <div><label className={label}>Kalan için son tarih</label><input type="date" className={input} value={str("sonOdeme")} onChange={(e) => set("sonOdeme", e.target.value)} /></div>
      </Bolum>

      <Bolum no="06" baslik="Belgeler (yalnızca müşteri indirebilir)">
        <div className="md:col-span-2 flex flex-wrap items-center gap-2">
          <select className={`${input} w-40`} value={belgeTur} onChange={(e) => setBelgeTur(e.target.value)}>
            {Object.entries(TURLER).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <label className="cursor-pointer rounded-lg border border-dashed border-primary/40 px-3 py-2 text-xs font-bold text-primary">
            PDF ya da fotoğraf seç (en fazla 3,5 MB)
            <input type="file" accept="application/pdf,image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) belgeYukle(f); e.target.value = ""; }} />
          </label>
        </div>
        <div className="md:col-span-2 space-y-1.5">
          {y.belgeler.length === 0 && <p className="text-xs text-outline">Henüz belge yok.</p>}
          {y.belgeler.map((b) => (
            <div key={b.id} className="flex items-center gap-3 rounded-lg bg-surface-container-low px-3 py-2 text-xs">
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">{TURLER[b.tur] ?? b.tur}</span>
              <span className="flex-1 truncate text-on-surface">{b.ad}</span>
              <span className="text-outline">{Math.round(b.boyut / 1024)} KB</span>
              <button type="button" onClick={() => belgeSil(b.id)} className="text-outline hover:text-error">sil</button>
            </div>
          ))}
        </div>
      </Bolum>

      <Bolum no="07" baslik="Müşteriye not">
        <textarea className={`${input} md:col-span-2 min-h-20`} value={str("not")} onChange={(e) => set("not", e.target.value)} placeholder="Havalimanında çıkışta isminizin yazılı olduğu kartla bekleyeceğiz…" />
      </Bolum>
    </div>
  );
}
