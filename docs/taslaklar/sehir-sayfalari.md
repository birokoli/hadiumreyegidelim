# Şehir Sayfaları Envanteri ve Analiz Raporu (G6-14)

Tarih: 2 Ekim 2026
Kaynak: `src/app/(main)/[slug]/page.tsx` ve `src/components/features/BireyselUmreClient.tsx`

---

## 1. Uçuş / Uçak Metin ve İşlev Envanteri

Aşağıdaki liste, kaldırılan uçuş API'si ve yeni planlayıcıya geçiş öncesinde kaldırılması veya güncellenmesi gereken kod satırlarını gösterir:

### A. `src/app/(main)/[slug]/page.tsx`
| Satır | Kod Snippet | Öneri (Yeni Planlayıcıya Geçiş) |
| --- | --- | --- |
| 37 | `// İstanbul'un iki havalimanından Cidde ve Medine'ye direkt tarifeli seferler var` | Genel bilgi metni olarak kalabilir (veya planlayıcı yönlendirmesine çevrilebilir) |
| 42 | `Marmara: "Marmara'dan yola çıkanlar için en geniş uçuş seçeneği İstanbul'daki iki havalimanındadır; kalkış saatini seçerken havalimanına ulaşım süresini ve trafik yoğunluğunu hesaba katın.",` | Genel bilgi metni olarak kalabilir (veya planlayıcı yönlendirmesine çevrilebilir) |
| 43 | `Ege: "Ege'den yola çıkanlar için İzmir ve bölgedeki diğer havalimanlarından kalkan uçuşlar çoğunlukla aktarmalıdır; aktarma süresi kısa olan seferler toplam yolculuğu belirgin biçimde kısaltır.",` | Genel bilgi metni olarak kalabilir (veya planlayıcı yönlendirmesine çevrilebilir) |
| 45 | `"İç Anadolu": "İç Anadolu'dan yola çıkanlar Ankara, Kayseri, Konya ve Kapadokya havalimanlarını kullanabilir; bu havalimanlarından kalkışta aktarma noktası çoğunlukla İstanbul'dur.",` | Genel bilgi metni olarak kalabilir (veya planlayıcı yönlendirmesine çevrilebilir) |
| 46 | `Karadeniz: "Karadeniz'den yola çıkanlar için sahil havalimanlarındaki kalkışlar genellikle İstanbul ya da Ankara aktarmalıdır; kış aylarında hava koşulları uçuş saatlerini değiştirebildiği için aktarma arasına pay bırakın.",` | Genel bilgi metni olarak kalabilir (veya planlayıcı yönlendirmesine çevrilebilir) |
| 47 | `"Doğu Anadolu": "Doğu Anadolu'da kış aylarında kar ve sis uçuş saatlerini etkileyebilir; bu dönemde dönüş tarihine bir gün pay bırakmak ve aktarma süresi uzun seferleri seçmek planı güvenceye alır.",` | Genel bilgi metni olarak kalabilir (veya planlayıcı yönlendirmesine çevrilebilir) |
| 48 | `"Güneydoğu Anadolu": "Güneydoğu Anadolu Suudi Arabistan'a coğrafi olarak yakın olsa da uçuşların çoğu İstanbul ya da Ankara aktarmalıdır; aktarma süresi toplam yolculuk süresini belirler.",` | Genel bilgi metni olarak kalabilir (veya planlayıcı yönlendirmesine çevrilebilir) |
| 81 | `? `${city.airportName} (${city.airportCode}) üzerinden Cidde ve Medine'ye direkt seferler bulunur; aktarma gerekmez.`` | Planlayıcı otel+transfer seçimine bağlanmalı |
| 82 | `: `${city.airportName} (${city.airportCode}) kalkışlı yolculukta Cidde ya da Medine'ye çoğunlukla aktarmalı gidilir; direkt sefer olup olmadığını tarih seçtiğinizde uçuş listesinde görürsünüz.`;` | Genel bilgi metni olarak kalabilir (veya planlayıcı yönlendirmesine çevrilebilir) |
| 90 | `q: `${from} Cidde'ye uçuş kaç saat sürer?`,` | Genel bilgi metni olarak kalabilir (veya planlayıcı yönlendirmesine çevrilebilir) |
| 91 | `a: `${city.name} ile Cidde arası kuş uçuşu yaklaşık ${n(facts.toJeddah)} km'dir; direkt bir uçuş yaklaşık ${facts.jeddahFlight} sürer. Medine'ye kuş uçuşu mesafe yaklaşık ${n(facts.toMedina)} km, direkt uçuş süresi yaklaşık ${facts.medinaFlight}. Aktarmalı seferlerde toplam süre bekleme süresine göre uzar; kesin süre seçtiğiniz sefere bağlıdır.`,` | Genel bilgi metni olarak kalabilir (veya planlayıcı yönlendirmesine çevrilebilir) |
| 122 | `? `${city.name} çıkışlı umre: ${city.airportCode} kalkış, Cidde'ye yaklaşık ${n(facts.toJeddah)} km, direkt uçuşla yaklaşık ${facts.jeddahFlight}. Otel, uçuş ve vizeyi tek planda seçin.`` | Genel bilgi metni olarak kalabilir (veya planlayıcı yönlendirmesine çevrilebilir) |
| 123 | `: `${city.name} çıkışlı umre: ${city.airportName} (${city.airportCode}) kalkışlı uçuş, otel, vize ve transferi tek planda seçin.`,` | Genel bilgi metni olarak kalabilir (veya planlayıcı yönlendirmesine çevrilebilir) |
| 162 | `{ label: "Kalkış havalimanı", value: `${city.airportName} (${city.airportCode})` },` | Genel bilgi metni olarak kalabilir (veya planlayıcı yönlendirmesine çevrilebilir) |
| 165 | `{ label: "Cidde'ye kuş uçuşu", value: `yaklaşık ${n(facts.toJeddah)} km` },` | Genel bilgi metni olarak kalabilir (veya planlayıcı yönlendirmesine çevrilebilir) |
| 166 | `{ label: "Medine'ye kuş uçuşu", value: `yaklaşık ${n(facts.toMedina)} km` },` | Genel bilgi metni olarak kalabilir (veya planlayıcı yönlendirmesine çevrilebilir) |
| 167 | `{ label: "Tahmini direkt uçuş (Cidde)", value: `yaklaşık ${facts.jeddahFlight}` },` | Genel bilgi metni olarak kalabilir (veya planlayıcı yönlendirmesine çevrilebilir) |
| 171 | `{ label: "Aktarma", value: direct ? "Direkt sefer var" : "Çoğunlukla aktarmalı" },` | Genel bilgi metni olarak kalabilir (veya planlayıcı yönlendirmesine çevrilebilir) |
| 181 | `subtitle={`${city.airportName} (${city.airportCode}) kalkışlı uçuş, Mekke ve Medine otelleri, vize ve transferi ${city.name} için tek planda tasarlayın.`}` | Genel bilgi metni olarak kalabilir (veya planlayıcı yönlendirmesine çevrilebilir) |
| 190 | `{facts && <>{city.name} ile Cidde arası kuş uçuşu yaklaşık {n(facts.toJeddah)} km, Medine arası yaklaşık {n(facts.toMedina)} km&apos;dir. </>}` | Genel bilgi metni olarak kalabilir (veya planlayıcı yönlendirmesine çevrilebilir) |
| 208 | `<li>Tasarlayıcıda kalkış olarak {city.airportName} ({city.airportCode}) seçili gelir; gidiş tarihini seçtiğinizde {city.airportCode} kalkışlı uçuşlar listelenir.</li>` | Genel bilgi metni olarak kalabilir (veya planlayıcı yönlendirmesine çevrilebilir) |
| 209 | `<li>{direct ? `${city.airportCode} kalkışında Cidde'ye ya da Medine'ye direkt uçabilirsiniz.` : `${city.airportCode} kalkışında aktarma süresi kısa olan seferi seçmek, ${city.name} ile Mekke arasındaki toplam yolculuğu kısaltır.`}</li>` | Genel bilgi metni olarak kalabilir (veya planlayıcı yönlendirmesine çevrilebilir) |
| 214 | `Aynı havalimanından {city.name} dışında {sharedWith.join(", ")} yolcuları da uçar.` | Genel bilgi metni olarak kalabilir (veya planlayıcı yönlendirmesine çevrilebilir) |
| 260 | `Mesafeler il merkezleri arası kuş uçuşu, uçuş süreleri direkt uçuş için yaklaşık hesaplardır. Fiyat ve sefer bilgisi tarih seçildiğinde güncel olarak listelenir; kesin teklif WhatsApp üzerinden iletilir.` | Genel bilgi metni olarak kalabilir (veya planlayıcı yönlendirmesine çevrilebilir) |

