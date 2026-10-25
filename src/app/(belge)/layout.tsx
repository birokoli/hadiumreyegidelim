// Müşteriye WhatsApp'tan giden bağlantılar (14 Ekim): teklif (/t/…) ve voucher (/v/…). Site menüsü yok; arama motorlarına kapalı.
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cairo, ruqaa } from "@/components/home/fonts";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function BelgeLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className={`home-v2 ${cairo.variable} ${ruqaa.variable} bg-soft min-h-screen print:bg-white`}>
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5 print:hidden">
        <Link href="/"><Image src="/logo.svg" alt="Hadi Umreye Gidelim" width={62} height={64} priority /></Link>
        <a href="https://wa.me/905404010038" className="text-sm font-bold text-[var(--h-blue)]">WhatsApp</a>
      </header>
      {children}
    </main>
  );
}
