"use client";

import React, { useRef, useState } from "react";
import { toJpeg } from "html-to-image";
import Link from "next/link";

export default function PackageCheckoutClient({ pkg }: { pkg: any }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pax, setPax] = useState(1);
  const [whatsappNumber, setWhatsappNumber] = useState("905404010038");

  React.useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(data => {
      if (Array.isArray(data)) {
        const wa = data.find((s: any) => s.key === 'whatsappNumber');
        if (wa && wa.value) {
          setWhatsappNumber(wa.value.replace('+', ''));
        }
      }
    }).catch(e => console.error(e));
  }, []);

  const total = pkg.price * pax;
  const formattedTotal = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 0 }).format(total);
  const todayDate = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });

  const handleWhatsAppShare = async () => {
    if (!cardRef.current) return;
    try {
      setIsGenerating(true);
      
      const dataUrl = await toJpeg(cardRef.current, { 
        quality: 0.95,
        backgroundColor: '#ffffff'
      });
      
      // Convert to blob to enforce filename and extension on all browsers (Safari/iOS)
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = `${pkg.slug}-rezervasyon.jpg`;
      link.href = objectUrl;
      link.click();
      
      // Clean up memory
      setTimeout(() => URL.revokeObjectURL(objectUrl), 100);
      
      const text = encodeURIComponent(`Merhaba, web siteniz üzerinden "${pkg.title}" paketinizi inceledim ve ${pax} kişi için rezervasyon yapmak istiyorum. Sistemden indirdiğim bilet/dekont ektedir, uçuş tarihleri ve detayları görüşmek isterim.`);
      window.location.href = `https://wa.me/${whatsappNumber}?text=${text}`;
    } catch (error) {
      console.error("Görsel oluşturulamadı:", error);
      alert("Biletiniz oluşturulurken bir hata oluştu.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="pt-32 pb-24 min-h-screen relative overflow-hidden bg-surface-container-lowest">
      {/* Background decorations */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] -z-10 rounded-full mix-blend-multiply pointer-events-none"></div>
      
      <div className="max-w-screen-md mx-auto px-6 relative z-10 flex flex-col items-center">
        
        <div className="text-center mb-10">
          <Link href={`/paketler/${pkg.slug}`} className="inline-flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest hover:text-secondary transition-colors mb-6 bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/20">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Pakete Dön
          </Link>
          <h1 className="font-headline text-4xl md:text-5xl text-primary leading-tight mb-4 font-bold tracking-tight">
            Rezervasyon Özeti
          </h1>
          <p className="text-on-surface-variant text-base leading-relaxed font-light max-w-xl mx-auto">
            Kişi sayısını belirleyin, biletinizi indirin ve uzman rehberlerimizle WhatsApp üzerinden iletişime geçerek rezervasyonunuzu kesinleştirin.
          </p>
        </div>

        {/* Pax Selector */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-outline-variant/10 w-full mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
               <span className="material-symbols-outlined">group</span>
             </div>
             <div>
               <h3 className="font-bold text-primary font-headline text-lg">Katılımcı Sayısı</h3>
               <p className="text-xs text-outline font-medium">Birlikte seyahat edecek kişi sayısı</p>
             </div>
           </div>
           
           <div className="flex items-center bg-surface-container-low rounded-xl border border-outline-variant/20 p-1">
             <button 
               onClick={() => setPax(Math.max(1, pax - 1))}
               className="w-10 h-10 flex items-center justify-center text-primary hover:bg-white rounded-lg shadow-sm transition-colors"
             >
               <span className="material-symbols-outlined text-[20px]">remove</span>
             </button>
             <div className="w-12 text-center font-headline text-xl font-bold text-primary">
               {pax}
             </div>
             <button 
               onClick={() => setPax(pax + 1)}
               className="w-10 h-10 flex items-center justify-center text-primary hover:bg-white rounded-lg shadow-sm transition-colors"
             >
               <span className="material-symbols-outlined text-[20px]">add</span>
             </button>
           </div>
        </div>

        {/* The Receipt Ticket (Digital Boarding Pass) */}
        <div 
          ref={cardRef} 
          className="w-full bg-white rounded-[2rem] shadow-[0px_4px_40px_rgba(0,0,0,0.06)] border border-outline-variant/20 relative overflow-hidden"
        >
          {/* Ticket Header */}
          <div className="bg-[#002B66] text-white p-8 relative overflow-hidden">
            <div className="absolute top-0 right-[-10%] w-[40%] h-[200%] bg-white/5 rotate-12 blur-[40px] pointer-events-none"></div>
            <div className="relative z-10 flex items-center justify-between">
               <div>
                 <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/60 mb-1 block">REZERVASYON TALEBİ</span>
                 <h2 className="font-headline text-2xl font-bold">Huzura İlk Adım</h2>
               </div>
               <div className="text-right">
                  <span className="material-symbols-outlined text-[40px] opacity-20">airlines</span>
               </div>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-8 md:p-10 relative">
            
            {/* Package Identity */}
            <div className="flex gap-6 items-center mb-8 pb-8 border-b border-dashed border-outline-variant/40">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shadow-inner border border-outline-variant/10 flex-shrink-0 bg-surface-container">
                {pkg.imageUrl ? (
                  <img src={pkg.imageUrl} className="w-full h-full object-cover" alt="Paket Kapak" />
                ) : (
                  <div className="w-full h-full flex justify-center items-center text-outline"><span className="material-symbols-outlined text-3xl">image</span></div>
                )}
              </div>
              <div>
                <span className="text-xs bg-tertiary/10 text-tertiary font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-3">STANDART PAKET</span>
                <h3 className="font-headline text-2xl md:text-3xl text-primary font-bold">{pkg.title}</h3>
                <p className="text-sm text-outline mt-1 font-medium">{pkg.duration}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 relative">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-1">MİSAFİR</span>
                <span className="font-headline text-lg font-bold text-primary">{pax} Kişi</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-1">TARİH</span>
                <span className="font-headline text-lg font-bold text-primary">{todayDate}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-1">DURUM</span>
                <span className="font-headline text-lg font-bold text-[#EAB308]">Ön Onay</span>
              </div>
            </div>

          </div>

          {/* Ticket Footer (Total Price) */}
          <div className="bg-surface-container-lowest p-8 flex items-center justify-between border-t border-dashed border-outline-variant/40 relative">
             <div className="absolute left-[-15px] top-[-15px] w-[30px] h-[30px] bg-surface-container-lowest rounded-full border-r border-b border-transparent shadow-inner"></div>
             <div className="absolute right-[-15px] top-[-15px] w-[30px] h-[30px] bg-surface-container-lowest rounded-full border-l border-b border-transparent shadow-inner"></div>

             <div className="flex gap-2 items-center opacity-40 mix-blend-multiply">
               <span className="material-symbols-outlined text-[30px]" style={{ fontVariationSettings: "'FILL' 0" }}>qr_code_2</span>
               <span className="text-[9px] uppercase tracking-[0.2em] font-bold rotate-90 w-2 leading-none block whitespace-nowrap">HDUMRE</span>
             </div>
             
             <div className="text-right pl-4 max-w-[200px] sm:max-w-none">
                <span className="font-headline text-sm sm:text-base font-bold text-primary block leading-snug">Fiyat bilgisi müşteri temsilcimiz tarafından verilecektir.</span>
             </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full mt-10" data-html2canvas-ignore="true">
          <button 
            onClick={handleWhatsAppShare}
            disabled={isGenerating}
            className="bg-[#25D366] hover:bg-[#1DA851] text-white px-8 py-5 rounded-2xl font-bold transition-all shadow-xl shadow-[#25D366]/20 flex items-center justify-center gap-3 w-full active:scale-95 disabled:opacity-50 text-lg uppercase tracking-wider"
          >
            {isGenerating ? (
              <span className="material-symbols-outlined animate-spin" style={{ fontVariationSettings: "'FILL' 0" }}>progress_activity</span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
              </svg>
            )}
            WHATSAPP İLE GÖNDER VE YER AYIRT
          </button>
          
          <p className="text-center text-xs text-outline mt-6 italic">
            "Butona bastığınızda güvenli bir şekilde WhatsApp uygulamasına yönlendirileceksiniz. Lütfen açılan sohbete biletinizi eklemeyi unutmayın."
          </p>
        </div>

      </div>
    </main>
  );
}
