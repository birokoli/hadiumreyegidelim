export interface TurkeyCity {
  slug: string;
  name: string;
  airportCode: string;
  airportName: string;
}

export const turkeyCities: TurkeyCity[] = [
  { slug: "adana", name: "Adana", airportCode: "ADA", airportName: "Adana Şakirpaşa" },
  { slug: "adiyaman", name: "Adıyaman", airportCode: "ADF", airportName: "Adıyaman Havalimanı" },
  { slug: "afyonkarahisar", name: "Afyonkarahisar", airportCode: "KZR", airportName: "Zafer Havalimanı" },
  { slug: "agri", name: "Ağrı", airportCode: "AJI", airportName: "Ağrı Ahmed-i Hani" },
  { slug: "amasya", name: "Amasya", airportCode: "MZH", airportName: "Merzifon Havalimanı" },
  { slug: "ankara", name: "Ankara", airportCode: "ESB", airportName: "Ankara Esenboğa" },
  { slug: "antalya", name: "Antalya", airportCode: "AYT", airportName: "Antalya Havalimanı" },
  { slug: "artvin", name: "Artvin", airportCode: "AAR", airportName: "Artvin Hopa (Batum Üzeri)" }, // Actually they often use Rize-Artvin RZV or Kars, let's use RZV
  { slug: "aydin", name: "Aydın", airportCode: "ADB", airportName: "İzmir Adnan Menderes" }, // Closest
  { slug: "balikesir", name: "Balıkesir", airportCode: "EDO", airportName: "Balıkesir Koca Seyit" },
  { slug: "bilecik", name: "Bilecik", airportCode: "SAW", airportName: "Sabiha Gökçen" }, // Closest
  { slug: "bingol", name: "Bingöl", airportCode: "BGG", airportName: "Bingöl Havalimanı" },
  { slug: "bitlis", name: "Bitlis", airportCode: "MSR", airportName: "Muş Sultan Alparslan" },
  { slug: "bolu", name: "Bolu", airportCode: "SAW", airportName: "Sabiha Gökçen" },
  { slug: "burdur", name: "Burdur", airportCode: "ISE", airportName: "Isparta Süleyman Demirel" },
  { slug: "bursa", name: "Bursa", airportCode: "YEI", airportName: "Bursa Yenişehir" },
  { slug: "canakkale", name: "Çanakkale", airportCode: "CKZ", airportName: "Çanakkale Havalimanı" },
  { slug: "cankiri", name: "Çankırı", airportCode: "ESB", airportName: "Ankara Esenboğa" },
  { slug: "corum", name: "Çorum", airportCode: "MZH", airportName: "Merzifon Havalimanı" },
  { slug: "denizli", name: "Denizli", airportCode: "DNZ", airportName: "Denizli Çardak" },
  { slug: "diyarbakir", name: "Diyarbakır", airportCode: "DIY", airportName: "Diyarbakır Havalimanı" },
  { slug: "edirne", name: "Edirne", airportCode: "IST", airportName: "İstanbul Havalimanı" },
  { slug: "elazig", name: "Elazığ", airportCode: "EZS", airportName: "Elazığ Havalimanı" },
  { slug: "erzincan", name: "Erzincan", airportCode: "ERC", airportName: "Erzincan Yıldırım Akbulut" },
  { slug: "erzurum", name: "Erzurum", airportCode: "ERZ", airportName: "Erzurum Havalimanı" },
  { slug: "eskisehir", name: "Eskişehir", airportCode: "AOE", airportName: "Hasan Polatkan" },
  { slug: "gaziantep", name: "Gaziantep", airportCode: "GZT", airportName: "Gaziantep Havalimanı" },
  { slug: "giresun", name: "Giresun", airportCode: "OGU", airportName: "Ordu Giresun Havalimanı" },
  { slug: "gumushane", name: "Gümüşhane", airportCode: "TZX", airportName: "Trabzon Havalimanı" },
  { slug: "hakkari", name: "Hakkari", airportCode: "YKO", airportName: "Hakkari Yüksekova" },
  { slug: "hatay", name: "Hatay", airportCode: "HTY", airportName: "Hatay Havalimanı" },
  { slug: "isparta", name: "Isparta", airportCode: "ISE", airportName: "Isparta Süleyman Demirel" },
  { slug: "mersin", name: "Mersin", airportCode: "ADA", airportName: "Adana Şakirpaşa" },
  { slug: "istanbul", name: "İstanbul", airportCode: "IST", airportName: "İstanbul Havalimanı" },
  { slug: "izmir", name: "İzmir", airportCode: "ADB", airportName: "İzmir Adnan Menderes" },
  { slug: "kars", name: "Kars", airportCode: "KSY", airportName: "Kars Harakani" },
  { slug: "kastamonu", name: "Kastamonu", airportCode: "KFS", airportName: "Kastamonu Havalimanı" },
  { slug: "kayseri", name: "Kayseri", airportCode: "ASR", airportName: "Kayseri Erkilet" },
  { slug: "kirklareli", name: "Kırklareli", airportCode: "IST", airportName: "İstanbul Havalimanı" },
  { slug: "kirsehir", name: "Kırşehir", airportCode: "NAV", airportName: "Kapadokya Havalimanı" },
  { slug: "kocaeli", name: "Kocaeli", airportCode: "KCO", airportName: "Kocaeli Cengiz Topel" },
  { slug: "konya", name: "Konya", airportCode: "KYA", airportName: "Konya Havalimanı" },
  { slug: "kutahya", name: "Kütahya", airportCode: "KZR", airportName: "Zafer Havalimanı" },
  { slug: "malatya", name: "Malatya", airportCode: "MLX", airportName: "Malatya Erhaç" },
  { slug: "manisa", name: "Manisa", airportCode: "ADB", airportName: "İzmir Adnan Menderes" },
  { slug: "kahramanmaras", name: "Kahramanmaraş", airportCode: "KCM", airportName: "Kahramanmaraş Havalimanı" },
  { slug: "mardin", name: "Mardin", airportCode: "MQM", airportName: "Mardin Prof. Dr. Aziz Sancar" },
  { slug: "mugla", name: "Muğla", airportCode: "BJV", airportName: "Milas-Bodrum" },
  { slug: "mus", name: "Muş", airportCode: "MSR", airportName: "Muş Sultan Alparslan" },
  { slug: "nevsehir", name: "Nevşehir", airportCode: "NAV", airportName: "Kapadokya Havalimanı" },
  { slug: "nigde", name: "Niğde", airportCode: "NAV", airportName: "Kapadokya Havalimanı" },
  { slug: "ordu", name: "Ordu", airportCode: "OGU", airportName: "Ordu Giresun Havalimanı" },
  { slug: "rize", name: "Rize", airportCode: "RZV", airportName: "Rize-Artvin Havalimanı" },
  { slug: "sakarya", name: "Sakarya", airportCode: "SAW", airportName: "Sabiha Gökçen" },
  { slug: "samsun", name: "Samsun", airportCode: "SZF", airportName: "Samsun Çarşamba" },
  { slug: "siirt", name: "Siirt", airportCode: "SXZ", airportName: "Siirt Havalimanı" },
  { slug: "sinop", name: "Sinop", airportCode: "SIC", airportName: "Sinop Havalimanı" },
  { slug: "sivas", name: "Sivas", airportCode: "VAS", airportName: "Sivas Nuri Demirağ" },
  { slug: "tekirdag", name: "Tekirdağ", airportCode: "TEQ", airportName: "Tekirdağ Çorlu" },
  { slug: "tokat", name: "Tokat", airportCode: "TJK", airportName: "Tokat Havalimanı" },
  { slug: "trabzon", name: "Trabzon", airportCode: "TZX", airportName: "Trabzon Havalimanı" },
  { slug: "tunceli", name: "Tunceli", airportCode: "EZS", airportName: "Elazığ Havalimanı" },
  { slug: "sanliurfa", name: "Şanlıurfa", airportCode: "GNY", airportName: "Şanlıurfa GAP" },
  { slug: "usak", name: "Uşak", airportCode: "USQ", airportName: "Uşak Havalimanı" },
  { slug: "van", name: "Van", airportCode: "VAN", airportName: "Van Ferit Melen" },
  { slug: "yozgat", name: "Yozgat", airportCode: "ASR", airportName: "Kayseri Erkilet" }, // Yozgat airport under construction
  { slug: "zonguldak", name: "Zonguldak", airportCode: "ONQ", airportName: "Zonguldak Çaycuma" },
  { slug: "aksaray", name: "Aksaray", airportCode: "NAV", airportName: "Kapadokya Havalimanı" },
  { slug: "bayburt", name: "Bayburt", airportCode: "ERC", airportName: "Erzincan Yıldırım Akbulut" }, // Or Erzurum
  { slug: "karaman", name: "Karaman", airportCode: "KYA", airportName: "Konya Havalimanı" },
  { slug: "kirikkale", name: "Kırıkkale", airportCode: "ESB", airportName: "Ankara Esenboğa" },
  { slug: "batman", name: "Batman", airportCode: "BAL", airportName: "Batman Havalimanı" },
  { slug: "sirnak", name: "Şırnak", airportCode: "NKT", airportName: "Şırnak Şerafettin Elçi" },
  { slug: "bartin", name: "Bartın", airportCode: "ONQ", airportName: "Zonguldak Çaycuma" },
  { slug: "ardahan", name: "Ardahan", airportCode: "KSY", airportName: "Kars Harakani" },
  { slug: "igdir", name: "Iğdır", airportCode: "IGD", airportName: "Iğdır Şehit Bülent Aydın" },
  { slug: "yalova", name: "Yalova", airportCode: "SAW", airportName: "Sabiha Gökçen" },
  { slug: "karabuk", name: "Karabük", airportCode: "ONQ", airportName: "Zonguldak Çaycuma" },
  { slug: "kilis", name: "Kilis", airportCode: "GZT", airportName: "Gaziantep Havalimanı" },
  { slug: "osmaniye", name: "Osmaniye", airportCode: "ADA", airportName: "Adana Şakirpaşa" },
  { slug: "duzce", name: "Düzce", airportCode: "SAW", airportName: "Sabiha Gökçen" }
];

export function getTurkishCityBySlug(slug: string): TurkeyCity | undefined {
  return turkeyCities.find((c) => c.slug === slug);
}
