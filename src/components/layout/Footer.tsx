import Link from "next/link";
import Image from "next/image";
import React from "react";
import SeoCitiesFooter from "./SeoCitiesFooter";
import { prisma } from "@/lib/prisma";

function sanitizeUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url.replace(/^\/+/, '')}`;
}

async function getSocialLinks() {
  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: ['SOCIAL_INSTAGRAM', 'SOCIAL_FACEBOOK', 'SOCIAL_YOUTUBE', 'SOCIAL_TWITTER', 'SOCIAL_TIKTOK'] } }
    });
    return settings.reduce((acc: Record<string, string>, s) => {
      acc[s.key] = sanitizeUrl(s.value);
      return acc;
    }, {});
  } catch {
    return {};
  }
}

const SOCIAL_ICONS: Record<string, { icon: string; label: string }> = {
  SOCIAL_INSTAGRAM: { icon: 'photo_camera',    label: 'Instagram' },
  SOCIAL_FACEBOOK:  { icon: 'thumb_up',         label: 'Facebook'  },
  SOCIAL_YOUTUBE:   { icon: 'play_circle',      label: 'YouTube'   },
  SOCIAL_TWITTER:   { icon: 'alternate_email',  label: 'X/Twitter' },
  SOCIAL_TIKTOK:    { icon: 'music_video',      label: 'TikTok'    },
};

export default async function Footer({ logoUrl }: { logoUrl?: string }) {
  const socialLinks = await getSocialLinks();
  const activeSocials = Object.entries(SOCIAL_ICONS).filter(([key]) => socialLinks[key]);

  return (
    <>
      <SeoCitiesFooter />
      <footer className="bg-surface-container-low w-full py-16 px-8 border-t border-slate-200">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-12">
            <div>
              <div className="mb-4">
                <Image src={logoUrl || "/logo.png"} alt="Hadi Umreye" width={240} height={80} className="h-16 w-auto object-contain" />
              </div>
              <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
                © {new Date().getFullYear()} Hadi Umreye - Butik ve Manevi Yolculuğunuz
              </p>
            </div>
            <div className="flex flex-wrap gap-x-12 gap-y-6">
              <Link className="font-label text-xs uppercase font-bold tracking-widest text-on-surface-variant hover:text-primary transition-all" href="/bireysel-umre">
                Bireysel Umre
              </Link>
              <Link className="font-label text-xs uppercase font-bold tracking-widest text-on-surface-variant hover:text-primary transition-all" href="/paketler">
                Paketler
              </Link>
              <Link className="font-label text-xs uppercase font-bold tracking-widest text-on-surface-variant hover:text-primary transition-all" href="/rehberlik">
                Manevi Rehberlik
              </Link>
              <Link className="font-label text-xs uppercase font-bold tracking-widest text-on-surface-variant hover:text-primary transition-all" href="/blog">
                Blog
              </Link>
              <Link className="font-label text-xs uppercase font-bold tracking-widest text-on-surface-variant hover:text-primary transition-all" href="/hakkimizda">
                Hakkımızda
              </Link>
              <Link className="font-label text-xs uppercase font-bold tracking-widest text-on-surface-variant hover:text-primary transition-all" href="/iletisim">
                İletişim
              </Link>
            </div>
            <div className="flex gap-3 flex-wrap">
              {activeSocials.length > 0 ? (
                activeSocials.map(([key, { icon, label }]) => (
                  <a
                    key={key}
                    href={socialLinks[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={label}
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:scale-110 active:scale-95 transition-transform border border-outline-variant/30 hover:bg-primary hover:text-white"
                  >
                    <span className="material-symbols-outlined text-[20px]">{icon}</span>
                  </a>
                ))
              ) : (
                <>
                  <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:scale-110 active:scale-95 transition-transform border border-outline-variant/30">
                    <span className="material-symbols-outlined text-xl">share</span>
                  </button>
                  <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:scale-110 active:scale-95 transition-transform border border-outline-variant/30">
                    <span className="material-symbols-outlined text-xl">mail</span>
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="border-t border-slate-200/60 pt-6 flex flex-wrap gap-x-8 gap-y-3">
            <Link className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60 hover:text-primary transition-all" href="/kvkk">
              KVKK
            </Link>
            <Link className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60 hover:text-primary transition-all" href="/gizlilik-politikasi">
              Gizlilik Politikası
            </Link>
            <Link className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60 hover:text-primary transition-all" href="/kullanim-sartlari">
              Kullanım Şartları
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
