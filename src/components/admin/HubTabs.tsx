"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type HubKey =
  | "satis"
  | "urun"
  | "blog"
  | "site"
  | "influencer"
  | "gorunurluk"
  | "sohbet"
  | "sistem";

interface TabItem {
  label: string;
  href: string;
  exact?: boolean;
}

export const HUBS: Record<HubKey, TabItem[]> = {
  satis: [
    { label: "Talepler ve iletişim", href: "/admin/contact" },
    { label: "Siparişler", href: "/admin/orders" },
    { label: "CRM", href: "/admin/crm" },
    { label: "Fiyat teklifleri", href: "/admin/fiyat-teklifleri", exact: true },
  ],
  urun: [
    { label: "Paketler", href: "/admin/packages" },
    { label: "Hizmet kütüphanesi", href: "/admin/fiyat-teklifleri/hizmetler", exact: true },
    { label: "Aylık fiyatlar", href: "/admin/fiyat-teklifleri/hizmetler/fiyatlar" },
    { label: "Ek hizmetler", href: "/admin/services" },
    { label: "Rehberler", href: "/admin/guides" },
    { label: "Otel Rehberi", href: "/admin/otel-rehberi" },
  ],
  blog: [
    { label: "Yazılar", href: "/admin/content", exact: true },
    { label: "Konu kuyruğu", href: "/admin/blog-kuyrugu" },
    { label: "Kategoriler", href: "/admin/categories" },
    { label: "Yazarlar", href: "/admin/authors" },
  ],
  site: [
    { label: "Sayfa metinleri", href: "/admin/sayfa-metinleri" },
    { label: "Yardım merkezi", href: "/admin/yardim-merkezi" },
    { label: "Rehber sayfaları", href: "/admin/content/rehber" },
    { label: "Kampanya sayfaları", href: "/admin/eylul-umresi" },
  ],
  influencer: [
    { label: "Adaylar", href: "/admin/influencer-adaylari" },
    { label: "Influencerlar", href: "/admin/influencers" },
    { label: "Affiliate", href: "/admin/affiliate" },
    { label: "Kampanyalar", href: "/admin/campaigns" },
  ],
  gorunurluk: [
    { label: "SEO Masası", href: "/admin/seo" },
    { label: "AI Görünürlük", href: "/admin/ai-visibility" },
    { label: "Analytics", href: "/admin/analytics" },
  ],
  sohbet: [
    { label: "Canlı destek", href: "/admin/support" },
    { label: "WhatsApp AI", href: "/admin/whatsapp-ai" },
  ],
  sistem: [
    { label: "Ayarlar", href: "/admin/settings" },
    { label: "Kullanıcılar", href: "/admin/users" },
    { label: "Medya", href: "/admin/media" },
  ],
};

export default function HubTabs({ hub }: { hub: HubKey }) {
  const pathname = usePathname();
  const tabs = HUBS[hub] || [];

  if (tabs.length === 0) return null;

  return (
    <nav className="mb-6 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap border-b border-outline-variant/20 pb-2 text-xs font-medium">
      {tabs.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname === tab.href || pathname.startsWith(tab.href + "/");

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-lg px-3 py-1.5 transition-colors ${
              isActive
                ? "bg-primary text-white font-semibold shadow-xs"
                : "text-on-surface-variant hover:bg-primary/[0.06] hover:text-primary"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