### B. `src/components/features/BireyselUmreClient.tsx`
| Satır | Kod Snippet | Öneri |
| --- | --- | --- |
| 12 | `/** Kalkış listesinde gösterilecek ad (ör. "Konya Havalimanı (KYA)") */` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 27 | `const { flight, setFlight, returnFlight, setReturnFlight, departureDate, setDepartureDate, returnDate, setReturnDate, pax, setPax } = useConfiguratorStore();` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 28 | `const [availableFlights, setAvailableFlights] = useState<any[]>([]);` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 29 | `const [flightStage, setFlightStage] = useState<'outbound' \| 'return'>('outbound');` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 44 | `const handleSearchFlights = async () => {` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 47 | `setFlightStage('outbound');` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 48 | `setFlight(null);` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 49 | `setReturnFlight(null);` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 52 | `const res = await fetch(`/api/flights?departure_id=${departureCity}&arrival_id=${arrivalCity}&outbound_date=${departureDate}`);` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 57 | `setAvailableFlights([]);` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 59 | `setAvailableFlights(data);` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 61 | `setAvailableFlights([]);` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 66 | `setAvailableFlights([]);` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 72 | `const handleSelectFlight = async (s: any) => {` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 73 | `if (flightStage === 'outbound') {` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 74 | `if (flight?.id === s.id) {` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 75 | `setFlight(null);` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 78 | `setFlight({` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 89 | `// Now fetch return flights` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 90 | `setFlightStage('return');` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 92 | `setAvailableFlights([]);` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 95 | `const res = await fetch(`/api/flights?departure_id=${arrivalCity}&arrival_id=${departureCity}&outbound_date=${returnDate}`);` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 100 | `setAvailableFlights(data);` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 108 | `if (returnFlight?.id === s.id) {` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 109 | `setReturnFlight(null);` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 112 | `setReturnFlight({` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 125 | `const handleSkipFlight = () => {` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 126 | `setFlight(null);` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 127 | `setReturnFlight(null);` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 131 | `const skipFlightCard = (` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 140 | `onClick={handleSkipFlight}` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 142 | `Uçuş Seçmeden Devam Et` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 174 | `Seyahat Planı & Uçuş Arama` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 182 | `<option value={initialDepartureCity}>{initialDepartureLabel ?? `Seçili havalimanı (${initialDepartureCity})`}</option>` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 184 | `<option value="IST">İstanbul Havalimanı (IST)</option>` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 232 | `<button onClick={handleSearchFlights} disabled={loading} className="w-full mt-4 bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2 active:scale-95 disabled:opacity-70 disabled:active:scale-100">` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 238 | `{loading ? 'Uçuşlar Aranıyor...' : 'Uçuşları Listele'}` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 243 | `{/* Initial Skip Flight Option (Visible Before Search) */}` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 244 | `{!hasSearched && skipFlightCard}` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 246 | `{/* Flight Results */}` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 252 | `<span className="material-symbols-outlined">flight</span>` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 254 | `<p className="text-primary font-bold">Gerçek zamanlı uçuş verileri alınıyor...</p>` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 261 | `) : availableFlights.length === 0 ? (` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 263 | `<p className="text-error font-bold mb-1">Uçuş Bulunamadı</p>` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 264 | `<p className="text-sm text-on-surface-variant">Seçtiğiniz tarihlerde {departureCity} - {arrivalCity} arası uygun uçuş listelenemedi. Lütfen tarihi değiştirip tekrar arayın.</p>` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 269 | `{flightStage === 'outbound' ? 'Sizin İçin Bulunan Gidiş Uçuşları' : 'Sizin İçin Bulunan Dönüş Uçuşları'}` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 272 | `{availableFlights.map((fItem) => {` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 273 | `const isSelected = flightStage === 'outbound' ? flight?.id === fItem.id : returnFlight?.id === fItem.id;` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 274 | `const cardDepCity = flightStage === 'outbound' ? departureCity : arrivalCity;` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 275 | `const cardArrCity = flightStage === 'outbound' ? arrivalCity : departureCity;` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 280 | `onClick={() => handleSelectFlight(fItem)}` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 293 | `<span className="material-symbols-outlined text-primary text-[20px] lg:text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>flight_takeoff</span>` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 336 | `{/* Skip Flight Option (Post-Search Bottom Position) */}` | Uçuş API çağrısı ve state (Kaldırılacak) |
| 337 | `{skipFlightCard}` | Uçuş API çağrısı ve state (Kaldırılacak) |

