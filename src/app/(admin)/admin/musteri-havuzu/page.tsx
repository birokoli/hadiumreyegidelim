"use client";
// Müşteri havuzu (12 Ekim): ücretsiz materyal karşılığı bırakılan iletişim bilgileri. Tasarım Gelen Kutusu ile aynı (13 Ekim, kullanıcı).
// Ticari ileti izni olmayanlara pazarlama mesajı gönderilmez; izin verenlere göndermeden önce İYS kaydı gerekir.
import { useCallback, useEffect, useMemo, useState } from "react";
import HubTabs from "@/components/admin/HubTabs";

type Lead = { id: string; name: string; email: string | null; phone: string | null; source: string; marketingConsent: boolean; status: string; note: string | null; createdAt: string };
type StatusKey = "new" | "contacted" | "customer" | "not_interested";
const STATUS: Record<StatusKey, string> = { new: "Yeni", contacted: "Arandı", customer: "Müşteri oldu", not_interested: "İlgilenmiyor" };

function waUrl(l: Lead): string {
  let phone = (l.phone ?? "").replace(/\D/g, "");
  if (phone.startsWith("0")) phone = "9" + phone;
  if (!phone.startsWith("90")) phone = "90" + phone;
  const first = l.name.split(" ")[0];
  const msg = `Merhaba ${first} Bey/Hanım, Hadi Umreye Gidelim'den yazıyoruz. Tavaf El Kitabı'nı indirdiğiniz için teşekkür ederiz. Umre planınızla ilgili yardımcı olabileceğimiz bir konu var mı?`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

export default function MusteriHavuzuPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sources, setSources] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | StatusKey | "CONSENT">("ALL");

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/leads");
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return setError(d.error || "Liste alınamadı.");
      setLeads(d.leads);
      setSources(d.sources);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id: string, status: string) => {
    const r = await fetch("/api/admin/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (r.ok) setLeads((l) => l.map((x) => (x.id === id ? { ...x, status } : x)));
  };

  const count = (s: StatusKey) => leads.filter((l) => l.status === s).length;
  const consentCount = leads.filter((l) => l.marketingConsent).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("tr-TR");
    return leads.filter((l) => {
      if (statusFilter === "CONSENT" && !l.marketingConsent) return false;
      if (statusFilter !== "ALL" && statusFilter !== "CONSENT" && l.status !== statusFilter) return false;
      return !q || `${l.name} ${l.email ?? ""} ${l.phone ?? ""}`.toLocaleLowerCase("tr-TR").includes(q);
    });
  }, [leads, search, statusFilter]);

  if (loading) return <div className="p-8 max-w-7xl mx-auto min-h-screen bg-surface text-on-surface-variant text-xs">Kayıtlar yükleniyor...</div>;

  const filters: { key: typeof statusFilter; label: string }[] = [
    { key: "ALL", label: "Tümü" },
    { key: "new", label: "Yeni" },
    { key: "contacted", label: "Arandı" },
    { key: "customer", label: "Müşteri oldu" },
    { key: "not_interested", label: "İlgilenmiyor" },
    { key: "CONSENT", label: "İleti izni verenler" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-surface text-on-surface">
      <HubTabs hub="satis" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/15">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">Satış & CRM</span>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-primary mt-1">Müşteri Havuzu</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">Tavaf El Kitabı&apos;nı indirirken adını ve iletişim bilgisini bırakanlar.</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- dosya indirme, sayfa değil */}
        <a
          href="/api/admin/leads?format=csv"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container transition-all active:scale-95 shadow-sm self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          <span>Excel&apos;e indir</span>
        </a>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-error/20 bg-surface-container-lowest">
          <span className="text-[10px] font-bold tracking-widest text-error uppercase">Yeni</span>
          <p className="font-headline text-2xl font-bold text-on-surface mt-1">{count("new")}</p>
          <p className="text-[11px] text-outline mt-0.5">Henüz aranmadı</p>
        </div>
        <div className="p-5 rounded-2xl border border-[#b8862f]/25 bg-surface-container-lowest">
          <span className="text-[10px] font-bold tracking-widest text-[#b8862f] uppercase">Arandı</span>
          <p className="font-headline text-2xl font-bold text-on-surface mt-1">{count("contacted")}</p>
          <p className="text-[11px] text-outline mt-0.5">Görüşme yapıldı</p>
        </div>
        <div className="p-5 rounded-2xl border border-secondary/25 bg-surface-container-lowest">
          <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">Müşteri oldu</span>
          <p className="font-headline text-2xl font-bold text-on-surface mt-1">{count("customer")}</p>
          <p className="text-[11px] text-outline mt-0.5">Satışa dönen</p>
        </div>
        <div className="p-5 rounded-2xl border border-primary/20 bg-surface-container-lowest">
          <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Toplam</span>
          <p className="font-headline text-2xl font-bold text-on-surface mt-1">{leads.length}</p>
          <p className="text-[11px] text-outline mt-0.5">{consentCount} kişi ileti izni verdi</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-outline-variant/15 pb-4">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
                statusFilter === f.key
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/25 hover:border-primary/40"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[16px]">search</span>
          <input
            type="text"
            placeholder="İsim, telefon veya e-posta"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-lowest text-xs text-on-surface rounded-xl pl-9 pr-3 py-2 border border-outline-variant/25 focus:outline-none focus:border-primary/40"
          />
        </div>
      </div>

      {error && <p className="text-xs font-bold text-error">{error}</p>}

      <div className="border border-outline-variant/15 rounded-2xl overflow-x-auto bg-surface-container-lowest">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-outline text-xs font-medium">
            {leads.length === 0 ? "Henüz kayıt yok. Kitapçığı indiren ilk kişi burada görünecek." : "Aramanıza uygun kayıt bulunamadı."}
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low border-b border-outline-variant/15 text-on-surface-variant uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="px-4 py-3">Kişi</th>
                <th className="px-4 py-3">İletişim</th>
                <th className="px-4 py-3">Nereden geldi</th>
                <th className="px-4 py-3">Tarih</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filtered.map((l) => {
                const date = new Date(l.createdAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
                return (
                  <tr key={l.id} className="hover:bg-primary/[0.03] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center shrink-0 font-headline">
                          {l.name.charAt(0).toLocaleUpperCase("tr-TR")}
                        </div>
                        <div>
                          <div className="font-bold text-on-surface whitespace-nowrap">{l.name}</div>
                          {l.marketingConsent ? (
                            <span className="text-[10px] font-bold text-secondary">İleti izni var</span>
                          ) : (
                            <span className="text-[10px] text-outline">İleti izni yok</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-on-surface-variant">
                      {l.phone && <div>{l.phone}</div>}
                      {l.email && <div className="text-[11px]">{l.email}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                        {sources[l.source] ?? l.source}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-outline font-mono whitespace-nowrap">{date}</td>
                    <td className="px-4 py-3">
                      <select
                        value={l.status}
                        onChange={(e) => setStatus(l.id, e.target.value)}
                        className="bg-surface-container-lowest border border-outline-variant/25 text-xs text-on-surface rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary/40"
                      >
                        {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                      {l.phone && (
                        <a
                          href={waUrl(l)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 bg-[#25D366] text-white hover:bg-[#1fb958] px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[14px]">chat</span>
                          <span>WhatsApp</span>
                        </a>
                      )}
                      {l.email && (
                        <a
                          href={`mailto:${l.email}`}
                          className="inline-flex items-center gap-1 border border-outline-variant/25 text-primary hover:border-primary px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[14px]">mail</span>
                          <span>E-posta</span>
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-[11px] text-outline">
        Kampanya ya da toplu mesaj yalnızca &quot;ileti izni var&quot; olanlara gönderilebilir.
      </p>
    </div>
  );
}
