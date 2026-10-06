"use client";
// Paket sayfası: müşteri kişi sayısını ve oteli seçer, kişi başı paket fiyatı anında hesaplanır (src/lib/pricing/package.ts).
import Image from "next/image";
import { useMemo, useState } from "react";
import type { CatalogItem } from "@/lib/catalog";
import { quotePackage, type PackagePreset } from "@/lib/pricing/package";

const usd = (n: number) => `${n.toLocaleString("tr-TR")} $`;

export default function PackageHotelPicker({ title, preset, catalog, month, monthLabel, packagePercent, whatsappNumber }: { title: string; preset: PackagePreset; catalog: CatalogItem[]; month: string; monthLabel: string; packagePercent: number; whatsappNumber: string }) {
  const [people, setPeople] = useState(2);
  const hotels = useMemo(
    () =>
      catalog
        .filter((c) => c.category === "hotel" && c.city?.toLowerCase() === preset.city)
        .map((h) => ({ h, q: quotePackage(preset, h, catalog, people, month, packagePercent) }))
        .filter((x) => x.q)
        .sort((a, b) => a.q!.perPersonUsd - b.q!.perPersonUsd),
    [catalog, preset, people, month, packagePercent],
  );
  const [picked, setPicked] = useState<string | null>(preset.hotelSlug ?? null);
  const current = hotels.find((x) => x.h.slug === picked) ?? hotels[0];
  if (!hotels.length) return null;

  const wa = current
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Merhaba, "${title}" paketi için ${people} kişi, ${current.h.name} oteliyle (${monthLabel}) kişi başı ${usd(current.q!.perPersonUsd)} fiyatı gördüm. Tarih ve uygunluk sormak istiyorum.`)}`
    : `https://wa.me/${whatsappNumber}`;

  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-white p-5 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary/80">Otelinizi seçin</p>
          <h2 className="mt-1 font-headline text-xl md:text-2xl font-bold text-primary">Fiyat kişi sayısına ve otele göre nasıl değişir?</h2>
          <p className="mt-1 text-[13px] text-on-surface-variant">{monthLabel} fiyatları · {preset.nights} gece · odada en fazla 4 kişi</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-semibold text-on-surface">Kişi</span>
          <button type="button" aria-label="Kişi azalt" disabled={people <= 2} onClick={() => setPeople((n) => n - 1)} className="h-9 w-9 rounded-full border border-outline-variant/60 font-bold text-primary disabled:opacity-30">−</button>
          <span className="w-6 text-center font-bold tabular-nums">{people}</span>
          <button type="button" aria-label="Kişi artır" disabled={people >= 30} onClick={() => setPeople((n) => n + 1)} className="h-9 w-9 rounded-full border border-outline-variant/60 font-bold text-primary disabled:opacity-30">+</button>
        </div>
      </div>

      <div className="mt-5 space-y-2" role="radiogroup" aria-label="Otel">
        {hotels.map(({ h, q }) => {
          const on = current?.h.id === h.id;
          return (
            <button key={h.id} type="button" role="radio" aria-checked={on} onClick={() => setPicked(h.slug)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${on ? "border-primary bg-primary/[0.04] ring-1 ring-primary" : "border-outline-variant/30 hover:border-primary/40"}`}>
              <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-container-low">
                {h.imageUrl && <Image src={h.imageUrl} alt="" fill sizes="64px" className="object-cover" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-on-surface">{h.name}</span>
                <span className="block text-[12px] text-on-surface-variant">{[h.hotelStars ? `${h.hotelStars} yıldız` : "", h.description ?? ""].filter(Boolean).join(" · ")}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block font-headline text-lg font-bold text-primary">{usd(q!.perPersonUsd)}</span>
                <span className="text-[11px] text-on-surface-variant">kişi başı</span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-[12px] text-on-surface-variant">
        Otel ayrıntıları:{" "}
        {hotels.filter(({ h }) => h.slug).map(({ h }, i) => (
          <span key={h.id}>{i > 0 && " · "}<a href={`/oteller/${h.slug}`} className="underline hover:text-primary">{h.name}</a></span>
        ))}
      </p>

      {current && (
        <div className="mt-5 rounded-xl bg-surface-container-low p-4 text-[13px] text-on-surface-variant">
          <p>
            <b className="text-on-surface">{people} kişi · {current.h.name}:</b> kişi başı <b className="text-primary">{usd(current.q!.perPersonUsd)}</b>, toplam {usd(current.q!.totalUsd)}. {current.q!.rooms} oda; transfer ve tur {current.q!.vehicles > 1 ? `${current.q!.vehicles} × ` : ""}{current.q!.vehicleLabel} ile.
          </p>
          <p className="mt-1">Uçak bileti ve e-vize dahil değildir. Kesin fiyat tarih ve otel müsaitliğine göre WhatsApp'tan iletilir.</p>
        </div>
      )}
      <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-4 flex w-full items-center justify-center rounded-xl bg-[#15803d] px-5 py-3 font-bold text-white hover:bg-[#166534]">
        Bu otelle tarih ve uygunluk sor
      </a>
    </div>
  );
}
