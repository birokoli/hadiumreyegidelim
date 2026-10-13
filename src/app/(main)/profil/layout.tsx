// Üye alanı (13 Ekim): bütün profil sayfaları ana sayfa v2 kimliğinde (Pantone, Cairo + serif italik, Aref Ruqaa hat).
import { Metadata } from "next";
import { cairo, ruqaa } from "@/components/home/fonts";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function ProfilLayout({ children }: { children: React.ReactNode }) {
  return <main id="main-content" className={`home-v2 ${cairo.variable} ${ruqaa.variable} bg-soft min-h-screen`}>{children}</main>;
}
