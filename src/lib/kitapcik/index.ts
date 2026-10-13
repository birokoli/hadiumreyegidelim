// Üye kitaplığı (13 Ekim, kullanıcı): kitapçıklar profilde "Şavt modu" ile okunur. İçerik PDF ile aynı kaynaktan gelir:
// scripts/pdf/<kitap>/icerik.txt → scripts/pdf/kitapcik_json.py → src/content/kitapcik/<slug>.json.
// Başlangıç ve bitiş ekranları PDF'teki sabit sayfaların kısa hali (scripts/pdf/*/uret.py).
import tavafJson from "@/content/kitapcik/tavaf.json";
import sayJson from "@/content/kitapcik/say.json";
import type { HugIconName } from "@/components/icons/HugIcon";

export type Oge =
  | { tur: "dua"; ad: string; kaynak: string; kez: string; okunus: string; anlam: string }
  | { tur: "hitap"; metin: string }
  | { tur: "paragraf"; metin: string };
export type Bolum = { ad: string; ogeler: Oge[] };
export type Savt = { no: number; baslik: string; niyet: string; bolumler: Bolum[]; yon?: string; varis?: string };

/** Şavtların dışındaki kısa ekranlar: her biri başlık + okunuşlu dualar ya da maddeler. */
export type Sabit = { baslik: string; aciklama?: string; dualar?: { ad: string; arapca?: string; okunus: string; anlam: string }[]; maddeler?: { ad: string; metin: string }[] };

export type Kitapcik = {
  slug: "tavaf" | "say";
  ad: string;
  kisa: string;
  aciklama: string;
  ikon: HugIconName;
  hat: string;
  kapak: string;
  pdf: string;
  pdfAdi: string;
  sayfa: string;
  sure: string;
  savtlar: Savt[];
  giris: Sabit;
  bitis: Sabit;
  savtSonu?: { ad: string; okunus: string; anlam: string }; // tavaf: her şavtın sonunda
  hervele?: { okunus: string; anlam: string }; // sa'y: yeşil ışıklar arası
};

const RABBENA = { ad: "Rükn-i Yemânî ile Hacerü'l-Esved arasında", okunus: "Rabbenâ âtinâ fi'd-dünyâ haseneten ve fi'l-âhireti haseneten ve kınâ azâbe'n-nâr.", anlam: "Rabbimiz! Bize dünyada da iyilik ver, ahirette de iyilik ver ve bizi ateş azabından koru. (Bakara, 201)" };

