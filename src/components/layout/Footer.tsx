import Link from "next/link";
import Image from "next/image";
import React from "react";

export default function Footer({ logoUrl }: { logoUrl?: string }) {
  return (
    <footer className="bg-surface-container-low w-full py-16 px-8 border-t border-slate-200 mt-20">
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center space-y-12 md:space-y-0">
        <div>
          <div className="mb-4">
            <Image src={logoUrl || "/logo.png"} alt="Hadi Umreye" width={240} height={80} className="h-16 w-auto object-contain" />
          </div>
          <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
            © {new Date().getFullYear()} Hadi Umreye - Butik ve Manevi Yolculuğunuz
          </p>
        </div>
        <div className="flex flex-wrap gap-x-12 gap-y-6">
          <Link className="font-label text-xs uppercase font-bold tracking-widest text-on-surface-variant hover:text-primary transition-all" href="#">
            Niyetimiz
          </Link>
          <Link className="font-label text-xs uppercase font-bold tracking-widest text-on-surface-variant hover:text-primary transition-all" href="#">
            Yol Arkadaşlığı
          </Link>
          <Link className="font-label text-xs uppercase font-bold tracking-widest text-on-surface-variant hover:text-primary transition-all" href="/rehber">
            Manevi Rehberlik
          </Link>
          <Link className="font-label text-xs uppercase font-bold tracking-widest text-on-surface-variant hover:text-primary transition-all" href="#">
            Kullanım Şartları
          </Link>
        </div>
        <div className="flex gap-4">
          <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:scale-110 active:scale-95 transition-transform border border-outline-variant/30">
            <span className="material-symbols-outlined text-xl" data-icon="share">
              share
            </span>
          </button>
          <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:scale-110 active:scale-95 transition-transform border border-outline-variant/30">
            <span className="material-symbols-outlined text-xl" data-icon="mail">
              mail
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
