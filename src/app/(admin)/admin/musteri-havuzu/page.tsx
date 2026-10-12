"use client";
// Müşteri havuzu (12 Ekim): ücretsiz materyal karşılığı bırakılan iletişim bilgileri. Ticari ileti izni olmayanlara
// pazarlama mesajı gönderilmez; izin verenlere göndermeden önce İYS kaydı gerekir.
import { useCallback, useEffect, useMemo, useState } from "react";
import HubTabs from "@/components/admin/HubTabs";

type Lead = { id: string; name: string; email: string | null; phone: string | null; source: string; marketingConsent: boolean; status: string; note: string | null; createdAt: string };
const STATUS: Record<string, string> = { new: "Yeni", contacted: "İletişime geçildi", customer: "Müşteri oldu", not_interested: "İlgilenmiyor" };

export default function MusteriHavuzuPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sources, setSources] = useState<Record<string, string>>({});
  const [source, setSource] = useState("");
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [weekAgo] = useState(() => Date.now() - 7 * 864e5);

  const load = useCallback(async () => {
    const r = await fetch(`/api/admin/leads${source ? `?source=${encodeURIComponent(source)}` : ""}`);
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return setError(d.error || "Liste alınamadı.");
    setLeads(d.leads);
    setSources(d.sources);
  }, [source]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sayfa açılışında liste yüklenir
    load();
  }, [load]);

  const setStatus = async (id: string, status: string) => {
    await fetch("/api/admin/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    setLeads((l) => l.map((x) => (x.id === id ? { ...x, status } : x)));
  };

  const list = useMemo(() => {
    const t = q.trim().toLocaleLowerCase("tr-TR");
    return t ? leads.filter((l) => `${l.name} ${l.email ?? ""} ${l.phone ?? ""}`.toLocaleLowerCase("tr-TR").includes(t)) : leads;
  }, [leads, q]);
  const stats = useMemo(() => {
    return { total: leads.length, week: leads.filter((l) => new Date(l.createdAt).getTime() > weekAgo).length, consent: leads.filter((l) => l.marketingConsent).length };
  }, [leads, weekAgo]);

  return (
    <div className="space-y-6">
      <HubTabs hub="satis" />
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">Müşteri havuzu</h1>
        <p className="mt-1 max-w-3xl text-sm text-on-surface-variant">
          Ücretsiz materyal (ör. Tavaf El Kitabı) indirirken iletişim bilgisi bırakanlar. Pazarlama mesajı yalnızca &quot;ticari ileti izni&quot; verenlere gönderilebilir; göndermeden önce İYS (İleti Yönetim Sistemi) kaydı gerekir.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[["Toplam kayıt", stats.total], ["Son 7 gün", stats.week], ["Ticari ileti izni", stats.consent]].map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4">
            <p className="text-xs text-on-surface-variant">{k}</p>
            <p className="mt-1 text-xl font-bold text-on-surface">{v}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <select value={source} onChange={(e) => setSource(e.target.value)} className="rounded-xl border border-outline-variant/30 bg-surface-container-low px-3 py-2 text-sm">
          <option value="">Bütün kaynaklar</option>
          {Object.entries(sources).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ad, e-posta ya da telefon ara" className="w-64 rounded-xl border border-outline-variant/30 bg-surface-container-low px-3 py-2 text-sm" />
        <a href={`/api/admin/leads?format=csv${source ? `&source=${encodeURIComponent(source)}` : ""}`} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white">Excel'e aktar (CSV)</a>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-outline-variant/20 bg-surface-container-lowest">
        <table className="w-full text-sm">
          <thead className="bg-surface-container-low text-left text-xs text-on-surface-variant">
            <tr><th className="px-4 py-3">Tarih</th><th className="px-4 py-3">Ad</th><th className="px-4 py-3">E-posta</th><th className="px-4 py-3">Telefon</th><th className="px-4 py-3">Kaynak</th><th className="px-4 py-3">İleti izni</th><th className="px-4 py-3">Durum</th></tr>
          </thead>
          <tbody>
            {list.map((l) => (
              <tr key={l.id} className="border-t border-outline-variant/10">
                <td className="whitespace-nowrap px-4 py-3 text-xs text-on-surface-variant">{new Date(l.createdAt).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}</td>
                <td className="px-4 py-3 font-semibold text-on-surface">{l.name}</td>
                <td className="px-4 py-3">{l.email ? <a href={`mailto:${l.email}`} className="text-primary hover:underline">{l.email}</a> : "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap">{l.phone ? <a href={`https://wa.me/${l.phone.replace(/\D/g, "").replace(/^0/, "90")}`} target="_blank" className="text-primary hover:underline">{l.phone}</a> : "—"}</td>
                <td className="px-4 py-3 text-xs">{sources[l.source] ?? l.source}</td>
                <td className="px-4 py-3 text-xs">{l.marketingConsent ? <span className="rounded-full bg-green-100 px-2 py-1 font-bold text-green-800">Var</span> : <span className="text-on-surface-variant">Yok</span>}</td>
                <td className="px-4 py-3">
                  <select value={l.status} onChange={(e) => setStatus(l.id, e.target.value)} className="rounded-lg border border-outline-variant/30 bg-white px-2 py-1 text-xs">
                    {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-6 text-sm text-on-surface-variant">Henüz kayıt yok.</p>}
      </div>
    </div>
  );
}
