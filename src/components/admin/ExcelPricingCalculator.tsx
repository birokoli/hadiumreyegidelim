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
  marginPercent: number;
  saleTry: number;
  saleUsd: number;
  profitTry: number;
}

interface GroupPricingRow {
  id: string;
  category: string; // Yetişkin, Çocuk, Bebek
  duration: string; // 10 Gün, 15 Gün, 20 Gün, "-"
  roomType: string; // 2 Kişilik, 3 Kişilik, 4 Kişilik, "-"
  supplier: string; // Acenta
  costUsd: number;
  saleUsd: number;
  profitUsd: number;
}

interface GroupTraveler {
  id: string;
  siraNo: number;
  name: string;
  gender: "Erkek" | "Kadın";
  category: "Yetişkin" | "Çocuk (2-11)" | "Bebek (0-2)";
  duration: "10 Gün" | "15 Gün" | "20 Gün" | "-";
  roomType: "2 Kişilik" | "3 Kişilik" | "4 Kişilik" | "-";
  costUsd: number;
  saleUsd: number;
}

export default function ExcelPricingCalculator({ initialCustomerName, initialPhone }: { initialCustomerName?: string; initialPhone?: string }) {
  // Main Tab State
  const [activeTab, setActiveTab] = useState<"GRUP" | "UYGUN" | "ORTA" | "PAHALI">("GRUP");

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

  // -------------------------------------------------------------
  // GRUP UMRE TAB DATA (From Google Sheet "Grup" tab)
  // -------------------------------------------------------------
  const [groupRows, setGroupRows] = useState<GroupPricingRow[]>([
    { id: "g1", category: "Yetişkin", duration: "10 Gün", roomType: "2 Kişilik", supplier: "Acenta", costUsd: 1150, saleUsd: 1350, profitUsd: 200 },
    { id: "g2", category: "Yetişkin", duration: "10 Gün", roomType: "3 Kişilik", supplier: "Acenta", costUsd: 1100, saleUsd: 1300, profitUsd: 200 },
    { id: "g3", category: "Yetişkin", duration: "10 Gün", roomType: "4 Kişilik", supplier: "Acenta", costUsd: 1050, saleUsd: 1250, profitUsd: 200 },
    
    { id: "g4", category: "Yetişkin", duration: "15 Gün", roomType: "2 Kişilik", supplier: "Acenta", costUsd: 1200, saleUsd: 1400, profitUsd: 200 },
    { id: "g5", category: "Yetişkin", duration: "15 Gün", roomType: "3 Kişilik", supplier: "Acenta", costUsd: 1150, saleUsd: 1350, profitUsd: 200 },
    { id: "g6", category: "Yetişkin", duration: "15 Gün", roomType: "4 Kişilik", supplier: "Acenta", costUsd: 1100, saleUsd: 1300, profitUsd: 200 },

    { id: "g7", category: "Yetişkin", duration: "20 Gün", roomType: "2 Kişilik", supplier: "Acenta", costUsd: 1300, saleUsd: 1500, profitUsd: 200 },
    { id: "g8", category: "Yetişkin", duration: "20 Gün", roomType: "3 Kişilik", supplier: "Acenta", costUsd: 1250, saleUsd: 1450, profitUsd: 200 },
    { id: "g9", category: "Yetişkin", duration: "20 Gün", roomType: "4 Kişilik", supplier: "Acenta", costUsd: 1200, saleUsd: 1400, profitUsd: 200 },

    { id: "g10", category: "Çocuk (2-11)", duration: "-", roomType: "-", supplier: "Acenta", costUsd: 800, saleUsd: 1000, profitUsd: 200 },
    { id: "g11", category: "Bebek (0-2)", duration: "-", roomType: "-", supplier: "Acenta", costUsd: 500, saleUsd: 750, profitUsd: 250 },
  ]);

  // -------------------------------------------------------------
  // MÜŞTERİ KAYIT LİSTESİ (Group Travelers Registration List)
  // -------------------------------------------------------------
  const [groupTravelers, setGroupTravelers] = useState<GroupTraveler[]>([
    { id: "t1", siraNo: 1, name: "Ahmet Yılmaz", gender: "Erkek", category: "Yetişkin", duration: "15 Gün", roomType: "2 Kişilik", costUsd: 1200, saleUsd: 1400 },
    { id: "t2", siraNo: 2, name: "Ayşe Yılmaz", gender: "Kadın", category: "Yetişkin", duration: "15 Gün", roomType: "2 Kişilik", costUsd: 1200, saleUsd: 1400 },
    { id: "t3", siraNo: 3, name: "Mehmet Yılmaz", gender: "Erkek", category: "Çocuk (2-11)", duration: "-", roomType: "-", costUsd: 800, saleUsd: 1000 },
  ]);

  const addGroupTraveler = () => {
    const nextNo = groupTravelers.length + 1;
    const newTraveler: GroupTraveler = {
      id: `t_${Date.now()}`,
      siraNo: nextNo,
      name: `Müşteri ${nextNo}`,
      gender: "Erkek",
      category: "Yetişkin",
      duration: "15 Gün",
      roomType: "2 Kişilik",
      costUsd: 1200,
      saleUsd: 1400,
    };
    setGroupTravelers([...groupTravelers, newTraveler]);
  };

  const removeGroupTraveler = (id: string) => {
    setGroupTravelers(groupTravelers.filter((t) => t.id !== id).map((t, idx) => ({ ...t, siraNo: idx + 1 })));
  };

  const updateTravelerField = (id: string, field: keyof GroupTraveler, value: any) => {
    setGroupTravelers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, [field]: value };
        
        // Auto match cost & sale price from Group matrix if category/duration/roomType changed
        if (field === "category" || field === "duration" || field === "roomType") {
          const match = groupRows.find(
            (r) =>
              r.category === updated.category &&
              (updated.category !== "Yetişkin" || (r.duration === updated.duration && r.roomType === updated.roomType))
          );
          if (match) {
            updated.costUsd = match.costUsd;
            updated.saleUsd = match.saleUsd;
          }
        }
        return updated;
      })
    );
  };

  const updateGroupRowCost = (id: string, newCostUsd: number) => {
    setGroupRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const profitUsd = row.saleUsd - newCostUsd;
        return { ...row, costUsd: newCostUsd, profitUsd };
      })
    );
  };

  const updateGroupRowSale = (id: string, newSaleUsd: number) => {
    setGroupRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const profitUsd = newSaleUsd - row.costUsd;
        return { ...row, saleUsd: newSaleUsd, profitUsd };
      })
    );
  };

  // Group Totals calculated from actual registered travelers
  const registeredPaxCount = groupTravelers.length;
  const totalRegisteredSaleUsd = groupTravelers.reduce((sum, t) => sum + t.saleUsd, 0);
  const totalRegisteredCostUsd = groupTravelers.reduce((sum, t) => sum + t.costUsd, 0);
  const totalRegisteredProfitUsd = totalRegisteredSaleUsd - totalRegisteredCostUsd;
  const avgPaxSaleUsd = registeredPaxCount > 0 ? totalRegisteredSaleUsd / registeredPaxCount : 0;

  // -------------------------------------------------------------
  // INDIVIDUAL TABS DATA (UYGUN, ORTA, PAHALI)
  // -------------------------------------------------------------
  const [itemsUygun, setItemsUygun] = useState<PricingRow[]>([
    { id: "u1", name: "Uçak Bileti", category: "flight", note: "Alış * 1.10", costUsd: 0, costTry: 0, marginPercent: 10, saleTry: 0, saleUsd: 0, profitTry: 0 },
    { id: "u2", name: "Transfer (VIP)", category: "transfer", note: "GMC / Vito Karşılama", costUsd: 360.81, costTry: 16748.59, marginPercent: 10, saleTry: 18423.45, saleUsd: 381.97, profitTry: 1674.86 },
    { id: "u3", name: "Tren Bileti (Haramain)", category: "transfer", note: "Mekke - Medine Hızlı Tren", costUsd: 396.74, costTry: 18416.62, marginPercent: 10, saleTry: 20258.28, saleUsd: 420.01, profitTry: 1841.66 },
    { id: "u4", name: "Mekke Otel Konaklama", category: "hotel", note: "Manazel Ajyad", costUsd: 1524.09, costTry: 70809.44, marginPercent: 10, saleTry: 77890.38, saleUsd: 1614.88, profitTry: 7080.94 },
    { id: "u5", name: "Medine Otel Konaklama", category: "hotel", note: "Odst Al Madinah", costUsd: 322.71, costTry: 14993.05, marginPercent: 10, saleTry: 16492.36, saleUsd: 341.93, profitTry: 1499.31 },
    { id: "u6", name: "Manevi Rehber / Hoca", category: "guide", note: "Birebir Özel İlahiyatçı", costUsd: 1036.63, costTry: 50000, marginPercent: 0, saleTry: 50000, saleUsd: 1036.63, profitTry: 0 },
    { id: "u7", name: "Suudi Vize & Sigorta", category: "visa", note: "1 Yıllık E-Vize", costUsd: 896.61, costTry: 41656.64, marginPercent: 10, saleTry: 45822.30, saleUsd: 950.02, profitTry: 4165.66 },
  ]);

  const [itemsOrta, setItemsOrta] = useState<PricingRow[]>([
    { id: "o1", name: "Uçak Bileti", category: "flight", note: "THY / Saudia Tarifeli", costUsd: 1749.59, costTry: 84388, marginPercent: 10, saleTry: 92826.80, saleUsd: 1924.55, profitTry: 8438.80 },
    { id: "o2", name: "Transfer (VIP)", category: "transfer", note: "GMC / Vito Karşılama", costUsd: 360.81, costTry: 16748.59, marginPercent: 10, saleTry: 18423.45, saleUsd: 381.97, profitTry: 1674.86 },
    { id: "o3", name: "Tren Bileti (Haramain)", category: "transfer", note: "Mekke - Medine Hızlı Tren", costUsd: 396.74, costTry: 18416.62, marginPercent: 10, saleTry: 20258.28, saleUsd: 420.01, profitTry: 1841.66 },
    { id: "o4", name: "Mekke Otel Konaklama", category: "hotel", note: "Standart 4 Yıldız", costUsd: 1524.09, costTry: 70809.44, marginPercent: 10, saleTry: 77890.38, saleUsd: 1614.88, profitTry: 7080.94 },
    { id: "o5", name: "Medine Otel Konaklama", category: "hotel", note: "Standart 4 Yıldız", costUsd: 322.71, costTry: 14993.05, marginPercent: 10, saleTry: 16492.36, saleUsd: 341.93, profitTry: 1499.31 },
    { id: "o6", name: "Manevi Rehber / Hoca", category: "guide", note: "Birebir Özel İlahiyatçı", costUsd: 1036.63, costTry: 50000, marginPercent: 0, saleTry: 50000, saleUsd: 1036.63, profitTry: 0 },
    { id: "o7", name: "Suudi Vize & Sigorta", category: "visa", note: "1 Yıllık E-Vize", costUsd: 896.61, costTry: 41656.64, marginPercent: 10, saleTry: 45822.30, saleUsd: 950.02, profitTry: 4165.66 },
  ]);

  const [itemsPahali, setItemsPahali] = useState<PricingRow[]>([
    { id: "p1", name: "Transfer (VIP Private)", category: "transfer", note: "GMC Yukon Özel Ulaşım", costUsd: 109.11, costTry: 5065.11, marginPercent: 10, saleTry: 5571.63, saleUsd: 119.92, profitTry: 506.51 },
    { id: "p2", name: "Tren Bileti (Haramain Business)", category: "transfer", note: "VIP Business Vagon", costUsd: 231.18, costTry: 10731.53, marginPercent: 10, saleTry: 11804.69, saleUsd: 254.08, profitTry: 1073.15 },
    { id: "p3", name: "Mekke Otel (Fairmont / Clock Tower)", category: "hotel", note: "Kâbe Manzaralı 5 Yıldız Lüks", costUsd: 446.66, costTry: 20751.89, marginPercent: 10, saleTry: 22827.08, saleUsd: 491.33, profitTry: 2075.19 },
    { id: "p4", name: "Medine Otel (Oberoi / Dar Al Taqwa)", category: "hotel", note: "Mescid Manzaralı 5 Yıldız Lüks", costUsd: 270.22, costTry: 12554.19, marginPercent: 10, saleTry: 13809.61, saleUsd: 297.24, profitTry: 1255.42 },
    { id: "p5", name: "Suudi Vize & VIP Karşılama", category: "visa", note: "VIP Havalimanı Karşılama dahil", costUsd: 529.34, costTry: 24593.10, marginPercent: 10, saleTry: 26701.08, saleUsd: 574.71, profitTry: 2107.98 },
  ]);

  const currentItems = activeTab === "UYGUN" ? itemsUygun : activeTab === "ORTA" ? itemsOrta : itemsPahali;
  const setCurrentItems = activeTab === "UYGUN" ? setItemsUygun : activeTab === "ORTA" ? setItemsOrta : setItemsPahali;

  // Recalculators
  const updateRowCostUsdIndividual = (id: string, newCostUsd: number) => {
    setCurrentItems((prev) =>
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
    setCurrentItems((prev) =>
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
    setCurrentItems((prev) =>
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
    setCurrentItems((prev) =>
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
  const totalCostTry = currentItems.reduce((sum, r) => sum + r.costTry, 0);
  const totalCostUsd = currentItems.reduce((sum, r) => sum + r.costUsd, 0);
  const totalSaleTryNakit = currentItems.reduce((sum, r) => sum + r.saleTry, 0);
  const totalSaleUsdNakit = usdRate > 0 ? totalSaleTryNakit / usdRate : 0;
  const totalSaleEurNakit = eurRate > 0 ? totalSaleTryNakit / eurRate : 0;
  const totalProfitTry = currentItems.reduce((sum, r) => sum + r.profitTry, 0);

  // Surcharged Totals
  const totalSaleTryIban = totalSaleTryNakit * (1 + ibanSurchargePercent / 100);
  const totalSaleTryCard = totalSaleTryNakit * (1 + cardSurchargePercent / 100);

  // Per Pax Totals
  const perPaxNakitTry = paxCount > 0 ? totalSaleTryNakit / paxCount : 0;
  const perPaxNakitUsd = paxCount > 0 ? totalSaleUsdNakit / paxCount : 0;

  // Generate WhatsApp Message text
  const generateWhatsAppMessage = () => {
    let msg = `*HADİ UMRE'YE GİDELİM - ${activeTab} UMRE PAKET TEKLİFİ*\n\n`;
    if (customerName) msg += `Sayın *${customerName}*,\n\n`;
    msg += `📍 *Mekke Oteli:* ${mekkeHotelName}\n`;
    msg += `📍 *Medine Oteli:* ${medineHotelName}\n`;
    msg += `👥 *Kişi Sayısı:* ${paxCount} Kişi\n\n`;
    msg += `*HİZMET DETAYLARI VE SATIŞ FİYATLARI:*\n`;
    currentItems.forEach((item) => {
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
            Grup ve Bireysel Umre maliyetlerini girin, %10 kar marjını, İban ve Kredi kartı KDV komisyonlarını otomatik hesaplayın.
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

      {/* Main Tab Switcher (GRUP / UYGUN / ORTA / PAHALI) */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("GRUP")}
          className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "GRUP"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-500/50"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">groups</span>
          📊 GRUP UMRE FİYATLANDIRMA
        </button>

        <button
          onClick={() => setActiveTab("UYGUN")}
          className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "UYGUN"
              ? "bg-primary text-white shadow-lg shadow-primary/30 ring-2 ring-primary/50"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">savings</span>
          💚 EKONOMİK PAKET (UYGUN)
        </button>

        <button
          onClick={() => setActiveTab("ORTA")}
          className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "ORTA"
              ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30 ring-2 ring-amber-500/50"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">stars</span>
          💙 STANDART PAKET (ORTA)
        </button>

        <button
          onClick={() => setActiveTab("PAHALI")}
          className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "PAHALI"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-500/50"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
          👑 VIP LÜKS PAKET (PAHALI)
        </button>
      </div>

      {/* ============================================================= */}
      {/* TAB 1: GRUP UMRE FİYATLANDIRMA VIEW                           */}
      {/* ============================================================= */}
      {activeTab === "GRUP" && (
        <div className="space-y-8">
          {/* Top KPI Cards for Group (Auto-Calculated from Registered Travelers) */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">groups</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Toplam Müşteri</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{registeredPaxCount} Kişi</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">attach_money</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Toplam Satış ($)</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">${totalRegisteredSaleUsd.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">shopping_bag</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Toplam Maliyet ($)</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">${totalRegisteredCostUsd.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Toplam Kâr ($)</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">+${totalRegisteredProfitUsd.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">person_pin</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kişi Başı Ort. Fiyat ($)</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">${avgPaxSaleUsd.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Group Pricing Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-500">groups</span> GRUP UMRE FİYATLANDIRMA TARİFE MATRİSİ
              </h3>
              <span className="text-xs font-mono text-slate-400">10 Gün / 15 Gün / 20 Gün Paket Fiyatlaması</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4">Yaş / Kategori</th>
                    <th className="p-4">Paket Süresi</th>
                    <th className="p-4">Oda Tipi</th>
                    <th className="p-4">Tedarikçi</th>
                    <th className="p-4">Maliyet ($)</th>
                    <th className="p-4">Satış Fiyatı ($)</th>
                    <th className="p-4 text-emerald-600 dark:text-emerald-400">Kâr ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium">
                  {groupRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{row.category}</td>
                      <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{row.duration}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">{row.roomType}</td>
                      <td className="p-4 text-slate-500">{row.supplier}</td>

                      <td className="p-4">
                        <input
                          type="number"
                          value={row.costUsd}
                          onChange={(e) => updateGroupRowCost(row.id, parseFloat(e.target.value) || 0)}
                          className="w-28 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg px-2.5 py-1.5 font-mono font-extrabold outline-none focus:ring-2 focus:ring-sky-400"
                        />
                      </td>

                      <td className="p-4">
                        <input
                          type="number"
                          value={row.saleUsd}
                          onChange={(e) => updateGroupRowSale(row.id, parseFloat(e.target.value) || 0)}
                          className="w-28 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-300 font-mono font-black rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-emerald-400"
                        />
                      </td>

                      <td className="p-4 font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                        +${row.profitUsd.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ============================================================= */}
          {/* MÜŞTERİ KAYIT LİSTESİ (Group Travelers Registration List)    */}
          {/* ============================================================= */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden space-y-4 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary dark:text-sky-400">person_add</span> MÜŞTERİ KAYIT LİSTESİ (GRUP YOLCU LİSTESİ)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Gruba katılan yolcuları ekleyin. Oda ve süreye göre paket fiyatı tarifeden otomatik hesaplanır.
                </p>
              </div>

              <button
                onClick={addGroupTraveler}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Yeni Müşteri / Yolcu Ekle
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3 w-14">Sıra</th>
                    <th className="p-3">Müşteri Ad Soyad</th>
                    <th className="p-3">Cinsiyet</th>
                    <th className="p-3">Yaş / Kategori</th>
                    <th className="p-3">Paket Süresi</th>
                    <th className="p-3">Oda Tipi</th>
                    <th className="p-3">Maliyet ($)</th>
                    <th className="p-3">Satış Fiyatı ($)</th>
                    <th className="p-3 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium">
                  {groupTravelers.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-400">#{t.siraNo}</td>
                      
                      <td className="p-3">
                        <input
                          type="text"
                          value={t.name}
                          onChange={(e) => updateTravelerField(t.id, "name", e.target.value)}
                          className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg px-3 py-1 font-bold outline-none focus:ring-2 focus:ring-sky-400 w-44"
                        />
                      </td>

                      <td className="p-3">
                        <select
                          value={t.gender}
                          onChange={(e) => updateTravelerField(t.id, "gender", e.target.value)}
                          className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg px-2 py-1 font-semibold outline-none"
                        >
                          <option value="Erkek">Erkek</option>
                          <option value="Kadın">Kadın</option>
                        </select>
                      </td>

                      <td className="p-3">
                        <select
                          value={t.category}
                          onChange={(e) => updateTravelerField(t.id, "category", e.target.value)}
                          className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg px-2 py-1 font-semibold outline-none"
                        >
                          <option value="Yetişkin">Yetişkin</option>
                          <option value="Çocuk (2-11)">Çocuk (2-11)</option>
                          <option value="Bebek (0-2)">Bebek (0-2)</option>
                        </select>
                      </td>

                      <td className="p-3">
                        <select
                          value={t.duration}
                          disabled={t.category !== "Yetişkin"}
                          onChange={(e) => updateTravelerField(t.id, "duration", e.target.value)}
                          className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg px-2 py-1 font-semibold outline-none disabled:opacity-40"
                        >
                          <option value="10 Gün">10 Gün</option>
                          <option value="15 Gün">15 Gün</option>
                          <option value="20 Gün">20 Gün</option>
                          <option value="-">-</option>
                        </select>
                      </td>

                      <td className="p-3">
                        <select
                          value={t.roomType}
                          disabled={t.category !== "Yetişkin"}
                          onChange={(e) => updateTravelerField(t.id, "roomType", e.target.value)}
                          className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg px-2 py-1 font-semibold outline-none disabled:opacity-40"
                        >
                          <option value="2 Kişilik">2 Kişilik</option>
                          <option value="3 Kişilik">3 Kişilik</option>
                          <option value="4 Kişilik">4 Kişilik</option>
                          <option value="-">-</option>
                        </select>
                      </td>

                      <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                        ${t.costUsd.toFixed(2)}
                      </td>

                      <td className="p-3 font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                        ${t.saleUsd.toFixed(2)} (₺{(t.saleUsd * usdRate).toLocaleString("tr-TR", { maximumFractionDigits: 0 })})
                      </td>

                      <td className="p-3 text-right">
                        <button
                          onClick={() => removeGroupTraveler(t.id)}
                          className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                          title="Sil"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TABS 2, 3, 4: UYGUN / ORTA / PAHALI (BİREYSEL INDIVIDUAL VIEW)  */}
      {/* ============================================================= */}
      {activeTab !== "GRUP" && (
        <div className="space-y-8">
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

          {/* Main Line-Item Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-primary dark:text-sky-400">table_chart</span> {activeTab} PAKET HİZMET MALİYET VE KAR MATRİSİ
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
                  {currentItems.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{row.name}</td>

                      <td className="p-4">
                        <input
                          type="number"
                          step="0.01"
                          value={row.costUsd || ""}
                          onChange={(e) => updateRowCostUsdIndividual(row.id, parseFloat(e.target.value) || 0)}
                          className="w-28 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg px-2.5 py-1.5 font-mono font-extrabold outline-none focus:ring-2 focus:ring-sky-400"
                        />
                      </td>

                      <td className="p-4">
                        <input
                          type="number"
                          step="0.01"
                          value={row.costTry || ""}
                          onChange={(e) => updateRowCostTry(row.id, parseFloat(e.target.value) || 0)}
                          className="w-32 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg px-2.5 py-1.5 font-mono font-extrabold outline-none focus:ring-2 focus:ring-sky-400"
                        />
                      </td>

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

                      <td className="p-4">
                        <input
                          type="number"
                          step="0.01"
                          value={row.saleTry ? row.saleTry.toFixed(2) : ""}
                          onChange={(e) => updateRowSaleTry(row.id, parseFloat(e.target.value) || 0)}
                          className="w-32 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-300 font-mono font-black rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-emerald-400"
                        />
                      </td>

                      <td className="p-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                        ${row.saleUsd.toFixed(2)}
                      </td>

                      <td className="p-4 font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                        +₺{row.profitTry.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      <td className="p-4 text-slate-400 italic text-[11px]">{row.note}</td>
                    </tr>
                  ))}

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

          {/* Summary Cards & Payment Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      )}
    </div>
  );
}
