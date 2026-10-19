import type { Metadata } from "next";
import { ogGorsel } from "@/lib/seo/og";
import React from "react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Gizli Mücevher: Kuba Seher Vakti",
  description: "Şafağın ilk ışıklarıyla yıkanan Kuba Mescidi'nde huzurlu bir ziyaret tecrübesi.",
  alternates: {
    canonical: "/gizli-mucevher/kuba",
  },
  openGraph: { images: [ogGorsel("kuba", "Kuba Mescidi'nde seher vakti", "Gizli mücevher")] },
};

export default function KubaGizliMucevherPage() {
  return (
    <>
      <style>{`
        .ethereal-gradient { background: linear-gradient(to bottom, rgba(249, 249, 249, 0) 0%, #f9f9f9 100%); }
      `}</style>
      <main className="pt-32">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 mb-20">
          <div className="relative h-[716px] w-full overflow-hidden rounded-3xl">
            <Image 
              alt="Kuba Mescidi, seher vakti" 
              className="object-cover" 
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              priority
              src="/og/kuba.jpg"
            />
            <div className="absolute inset-0 ethereal-gradient flex flex-col justify-end p-12">
              <span className="inline-block px-4 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold tracking-widest uppercase mb-4 self-start">GİZLİ MÜCEVHER</span>
              <h1 className="text-5xl md:text-7xl font-serif text-primary mb-4 leading-tight">Gizli Mücevher:<br/>Kuba Seher Vakti</h1>
              <p className="text-on-surface-variant max-w-xl font-body text-lg leading-relaxed">Şafağın ilk ışıklarıyla yıkanan, Medine'nin en huzurlu köşesinde ruhani bir yolculuğa davetlisiniz.</p>
            </div>
          </div>
        </section>

        {/* Editorial Blog Section */}
        <section className="max-w-3xl mx-auto px-6 mb-32">
          <div className="text-center mb-16">
            <span className="text-tertiary font-serif italic text-xl">Sessizliğin İlk Işıkları</span>
            <h2 className="text-4xl font-serif text-on-surface mt-2">Kuba'da Seher Vakti</h2>
          </div>
          <article className="prose prose-lg max-w-none text-on-surface-variant font-body leading-loose space-y-8">
            <p className="first-letter:text-7xl first-letter:font-serif first-letter:mr-3 first-letter:float-left first-letter:text-primary">Güneş henüz ufuk çizgisini aşmadan, Medine’nin serin sabah havası yüzünüze çarptığında anlarsınız; bu sıradan bir sabah değildir. Kuba Camii’nin beyaz minareleri, lacivert gökyüzünde birer fener gibi yükselirken, şehir hala uykusundadır.</p>
            <p>Kuba’da seher vakti, kelimelerin bittiği, kalbin konuşmaya başladığı andır. Adımlarınız sessiz avluda yankılanırken, havada asılı duran o kadim huzur sizi sarmalar. Hz. Peygamber’in (sav) adımlarının değdiği bu kutsal topraklar, şafak vaktinde bambaşka bir kimliğe bürünür.</p>
            <blockquote className="border-l-4 border-tertiary-fixed-dim pl-8 py-2 my-12 italic font-serif text-2xl text-tertiary">
                "Kim evinden güzelce temizlenip çıkar da Kuba Mescidi’ne gelip namaz kılarsa, bir umre sevabı alır."
            </blockquote>
            <p>Işık yavaşça caminin mermer zeminine süzülürken, sadelik ve azamet arasındaki o ince çizgiyi görürsünüz. Burada geçirilen her saniye, gürültülü dünyadan bir kaçış değil, kendi özünüze muhteşem bir dönüştür.</p>
          </article>
        </section>

        {/* Itinerary Section - Asymmetric Layout */}
        <section className="bg-surface-container-low py-32 mb-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-20 items-start">
              <div className="lg:w-1/3">
                <span className="text-secondary font-bold tracking-widest text-xs uppercase mb-4 block">DENEYİM AKIŞI</span>
                <h2 className="text-4xl font-serif text-primary leading-tight mb-8">Bir Seher Vakti Ritüeli</h2>
                <p className="text-on-surface-variant font-body">Bu özel program, sadece bir ziyaret değil; ruhunuzu dinlendirecek ve Medine hatıralarınızda derin izler bırakacak bir manevi tasarımdır.</p>
                <div className="mt-12 p-8 bg-surface-container-lowest rounded-2xl shadow-[0px_10px_30px_rgba(0,0,0,0.02)]">
                  <h4 className="text-tertiary font-bold mb-4">Paket Detayı</h4>
                  <div className="flex justify-between items-center py-3 border-b border-outline-variant/20">
                    <span className="text-sm">Kişi Başı Ek Ücret</span>
                    <span className="font-serif text-xl text-primary">₺2.450</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-sm">Grup İndirimi (5+ Kişi)</span>
                    <span className="text-secondary font-bold text-sm">-%15</span>
                  </div>
                  <button className="w-full mt-6 bg-primary text-on-primary py-4 rounded-xl font-bold tracking-wide hover:opacity-90 transition-opacity">PLANA EKLE</button>
                </div>
              </div>
              <div className="lg:w-2/3 space-y-12">
                {/* Timeline Item 1 */}
                <div className="flex gap-8 group">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-bold">01</div>
                    <div className="w-px h-full bg-outline-variant/30 my-4"></div>
                  </div>
                  <div className="pb-12">
                    <h3 className="text-2xl font-serif text-on-surface mb-3">Tecrit ve Varış</h3>
                    <p className="text-on-surface-variant leading-relaxed">Fecr vaktinden 45 dakika önce otelden özel araçla ayrılış. Şehrin sessiz sokaklarından geçerek Kuba'nın sakin atmosferine ilk adım.</p>
                  </div>
                </div>
                {/* Timeline Item 2 */}
                <div className="flex gap-8 group">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold">02</div>
                    <div className="w-px h-full bg-outline-variant/30 my-4"></div>
                  </div>
                  <div className="pb-12">
                    <h3 className="text-2xl font-serif text-on-surface mb-3">Fecr ve İnziva</h3>
                    <p className="text-on-surface-variant leading-relaxed">Sabah namazının edası ve ardından caminin sakin bir köşesinde bireysel tefekkür vakti. Gökyüzünün mordan altına dönüşünü izleme anı.</p>
                  </div>
                </div>
                {/* Timeline Item 3 */}
                <div className="flex gap-8 group">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-bold">03</div>
                    <div className="w-px h-full bg-outline-variant/30 my-4"></div>
                  </div>
                  <div className="pb-12">
                    <h3 className="text-2xl font-serif text-on-surface mb-3">Sohbet-i İrfan</h3>
                    <p className="text-on-surface-variant leading-relaxed">Uzman rehberimiz eşliğinde, Kuba'nın İslam tarihindeki yeri ve "İlk Mescid" olmanın derin manası üzerine kısa ve samimi bir söyleşi.</p>
                  </div>
                </div>
                {/* Timeline Item 4 */}
                <div className="flex gap-8 group">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed font-bold">04</div>
                  </div>
                  <div className="">
                    <h3 className="text-2xl font-serif text-on-surface mb-3">Bereket Sofrası</h3>
                    <p className="text-on-surface-variant leading-relaxed">Cami yakınındaki butik bir bahçede; taze hurmalar, Medine ekmeği ve özel harman Arap kahvesi eşliğinde geleneksel yerel kahvaltı.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Spiritual Preference 'Dua' Chips */}
        <section className="max-w-7xl mx-auto px-6 mb-32 text-center">
          <h3 className="font-serif text-2xl mb-8">Bu Deneyimi Nasıl Kişiselleştirmek İstersiniz?</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-surface-container-low text-primary px-6 py-3 rounded-full border-l-2 border-tertiary flex items-center gap-3 hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              <span className="font-body text-sm font-medium">Bireysel İnziva Odaklı</span>
            </button>
            <button className="bg-surface-container-low text-primary px-6 py-3 rounded-full border-l-2 border-tertiary flex items-center gap-3 hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-sm">history_edu</span>
              <span className="font-body text-sm font-medium">Derin Tarih Anlatımı</span>
            </button>
            <button className="bg-surface-container-low text-primary px-6 py-3 rounded-full border-l-2 border-tertiary flex items-center gap-3 hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-sm">camera_enhance</span>
              <span className="font-body text-sm font-medium">Fotoğraf Rehberliği</span>
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
