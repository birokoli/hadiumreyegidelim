"use client";

// Admin → Yorumlar (4 Ekim): kişiye özel yorum bağlantısı, eski yorumların elle girişi, onay/ret/cevap.
import { useCallback, useEffect, useState } from "react";
import { uploadReviewPhoto } from "@/components/reviews/photo";

type Review = {
  id: string;
  customerName: string;
  displayName: string | null;
  city: string | null;
  umreMonth: string | null;
  rating: number | null;
  text: string | null;
  photoUrl: string | null;
  status: "invited" | "pending" | "approved" | "rejected";
  source: "link" | "manuel";
  reply: string | null;
  invitedAt: string;
  submittedAt: string | null;
  url: string | null;
};

const API = "/api/admin/reviews";
const TABS: { key: Review["status"]; label: string }[] = [
  { key: "pending", label: "Onay bekleyen" },
  { key: "approved", label: "Yayında" },
  { key: "invited", label: "Bağlantı gönderildi" },
  { key: "rejected", label: "Reddedilen" },
];
const input = "w-full bg-surface-container-low text-xs text-on-surface rounded-xl px-3 py-2 border border-outline-variant/30 focus:outline-none focus:border-primary";
const card = "bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/15 shadow-sm";

async function post(body: Record<string, unknown>) {
  const res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const d = await res.json().catch(() => ({}));
  if (!res.ok || d.ok === false) throw new Error(d.error || `İstek başarısız (${res.status}).`);
  return d;
}

const waMessage = (name: string, url: string) =>
  `Selamün aleyküm ${name.split(" ")[0]}, umrenizi bizimle planladığınız için teşekkür ederiz. Deneyiminizi birkaç cümleyle paylaşırsanız umreye gitmeyi düşünenlere çok yardımcı olur. Size özel yorum bağlantınız: ${url}`;

