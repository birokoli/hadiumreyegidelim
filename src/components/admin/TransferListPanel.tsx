"use client";
// Hizmet Kütüphanesi: transfer firmasının araç × rota listesini kataloğa yükler, araç görsellerini kaydeder.
import { useEffect, useState } from "react";

type Vehicle = { key: string; label: string; capacity: number; note: string };
type Status = { loaded: number; expected: number; oldPublic: number; vehicles: Vehicle[]; images: Record<string, string> };

export default function TransferListPanel({ onSynced }: { onSynced?: () => void }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [images, setImages] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(false);

  const load = () =>
    fetch("/api/admin/service-library/transfers")
      .then((r) => r.json())
      .then((d: Status) => { if (d.vehicles) { setStatus(d); setImages(d.images ?? {}); } })
      .catch(() => {});
  useEffect(() => { load(); }, []);

  const sync = async () => {
    setBusy("sync"); setMsg("");
    const r = await fetch("/api/admin/service-library/transfers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "sync" }) }).then((x) => x.json()).catch(() => ({ error: "Bağlantı hatası." }));
    setBusy(null);
    setMsg(r.error ? r.error : `Yüklendi: ${r.created} yeni, ${r.updated} güncellendi. Eski araç transferlerinden ${r.hiddenOld} tanesi sitede gizlendi.`);
    load(); onSynced?.();
  };

  const saveImages = async (next: Record<string, string>) => {
    setBusy("images");
    const r = await fetch("/api/admin/service-library/transfers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "images", images: next }) }).then((x) => x.json()).catch(() => ({ error: "Bağlantı hatası." }));
    setBusy(null);
    if (r.error) setMsg(r.error); else { setImages(r.images); setMsg("Araç görselleri kaydedildi."); }
  };

  // Telefon fotoğrafları çoğu zaman 4,5 MB'ı aşar (sunucu sınırı) ya da HEIC olur: tarayıcıda en fazla 1600 px WebP'ye küçültülür,
  // sonra imzalı adresle doğrudan depolamaya yüklenir (ayarlar sayfasındaki medya yüklemesiyle aynı yol).
  const shrink = async (file: File): Promise<Blob> => {
    try {
      const bmp = await createImageBitmap(file);
      const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bmp.width * scale);
      canvas.height = Math.round(bmp.height * scale);
      canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", 0.85));
      return blob ?? file;
    } catch {
      return file; // tarayıcı çözemediyse (ör. bazı HEIC) dosya olduğu gibi gönderilir
    }
  };

  const upload = async (key: string, file?: File) => {
    if (!file) return;
    setBusy(key); setMsg("");
    try {
      const blob = await shrink(file);
      const isWebp = blob.type === "image/webp";
      const ext = isWebp ? "webp" : (file.name.split(".").pop() || "jpg").toLowerCase();
      if (!isWebp && !["jpg", "jpeg", "png", "webp"].includes(ext)) throw new Error("Bu dosya türü okunamadı. JPG, PNG ya da WEBP yükleyin (iPhone'da: Ayarlar → Kamera → Biçimler → En Uyumlu).");
      const sign = await fetch("/api/upload-sign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ headingSlug: `arac-${key}`, ext, contentType: blob.type || file.type }) }).then((r) => r.json());
      if (!sign.signedURL) throw new Error(sign.error || "Yükleme adresi alınamadı (oturum süresi dolmuş olabilir; sayfayı yenileyip tekrar giriş yapın).");
      const body = new FormData();
      body.append("cacheControl", "31536000");
      body.append("", blob, `arac-${key}.${ext}`);
      const put = await fetch(sign.signedURL, { method: "PUT", headers: { "x-upsert": "true" }, body });
      if (!put.ok) {
        const d = (await put.json().catch(() => null)) as { message?: string; error?: string } | null;
        throw new Error(`Depolamaya yüklenemedi (${put.status})${d?.message || d?.error ? `: ${d.message || d.error}` : ""}`);
      }
      await saveImages({ ...images, [key]: sign.publicUrl });
    } catch (e) {
      setMsg(`Görsel yüklenemedi: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  };

  if (!status) return null;
  const done = status.loaded >= status.expected;
  return (
    <div className={`rounded-2xl border p-4 text-xs ${done ? "border-primary/20 bg-primary/[0.03]" : "border-amber-300 bg-amber-50"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-bold text-primary">
          Transfer listesi (araç × rota): {status.loaded}/{status.expected} kalem yüklü
          {status.oldPublic > 0 && <span className="ml-2 font-normal text-amber-800">· sitede {status.oldPublic} eski araç transferi görünüyor</span>}
        </p>
        <div className="flex gap-2">
          <button onClick={() => setOpen((v) => !v)} className="rounded-lg border border-primary/30 px-3 py-1.5 font-bold text-primary hover:bg-primary/[0.05]">
            Araç görselleri {open ? "▲" : "▼"}
          </button>
          <button onClick={sync} disabled={busy === "sync"} className="rounded-lg bg-primary px-3 py-1.5 font-bold text-white disabled:opacity-50">
            {busy === "sync" ? "Yükleniyor…" : done ? "Fiyatları yeniden yükle" : "Transfer listesini yükle"}
          </button>
        </div>
      </div>
      <p className="mt-1.5 text-on-surface-variant">
        Liste satış fiyatıdır (araç başı, USD). Yükleyince her rota × araç sitede görünür, önümüzdeki 13 ayın fiyatı yazılır; eski araç transferleri (Accord, ECO VIP…) sitede gizlenir, silinmez. Tren (kişi başı) kalemlerine dokunulmaz.
      </p>
      {msg && <p className="mt-2 font-semibold text-primary" role="status">{msg}</p>}
      {open && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {status.vehicles.map((v) => (
            <div key={v.key} className="flex items-center gap-3 rounded-xl border border-outline-variant/30 bg-white p-3">
              <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-container-low">
                {images[v.key] ? (
                  <img src={images[v.key]} alt={v.label} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-[10px] text-on-surface-variant">görsel yok</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-on-surface">{v.label}</p>
                <p className="text-on-surface-variant">{v.note}</p>
                <label className="mt-1 inline-block cursor-pointer font-bold text-primary underline underline-offset-2">
                  {busy === v.key ? "Yükleniyor…" : images[v.key] ? "Değiştir" : "Görsel yükle"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { upload(v.key, e.target.files?.[0]); e.target.value = ""; }} />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
