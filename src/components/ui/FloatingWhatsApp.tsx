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
        className="group flex items-center justify-center relative w-14 h-14 bg-[#25D366] hover:bg-[#128C7E] rounded-full shadow-lg shadow-[#25D366]/40 hover:shadow-xl hover:shadow-[#25D366]/60 transition-all hover:scale-110 active:scale-95 border-2 border-white/20"
        aria-label="WhatsApp ile iletişime geçin"
      >
        {/* Pulse Effect */}
        <span className="absolute inset-0 rounded-full animate-ping bg-[#25D366] opacity-30"></span>

        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8 text-white relative z-10"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12.013 2.013C6.514 2.013 2.04 6.476 2.04 11.96C2.04 13.9 2.585 15.719 3.524 17.274L2 22L6.877 20.485C8.423 21.365 10.198 21.848 12.013 21.848C17.513 21.848 21.986 17.385 21.986 11.96C21.986 6.536 17.513 2.013 12.013 2.013ZM18.066 16.516C17.818 17.214 16.837 17.784 16.035 17.947C15.485 18.06 14.675 18.147 11.666 16.89C8.267 15.469 6.068 11.986 5.904 11.771C5.741 11.554 4.544 9.972 4.544 8.324C4.544 6.676 5.394 5.867 5.738 5.518C6.015 5.236 6.49 5.084 6.95 5.084C7.098 5.084 7.23 5.091 7.346 5.097C7.74 5.114 7.935 5.137 8.196 5.767C8.508 6.517 9.258 8.358 9.358 8.563C9.456 8.769 9.586 9.03 9.472 9.278C9.358 9.508 9.258 9.684 9.062 9.897C8.866 10.113 8.682 10.274 8.472 10.518C8.275 10.733 8.046 10.976 8.324 11.454C8.6 11.92 9.254 12.986 10.217 13.842C11.464 14.949 12.464 15.3 12.972 15.515C13.38 15.688 13.87 15.654 14.164 15.34C14.54 14.938 15.012 14.246 15.5 13.551C15.842 13.064 16.282 12.997 16.738 13.172C17.195 13.344 19.61 14.536 20.082 14.774C20.554 15.012 20.882 15.132 21.002 15.337C21.121 15.543 21.121 16.516 18.066 16.516Z"
            fill="currentColor"
          />
        </svg>

        {/* Hover Tooltip */}
        <div className="absolute right-0 top-0 transform -translate-y-[120%] opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs font-bold font-headline whitespace-nowrap px-4 py-2 rounded-xl pointer-events-none after:content-[''] after:absolute after:bottom-[-6px] after:right-5 after:w-3 after:h-3 after:bg-slate-900 after:rotate-45">
          Soruların mı var? Yaz bana.
        </div>
      </button>
    </div>
  );
}