---

## 2. 81 İl Sayfası Metin Benzerlik Matrisi (5-Gram Jaccard)

- **Genel Medyan Benzerlik Oranı:** %47
- **En Yüksek Benzerlik Oranı:** %67

### İl Bazlı En Benzer 3 İl Tablosu

| İl | En Benzer 1. İl (%) | En Benzer 2. İl (%) | En Benzer 3. İl (%) |
| --- | --- | --- | --- |
| **Adana** | Mersin (%65) | Osmaniye (%65) | Antalya (%54) |
| **Adıyaman** | Diyarbakır (%57) | Batman (%57) | Şırnak (%56) |
| **Afyonkarahisar** | Kütahya (%63) | Denizli (%54) | Aydın (%53) |
| **Ağrı** | Erzurum (%57) | Iğdır (%56) | Malatya (%54) |
| **Amasya** | Çorum (%65) | Giresun (%56) | Gümüşhane (%55) |
| **Ankara** | Kırıkkale (%66) | Çankırı (%64) | Karaman (%54) |
| **Antalya** | Hatay (%55) | Adana (%54) | Isparta (%54) |
| **Artvin** | Rize (%66) | Samsun (%55) | Çorum (%54) |
| **Aydın** | Manisa (%63) | İzmir (%62) | Uşak (%55) |
| **Balıkesir** | Bursa (%56) | Kocaeli (%55) | Çanakkale (%54) |
| **Bilecik** | Sakarya (%64) | Yalova (%62) | Bolu (%58) |
| **Bingöl** | Elazığ (%56) | Tunceli (%56) | Van (%56) |
| **Bitlis** | Muş (%64) | Bingöl (%54) | Elazığ (%54) |
| **Bolu** | Düzce (%64) | Bilecik (%58) | Sakarya (%57) |
| **Burdur** | Isparta (%67) | Adana (%54) | Antalya (%53) |
| **Bursa** | Balıkesir (%56) | Kocaeli (%55) | Çanakkale (%54) |
| **Çanakkale** | Tekirdağ (%56) | Balıkesir (%54) | Bursa (%54) |
| **Çankırı** | Ankara (%64) | Kırıkkale (%62) | Eskişehir (%55) |
| **Çorum** | Amasya (%65) | Ordu (%56) | Trabzon (%56) |
| **Denizli** | Muğla (%55) | Afyonkarahisar (%54) | Uşak (%54) |
| **Diyarbakır** | Adıyaman (%57) | Batman (%57) | Şırnak (%56) |
| **Edirne** | Kırklareli (%67) | İstanbul (%62) | Sakarya (%54) |
| **Elazığ** | Tunceli (%65) | Bingöl (%56) | Muş (%56) |
| **Erzincan** | Bayburt (%56) | Ardahan (%54) | Ağrı (%53) |
| **Erzurum** | Ağrı (%57) | Iğdır (%56) | Malatya (%54) |
| **Eskişehir** | Çankırı (%55) | Sivas (%54) | Kırıkkale (%54) |
| **Gaziantep** | Kilis (%67) | Mardin (%55) | Şanlıurfa (%55) |
| **Giresun** | Ordu (%65) | Amasya (%56) | Çorum (%55) |
| **Gümüşhane** | Trabzon (%65) | Amasya (%55) | Çorum (%55) |
| **Hakkari** | Malatya (%57) | Bingöl (%55) | Bitlis (%54) |
| **Hatay** | Antalya (%55) | Adana (%54) | Burdur (%53) |
| **Isparta** | Burdur (%67) | Adana (%54) | Antalya (%54) |
| **Mersin** | Osmaniye (%66) | Adana (%65) | Antalya (%53) |
| **İstanbul** | Edirne (%62) | Kırklareli (%62) | Yalova (%55) |
| **İzmir** | Manisa (%65) | Aydın (%62) | Kütahya (%54) |
| **Kars** | Ardahan (%63) | Iğdır (%54) | Ağrı (%53) |
| **Kastamonu** | Samsun (%55) | Sinop (%54) | Tokat (%54) |
| **Kayseri** | Yozgat (%62) | Nevşehir (%56) | Aksaray (%56) |
| **Kırklareli** | Edirne (%67) | İstanbul (%62) | Sakarya (%54) |
| **Kırşehir** | Nevşehir (%63) | Niğde (%63) | Aksaray (%61) |
| **Kocaeli** | Balıkesir (%55) | Bursa (%55) | Çanakkale (%54) |
| **Konya** | Karaman (%64) | Kayseri (%55) | Nevşehir (%55) |
| **Kütahya** | Afyonkarahisar (%63) | Manisa (%55) | Aydın (%54) |
| **Malatya** | Hakkari (%57) | Van (%55) | Ağrı (%54) |
| **Manisa** | İzmir (%65) | Aydın (%63) | Kütahya (%55) |
| **Kahramanmaraş** | Adana (%53) | Antalya (%53) | Hatay (%53) |
| **Mardin** | Şanlıurfa (%56) | Gaziantep (%55) | Kilis (%55) |
| **Muğla** | Denizli (%55) | Uşak (%54) | Afyonkarahisar (%53) |
| **Muş** | Bitlis (%64) | Elazığ (%56) | Bingöl (%55) |
| **Nevşehir** | Aksaray (%65) | Niğde (%64) | Kırşehir (%63) |
| **Niğde** | Nevşehir (%64) | Aksaray (%64) | Kırşehir (%63) |
| **Ordu** | Giresun (%65) | Çorum (%56) | Trabzon (%56) |
| **Rize** | Artvin (%66) | Samsun (%55) | Çorum (%54) |
| **Sakarya** | Bilecik (%64) | Yalova (%64) | Bolu (%57) |
| **Samsun** | Artvin (%55) | Kastamonu (%55) | Rize (%55) |
| **Siirt** | Adıyaman (%54) | Diyarbakır (%54) | Mardin (%54) |
| **Sinop** | Zonguldak (%55) | Bartın (%55) | Kastamonu (%54) |
| **Sivas** | Yozgat (%56) | Eskişehir (%54) | Ankara (%53) |
| **Tekirdağ** | Çanakkale (%56) | Bursa (%54) | Balıkesir (%53) |
| **Tokat** | Amasya (%55) | Çorum (%55) | Giresun (%55) |
| **Trabzon** | Gümüşhane (%65) | Çorum (%56) | Ordu (%56) |
| **Tunceli** | Elazığ (%65) | Bingöl (%56) | Muş (%55) |
| **Şanlıurfa** | Mardin (%56) | Adıyaman (%55) | Diyarbakır (%55) |
| **Uşak** | Aydın (%55) | Denizli (%54) | Kütahya (%54) |
| **Van** | Bingöl (%56) | Elazığ (%56) | Malatya (%55) |
| **Yozgat** | Kayseri (%62) | Sivas (%56) | Kırşehir (%54) |
| **Zonguldak** | Bartın (%66) | Karabük (%62) | Sinop (%55) |
| **Aksaray** | Nevşehir (%65) | Niğde (%64) | Kırşehir (%61) |
| **Bayburt** | Erzincan (%56) | Amasya (%53) | Artvin (%53) |
| **Karaman** | Konya (%64) | Ankara (%54) | Kayseri (%54) |
| **Kırıkkale** | Ankara (%66) | Çankırı (%62) | Eskişehir (%54) |
| **Batman** | Adıyaman (%57) | Diyarbakır (%57) | Şırnak (%56) |
| **Şırnak** | Adıyaman (%56) | Diyarbakır (%56) | Batman (%56) |
| **Bartın** | Zonguldak (%66) | Karabük (%62) | Sinop (%55) |
| **Ardahan** | Kars (%63) | Erzincan (%54) | Erzurum (%54) |
| **Iğdır** | Ağrı (%56) | Erzurum (%56) | Kars (%54) |
| **Yalova** | Sakarya (%64) | Bilecik (%62) | Bolu (%56) |
| **Karabük** | Zonguldak (%62) | Bartın (%62) | Kastamonu (%54) |
| **Kilis** | Gaziantep (%67) | Mardin (%55) | Şanlıurfa (%55) |
| **Osmaniye** | Mersin (%66) | Adana (%65) | Antalya (%53) |
| **Düzce** | Bolu (%64) | Bilecik (%57) | Sakarya (%56) |

