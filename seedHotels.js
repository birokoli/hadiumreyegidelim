const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const isMakkahHotels = [
       { id: 'm1', name: 'Swissôtel Makkah', price: 210, stars: 5, distanceMeters: 50, distanceText: "50m (Kabe'ye Çok Yakın)", description: "Mescid-i Haram'a doğrudan erişim sunan lüks konaklama.", images: ['https://images.unsplash.com/photo-1542314831-c6a4d40409a5?auto=format&fit=crop&q=80&w=600'] },
       { id: 'm2', name: 'Pullman ZamZam Makkah', price: 185, stars: 5, distanceMeters: 100, distanceText: "100m (Kabe manzaralı)", description: "Abraj Al Bait kompleksinde yer alan eşsiz manzaralı VIP konaklama.", images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=600'] },
       { id: 'm3', name: 'Makkah Clock Royal Tower', price: 320, stars: 5, distanceMeters: 150, distanceText: "150m (Avluya yürüme mesafesi)", description: "Dünyanın en yüksek binalarından birinde unutulmaz bir deneyim.", images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=600'] },
       { id: 'm4', name: 'Hilton Suites Makkah', price: 290, stars: 5, distanceMeters: 250, distanceText: "250m (Kabe'ye yakın)", description: "Yeni nesil mimarisiyle özel ibadet alanlarına sahip otel.", images: ['https://images.unsplash.com/photo-1551882547-ff40eb0d1b73?auto=format&fit=crop&q=80&w=600'] },
       { id: 'm5', name: 'Conrad Makkah', price: 250, stars: 5, distanceMeters: 300, distanceText: "300m", description: "Geniş odalar ve doğrudan Harem bağlantısı.", images: ['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=600'] },
       { id: 'm6', name: 'Mövenpick Hotel Hajar', price: 195, stars: 5, distanceMeters: 400, distanceText: "400m", description: "Kaliteli hizmet anlayışıyla huzurlu bir konaklama deneyimi.", images: ['https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&q=80&w=600'] },
       { id: 'm7', name: 'Hyatt Regency Makkah', price: 180, stars: 5, distanceMeters: 550, distanceText: "550m", description: "Modern tasarım ve kolay ulaşım imkanı.", images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600'] },
       { id: 'm8', name: 'Anjum Hotel Makkah', price: 160, stars: 4, distanceMeters: 800, distanceText: "800m", description: "Mekke'nin ruhunu hissettiren Hicazi mimarisi.", images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600'] },
       { id: 'm9', name: 'Sheraton Makkah', price: 140, stars: 4, distanceMeters: 1200, distanceText: "1.2km (Ring servisi mevcut)", description: "Sessiz, sakin ve ekonomik lüks seçenekleri.", images: ['https://images.unsplash.com/photo-1541971875076-8f970d573be6?auto=format&fit=crop&q=80&w=600'] },
       { id: 'm10', name: 'Le Meridien Makkah', price: 120, stars: 4, distanceMeters: 1500, distanceText: "1.5km (Düzenli servis)", description: "Şehrin dış çemberinde, kalabalıktan uzak konforlu dinlenme alanı.", images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=600'] }
];

const isMadinahHotels = [
       { id: 'md1', name: 'Oberoi Madina', price: 350, stars: 5, distanceMeters: 50, distanceText: "50m (Mescid-i Nebevi avlusunda)", description: "Peygamber efendimizin mescidine yürüme mesafesinde en lüks deneyim.", images: ['https://images.unsplash.com/photo-1542314831-c6a4d40409a5?auto=format&fit=crop&q=80&w=600'] },
       { id: 'md2', name: 'Dar Al Taqwa Hotel', price: 280, stars: 5, distanceMeters: 100, distanceText: "100m (Kadınlar kapısı karşısı)", description: "Mescid-i Nebevi manzaralı konforlu odalar.", images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=600'] },
       { id: 'md3', name: 'Madinah Hilton', price: 220, stars: 5, distanceMeters: 200, distanceText: "200m", description: "Merkezi konum, alışveriş ve ziyaret alanlarına yakınlık.", images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=600'] },
       { id: 'md4', name: 'Anwar Al Madinah Mövenpick', price: 190, stars: 5, distanceMeters: 300, distanceText: "300m", description: "Geniş aile ve grup konaklamaları için ideal.", images: ['https://images.unsplash.com/photo-1551882547-ff40eb0d1b73?auto=format&fit=crop&q=80&w=600'] },
       { id: 'md5', name: 'Pullman Zamzam Madina', price: 175, stars: 5, distanceMeters: 400, distanceText: "400m", description: "Modern tasarımlar ve zengin mutfak kültürü.", images: ['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=600'] },
       { id: 'md6', name: 'Shaza Al Madina', price: 210, stars: 5, distanceMeters: 500, distanceText: "500m", description: "Geleneksel motifler ile modern mimarinin buluşması.", images: ['https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&q=80&w=600'] },
       { id: 'md7', name: 'Crowne Plaza Madinah', price: 150, stars: 5, distanceMeters: 650, distanceText: "650m", description: "Ekonomik lüks ve huzurlu ortam.", images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600'] },
       { id: 'md8', name: 'Al Haram Hotel', price: 120, stars: 4, distanceMeters: 900, distanceText: "900m", description: "Bütçe dostu konaklama ve güleryüzlü hizmet.", images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600'] },
];

async function seed() {
  const allHotels = [...isMakkahHotels.map(h => ({...h, city: "Mekke (Makkah)"})), ...isMadinahHotels.map(h => ({...h, city: "Medine (Al Madinah)"}))];
  
  for(const h of allHotels) {
    const extraData = JSON.stringify({
      images: h.images,
      city: h.city,
      stars: h.stars,
      distanceMeters: h.distanceMeters,
      distanceText: h.distanceText,
      amenities: ""
    });
    
    await prisma.service.create({
      data: {
        type: "HOTEL",
        name: h.name,
        price: h.price,
        description: h.description,
        extraData: extraData
      }
    });
  }
  console.log("Seeding complete: " + allHotels.length + " hotels added!");
}

seed().catch(e => console.error(e)).finally(() => prisma.$disconnect());
