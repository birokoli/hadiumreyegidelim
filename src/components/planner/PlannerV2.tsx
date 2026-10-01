"use client";

/*
 * Bireysel umre planlayıcısı v2 (Y2). Fiyatlar admin → Aylık Satış Fiyatları'ndan (katalog).
 * Seçimler adres çubuğuna yazılır (?ay=2026-11&mekke=5&medine=4&yetiskin=2&cocuk=0&oda=2&mekkeotel=…&medineotel=…&ucus=biz|kendim&kalkis=…&ek=a,b),
 * böylece plan paylaşılabilir ve yapay zekâ asistanları hazır plan bağlantısı verebilir.
 */
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { CatalogItem } from "@/lib/catalog";
import { quotePlan, planToText, type PlanInput, type RoomType } from "@/lib/pricing/plan";
import WhatsAppIcon from "@/components/home/WhatsAppIcon";

type Month = { value: string; label: string };

const UNIT: Record<string, string> = { per_person: "kişi başı", per_vehicle: "araç başı", per_room: "oda / gece", flat: "" };
const usd = (n: number) => `${n.toLocaleString("tr-TR")} USD`;

function price(item: CatalogItem, month: string, variant = "") {
  return item.prices.find((p) => p.month === month && p.variant === variant)?.priceUsd ?? (variant ? null : item.prices.find((p) => p.month === month)?.priceUsd ?? null);
}

function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-outline-variant/30 bg-white px-4 py-3">
      <span className="text-[14px] font-semibold text-on-surface">{label}</span>
      <span className="flex items-center gap-3">
        <button type="button" aria-label={`${label} azalt`} disabled={value <= min} onClick={() => onChange(value - 1)} className="h-8 w-8 rounded-full border border-outline-variant/60 font-bold text-primary disabled:opacity-30">−</button>
        <span className="w-6 text-center font-bold tabular-nums" aria-live="polite">{value}</span>
        <button type="button" aria-label={`${label} artır`} disabled={value >= max} onClick={() => onChange(value + 1)} className="h-8 w-8 rounded-full border border-outline-variant/60 font-bold text-primary disabled:opacity-30">+</button>
      </span>
    </div>
  );
}

function Step({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-outline-variant/20 bg-white p-4 md:p-6" aria-labelledby={`adim-${n}`}>
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">{n}</span>
        <div className="min-w-0 flex-1">
          <h2 id={`adim-${n}`} className="font-headline text-xl font-bold text-primary">{title}</h2>
          {hint && <p className="mt-0.5 text-[13px] text-on-surface-variant">{hint}</p>}
        </div>
      </div>
      {/* İçerik numaranın altından tam genişlikte (mobilde kartlar daralmasın) */}
      <div className="mt-4 md:pl-12">{children}</div>
    </section>
  );
}

