"use client";

/*
 * Bireysel umre planlayıcısı v2 (G5.4). Fiyatlar admin → Hizmet Kütüphanesi / katalogdan.
 * Seçimler adres çubuğuna yazılır (?giris=2026-11-12&cikis=2026-11-21&mekke=5&medine=4&yetiskin=2&cocuk=0&oda=2&mekkeotel=…&medineotel=…&vize=biz|kendim&ek=a,b)
 */
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { CatalogItem, PaymentSettings } from "@/lib/catalog";
import { paymentOptions, quotePlan, planToText, unitPrice, type PlanInput, type RoomType } from "@/lib/pricing/plan";
import DateRangePicker, { nightsBetweenYmd } from "./DateRangePicker";
import WhatsAppIcon from "@/components/home/WhatsAppIcon";

type Month = { value: string; label: string };

const UNIT: Record<string, string> = { per_person: "kişi başı", per_vehicle: "araç başı", per_room: "oda / gece", flat: "" };
const usd = (n: number) => `${Math.round(n).toLocaleString("tr-TR")} USD`;
const MONTHS_TR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
/** "2026-11-01" → "1 Kasım"; withYear → "1 Kasım 2026" */
const trDate = (ymd: string, withYear = false) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return y && m && d ? `${d} ${MONTHS_TR[m - 1]}${withYear ? ` ${y}` : ""}` : ymd;
};
const trRange = (a: string, b: string) => `${trDate(a)} – ${trDate(b, true)}`;

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

