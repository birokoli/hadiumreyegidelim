"use client";
// Net fiyatlı paketin fiyat hesaplayıcısı (20 Ekim): gece ve kişi seçilir, kişi başı fiyat ve toplam ($) görünür;
// seçim WhatsApp mesajına eklenir. Altında bütün gece × kişi tablosu. Fiyatlar sunucuda hesaplanır (src/lib/pricing/net-paket.ts).
import { useState } from "react";
import WhatsAppIcon from "@/components/home/WhatsAppIcon";
import type { NetFiyat } from "@/lib/pricing/net-paket";

const usd = (n: number) => `${n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\u00a0$`;
const gun = (gece: number) => `${gece + 1} gün`;

export default function NetFiyatHesaplayici({ tablo, geceler, kisiler, vitrin, baslik, otelAdi, whatsapp }: {
  tablo: NetFiyat[];
  geceler: number[];
  kisiler: number[];
  vitrin: { gece: number; kisi: number };
  baslik: string;
  otelAdi: string;
  whatsapp: string;
}) {
  const [gece, setGece] = useState(vitrin.gece);
  const [kisi, setKisi] = useState(vitrin.kisi);
  const f = tablo.find((x) => x.gece === gece && x.kisi === kisi);
  const mesaj = `Merhaba, "${baslik}" için fiyat almak istiyorum.\nOtel: ${otelAdi}\n${gece} gece (${gun(gece)}), ${kisi} kişi${f ? `\nSitedeki fiyat: kişi başı ${usd(f.kisiBasiUsd)}` : ""}\nTarih: `;
  const waHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent(mesaj)}`;

  const secim = (aktif: boolean) =>
    `flex min-h-[56px] flex-1 flex-col items-center justify-center rounded-xl border px-2 py-2 text-center transition-colors active:scale-[0.98] ${
      aktif ? "border-primary bg-primary text-white shadow-[0_8px_20px_-8px_rgba(0,55,129,0.5)]" : "border-outline-variant/40 bg-white text-on-surface hover:border-primary/50"
    }`;

  return (
    <div className="rounded-3xl border border-outline-variant/30 bg-white p-4 shadow-[0_20px_50px_-24px_rgba(18,41,90,0.35)] md:p-8">
      <fieldset>
        <legend className="text-[12px] font-bold uppercase tracking-[0.16em] text-primary/70">Kaç gece kalacaksınız?</legend>
        <div className="mt-2 flex gap-2">
          {geceler.map((g) => (
            <button key={g} type="button" aria-pressed={g === gece} onClick={() => setGece(g)} className={secim(g === gece)}>
              <span className="text-[17px] font-bold leading-none">{g} gece</span>
              <span className={`mt-1 text-[11px] ${g === gece ? "text-white/75" : "text-on-surface-variant"}`}>{gun(g)}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="text-[12px] font-bold uppercase tracking-[0.16em] text-primary/70">Kaç kişisiniz?</legend>
        <div className="mt-2 flex gap-2">
          {kisiler.map((k) => (
            <button key={k} type="button" aria-pressed={k === kisi} onClick={() => setKisi(k)} className={secim(k === kisi)}>
              <span className="text-[17px] font-bold leading-none">{k} kişi</span>
              <span className={`mt-1 text-[11px] ${k === kisi ? "text-white/75" : "text-on-surface-variant"}`}>tek oda</span>
            </button>
          ))}
        </div>
      </fieldset>

      {f && (
        <div className="mt-6 rounded-2xl bg-surface-container-low p-5" aria-live="polite">
          <p className="text-[12px] font-semibold text-on-surface-variant">Kişi başı · vize, otel ve transfer dahil</p>
          <p className="mt-1 font-headline text-[44px] font-bold leading-none tracking-tight text-primary md:text-[52px]">{usd(f.kisiBasiUsd)}</p>
          <p className="mt-2 text-[14px] text-on-surface-variant">
            {kisi} kişi toplam <b className="text-on-surface">{usd(f.toplamUsd)}</b> · {gece} gece ({gun(gece)})
          </p>
        </div>
      )}

      <a href={waHref} target="_blank" rel="noopener" className="mt-5 flex min-h-[56px] w-full items-center justify-center gap-2.5 rounded-xl bg-[#1a9e4b] px-5 text-[16px] font-bold text-white transition hover:brightness-95 active:scale-[0.99]">
        <WhatsAppIcon className="h-6 w-6" />
        Bu fiyatla teklif al
      </a>
      <p className="mt-3 text-center text-[12px] leading-relaxed text-on-surface-variant">
        Uçak bileti dahil değildir.
      </p>

      <details className="group mt-6 border-t border-outline-variant/30 pt-4">
        <summary className="flex cursor-pointer list-none items-center justify-between text-[14px] font-bold text-primary">
          Bütün fiyatlar (kişi başı)
          <span className="text-xl leading-none transition-transform group-open:rotate-45" aria-hidden>+</span>
        </summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[300px] border-collapse text-[13px]">
            <thead>
              <tr>
                <th className="py-2 pr-2 text-left font-semibold text-on-surface-variant">Gece</th>
                {kisiler.map((k) => <th key={k} className="py-2 text-right font-semibold text-on-surface-variant">{k} kişi</th>)}
              </tr>
            </thead>
            <tbody>
              {geceler.map((g) => (
                <tr key={g} className="border-t border-outline-variant/20">
                  <td className="py-2.5 pr-2 font-semibold text-on-surface">{g} gece</td>
                  {kisiler.map((k) => {
                    const x = tablo.find((t) => t.gece === g && t.kisi === k);
                    const on = g === gece && k === kisi;
                    return (
                      <td key={k} className="py-1 text-right">
                        <button type="button" onClick={() => { setGece(g); setKisi(k); }} className={`rounded-lg px-2 py-1.5 text-right ${on ? "bg-primary text-white" : "hover:bg-surface-container-low"}`}>
                          <span className="block font-bold">{x ? usd(x.kisiBasiUsd) : "–"}</span>
                          <span className={`block text-[11px] ${on ? "text-white/75" : "text-on-surface-variant"}`}>{x ? `toplam ${usd(x.toplamUsd)}` : ""}</span>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
