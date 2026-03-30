import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const packages = [
  { name: "Sükunet: Kısa İnziva", duration: "4 Gün", desc: "Mekke'ye hızlı ve pürüzsüz geçiş. Kalabalığa karışmadan taze bir dönüş.|||ITINERARY|||[{\"day\": 1, \"title\": \"Mukaddes Topraklara Varış\", \"desc\": \"Havalimanı karşılama ve manevi ihrama giriş.\"}, {\"day\": 2, \"title\": \"İlk Umre Edası\", \"desc\": \"Mescid-i Haram'da sükunetle ilk umre.\"}, {\"day\": 3, \"title\": \"Serbest Tefekkür\", \"desc\": \"İbadet ve kişisel vird okumaları.\"}, {\"day\": 4, \"title\": \"Veda\", \"desc\": \"Tevekkül ve şükürle Veda tavafının yapılması ve dönüş.\"}]" },
  { name: "Kumların Sırrı: Çöl İnzivası", duration: "2 Gün", desc: "Çölde şık iç mimariye sahip çadırlarda yıldızların ve sessizliğin zirvesine şahitlik.|||ITINERARY|||[{\"day\": 1, \"title\": \"Çöle İntikal\", \"desc\": \"İkindi vakti çöl kampına varış ve günbatımında tefekkür yürüyüşü.\"}, {\"day\": 2, \"title\": \"Yıldızlar Altında İnziva\", \"desc\": \"Gecenin sükunetinde asırlar öncesi Bedevi hayatını idrak.\"}]" },
  { name: "Sıfırdan Başlangıç: Çöl Tefekkürü", duration: "3 Gün", desc: "Gündüzleri Kabe'nin ikliminde, geceyi Bedevi kampında yıldız fenerleri altında yalıtılmış bir maneviyatta geçirme.|||ITINERARY|||[{\"day\": 1, \"title\": \"Mekke ve Umre\", \"desc\": \"İbadet sonrası çöl kampına özel hareket.\"}, {\"day\": 2, \"title\": \"Kamp ve İnziva\", \"desc\": \"Yalıtılmış bir ortamda gün boyu kişisel doğa okuması ve huzur.\"}, {\"day\": 3, \"title\": \"Dönüş\", \"desc\": \"Sabah namazı sonrası çöl esintisi eşliğinde dönüş.\"}]" },
  { name: "Ekspres Maneviyat", duration: "5 Gün", desc: "Hareme yürüme mesafesinde özel tasarlanan ruhani alanlarda dolu dolu bir süreç.|||ITINERARY|||[{\"day\": 1, \"title\": \"Mekke Varış\", \"desc\": \"İlk umrenin rehber eşliğinde edası.\"}, {\"day\": 2, \"title\": \"Haremeyn Vakitleri\", \"desc\": \"Beş vakit namazın Harem'de eda edilmesine odaklanma.\"}, {\"day\": 3, \"title\": \"Siyer Okuması\", \"desc\": \"Sevr ve Nur Dağı eteklerinin manevi gezilmesi.\"}, {\"day\": 4, \"title\": \"Medine'ye Geçiş\", \"desc\": \"Tren ile Medine'ye geçiş ve Ravza selamlaması.\"}, {\"day\": 5, \"title\": \"Veda\", \"desc\": \"Veda selamı ve havalimanına intikal.\"}]" },
  { name: "Öze Dönüş: İlk Adım Umresi", duration: "5 Gün", desc: "İbadetin ve sükunetin esasına odaklanan sade ve zarif manevi bir gezi.|||ITINERARY|||[{\"day\": 1, \"title\": \"Varış ve Niyet\", \"desc\": \"Niyet ve ilk tavafın sükunet içerisinde gerçekleşmesi.\"}, {\"day\": 2, \"title\": \"İbadet Günü\", \"desc\": \"Sadece namaz ve tilavetine ayrılan serbest zaman.\"}, {\"day\": 3, \"title\": \"Tarihi Ziyaret\", \"desc\": \"Bedir ve Uhud atmosferinin idraki.\"}, {\"day\": 4, \"title\": \"Mescid-i Nebevi\", \"desc\": \"Kubbe-i Hadra altında derin tefekkür.\"}, {\"day\": 5, \"title\": \"Veda\", \"desc\": \"Şükür namazları ve dönüş.\"}]" },
  { name: "Kutlu Rota: İbadet ve Keşif", duration: "9 Gün", desc: "Mekke ve Medine'nin manevi altın oranında, sarsılmaz bir ruh haliyle her iki Harem bölgesindeki ibadeti dengeleyen seyahat.|||ITINERARY|||[{\"day\": 1, \"title\": \"Mekke Varış\", \"desc\": \"Hareme intikal ve umre edası.\"}, {\"day\": 3, \"title\": \"Mekke Siyeri\", \"desc\": \"İslam'ın doğduğu toprakları anlamlandırma.\"}, {\"day\": 5, \"title\": \"Hicret Günleri\", \"desc\": \"Haramain treniyle Medine'ye geçiş.\"}, {\"day\": 7, \"title\": \"Şehadet\", \"desc\": \"Medine'nin şanlı savunma mekanlarının ziyareti.\"}, {\"day\": 9, \"title\": \"Veda\", \"desc\": \"Son dualar.\"}]" },
  { name: "Mescidin Gölgesinde: Uzun İnziva", duration: "25 Gün", desc: "Acelesi olmayan sükunet aşıkları için; ev konforunu kutsal topraklara taşıyan uzun soluklu ruhani tefekkür ve ibadet dönemi.|||ITINERARY|||[{\"day\": 1, \"title\": \"Yerleşme\", \"desc\": \"Uzun dönemli konaklama alanına uyum.\"}, {\"day\": 7, \"title\": \"Harem Odaklılık\", \"desc\": \"Harem merkezli rutinin oturtulması.\"}, {\"day\": 15, \"title\": \"Medine'nin Huzuru\", \"desc\": \"Medine'ye geçiş ve Ravza sükuneti.\"}, {\"day\": 25, \"title\": \"Arınmış Dönüş\", \"desc\": \"Tamamlanan devasa inzivanın ardından arınmış şükür.\"}]" }
];

async function seed() {
  console.log("Deleting old mock packages...");
  await prisma.package.deleteMany();
  
  console.log("Seeding chronologically mapped spiritual packages...");
  for (const item of packages) {
    const trMap: Record<string, string> = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u' };
    const cleanName = item.name.replace(/[çğıöşüÇĞİÖŞÜ]/g, m => trMap[m as keyof typeof trMap] || m);
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);
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
  
  console.log("Package seeding completed to Production!");
}

seed().catch(console.error).finally(() => prisma.$disconnect());