function Step({ n, title, hint, warning, children }: { n: number; title: string; hint?: string; warning?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-outline-variant/20 bg-white p-4 md:p-6" aria-labelledby={`adim-${n}`}>
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">{n}</span>
        <div className="min-w-0 flex-1">
          <h2 id={`adim-${n}`} className="font-headline text-xl font-bold text-primary">{title}</h2>
          {hint && <p className="mt-0.5 text-[13px] text-on-surface-variant">{hint}</p>}
          {warning && <p className="mt-1 text-[12px] font-semibold text-primary">{warning}</p>}
        </div>
      </div>
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
          {image && <Image src={image} alt="" fill sizes="80px" className="object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />}
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

function defaultDates(todayYmd?: string): { checkIn: string; checkOut: string } {
  // Sunucudan gelen bugünün tarihi (İstanbul) kullanılır: sunucu ve tarayıcı aynı varsayılanı üretir
  const inD = todayYmd ? new Date(`${todayYmd}T12:00:00`) : new Date();
  inD.setDate(inD.getDate() + 30);
  const outD = new Date(inD);
  outD.setDate(inD.getDate() + 9);

  const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { checkIn: ymd(inD), checkOut: ymd(outD) };
}

function initialPlan(catalog: CatalogItem[], query: Record<string, string | undefined>, todayYmd?: string): PlanInput {
  const bySlug = (slug?: string) => (slug ? catalog.find((c) => c.slug === slug || c.id === slug) : undefined);
  const n = (k: string, min: number, max: number, d: number) => (query[k] != null && query[k] !== "" ? Math.min(max, Math.max(min, Number(query[k]) || 0)) : d);
  
  const def = defaultDates(todayYmd);
  const checkIn = query.giris && /^\d{4}-\d{2}-\d{2}$/.test(query.giris) ? query.giris : def.checkIn;
  const checkOut = query.cikis && /^\d{4}-\d{2}-\d{2}$/.test(query.cikis) ? query.cikis : def.checkOut;
  const totalNights = nightsBetweenYmd(checkIn, checkOut) || 9;

  const mekkeNights = n("mekke", 0, totalNights, Math.ceil(totalNights * 0.55));
  const medineNights = Math.max(0, totalNights - mekkeNights);

  return {
    checkIn,
    checkOut,
    mekkeNights,
    medineNights,
    adults: n("yetiskin", 1, 30, 2),
    children: n("cocuk", 0, 20, 0),
    roomType: (["2", "3", "4"].includes(query.oda ?? "") ? query.oda : "2") as RoomType,
    mekkeHotelId: bySlug(query.mekkeotel)?.id ?? null,
    medineHotelId: bySlug(query.medineotel)?.id ?? null,
    visa: query.vize === "kendim" ? "kendim" : "biz",
    serviceIds: query.ek
      ? query.ek.split(",").map((s) => bySlug(s)?.id).filter((x): x is string => !!x)
      : [],
  };
}

export default function PlannerV2({ catalog, whatsappNumber, payment, query = {}, todayYmd }: { catalog: CatalogItem[]; months?: Month[]; whatsappNumber: string; payment: PaymentSettings; query?: Record<string, string | undefined>; todayYmd?: string }) {
  const byDistance = (a: CatalogItem, b: CatalogItem) => (a.distanceMeters ?? 1e9) - (b.distanceMeters ?? 1e9);
  const mekkeHotels = catalog.filter((c) => c.category === "hotel" && c.city === "mekke").sort(byDistance);
  const medineHotels = catalog.filter((c) => c.category === "hotel" && c.city === "medine").sort(byDistance);
  const transfers = catalog.filter((c) => c.category === "transfer");
  const extras = catalog.filter((c) => ["tur", "extra"].includes(c.category));

  const [input, setInput] = useState<PlanInput>(() => initialPlan(catalog, query, todayYmd));

  const totalNights = useMemo(() => nightsBetweenYmd(input.checkIn, input.checkOut), [input.checkIn, input.checkOut]);

  // Seçimleri adres çubuğuna yaz
  useEffect(() => {
    const slugOf = (id: string | null) => (id ? catalog.find((c) => c.id === id)?.slug ?? id : "");
    const q = new URLSearchParams({
      giris: input.checkIn,
      cikis: input.checkOut,
      mekke: String(input.mekkeNights),
      medine: String(input.medineNights),
      yetiskin: String(input.adults),
      cocuk: String(input.children),
      oda: input.roomType,
      vize: input.visa,
    });
    if (input.mekkeHotelId) q.set("mekkeotel", slugOf(input.mekkeHotelId));
    if (input.medineHotelId) q.set("medineotel", slugOf(input.medineHotelId));
    if (input.serviceIds.length) q.set("ek", input.serviceIds.map(slugOf).join(","));
    window.history.replaceState(null, "", `${window.location.pathname}?${q.toString()}`);
  }, [input, catalog]);

  const quote = useMemo(() => quotePlan(input, catalog), [input, catalog]);
  const set = (patch: Partial<PlanInput>) => setInput((p) => ({ ...p, ...patch }));
  const toggle = (id: string) => set({ serviceIds: input.serviceIds.includes(id) ? input.serviceIds.filter((x) => x !== id) : [...input.serviceIds, id] });

  // Tarih aralığı değişince Mekke ve Medine gecelerini yeniden orantıla
  const handleDateChange = (newIn: string, newOut: string) => {
    const n = nightsBetweenYmd(newIn, newOut);
    const m = Math.ceil(n * 0.55);
    set({
      checkIn: newIn,
      checkOut: newOut,
      mekkeNights: m,
      medineNights: Math.max(0, n - m),
    });
  };

  const mekkeMissing = input.mekkeNights > 0 && !input.mekkeHotelId;
  const medineMissing = input.medineNights > 0 && !input.medineHotelId;
  const hasHotelError = mekkeMissing || medineMissing;

  const [contact, setContact] = useState({ name: "", phone: "", note: "" });
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  const send = async () => {
    setError("");
    if (hasHotelError) return setError("Lütfen Mekke ve Medine otellerinizi seçin.");
    if (!contact.name.trim() || contact.phone.replace(/\D/g, "").length < 10) return setError("Adınızı ve telefon numaranızı yazın.");
    setState("sending");
    const utm = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("utm_source") : null;
    const r = await fetch("/api/plan-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...contact, plan: input, referrer: typeof document !== "undefined" ? document.referrer : "", utmSource: utm }),
    }).then((x) => x.json()).catch(() => ({ error: "Bağlantı hatası." }));
    
    if (r.error) { setState("idle"); return setError(r.error); }
    setState("sent");
  };

  const waHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(planToText(input, quote, catalog, payment))}`;
  const payRows = quote.totalUsd > 0 ? paymentOptions(quote.totalUsd, payment) : [];

  const hotelStep = (n: number, city: "Mekke" | "Medine", list: CatalogItem[], selected: string | null, key: "mekkeHotelId" | "medineHotelId", nights: number) => {
    const isMissing = nights > 0 && !selected;
    return (
      <Step
        n={n}
        title={`${city} oteli (Zorunlu)`}
        hint={nights ? `${nights} gece · ${quote.rooms} oda (${input.roomType} kişilik) · gecelik oda fiyatları ${input.checkIn.slice(0,7)} dönemi için` : `${city}'de konaklama yok`}
        warning={isMissing ? `Lütfen bir ${city} oteli seçin.` : undefined}
      >
        {nights > 0 && (
          <div className="space-y-2" role="radiogroup" aria-label={`${city} oteli`}>
            {list.map((h) => (
              <Choice
                key={h.id}
                checked={selected === h.id}
                onClick={() => set({ [key]: h.id } as Partial<PlanInput>)}
                image={h.imageUrl}
                title={h.name}
                sub={[h.hotelStars ? `${h.hotelStars} yıldız` : "", h.distanceMeters != null ? `Harem'e ${h.distanceMeters.toLocaleString("tr-TR")} m` : "", h.description ?? ""].filter(Boolean).join(" · ")}
                right={<PriceNote value={unitPrice(h, input.checkIn.slice(0,7), input.roomType)} unit="oda / gece" />}
              />
            ))}
            {!list.length && (
              <div className="p-4 rounded-xl border border-outline-variant/30 bg-surface-container-low text-center space-y-3">
                <p className="text-[13px] text-on-surface-variant">Otel listemiz güncelleniyor, WhatsApp'tan yazın.</p>
                <a href={waHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#15803d] text-white font-bold px-4 py-2 rounded-xl text-xs">
                  <WhatsAppIcon className="w-4 h-4" /> WhatsApp ile Otel Sor
                </a>
              </div>
            )}
          </div>
        )}
      </Step>
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <div className="space-y-4">
        {/* Adım 1: Tarih Aralığı ve Kişi/Oda */}
        <Step n={1} title="Ne zaman ve kaç kişi?" hint="Tarih aralığınızı takvimden seçin ve Mekke/Medine gecelerinizi belirleyin.">
          <p className="mb-2 text-[12px] font-bold uppercase tracking-wider text-primary/80">Tarih Aralığı</p>
          <DateRangePicker checkIn={input.checkIn} checkOut={input.checkOut} onChange={handleDateChange} />
          
          <div className="mt-4 p-3 rounded-xl bg-surface-container-low flex items-center justify-between text-xs font-semibold text-primary">
            <span>Seçilen Süre: {totalNights} Gece</span>
            <span>{trRange(input.checkIn, input.checkOut)}</span>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Stepper
              label="Mekke (gece)"
              value={input.mekkeNights}
              min={0}
              max={totalNights}
              onChange={(v) => set({ mekkeNights: v, medineNights: Math.max(0, totalNights - v) })}
            />
            <Stepper
              label="Medine (gece)"
              value={input.medineNights}
              min={0}
              max={totalNights}
              onChange={(v) => set({ medineNights: v, mekkeNights: Math.max(0, totalNights - v) })}
            />
            <Stepper label="Yetişkin" value={input.adults} min={1} max={30} onChange={(v) => set({ adults: v })} />
            <Stepper label="Çocuk (2–11 yaş)" value={input.children} min={0} max={20} onChange={(v) => set({ children: v })} />
          </div>

          <p className="mb-2 mt-4 text-[12px] font-bold uppercase tracking-wider text-primary/80">Oda Tipi</p>
          <div className="flex gap-2" role="radiogroup" aria-label="Oda tipi">
            {(["2", "3", "4"] as RoomType[]).map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={input.roomType === r}
                onClick={() => set({ roomType: r })}
                className={`flex-1 rounded-xl border px-3 py-2.5 text-[13px] font-semibold ${input.roomType === r ? "border-primary bg-primary text-white" : "border-outline-variant/40 bg-white text-on-surface"}`}
              >
                {r} kişilik
              </button>
            ))}
          </div>
          <p className="mt-2 text-[12px] text-on-surface-variant">{quote.people} kişi için {quote.rooms} oda.</p>
        </Step>

        {/* Adım 2: Mekke Oteli */}
        {hotelStep(2, "Mekke", mekkeHotels, input.mekkeHotelId, "mekkeHotelId", input.mekkeNights)}

        {/* Adım 3: Medine Oteli */}
        {hotelStep(3, "Medine", medineHotels, input.medineHotelId, "medineHotelId", input.medineNights)}

        {/* Adım 4: Vize Hizmeti */}
        <Step n={4} title="Vize Hizmeti" hint="Vize başvurunuzu biz yapabiliriz ya da vizeniz varsa tercih belirtebilirsiniz.">
          <div className="space-y-2" role="radiogroup" aria-label="Vize tercihi">
            <Choice
              checked={input.visa === "biz"}
              onClick={() => set({ visa: "biz" })}
              title="Vizemi siz alın (vize hizmeti istiyorum)"
              sub="Belgeleriniz eksiksiz ulaştığında vizeniz 2 iş saatinde çıkar (kişi başı 140 USD)"
            />
            <Choice
              checked={input.visa === "kendim"}
              onClick={() => set({ visa: "kendim" })}
              title="Vizem var ya da kendim alacağım"
              sub="Vize ücreti plana eklenmez"
            />
          </div>
        </Step>

        {/* Adım 5: Transfer */}
        <Step n={5} title="Transfer ve Ulaşım" hint="Havalimanı karşılama, şehirler arası araç ve Haremeyn hızlı treni">
          {transfers.length ? (
            <div className="space-y-2">
              {transfers.map((t) => (
                <Choice
                  key={t.id}
                  type="checkbox"
                  checked={input.serviceIds.includes(t.id)}
                  onClick={() => toggle(t.id)}
                  title={t.name}
                  sub={t.description ?? undefined}
                  right={<PriceNote value={unitPrice(t, input.checkIn.slice(0,7))} unit={UNIT[t.pricingType]} />}
                />
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-on-surface-variant">Transfer seçenekleri teklifte eklenir.</p>
          )}
        </Step>

        {/* Adım 6: Ekstralar */}
        <Step n={6} title="Rehberlik, Ziyaretler ve Ekstralar">
          {extras.length ? (
            <div className="space-y-2">
              {extras.map((t) => (
                <Choice
                  key={t.id}
                  type="checkbox"
                  checked={input.serviceIds.includes(t.id)}
                  onClick={() => toggle(t.id)}
                  title={t.name}
                  sub={t.description ?? undefined}
                  right={<PriceNote value={unitPrice(t, input.checkIn.slice(0,7))} unit={UNIT[t.pricingType]} />}
                />
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-on-surface-variant">Özel rehberlik ve ziyaret programları teklifte eklenir.</p>
          )}
        </Step>
      </div>

      {/* Özet Yan Paneli */}
      <aside id="ozet" className="lg:sticky lg:top-28 space-y-4" aria-label="Plan özeti">
        <div className="rounded-2xl bg-primary p-5 text-white">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">Planınız · {trRange(input.checkIn, input.checkOut)}</p>
          <p className="mt-2 font-headline text-3xl font-bold">{quote.totalUsd > 0 ? usd(quote.totalUsd) : "Teklif hazırlanır"}</p>
          {quote.totalUsd > 0 && <p className="text-sm text-white/80">kişi başı {usd(quote.perPersonUsd)}{quote.complete ? "" : " · eksik kalemler teklifte eklenir"}</p>}
          
          {hasHotelError && (
            <div className="mt-3 rounded-xl border border-white/25 bg-white/10 p-2.5 text-xs font-semibold text-white">
              Fiyatı görmek için Mekke ve Medine otelinizi seçin.
            </div>
          )}

          <ul className="mt-4 space-y-1.5 text-[13px]">
            {quote.lines.map((l) => (
              <li key={l.itemId} className="flex justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate">{l.label}</span>
                  <span className="text-white/60">{l.detail}</span>
                </span>
                <span className="shrink-0 font-semibold">{l.totalUsd != null ? usd(l.totalUsd) : "teklifte"}</span>
              </li>
            ))}
            {quote.pending.filter((p) => !quote.lines.some((l) => p.startsWith(`${l.label}:`))).map((p) => (
              <li key={p} className="text-white/70">• {p}</li>
            ))}
          </ul>

          {payRows.length > 0 && (
            <div className="mt-4 border-t border-white/15 pt-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">Ödeme seçenekleri</p>
              <ul className="mt-2 space-y-1 text-[13px]">
                {payRows.map((r) => (
                  <li key={r.key} className="flex justify-between gap-3">
                    <span>{r.label}</span>
                    <span className="text-right font-semibold">{usd(r.usd)}{r.tryAmount ? <span className="block text-[11px] font-normal text-white/70">≈ {r.tryAmount.toLocaleString("tr-TR")} TL</span> : null}</span>
                  </li>
                ))}
              </ul>
              {payment.usdTry && <p className="mt-2 text-[11px] text-white/60">TL karşılığı {payment.usdTry.toLocaleString("tr-TR")} ₺ kuruyla{payment.rateDate ? ` (${new Date(payment.rateDate).toLocaleDateString("tr-TR")})` : ""}; kesin tutar teklifte.</p>}
            </div>
          )}
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
              <button
                type="button"
                onClick={send}
                disabled={state === "sending" || hasHotelError}
                className="mt-3 w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {state === "sending" ? "Gönderiliyor…" : hasHotelError ? "Otel seçimi bekleniyor" : "Planı gönder, teklif alayım"}
              </button>
              
              <a
                href={hasHotelError ? "#" : waHref}
                target={hasHotelError ? "_self" : "_blank"}
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (hasHotelError) {
                    e.preventDefault();
                    setError("Lütfen Mekke ve Medine otellerinizi seçin.");
                  }
                }}
                className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#15803d] px-5 py-3 text-sm font-bold text-white hover:bg-[#166534] ${hasHotelError ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <WhatsAppIcon className="h-5 w-5" /> WhatsApp'tan gönder
              </a>
              <p className="mt-2 text-[11px] text-on-surface-variant">Fiyatlar güncel satış fiyatlarıdır. Kesin tutar teklifte yazılı olarak bildirilir.</p>
            </>
          )}
        </div>
      </aside>

      {/* Mobil alt çubuk */}
      <a href="#ozet" className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-between rounded-2xl bg-primary px-4 py-3 text-white shadow-lg lg:hidden">
        <span className="text-[13px]">{quote.totalUsd > 0 ? <><b className="text-base">{usd(quote.totalUsd)}</b> · kişi başı {usd(quote.perPersonUsd)}</> : "Planınızı gönderin"}</span>
        <span className="text-[13px] font-bold">Özet →</span>
      </a>
    </div>
  );
}
