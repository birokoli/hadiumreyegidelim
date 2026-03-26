import React from "react";
import Image from "next/image";

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
            <img 
              alt="Kuba Mosque at Dawn" 
              className="w-full h-full object-cover" 
              data-alt="Cinematic wide shot of Quba Mosque in soft golden morning light" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCF3iYs_k-G6gpEERHVEt5PfsY1dj89cZHCQe5Z1A_8_5aDG7ILB99nJBnia5m7PPFYD-GtPUBUDu29IebEhoLmvwf9gOEGZ2A-iC9HdZkW_q_aVJJZlvCOWRKJIHP551I64zFlz_38-WmGR0FbFqXIBsPV99Eszl--qhZtY2fdlx61rfiD532K0kH5ssRWrI-QK2qw52mPalfhkA6clKdTlAVVEzNjR6zz-OUdr8GZ-0Yukiw2Ff1MRWzwtq5xyTxLaDx0c9ErLn0"
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

        {/* Bento Grid for Photography */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <h2 className="text-3xl font-serif text-center mb-16">Ethereal Anlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-[800px]">
            <div className="md:col-span-2 md:row-span-2 rounded-3xl overflow-hidden relative group">
              <img 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                data-alt="Intricate architecture of an Islamic arch with soft morning shadows" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNKVAhnAbGkTBy64tSptB4oTVsn1UAcLwiars8oVQQgE2dd52q_57E_lCnfcrowomgn6XZibDNjrxi8WBIWdgmKzGZgMpK26U23Gy-1qk38q3SeFvNynrKZ-UMDTDVSs1ktjb6SAHRJzq63Uax4KCl6mwKwa-xNtyHrDPJ9-W3kuecSmil0H26KTNpEeWjI80mRkS10VtcXXDxHtnRrml7AIECIJkdTS6YoyNIsCe_p2iruq8FiiXRilasfW9w8SFLpQe6nBCBn4g"
              />
              <div className="absolute bottom-6 left-6 text-white bg-black/20 backdrop-blur-md px-4 py-2 rounded-lg text-sm">Mimari Detaylar</div>
            </div>
            <div className="md:col-span-2 md:row-span-1 rounded-3xl overflow-hidden relative group">
              <img 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                data-alt="Sunlight streaming through a window onto a prayer rug" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8xmAXnD7O-78mPSVjq6LEsdryKoY-WbOTOZx1YpLlQlLmZK2CkB2kRpU53of4MbwPpkETCOwi4pmDpEEv9DOqZJ40_Ofg6nojRXeboDfdQc1P_9Gb2pGHyXA7PNDLuOxJEyPaa7VLEmEwTvHhW68YuDcr3u-Hq_6N8miMISwbvHRCN4uyz5uXa-2RmfmsqkHFSZVCXQTFxGLtMReOqmbHHFfiGoHh4-Usu3L3Ckmf13bu4TgWvIVYtfZ-xU4NppYMceD_i4So3A0"
              />
            </div>
            <div className="md:col-span-1 md:row-span-1 rounded-3xl overflow-hidden relative group">
              <img 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                data-alt="Traditional Arabic coffee set on a wooden table" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlhYp4zEF1HVzb0Chx6IGFC0TUaF8I7kAm22nTpDHRQj-NlPEv1mbYWhsLeHU4HdclhFfXAbHWUK04XiFrMT3EKsb26J58HDjdapFmkTEahgFakIdLh3ly29Jy9afcjESHArzlLZ4JMhf2GugvJGtH-4sTZ0bkWOH60wlZSVT9KSIsAG5evrt--WujLorjZouTh_Gj79XtWNyHkryeLQj51UQtQGQGvZZnFBWCuLnM0YAHHlFBHzNFu3y8okSKum2Gj3y5vr823hw"
              />
            </div>
            <div className="md:col-span-1 md:row-span-1 rounded-3xl overflow-hidden relative group">
              <img 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                data-alt="Soft focused view of white minarets against a pale blue sky" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgOFDAYGnvN0oCzMh6zlY6a1kMrAgvENjBUhSfnOoGJiof4SODfElw7jp06tp4f1mg6qXKcsC5eaVkT3KG-qi42z3D-mhR3YqJ6NZGmF62POcSwfhaDGIlqU0iyfwJDWRyMT9G6PlzzNi834nCbuKlZ5MSrJ1m4LC6fPayVijb9QsdOjkQz1FoHMJomSY11aPt_c_qo9iig1qhlns8_HDOhQh_vCoXX09zCfqTjtQS4I118T3UiphrnyrtIYw-RlQkPKGdoS49MlA"
              />
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
