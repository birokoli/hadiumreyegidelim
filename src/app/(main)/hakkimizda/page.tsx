import React from "react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hakkımızda — HadiUmreyeGidelim Kimdir?",
  description: "Hadi Umreye Gidelim, kalabalık kafilelere bağlı kalmadan ailenize özel, butik ve VIP bireysel umre deneyimi sunan Türkiye merkezli bir organizasyon platformudur.",
  alternates: {
    canonical: "/hakkimizda",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "name": "Hakkımızda — Hadi Umreye Gidelim",
  "url": "https://hadiumreyegidelim.com/hakkimizda",
  "description": "Hadi Umreye Gidelim hakkında bilgi edinin.",
  "publisher": {
    "@type": "Organization",
    "name": "Hadi Umreye Gidelim",
    "url": "https://hadiumreyegidelim.com",
  },
};

export default function HakkimizdaPage() {
  return (
    <main className="pt-32 pb-24 bg-surface-container-lowest min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-3xl mx-auto px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-10" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-2 text-sm text-on-surface-variant">
            <li><Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link></li>
            <li><span className="mx-2 text-outline">/</span></li>
            <li className="text-primary font-medium">Hakkımızda</li>
          </ol>
        </nav>

        <header className="mb-16">
          <span className="text-secondary font-label text-xs tracking-[0.3em] font-bold uppercase mb-4 block">Biz Kimiz</span>
          <h1 className="font-headline text-5xl md:text-6xl text-primary font-bold mb-6 leading-tight">
            Hadi Umreye Gidelim
          </h1>
          <p className="text-on-surface-variant text-lg font-light leading-relaxed">
            Kalabalık kafilelere ve standart programlara bağlı kalmadan, ailenize özel butik ve VIP bireysel umre deneyimi sunan Türkiye merkezli bir organizasyon platformuyuz.
          </p>
        </header>

        <section className="space-y-10 text-on-surface leading-relaxed">
          <div>
            <h2 className="font-headline text-2xl text-primary font-bold mb-4">Niyetimiz</h2>
            <p>
              Her umre yolculuğunun eşsiz ve kişisel olduğuna inanıyoruz. Diyanet turlarının kalabalık programlarından veya yüksek komisyonlu acentelerden bağımsız olarak, sizi ve ailenizi Kutsal Topraklar'a en huzurlu, en konforlu ve en manevi şekilde ulaştırmak için çalışıyoruz.
            </p>
          </div>

          <div>
            <h2 className="font-headline text-2xl text-primary font-bold mb-4">Ne Sunuyoruz</h2>
            <ul className="space-y-3">
              {[
                "Kabe manzaralı butik otel rezervasyonu",
                "Nusuk sistemi üzerinden yasal bireysel umre vizesi",
                "VIP özel transfer organizasyonu",
                "Akademik ilahiyatçı rehber eşliği",
                "Uçak biletinde en avantajlı fiyat araştırması",
                "7/24 WhatsApp danışmanlık desteği",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check_circle</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-headline text-2xl text-primary font-bold mb-4">Neden Biz?</h2>
            <p>
              Suudi Arabistan'ın son yıllarda uyguladığı esnek umre politikaları sayesinde, bireysel umre yapmak artık hem yasal hem de çok daha uygun maliyetli. Biz bu imkânı herkesin kolayca kullanabilmesi için teknoloji ve deneyimlerimizi bir araya getiriyoruz.
            </p>
          </div>

          <div>
            <h2 className="font-headline text-2xl text-primary font-bold mb-4">İletişim</h2>
            <p>
              Umre yolculuğunuzu planlamaya başlamak için bizimle iletişime geçebilirsiniz.
            </p>
            <div className="mt-6">
              <Link
                href="/iletisim"
                className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-4 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                Danışmanlık Al
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
