import type { ContentPage } from "./types";

// ÖRNEK SAYFA: diğer sayfalar bu yapıyı ve kaliteyi izler (docs/SAYFA-GRUPLARI.md).
const page: ContentPage = {
  slug: "ihram-nedir",
  group: "sozluk",
  keyword: "ihram nedir",
  term: "İhram",
  title: "İhram Nedir? Giyimi ve Yasakları",
  description: "İhram, umreye niyet edip telbiye getirerek ibadete girme hâlidir. Nasıl girilir, erkek ve kadın ne giyer, hangi davranışlar yasaktır, adım adım.",
  h1: "İhram nedir?",
  lead:
    "İhram, umre ya da hacca niyet edip telbiye getirerek ibadete girme hâlidir; bu hâle girerken giyilen örtüye de ihram denir. Türkiye'den umreye gidenler mikat sınırını geçmeden ihrama girer. İhramlıyken saç ve tırnak kesmek, koku sürünmek gibi davranışlar yasaktır; umre tıraşla tamamlanınca ihramdan çıkılır.",
  sections: [
    {
      h2: "İhrama nasıl girilir?",
      paragraphs: [
        "İhrama girmeden önce temizlik yapılır: mümkünse gusül (boy abdesti), değilse abdest alınır. Ardından ihram giysisi giyilir ve vakit uygunsa iki rekât ihram namazı kılınır. Namazdan sonra umreye niyet edilir ve telbiye getirilir; ihram, niyet ile telbiyenin birlikte yapılmasıyla başlar.",
        "Telbiye şöyledir: \"Lebbeyk Allâhümme lebbeyk, lebbeyke lâ şerîke leke lebbeyk, inne'l-hamde ve'n-ni'mete leke ve'l-mülk, lâ şerîke lek.\" Telbiye umre boyunca, özellikle yer değiştirirken ve topluluk içindeyken tekrarlanır; Kâbe'yi tavafa başlayınca bırakılır.",
      ],
    },
    {
      h2: "Erkekler ve kadınlar ihramda ne giyer?",
      paragraphs: [
        "Erkekler dikişsiz iki parça beyaz örtü giyer: izar belden aşağıyı, rida omuzları örter. Baş açık kalır; ayakta topuk ve ayak üstünü açıkta bırakan terlik ya da sandalet kullanılır. İç çamaşırı ve dikişli giysi giyilmez.",
        "Kadınlar için özel bir ihram giysisi yoktur. Tesettüre uygun, bol ve sade gündelik kıyafetlerle ihrama girilir; yüz ve eller açık kalır. Renk şartı bulunmaz, beyaz giymek zorunlu değildir.",
      ],
    },
    {
      h2: "İhramlıyken neler yasaktır?",
      paragraphs: [
        "İhram yasakları ihrama girildiği andan ihramdan çıkılana kadar geçerlidir. Yasaklardan biri işlenirse durumuna göre ceza (kurban ya da sadaka) gerekebilir; hangi durumda ne gerektiğini [umre ve ihram hakkındaki dinî bilgilerden](https://www.diyanet.gov.tr/) öğrenebilirsiniz.",
      ],
      bullets: [
        "Saç, sakal ve vücut kıllarını kesmek ya da koparmak",
        "Tırnak kesmek",
        "Parfüm, kokulu sabun ya da kokulu krem kullanmak",
        "Eşler arası cinsel ilişki ve buna yol açan davranışlar",
        "Avlanmak; Harem bölgesinde bitki koparmak",
        "Erkeklerin dikişli giysi giymesi ve başını örtmesi",
        "Kadınların yüzünü örtmesi",
      ],
    },
    {
      h2: "Türkiye'den gidenler ihrama nerede girer?",
      paragraphs: [
        "İhrama mikat denilen sınırı geçmeden girilir. Türkiye'den uçakla Cidde'ye gidenler mikat hizasını uçakta geçtiği için ihram giysisini genellikle yola çıkmadan havalimanında giyer; niyet ve telbiyeyi uçak mikat hizasına gelmeden yapar.",
        "Programa Medine ile başlayanlar ise Medine'den Mekke'ye geçerken yol üzerindeki Zülhuleyfe mikatında ihrama girer. Bu nedenle Medine'de kalınan günlerde ihram giyilmez; ihram, Mekke'ye hareket günü hazırlanır.",
      ],
    },
    {
      h2: "İhram için yola çıkmadan neler hazırlanmalı?",
      paragraphs: [
        "Erkekler için iki takım ihram almak işi kolaylaştırır: biri kirlenir ya da ıslanırsa diğeri giyilir. İzarı belde sabit tutmak için ihram kemeri kullanılabilir; kemer dikişli giysi sayılmaz. Ayak için topuk ve ayak üstünü açık bırakan rahat bir terlik seçmek, uzun tavaf ve sa'y yürüyüşlerinde ayağı korur.",
        "İhramlıyken koku kullanılamadığı için kokusuz sabun, şampuan, deodorant ve güneş kremi yanınızda olmalı. İhrama havalimanında girilecekse giysi el bagajında taşınmalı; uçakta mikat hizası anonsuna dikkat edilmeli. Mekke'de sıcak aylarda su ve gölge molası planlamak, ibadeti yorulmadan tamamlamaya yardım eder.",
      ],
      bullets: [
        "İki takım erkek ihramı ve ihram kemeri",
        "Topuğu açık rahat terlik ya da sandalet",
        "Kokusuz sabun, şampuan, deodorant ve güneş kremi",
        "Küçük sırt çantası: su, pasaport fotokopisi, telefon",
      ],
    },
    {
      h2: "Umrede ihramdan ne zaman çıkılır?",
      paragraphs: [
        "Umre; ihram, Kâbe'nin etrafında yedi şavt tavaf, Safa ile Merve arasında yedi kez sa'y ve tıraştan oluşur. Erkekler saçlarını tıraş eder ya da kısaltır, kadınlar saç uçlarından bir miktar keser. Tıraşla birlikte ihramdan çıkılır ve yasaklar sona erer.",
        "İlk umresini yapacaklar için [ilk umrem rehberi](/ilk-umrem) adımları sırasıyla anlatır. Bireysel umreyi [Hadi Umreye Gidelim ile planlarken](/bireysel-umre) ilahiyatçı rehber eşliği seçilebilir; rehber ihrama giriş ve yasaklar konusunda yerinde yol gösterir.",
      ],
    },
    {
      h2: "İhramla ilgili kavramlar",
      paragraphs: ["İhram konusunda sık geçen kavramların kısa açıklamaları:"],
      table: {
        head: ["Kavram", "Anlamı"],
        rows: [
          ["Mikat", "Umreye gidenlerin ihrama girmeden geçmemesi gereken sınır"],
          ["Telbiye", "İhrama girerken ve ihramlıyken okunan \"Lebbeyk\" duası"],
          ["İzar", "Erkek ihramının belden aşağıyı örten parçası"],
          ["Rida", "Erkek ihramının omuzları örten parçası"],
          ["Tıraş", "Saçın kesilmesi ya da kısaltılması; umrenin son adımı"],
          ["Şavt", "Tavafta Kâbe'nin etrafında yapılan bir tam tur; tavaf yedi şavttır"],
        ],
      },
    },
  ],
  faq: [
    {
      q: "Kadınlar ihramda beyaz giymek zorunda mı?",
      a: "Hayır. Kadınlar için belirli bir ihram giysisi ya da renk şartı yoktur; tesettüre uygun, bol ve sade kıyafetlerle ihrama girilir. Yüz ve eller açık kalır.",
    },
    {
      q: "İhramlıyken duş alınabilir mi?",
      a: "Evet. İhramlıyken kokusuz sabun ya da şampuanla yıkanılabilir. Saç ve kılları koparmamaya dikkat etmek gerekir.",
    },
    {
      q: "İhram giysisi nereden alınır?",
      a: "Erkek ihramı Türkiye'de umre malzemesi satan mağazalarda ve bazı havalimanlarında bulunur. Yola çıkmadan almak ve bir kez denemek, havalimanında giyinirken işi kolaylaştırır.",
    },
    {
      q: "İhram yasaklarından biri unutularak çiğnenirse ne olur?",
      a: "Durumuna göre kurban ya da sadaka gerekebilir; bazı durumlarda unutma hâli ayrıca değerlendirilir. Kendi durumunuz için resmî dinî bilgilere ya da rehberinize danışın.",
    },
  ],
  sources: [{ text: "Umre ve ihram hakkında dinî bilgiler", href: "https://www.diyanet.gov.tr/" }],
  related: ["/ilk-umrem", "/bireysel-umre", "/umre-vizesi", "/paketler"],
  reviewed: "2026-09-30",
};

export default page;
