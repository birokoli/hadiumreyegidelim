import Link from "next/link";
import Image from "next/image";
import React from "react";
import SeoCitiesFooter from "./SeoCitiesFooter";
import { getSiteSettings } from "@/lib/site-settings";
import { SOCIAL_BRANDS, SOCIAL_KEYS, SocialIcon } from "@/components/icons/SocialIcons";
import { getPageTexts } from "@/lib/page-texts";

function sanitizeUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url.replace(/^\/+/, '')}`;
}

async function getSocialLinks() {
  try {
    const settings = await getSiteSettings();
    return SOCIAL_KEYS.reduce((acc: Record<string, string>, key) => {
      if (settings[key]) acc[key] = sanitizeUrl(settings[key]);
      return acc;
    }, {});
  } catch {
    return {};
  }
}


export default async function Footer({ logoUrl }: { logoUrl?: string }) {
  const t = await getPageTexts("footer");
  const socialLinks = await getSocialLinks();
  const activeSocials = SOCIAL_KEYS.filter((key) => socialLinks[key]);

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
                © {new Date().getFullYear()} {t("copyright")}
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
                activeSocials.map((key) => (
                  <a
                    key={key}
                    href={socialLinks[key]}
                    target="_blank"
                    rel="noopener noreferrer me"
                    aria-label={SOCIAL_BRANDS[key].label}
                    title={SOCIAL_BRANDS[key].label}
                    style={{ color: SOCIAL_BRANDS[key].color }}
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-transform border border-outline-variant/30"
                  >
                    <SocialIcon name={key} />
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
          {/* Kurum bilgisi: küçük ama görünür (gizli metin arama motorlarınca cezalandırılır); şemadaki parentOrganization ile aynı */}
          <p className="mt-4 text-[10px] leading-relaxed text-on-surface-variant/60 max-w-3xl">
            {t("company_note")}
          </p>
        </div>
      </footer>
    </>
  );
}