export const KITAPCIKLAR: Record<"tavaf" | "say", Kitapcik> = {
  tavaf: {
    slug: "tavaf",
    ad: "Tavaf El Kitabı",
    kisa: "Tavaf",
    aciklama: "Kâbe'nin etrafındaki yedi şavt için okunuşu ve anlamıyla dualar.",
    ikon: "tavaf",
    hat: "طواف",
    kapak: "/indir/tavaf-el-kitabi-kapak.png",
    pdf: "/indir/tavaf-el-kitabi-2026.pdf",
    pdfAdi: "Tavaf-El-Kitabi-2026.pdf",
    sayfa: "/tavaf-kitapcigi",
    sure: "Her şavt 12–15 dakika",
    savtlar: tavafJson.savtlar as Savt[],
    savtSonu: RABBENA,
    giris: {
      baslik: "Her şavtın başında",
      aciklama: "Hacerü'l-Esved hizasında, ona doğru elinizi kaldırarak:",
      dualar: [
        { ad: "İstilam", arapca: "بِسْمِ اللهِ، اللهُ أَكْبَرُ، لَا إِلٰهَ إِلَّا اللهُ وَاللهُ أَكْبَرُ", okunus: "Bismillâhi, Allâhu ekber. Lâ ilâhe illallâhu vallâhu ekber.", anlam: "Allah'ın adıyla. Allah en büyüktür. Allah'tan başka ilah yoktur ve Allah en büyüktür." },
        { ...RABBENA, arapca: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", ad: "Her şavtın sonunda" },
      ],
    },
    bitis: {
      baslik: "Tavaftan sonra",
      maddeler: [
        { ad: "Mültezem", metin: "Hacerü'l-Esved ile Kâbe kapısı arası. Kalabalıkta ulaşamıyorsanız uzaktan yönelip dua etmeniz yeterlidir; kimseyi itmeyin." },
        { ad: "İki rekat tavaf namazı", metin: "Mümkünse Makam-ı İbrahim'in gerisinde. Birinci rekatta Kâfirûn, ikincide İhlâs okunur (Müslim)." },
        { ad: "Zemzem", metin: "Namazdan sonra zemzem içilir ve dua edilir: \"Zemzem ne niyetle içilirse onun içindir\" (İbn Mâce)." },
        { ad: "Sa'ye geçiş", metin: "Umre tavafından sonra Safa tepesine yönelinir. Sa'y El Kitabı kitaplığınızda." },
      ],
    },
  },
  say: {
    slug: "say",
    ad: "Sa'y El Kitabı",
    kisa: "Sa'y",
    aciklama: "Safa ile Merve arasında, Hz. Hâcer validemizin adımlarında okunacak dualar.",
    ikon: "say",
    hat: "سعي",
    kapak: "/indir/say-el-kitabi-kapak.png",
    pdf: "/indir/say-el-kitabi-2026.pdf",
    pdfAdi: "Say-El-Kitabi-2026.pdf",
    sayfa: "/say-kitapcigi",
    sure: "Her şavt 6–8 dakika",
    savtlar: sayJson.savtlar as Savt[],
    hervele: { okunus: "Rabbiğfir verham ve tecâvez ammâ ta'lem, inneke ente'l-Eazzü'l-Ekrem.", anlam: "Rabbim! Bağışla, merhamet et ve bildiğin bütün kusurlarımdan geç; şüphesiz sen en aziz ve en kerim olansın. (İbn Mes'ûd ve İbn Ömer'den rivayet)" },
    giris: {
      baslik: "Safa'da başlarken",
      aciklama: "Kâbe'nin göründüğü yere çıkın, yüzünüzü Kâbe'ye dönün, ellerinizi göğüs hizasında açın. Her tepede üç kez okuyun:",
      dualar: [
        { ad: "Safa'ya çıkarken", arapca: "إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ", okunus: "İnne's-Safâ ve'l-Mervete min şeâirillâh... Nebdeü bi-mâ bedeallâhu bih.", anlam: "Şüphesiz Safa ile Merve, Allah'ın nişanelerindendir (Bakara, 158). Allah'ın başladığı yerden başlıyoruz (Müslim)." },
        { ad: "Tepede tekbir ve tehlil", arapca: "لَا إِلٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ", okunus: "Allâhu ekber (3 kez) ve lillâhi'l-hamd. Lâ ilâhe illallâhu vahdehû lâ şerîke leh, lehü'l-mülkü ve lehü'l-hamdü ve hüve alâ külli şey'in kadîr. Lâ ilâhe illallâhu vahdeh, encaze va'deh, ve nasara abdeh, ve hezeme'l-ahzâbe vahdeh.", anlam: "Allah'tan başka ilah yoktur; O tektir, ortağı yoktur. Mülk O'nundur, hamd O'nadır ve O her şeye gücü yetendir. Vaadini yerine getirdi, kuluna yardım etti ve düşman toplulukları tek başına yendi. (Müslim)" },
        { ad: "Niyet", okunus: "Allah'ım! Senin rızan için Safa ile Merve arasında yedi şavt ile sa'y etmeye niyet ettim. Bu ibadeti bana kolaylaştır, eksiklerimi lütfunla tamamla ve katında makbul eyle.", anlam: "" },
      ],
    },
    bitis: {
      baslik: "Sa'yden sonra",
      maddeler: [
        { ad: "Merve'de son dua", metin: "Kâbe'ye dönüp tekbir ve tehlili okuduktan sonra umrenizin kabulü için dua edin." },
        { ad: "Tıraş", metin: "Erkekler saçını kazıtır (halk) ya da kısaltır (taksîr); kadınlar saçının ucundan parmak ucu kadar keser." },
        { ad: "İhramdan çıkış", metin: "Tıraştan sonra ihram yasakları sona erer; umreniz tamamlanmıştır." },
        { ad: "Şükür", metin: "Elhamdülillâhillezî bi ni'metihî tetimmü's-sâlihât. Nimetiyle iyilikler tamamlanan Allah'a hamd olsun (İbn Mâce)." },
      ],
    },
  },
};

export const KITAPCIK_LISTESI = [KITAPCIKLAR.tavaf, KITAPCIKLAR.say];

export function getKitapcik(slug: string): Kitapcik | null {
  return slug === "tavaf" || slug === "say" ? KITAPCIKLAR[slug] : null;
}
