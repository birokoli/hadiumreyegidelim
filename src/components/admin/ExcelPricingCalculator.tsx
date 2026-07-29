"use client";

import React, { useState } from "react";
import Link from "next/link";

interface PricingRow {
  id: string;
  name: string;
  category: string;
  note: string;
  costUsd: number;
  costTry: number;
  marginPercent: number; // e.g. 10 for 1.10 multiplier
  saleTry: number;
  saleUsd: number;
  profitTry: number;
}

export default function ExcelPricingCalculator({ initialCustomerName, initialPhone }: { initialCustomerName?: string; initialPhone?: string }) {
  // Exchange Rates
  const [usdRate, setUsdRate] = useState<number>(48.233);
  const [eurRate, setEurRate] = useState<number>(54.972);

  // Customer & Pax
  const [customerName, setCustomerName] = useState<string>(initialCustomerName || "");
  const [customerPhone, setCustomerPhone] = useState<string>(initialPhone || "");
  const [mekkeHotelName, setMekkeHotelName] = useState<string>("Manazel Ajyad Hotel");
  const [medineHotelName, setMedineHotelName] = useState<string>("Odst Al Madinah Hotel");
  const [paxCount, setPaxCount] = useState<number>(5);

  // Surcharge Rates
  const [ibanSurchargePercent, setIbanSurchargePercent] = useState<number>(20); // +20%
  const [cardSurchargePercent, setCardSurchargePercent] = useState<number>(26); // +26%

  // Items State pre-populated from Google Sheet defaults
  const [items, setItems] = useState<PricingRow[]>([
    { id: "1", name: "Uçak Bileti", category: "flight", note: "Alış * 1.10", costUsd: 0, costTry: 0, marginPercent: 10, saleTry: 0, saleUsd: 0, profitTry: 0 },
    { id: "2", name: "Transfer (VIP)", category: "transfer", note: "GMC / Vito Karşılama", costUsd: 360.81, costTry: 16748.59, marginPercent: 10, saleTry: 18423.45, saleUsd: 381.97, profitTry: 1674.86 },
    { id: "3", name: "Tren Bileti (Haramain)", category: "transfer", note: "Mekke - Medine Hızlı Tren", costUsd: 396.74, costTry: 18416.62, marginPercent: 10, saleTry: 20258.28, saleUsd: 420.01, profitTry: 1841.66 },
    { id: "4", name: "Mekke Otel Konaklama", category: "hotel", note: "Manazel Ajyad", costUsd: 1524.09, costTry: 70809.44, marginPercent: 10, saleTry: 77890.38, saleUsd: 1614.88, profitTry: 7080.94 },
    { id: "5", name: "Medine Otel Konaklama", category: "hotel", note: "Odst Al Madinah", costUsd: 322.71, costTry: 14993.05, marginPercent: 10, saleTry: 16492.36, saleUsd: 341.93, profitTry: 1499.31 },
    { id: "6", name: "Manevi Rehber / Hoca", category: "guide", note: "Birebir Özel İlahiyatçı", costUsd: 1036.63, costTry: 50000, marginPercent: 0, saleTry: 50000, saleUsd: 1036.63, profitTry: 0 },
    { id: "7", name: "Suudi Vize & Sigorta", category: "visa", note: "1 Yıllık E-Vize", costUsd: 896.61, costTry: 41656.64, marginPercent: 10, saleTry: 45822.30, saleUsd: 950.02, profitTry: 4165.66 },
  ]);

  // Recalculate row values when USD cost, TRY cost, margin or USD rate changes
  const updateRowCostUsd = (id: string, newCostUsd: number) => {
    setItems((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const costTry = newCostUsd * usdRate;
        const saleTry = costTry * (1 + row.marginPercent / 100);
        const saleUsd = usdRate > 0 ? saleTry / usdRate : 0;
        const profitTry = saleTry - costTry;
        return { ...row, costUsd: newCostUsd, costTry, saleTry, saleUsd, profitTry };
      })
    );
  };

  const updateRowCostTry = (id: string, newCostTry: number) => {
    setItems((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const costUsd = usdRate > 0 ? newCostTry / usdRate : 0;
        const saleTry = newCostTry * (1 + row.marginPercent / 100);
        const saleUsd = usdRate > 0 ? saleTry / usdRate : 0;
        const profitTry = saleTry - newCostTry;
        return { ...row, costTry: newCostTry, costUsd, saleTry, saleUsd, profitTry };
      })
    );
  };

  const updateRowMargin = (id: string, newMarginPercent: number) => {
    setItems((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const saleTry = row.costTry * (1 + newMarginPercent / 100);
        const saleUsd = usdRate > 0 ? saleTry / usdRate : 0;
        const profitTry = saleTry - row.costTry;
        return { ...row, marginPercent: newMarginPercent, saleTry, saleUsd, profitTry };
      })
    );
  };

  const updateRowSaleTry = (id: string, newSaleTry: number) => {
    setItems((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const saleUsd = usdRate > 0 ? newSaleTry / usdRate : 0;
        const profitTry = newSaleTry - row.costTry;
        const marginPercent = row.costTry > 0 ? ((newSaleTry - row.costTry) / row.costTry) * 100 : 0;
        return { ...row, saleTry: newSaleTry, saleUsd, profitTry, marginPercent };
      })
    );
  };

  // Global Totals
  const totalCostTry = items.reduce((sum, r) => sum + r.costTry, 0);
  const totalCostUsd = items.reduce((sum, r) => sum + r.costUsd, 0);
  const totalSaleTryNakit = items.reduce((sum, r) => sum + r.saleTry, 0);
  const totalSaleUsdNakit = usdRate > 0 ? totalSaleTryNakit / usdRate : 0;
  const totalSaleEurNakit = eurRate > 0 ? totalSaleTryNakit / eurRate : 0;
  const totalProfitTry = items.reduce((sum, r) => sum + r.profitTry, 0);

  // Surcharged Totals
  const totalSaleTryIban = totalSaleTryNakit * (1 + ibanSurchargePercent / 100);
  const totalSaleTryCard = totalSaleTryNakit * (1 + cardSurchargePercent / 100);

  // Per Pax Totals
  const perPaxNakitTry = paxCount > 0 ? totalSaleTryNakit / paxCount : 0;
  const perPaxNakitUsd = paxCount > 0 ? totalSaleUsdNakit / paxCount : 0;

  // Generate WhatsApp Message text
  const generateWhatsAppMessage = () => {
    let msg = `*HADİ UMRE'YE GİDELİM - ÖZEL BİREYSEL UMRE TEKLİFİ*\n\n`;
    if (customerName) msg += `Sayın *${customerName}*,\n\n`;
    msg += `📍 *Mekke Oteli:* ${mekkeHotelName}\n`;
    msg += `📍 *Medine Oteli:* ${medineHotelName}\n`;
    msg += `👥 *Kişi Sayısı:* ${paxCount} Kişi\n\n`;
    msg += `*HİZMET DETAYLARI VE SATIŞ FİYATLARI:*\n`;
    items.forEach((item) => {
      if (item.saleTry > 0) {
        msg += `• ${item.name}: ₺${item.saleTry.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
      }
    });
    msg += `\n💳 *ÖDEME SEÇENEKLERİ (TOPLAM TUTAR):*\n`;
    msg += `💵 *Nakit / Peşin Ödeme:* ₺${totalSaleTryNakit.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ($${totalSaleUsdNakit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})\n`;
    msg += `🏦 *İBAN / Banka Transferi:* ₺${totalSaleTryIban.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
    msg += `💳 *Kredi Kartı Ödemesi:* ₺${totalSaleTryCard.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n`;
    msg += `👤 *Kişi Başı Nakit Tutarı:* $${perPaxNakitUsd.toFixed(2)} USD (₺${perPaxNakitTry.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})\n\n`;
    msg += `Görüşmek ve detayları netleştirmek üzere hayırlı günler dileriz. 🙏🏻✨`;
    return encodeURIComponent(msg);
  };

  return (
    <div className="space-y-8 max-w-screen-2xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-[#003781] to-slate-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold tracking-widest uppercase mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            EXCEL DİNAMİK FİYAT HESAPLAMA MOTORU
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold font-headline">Google Excel Canlı Fiyatlandırma Suite</h2>
          <p className="text-white/80 text-sm mt-1">
            Alış maliyetlerini girin, %10 kar marjını, İban ve Kredi kartı KDV komisyonlarını otomatik hesaplayın.
          </p>
        </div>

        {/* Currency Rates Bar */}
        <div className="flex flex-wrap items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shrink-0">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-200 mb-1">USD / TRY Kuru ($)</label>
            <input
              type="number"
              step="0.001"
              value={usdRate}
              onChange={(e) => setUsdRate(parseFloat(e.target.value) || 0)}
              className="bg-slate-900/80 text-white font-mono font-black px-3.5 py-1.5 rounded-xl text-sm w-32 outline-none border border-emerald-400/50 shadow-inner"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-200 mb-1">EUR / TRY Kuru (€)</label>
            <input
              type="number"
              step="0.001"
              value={eurRate}
              onChange={(e) => setEurRate(parseFloat(e.target.value) || 0)}
              className="bg-slate-900/80 text-white font-mono font-black px-3.5 py-1.5 rounded-xl text-sm w-32 outline-none border border-emerald-400/50 shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Customer & Hotel Info Inputs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase mb-1">Müşteri Ad Soyad</label>
          <input
            type="text"
            placeholder="Ahmet Yılmaz"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2 font-bold outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase mb-1">Müşteri Telefon</label>
          <input
            type="text"
            placeholder="+905051234567"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2 font-mono font-bold outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase mb-1">Mekke Oteli</label>
          <input
            type="text"
            value={mekkeHotelName}
            onChange={(e) => setMekkeHotelName(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2 font-bold outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase mb-1">Medine Oteli</label>
          <input
            type="text"
            value={medineHotelName}
            onChange={(e) => setMedineHotelName(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2 font-bold outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase mb-1">Kişi Sayısı (Pax)</label>
          <input
            type="number"
            min={1}
            value={paxCount}
            onChange={(e) => setPaxCount(parseInt(e.target.value) || 1)}
            className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2 font-extrabold outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Main Excel Line-Item Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-primary dark:text-sky-400">table_chart</span> HİZMET MALIYET VE KAR HESAPLAMA MATRİSİ
          </h3>
          <span className="text-xs font-mono text-slate-400">Formül: Alış + %Marj = Satış Fiyatı</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="p-4">Hizmet Adı</th>
                <th className="p-4">Dolar Alış ($)</th>
                <th className="p-4">Alış Fiyatı (₺)</th>
                <th className="p-4">Kar Marjı (%)</th>
                <th className="p-4">Satış Fiyatı (₺)</th>
                <th className="p-4">Dolar Satış ($)</th>
                <th className="p-4 text-emerald-600 dark:text-emerald-400">Kar Miktarı (₺)</th>
                <th className="p-4">Not / Formül</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium">
              {items.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{row.name}</td>
                  
                  {/* USD Cost Input */}
                  <td className="p-4">
                    <input
                      type="number"
                      step="0.01"
                      value={row.costUsd || ""}
                      onChange={(e) => updateRowCostUsd(row.id, parseFloat(e.target.value) || 0)}
                      className="w-28 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg px-2.5 py-1.5 font-mono font-extrabold outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </td>

                  {/* TRY Cost Input */}
                  <td className="p-4">
                    <input
                      type="number"
                      step="0.01"
                      value={row.costTry || ""}
                      onChange={(e) => updateRowCostTry(row.id, parseFloat(e.target.value) || 0)}
                      className="w-32 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg px-2.5 py-1.5 font-mono font-extrabold outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </td>

                  {/* Margin % Input */}
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-slate-800 dark:text-white">
                      <input
                        type="number"
                        value={row.marginPercent}
                        onChange={(e) => updateRowMargin(row.id, parseFloat(e.target.value) || 0)}
                        className="w-16 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg px-2 py-1.5 font-extrabold text-center outline-none focus:ring-2 focus:ring-sky-400"
                      />
                      <span className="font-bold">%</span>
                    </div>
                  </td>

                  {/* TRY Sale Input (Calculated / Editable) */}
                  <td className="p-4">
                    <input
                      type="number"
                      step="0.01"
                      value={row.saleTry ? row.saleTry.toFixed(2) : ""}
                      onChange={(e) => updateRowSaleTry(row.id, parseFloat(e.target.value) || 0)}
                      className="w-32 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-300 font-mono font-black rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </td>

                  {/* USD Sale (Calculated) */}
                  <td className="p-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                    ${row.saleUsd.toFixed(2)}
                  </td>

                  {/* Profit TRY */}
                  <td className="p-4 font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                    +₺{row.profitTry.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  {/* Note */}
                  <td className="p-4 text-slate-400 italic text-[11px]">{row.note}</td>
                </tr>
              ))}

              {/* Table Totals Row */}
              <tr className="bg-slate-100 dark:bg-slate-800/90 font-black text-sm border-t-2 border-slate-300 dark:border-slate-700">
                <td className="p-4 text-slate-900 dark:text-white uppercase">TOPLAM ALIŞ & SATIŞ</td>
                <td className="p-4 font-mono text-slate-900 dark:text-white">${totalCostUsd.toFixed(2)}</td>
                <td className="p-4 font-mono text-slate-900 dark:text-white">₺{totalCostTry.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="p-4 text-slate-400">-</td>
                <td className="p-4 font-mono text-emerald-600 dark:text-emerald-400">₺{totalSaleTryNakit.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="p-4 font-mono text-emerald-600 dark:text-emerald-400">${totalSaleUsdNakit.toFixed(2)}</td>
                <td className="p-4 font-mono text-emerald-600 dark:text-emerald-400">+₺{totalProfitTry.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="p-4 text-xs font-normal text-slate-400">Net Kar Hacmi</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards & Payment Options (Nakit / İban / Kredi Kartı) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Payment Methods Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">payments</span> ÖDEME SEÇENEKLERİ TABLOSU
          </h4>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex justify-between items-center">
              <div>
                <p className="font-bold text-emerald-900 dark:text-emerald-200">Nakit / Peşin Ödeme</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Standart Satış Fiyatı</p>
              </div>
              <p className="font-mono font-black text-emerald-700 dark:text-emerald-300 text-sm">
                ₺{totalSaleTryNakit.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex justify-between items-center">
              <div>
                <p className="font-bold text-blue-900 dark:text-blue-200">İBAN / Havale ile Ödeme (+%{ibanSurchargePercent})</p>
                <p className="text-[10px] text-blue-600 dark:text-blue-400">Fatura & KDV Dahil</p>
              </div>
              <p className="font-mono font-black text-blue-700 dark:text-blue-300 text-sm">
                ₺{totalSaleTryIban.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 flex justify-between items-center">
              <div>
                <p className="font-bold text-purple-900 dark:text-purple-200">Kredi Kartı ile Ödeme (+%{cardSurchargePercent})</p>
                <p className="text-[10px] text-purple-600 dark:text-purple-400">Banka Kart Komisyonu Dahil</p>
              </div>
              <p className="font-mono font-black text-purple-700 dark:text-purple-300 text-sm">
                ₺{totalSaleTryCard.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Currency & Pax Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="material-symbols-outlined text-primary dark:text-sky-400">currency_exchange</span> DÖVİZ VE KİŞİ BAŞI TUTARLAR
          </h4>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-bold">Kişi Başı Nakit Tutarı (USD)</span>
              <span className="font-mono font-black text-primary dark:text-sky-400 text-sm">${perPaxNakitUsd.toFixed(2)} USD</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-bold">Kişi Başı Nakit Tutarı (TRY)</span>
              <span className="font-mono font-black text-slate-800 dark:text-slate-100 text-sm">
                ₺{perPaxNakitTry.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-bold">Toplam Nakit Karşılığı (USD)</span>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">${totalSaleUsdNakit.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-bold">Toplam Nakit Karşılığı (EUR)</span>
              <span className="font-mono font-black text-indigo-600 dark:text-indigo-400 text-sm">€{totalSaleEurNakit.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Export & Actions */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="material-symbols-outlined text-emerald-500">send</span> TEKLİF & TEK TIKLA MÜŞTERİYE GÖNDER
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Excel hesaplama motorundan çıkan tüm detayları doğrudan WhatsApp mesajına dönüştürebilir veya CRM teklif kaydına çevirebilirsiniz.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <a
              href={`https://wa.me/${customerPhone.replace(/[^0-9]/g, "")}?text=${generateWhatsAppMessage()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-lg transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              1-Tıkla WhatsApp Teklifi Gönder
            </a>

            <Link
              href={`/admin/fiyat-teklifleri/yeni?name=${encodeURIComponent(customerName)}&phone=${encodeURIComponent(customerPhone)}`}
              className="w-full bg-primary hover:bg-[#002f6c] text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-lg transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">description</span>
              Fiyat Teklifi / Proforma PDF Oluştur
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
