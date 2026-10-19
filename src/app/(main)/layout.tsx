import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import React from "react";
import { getSiteSettings } from "@/lib/site-settings";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";
import MotionInit from "@/components/ui/MotionInit";

// Site sayfaları en geç 5 dakikada bir yeniden üretilir (sayfa daha kısa süre verirse o geçerli).
// Admin'de içerik/ayar değişince revalidatePublic / revalidateSiteSettings beklemeden tazeler.
export const revalidate = 300;

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings(); // önbellekli; ulaşılamazsa varsayılan menü ve logo
  
  let navLinks = [
    {label: "Paketler", url: "/paketler"},
    {label: "Bireysel Tasarım", url: "/bireysel-umre"},
    {label: "Rehberler & Keşifler Portalı", url: "/rehberlik"},
    {label: "Manevi Rehberlik Blogu", url: "/blog"},
    {label: "İletişim", url: "/iletisim"}
  ];

  let logoUrl = "/logo.png";

  let navbarCtaText = "Niyet Et";

  if (settings.navbar_links) {
    try {
      navLinks = JSON.parse(settings.navbar_links);
    } catch {}
  }
  if (settings.SITE_LOGO) logoUrl = settings.SITE_LOGO;
  if (settings.NAVBAR_CTA) navbarCtaText = settings.NAVBAR_CTA;

  return (
    <>
      <Navbar links={navLinks} logoUrl={logoUrl} ctaText={navbarCtaText} />
      {/* We add a wrapper to ensure content pushes footer down if needed, though pages handle their own height */}
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex flex-col">{children}</div>
        <Footer logoUrl={logoUrl} />
      </div>
      <FloatingWhatsApp />
      <MotionInit />
    </>
  );
}
