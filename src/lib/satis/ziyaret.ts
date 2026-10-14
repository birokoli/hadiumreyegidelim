// Ziyaret turu rotaları (15 Ekim, kullanıcı: "Mekke ve Medine ziyaret turu ayrı olsun; rota ikonlarımızla güzel görünsün").
// Teklif kalemi rota anahtarını taşır (kalem.rota); duraklar buradan okunur, teklif/voucher/profilde aynı görünür.
// Durak metinleri kullanıcının verdiği rotadır; değişiklik yalnızca burada yapılır.
export type Durak = { ad: string; aciklama: string };
export type Bolum = { ad: string; ikon: "kabe" | "ihram" | "dua" | "medine"; duraklar: Durak[] };
export type Rota = { ad: string; sehir: "Mekke" | "Medine"; ikon: "kabe" | "medine"; bolumler: Bolum[] };
export type RotaAnahtar = "mekke" | "medine";

export const ZIYARET_ROTALARI: Record<RotaAnahtar, Rota> = {
  mekke: {
    ad: "Mekke ziyaret turu",
    sehir: "Mekke",
    ikon: "kabe",
    bolumler: [
      {
        ad: "Mekke merkez",
        ikon: "kabe",
        duraklar: [
          { ad: "Cennetü'l-Muallâ", aciklama: "Mekke'nin tarihî kabristanı. Hz. Hatice (r.anha) ve birçok sahabî burada medfundur. Fatiha okunur, kısa dua edilir." },
          { ad: "Mescid-i Cin", aciklama: "Cinlerin Peygamberimizi (s.a.v.) dinlediği rivayet edilen yer. Dışarıdan ziyaret edilir." },
          { ad: "Hira Mağarası (Cebel-i Nur)", aciklama: "İlk vahyin geldiği yer. Tırmanmadan, dağın eteğinden görülür." },
          { ad: "Sevr Mağarası", aciklama: "Hicret yolunda Peygamberimizin (s.a.v.) ve Hz. Ebû Bekir'in (r.a.) saklandığı mağara. Tırmanmadan, eteğinden görülür." },
          { ad: "Mescid-i Feth", aciklama: "Fetih hatırasını taşıyan mescid. Kısa mola verilir." },
        ],
      },
      {
        ad: "Hac meş’arları",
        ikon: "ihram",
        duraklar: [
          { ad: "Mina", aciklama: "Hacda şeytan taşlama ve kurban günlerinin geçtiği çadırlar şehri." },
          { ad: "Mescid-i Hayf", aciklama: "Mina'daki tarihî mescid. Çok sayıda peygamberin burada namaz kıldığı rivayet edilir." },
          { ad: "Cemerat", aciklama: "Şeytan taşlama yeri. Dışarıdan görülür ve anlatılır." },
          { ad: "Kurban Kesim Yeri", aciklama: "Mina'da kurbanların kesildiği alan." },
          { ad: "Müzdelife", aciklama: "Arafat'tan dönüşte geceleyin konaklanan vadi." },
        ],
      },
      {
        ad: "Arafat hattı",
        ikon: "dua",
        duraklar: [
          { ad: "Arafat", aciklama: "Vakfe meydanı. Haccın en önemli rüknü burada yapılır." },
          { ad: "Cebel-i Rahme", aciklama: "Arafat'ın ortasındaki rahmet tepesi." },
          { ad: "Mescid-i Nemre", aciklama: "Arafat sınırında, vakfe öncesi hutbe ve namazın yapıldığı mescid." },
          { ad: "Zübeyde Kanalı", aciklama: "Hacılara su taşıyan tarihî su kanalı. Dönüş yolunda görülür." },
        ],
      },
    ],
  },
  medine: {
    ad: "Medine ziyaret turu",
    sehir: "Medine",
    ikon: "medine",
    bolumler: [
      {
        ad: "Medine",
        ikon: "medine",
        duraklar: [
          { ad: "Kuba Mescidi", aciklama: "İslam'ın ilk mescidi. 2 rekat nafile kılınır." },
          { ad: "Bi'r Gars", aciklama: "Peygamberimizin (s.a.v.) suyundan içtiği ve gusül suyunun alınmasını istediği rivayet edilen kuyu." },
          { ad: "Hurma Bahçesi", aciklama: "Medine hurmalarının alınabildiği bahçe." },
          { ad: "Kıbleteyn Mescidi", aciklama: "Kıblenin Mescid-i Aksâ'dan Kâbe'ye çevrildiği mescid." },
          { ad: "Yedi Mescid (Sab'a Mesâcid)", aciklama: "Hendek Savaşı bölgesindeki mescidler." },
          { ad: "Hz. Ali Mescidi", aciklama: "Yedi Mescid bölgesinde yer alan mescid." },
          { ad: "Uhud Dağı ve Şehitliği", aciklama: "Uhud şehitlerinin kabirleri. Hz. Hamza (r.a.) burada medfundur. Fatiha okunur, kısa dua edilir." },
        ],
      },
    ],
  },
};

export const durakSayisi = (r: Rota) => r.bolumler.reduce((n, b) => n + b.duraklar.length, 0);
export const rotaOf = (anahtar?: string | null): Rota | null => (anahtar === "mekke" || anahtar === "medine" ? ZIYARET_ROTALARI[anahtar] : null);