---

## 3. Öncelikli 10 İl Özgün Metin Analizi

### Denizli (`denizli`)
- **Kalkış Havalimanı:** Denizli Çardak (DNZ)
- **Özgün Metin Parçaları / Cümleler:**
  - "Denizli Çıkışlı Bireysel Umre 2026 | Hadi Umreye Gidelim                                      Paketler  Bireysel Tasarım  Rehberler &amp; Keşifler Portalı  Manevi Rehberlik Blogu  İletişim     account_circle   Niyet Et              Kişiselleştirilmiş İbadet  Denizli Çıkışlı Bireysel Umre  Denizli Çardak (DNZ) kalkışlı uçuş, Mekke ve Medine otelleri, vize ve transferi Denizli için tek planda tasarlayın"
  - "flight    ADIM 0 1  — Umre  Uçuş Tercihi  Uçuş Tercihi        hotel    ADIM 0 2  — Umre  Konaklama  Konaklama        directions_car    ADIM 0 3  — Umre  VIP Transfer  VIP Transfer        train    ADIM 0 4  — Umre  Tren Bileti  Tren Bileti        extension    ADIM 0 5  — Umre  Ekstra Turlar  Ekstra Turlar        school    ADIM 0 6  — Umre  Rehber &amp; Keşifler  Rehber &amp; Keşifler         travel_explore Seyahat Planı &amp; Uçuş Arama     Kalkış Şehri   Denizli Çardak (DNZ)  İstanbul Havalimanı (IST)  Sabiha Gökçen (SAW)  Ankara Esenboğa (ESB)  İzmir Adnan Menderes (ADB)     Varış (Kutsal Topraklar)   Cidde Kral Abdulaziz (JED)  Medine Prens Muhammed (MED)       tips_and_updates    Düşük Fiyat Sezonu (Offseason Fırsatları) Başladı Kurban sonrası oluşan boşluklar sebebiyle paket maliyetleri dibe çekilmiştir"
  - "Uçuş Seçmeden Devam Et           Ege · DNZ  Denizli&#x27;den  umre yolculuğu  Denizli  çıkışlı bireysel umrede yolculuk  Denizli Çardak  ( DNZ ) kalkışıyla başlar"
  - "Denizli  ile Cidde arası kuş uçuşu yaklaşık  2"
  - "049  km, Medine arası yaklaşık  1"

