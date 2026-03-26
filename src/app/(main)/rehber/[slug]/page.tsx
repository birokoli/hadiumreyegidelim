import React from "react";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const guide = await prisma.guide.findUnique({
    where: { slug }
  });

  if (!guide) {
    notFound();
  }

  // Parse fields
  const expertiseList = guide.expertise ? guide.expertise.split(',').map(s => s.trim()).filter(s => s) : [];
  const publicationList = guide.publications ? guide.publications.split('\n').map(s => s.trim()).filter(s => s) : [];
  const bioParagraphs = guide.biography ? guide.biography.split('\n').filter(p => p.trim() !== '') : [];

  return (
    <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      {/* Hero Section: Profile Intro */}
      <header className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20 items-end">
        <div className="lg:col-span-5 relative group">
          <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-2xl">
            <img 
              alt={guide.name} 
              className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105" 
              src={guide.image || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"}
            />
          </div>
          <div className="absolute -bottom-6 -right-6 bg-surface-container-lowest p-6 rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04)] hidden md:block border-l-4 border-tertiary-fixed-dim">
            <p className="text-xs uppercase tracking-widest text-tertiary font-bold mb-1">Manevi Makam</p>
            <p className="text-primary font-headline text-lg italic">{guide.title}</p>
          </div>
        </div>
        <div className="lg:col-span-7 pb-4">
          <span className="inline-block text-tertiary font-label text-sm tracking-[0.2em] mb-4 uppercase">Manevi Yol Arkadaşı</span>
          <h1 className="text-5xl md:text-7xl font-headline text-primary mb-8 leading-tight">
            {guide.name.split(' ').map((n, i, arr) => i === arr.length - 1 ? <React.Fragment key={i}><br/>{n}</React.Fragment> : <span key={i}>{n} </span>)}
          </h1>
          
          {expertiseList.length > 0 && (
            <div className="flex flex-wrap gap-4 mb-8">
              {expertiseList.map((exp: string, idx: number) => (
                <span key={idx} className="px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full text-sm font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">verified</span> {exp}
                </span>
              ))}
            </div>
          )}

          <div className="max-w-xl">
            {guide.quote && (
              <p className="text-on-surface-variant text-lg leading-relaxed mb-10 font-light italic">
                  "{guide.quote}"
              </p>
            )}
            <Link href="/bireysel-umre" className="inline-flex bg-primary text-on-primary px-10 py-4 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all items-center gap-3">
              <span className="material-symbols-outlined">calendar_add_on</span>
                Planıma Ekle
            </Link>
          </div>
        </div>
      </header>
      
      {/* Content Grid: Bio & Academic Papers */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-24">
        {/* Biography */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[2px] w-12 bg-tertiary-fixed-dim"></div>
            <h2 className="text-3xl font-headline text-primary">Akademik ve Manevi Biyografi</h2>
          </div>
          <div className="space-y-6 text-on-surface-variant leading-loose font-body text-base md:text-lg">
            {bioParagraphs.length > 0 ? (
              bioParagraphs.map((p, i) => <p key={i}>{p}</p>)
            ) : (
              <p>Özgeçmiş bilgisi bulunmamaktadır.</p>
            )}
          </div>
        </div>
        
        {/* Expertise & Papers */}
        <div className="space-y-12">
          {publicationList.length > 0 && (
            <div className="bg-surface-container-low p-8 rounded-2xl">
              <h3 className="font-headline text-xl text-primary mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-tertiary">library_books</span>
                  Akademik Yayınlar
              </h3>
              <ul className="space-y-6">
                {publicationList.map((pub: string, i: number) => {
                  const parts = pub.split('-');
                  const year = parts[0]?.trim();
                  const titleStr = parts.slice(1).join('-').trim() || pub;
                  return (
                    <li key={i} className="group">
                      {parts.length > 1 && <span className="block text-xs text-tertiary font-bold mb-1">{year}</span>}
                      <span className="text-on-surface font-medium leading-snug block">{titleStr}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
          
          {expertiseList.length > 0 && (
            <div className="bg-secondary-container/20 p-8 rounded-2xl border-l-4 border-secondary">
              <h4 className="font-bold text-secondary text-sm uppercase tracking-widest mb-3">Uzmanlık Alanları</h4>
              <div className="flex flex-col gap-2">
                {expertiseList.map((exp: string, idx: number) => (
                  <React.Fragment key={idx}>
                    <div className="flex justify-between items-center text-sm mt-2">
                      <span>{exp}</span>
                      <span className="text-secondary font-bold">Uzman</span>
                    </div>
                    <div className="h-1 bg-surface-container-high rounded-full overflow-hidden">
                      <div className={`h-full bg-secondary w-[95%]`}></div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* Video Section */}
      {guide.youtubeUrl && (
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-headline text-primary mb-4">Manevi Sohbetler</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">Hocamızın gönül dünyasından süzülen, kalbinizi hazırlayacak yayınlar.</p>
          </div>
          <div className="relative max-w-5xl mx-auto group">
            <a href={guide.youtubeUrl} target="_blank" rel="noopener noreferrer" className="block aspect-video bg-surface-container-highest rounded-2xl overflow-hidden shadow-2xl relative flex items-center justify-center cursor-pointer">
              <img 
                alt="YouTube Video" 
                className="absolute inset-0 w-full h-full object-cover opacity-60" 
                src={guide.image || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"}
              />
              <button className="z-10 bg-surface-container-lowest text-primary w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
              </button>
            </a>
          </div>
        </section>
      )}
      
      {/* Call to Action Card */}
      <section className="bg-primary-container text-on-primary-container p-12 rounded-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="relative z-10 max-w-xl text-center md:text-left">
          <h3 className="text-3xl font-headline mb-4">Bu Kutsal Yolculuğu Birlikte Tasarlayalım</h3>
          <p className="opacity-80 leading-relaxed">{guide.name} rehberliğindeki butik Umre gruplarımızda sınırlı sayıda kontenjan bulunmaktadır.</p>
        </div>
        <Link href="/bireysel-umre" className="relative z-10 bg-tertiary-fixed-dim text-tertiary-fixed px-10 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-white hover:text-primary transition-all shadow-xl" style={{ color: "#261900" }}>
          Bilgi Al ve Rezervasyon
          <span className="material-symbols-outlined">arrow_forward</span>
        </Link>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
      </section>
    </main>
  );
}
