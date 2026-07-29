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
    <div className="space-y-6 max-w-7xl mx-auto bg-white text-zinc-900">
      {/* Top Header Card - Swiss Style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-zinc-200">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">SATIS & CRM MOTORU</span>
          <h2 className="text-2xl font-light tracking-tight text-zinc-900 mt-1">Excel Canlı Fiyatlandırma Motoru</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Grup ve Bireysel Umre maliyetlerini girin, %10 kar marjını ve banka komisyonlarını otomatik hesaplayın.
          </p>
        </div>

        {/* Currency Rates Bar */}
        <div className="flex items-center gap-4 bg-zinc-50 p-3 rounded border border-zinc-200 shrink-0">
          <div>
            <label className="block text-[9px] uppercase font-bold text-zinc-400 mb-1">USD / TRY ($)</label>
            <input
              type="number"
              step="0.001"
              value={usdRate}
              onChange={(e) => setUsdRate(parseFloat(e.target.value) || 0)}
              className="bg-white text-zinc-900 font-mono font-bold px-2.5 py-1 rounded text-xs w-24 outline-none border border-zinc-300"
            />
          </div>
          <div>
            <label className="block text-[9px] uppercase font-bold text-zinc-400 mb-1">EUR / TRY (€)</label>
            <input
              type="number"
              step="0.001"
              value={eurRate}
              onChange={(e) => setEurRate(parseFloat(e.target.value) || 0)}
              className="bg-white text-zinc-900 font-mono font-bold px-2.5 py-1 rounded text-xs w-24 outline-none border border-zinc-300"
            />
          </div>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-3 overflow-x-auto">
        {[
          { key: "GRUP", label: "GRUP UMRE" },
          { key: "UYGUN", label: "EKONOMİK (UYGUN)" },
          { key: "ORTA", label: "STANDART (ORTA)" },
          { key: "PAHALI", label: "VIP LÜKS (PAHALI)" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded text-xs font-medium border transition-colors ${
              activeTab === tab.key
                ? "bg-zinc-900 text-white border-zinc-900 font-semibold"
                : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================================= */}
      {/* TAB 1: GRUP UMRE FİYATLANDIRMA VIEW                           */}
      {/* ============================================================= */}
      {activeTab === "GRUP" && (
        <div className="space-y-8">
          {/* Top KPI Cards for Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 rounded border border-zinc-200 bg-zinc-50/50 flex flex-col justify-between">
              <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">MÜŞTERİ</span>
              <div>
                <p className="text-xs text-zinc-500 font-medium">Toplam Yolcu</p>
                <p className="text-xl font-light text-zinc-900 mt-0.5">{registeredPaxCount} Kişi</p>
              </div>
            </div>

            <div className="p-4 rounded border border-zinc-200 bg-zinc-50/50 flex flex-col justify-between">
              <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">SATIŞ</span>
              <div>
                <p className="text-xs text-zinc-500 font-medium">Toplam Satış ($)</p>
                <p className="text-xl font-light text-zinc-900 mt-0.5">${totalRegisteredSaleUsd.toLocaleString()}</p>
              </div>
            </div>

            <div className="p-4 rounded border border-zinc-200 bg-zinc-50/50 flex flex-col justify-between">
              <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">MALİYET</span>
              <div>
                <p className="text-xs text-zinc-500 font-medium">Toplam Maliyet ($)</p>
                <p className="text-xl font-light text-zinc-900 mt-0.5">${totalRegisteredCostUsd.toLocaleString()}</p>
              </div>
            </div>

            <div className="p-4 rounded border border-zinc-200 bg-zinc-50/50 flex flex-col justify-between">
              <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">KÂR</span>
              <div>
                <p className="text-xs text-zinc-500 font-medium">Toplam Kâr ($)</p>
                <p className="text-xl font-light text-zinc-900 mt-0.5">+${totalRegisteredProfitUsd.toLocaleString()}</p>
              </div>
            </div>

            <div className="p-4 rounded border border-zinc-200 bg-zinc-50/50 flex flex-col justify-between">
              <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">ORTALAMA</span>
              <div>
                <p className="text-xs text-zinc-500 font-medium">Kişi Başı Ortalama</p>
                <p className="text-xl font-light text-zinc-900 mt-0.5">${avgPaxSaleUsd.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Group Pricing Table */}
          <div className="border border-zinc-200 rounded overflow-hidden">
            <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-200 flex justify-between items-center">
              <h3 className="font-semibold text-xs text-zinc-900 uppercase tracking-wider">
                GRUP UMRE FİYATLANDIRMA TARİFE MATRİSİ
              </h3>
              <span className="text-[11px] font-mono text-zinc-400">10 Gün / 15 Gün / 20 Gün Paket Fiyatlaması</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Yaş / Kategori</th>
                    <th className="p-3">Paket Süresi</th>
                    <th className="p-3">Oda Tipi</th>
                    <th className="p-3">Tedarikçi</th>
                    <th className="p-3">Maliyet ($)</th>
                    <th className="p-3">Satış Fiyatı ($)</th>
                    <th className="p-3">Kâr ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {groupRows.map((row) => (
                    <tr key={row.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-3 font-semibold text-zinc-900">{row.category}</td>
                      <td className="p-3 text-zinc-700">{row.duration}</td>
                      <td className="p-3 text-zinc-500">{row.roomType}</td>
                      <td className="p-3 text-zinc-400">{row.supplier}</td>

                      <td className="p-3">
                        <input
                          type="number"
                          value={row.costUsd}
                          onChange={(e) => updateGroupRowCost(row.id, parseFloat(e.target.value) || 0)}
                          className="w-24 bg-white border border-zinc-200 text-zinc-900 rounded px-2 py-1 font-mono font-bold outline-none"
                        />
                      </td>

                      <td className="p-3">
                        <input
                          type="number"
                          value={row.saleUsd}
                          onChange={(e) => updateGroupRowSale(row.id, parseFloat(e.target.value) || 0)}
                          className="w-24 bg-white border border-zinc-200 text-zinc-900 font-mono font-bold rounded px-2 py-1 outline-none"
                        />
                      </td>

                      <td className="p-3 font-mono font-bold text-zinc-900">
                        +${row.profitUsd.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MÜŞTERİ KAYIT LİSTESİ (Group Travelers Registration List) */}
          <div className="bg-white rounded border border-zinc-200 overflow-hidden space-y-4 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
              <div>
                <h3 className="font-semibold text-xs text-zinc-900 uppercase tracking-wider">
                  MÜŞTERİ KAYIT LİSTESİ (GRUP YOLCU LİSTESİ)
                </h3>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Gruba katılan yolcuları ekleyin. Paket fiyatı tarifeden otomatik hesaplanır.
                </p>
              </div>

              <button
                onClick={addGroupTraveler}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium px-4 py-2 rounded text-xs inline-flex items-center gap-1.5 transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Yeni Müşteri / Yolcu Ekle</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  <tr>
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
                <tbody className="divide-y divide-zinc-100 font-medium">
                  {groupTravelers.map((t) => (
                    <tr key={t.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-zinc-400">#{t.siraNo}</td>
                      
                      <td className="p-3">
                        <input
                          type="text"
                          value={t.name}
                          onChange={(e) => updateTravelerField(t.id, "name", e.target.value)}
                          className="bg-white border border-zinc-200 text-zinc-900 rounded px-2.5 py-1 font-bold outline-none w-44"
                        />
                      </td>

                      <td className="p-3">
                        <select
                          value={t.gender}
                          onChange={(e) => updateTravelerField(t.id, "gender", e.target.value)}
                          className="bg-white border border-zinc-200 text-zinc-900 rounded px-2 py-1 font-medium outline-none"
                        >
                          <option value="Erkek">Erkek</option>
                          <option value="Kadın">Kadın</option>
                        </select>
                      </td>

                      <td className="p-3">
                        <select
                          value={t.category}
                          onChange={(e) => updateTravelerField(t.id, "category", e.target.value)}
                          className="bg-white border border-zinc-200 text-zinc-900 rounded px-2 py-1 font-medium outline-none"
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
                          className="bg-white border border-zinc-200 text-zinc-900 rounded px-2 py-1 font-medium outline-none disabled:opacity-40"
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
                          className="bg-white border border-zinc-200 text-zinc-900 rounded px-2 py-1 font-medium outline-none disabled:opacity-40"
                        >
                          <option value="2 Kişilik">2 Kişilik</option>
                          <option value="3 Kişilik">3 Kişilik</option>
                          <option value="4 Kişilik">4 Kişilik</option>
                          <option value="-">-</option>
                        </select>
                      </td>

                      <td className="p-3 font-mono font-bold text-zinc-900">
                        ${t.costUsd.toFixed(2)}
                      </td>

                      <td className="p-3 font-mono font-bold text-zinc-900">
                        ${t.saleUsd.toFixed(2)} (₺{(t.saleUsd * usdRate).toLocaleString("tr-TR", { maximumFractionDigits: 0 })})
                      </td>

                      <td className="p-3 text-right">
                        <button
                          onClick={() => removeGroupTraveler(t.id)}
                          className="p-1 rounded text-zinc-400 hover:text-red-600 transition-all"
                          title="Sil"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
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
        <div className="space-y-8 text-xs">
          {/* Customer & Hotel Info Inputs */}
          <div className="bg-zinc-50 border border-zinc-200 p-4 rounded grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Müşteri Ad Soyad</label>
              <input
                type="text"
                placeholder="Ahmet Yılmaz"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-white border border-zinc-200 text-zinc-900 rounded px-2.5 py-1.5 font-semibold outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Müşteri Telefon</label>
              <input
                type="text"
                placeholder="+905051234567"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-white border border-zinc-200 text-zinc-900 rounded px-2.5 py-1.5 font-mono font-semibold outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Mekke Oteli</label>
              <input
                type="text"
                value={mekkeHotelName}
                onChange={(e) => setMekkeHotelName(e.target.value)}
                className="w-full bg-white border border-zinc-200 text-zinc-900 rounded px-2.5 py-1.5 font-semibold outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Medine Oteli</label>
              <input
                type="text"
                value={medineHotelName}
                onChange={(e) => setMedineHotelName(e.target.value)}
                className="w-full bg-white border border-zinc-200 text-zinc-900 rounded px-2.5 py-1.5 font-semibold outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Kişi Sayısı (Pax)</label>
              <input
                type="number"
                min={1}
                value={paxCount}
                onChange={(e) => setPaxCount(parseInt(e.target.value) || 1)}
                className="w-full bg-white border border-zinc-200 text-zinc-900 rounded px-2.5 py-1.5 font-semibold outline-none"
              />
            </div>
          </div>

          {/* Main Line-Item Table */}
          <div className="border border-zinc-200 rounded overflow-hidden">
            <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-200 flex justify-between items-center">
              <h3 className="font-semibold text-xs text-zinc-900 uppercase tracking-wider">
                {activeTab} PAKET HİZMET MALİYET VE KAR MATRİSİ
              </h3>
              <span className="text-[11px] font-mono text-zinc-400">Formül: Alış + %Marj = Satış Fiyatı</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Hizmet Adı</th>
                    <th className="p-3">Dolar Alış ($)</th>
                    <th className="p-3">Alış Fiyatı (₺)</th>
                    <th className="p-3">Kar Marjı (%)</th>
                    <th className="p-3">Satış Fiyatı (₺)</th>
                    <th className="p-3">Dolar Satış ($)</th>
                    <th className="p-3">Kar Miktarı (₺)</th>
                    <th className="p-3">Not</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {currentItems.map((row) => (
                    <tr key={row.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-3 font-semibold text-zinc-900">{row.name}</td>

                      <td className="p-3">
                        <input
                          type="number"
                          step="0.01"
                          value={row.costUsd || ""}
                          onChange={(e) => updateRowCostUsdIndividual(row.id, parseFloat(e.target.value) || 0)}
                          className="w-24 bg-white border border-zinc-200 text-zinc-900 rounded px-2 py-1 font-mono font-bold outline-none"
                        />
                      </td>

                      <td className="p-3">
                        <input
                          type="number"
                          step="0.01"
                          value={row.costTry || ""}
                          onChange={(e) => updateRowCostTry(row.id, parseFloat(e.target.value) || 0)}
                          className="w-24 bg-white border border-zinc-200 text-zinc-900 rounded px-2 py-1 font-mono font-bold outline-none"
                        />
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-1 text-zinc-900">
                          <input
                            type="number"
                            value={row.marginPercent}
                            onChange={(e) => updateRowMargin(row.id, parseFloat(e.target.value) || 0)}
                            className="w-14 bg-white border border-zinc-200 text-zinc-900 rounded px-1.5 py-1 font-bold text-center outline-none"
                          />
                          <span className="font-bold">%</span>
                        </div>
                      </td>

                      <td className="p-3">
                        <input
                          type="number"
                          step="0.01"
                          value={row.saleTry ? row.saleTry.toFixed(2) : ""}
                          onChange={(e) => updateRowSaleTry(row.id, parseFloat(e.target.value) || 0)}
                          className="w-28 bg-white border border-zinc-200 text-zinc-900 font-mono font-bold rounded px-2 py-1 outline-none"
                        />
                      </td>

                      <td className="p-3 font-mono font-bold text-zinc-900">
                        ${row.saleUsd.toFixed(2)}
                      </td>

                      <td className="p-3 font-mono font-bold text-zinc-900">
                        +₺{row.profitTry.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      <td className="p-3 text-zinc-400 italic text-[11px]">{row.note}</td>
                    </tr>
                  ))}

                  <tr className="bg-zinc-50 font-bold text-xs border-t border-zinc-200">
                    <td className="p-3 text-zinc-900 uppercase">TOPLAM ALIŞ & SATIŞ</td>
                    <td className="p-3 font-mono text-zinc-900">${totalCostUsd.toFixed(2)}</td>
                    <td className="p-3 font-mono text-zinc-900">₺{totalCostTry.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="p-3 text-zinc-400">-</td>
                    <td className="p-3 font-mono text-zinc-900">₺{totalSaleTryNakit.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="p-3 font-mono text-zinc-900">${totalSaleUsdNakit.toFixed(2)}</td>
                    <td className="p-3 font-mono text-zinc-900">+₺{totalProfitTry.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="p-3 text-[11px] font-normal text-zinc-400">Net Kar Hacmi</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Cards & Payment Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded border border-zinc-200 space-y-3">
              <h4 className="font-semibold text-xs text-zinc-900 uppercase tracking-wider border-b border-zinc-200 pb-2">
                ÖDEME SEÇENEKLERİ TABLOSU
              </h4>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded bg-zinc-50 border border-zinc-200 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-zinc-900">Nakit / Peşin Ödeme</p>
                    <p className="text-[10px] text-zinc-500">Standart Satış Fiyatı</p>
                  </div>
                  <p className="font-mono font-bold text-zinc-900 text-xs">
                    ₺{totalSaleTryNakit.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="p-2.5 rounded bg-zinc-50 border border-zinc-200 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-zinc-900">İBAN / Havale (+%{ibanSurchargePercent})</p>
                    <p className="text-[10px] text-zinc-500">Fatura & KDV Dahil</p>
                  </div>
                  <p className="font-mono font-bold text-zinc-900 text-xs">
                    ₺{totalSaleTryIban.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="p-2.5 rounded bg-zinc-50 border border-zinc-200 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-zinc-900">Kredi Kartı (+%{cardSurchargePercent})</p>
                    <p className="text-[10px] text-zinc-500">Banka Kart Komisyonu Dahil</p>
                  </div>
                  <p className="font-mono font-bold text-zinc-900 text-xs">
                    ₺{totalSaleTryCard.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded border border-zinc-200 space-y-3">
              <h4 className="font-semibold text-xs text-zinc-900 uppercase tracking-wider border-b border-zinc-200 pb-2">
                DÖVİZ VE KİŞİ BAŞI TUTARLAR
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2 rounded bg-zinc-50">
                  <span className="text-zinc-500 font-medium">Kişi Başı Nakit (USD)</span>
                  <span className="font-mono font-bold text-zinc-900">${perPaxNakitUsd.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center p-2 rounded bg-zinc-50">
                  <span className="text-zinc-500 font-medium">Kişi Başı Nakit (TRY)</span>
                  <span className="font-mono font-bold text-zinc-900">
                    ₺{perPaxNakitTry.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center p-2 rounded bg-zinc-50">
                  <span className="text-zinc-500 font-medium">Toplam Nakit (USD)</span>
                  <span className="font-mono font-bold text-zinc-900">${totalSaleUsdNakit.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center p-2 rounded bg-zinc-50">
                  <span className="text-zinc-500 font-medium">Toplam Nakit (EUR)</span>
                  <span className="font-mono font-bold text-zinc-900">€{totalSaleEurNakit.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded border border-zinc-200 space-y-3">
              <h4 className="font-semibold text-xs text-zinc-900 uppercase tracking-wider border-b border-zinc-200 pb-2">
                TEKLİF AKSİYONLARI
              </h4>

              <div className="space-y-2 text-xs">
                <button
                  onClick={handleCopyToClipboard}
                  className="w-full py-2 bg-zinc-900 text-white rounded font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  <span>WhatsApp İzin Metni Kopyala</span>
                </button>

                <button
                  onClick={handleCreateQuotationDatabase}
                  className="w-full py-2 bg-white border border-zinc-200 text-zinc-900 rounded font-medium hover:border-zinc-900 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Teklifi Veritabanına Kaydet</span>
                </button>

                {pdfCreatedId && (
                  <a
                    href={`/api/admin/quotations/${pdfCreatedId}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 bg-zinc-100 text-zinc-900 rounded font-medium text-center block hover:bg-zinc-200"
                  >
                    PDF İndir / Görüntüle
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