### Samsun (`samsun`)
- **Kalkış Havalimanı:** Samsun Çarşamba (SZF)
- **Özgün Metin Parçaları / Cümleler:**
  - "Samsun Çıkışlı Bireysel Umre 2026 | Hadi Umreye Gidelim                                      Paketler  Bireysel Tasarım  Rehberler &amp; Keşifler Portalı  Manevi Rehberlik Blogu  İletişim     account_circle   Niyet Et              Kişiselleştirilmiş İbadet  Samsun Çıkışlı Bireysel Umre  Samsun Çarşamba (SZF) kalkışlı uçuş, Mekke ve Medine otelleri, vize ve transferi Samsun için tek planda tasarlayın"
  - "flight    ADIM 0 1  — Umre  Uçuş Tercihi  Uçuş Tercihi        hotel    ADIM 0 2  — Umre  Konaklama  Konaklama        directions_car    ADIM 0 3  — Umre  VIP Transfer  VIP Transfer        train    ADIM 0 4  — Umre  Tren Bileti  Tren Bileti        extension    ADIM 0 5  — Umre  Ekstra Turlar  Ekstra Turlar        school    ADIM 0 6  — Umre  Rehber &amp; Keşifler  Rehber &amp; Keşifler         travel_explore Seyahat Planı &amp; Uçuş Arama     Kalkış Şehri   Samsun Çarşamba (SZF)  İstanbul Havalimanı (IST)  Sabiha Gökçen (SAW)  Ankara Esenboğa (ESB)  İzmir Adnan Menderes (ADB)     Varış (Kutsal Topraklar)   Cidde Kral Abdulaziz (JED)  Medine Prens Muhammed (MED)       tips_and_updates    Düşük Fiyat Sezonu (Offseason Fırsatları) Başladı Kurban sonrası oluşan boşluklar sebebiyle paket maliyetleri dibe çekilmiştir"
  - "Uçuş Seçmeden Devam Et           Karadeniz · SZF  Samsun&#x27;dan  umre yolculuğu  Samsun  çıkışlı bireysel umrede yolculuk  Samsun Çarşamba  ( SZF ) kalkışıyla başlar"
  - "Samsun  ile Cidde arası kuş uçuşu yaklaşık  2"
  - "212  km, Medine arası yaklaşık  1"

