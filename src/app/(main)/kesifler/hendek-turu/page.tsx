import React from "react";

export default function HiddenGemsSelectionPage() {
  return (
    <>
      <main className="pt-32 pb-24 min-h-screen relative overflow-hidden">
        {/* Visual Accents: Ethereal Gradients */}
        <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] -z-10 rounded-full mix-blend-multiply pointer-events-none"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tertiary/10 blur-[120px] -z-10 rounded-full mix-blend-multiply pointer-events-none"></div>

        <div className="max-w-screen-xl mx-auto px-6 relative z-10">
          {/* Header Section */}
          <header className="mb-16 md:mb-20 max-w-2xl">
            <span className="font-label text-xs font-bold uppercase tracking-[0.3em] text-tertiary mb-6 block bg-tertiary-fixed-dim/20 w-fit px-4 py-1.5 rounded-full">
              Kişiselleştirilmiş İbadet
            </span>
            <h1 className="font-headline text-5xl md:text-6xl text-primary leading-tight mb-6 font-bold tracking-tight">
              Gizli Duraklar
            </h1>
            <p className="text-on-surface-variant text-lg md:text-xl leading-relaxed font-body border-l-4 border-tertiary/30 pl-6 italic opacity-90">
              Klasik gezi rotalarının ötesinde, kutsal feyzin en yoğun yaşandığı, tarihi şuurun saklı kaldığı durakları programınıza ekleyin.
            </p>
          </header>

          {/* Configurator Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            
            {/* Left: Navigation Steps (Unified Layout) */}
            <aside className="lg:col-span-3 lg:sticky lg:top-32 space-y-3 mb-10 lg:mb-0">
              <div className="flex items-center space-x-4 p-5 rounded-2xl bg-surface-container-lowest opacity-60 hover:opacity-100 transition-all cursor-pointer border border-transparent hover:border-outline-variant/30">
                <div className="w-10 h-10 rounded-full bg-outline/10 flex items-center justify-center text-outline">
                  <span className="material-symbols-outlined" data-icon="flight">flight</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-outline">ADIM 01</span>
                  <span className="font-medium font-headline text-lg text-on-surface">Uçuş Tercihi</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-5 rounded-2xl bg-surface-container-lowest opacity-60 hover:opacity-100 transition-all cursor-pointer border border-transparent hover:border-outline-variant/30">
                <div className="w-10 h-10 rounded-full bg-outline/10 flex items-center justify-center text-outline">
                  <span className="material-symbols-outlined" data-icon="hotel">hotel</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-outline">ADIM 02</span>
                  <span className="font-medium font-headline text-lg text-on-surface">Konaklama</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-5 rounded-2xl bg-surface-container-lowest opacity-60 hover:opacity-100 transition-all cursor-pointer border border-transparent hover:border-outline-variant/30">
                <div className="w-10 h-10 rounded-full bg-outline/10 flex items-center justify-center text-outline">
                  <span className="material-symbols-outlined" data-icon="directions_car">directions_car</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-outline">ADIM 03</span>
                  <span className="font-medium font-headline text-lg text-on-surface">Transfer</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-5 rounded-2xl bg-surface-container-lowest opacity-60 hover:opacity-100 transition-all cursor-pointer border border-transparent hover:border-outline-variant/30">
                <div className="w-10 h-10 rounded-full bg-outline/10 flex items-center justify-center text-outline">
                  <span className="material-symbols-outlined" data-icon="school">school</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-outline">ADIM 04</span>
                  <span className="font-medium font-headline text-lg text-on-surface">Rehber Seçimi</span>
                </div>
              </div>

              {/* ACTIVE STEP: Gizli Duraklar */}
              <div className="flex items-center space-x-4 p-5 rounded-2xl bg-surface-container-lowest border-l-4 border-primary shadow-md hover:-translate-y-1 transition-transform cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary" data-icon="auto_awesome" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-outline">ADIM 05</span>
                  <span className="font-bold text-primary font-headline text-lg">Gizli Duraklar</span>
                </div>
              </div>
            </aside>

            {/* Center: Active Selection Canvas - Hendek Tour Detail */}
            <div className="lg:col-span-6 space-y-12">
              
              {/* Featured Detail Presentation */}
              <section className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/20 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
                
                {/* Image Header */}
                <div className="aspect-video w-full rounded-2xl overflow-hidden mb-8 relative group">
                  <img 
                    alt="Medine battlefield landscape" 
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" 
                    data-alt="Cinematic aerial view of Medina historical landscape with soft golden sunset" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWp4fL3jsVWEMIRlagneBvGCu5oW9G5eJ3pJgU2AoD1rRQLk6vH26GrlZIXaxyZDkM5TyaWG91Lsd5Mel2Koyc5EIis9rPmOjZp7laLf5oKVGqHT0a5f7NnwduUQ3Kr62AdMQE-zF8SNGz-A1hmE__H882T9l0Quor_7-e3torsR5KH7FjVvFBkK9RnvZxO2eAumQteWbPhE-9CzCYzxGusvFxHtuG4pWkkS1RnYUqMsJlty-Fv4SZzCjIaMNrPfNIiToVmyZKGx0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#001944]/90 via-[#001944]/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-8 w-full">
                    <span className="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 text-[10px] font-bold tracking-widest uppercase shadow-md rounded-md mb-3 inline-block">Medine-i Münevvere</span>
                    <h2 className="font-headline text-3xl md:text-4xl text-white font-bold mb-2">Hendek Tarih Turu</h2>
                    <p className="text-white/80 font-body text-sm font-medium">Uzman Tarihçi & Akademik Rehberlik Eşliğinde</p>
                  </div>
                </div>

                {/* Analysis Info */}
                <div className="mb-10 row-span-2">
                  <h3 className="font-headline text-2xl font-bold text-primary mb-4 flex items-center">
                    <span className="material-symbols-outlined mr-2 text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                    Jeostratejik Analiz
                  </h3>
                  <div className="space-y-4 text-on-surface-variant leading-relaxed text-sm font-body bg-surface p-6 rounded-2xl border border-outline-variant/10">
                    <p className="italic font-medium text-primary/80 mb-2">"Hendek'in Sessizliği: Stratejinin ve imanın kesiştiği noktada, tarihin en derin izlerini keşfedin."</p>
                    <p>Hendek Savaşı, sadece bir savunma hattı değil, Selman-ı Farisi'nin (r.a.) sunduğu deha dolu bir mühendislik harikasıdır. Medine'nin doğal korunaklı yapısının stratejik bir hendekle tamamlanması, askeri tarihin dönüm noktalarından biridir.</p>
                    <p>Akademik perspektifte bu harekat; kuşatma psikolojisi, lojistik üstünlük ve birliğin zaferi olarak nitelendirilir. Turumuzda, bu fiziksel engelin manevi bir kalkana nasıl dönüştüğünü bizzat sahada dinleyeceksiniz.</p>
                  </div>
                </div>

                {/* Itinerary */}
                <div className="mb-10">
                  <h3 className="font-headline text-xl font-bold text-primary mb-6 border-b border-outline-variant/20 pb-3">3 Saatlik Özel Rota</h3>
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.4rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-tertiary/20 before:to-transparent">
                    {/* Step 1 */}
                    <div className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-surface-container-lowest bg-tertiary/10 text-tertiary group-[.is-active]:bg-tertiary group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <span className="font-headline font-bold text-lg">01</span>
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-4 rounded-xl border border-outline-variant/20 shadow-sm bg-surface">
                        <div className="flex items-center justify-between space-x-2 mb-2">
                          <h4 className="font-bold text-primary text-sm">Seb'a Mesajid</h4>
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed">Savaşın komuta merkezlerinin bulunduğu tepelerde, stratejik kararları yerinde inceliyoruz.</p>
                      </div>
                    </div>
                    {/* Step 2 */}
                    <div className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-surface-container-lowest bg-tertiary/10 text-tertiary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <span className="font-headline font-bold text-lg">02</span>
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-4 rounded-xl border border-outline-variant/20 shadow-sm bg-surface">
                        <div className="flex items-center justify-between space-x-2 mb-2">
                          <h4 className="font-bold text-primary text-sm">Hendek Hattı</h4>
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed">Hendeğin kazıldığı orijinal güzergah boyunca savunma mimarisini analiz ediyoruz.</p>
                      </div>
                    </div>
                    {/* Step 3 */}
                    <div className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-surface-container-lowest bg-tertiary/10 text-tertiary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <span className="font-headline font-bold text-lg">03</span>
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-4 rounded-xl border border-outline-variant/20 shadow-sm bg-surface">
                        <div className="flex items-center justify-between space-x-2 mb-2">
                          <h4 className="font-bold text-primary text-sm">Fetih Mescidi</h4>
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed">Zafer müjdesinin alındığı noktada tefekkür ve dua ile tamamlıyoruz.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Call to Action Inside Card */}
                <div className="bg-primary-container rounded-2xl p-8 text-center text-on-primary overflow-hidden relative group mt-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary via-transparent to-tertiary/20 opacity-50"></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-left">
                      <h4 className="font-headline text-2xl font-bold mb-1">Manevi Mirası Ekle</h4>
                      <p className="text-on-primary-container text-sm font-light">Sınırlı kontenjan ile butik rehberlik.</p>
                    </div>
                    <button className="bg-tertiary-fixed text-on-tertiary-fixed font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-105 shadow-md shrink-0 w-full md:w-auto">
                      <span className="material-symbols-outlined text-xl">add_task</span>
                      Planıma Ekle
                    </button>
                  </div>
                </div>

              </section>

              {/* Browse Other Gems / Skip */}
              <div className="flex justify-between items-center text-sm font-bold pt-4 border-t border-outline-variant/20">
                <button className="text-outline hover:text-primary transition-colors flex items-center gap-1 uppercase tracking-widest">
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span> Diğer Ziyaretler
                </button>
                <button className="text-primary hover:text-tertiary transition-colors uppercase tracking-widest underline underline-offset-4">
                  Bu Adımı Atla
                </button>
              </div>

            </div>

            {/* Right: Premium Summary Sidebar */}
            <aside className="lg:col-span-3 space-y-8 mt-10 lg:mt-0">
              <div className="bg-[#001944] text-white p-10 rounded-3xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/40 rounded-full blur-2xl -translate-y-10 translate-x-10 group-hover:bg-primary/60 transition-colors"></div>
                
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary-fixed-dim/70 mb-10 flex items-center border-b border-white/10 pb-4">
                  <span className="material-symbols-outlined mr-3 text-lg" data-icon="receipt_long">receipt_long</span>
                  Maliyet Özeti
                </h4>
                
                <div className="space-y-8 mb-12">
                  <div className="flex justify-between items-end border-b border-white/10 pb-5">
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs text-white/60 font-medium">Toplam (Tahmini)</span>
                      <span className="text-4xl font-headline font-bold text-white drop-shadow-md">$11,550</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between text-xs text-white/70 font-medium">
                      <span>Uçuş & Niyet</span>
                      <span>$2,400</span>
                    </div>
                    <div className="flex justify-between text-xs text-white/70 font-medium">
                      <span>Konaklama</span>
                      <span>$8,750</span>
                    </div>
                    <div className="flex justify-between text-xs text-white/70 font-medium">
                      <span>Rehber & Hizmet</span>
                      <span>$400</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 relative z-10">
                  <button className="flex justify-center items-center gap-2 w-full bg-tertiary-fixed text-on-tertiary-fixed py-5 rounded-xl font-bold text-sm tracking-widest transition-colors shadow-lg active:scale-95 uppercase">
                    Seyahati Onayla
                    <span className="material-symbols-outlined text-lg">verified</span>
                  </button>
                </div>
              </div>
              
              {/* Selections Section with Real Data from HTML */}
              <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/15 shadow-sm space-y-4">
                <h5 className="font-headline text-lg font-bold text-primary mb-6 flex items-center border-b border-outline-variant/20 pb-4">
                  <span className="material-symbols-outlined mr-3 text-secondary" data-icon="auto_stories">auto_stories</span>
                  Seçimleriniz
                </h5>
                
                {/* Intro Confirmed */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-outline mb-1 font-bold">Niyet & Kişi</span>
                    <p className="font-body font-bold text-on-surface text-sm">Bireysel Umre, 2 Yetişkin</p>
                  </div>
                  <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>

                {/* 01 Flight Confirmed */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-outline mb-1 font-bold">Uçuş</span>
                    <p className="font-body font-bold text-on-surface text-sm">THY Premium, İst-Cidde</p>
                  </div>
                  <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>

                {/* 02 Hotel Confirmed */}
                <div className="flex justify-between items-start mb-6 pb-6 border-b border-outline-variant/20">
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-outline mb-1 font-bold">Konaklama</span>
                    <p className="font-body font-bold text-on-surface text-sm">Raffles Makkah</p>
                  </div>
                  <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>

                {/* 05 Hidden Gems DYNAMIC (Active state) */}
                <div className="border border-primary/40 bg-primary/5 p-5 rounded-xl group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-1 bg-primary h-full"></div>
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-[10px] uppercase tracking-widest text-primary font-bold">05 Gizli Duraklar</p>
                    <span className="material-symbols-outlined text-primary text-sm group-hover:rotate-180 transition-transform duration-700">auto_awesome</span>
                  </div>
                  <p className="text-xs font-bold text-on-surface-variant opacity-80 leading-relaxed italic">
                    Ekstra manevi duraklarınızı seçerek gezinizi zenginleştirin.
                  </p>
                </div>
              </div>
            </aside>
            
          </div>
        </div>
      </main>
    </>
  );
}
