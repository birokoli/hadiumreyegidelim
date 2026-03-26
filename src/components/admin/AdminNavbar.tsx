"use client";

import React from "react";

export default function AdminNavbar() {
  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl flex justify-between items-center px-8 h-20 shadow-[0_4px_32px_rgba(0,0,0,0.02)] border-b border-outline-variant/10">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
          <input
            type="text"
            placeholder="Panelleri, rehberleri, ayarları ara..."
            className="w-full bg-surface-container-low border-none rounded-full pl-12 pr-4 py-2.5 focus:ring-1 focus:ring-primary/20 outline-none text-sm transition-all"
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <button className="text-slate-500 hover:text-[#236B40] transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full outline outline-2 outline-white"></span>
          </button>
          <button className="text-slate-500 hover:text-[#236B40] transition-colors">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
        </div>
        <div className="h-10 w-px bg-outline-variant/20"></div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-primary">Yönetici</p>
            <p className="text-[10px] text-outline font-label tracking-widest uppercase">Sistem Yöneticisi</p>
          </div>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgh9C64Lf-9G0O4Tl1BouPnz4QvYLXWCrSOMbt88oGF_UZGkdhjI4L5hn0E3TK7kSAKIAH3Lgjy5qxrL-f7ofIG5ndNqtps0OrqkfTzL1jhTNK8brmE38QtlpSDMzFLhAmZtsKV4cyjgCbKArHTeZLreazxMMWPTzny7yvaoNAlTt1GIkzkiMl59nMrFQ7oc03KiuoMvm1LXEEherNXBF7WlwsA9GhaSkRG5VRawkwYZ9cJVEFNR4kNFbSUCI0s4tsXe1-YI7FOwg"
            alt="Admin Profile"
            className="w-10 h-10 rounded-full border-2 border-surface object-cover shadow-sm bg-surface-container-high"
          />
        </div>
      </div>
    </header>
  );
}
