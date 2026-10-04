"use client";
import Link from "next/link";
import { useState } from "react";
import { uploadReviewPhoto } from "@/components/reviews/photo";

const input = "w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3 text-on-surface focus:border-primary focus:outline-none";

export default function ReviewForm({ token, defaultName }: { token: string; defaultName: string }) {
  const [rating, setRating] = useState(0);
  const [displayName, setDisplayName] = useState(defaultName);
  const [city, setCity] = useState("");
  const [umreMonth, setUmreMonth] = useState("");
  const [text, setText] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const endpoint = `/api/reviews/${token}`;

  const onPhoto = async (f: File | undefined) => {
    if (!f) return;
    setUploading(true);
    setError("");
    try {
      setPhotoUrl(await uploadReviewPhoto(f, endpoint));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!rating) return setError("Lütfen puan verin.");
    setBusy(true);
    try {
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating, displayName, city, umreMonth, text, photoUrl, consent }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "Gönderilemedi.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  if (done)
    return (
      <div className="rounded-2xl border border-outline-variant/20 bg-white p-6 text-center">
        <p className="font-headline text-xl font-bold text-primary">Teşekkür ederiz</p>
        <p className="mt-2 text-on-surface-variant">Yorumunuz bize ulaştı; onaydan sonra sitemizde yayımlanacak. Kabul olsun.</p>
      </div>
    );

  return (
    <form onSubmit={submit} className="space-y-5 rounded-2xl border border-outline-variant/20 bg-white p-6">
      <div>
        <p className="mb-2 font-semibold text-on-surface">Puanınız</p>
        <div className="flex gap-1" role="radiogroup" aria-label="Puan">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} yıldız`} onClick={() => setRating(n)} className={`text-4xl leading-none ${n <= rating ? "text-[#f5a623]" : "text-outline-variant"}`}>
              ★
            </button>
          ))}
        </div>
      </div>
      <label className="block">
        <span className="mb-1 block font-semibold text-on-surface">Yorumunuz</span>
        <textarea required minLength={20} rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder="Otel, transfer, vize süreci, ekibimiz… Neler iyiydi, neler daha iyi olabilirdi?" className={input} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block font-semibold text-on-surface">Sitede görünecek ad</span>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Ayşe Y." className={input} />
        </label>
        <label className="block">
          <span className="mb-1 block font-semibold text-on-surface">Şehriniz</span>
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="İstanbul" className={input} />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block font-semibold text-on-surface">Umreye gittiğiniz ay</span>
          <input value={umreMonth} onChange={(e) => setUmreMonth(e.target.value)} placeholder="Eylül 2026" className={input} />
        </label>
      </div>
      <div>
        <span className="mb-1 block font-semibold text-on-surface">Fotoğraf (isteğe bağlı)</span>
        {photoUrl ? (
          <div className="flex items-center gap-3">
            { }
            <img src={photoUrl} alt="" className="h-20 w-20 rounded-xl object-cover" />
            <button type="button" onClick={() => setPhotoUrl("")} className="text-sm text-primary underline">Kaldır</button>
          </div>
        ) : (
          <input type="file" accept="image/*" disabled={uploading} onChange={(e) => onPhoto(e.target.files?.[0])} className="block text-sm" />
        )}
        {uploading && <p className="mt-1 text-sm text-on-surface-variant">Yükleniyor…</p>}
        <p className="mt-1 text-[12px] text-on-surface-variant">Başkalarının yüzünün net göründüğü fotoğrafları paylaşmamanızı rica ederiz.</p>
      </div>
      <label className="flex items-start gap-3 text-sm text-on-surface-variant">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
        <span>Yorumumun, verdiğim adın kısaltması, şehir ve fotoğrafla birlikte hadiumreyegidelim.com&apos;da yayımlanmasına onay veriyorum. Kişisel verilerin işlenmesi hakkında bilgi için <Link href="/kvkk" className="underline">KVKK metni</Link>.</span>
      </label>
      {error && <p className="text-sm font-semibold text-error">{error}</p>}
      <button disabled={busy || uploading || !consent} className="w-full rounded-xl bg-primary px-5 py-3 font-bold text-white disabled:opacity-50">{busy ? "Gönderiliyor…" : "Yorumu gönder"}</button>
    </form>
  );
}