### Kütahya (`kutahya`)
- **Kalkış Havalimanı:** Zafer Havalimanı (KZR)
- **Özgün Metin Parçaları / Cümleler:**
  - "Kütahya Çıkışlı Bireysel Umre 2026 | Hadi Umreye Gidelim                                      Paketler  Bireysel Tasarım  Rehberler &amp; Keşifler Portalı  Manevi Rehberlik Blogu  İletişim     account_circle   Niyet Et              Kişiselleştirilmiş İbadet  Kütahya Çıkışlı Bireysel Umre  Zafer Havalimanı (KZR) kalkışlı uçuş, Mekke ve Medine otelleri, vize ve transferi Kütahya için tek planda tasarlayın"
  - "Uçuş Seçmeden Devam Et           Ege · KZR  Kütahya&#x27;dan  umre yolculuğu  Kütahya  çıkışlı bireysel umrede yolculuk  Zafer Havalimanı  ( KZR ) kalkışıyla başlar"
  - "Kütahya  ile Cidde arası kuş uçuşu yaklaşık  2"
  - "171  km, Medine arası yaklaşık  1"
  - "892  km&#x27;dir"

### Tokat (`tokat`)
- **Kalkış Havalimanı:** Tokat Havalimanı (TJK)
- **Özgün Metin Parçaları / Cümleler:**
  - "Tokat Çıkışlı Bireysel Umre 2026 | Hadi Umreye Gidelim                                      Paketler  Bireysel Tasarım  Rehberler &amp; Keşifler Portalı  Manevi Rehberlik Blogu  İletişim     account_circle   Niyet Et              Kişiselleştirilmiş İbadet  Tokat Çıkışlı Bireysel Umre  Tokat Havalimanı (TJK) kalkışlı uçuş, Mekke ve Medine otelleri, vize ve transferi Tokat için tek planda tasarlayın"
  - "flight    ADIM 0 1  — Umre  Uçuş Tercihi  Uçuş Tercihi        hotel    ADIM 0 2  — Umre  Konaklama  Konaklama        directions_car    ADIM 0 3  — Umre  VIP Transfer  VIP Transfer        train    ADIM 0 4  — Umre  Tren Bileti  Tren Bileti        extension    ADIM 0 5  — Umre  Ekstra Turlar  Ekstra Turlar        school    ADIM 0 6  — Umre  Rehber &amp; Keşifler  Rehber &amp; Keşifler         travel_explore Seyahat Planı &amp; Uçuş Arama     Kalkış Şehri   Tokat Havalimanı (TJK)  İstanbul Havalimanı (IST)  Sabiha Gökçen (SAW)  Ankara Esenboğa (ESB)  İzmir Adnan Menderes (ADB)     Varış (Kutsal Topraklar)   Cidde Kral Abdulaziz (JED)  Medine Prens Muhammed (MED)       tips_and_updates    Düşük Fiyat Sezonu (Offseason Fırsatları) Başladı Kurban sonrası oluşan boşluklar sebebiyle paket maliyetleri dibe çekilmiştir"
  - "Uçuş Seçmeden Devam Et           Karadeniz · TJK  Tokat&#x27;tan  umre yolculuğu  Tokat  çıkışlı bireysel umrede yolculuk  Tokat Havalimanı  ( TJK ) kalkışıyla başlar"
  - "Tokat  ile Cidde arası kuş uçuşu yaklaşık  2"
  - "102  km, Medine arası yaklaşık  1"

