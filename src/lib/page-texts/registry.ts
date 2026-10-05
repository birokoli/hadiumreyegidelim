// Sayfa metinleri kayıt defteri: sitede görünen her sabit metin burada bir alan olarak tanımlanır.
// Varsayılan değer koddadır; admin → Sayfa Metinleri'nde değiştirilirse Setting "PAGE_TEXTS:<sayfa>" (JSON) kullanılır.
// Yeni metin eklemek: ilgili sayfanın fields listesine { key, label, default, multiline?, help? } ekle, sayfada t("key") ile oku.

export type TextField = { key: string; label: string; default: string; multiline?: boolean; help?: string };
export type PageTextDef = { id: string; label: string; path: string; fields: TextField[] };

export const PAGE_TEXTS: PageTextDef[] = [
  {
    id: "hakkimizda",
    label: "Hakkımızda",
    path: "/hakkimizda",
    fields: [
      { key: "kicker", label: "Üst etiket", default: "Biz Kimiz" },
      { key: "title", label: "Başlık (H1)", default: "Hadi Umreye Gidelim" },
      { key: "lead", label: "Giriş", multiline: true, default: "Kalabalık kafilelere ve standart programlara bağlı kalmadan, ailenize özel bireysel umre deneyimi sunan bir organizasyon platformuyuz." },
      { key: "aside_title", label: "Yan kutu · Başlık", default: "Kurumsal Bilgi" },
      { key: "aside_cta", label: "Yan kutu · Düğme", default: "İletişime Geçin" },
      { key: "niyet_kicker", label: "Niyetimiz · Üst etiket", default: "Yaklaşımımız" },
      { key: "niyet_title", label: "Niyetimiz · Başlık", default: "Niyetimiz" },
      { key: "niyet_desc", label: "Niyetimiz · Açıklama", multiline: true, default: "Her ailenin umre ihtiyacı farklıdır. Kalabalık programlardan bağımsız olarak, sizi ve ailenizi Kutsal Topraklar'a huzurlu, konforlu ve manevi açıdan verimli şekilde ulaştırmak için çalışıyoruz." },
      { key: "hizmet_kicker", label: "Hizmetlerimiz · Üst etiket", default: "Hizmetlerimiz" },
      { key: "hizmet_title", label: "Hizmetlerimiz · Başlık", default: "Ne Sunuyoruz" },
      { key: "neden_kicker", label: "Neden Biz · Üst etiket", default: "Avantajlarımız" },
      { key: "neden_title", label: "Neden Biz · Başlık", default: "Neden Biz?" },
      { key: "neden_desc1", label: "Neden Biz · Paragraf 1", multiline: true, default: "Suudi Arabistan'ın uyguladığı esnek umre politikaları sayesinde, bireysel umre yapmak artık hem yasal hem de çok daha erişilebilir. Biz bu imkânı herkesin kolayca kullanabilmesi için teknoloji ve deneyimlerimizi bir araya getiriyoruz." },
      { key: "cta", label: "Alt Düğme", default: "Danışmanlık Alın" },
    ],
  },
  {
    id: "anasayfa",
    label: "Ana Sayfa",
    path: "/",
    fields: [
      { key: "kicker", label: "Hero · Üst etiket", default: "Bireysel Umre 2026", help: "Ana sayfanın diğer başlıkları (kapak başlığı, paketler, adımlar, blog, SSS) admin → Ayarlar → Ana sayfa bölümündedir." },
    ],
  },
  {
    id: "bireysel-umre",
    label: "Bireysel Umre",
    path: "/bireysel-umre",
    fields: [
      { key: "crumb_home", label: "Ekmek kırıntısı · Ana sayfa", default: "Ana Sayfa" },
      { key: "crumb_title", label: "Ekmek kırıntısı · Başlık", default: "Bireysel Umre" },
      { key: "kicker", label: "Üst etiket", default: "Bireysel umre 2026" },
      { key: "title", label: "Başlık (H1)", default: "Umrenizi planlayın, fiyatı hemen görün" },
      { key: "lead", label: "Giriş", multiline: true, default: "Tarihlerinizi, Mekke ve Medine otelinizi, transferinizi ve vizenizi seçin; seçtiğiniz ayın güncel fiyatıyla toplamı görün. Planı gönderin, kesin teklifi ekibimiz iletsin." },
      { key: "steps_kicker", label: "Adımlar · Üst etiket", default: "Nasıl çalışır?" },
      { key: "steps_title", label: "Adımlar · Başlık", default: "Üç adımda bireysel umre planı" },
      { key: "comp_kicker", label: "Karşılaştırma · Üst etiket", default: "Karşılaştırma" },
      { key: "comp_title", label: "Karşılaştırma · Başlık", default: "Bireysel umre mi, grup umresi mi?" },
      { key: "faq_kicker", label: "SSS · Üst etiket", default: "Sık sorulanlar" },
      { key: "faq_title", label: "SSS · Başlık", default: "Bireysel umre hakkında sorular" },
    ],
  },
  {
    id: "hizmetler",
    label: "Hizmetler",
    path: "/hizmetler",
    fields: [
      { key: "kicker", label: "Üst etiket", default: "Hizmetler" },
      { key: "title", label: "Başlık (H1)", default: "Umre hizmetleri ve güncel fiyatlar" },
      { key: "lead", label: "Giriş", multiline: true, default: "Mekke ve Medine otelleri, transfer, ziyaret turları ve e-vize. Fiyatlar aylık güncellenir; hepsini planlayıcıda seçip tek fiyat görebilirsiniz." },
      { key: "aside_title", label: "Yan kutu · Başlık", default: "Kendi umrenizi birleştirin" },
      { key: "aside_lead", label: "Yan kutu · Giriş", multiline: true, default: "Tarih, otel, transfer ve vizeyi seçin; oda ve gece sayısına göre fiyat anında hesaplanır." },
      { key: "aside_cta", label: "Yan kutu · Düğme", default: "Umremi planla" },
    ],
  },
  {
    id: "paketler",
    label: "Paketler",
    path: "/paketler",
    fields: [
      { key: "kicker", label: "Üst etiket", default: "Umre paketleri 2026" },
      { key: "title", label: "Başlık (H1)", default: "Umre Fiyatları 2026 ve Paketler" },
      { key: "lead", label: "Giriş", multiline: true, default: "Paket fiyatlarımız sabit değildir: seçtiğiniz otele, kişi sayısına ve seyahat ayına göre hesaplanır. Her paketin kişi başı başlangıç fiyatını görün, otelinizi seçince fiyat anında güncellensin." },
      { key: "tours_kicker", label: "Turlar · Üst etiket", default: "Yayındaki paketler" },
      { key: "tours_lead", label: "Turlar · Giriş", multiline: true, default: "Otel ve transferler paket fiyatına dahildir. Uçak bileti dahil değildir; umre vizesi ayrıca alınır." },
      { key: "empty_state", label: "Boş durum mesajı", multiline: true, default: "Şu an için yayında olan bir umre paketi bulunmuyor. Tur planlamalarımız devam etmektedir, lütfen daha sonra tekrar kontrol edin." },
    ],
  },
  {
    id: "yorumlar",
    label: "Yorumlar",
    path: "/yorumlar",
    fields: [
      { key: "kicker", label: "Üst etiket", default: "Umrecilerimiz anlatıyor" },
      { key: "title", label: "Başlık", default: "Umreye bizimle gidenler ne diyor?" },
      { key: "lead", label: "Giriş (/yorumlar sayfası)", multiline: true, default: "Umresini bizimle planlayan misafirlerimizin yorumları. Yorumlar onaydan geçer; düşük puanlı yorumlar da yayımlanır, yalnızca hakaret ve kişisel bilgi içerenler çıkarılır.", help: "Ana sayfada en yeni 6 yorum gösterilir. Yorumlar admin → Yorumlar'dan yönetilir." },
      { key: "link", label: "Ana sayfa bağlantı metni", default: "Tüm yorumlar" },
    ],
  },
  {
    id: "oteller",
    label: "Oteller",
    path: "/oteller",
    fields: [
      { key: "kicker", label: "Üst etiket", default: "Umre otelleri" },
      { key: "title", label: "Başlık (H1)", default: "Mekke ve Medine otelleri" },
      { key: "lead", label: "Giriş", multiline: true, default: "Yıldızı, Harem'e mesafesi ve oda başı gecelik başlangıç fiyatıyla otellerimiz. Bir otele tıklayıp ayrıntılarını görün ya da umre planınıza ekleyin." },
      { key: "footnote", label: "Alt not", multiline: true, default: "Fiyatlar oda başı gecelik başlangıç fiyatıdır; odada en fazla 4 kişi kalabilir. Kesin fiyat tarih ve müsaitliğe göre belirlenir.", help: "Otellerin kendisi (ad, yıldız, mesafe, görsel, fiyat, otel sayfası açıklaması) admin → Hizmet Kütüphanesi'nden düzenlenir." },
      { key: "empty_state", label: "Boş durum mesajı", default: "Şu an yayında otel bulunmuyor." },
    ],
  },
  {
    id: "blog",
    label: "Blog",
    path: "/blog",
    fields: [
      { key: "kicker", label: "Üst etiket", default: "Blog" },
      { key: "title", label: "Başlık (H1)", default: "Umre rehber yazıları" },
      { key: "lead", label: "Giriş", multiline: true, default: "Vize, otel seçimi, Haremeyn treni, Mekke ve Medine'de ziyaret yerleri: bireysel umreye hazırlanırken en çok sorulan konular." },
    ],
  },
  {
    id: "umre-vizesi",
    label: "Umre Vizesi",
    path: "/umre-vizesi",
    fields: [
      { key: "kicker", label: "Üst etiket", default: "Vize İşlemleri" },
      { key: "title", label: "Başlık (H1)", default: "Bireysel Umre Vizesi Nedir?" },
      { key: "lead", label: "Giriş", multiline: true, default: "Kalabalık gruplara ve katı kurallara bağlı kalmak zorunda değilsiniz. Kendi ailenizle, bağımsız bir umre deneyimi için gereken vize süreci oldukça kolaydır." },
      { key: "aside_title", label: "Yan kutu · Başlık", default: "Vize Hizmeti" },
      { key: "aside_note", label: "Yan kutu · Not", default: "Belgeleriniz tamamsa vizeniz 2 iş saati içinde hazır olur." },
      { key: "aside_cta", label: "Yan kutu · Düğme", default: "Online Vize Başvurusu Yap" },
    ],
  },
  {
    id: "umre-vizesi-basvuru",
    label: "Umre Vizesi Başvurusu",
    path: "/umre-vizesi/basvuru",
    fields: [
      { key: "kicker", label: "Üst etiket", default: "Online Başvuru" },
      { key: "title", label: "Başlık (H1)", default: "Umre vizesi başvurusu" },
      { key: "lead", label: "Giriş", multiline: true, default: "Umre vizesi başvurunuzu Hadi Umreye Gidelim'e bırakabilirsiniz. Ücret kişi başı 140 USD; belgeleriniz tamamsa vize 2 iş saatinde çıkar. Formu doldurun, ekibimiz gereken belgeleri bildirsin ve Suudi Arabistan e-vizenizi sizin adınıza alsın." },
      { key: "steps_title", label: "Adımlar · Başlık", default: "Başvuru nasıl ilerler?" },
      { key: "docs_title", label: "Belgeler · Başlık", default: "Umre vizesi için hangi belgeler gerekir?" },
      { key: "faq_title", label: "SSS · Başlık", default: "Sık sorulanlar" },
    ],
  },
  {
    id: "iletisim",
    label: "İletişim",
    path: "/iletisim",
    fields: [
      { key: "kicker", label: "Üst etiket", default: "Destek ve iletişim" },
      { key: "hero_title", label: "Başlık (H1)", default: "Birlikte çözelim." },
      { key: "hero_lead", label: "Giriş", multiline: true, default: "Umre planı, vize, ödeme ya da mevcut rezervasyonunuz. Sorunuzu doğru konu başlığıyla iletin, ekibimiz size dönsün." },
      { key: "form_title", label: "Form başlığı", default: "Bize yazın" },
      { key: "form_lead", label: "Form açıklaması", multiline: true, default: "Umre planı, vize ya da mevcut rezervasyonunuzla ilgili her soru buradan bize ulaşır. Talebiniz kayıt altına alınır ve size bir takip numarası verilir." },
      { key: "call_center_label", label: "Çağrı Merkezi Etiketi", default: "Çağrı Merkezi & WhatsApp" },
      { key: "call_center_btn", label: "Çağrı Merkezi Düğmesi", default: "WhatsApp'tan Yazın" },
      { key: "email_label", label: "E-posta Etiketi", default: "E-posta İletişimi" },
      { key: "email_btn", label: "E-posta Düğmesi", default: "E-posta Gönderin" },
      { key: "office_label", label: "Merkez Ofis Etiketi", default: "Merkez Ofis" },
    ],
  },
  {
    id: "sss",
    label: "Sıkça Sorulan Sorular",
    path: "/sss",
    fields: [
      { key: "kicker", label: "Üst etiket", default: "Sıkça sorulan sorular" },
      { key: "title", label: "Başlık (H1)", default: "Aklınızdaki sorular." },
      { key: "lead", label: "Giriş", multiline: true, default: "Umre planlama, vize, ödeme ve rezervasyon süreçleriyle ilgili en çok sorulan soruların cevapları." },
      {
        key: "items",
        label: "Sorular",
        multiline: true,
        help: "Her soru bir blok: ilk satır 'Kategori | Soru', alt satırlar cevap; bloklar arasında boş satır. Kategoriler: Umre planlama, Vize, Ödeme ve iptal, Hadi Umreye Gidelim.",
        default: `Umre planlama | Hangi hizmetleri veriyorsunuz?
Bireysel umre planlaması yapıyoruz: Mekke ve Medine otelleri, havalimanı ve şehirler arası transferler, Haremeyn hızlı treni, rehberlik ve umre vizesi. Uçak biletini siz alırsınız; seçtiğiniz tarihlere göre planı biz kurarız.

Umre planlama | Nasıl rezervasyon yapabilirim?
Bireysel umre tasarlayıcısında tarihlerinizi, otelinizi ve transferinizi seçip toplam fiyatı görebilir ya da hazır paketlerden birini inceleyebilirsiniz. Planınızı gönderdiğinizde müsaitliği kontrol edip kesin teklifi WhatsApp'tan iletiyoruz.

Umre planlama | Uçak bileti fiyata dahil mi?
Hayır. Uçak biletini kendiniz alırsınız; otel, transfer ve diğer hizmetler seçtiğiniz uçuş tarihlerine göre planlanır. Vize başvurusu için gidiş-dönüş biletiniz gereklidir.

Umre planlama | Grup ya da aile için özel program hazırlıyor musunuz?
Evet. Kişi sayınızı, tarihlerinizi ve otel tercihlerinizi grup talepleri sayfasından iletin; oda dağılımı, transfer ve rehberlik dahil programı birlikte planlayalım.

Vize | Umre vizesi nasıl alınır?
Otel rezervasyonunuzu, gidiş-dönüş uçak biletinizi, her yolcunun pasaportunun ön yüzünü ve birer biyometrik fotoğrafı WhatsApp'tan bize gönderirsiniz. Kişi başı 140 USD ödemenin ardından vizeniz 2 saat içinde hadiumreyegidelim.com tarafından iletilir.

Vize | Pasaportumun geçerlilik süresi ne kadar olmalı?
Pasaportunuzun seyahat tarihinden itibaren en az 6 ay geçerli olması gerekir. Bebekler ve çocuklar dahil her yolcunun ayrı vizesi olmalıdır.

Vize | Ravza randevusunu siz mi alıyorsunuz?
Hayır. Ravza ziyareti randevusu Suudi Arabistan'ın resmî Nusuk uygulamasından kişisel olarak alınır. Uygulamanın nasıl kullanılacağını blogumuzdaki Nusuk rehberinde adım adım anlattık.

Ödeme ve iptal | Fiyatlar hangi para biriminde?
Fiyatlarımız ABD doları (USD) üzerinden verilir. Türk lirası ile ödemede güncel kur üzerinden hesaplanan tutar teklifte ayrıca yazılır.

Ödeme ve iptal | Hangi ödeme yöntemlerini kabul ediyorsunuz?
Banka havalesi / EFT ve kredi kartı ile ödeme yapabilirsiniz. Ödeme bilgileri ve tutar, onayladığınız teklifle birlikte iletilir.

Ödeme ve iptal | Rezervasyonumu iptal edebilir ya da tarihini değiştirebilir miyim?
İptal ve değişiklik koşulları otele, transfere ve tarihe göre değişir. Bir değişiklik ihtiyacınız olduğunda talep numaranız ya da adınızla destek formundan veya WhatsApp'tan bize yazın; koşulları sizin rezervasyonunuza göre yazılı olarak iletelim.

Hadi Umreye Gidelim | Seyahat sırasında bir sorun yaşarsam kime ulaşırım?
WhatsApp hattımızdan bize yazabilirsiniz. Transfer, otel ya da program değişikliği gibi konularda ekibimiz sizinle iletişimde kalır.

Hadi Umreye Gidelim | Hadi Umreye Gidelim hangi kurum bünyesinde?
Hadi Umreye Gidelim, MBD Tourism L.L.C. bünyesinde hizmet verir (DTCM lisans no 1203162). İstanbul iletişim adresimiz Bakırköy'dedir.`,
      },
    ],
  },
  {
    id: "grup-talepleri",
    label: "Grup Talepleri",
    path: "/grup-talepleri",
    fields: [
      { key: "kicker", label: "Üst etiket", default: "Grup talepleri" },
      { key: "title", label: "Başlık (H1)", default: "Birlikte gidilen umre, birlikte planlanır." },
      { key: "lead", label: "Giriş", multiline: true, default: "Ailenizle ya da grubunuzla umreye mi gidiyorsunuz? Kişi sayınızı ve tarihlerinizi iletin, programı birlikte kuralım." },
      { key: "card1_title", label: "Kart 1 · Başlık", default: "Konaklama ve ulaşım" },
      { key: "card1_text", label: "Kart 1 · Metin", multiline: true, default: "Oda dağılımı, Mekke–Medine otelleri, havalimanı transferleri ve Haremeyn treni grubunuza göre planlanır." },
      { key: "card2_title", label: "Kart 2 · Başlık", default: "Aile ve grup" },
      { key: "card2_text", label: "Kart 2 · Metin", multiline: true, default: "Yaşlı, çocuklu ya da tekerlekli sandalye kullanan yolcularınız için otel konumu ve transfer ona göre seçilir." },
      { key: "card3_title", label: "Kart 3 · Başlık", default: "Rehberlik ve ziyaretler" },
      { key: "card3_text", label: "Kart 3 · Metin", multiline: true, default: "Mekke ve Medine ziyaretleri, şehir turları ve Türkçe rehberlik programınıza eklenebilir." },
      { key: "extra_label", label: "Formdaki ek alan", default: "Kişi sayısı ve tarih aralığı" },
    ],
  },
  {
    id: "isletme-kaydi",
    label: "İşletme Kaydı",
    path: "/isletme-kaydi",
    fields: [
      { key: "kicker", label: "Üst etiket", default: "İşletmenizi kaydedin" },
      { key: "title", label: "Başlık (H1)", default: "İşletmenizle umrecilere ulaşın." },
      { key: "lead", label: "Giriş", multiline: true, default: "Mekke ve Medine'de otel, transfer, rehberlik ya da ziyaret hizmeti veriyorsanız hizmetlerinizi ve iş birliği beklentinizi bizimle paylaşın." },
      { key: "types", label: "Kimler başvurabilir (her satır bir madde)", multiline: true, default: "Oteller\nTransfer firmaları\nTürkçe rehberler ve rehberlik ofisleri\nZiyaret, tur ve deneyim sağlayıcıları\nUmre öncesi eğitim ve seminer veren kurumlar" },
      { key: "extra_label", label: "Formdaki ek alan", default: "İşletme adı ve web sitesi" },
    ],
  },
  {
    id: "rehberlik",
    label: "Manevi Rehberlik",
    path: "/rehberlik",
    fields: [
      { key: "kicker", label: "Üst etiket", default: "Türkçe Rehberlik" },
      { key: "title", label: "Başlık (H1)", default: "Umre Rehberliği: Mekke ve Medine" },
      { key: "lead", label: "Giriş", multiline: true, default: "Mekke ve Medine'deki ibadet ve ziyaretlerinizde Türkçe rehber eşliği; rehberliği planlayıcıda ekleyebilirsiniz." },
      { key: "aside_title", label: "Yan kutu · Başlık", default: "Özel Rehberiniz Olsun" },
      { key: "aside_desc", label: "Yan kutu · Açıklama", multiline: true, default: "Mekke ve Medine ziyaretlerinizde ailenize özel rehberlik hizmetini planlayıcıda seçebilirsiniz." },
      { key: "aside_cta", label: "Yan kutu · Düğme", default: "Umremi Planla" },
      { key: "team_kicker", label: "Ekip · Üst etiket", default: "Rehber Kadromuz" },
      { key: "team_title", label: "Ekip · Başlık", default: "Rehberlerimiz" },
      { key: "spots_kicker", label: "Duraklar · Üst etiket", default: "Kutsal Mekânlar" },
      { key: "spots_title", label: "Duraklar · Başlık", default: "Ziyaret Durakları" },
    ],
  },
  {
    id: "umre-rehberi",
    label: "Umre Rehberi Hub",
    path: "/umre-rehberi",
    fields: [
      { key: "title", label: "Başlık (H1)", default: "Umre rehberi" },
      { key: "lead", label: "Giriş", multiline: true, default: "Umre ibadetinin adımlarını, sık geçen terimleri ve umreyi kime ve hangi döneme göre nasıl planlayacağınızı anlatan rehber sayfaları. Bireysel umrenizi planlamak için tasarlayıcıyı kullanabilirsiniz." },
    ],
  },
  {
    id: "il-sayfasi",
    label: "İl Sayfası Şablonu",
    path: "/[slug]",
    fields: [
      { key: "title", label: "Başlık (H1)", help: "{il} yer tutucusu şehir adıyla değiştirilir", default: "{il} Çıkışlı Bireysel Umre" },
      { key: "lead", label: "Giriş", help: "{from}, {airportName}, {airportCode} yer tutucuları kullanılır", multiline: true, default: "{from} umreye gidecekler için Mekke ve Medine oteli, transfer ve e-vize tek planda. Uçak biletinizi {airportName} ({airportCode}) kalkışlı alırsınız; konaklama ve transferi tarihlerinize göre biz planlarız." },
      { key: "aside_title", label: "Yan kutu · Başlık", default: "Fiyatı hemen görün" },
      { key: "aside_lead", label: "Yan kutu · Giriş", multiline: true, default: "Tarihlerinizi, otelinizi ve transferinizi seçin; oda ve gece sayısına göre toplam anında hesaplanır." },
      { key: "aside_cta", label: "Yan kutu · Düğme", default: "Umremi planla" },
    ],
  },
  {
    id: "footer",
    label: "Alt Bilgi (Footer)",
    path: "layout",
    fields: [
      { key: "copyright", label: "Telif Notu", default: "Hadi Umreye Gidelim - Bireysel ve VIP Umre" },
      { key: "company_note", label: "Kurumsal Lisans Notu", multiline: true, default: "Hadi Umreye Gidelim, MBD Tourism L.L.C. iştirakidir. MBD Tourism L.L.C., Dubai Ekonomi ve Turizm Departmanı (DTCM) tarafından lisanslı seyahat acentesidir. DTCM Lisans No: 1203162." },
    ],
  },
];

export const pageTextDef = (id: string) => PAGE_TEXTS.find((p) => p.id === id);
export const pageTextsSettingKey = (id: string) => `PAGE_TEXTS:${id}`;
