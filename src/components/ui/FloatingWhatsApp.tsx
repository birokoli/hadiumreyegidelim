"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import WhatsAppIcon from "@/components/home/WhatsAppIcon";
import { whatsappLinki } from "@/lib/whatsapp-mesaj";

export default function FloatingWhatsApp() {
  const pathname = usePathname();
  const [whatsappNumber, setWhatsappNumber] = useState("905404010038");

  useEffect(() => {
    // Profil sayfalarında gösterme (Orada zaten çıkış yap butonu falan var, temiz kalsın)
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        const wa = Array.isArray(data) ? data.find((s: { key: string; value: string }) => s.key === "whatsappNumber") : null;
        if (wa?.value) setWhatsappNumber(wa.value.replace("+", ""));
      } catch (err) {
        console.error("WhatsApp numarası çekilemedi", err);
      }
    };
    fetchSettings();
  }, []);

  // Profil ve Admin ekranlarında gizle (Zaten admin layoutu ayri ama profil main icinde)
  if (pathname?.startsWith("/profil") || pathname?.startsWith("/admin")) return null;
  // Planlayıcı v2'nin kendi WhatsApp düğmesi ve alt toplam çubuğu var
  if (pathname === "/bireysel-umre") return null;
  // Telefonda gizli: mobil alt çubukta WhatsApp sekmesi var (src/components/layout/MobileTabBar.tsx)

  const handleWhatsAppClick = () => {
    window.open(whatsappLinki(whatsappNumber, pathname), "_blank");
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 hidden md:block animate-in fade-in slide-in-from-bottom-5 duration-700">
      <button
        onClick={handleWhatsAppClick}
        className="group flex flex-col items-center justify-center relative w-[52px] h-[52px] md:w-[60px] md:h-[60px] bg-[#25D366] rounded-[50%] shadow-2xl shadow-[#25D366]/30 hover:shadow-[#25D366]/50 transition-all hover:-translate-y-1 active:translate-y-0 border border-white/20"
        aria-label="WhatsApp ile iletişime geçin"
      >
        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 md:-top-1 md:-right-1 md:h-4 md:w-4">
          <span className="hidden md:inline-flex animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-full w-full bg-red-500 border-2 border-white"></span>
        </span>

        <WhatsAppIcon className="w-[28px] h-[28px] md:w-[34px] md:h-[34px] text-white relative z-10 transition-transform group-hover:scale-110" />

        {/* Hover Tooltip */}
        <div className="absolute right-[75px] top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-800 text-white text-xs font-medium font-headline whitespace-nowrap px-4 py-2.5 rounded-[12px] pointer-events-none shadow-xl flex items-center gap-2">
          Hızlı Destek Alın 
          <span className="relative flex h-2 w-2">
            <span className="hidden md:inline-flex animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </div>
      </button>
    </div>
  );
}