function Choice({ checked, onClick, title, sub, right, image, type = "radio" }: { checked: boolean; onClick: () => void; title: string; sub?: string; right?: React.ReactNode; image?: string | null; type?: "radio" | "checkbox" }) {
  return (
    <button
      type="button"
      role={type}
      aria-checked={checked}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${checked ? "border-primary bg-primary/[0.04] ring-1 ring-primary" : "border-outline-variant/30 bg-white hover:border-primary/40"}`}
    >
      {image !== undefined && (
        <span className="relative h-12 w-16 sm:h-14 sm:w-20 shrink-0 overflow-hidden rounded-lg bg-surface-container-low">
          {image && <Image src={image} alt="" fill sizes="80px" className="object-cover" />}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-on-surface">{title}</span>
        {sub && <span className="block text-[12px] text-on-surface-variant">{sub}</span>}
      </span>
      {right && <span className="shrink-0 text-right text-[13px]">{right}</span>}
      <span aria-hidden="true" className={`flex h-5 w-5 shrink-0 items-center justify-center ${type === "radio" ? "rounded-full" : "rounded-md"} border-2 ${checked ? "border-primary bg-primary text-white" : "border-outline-variant/60"}`}>
        {checked && <svg viewBox="0 0 20 20" className="h-3 w-3" fill="currentColor"><path d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" /></svg>}
      </span>
    </button>
  );
}

const PriceNote = ({ value, unit }: { value: number | null; unit: string }) =>
  value == null ? <span className="text-on-surface-variant">teklifte</span> : (
    <span><span className="block font-bold text-primary">{usd(value)}</span><span className="text-[11px] text-on-surface-variant">{unit}</span></span>
  );

/** Adres parametrelerinden başlangıç planı (paylaşılan plan, AI bağlantısı) */
function initialPlan(catalog: CatalogItem[], months: Month[], q: Record<string, string | undefined>): PlanInput {
  const flights = catalog.filter((c) => c.category === "flight");
  const bySlug = (slug?: string) => (slug ? catalog.find((c) => c.slug === slug || c.id === slug) : undefined);
  const n = (k: string, min: number, max: number, d: number) => (q[k] != null && q[k] !== "" ? Math.min(max, Math.max(min, Number(q[k]) || 0)) : d);
  const kalkis = q.kalkis?.toLocaleLowerCase("tr");
  return {
    month: months.some((m) => m.value === q.ay) ? q.ay! : months[0]?.value ?? "",
    mekkeNights: n("mekke", 0, 30, 5),
    medineNights: n("medine", 0, 30, 4),
    adults: n("yetiskin", 1, 30, 2),
    children: n("cocuk", 0, 20, 0),
    roomType: (["2", "3", "4"].includes(q.oda ?? "") ? q.oda : "2") as RoomType,
    mekkeHotelId: bySlug(q.mekkeotel)?.id ?? null,
    medineHotelId: bySlug(q.medineotel)?.id ?? null,
    flight: q.ucus === "kendim"
      ? { mode: "kendim", itemId: null }
      : { mode: "biz", itemId: (kalkis && flights.find((f) => f.slug === kalkis || f.name.toLocaleLowerCase("tr").includes(kalkis))?.id) || flights[0]?.id || null },
    serviceIds: q.ek
      ? q.ek.split(",").map((s) => bySlug(s)?.id).filter((x): x is string => !!x)
      : catalog.filter((c) => c.category === "vize").map((c) => c.id),
  };
}

export default function PlannerV2({ catalog, months, whatsappNumber, query = {} }: { catalog: CatalogItem[]; months: Month[]; whatsappNumber: string; query?: Record<string, string | undefined> }) {
  const byDistance = (a: CatalogItem, b: CatalogItem) => (a.distanceMeters ?? 1e9) - (b.distanceMeters ?? 1e9);
  const mekkeHotels = catalog.filter((c) => c.category === "hotel" && c.city === "mekke").sort(byDistance);
  const medineHotels = catalog.filter((c) => c.category === "hotel" && c.city === "medine").sort(byDistance);
  const flights = catalog.filter((c) => c.category === "flight");
  const transfers = catalog.filter((c) => c.category === "transfer");
  const extras = catalog.filter((c) => ["vize", "tur", "extra"].includes(c.category));

  const [input, setInput] = useState<PlanInput>(() => initialPlan(catalog, months, query));

  // Seçimleri adres çubuğuna yaz (sayfa yenilenmeden)
  useEffect(() => {
    const slugOf = (id: string | null) => (id ? catalog.find((c) => c.id === id)?.slug ?? id : "");
    const q = new URLSearchParams({ ay: input.month, mekke: String(input.mekkeNights), medine: String(input.medineNights), yetiskin: String(input.adults), cocuk: String(input.children), oda: input.roomType, ucus: input.flight.mode });
    if (input.mekkeHotelId) q.set("mekkeotel", slugOf(input.mekkeHotelId));
    if (input.medineHotelId) q.set("medineotel", slugOf(input.medineHotelId));
    if (input.flight.mode === "biz" && input.flight.itemId) q.set("kalkis", slugOf(input.flight.itemId));
    if (input.serviceIds.length) q.set("ek", input.serviceIds.map(slugOf).join(","));
    window.history.replaceState(null, "", `${window.location.pathname}?${q.toString()}`);
  }, [input, catalog]);

  const quote = useMemo(() => quotePlan(input, catalog), [input, catalog]);
  const monthText = months.find((m) => m.value === input.month)?.label ?? input.month;
  const set = (patch: Partial<PlanInput>) => setInput((p) => ({ ...p, ...patch }));
  const toggle = (id: string) => set({ serviceIds: input.serviceIds.includes(id) ? input.serviceIds.filter((x) => x !== id) : [...input.serviceIds, id] });

  const [contact, setContact] = useState({ name: "", phone: "", note: "" });
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const send = async () => {
    setError("");
    if (!contact.name.trim() || contact.phone.replace(/\D/g, "").length < 10) return setError("Adınızı ve telefon numaranızı yazın.");
    setState("sending");
    const utm = new URLSearchParams(window.location.search).get("utm_source");
    const r = await fetch("/api/plan-request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...contact, plan: input, referrer: document.referrer, utmSource: utm }) }).then((x) => x.json()).catch(() => ({ error: "Bağlantı hatası." }));
    if (r.error) { setState("idle"); return setError(r.error); }
    setState("sent");
  };
  const waHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(planToText(input, quote, monthText))}`;

  const hotelStep = (n: number, city: "Mekke" | "Medine", list: CatalogItem[], selected: string | null, key: "mekkeHotelId" | "medineHotelId", nights: number) => (
    <Step n={n} title={`${city} oteli`} hint={nights ? `${nights} gece · ${quote.rooms} oda (${input.roomType} kişilik) · gecelik oda fiyatları ${monthText} için` : `${city}'de konaklama yok`}>
      {nights > 0 && (
        <div className="space-y-2" role="radiogroup" aria-label={`${city} oteli`}>
          <Choice checked={!selected} onClick={() => set({ [key]: null } as Partial<PlanInput>)} title="Bana uygun oteli önerin" sub="Bütçenize ve tarihinize göre seçenek sunalım" />
          {list.map((h) => (
            <Choice
              key={h.id}
              checked={selected === h.id}
              onClick={() => set({ [key]: h.id } as Partial<PlanInput>)}
              image={h.imageUrl}
              title={h.name}
              sub={[h.hotelStars ? `${h.hotelStars} yıldız` : "", h.distanceMeters != null ? `Harem'e ${h.distanceMeters.toLocaleString("tr-TR")} m` : "", h.description ?? ""].filter(Boolean).join(" · ")}
              right={<PriceNote value={price(h, input.month, input.roomType)} unit="oda / gece" />}
            />
          ))}
          {!list.length && <p className="text-[13px] text-on-surface-variant">Otel seçeneklerimiz yakında burada; şimdilik ekibimiz size uygun otelleri önerir.</p>}
        </div>
      )}
    </Step>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <div className="space-y-4">
        <Step n={1} title="Ne zaman ve kaç kişi?">
          <p className="mb-2 text-[12px] font-bold uppercase tracking-wider text-primary/80">Dönem</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Dönem">
            {months.map((m) => (
              <button key={m.value} type="button" role="radio" aria-checked={input.month === m.value} onClick={() => set({ month: m.value })} className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold ${input.month === m.value ? "border-primary bg-primary text-white" : "border-outline-variant/40 bg-white text-on-surface hover:border-primary/50"}`}>{m.label}</button>
            ))}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Stepper label="Mekke (gece)" value={input.mekkeNights} min={0} max={30} onChange={(v) => set({ mekkeNights: v })} />
            <Stepper label="Medine (gece)" value={input.medineNights} min={0} max={30} onChange={(v) => set({ medineNights: v })} />
            <Stepper label="Yetişkin" value={input.adults} min={1} max={30} onChange={(v) => set({ adults: v })} />
            <Stepper label="Çocuk (2–11 yaş)" value={input.children} min={0} max={20} onChange={(v) => set({ children: v })} />
          </div>
          <p className="mb-2 mt-4 text-[12px] font-bold uppercase tracking-wider text-primary/80">Oda tipi</p>
          <div className="flex gap-2" role="radiogroup" aria-label="Oda tipi">
            {(["2", "3", "4"] as RoomType[]).map((r) => (
              <button key={r} type="button" role="radio" aria-checked={input.roomType === r} onClick={() => set({ roomType: r })} className={`flex-1 rounded-xl border px-3 py-2.5 text-[13px] font-semibold ${input.roomType === r ? "border-primary bg-primary text-white" : "border-outline-variant/40 bg-white text-on-surface"}`}>{r} kişilik</button>
            ))}
          </div>
          <p className="mt-2 text-[12px] text-on-surface-variant">{quote.people} kişi için {quote.rooms} oda.</p>
        </Step>

        {hotelStep(2, "Mekke", mekkeHotels, input.mekkeHotelId, "mekkeHotelId", input.mekkeNights)}
        {hotelStep(3, "Medine", medineHotels, input.medineHotelId, "medineHotelId", input.medineNights)}

        <Step n={4} title="Uçuş" hint="Canlı bilet araması yok; kalkış şehrine göre o ayın tahmini fiyatı. Kesin fiyat teklifte.">
          <div className="space-y-2" role="radiogroup" aria-label="Uçuş">
            <Choice checked={input.flight.mode === "biz"} onClick={() => set({ flight: { mode: "biz", itemId: input.flight.itemId ?? flights[0]?.id ?? null } })} title="Uçuşu siz ayarlayın" sub="Gidiş-dönüş, Cidde ya da Medine" />
            {input.flight.mode === "biz" && flights.length > 0 && (
              <label className="ml-1 block text-[13px]">
                <span className="mb-1 block font-semibold text-on-surface">Kalkış şehri</span>
                <select value={input.flight.itemId ?? ""} onChange={(e) => set({ flight: { mode: "biz", itemId: e.target.value || null } })} className="w-full rounded-xl border border-outline-variant/40 bg-white px-3 py-2.5">
                  {flights.map((f) => {
                    const p = price(f, input.month);
                    return <option key={f.id} value={f.id}>{f.name}{p != null ? ` · ~${usd(p)} kişi başı` : ""}</option>;
                  })}
                </select>
              </label>
            )}
            <Choice checked={input.flight.mode === "kendim"} onClick={() => set({ flight: { mode: "kendim", itemId: null } })} title="Uçuşu kendim alacağım" />
          </div>
        </Step>

        <Step n={5} title="Transfer ve hızlı tren" hint="Havalimanı karşılama, şehirler arası araç ve Haremeyn hızlı treni">
          {transfers.length ? (
            <div className="space-y-2">
              {transfers.map((t) => <Choice key={t.id} type="checkbox" checked={input.serviceIds.includes(t.id)} onClick={() => toggle(t.id)} title={t.name} sub={t.description ?? undefined} right={<PriceNote value={price(t, input.month)} unit={UNIT[t.pricingType]} />} />)}
            </div>
          ) : <p className="text-[13px] text-on-surface-variant">Transfer ve tren seçenekleri teklifte eklenir.</p>}
        </Step>

        <Step n={6} title="Vize, rehberlik ve ziyaretler">
          {extras.length ? (
            <div className="space-y-2">
              {extras.map((t) => <Choice key={t.id} type="checkbox" checked={input.serviceIds.includes(t.id)} onClick={() => toggle(t.id)} title={t.name} sub={t.description ?? undefined} right={<PriceNote value={price(t, input.month)} unit={UNIT[t.pricingType]} />} />)}
            </div>
          ) : <p className="text-[13px] text-on-surface-variant">Umre vizesi kişi başı 140 USD; belgeler tamamsa 2 iş saatinde çıkar. Rehberlik ve ziyaretler teklifte eklenir.</p>}
        </Step>
      </div>

      {/* Özet: geniş ekranda sağda sabit, mobilde akışın sonunda */}
      <aside id="ozet" className="lg:sticky lg:top-28 space-y-4" aria-label="Plan özeti">
        <div className="rounded-2xl bg-primary p-5 text-white">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">Planınız · {monthText}</p>
          <p className="mt-2 font-headline text-3xl font-bold">{quote.totalUsd > 0 ? usd(quote.totalUsd) : "Teklif hazırlanır"}</p>
          {quote.totalUsd > 0 && <p className="text-sm text-white/80">kişi başı {usd(quote.perPersonUsd)}{quote.complete ? "" : " · eksik kalemler teklifte eklenir"}</p>}
          <ul className="mt-4 space-y-1.5 text-[13px]">
            {quote.lines.map((l) => (
              <li key={l.itemId} className="flex justify-between gap-3"><span className="min-w-0"><span className="block truncate">{l.label}</span><span className="text-white/60">{l.detail}</span></span><span className="shrink-0 font-semibold">{l.totalUsd != null ? usd(l.totalUsd) : "teklifte"}</span></li>
            ))}
            {quote.pending.filter((p) => !quote.lines.some((l) => p.startsWith(`${l.label}:`))).map((p) => <li key={p} className="text-white/70">• {p}</li>)}
          </ul>
        </div>

        <div className="rounded-2xl border border-outline-variant/20 bg-white p-5">
          {state === "sent" ? (
            <div role="status">
              <p className="font-headline text-xl font-bold text-primary">Planınız bize ulaştı</p>
              <p className="mt-1 text-sm text-on-surface-variant">Ekibimiz {contact.phone} numarasından size dönecek ve kesin teklifi iletecek.</p>
            </div>
          ) : (
            <>
              <p className="font-headline text-lg font-bold text-primary">Kesin teklifi alın</p>
              <div className="mt-3 space-y-2">
                <input aria-label="Ad soyad" placeholder="Ad soyad" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} className="w-full rounded-xl border border-outline-variant/40 px-3 py-2.5 text-sm" />
                <input aria-label="Telefon" placeholder="Telefon (05xx …)" inputMode="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} className="w-full rounded-xl border border-outline-variant/40 px-3 py-2.5 text-sm" />
                <textarea aria-label="Not" placeholder="Not (isteğe bağlı)" rows={2} value={contact.note} onChange={(e) => setContact({ ...contact, note: e.target.value })} className="w-full rounded-xl border border-outline-variant/40 px-3 py-2.5 text-sm" />
              </div>
              {error && <p role="alert" className="mt-2 text-sm text-error">{error}</p>}
              <button type="button" onClick={send} disabled={state === "sending"} className="mt-3 w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{state === "sending" ? "Gönderiliyor…" : "Planı gönder, teklif alayım"}</button>
              <a href={waHref} target="_blank" rel="noopener noreferrer" className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#15803d] px-5 py-3 text-sm font-bold text-white hover:bg-[#166534]">
                <WhatsAppIcon className="h-5 w-5" /> WhatsApp&apos;tan gönder
              </a>
              <p className="mt-2 text-[11px] text-on-surface-variant">Fiyatlar seçtiğiniz ayın güncel satış fiyatlarıdır; uçuş tahminidir. Kesin tutar teklifte yazılı olarak bildirilir.</p>
            </>
          )}
        </div>
      </aside>

      {/* Mobil alt çubuk: toplam + özete git */}
      <a href="#ozet" className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-between rounded-2xl bg-primary px-4 py-3 text-white shadow-lg lg:hidden">
        <span className="text-[13px]">{quote.totalUsd > 0 ? <><b className="text-base">{usd(quote.totalUsd)}</b> · kişi başı {usd(quote.perPersonUsd)}</> : "Planınızı gönderin"}</span>
        <span className="text-[13px] font-bold">Özet →</span>
      </a>
    </div>
  );
}
