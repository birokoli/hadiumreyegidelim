const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const rawData = [
  { cat: "EXTRA", name: "Hicaz Demiryolu Müzesi ve Osmanlı İstasyonları", desc: "Sultan II. Abdülhamid Han'ın kutlu vizyonu Hicaz Demiryolu İstasyonu'nun manevi ikliminde tarihi bir yolculuk. Restore edilmiş orijinal vagonlar ve ecdadın mukaddes topraklardaki izlerini sürüyoruz." },
  { cat: "EXTRA", name: "Kur'an-ı Kerim Sergisi ve Vahiy Müzesi Keşfi", desc: "Nur Dağı eteklerindeki Hira Kültürel Bölgesi'nde, ilahi vahyin büyüklüğünü anlatan geniş Kur'an nüshaları, hat sanatı şaheserleri ve Hira Mağarası replikasının derinlikli deneyimi." },
  { cat: "EXTRA", name: "Suudi Tarım Deneyimi: Premium Hurma Bahçeleri", desc: "Medine'nin bereketli topraklarındaki premium çiftliklerde organik yetiştirme, kurutma süreçlerini ve kendi hurmanızı ailenize hediye etmek üzere bizzat paketleyeceğiniz nezih atölye ziyareti." },
  { cat: "EXTRA", name: "Amberiye Mescidi ve Tarihi Tren Garı Yürüyüşü", desc: "Amberiye Mescidi'nin gölgesinde, kumların arasında kalmış tarihi raylar ve lokomotifler eşliğinde ecdadın Medine'deki tarihsel mirasını yâd ediyoruz." },
  { cat: "EXTRA", name: "Kusva'nın İzleri: Deve Çiftliği Turu", desc: "Peygamber Efendimiz'i hürmetle taşıyan meşhur deve Kusva'nın soy hikayesinin dinlendiği ve modern bir bedevi çiftliğinde taze süt ikramıyla çöl geleneklerinin yaşatıldığı özel tur." },
  { cat: "EXTRA", name: "Cennetü'l Mualla ve Al-Hujun Bölgesi Arkeolojik Okuması", desc: "Kadim Mekke'nin sosyolojik katmanlarındaki Al-Hujun bölgesinin dününe yolculuk, eski mezar taşlarındaki edebi hat sanatının ve epigrafik manaların manevi incelenmesi." },
  { cat: "EXTRA", name: "Beni Kurayza ve Hayber Kaleleri Kalıntıları Ekspedisyonu", desc: "İslam'ın sancaktarlığını taşıyan şanlı fetihlerin gerçekleştiği, Medine civarının tarihi taş kalelerinin ve Hayber alanlarının askeri strateji ve ibret açısından incelenmesi." },
  { cat: "EXTRA", name: "Al-Minaratayn Mescidi Ziyareti", desc: "Peygamber Efendimiz'in mübarek güzergâhlarından biri üzerinde bulunan, modern binalar arasına gizlenmiş bu kadim mescidin ruhaniyetiyle baş başa arkeolojik ziyareti." },
  { cat: "EXTRA", name: "Hz. Ümmü Haram'ın Evi (Kuba Yolu Üzeri Siyer Hatırası)", desc: "Peygamberimiz'in teşrif edip dinlendiği Hz. Ümmü Haram bint Milhan'a (r.a) atfedilen eski evin izlerinin sürüldüğü, sükûnet dolu manevi mikro-ziyaret." },
  { cat: "EXTRA", name: "Tarihi İhaab ve Ebu İnebe Kuyuları Yürüyüşü", desc: "Medine'nin unutulmuş, ancak bereket taşıyan bu iki tarihi kuyusunun yerini sokak aralarında keşfetme ve belgesel tadında fotoğraflayarak tarihi yâd etme aktivitesi." },
  { cat: "EXTRA", name: "Urwah ibn Zubayr Kasrı Harabeleri Turu", desc: "Bereketli Akik vadisinde inşa ettirilen devasa antik konak/saray kalıntılarının ve Sahabe sonrası dönemin refah mimarisinin tefekkürle ziyareti." },
  { cat: "EXTRA", name: "Mekke Kuşatma Sınırları ve İbn Zübeyr'in Sığınağı", desc: "Haccac ordusunun kuşattığı dönemin askeri stratejik noktalarının, bugünkü modern topografya üzerinden ibretlik ve ilmi okuması." },
  { cat: "EXTRA", name: "Hz. Hamza'nın Doğduğu Sokaklar ve Mekke'deki Evleri", desc: "Seyyidü'ş-Şüheda Hz. Hamza'nın ve Ebu Talib'in yaşadığı, Peygamber ailesine ait tarihi mülklerin harita üzerinden tespiti ve bölgenin havasının solunumu." },
  { cat: "EXTRA", name: "Zübeyde Su Yolu (Ayn Zubaida) Antik Kalıntıları Turu", desc: "Abbasiler döneminin muhteşem sadaka-i cariye eseri su kanallarının, Arafat ve Müzdelife yakınlarındaki devasa taş kalıntılarını hikayeleriyle birlikte detaylı inceleme." },
  { cat: "EXTRA", name: "Cin Vadisi (Wadi-e-Jinn) Manyetik Anomali Deneyimi", desc: "Araçların yokuş yukarı kendiliğinden çıktığı manyetik anomali vadisinde, çölün bu coğrafi illüzyonunu ve sırlarını etkileyici bir şekilde deneyimleme." },
  { cat: "EXTRA", name: "Deve Sırtında Çölde Günbatımı: Kervan Yürüyüşü", desc: "Motorlu araçların giremediği bakir çölde, asırlar öncesinin kervan yollarında develer üzerinde sükûnet dolu bir yürüyüş ve akşam kızıllığı eşliğinde tefekkür molası." },
  { cat: "EXTRA", name: "Kadınlara Özel: Ravza-i Mutahhara Asistanlığı", desc: "Hassas Nusuk randevu süreçlerinin yönetimiyle, kadın misafirlerimizin yeşil halılı bölgeye (Ravza) girmelerine yardımcı olan tecrübeli kadın rehber refakati." },
  { cat: "EXTRA", name: "Suqya Toprak ve Şifa Kumları Keşfi", desc: "Peygamberimiz'in bizzat duasını aldığına inanılan 'Şifa Toprakları'nın geleneksel tıp literatürüyle bağlantısının anlatıldığı ve izlerinin sürüldüğü otantik tur." },
  { cat: "EXTRA", name: "Suqya Mescidi ve Suqya Kuyusu Hatırası", desc: "Peygamber Efendimiz'in Bedir Seferi'ne çıkmadan evvel sancağı bağladığı ve dua buyurduğu o tarihi küçük mescidin manevi atmosferini yaşama." },
  { cat: "EXTRA", name: "Mescid-i Şeyhayn ve Uhud Yolu Kamp Alanı Analizi", desc: "Efendimiz'in Uhud'a yürürken gecelediği Şeyhayn mescidinde bekleyiş, o tarihi akşamın ağır ve vakar dolu psikolojik havasını kalpte hissetme." },
  { cat: "EXTRA", name: "Mescid-i Beni Harise: Ensar'ın Fedakarlığı", desc: "Peygamberimiz'in namaz kıldığı, o günkü Ensar kabilelerinin benzersiz misafirperverliklerinin ve muhacirlere kucak açışlarının yad edildiği lokal siyer ziyareti." },
  { cat: "EXTRA", name: "Peygamberler Dağı: Cebel-i Ebu Kubeys İzlenimi", desc: "Yeryüzünde yaratılan ilk dağ olduğu rivayet edilen ve Şakk-ı Kamer mucizesinin gerçekleştiği Cebel-i Ebu Kubeys'in asırlık sırlarının ilmi anlatımı." },
  { cat: "EXTRA", name: "Özel Siyer Rehberi ile Destansı Bedir Savaş Alanı", desc: "Bedir kasabasına yolculuk. Hak batıl mücadelesinin kazanıldığı alanın, şehitliğin ve Mescid-i Al-Areesh'in detaylı, ilmi ve coğrafi incelemesi." },
  { cat: "EXTRA", name: "Mescid-i Cin ve Mu'alla Mezarlığı Gece Ziyareti", desc: "Mu'alla mezarlığının dinginliğinde, Hz. Hatice validemizi yâd emenin ve cinlerin Kuran dinleyip iman ettiği Mescid-i Cin'in tarihi sırlarının derin gece anlatımı." },
  { cat: "EXTRA", name: "Mescid-i Kıbleteyn: İki Kıbleli Mescit Namazı", desc: "Kıblenin Mescid-i Aksa'dan Kabe'ye döndürüldüğü Mescid-i Kıbleteyn'de cemaatle vakit namazı edası ve bu eşsiz teolojik değişimin felsefi anlatımı." },
  { cat: "EXTRA", name: "Tarihi Kuyular Turu: Bi'r-i Şifa'nın Bereketi", desc: "Sahabenin asırlardır şifa niyetine suyunu içtiği tarihi kuyuların ziyareti, bölgenin erken dönem kadim su medeniyetinin ve rahmetin incelenmesi." },
  { cat: "EXTRA", name: "Peygamberin Vasiyeti: Bi'r-i Ghars Kapsamlı Turu", desc: "Peygamber Efendimiz'in (SAV), 'Vefat ettiğimde bedenimi yedi kırba bu suyla yıkayın' vasiyetini bıraktığı tarihi Ghars Kuyusu'nun restorasyon sonrası hususi ziyareti." },
  { cat: "EXTRA", name: "Bi'r-i Osman (Rumah Kuyusu) ve Vakıf Medeniyeti Dersi", desc: "Hz. Osman'ın (r.a) servetiyle Müslümanlara satın alıp kıyamete kadar vakfettiği o eşsiz kuyunun ve çevresindeki bereketli tarım arazilerinin ibretlik ziyareti." },
  { cat: "EXTRA", name: "Arees Kuyusu (Yüzük Kuyusu) ve Quba Çevresi Yürüyüşü", desc: "Peygamberimiz'in mührünün Hz. Osman devrinde düştüğü Arees Kuyusu'nun ve Quba Mescidi etrafındaki yemyeşil asırlık palmiye bahçelerinde sessiz yürüyüş." },
  { cat: "EXTRA", name: "Hendek Savaşı Sahası ve Yedi Mescitler (Sab'a Masajid)", desc: "İslam'ın eşsiz savunma stratejisi Hendek hattının oluşturulduğu Sab'a Masajid bölgesinde duraklama ve siperlerin izlerini harita üzerinden hayal ederek tarihi hissetme." },
  { cat: "EXTRA", name: "Uhud Okçular Tepesi (Cebel-i Rumat) Taktiksel Saha", desc: "Stratejist rehber eşliğinde Okçular Tepesi'nden savaş sahasını tahlil etme; emanete riayet ve teslimiyetin önemini harita üzerinden adım adım hissettiğimiz saha analizi." },
  { cat: "EXTRA", name: "Mescid-i Ghamama ve Açık Hava Namazgahları Keşfi", desc: "Mescid-i Nebevi'nin yanı başında, 'Bulut' anlamına gelen Ghamama Mescidi'ni ve etrafındaki açık hava bayram namazgahlarının kadim atmosferini tanıma." },
  { cat: "EXTRA", name: "Mekke Al-Shajarah (Ağaç) Mescidi Ziyareti", desc: "Peygamber Efendimiz'in mucizesi ile çağırdığı ağacın gelip O'nun peygamberliğine şahitlik ettiği mukaddes noktada inşa edilen tarihi mescidin ziyareti." },
  { cat: "EXTRA", name: "Gece Uhud Ziyareti ve Sessiz Tefekkür", desc: "Medine gecesinin ıssızlığında, yıldızların altında Uhud Dağı'nın yalnız ihtişamını izleme ve sahabe efendilerimizi mutlak sessizlik içinde anma vakti." },
  { cat: "EXTRA", name: "Ramazan Ayı Son 10 Gün İtikaf Asistanlığı", desc: "Haremi Şerif'te resmi itikaf kayıt işlemlerinin VIP yönetimi. Sahur ve iftar lojistiği ile manevi inzivaya tam konsantrasyon sağlayan asistanlık." },
  { cat: "EXTRA", name: "Nur Dağı (Hira Mağarası) Gün Doğumu Tırmanışı", desc: "Sabah namazıyla başlanan, sessizlik içindeki dağ tırmanışı sonrasında Mekke semalarının aydınlanışı ve ilk vahyin (İkra/Oku) indiği mağarada sabah tefekkürü." },
  { cat: "EXTRA", name: "Sevr Dağı (Ghar Thawr) ve İlahi Korunma Yürüyüşü", desc: "Hicretin o muazzam ve en tehlikeli anında Peygamberimiz ve Sadık dostu Hz. Ebu Bekir'in saklandığı mağaraya meşakkatli tırmanış; sarsılmaz tevekkülün yaşanarak anlatımı." },
  { cat: "EXTRA", name: "Mescid-i Fatımatü'z-Zehra ve Ehl-i Beyt Rotaları", desc: "Hz. Ali (k.v) ve Ehl-i Beyt büyüklerine atfedilen, sükunetiyle bilinen mescitlerin ve az bilinen sahabe lokasyonlarının derin sükunetle ziyareti." },
  { cat: "EXTRA", name: "Cennet'ül Baki (Baki Mezarlığı) Anlamlandırılmış Ziyaret", desc: "Uzman bir siyer rehberi ile birlikte on binlerce ashabın ebedi istirahatgahı olan alanın eski topografik ve manevi haritasının detaylı idraki." },
  { cat: "EXTRA", name: "Veda Hutbesi Zirvesi: Cebel-i Rahme Turu", desc: "Arafat ovasının kalbi olan Rahmet Dağı'na (Cebel-i Rahme) tırmanış. Efendimiz'in insanlığa miras bıraktığı Veda Hutbesi'ni irad ettiği mukaddes mekanda dua vakti." },
  { cat: "EXTRA", name: "Mekke Eski Mezarlıkları ve Bilinmeyen Şehitlikler", desc: "Mekke'nin eteklerinde kalmış, kalabalıklara karışmamış çok daha az bilinen ashab mezarlıklarına, tam bir edep ve sessizlik içinde ilmi manevi ziyaret." },
  { cat: "EXTRA", name: "Selman-ı Farisi'nin Hurma Bahçesi ve Özgürlük Kıssası", desc: "Peygamberimizin bizzat kendi mübarek elleriyle Selman-ı Farisi (r.a) için ektiği 300 hurma fidanının bulunduğu tarihi arazinin umut kokan hikayesi." },
  { cat: "EXTRA", name: "Mescid-i Cuma: İlk Cuma Namazının Havası", desc: "Hicret yolunda, Ranuna Vadisi'nde durulup okunan ilk muazzam Cuma hutbesinin ve ilk Cuma namazının kılındığı Mescid-i Cuma'nın feyizli atmosferini soluma." },
  { cat: "EXTRA", name: "Mescid-i Rayah (Sancak Mescidi) ve Mekke'nin Fethi", desc: "Mekke fethinin ihtişamlı sabahında İslam sancağının büyük bir onurla dikildiği tarihi mescidin ziyareti, af ve tevazu ruhunun canlandırılması." },
  { cat: "EXTRA", name: "Al-Aqiq Vadisi (Mübarek Vadi) Yürüyüşü ve Sükunet", desc: "Efendimiz'in 'Mübarek Vadi' olarak nitelendirdiği, yemyeşil palmiyeleriyle dingin bir atmosfere sahip bu vadide, içe dönüş ve hakiki tefekkür yürüyüşü." },
  { cat: "EXTRA", name: "Kuba Mescidi Fecr (Sabah) Vakti Dinginliği", desc: "Sabahın ilk ışıklarından hemen önce (fecr vakti) Kuba'nın emsalsiz ve tertemiz atmosferini teneffüs etme, yerel sabah dinginliğinin zihindeki şifası." },
  { cat: "EXTRA", name: "Darü'l-Erkam (Erkam'ın Evi) Safa Tepesi Çevresi Hatırası", desc: "İslam'ın ilk fidanlarının gizlice yeşertildiği, Kur'an'ın ilmek ilmek kalplere dokunduğu Erkam'ın Evinin Safa Tepesi civarındaki alanında ruhani izdüşümü." },
  { cat: "EXTRA", name: "Mina ve Mescid-i Hayf (Peygamberler Mescidi) İbadeti", desc: "Aralarında Hz. Musa'nın da bulunduğu yetmişe yakın peygamberin namaz kıldığı rivayet edilen devasa Mescid-i Hayf'ın Hac dönemi dışındaki mutlak tenhalığında huzurlu bir ibadet." },
  { cat: "EXTRA", name: "İlk Akabe Biatı'nın Gerçekleştiği Mescid-i Bay'ah", desc: "İlk Medineli Müslümanların gizlice gelip Efendimiz'e biat ettikleri ve İslam'ın siyasi kaderini değiştiren o mütevazı dağ arası mescidinin manidâr ziyareti." },
  { cat: "EXTRA", name: "Ezanın Doğduğu Ruhani Makam: Nebevi Çatısı Çevresi", desc: "Hz. Bilal-i Habeşi'nin Mescid-i Nebevi'nin üzerine çıkıp yeryüzünün ilk ezanını semaya yükselttiği noktanın yerinde tasavvuru ve o anın hissi." },
  { cat: "EXTRA", name: "Uhud Mezarlığı Yanı Seyyidü'ş-Şüheda Mescidi Namazı", desc: "70 Uhud şahidinin başucunda kurulan görkemli Seyyidü'ş-Şüheda Camii'nde ibadet ve şehadetin derin manası için dua molası." },
  { cat: "EXTRA", name: "Mescid-i İcabe (Yakarış Mescidi) ve Ümmet Birlik Duası", desc: "Peygamber Efendimiz'in ümmeti için gözyaşlarıyla kalben dua edip ikisine icabet edildiği tarihi bu makamda, kendimiz, ailemiz ve İslam alemi için ortak dua." },
  { cat: "EXTRA", name: "Mescid-i Dira' (Zırh Mescidi) Uhud Öncesi Bekleyiş", desc: "Uhud Seferi öncesinde çifte zırhını giyip ikindi namazını ashabıyla kıldığı o tefekkür ve sükunet mescidinin ziyareti." },
  { cat: "EXTRA", name: "Hulefa-i Raşidin Mescitleri İzleği (Ebu Bekir, Ömer, Ali)", desc: "Efendimiz'in en büyük yoldaşları Ebu Bekir, Ömer ve Ali (r.a) efendilerimize atfedilen eski lokasyonların ve sadakat sembollerinin izinin sürülmesi." },
  { cat: "EXTRA", name: "Bireysel Mutavvıf (Hoca) Eşliğinde Özel Umre İbadeti", desc: "Ailenize tam gün tahsis edilen, resmi lisanslı ve derin ilmi birikime sahip hoca eşliğinde, ihram, tavaf ve sa'y ibadetlerinin kaidelere mütakip feyizle yapılması." },
  { cat: "EXTRA", name: "Veda Umresi Kapanış Merasimi ve Zemzem Şişeleme", desc: "Manevi seyahatinizin son gününde size özel hazırlanan şişelere Zemzem doldurulması, şükür duası ve turun size özel estetik montajlı videosunun teslimi." },
  { cat: "EXTRA", name: "Mescid-i Taneem (Mescid-i Aişe) Yeniden İhrama Giriş Ritüeli", desc: "Mekke'den ayrılmadan evvel, akrabaları (vefat edenleri) adına tekrardan umre niyetine girmek isteyenler için lüks ulaşım aracı ve ihram lojistiği." },
  { cat: "EXTRA", name: "Özel Araçlı Kapsamlı Mekke Ziyaretleri (Mekke Ziyarat)", desc: "Aileniz için tahsis edilen araç ve lisanslı rehberiniz ile Sevr Dağı etekleri, Arafat, Müzdelife, Mina, Şeytan Taşlama bölgesi ve Nur Dağının derinlemesine keşfi." },
  { cat: "EXTRA", name: "Kapsamlı Medine Ziyaretleri (Uhud, Quba, Kıbleteyn, Hendek)", desc: "Grup telaşesi yaşanmadan, dilediğinizce vakit geçirebileceğiniz özel araç ile Uhud Şehitliği, İlk Mescid Quba, Kıbleteyn ve Yedi Mescitler alanının ilmi gezisi." },
  
  { cat: "TRANSFER", name: "Premium Cidde - Mekke Haramain Otelleri Transferi", desc: "Havalimanı kapısında isminizle karşılama, bagaj arabası desteği ve aile konforunuza uygun en üst sınıf (GMC vb.) lüks ve klimalı araçlarla otelinize stressiz VIP transfer." },
  { cat: "TRANSFER", name: "Mekke - Medine Bireysel Lüks Transfer (VIP Taksi)", desc: "Wi-Fi erişimi, güçlü VIP klima sistemi ve ücretsiz ferahlatıcı ikramlarla donatılmış geniş kabinli son model minivan/sedan araçlarda rüya gibi bir yolculuk tecrübesi." },
  { cat: "TRANSFER", name: "Lüks Minivan ile 5 Günlük Tam Kapsamlı Mekke-Medine Araç Tahsisi", desc: "Seyahatiniz süresince tüm bagaj ve rota lojistiğini devralan VIP Minivan ile istediğiniz yere ve ibadete en konforlu koşullarda ulaşma serbestisi sağlayan hizmet." },
  
  { cat: "PACKAGE", name: "Sükunet: Kısa İnziva", duration: "4 Gün", desc: "Mekke'ye hızlı ve pürüzsüz geçiş. Kalabalığa karışmadan taze bir dönüş.|||ITINERARY|||[{\"day\": 1, \"title\": \"Mukaddes Topraklara Varış\", \"desc\": \"Havalimanı karşılama ve manevi ihrama giriş.\"}, {\"day\": 2, \"title\": \"İlk Umre Edası\", \"desc\": \"Mescid-i Haram'da sükunetle ilk umre.\"}, {\"day\": 3, \"title\": \"Serbest Tefekkür\", \"desc\": \"İbadet ve kişisel vird okumaları.\"}, {\"day\": 4, \"title\": \"Veda\", \"desc\": \"Tevekkül ve şükürle Veda tavafının yapılması ve dönüş.\"}]" },
  { cat: "PACKAGE", name: "Kumların Sırrı: Çöl İnzivası", duration: "2 Gün", desc: "Çölde şık iç mimariye sahip çadırlarda yıldızların ve sessizliğin zirvesine şahitlik.|||ITINERARY|||[{\"day\": 1, \"title\": \"Çöle İntikal\", \"desc\": \"İkindi vakti çöl kampına varış ve günbatımında tefekkür yürüyüşü.\"}, {\"day\": 2, \"title\": \"Yıldızlar Altında İnziva\", \"desc\": \"Gecenin sükunetinde asırlar öncesi Bedevi hayatını idrak.\"}]" },
  { cat: "PACKAGE", name: "Sıfırdan Başlangıç: Çöl Tefekkürü", duration: "3 Gün", desc: "Gündüzleri Kabe'nin ikliminde, geceyi Bedevi kampında yıldız fenerleri altında yalıtılmış bir maneviyatta geçirme.|||ITINERARY|||[{\"day\": 1, \"title\": \"Mekke ve Umre\", \"desc\": \"İbadet sonrası çöl kampına özel hareket.\"}, {\"day\": 2, \"title\": \"Kamp ve İnziva\", \"desc\": \"Yalıtılmış bir ortamda gün boyu kişisel doğa okuması ve huzur.\"}, {\"day\": 3, \"title\": \"Dönüş\", \"desc\": \"Sabah namazı sonrası çöl esintisi eşliğinde dönüş.\"}]" },
  { cat: "PACKAGE", name: "Ekspres Maneviyat", duration: "5 Gün", desc: "Hareme yürüme mesafesinde özel tasarlanan ruhani alanlarda dolu dolu bir süreç.|||ITINERARY|||[{\"day\": 1, \"title\": \"Mekke Varış\", \"desc\": \"İlk umrenin rehber eşliğinde edası.\"}, {\"day\": 2, \"title\": \"Haremeyn Vakitleri\", \"desc\": \"Beş vakit namazın Harem'de eda edilmesine odaklanma.\"}, {\"day\": 3, \"title\": \"Siyer Okuması\", \"desc\": \"Sevr ve Nur Dağı eteklerinin manevi gezilmesi.\"}, {\"day\": 4, \"title\": \"Medine'ye Geçiş\", \"desc\": \"Tren ile Medine'ye geçiş ve Ravza selamlaması.\"}, {\"day\": 5, \"title\": \"Veda\", \"desc\": \"Veda selamı ve havalimanına intikal.\"}]" },
  { cat: "PACKAGE", name: "Öze Dönüş: İlk Adım Umresi", duration: "5 Gün", desc: "İbadetin ve sükunetin esasına odaklanan sade ve zarif manevi bir gezi.|||ITINERARY|||[{\"day\": 1, \"title\": \"Varış ve Niyet\", \"desc\": \"Niyet ve ilk tavafın sükunet içerisinde gerçekleşmesi.\"}, {\"day\": 2, \"title\": \"İbadet Günü\", \"desc\": \"Sadece namaz ve tilavetine ayrılan serbest zaman.\"}, {\"day\": 3, \"title\": \"Tarihi Ziyaret\", \"desc\": \"Bedir ve Uhud atmosferinin idraki.\"}, {\"day\": 4, \"title\": \"Mescid-i Nebevi\", \"desc\": \"Kubbe-i Hadra altında derin tefekkür.\"}, {\"day\": 5, \"title\": \"Veda\", \"desc\": \"Şükür namazları ve dönüş.\"}]" },
  { cat: "PACKAGE", name: "Kutlu Rota: İbadet ve Keşif", duration: "9 Gün", desc: "Mekke ve Medine'nin manevi altın oranında, sarsılmaz bir ruh haliyle her iki Harem bölgesindeki ibadeti dengeleyen seyahat.|||ITINERARY|||[{\"day\": 1, \"title\": \"Mekke Varış\", \"desc\": \"Hareme intikal ve umre edası.\"}, {\"day\": 3, \"title\": \"Mekke Siyeri\", \"desc\": \"İslam'ın doğduğu toprakları anlamlandırma.\"}, {\"day\": 5, \"title\": \"Hicret Günleri\", \"desc\": \"Haramain treniyle Medine'ye geçiş.\"}, {\"day\": 7, \"title\": \"Şehadet\", \"desc\": \"Medine'nin şanlı savunma mekanlarının ziyareti.\"}, {\"day\": 9, \"title\": \"Veda\", \"desc\": \"Son dualar.\"}]" },
  { cat: "PACKAGE", name: "Mescidin Gölgesinde: Uzun İnziva", duration: "25 Gün", desc: "Acelesi olmayan sükunet aşıkları için; ev konforunu kutsal topraklara taşıyan uzun soluklu ruhani tefekkür ve ibadet dönemi.|||ITINERARY|||[{\"day\": 1, \"title\": \"Yerleşme\", \"desc\": \"Uzun dönemli konaklama alanına uyum.\"}, {\"day\": 7, \"title\": \"Harem Odaklılık\", \"desc\": \"Harem merkezli rutinin oturtulması.\"}, {\"day\": 15, \"title\": \"Medine'nin Huzuru\", \"desc\": \"Medine'ye geçiş ve Ravza sükuneti.\"}, {\"day\": 25, \"title\": \"Arınmış Dönüş\", \"desc\": \"Tamamlanan devasa inzivanın ardından arınmış şükür.\"}]" }
];

async function main() {
  console.log('Seeding Tours and Packages to the database...');
  
  console.log('Clearing packages before re-seeding...');
  await prisma.package.deleteMany();

  for (const item of rawData) {
    if (item.cat === 'EXTRA') {
      await prisma.service.create({
        data: {
          type: 'EXTRA',
          name: item.name,
          description: item.desc,
          price: 99, // placeholder price
        }
      });
    } else if (item.cat === 'TRANSFER') {
      await prisma.service.create({
        data: {
          type: 'TRANSFER',
          name: item.name,
          description: item.desc,
          price: 149, // placeholder price
        }
      });
    } else if (item.cat === 'PACKAGE') {
      const slug = item.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 10000);
      await prisma.package.create({
        data: {
          slug: slug,
          title: item.name,
          description: item.desc,
          price: 0,
          duration: item.duration || "Esnek",
          published: true,
        }
      });
    }
  }

  console.log('Seeding finished successfully! Added ' + rawData.length + ' records.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
