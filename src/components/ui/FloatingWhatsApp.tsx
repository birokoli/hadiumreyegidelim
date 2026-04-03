"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function FloatingWhatsApp() {
  const pathname = usePathname();
  const [whatsappNumber, setWhatsappNumber] = useState("905404010038");

  useEffect(() => {
    // Profil sayfalarında gösterme (Orada zaten çıkış yap butonu falan var, temiz kalsın)
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        const wa = data.find((s: any) => s.key === "whatsappNumber");
        if (wa?.value) setWhatsappNumber(wa.value.replace("+", ""));
      } catch (err) {
        console.error("WhatsApp numarası çekilemedi", err);
      }
    };
    fetchSettings();
  }, []);

  // Profil ve Admin ekranlarında gizle (Zaten admin layoutu ayri ama profil main icinde)
  if (pathname?.startsWith("/profil") || pathname?.startsWith("/admin")) return null;

  const handleWhatsAppClick = () => {
    let contextMessage = "Merhaba, Hadi Umreye Gidelim hizmetleriniz hakkında bilgi almak istiyorum.";

    // Dinamik İçerik Yakalama (Context)
    if (pathname === "/bireysel-umre") {
      contextMessage = "Merhaba Yasin Bey, Bireysel Umre Konfigüratöründeyim. Özel Umre tasarımı hakkında fiyat ve destek almak istiyorum.";
    } else if (pathname === "/umre-vizesi") {
      contextMessage = "Merhaba, Suudi Arabistan Turist/Umre Vizesi sayfanızı inceliyorum. Acaba işlemler nasıl yürüyor bilgi alabilir miyim?";
    } else if (pathname.startsWith("/blog/")) {
      const slug = pathname.replace("/blog/", "");
      contextMessage = `Merhaba, blogunuzdaki "${slug}" başlıklı yazıyı okudum. Umre süreci hakkında size danışmak istediğim birkaç konu var.`;
    } else if (pathname.startsWith("/paketler/")) {
      contextMessage = "Merhaba, Vip Umre paketlerinizi inceliyorum. Bu paketin detayları hakkında görüşebilir miyiz?";
    } else if (pathname === "/") {
      contextMessage = "Merhaba Ana Sayfanızdan ulaşıyorum. Ailemle özel bir umre yapmak istiyorum, detaylı bilgi alabilir miyim?";
    }

    const text = encodeURIComponent(contextMessage);
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <button
        onClick={handleWhatsAppClick}
        className="group flex flex-col items-center justify-center relative w-[60px] h-[60px] bg-gradient-to-tr from-[#128C7E] to-[#25D366] rounded-[20px] shadow-2xl shadow-[#25D366]/30 hover:shadow-[#25D366]/50 transition-all hover:-translate-y-1 active:translate-y-0 border border-white/20"
        aria-label="WhatsApp ile iletişime geçin"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
        </span>

        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8 text-white relative z-10 filter drop-shadow-md transition-transform group-hover:scale-110"
        >
          <path
            d="M3 21L4.05353 17.1352C3.39655 15.9984 3.0505 14.7171 3.05068 13.4116C3.05101 8.76678 6.82827 4.98953 11.4735 4.98953C13.7258 4.99042 15.8643 5.86795 17.4566 7.46083C19.0489 9.05372 19.9255 11.1927 19.9246 13.4449C19.9243 18.0898 16.147 21.867 11.5018 21.867C10.2319 21.8668 8.98399 21.5435 7.87612 20.9298L3 21ZM8.08868 19.3878L8.35824 19.5478C9.30907 20.1119 10.3934 20.4093 11.5015 20.4094C15.3427 20.4094 18.467 17.285 18.4673 13.4441C18.4674 11.5824 17.7425 9.84045 16.4258 8.52331C15.1091 7.20618 13.3676 6.48074 11.5061 6.48037C7.66524 6.48037 4.54096 9.6047 4.54063 13.4457C4.54045 14.6015 4.86311 15.7277 5.4674 16.7029L5.64299 16.9822L4.99443 19.3585L7.42436 18.7212L8.08868 19.3878ZM15.5413 14.5057C15.32 14.395 14.4533 13.9687 14.2872 13.9084C14.121 13.8481 14.0002 13.8481 13.8794 14.0292C13.7585 14.2104 13.4061 14.6432 13.2953 14.774C13.1845 14.9048 13.0736 14.9199 12.8521 14.8093C12.6305 14.6986 11.9754 14.4842 11.1969 13.7915C10.5912 13.2526 10.1866 12.5898 10.0758 12.3986C9.965 12.2074 10.0637 12.1023 10.1742 11.9924C10.2737 11.8936 10.3948 11.7412 10.5056 11.6104C10.6163 11.4797 10.6534 11.3891 10.7272 11.2381C10.8011 11.0872 10.7641 10.9564 10.7088 10.8457C10.6534 10.735 10.2312 9.69837 10.0465 9.2774C9.8665 8.86756 9.68346 8.92487 9.53974 8.91428C9.40673 8.90455 9.28588 8.90382 9.16503 8.90382C9.04418 8.90382 8.84758 8.94911 8.68142 9.13028C8.51525 9.31145 8.04169 9.75433 8.04169 10.6552C8.04169 11.556 8.69654 12.4216 8.78713 12.5424C8.87771 12.6631 10.061 14.5684 11.9168 15.3406C12.3582 15.524 12.7032 15.6339 12.9739 15.7196C13.4173 15.8601 13.8213 15.8402 14.148 15.7922C14.5126 15.7388 15.2818 15.3183 15.4429 14.8553C15.6039 14.3924 15.6039 14.0044 15.5413 14.5057Z"
            fill="currentColor"
          />
        </svg>

        {/* Hover Tooltip */}
        <div className="absolute right-[75px] top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-800 text-white text-xs font-medium font-headline whitespace-nowrap px-4 py-2.5 rounded-[12px] pointer-events-none shadow-xl flex items-center gap-2">
          Hızlı Destek Alın 
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </div>
      </button>
    </div>
  );
}