### Kırıkkale (`kirikkale`)
- **Kalkış Havalimanı:** Ankara Esenboğa (ESB)
- **Özgün Metin Parçaları / Cümleler:**
  - "Kırıkkale Çıkışlı Bireysel Umre 2026 | Hadi Umreye Gidelim                                      Paketler  Bireysel Tasarım  Rehberler &amp; Keşifler Portalı  Manevi Rehberlik Blogu  İletişim     account_circle   Niyet Et              Kişiselleştirilmiş İbadet  Kırıkkale Çıkışlı Bireysel Umre  Ankara Esenboğa (ESB) kalkışlı uçuş, Mekke ve Medine otelleri, vize ve transferi Kırıkkale için tek planda tasarlayın"
  - "Uçuş Seçmeden Devam Et           İç Anadolu · ESB  Kırıkkale&#x27;den  umre yolculuğu  Kırıkkale  çıkışlı bireysel umrede yolculuk  Ankara Esenboğa  ( ESB ) kalkışıyla başlar"
  - "Kırıkkale  ile Cidde arası kuş uçuşu yaklaşık  2"
  - "105  km, Medine arası yaklaşık  1"
  - "803  km&#x27;dir"

### Amasya (`amasya`)
- **Kalkış Havalimanı:** Merzifon Havalimanı (MZH)
- **Özgün Metin Parçaları / Cümleler:**
  - "Amasya Çıkışlı Bireysel Umre 2026 | Hadi Umreye Gidelim                                      Paketler  Bireysel Tasarım  Rehberler &amp; Keşifler Portalı  Manevi Rehberlik Blogu  İletişim     account_circle   Niyet Et              Kişiselleştirilmiş İbadet  Amasya Çıkışlı Bireysel Umre  Merzifon Havalimanı (MZH) kalkışlı uçuş, Mekke ve Medine otelleri, vize ve transferi Amasya için tek planda tasarlayın"
  - "Uçuş Seçmeden Devam Et           Karadeniz · MZH  Amasya&#x27;dan  umre yolculuğu  Amasya  çıkışlı bireysel umrede yolculuk  Merzifon Havalimanı  ( MZH ) kalkışıyla başlar"
  - "Amasya  ile Cidde arası kuş uçuşu yaklaşık  2"
  - "148  km, Medine arası yaklaşık  1"
  - "833  km&#x27;dir"

### Diyarbakır (`diyarbakir`)
- **Kalkış Havalimanı:** Diyarbakır Havalimanı (DIY)
- **Özgün Metin Parçaları / Cümleler:**
  - "Diyarbakır Çıkışlı Bireysel Umre 2026 | Hadi Umreye Gidelim                                      Paketler  Bireysel Tasarım  Rehberler &amp; Keşifler Portalı  Manevi Rehberlik Blogu  İletişim     account_circle   Niyet Et              Kişiselleştirilmiş İbadet  Diyarbakır Çıkışlı Bireysel Umre  Diyarbakır Havalimanı (DIY) kalkışlı uçuş, Mekke ve Medine otelleri, vize ve transferi Diyarbakır için tek planda tasarlayın"
  - "flight    ADIM 0 1  — Umre  Uçuş Tercihi  Uçuş Tercihi        hotel    ADIM 0 2  — Umre  Konaklama  Konaklama        directions_car    ADIM 0 3  — Umre  VIP Transfer  VIP Transfer        train    ADIM 0 4  — Umre  Tren Bileti  Tren Bileti        extension    ADIM 0 5  — Umre  Ekstra Turlar  Ekstra Turlar        school    ADIM 0 6  — Umre  Rehber &amp; Keşifler  Rehber &amp; Keşifler         travel_explore Seyahat Planı &amp; Uçuş Arama     Kalkış Şehri   Diyarbakır Havalimanı (DIY)  İstanbul Havalimanı (IST)  Sabiha Gökçen (SAW)  Ankara Esenboğa (ESB)  İzmir Adnan Menderes (ADB)     Varış (Kutsal Topraklar)   Cidde Kral Abdulaziz (JED)  Medine Prens Muhammed (MED)       tips_and_updates    Düşük Fiyat Sezonu (Offseason Fırsatları) Başladı Kurban sonrası oluşan boşluklar sebebiyle paket maliyetleri dibe çekilmiştir"
  - "Uçuş Seçmeden Devam Et           Güneydoğu Anadolu · DIY  Diyarbakır&#x27;dan  umre yolculuğu  Diyarbakır  çıkışlı bireysel umrede yolculuk  Diyarbakır Havalimanı  ( DIY ) kalkışıyla başlar"
  - "Diyarbakır  ile Cidde arası kuş uçuşu yaklaşık  1"
  - "823  km, Medine arası yaklaşık  1"

