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
      { key: "kicker", label: "Üst etiket", default: "Size Özel Tasarlandı" },
      { key: "title", label: "Başlık (H1)", default: "Ayrıcalıklı Umre Paketleri" },
      { key: "lead", label: "Giriş", multiline: true, default: "Manevi yolculuğunuzu konfor ve huzur içinde geçirebilmeniz için her detayı düşünülmüş, özenle hazırlanmış tur seçenekleri." },
      { key: "tours_kicker", label: "Turlar · Üst etiket", default: "Müsait Turlarımız" },
      { key: "tours_lead", label: "Turlar · Giriş", multiline: true, default: "Vize, konaklama, transfer ve manevi rehberlik dahil tüm süreçleri sizin yerinize yönetiyoruz." },
      { key: "empty_state", label: "Boş durum mesajı", multiline: true, default: "Şu an için yayında olan bir umre paketi bulunmuyor. Tur planlamalarımız devam etmektedir, lütfen daha sonra tekrar kontrol edin." },
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
      { key: "kicker", label: "Üst etiket", default: "İletişim" },
      { key: "call_center_label", label: "Çağrı Merkezi Etiketi", default: "Çağrı Merkezi & WhatsApp" },
      { key: "call_center_btn", label: "Çağrı Merkezi Düğmesi", default: "WhatsApp'tan Yazın" },
      { key: "email_label", label: "E-posta Etiketi", default: "E-posta İletişimi" },
      { key: "email_btn", label: "E-posta Düğmesi", default: "E-posta Gönderin" },
      { key: "office_label", label: "Merkez Ofis Etiketi", default: "Merkez Ofis" },
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
