'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ConfiguratorSidebar from "@/components/layout/ConfiguratorSidebar";
import ConfiguratorSummary from "@/components/layout/ConfiguratorSummary";
import TurkishDatePicker from "@/components/ui/TurkishDatePicker";
import { useConfiguratorStore } from "@/store/useConfiguratorStore";

export default function PlannerPage() {
  const router = useRouter();
  const { flight, setFlight, returnFlight, setReturnFlight, departureDate, setDepartureDate, returnDate, setReturnDate, pax, setPax } = useConfiguratorStore();
  const [availableFlights, setAvailableFlights] = useState<any[]>([]);
  const [flightStage, setFlightStage] = useState<'outbound' | 'return'>('outbound');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [departureCity, setDepartureCity] = useState("IST");
  const [arrivalCity, setArrivalCity] = useState("JED");

  const handleSearchFlights = async () => {
    setLoading(true);
    setHasSearched(true);
    setFlightStage('outbound');
    setFlight(null);
    setReturnFlight(null);
    try {
      setErrorMessage("");
      const res = await fetch(`/api/flights?departure_id=${departureCity}&arrival_id=${arrivalCity}&outbound_date=${departureDate}`);
      const data = await res.json();
      
      if (data.error) {
        setErrorMessage(data.error);
        setAvailableFlights([]);
      } else if (Array.isArray(data)) {
        setAvailableFlights(data);
      } else {
        setAvailableFlights([]);
      }
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || "Bir hata oluştu.");
      setAvailableFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFlight = async (s: any) => {
    if (flightStage === 'outbound') {
      if (flight?.id === s.id) {
        setFlight(null);
        return;
      }
      setFlight({
        id: s.id,
        airline: s.airline,
        code: s.code,
        name: s.name,
        price: s.price,
        departureTime: s.departureTime,
        arrivalTime: s.arrivalTime,
        duration: s.duration
      });
      
      // Now fetch return flights
      setFlightStage('return');
      setLoading(true);
      setAvailableFlights([]);
      try {
        setErrorMessage("");
        const res = await fetch(`/api/flights?departure_id=${arrivalCity}&arrival_id=${departureCity}&outbound_date=${returnDate}`);
        const data = await res.json();
        if (data.error) {
          setErrorMessage(data.error);
        } else if (Array.isArray(data)) {
          setAvailableFlights(data);
        }
      } catch (e: any) {
        setErrorMessage(e.message || "Bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    } else {
      if (returnFlight?.id === s.id) {
        setReturnFlight(null);
        return;
      }
      setReturnFlight({
        id: s.id,
        airline: s.airline,
        code: s.code,
        name: s.name,
        price: s.price,
        departureTime: s.departureTime,
        arrivalTime: s.arrivalTime,
        duration: s.duration
      });
    }
  };

  const handleSkipFlight = () => {
    setFlight(null);
    setReturnFlight(null);
    router.push('/bireysel-umre/konaklama');
  };

  const skipFlightCard = (
    <div className="mt-6 flex flex-col lg:flex-row justify-between items-center bg-surface-container/50 border border-outline-variant/30 rounded-2xl p-6 gap-6">
      <div className="flex items-start gap-4 w-full lg:flex-1">
         <span className="material-symbols-outlined text-tertiary text-2xl">info</span>
         <p className="text-[11px] lg:text-xs text-on-surface-variant font-medium leading-relaxed max-w-xl">
           <strong className="text-on-surface">Önemli Bilgilendirme:</strong> Bu fiyat bilgileri anlık Google üzerinden çekilmektedir, havayolunun fiyatları değişebilmektedir. Proforma oluşturulduktan sonra son fiyat müşteri temsilcimiz tarafından tarafınıza verilecektir (Bu fiyata markamızın kar marjı uygulanmaktadır).
         </p>
      </div>
      <button 
         onClick={handleSkipFlight}
         className="w-full lg:w-auto shrink-0 text-sm font-bold bg-surface border border-outline-variant/40 hover:bg-outline-variant/10 hover:border-outline-variant text-on-surface px-6 py-3 rounded-xl transition-all shadow-sm">
         Uçuş Seçmeden Devam Et
      </button>
    </div>
  );

  return (
    <main className="pt-32 pb-24 min-h-screen relative overflow-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] -z-10 rounded-full mix-blend-multiply pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tertiary/10 blur-[120px] -z-10 rounded-full mix-blend-multiply pointer-events-none"></div>

      <div className="max-w-screen-xl mx-auto px-6 relative z-10">
        <header className="mb-16 md:mb-20 max-w-2xl">
          <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-tertiary mb-6 block bg-tertiary-fixed-dim/20 w-fit px-4 py-1.5 rounded-full">
            Kişiselleştirilmiş İbadet
          </span>
          <h1 className="font-headline text-5xl md:text-6xl text-primary leading-tight mb-6 font-bold tracking-tight">
            Umre Tasarlayıcı
          </h1>
          <p className="text-on-surface-variant text-lg md:text-xl leading-relaxed font-body border-l-4 border-tertiary/30 pl-6 italic opacity-90">
            Manevi yolculuğunuzun her adımını, ruhunuzun sükuneti ve bedenin huzuru için özenle şekillendirin.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <ConfiguratorSidebar activeStep={1} />

          <div className="lg:col-span-6 space-y-6">
            
            {/* Search Form */}
            <div className="bg-surface-container-lowest p-8 md:p-10 rounded-3xl border border-outline-variant/15 shadow-sm">
              <h2 className="font-headline text-2xl font-bold text-primary mb-8 border-b border-outline-variant/20 pb-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary">travel_explore</span>
                Seyahat Planı & Uçuş Arama
              </h2>
              <div className="space-y-6">
                 <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1">
                       <label htmlFor="departureCity" className="block text-xs font-bold text-tertiary uppercase tracking-widest mb-2">Kalkış Şehri</label>
                       <select id="departureCity" value={departureCity} onChange={e => setDepartureCity(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 outline-none focus:border-primary font-medium text-sm">
                         <option value="IST">İstanbul Havalimanı (IST)</option>
                         <option value="SAW">Sabiha Gökçen (SAW)</option>
                         <option value="ESB">Ankara Esenboğa (ESB)</option>
                         <option value="ADB">İzmir Adnan Menderes (ADB)</option>
                       </select>
                    </div>
                    <div className="flex-1">
                       <label htmlFor="arrivalCity" className="block text-xs font-bold text-tertiary uppercase tracking-widest mb-2">Varış (Kutsal Topraklar)</label>
                       <select id="arrivalCity" value={arrivalCity} onChange={e => setArrivalCity(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 outline-none focus:border-primary font-medium text-sm">
                         <option value="JED">Cidde Kral Abdulaziz (JED)</option>
                         <option value="MED">Medine Prens Muhammed (MED)</option>
                       </select>
                    </div>
                 </div>
                 <div className="flex flex-col sm:flex-row gap-6">
                    <TurkishDatePicker 
                      label="Gidiş Tarihi"
                      value={departureDate}
                      onChange={(date) => {
                        setDepartureDate(date);
                        if (returnDate < date) setReturnDate(date);
                      }}
                    />
                    <TurkishDatePicker 
                      label="Dönüş Tarihi"
                      value={returnDate}
                      onChange={(date) => setReturnDate(date)}
                      minDate={departureDate}
                      isSecondary={true}
                    />
                 </div>
                 <div className="flex-1 mt-2">
                   <label htmlFor="paxCount" className="block text-xs font-bold text-tertiary uppercase tracking-widest mb-2">Kişi Sayısı</label>
                   <select id="paxCount" value={pax} onChange={e => setPax(Number(e.target.value))} className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 outline-none focus:border-primary font-medium text-sm">
                     {[...Array(15)].map((_, i) => (
                       <option key={i+1} value={i+1}>{i+1} Kişi</option>
                     ))}
                   </select>
                 </div>
                 <button onClick={handleSearchFlights} disabled={loading} className="w-full mt-4 bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2 active:scale-95 disabled:opacity-70 disabled:active:scale-100">
                   {loading ? (
                     <span className="material-symbols-outlined animate-spin" style={{ fontVariationSettings: "'FILL' 0" }}>progress_activity</span>
                   ) : (
                     <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
                   )}
                   {loading ? 'Uçuşlar Aranıyor...' : 'Uçuşları Listele'}
                 </button>
              </div>
            </div>

            {/* Initial Skip Flight Option (Visible Before Search) */}
            {!hasSearched && skipFlightCard}

            {/* Flight Results */}
            {hasSearched && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {loading ? (
                  <div className="text-center py-10">
                    <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full mx-auto mb-4 animate-pulse">
                      <span className="material-symbols-outlined">flight</span>
                    </div>
                    <p className="text-primary font-bold">Gerçek zamanlı uçuş verileri alınıyor...</p>
                  </div>
                ) : errorMessage ? (
                  <div className="bg-error/5 border border-error/20 p-6 rounded-2xl text-center">
                    <p className="text-error font-bold mb-1">Bir Hata Oluştu</p>
                    <p className="text-sm text-on-surface-variant">{errorMessage}</p>
                  </div>
                ) : availableFlights.length === 0 ? (
                  <div className="bg-error/5 border border-error/20 p-6 rounded-2xl text-center">
                    <p className="text-error font-bold mb-1">Uçuş Bulunamadı</p>
                    <p className="text-sm text-on-surface-variant">Seçtiğiniz tarihlerde {departureCity} - {arrivalCity} arası uygun uçuş listelenemedi. Lütfen tarihi değiştirip tekrar arayın.</p>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-headline text-xl font-bold text-primary mb-6 border-b border-outline-variant/20 pb-4">
                      {flightStage === 'outbound' ? 'Sizin İçin Bulunan Gidiş Uçuşları' : 'Sizin İçin Bulunan Dönüş Uçuşları'}
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {availableFlights.map((fItem) => {
                        const isSelected = flightStage === 'outbound' ? flight?.id === fItem.id : returnFlight?.id === fItem.id;
                        const cardDepCity = flightStage === 'outbound' ? departureCity : arrivalCity;
                        const cardArrCity = flightStage === 'outbound' ? arrivalCity : departureCity;
                        
                        return (
                          <div 
                            key={fItem.id}
                            onClick={() => handleSelectFlight(fItem)}
                            className={`group relative p-5 lg:p-6 rounded-2xl transition-all cursor-pointer flex flex-wrap gap-5 lg:gap-8 items-center justify-between bg-surface-container-lowest ${isSelected ? 'border-2 border-primary shadow-sm' : 'border border-outline-variant/30 hover:border-primary/40 hover:shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)]'}`}>
                            
                            {/* Selected Indicator */}
                            {isSelected && (
                              <div className="absolute top-0 right-0 w-8 h-8 lg:w-10 lg:h-10 bg-primary text-white rounded-bl-2xl rounded-tr-xl flex items-center justify-center shadow-sm">
                                <span className="material-symbols-outlined text-base lg:text-lg" style={{ fontVariationSettings: "'wght' 600" }}>check</span>
                              </div>
                            )}

                            {/* Left: Airline & Code */}
                            <div className="flex items-center gap-3 lg:gap-4 flex-[1] min-w-[130px]">
                              <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-outline-variant/10 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-primary text-[20px] lg:text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>flight_takeoff</span>
                              </div>
                              <div className="flex flex-col justify-center min-w-0">
                                <h3 className="font-headline text-sm lg:text-base font-bold text-primary leading-tight tracking-tight truncate">{fItem.airline}</h3>
                                <p className="text-[10px] lg:text-[12px] text-outline font-bold tracking-wider uppercase mt-0.5 leading-none truncate">{fItem.code}</p>
                              </div>
                            </div>

                            {/* Center: Times & Duration */}
                            <div className="flex flex-col flex-none items-center justify-center w-auto shrink-0 mx-auto">
                               {/* Single Leg Display */}
                               <div className="flex items-center justify-center gap-2 lg:gap-4 w-full">
                                 <div className="text-center w-12 lg:w-16 shrink-0">
                                   <div className="text-sm lg:text-base font-bold text-primary leading-tight">{fItem.departureTime ? fItem.departureTime.split(' ').slice(1).join(' ') : '--:--'}</div>
                                   <div className="text-[9px] lg:text-[11px] text-outline font-bold mt-0.5">{cardDepCity}</div>
                                 </div>
                                 
                                 <div className="flex flex-col items-center px-1 lg:px-2 w-16 lg:w-24 shrink-0">
                                   <span className="text-[8px] lg:text-[10px] text-tertiary font-bold tracking-[0.1em] lg:tracking-[0.15em] uppercase mb-1 whitespace-nowrap">{fItem.duration}</span>
                                   <div className="w-full h-px bg-outline-variant relative flex items-center justify-center">
                                     <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-tertiary"></span>
                                   </div>
                                 </div>
                                 
                                 <div className="text-center w-12 lg:w-16 shrink-0">
                                   <div className="text-sm lg:text-base font-bold text-primary leading-tight">{fItem.arrivalTime ? fItem.arrivalTime.split(' ').slice(1).join(' ') : '--:--'}</div>
                                   <div className="text-[9px] lg:text-[11px] text-outline font-bold mt-0.5">{cardArrCity}</div>
                                 </div>
                               </div>
                            </div>

                            {/* Right: Price */}
                            <div className="w-[80px] lg:w-[90px] flex justify-end items-center shrink-0 ml-auto">
                               <span className="text-lg lg:text-2xl font-headline font-extrabold text-primary tracking-tight">
                                 {fItem.price && !isNaN(Number(fItem.price)) ? `$${fItem.price}` : '-'}
                               </span>
                            </div>
                            
                          </div>
                        );
                      })}
                    </div>

                    {/* Skip Flight Option (Post-Search Bottom Position) */}
                    {skipFlightCard}
                    
                  </div>
                )}
              </div>
            )}
          </div>
          <ConfiguratorSummary />
        </div>
      </div>

      {/* SEO Payload: Visible but cleanly separated purely for organic ranking */}
      <section className="max-w-screen-xl mx-auto px-6 mt-32 relative z-10">
        <div className="bg-surface-container-lowest p-8 md:p-12 rounded-3xl border border-outline-variant/15 shadow-sm">
          <header className="mb-10 text-center">
            <h2 className="font-headline text-3xl md:text-4xl text-primary font-bold tracking-tight mb-4">
              Bireysel Umre Turları ve Fiyatları 2026: Özgürlüğünüzü Keşfedin
            </h2>
            <p className="text-on-surface-variant font-body">
              Kalabalık kafilelere bağlı kalmadan, sadece aileniz ve size özel en konforlu Mekke ve Medine deneyimi rehberi.
            </p>
          </header>

          <article className="prose prose-slate max-w-none text-on-surface-variant">
            <h3 className="font-headline text-2xl text-primary mt-8 mb-4">Bireysel Umre Nedir?</h3>
            <p className="mb-6 leading-relaxed">
              <strong>Bireysel umre</strong>, Diyanet İşleri veya geleneksel tur şirketlerinin belirlediği 40-50 kişilik standart gruplarla değil; vize, uçak, otel ve transfer süreçlerinizi tamamen kendi özel bütçenize ve ihtiyaçlarınıza göre tasarladığınız <strong>kişiselleştirilmiş ibadet</strong> seyahatidir. Özellikle aile grupları, yaşlı ebeveynleri ile seyahat edenler veya bebekli aileler için standart turların getirdiği yorucu programa tabi olmamak büyük bir lükstür.
            </p>

            <h3 className="font-headline text-2xl text-primary mt-8 mb-4">Bireysel Aile Umresi ve VIP Organizasyon</h3>
            <p className="mb-6 leading-relaxed">
              Özel bir havaalanı karşılaması (VIP Transfer), doğrudan Kabe veya Mescid-i Nebevi manzaralı en lüks otellerde (Mekke ve Medine) konaklama imkanı ile ailenize maksimum konfor sunabilirsiniz. Grubun ritmine uymak yerine; ibadetlerinizi, Kabe tavaflarınızı veya Medine ziyaretlerinizi kendi sağlığınıza ve temponuza uygun dilediğiniz vakitlerde, <em>özel manevi rehberler</em> eşliğinde planlama özgürlüğü sadece "VIP Bireysel Umre" modelinde mevcuttur.
            </p>

            <h3 className="font-headline text-2xl text-primary mt-8 mb-4">Sıkça Sorulan Sorular</h3>
            
            <div className="space-y-4 my-8">
              <details className="group bg-surface border border-outline-variant/30 rounded-2xl open:bg-primary/5 transition-colors">
                <summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-primary">
                  Bireysel Umre yapabilmek için Suudi Vizesi nasıl alınır? (E-Vize)
                  <span className="material-symbols-outlined transition duration-300 group-open:-rotate-180">expand_more</span>
                </summary>
                <div className="px-6 pb-6 text-slate-700 leading-relaxed font-medium">
                  Eskiden umre vizeleri sadece acenteler üzerinden verilirdi. Artık Suudi Arabistan'ın 1 yıllık çok girişli (Multiple Entry) Elektronik Turizm Vizesi (E-Visa) sistemi ile vizeni dakikalar içerisinde alabiliyorsunuz. Başvuru esnasında "Umre yapacağım" seçeneğini işaretlemek, size Suudi hükümeti tarafından tamamen yasal ve bağımsız bir bireysel umre yetkisi verir. Diyanet onayı gerekmez.
                </div>
              </details>

              <details className="group bg-surface border border-outline-variant/30 rounded-2xl open:bg-primary/5 transition-colors">
                <summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-primary">
                  2026 Bireysel Umre fiyatları nasıl hesaplanır? Daha mı pahalıdır?
                  <span className="material-symbols-outlined transition duration-300 group-open:-rotate-180">expand_more</span>
                </summary>
                <div className="px-6 pb-6 text-slate-700 leading-relaxed font-medium">
                  Sanılanın aksine bireysel umre her zaman daha pahalı değildir. Yukarıdaki tasarım aracımız (Umre Konfigüratörü) sayesinde 2026 uçak bileti, Mekke otelleri, Medine konaklaması, Hızlı Tren (Haramain) veya VİP Karşılama parametrelerini esnekçe seçebilirsiniz. Lüks bir "Özel Aile Umresi" tasarladığınızda kişi başı fiyat standart bir turun üstüne çıkabilir, ancak burada tamamen kendi standartlarınızı ve kalitenizi satın almış olursunuz. Tamamen bütçenize göre şekillenebilir.
                </div>
              </details>

              <details className="group bg-surface border border-outline-variant/30 rounded-2xl open:bg-primary/5 transition-colors">
                <summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-primary">
                  Mekke ve Medine'de ibadetlerim için rehber desteği alabilir miyim?
                  <span className="material-symbols-outlined transition duration-300 group-open:-rotate-180">expand_more</span>
                </summary>
                <div className="px-6 pb-6 text-slate-700 leading-relaxed font-medium">
                  Evet! Acenteden bağımsız gitmek sizi yalnız bırakmaz. Sistemimiz içerisindeki Özel Rehber ataması sayesinde Mekke'de hocamız sizi otelinizden alır, ilk tavafınızı, sa'yınızı ve Mescid-i Haram tanıtımınızı sadece size özel refakat ederek tamamlar. 
                </div>
              </details>
            </div>
            
            <p className="border-l-4 border-primary pl-4 text-sm font-medium text-slate-500 mt-8 italic">
              <strong>Not:</strong> Sayfamızda oluşturduğunuz paketler bir Proforma/Ön Tutar belgesidir. Seçtiğiniz THY, Pegasus gibi hava yolu fiyatları sürekli güncellendiği için çağrı merkezimiz size anında güncel onaylı fiyatı sunacaktır. Kutsal topraklara olan bu eşsiz manevi yolculuğunuzda "Hadi Umreye Gidelim" ekibi olarak size en dürüst hizmeti sunmaktan onur duyarız.
            </p>
          </article>
        </div>
      </section>

    </main>
  );
}