### Antalya (`antalya`)
- **Kalkış Havalimanı:** Antalya Havalimanı (AYT)
- **Özgün Metin Parçaları / Cümleler:**
  - "Antalya Çıkışlı Bireysel Umre 2026 | Hadi Umreye Gidelim                                      Paketler  Bireysel Tasarım  Rehberler &amp; Keşifler Portalı  Manevi Rehberlik Blogu  İletişim     account_circle   Niyet Et              Kişiselleştirilmiş İbadet  Antalya Çıkışlı Bireysel Umre  Antalya Havalimanı (AYT) kalkışlı uçuş, Mekke ve Medine otelleri, vize ve transferi Antalya için tek planda tasarlayın"
  - "flight    ADIM 0 1  — Umre  Uçuş Tercihi  Uçuş Tercihi        hotel    ADIM 0 2  — Umre  Konaklama  Konaklama        directions_car    ADIM 0 3  — Umre  VIP Transfer  VIP Transfer        train    ADIM 0 4  — Umre  Tren Bileti  Tren Bileti        extension    ADIM 0 5  — Umre  Ekstra Turlar  Ekstra Turlar        school    ADIM 0 6  — Umre  Rehber &amp; Keşifler  Rehber &amp; Keşifler         travel_explore Seyahat Planı &amp; Uçuş Arama     Kalkış Şehri   Antalya Havalimanı (AYT)  İstanbul Havalimanı (IST)  Sabiha Gökçen (SAW)  Ankara Esenboğa (ESB)  İzmir Adnan Menderes (ADB)     Varış (Kutsal Topraklar)   Cidde Kral Abdulaziz (JED)  Medine Prens Muhammed (MED)       tips_and_updates    Düşük Fiyat Sezonu (Offseason Fırsatları) Başladı Kurban sonrası oluşan boşluklar sebebiyle paket maliyetleri dibe çekilmiştir"
  - "Uçuş Seçmeden Devam Et           Akdeniz · AYT  Antalya&#x27;dan  umre yolculuğu  Antalya  çıkışlı bireysel umrede yolculuk  Antalya Havalimanı  ( AYT ) kalkışıyla başlar"
  - "Antalya  ile Cidde arası kuş uçuşu yaklaşık  1"
  - "893  km, Medine arası yaklaşık  1"

### Mersin (`mersin`)
- **Kalkış Havalimanı:** Çukurova Havalimanı (COV)
- **Özgün Metin Parçaları / Cümleler:**
  - "Mersin Çıkışlı Bireysel Umre 2026 | Hadi Umreye Gidelim                                      Paketler  Bireysel Tasarım  Rehberler &amp; Keşifler Portalı  Manevi Rehberlik Blogu  İletişim     account_circle   Niyet Et              Kişiselleştirilmiş İbadet  Mersin Çıkışlı Bireysel Umre  Çukurova Havalimanı (COV) kalkışlı uçuş, Mekke ve Medine otelleri, vize ve transferi Mersin için tek planda tasarlayın"
  - "Uçuş Seçmeden Devam Et           Akdeniz · COV  Mersin&#x27;den  umre yolculuğu  Mersin  çıkışlı bireysel umrede yolculuk  Çukurova Havalimanı  ( COV ) kalkışıyla başlar"
  - "Mersin  ile Cidde arası kuş uçuşu yaklaşık  1"
  - "753  km, Medine arası yaklaşık  1"
  - "451  km&#x27;dir"

### İstanbul (`istanbul`)
- **Kalkış Havalimanı:** İstanbul Havalimanı (IST)
- **Özgün Metin Parçaları / Cümleler:**
  - "İstanbul Çıkışlı Bireysel Umre 2026 | Hadi Umreye Gidelim                                      Paketler  Bireysel Tasarım  Rehberler &amp; Keşifler Portalı  Manevi Rehberlik Blogu  İletişim     account_circle   Niyet Et              Kişiselleştirilmiş İbadet  İstanbul Çıkışlı Bireysel Umre  İstanbul Havalimanı (IST) kalkışlı uçuş, Mekke ve Medine otelleri, vize ve transferi İstanbul için tek planda tasarlayın"
  - "flight    ADIM 0 1  — Umre  Uçuş Tercihi  Uçuş Tercihi        hotel    ADIM 0 2  — Umre  Konaklama  Konaklama        directions_car    ADIM 0 3  — Umre  VIP Transfer  VIP Transfer        train    ADIM 0 4  — Umre  Tren Bileti  Tren Bileti        extension    ADIM 0 5  — Umre  Ekstra Turlar  Ekstra Turlar        school    ADIM 0 6  — Umre  Rehber &amp; Keşifler  Rehber &amp; Keşifler         travel_explore Seyahat Planı &amp; Uçuş Arama     Kalkış Şehri   İstanbul Havalimanı (IST)  Sabiha Gökçen (SAW)  Ankara Esenboğa (ESB)  İzmir Adnan Menderes (ADB)     Varış (Kutsal Topraklar)   Cidde Kral Abdulaziz (JED)  Medine Prens Muhammed (MED)       tips_and_updates    Düşük Fiyat Sezonu (Offseason Fırsatları) Başladı Kurban sonrası oluşan boşluklar sebebiyle paket maliyetleri dibe çekilmiştir"
  - "Uçuş Seçmeden Devam Et           Marmara · IST  İstanbul&#x27;dan  umre yolculuğu  İstanbul  çıkışlı bireysel umrede yolculuk  İstanbul Havalimanı  ( IST ) kalkışıyla başlar"
  - "İstanbul  ile Cidde arası kuş uçuşu yaklaşık  2"
  - "368  km, Medine arası yaklaşık  2"

