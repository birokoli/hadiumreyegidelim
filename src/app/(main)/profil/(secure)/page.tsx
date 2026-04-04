import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export default async function ProfileDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('b2c_session')?.value;
  if (!token) return null;
  const session = await verifyToken(token);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      _count: {
        select: { orders: true }
      }
    }
  });

  if (!user) return null;

  // Dinamik Zaman Karşılaması
  const hour = new Date().getHours();
  let greeting = "İyi Günler";
  if (hour < 11) greeting = "Hayırlı Sabahlar";
  else if (hour > 18) greeting = "Hayırlı Akşamlar";

  // Dinamik İslami Takvim ve Kampanya Zekası (Intl API)
  const getDynamicCampaign = () => {
    try {
      const date = new Date();
      // Get Islamic month number (1 to 12)
      const islamicFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic', { month: 'numeric' });
      const islamicMonth = parseInt(islamicFormatter.format(date), 10);
      
      const campaigns = {
        1: { title: "Hicri Yılbaşı: Kabe'de Başlangıç", desc: "Yeni hicri yıla Beytullah'ta girmek için özel VIP paketlerimizde %10 tasarruf edin.", code: "HİCRİ14" },
        2: { title: "Huzura Yolculuk: Sakin Sezon", desc: "Kalabalıktan uzak, maneviyatı yüksek sakin dönem umresine özel indirim.", code: "HUZUR10" },
        3: { title: "Mevlid Ayı Özel Umresi", desc: "Efendimizin (s.a.v) doğduğu bu ayda Medine'ye misafir olun.", code: "MEVLİD15" },
        4: { title: "Kış Güneşi: Aile Umresi", desc: "Soğuk günlerde Mekke sıcaklığını ailenizle yaşayın.", code: "AİLE10" },
        5: { title: "Kış Güneşi: Aile Umresi", desc: "Soğuk günlerde Mekke sıcaklığını ailenizle yaşayın.", code: "AİLE10" },
        6: { title: "Manevi Bahar: Erken Kayıt", desc: "Üç aylar yaklaşırken yerinizi şimdiden ayırtarak avantaj sağlayın.", code: "BAHAR5" },
        7: { title: "Mübarek Üç Aylar Fırsatı", desc: "Recep ayının feyzini Mescid-i Haram'da yaşamak için erken davranın.", code: "RECEP15" },
        8: { title: "Şaban Ayı: Ramazan'a Hazırlık", desc: "Ramazan yoğunluğu başlamadan önce umrenizi huzurla tamamlayın.", code: "SABAN10" },
        9: { title: "Ramazan'da Umre Bir Başkadır", desc: "En kutsal ayda Lüks VIP otellerde yerinizi garantileyin.", code: "RAMAZAN20" },
        10: { title: "Şevval Ayı Umresi Fırsatı", desc: "Ramazan sükunetinin ardından rahat ve ferah bir umre deneyimi.", code: "SEVVAL15" },
        11: { title: "Hac Öncesi Son Umre Fırsatı", desc: "Umre sezonu kapanmadan önce son kafilelere dahil olun.", code: "SONKAFİLE" },
        12: { title: "Yeni Sezon Ön Kayıtları Başladı", desc: "Hac dönemi bitiminde açılacak yeni sezon için yerinizi garantileyin.", code: "YENİSEZON" },
      };

      return campaigns[islamicMonth as keyof typeof campaigns] || campaigns[2];
    } catch (e) {
      // Fallback if Intl API fails
      return { title: "VIP Aile Umresi'nde Fırsat", desc: "Mekke ve Medine lüks otellerinde erken rezervasyon indirimi başladı.", code: "VIP10AİLE" };
    }
  };

  const activeCampaign = getDynamicCampaign();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Hoşgeldin ve Profil Başlığı */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="hidden sm:flex h-16 w-16 rounded-full bg-gradient-to-tr from-primary to-primary-container text-white items-center justify-center font-bold text-2xl shadow-lg shadow-primary/30">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              {greeting}, <span className="text-primary">{user.name.split(" ")[0]}!</span>
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-orange-500">verified</span>
              VIP Sadakat Üyesi
            </p>
          </div>
        </div>
        
        <div className="relative z-10 flex flex-col items-end">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cüzdan Bakiyesi</span>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl">
            <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
            <span className="font-extrabold text-slate-800 text-lg">0 <span className="text-sm font-medium text-slate-500">Puan</span></span>
          </div>
        </div>
      </div>

      {/* 2. Dörtlü Hızlı İstatistik Metrikleri */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3 group hover:border-primary/30 transition-colors">
          <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined">shopping_bag</span>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">{user._count.orders}</p>
            <p className="text-xs font-medium text-slate-500 mt-1">Aktif Siparişim</p>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3 group hover:border-primary/30 transition-colors">
          <div className="h-10 w-10 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined">confirmation_number</span>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">2</p>
            <p className="text-xs font-medium text-slate-500 mt-1">Tanımlı Kuponum</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3 group hover:border-primary/30 transition-colors">
          <div className="h-10 w-10 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined">favorite</span>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">0</p>
            <p className="text-xs font-medium text-slate-500 mt-1">Favori Paketim</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3 group hover:border-primary/30 transition-colors">
          <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined">description</span>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">1</p>
            <p className="text-xs font-medium text-slate-500 mt-1">Kayıtlı Tasarımım</p>
          </div>
        </div>
      </div>

      {/* 3. Dev Kampanya Banneri (Trendyol tarzı Hero) */}
      <a href="/bireysel-umre" className="block relative w-full h-auto sm:h-[120px] bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] rounded-[24px] overflow-hidden group shadow-lg">
        {/* Dekoratif Işıklar */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/40 to-transparent blur-2xl transform translate-x-1/4 group-hover:translate-x-0 transition-transform duration-700"></div>
        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 w-full h-full flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 sm:px-10">
          <div className="mb-4 sm:mb-0">
            <span className="inline-block px-3 py-1 mb-2 text-[10px] font-bold tracking-widest text-[#0f172a] bg-amber-400 rounded-full hidden sm:block w-max">
              BU AYA ÖZEL FIRSAT
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{activeCampaign.title}</h3>
            <p className="text-slate-300 text-sm mt-1 sm:mt-0">{activeCampaign.desc}</p>
          </div>
          <div className="flex bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-3 rounded-xl font-medium text-sm group-hover:bg-white group-hover:text-[#0f172a] transition-all">
            Hemen İncele
            <span className="material-symbols-outlined ml-2 text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </div>
        </div>
      </a>

      {/* 4. Kuponlar / Cüzdan Vitrini */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Cüzdanım ve Kuponlarım</h2>
          <a href="#" className="text-xs font-bold text-primary hover:underline">Tümünü Gör</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* O Aya Özel Dinamik Kupon */}
          <div className="relative flex rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-full border-r border-slate-200 z-10"></div>
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-full border-l border-slate-200 z-10"></div>
            
            <div className="w-1/3 bg-amber-50 flex flex-col items-center justify-center p-4 border-r border-dashed border-amber-200">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">GÜNCEL</span>
              <span className="text-3xl font-black text-amber-700">%15</span>
            </div>
            <div className="w-2/3 p-5 flex flex-col justify-center">
              <h4 className="font-bold text-slate-800">Dönemsel Kampanya</h4>
              <p className="text-xs text-slate-500 mt-1 mb-3">Sadece bu hicri ay içerisindeki rezervasyonlarda.</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400">YENİ TANIMLANDI</span>
                <span className="bg-slate-100 text-slate-700 text-xs font-mono font-bold px-3 py-1 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors uppercase">{activeCampaign.code}</span>
              </div>
            </div>
          </div>

          {/* Standart Hoşgeldin Hediyesi Kupon 2 */}
          <div className="relative flex rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-full border-r border-slate-200 z-10"></div>
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-full border-l border-slate-200 z-10"></div>
            
            <div className="w-1/3 bg-emerald-50 flex flex-col items-center justify-center p-4 border-r border-dashed border-emerald-200">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">PROMOSYON</span>
              <span className="text-3xl font-black text-emerald-700">ÜCRETSİZ</span>
            </div>
            <div className="w-2/3 p-5 flex flex-col justify-center">
              <h4 className="font-bold text-slate-800">Hoşgeldin Hediyesi</h4>
              <p className="text-xs text-slate-500 mt-1 mb-3">İlk rezervasyonunuzda VIP Transfer Hediye.</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400">1 KULLANIMLIK</span>
                <span className="bg-slate-100 text-slate-700 text-xs font-mono font-bold px-3 py-1 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors">HG-VIP</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 5. Minimalist Hesap Bilgileri */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 mt-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Hesap Tanımlamaları</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ad Soyad</label>
            <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 text-sm">
              {user.name}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">E-posta Adresi</label>
            <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 text-sm">
              {user.email}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Telefon Numarası</label>
            <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 text-sm">
              {user.phone || "Belirtilmemiş"}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
