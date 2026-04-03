import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import React from "react";
import { prisma } from "@/lib/prisma";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settingsArray = await prisma.setting.findMany({
    where: { 
      key: { in: ['navbar_links', 'logo_url'] } 
    }
  });
  
  let navLinks = [
    {label: "Paketler", url: "/paketler"},
    {label: "Bireysel Tasarım", url: "/bireysel-umre"},
    {label: "Rehberler & Keşifler Portalı", url: "/rehberlik"},
    {label: "Manevi Rehberlik Blogu", url: "/blog"},
    {label: "İletişim", url: "/iletisim"}
  ];

  let logoUrl = "/logo.png";

  settingsArray.forEach(setting => {
    if (setting.key === 'navbar_links' && setting.value) {
      try {
        navLinks = JSON.parse(setting.value);
      } catch(e) {}
    } else if (setting.key === 'logo_url' && setting.value) {
      logoUrl = setting.value;
    }
  });

  return (
    <>
      <Navbar links={navLinks} logoUrl={logoUrl} />
      {/* We add a wrapper to ensure content pushes footer down if needed, though pages handle their own height */}
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex flex-col">{children}</div>
        <Footer logoUrl={logoUrl} />
      </div>
      <FloatingWhatsApp />
    </>
  );
}