export default function ReviewsAdmin() {
  const [items, setItems] = useState<Review[]>([]);
  const [tab, setTab] = useState<Review["status"]>("pending");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [lastInvite, setLastInvite] = useState<{ name: string; url: string } | null>(null);
  const [m, setM] = useState({ customerName: "", displayName: "", city: "", umreMonth: "", rating: "", text: "", date: "", photoUrl: "" });
  const [uploading, setUploading] = useState(false);
  const [replies, setReplies] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const res = await fetch(API, { cache: "no-store" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Liste alınamadı.");
      setItems(d.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (body: Record<string, unknown>, ok: string) => {
    setError("");
    try {
      await post(body);
      setNotice(ok);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim()) return;
    setError("");
    try {
      const d = await post({ action: "invite", customerName: inviteName.trim() });
      setLastInvite({ name: inviteName.trim(), url: d.url });
      setInviteName("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const addManual = async (e: React.FormEvent) => {
    e.preventDefault();
    await act({ action: "manual", ...m }, "Yorum eklendi; 'Onay bekleyen' sekmesinde yayımlayabilirsiniz.");
    setM({ customerName: "", displayName: "", city: "", umreMonth: "", rating: "", text: "", date: "", photoUrl: "" });
  };

  const onPhoto = async (f: File | undefined) => {
    if (!f) return;
    setUploading(true);
    try {
      const url = await uploadReviewPhoto(f, API);
      setM((x) => ({ ...x, photoUrl: url }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(false);
    }
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setNotice(`${label} kopyalandı.`);
  };

  const list = items.filter((r) => r.status === tab);

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="border-b border-outline-variant/15 pb-6">
        <h1 className="text-2xl font-headline font-bold text-on-surface tracking-tight flex items-center gap-2.5">
          <span className="material-symbols-outlined text-primary text-[28px]">reviews</span>
          Yorumlar
        </h1>
        <p className="text-xs text-on-surface-variant mt-1 max-w-3xl">
          Müşteriye kişiye özel bağlantı gönderin ya da daha önce WhatsApp vb. ile gelen gerçek yorumları elle ekleyin. Onaylanan yorumlar ana sayfada ve /yorumlar sayfasında görünür. Kural: düşük puanlı yorumlar da yayımlanır; yalnızca hakaret, kişisel bilgi ya da konu dışı içerik reddedilir.
        </p>
      </div>

      {error && <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-medium">{error}</div>}
      {notice && (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-medium flex justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} className="opacity-70">Kapat</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${card} space-y-3`}>
          <h3 className="font-headline font-bold text-sm text-on-surface">Yorum bağlantısı oluştur</h3>
          <form onSubmit={invite} className="flex gap-2">
            <input value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Müşterinin adı soyadı" className={input} required />
            <button className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold whitespace-nowrap">Oluştur</button>
          </form>
          {lastInvite && (
            <div className="space-y-2 rounded-xl bg-surface-container-low p-3 text-xs">
              <p className="font-mono break-all">{lastInvite.url}</p>
              <p className="text-on-surface-variant">{waMessage(lastInvite.name, lastInvite.url)}</p>
              <div className="flex gap-2">
                <button onClick={() => copy(lastInvite.url, "Bağlantı")} className="px-3 py-1.5 rounded-lg border border-outline-variant/30 font-semibold text-primary">Bağlantıyı kopyala</button>
                <button onClick={() => copy(waMessage(lastInvite.name, lastInvite.url), "WhatsApp mesajı")} className="px-3 py-1.5 rounded-lg bg-primary text-white font-semibold">Mesajı kopyala</button>
              </div>
            </div>
          )}
          <p className="text-[11px] text-outline">Bağlantı tek kullanımlıktır; müşteri yorum gönderince "Onay bekleyen" sekmesine düşer.</p>
        </div>

        <form onSubmit={addManual} className={`${card} space-y-3`}>
          <h3 className="font-headline font-bold text-sm text-on-surface">Eski yorumu elle ekle</h3>
          <div className="grid grid-cols-2 gap-2">
            <input value={m.customerName} onChange={(e) => setM({ ...m, customerName: e.target.value })} placeholder="Müşteri adı soyadı *" className={input} required />
            <input value={m.displayName} onChange={(e) => setM({ ...m, displayName: e.target.value })} placeholder="Sitede görünecek (boşsa: Ayşe Y.)" className={input} />
            <input value={m.city} onChange={(e) => setM({ ...m, city: e.target.value })} placeholder="Şehir" className={input} />
            <input value={m.umreMonth} onChange={(e) => setM({ ...m, umreMonth: e.target.value })} placeholder="Umre ayı (Eylül 2026)" className={input} />
            <select value={m.rating} onChange={(e) => setM({ ...m, rating: e.target.value })} className={input}>
              <option value="">Puan yok</option>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} yıldız</option>)}
            </select>
            <input type="date" value={m.date} onChange={(e) => setM({ ...m, date: e.target.value })} className={input} title="Yorumun geldiği tarih" />
          </div>
          <textarea value={m.text} onChange={(e) => setM({ ...m, text: e.target.value })} rows={4} placeholder="Yorum metni (müşterinin yazdığı gibi) *" className={input} required />
          <div className="flex items-center gap-3 text-xs">
            {m.photoUrl ? (
              <>
                { }
                <img src={m.photoUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <button type="button" onClick={() => setM({ ...m, photoUrl: "" })} className="text-primary underline">Fotoğrafı kaldır</button>
              </>
            ) : (
              <input type="file" accept="image/*" disabled={uploading} onChange={(e) => onPhoto(e.target.files?.[0])} />
            )}
            {uploading && <span>Yükleniyor…</span>}
          </div>
          <p className="text-[11px] text-outline">Yalnızca müşteriden gerçekten gelmiş yorumları ekleyin ve yayımlanması için müşterinin onayını alın. Elle girilenlerde "Doğrulanmış müşteri" etiketi görünmez.</p>
          <button className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-bold">Yorumu ekle</button>
        </form>
      </div>

      <div className={card}>
        <div className="flex gap-1.5 overflow-x-auto border-b border-outline-variant/10 pb-3 mb-4">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap ${tab === t.key ? "bg-primary text-white font-semibold" : "text-on-surface-variant hover:bg-surface-container-low"}`}>
              {t.label} <span className="opacity-70">{items.filter((r) => r.status === t.key).length}</span>
            </button>
          ))}
        </div>
        {list.length === 0 ? (
          <p className="p-8 text-center text-xs text-outline">Bu sekmede yorum yok.</p>
        ) : (
          <div className="space-y-3">
            {list.map((r) => (
              <div key={r.id} className="rounded-xl border border-outline-variant/15 p-4 text-xs space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <b className="text-on-surface text-sm">{r.customerName}</b>
                  <span className="text-outline">→ sitede: {r.displayName || "-"}</span>
                  {r.rating && <span className="text-[#f5a623]">{"★".repeat(r.rating)}</span>}
                  <span className="text-outline">{[r.city, r.umreMonth].filter(Boolean).join(" · ")}</span>
                  <span className="ml-auto rounded-full bg-surface-container-high px-2 py-0.5 text-[10px] font-semibold">{r.source === "link" ? "Bağlantıdan" : "Elle eklendi"}</span>
                </div>
                {r.status === "invited" ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-outline">Gönderildi: {new Date(r.invitedAt).toLocaleDateString("tr-TR")}</span>
                    {r.url && <button onClick={() => copy(waMessage(r.customerName, r.url!), "WhatsApp mesajı")} className="px-2.5 py-1 rounded-lg border border-outline-variant/30 font-semibold text-primary">Mesajı tekrar kopyala</button>}
                  </div>
                ) : (
                  <>
                    <p className="whitespace-pre-line text-on-surface">{r.text}</p>
                    {r.photoUrl && (
                       
                      <img src={r.photoUrl} alt="" className="h-24 rounded-lg object-cover" />
                    )}
                    <div className="flex gap-2">
                      <input value={replies[r.id] ?? r.reply ?? ""} onChange={(e) => setReplies({ ...replies, [r.id]: e.target.value })} placeholder="Cevabımız (isteğe bağlı, sitede yorumun altında görünür)" className={input} />
                      <button onClick={() => act({ action: "update", id: r.id, reply: replies[r.id] ?? r.reply ?? "" }, "Cevap kaydedildi.")} className="px-3 py-1.5 rounded-lg border border-outline-variant/30 font-semibold text-primary whitespace-nowrap">Cevabı kaydet</button>
                    </div>
                    <div className="flex gap-2">
                      {r.status !== "approved" && <button onClick={() => act({ action: "update", id: r.id, status: "approved" }, "Yorum yayında.")} className="px-3 py-1.5 rounded-lg bg-primary text-white font-semibold">Yayımla</button>}
                      {r.status !== "rejected" && <button onClick={() => act({ action: "update", id: r.id, status: "rejected" }, "Yorum reddedildi.")} className="px-3 py-1.5 rounded-lg border border-outline-variant/30 font-semibold text-on-surface-variant">{r.status === "approved" ? "Yayından kaldır" : "Reddet"}</button>}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
