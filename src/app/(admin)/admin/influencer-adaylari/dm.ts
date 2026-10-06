export interface DmTemplate {
  id: string;
  name: string;
  channel: "instagram_dm" | "email" | "followup";
  subject?: string;
  content: string;
}

// Şablonlar (6 Ekim): Mayıs 2026'daki ilk davet "yüksek kazanç / yeni nesil program" diliyle ve toplantı şartıyla
// gönderilmiş, çoğu red almıştı. Yeni dil: kişiye özel bir gözlem, kim olduğumuzun kanıtı (19,5 bin takipçi,
// doğrulanmış yorumlar), sade teklif, yük getirmeyen tek adım. {komisyon} ve {indirim} gönderilmeden önce elle yazılır;
// {hitap}, {gozlem} ve {nedenSiz} "Hesabı incele ve doldur" ile hesabın paylaşımlarından doldurulur (prospects.ts → draftMessage);
// [köşeli parantezli] imza satırları elle yazılır.
export const DM_TEMPLATES: DmTemplate[] = [
  {
    id: "instagram_dm_short",
    name: "Instagram DM (ilk temas)",
    channel: "instagram_dm",
    content: `Selamün aleyküm {hitap},

Ben [Adınız], Hadi Umreye Gidelim'den yazıyorum. {gozlem} {nedenSiz}

Sizi iş ortaklığı programımıza davet etmek istiyoruz. Amacımız, umreye niyet eden takipçilerinizin bu yolculuğa kendi tarihine ve bütçesine uygun şekilde, güvenle çıkmasına birlikte vesile olmak.

• Takipçileriniz size özel kodla umrelerinde {indirim} indirim alır.
• Kodunuzla gelen her umre kaydından {komisyon} kazanırsınız; dilerseniz bu kazancı kendi umreniz için kullanabilirsiniz.
• Paylaşım sayısı ya da takvim şartı yoktur; paylaşımlarınız için görselleri biz hazırlarız.

Uygun görürseniz ayrıntıları size kısaca anlatmak isteriz. Programın sayfası:
{davet}

Hayırlı günler dileriz,
[Adınız] · Hadi Umreye Gidelim`
  },
  {
    id: "email_long",
    name: "E-posta (iş birliği teklifi)",
    channel: "email",
    subject: "Hadi Umreye Gidelim İş Ortaklığı Daveti",
    content: `Sayın {hitap},

Selamün aleyküm.

Ben [Ad Soyad], Hadi Umreye Gidelim'de [unvan] olarak görev yapıyorum. {gozlem} {nedenSiz}

Bu nedenle sizi Hadi Umreye Gidelim iş ortaklığı programına davet etmek istiyoruz. Amacımız, umreye niyet eden takipçilerinizin bu yolculuğa kendi tarihine ve bütçesine uygun şekilde, güvenle çıkmasına birlikte vesile olmak.

Hadi Umreye Gidelim, umreyi kişinin kendi tarihine ve bütçesine göre planlayan bir bireysel umre organizasyonudur; vize, konaklama, transfer ve rehberlik hizmetlerini tek bir süreçte sunar. Instagram'da 19.500 kişilik bir topluluğumuz var ve misafirlerimizin yorumlarını doğrulanmış olarak yayımlıyoruz: hadiumreyegidelim.com/yorumlar

Program kapsamında:
• Takipçileriniz, size özel kodla umrelerinde {indirim} indirim alır.
• Kodunuzla tamamlanan her umre kaydından {komisyon} komisyon kazanırsınız.
• Kazancınızı nakit olarak çekebilir ya da kendi umreniz için kullanabilirsiniz.
• Yönlendirmelerinizi, kayıtları ve kazancınızı size özel panelden anlık olarak izlersiniz.
• Belirli bir paylaşım sayısı ya da yayın takvimi şartı yoktur; paylaşımlarınız için görselleri biz hazırlarız.

Uygun görürseniz programın ayrıntılarını yazılı olarak iletebilir ya da size uygun bir zamanda kısa bir görüşme planlayabiliriz. Programın başvuru sayfası:
{davet}

Değerlendirmeniz için şimdiden teşekkür eder, hayırlı çalışmalar dileriz.

Saygılarımla,

[Ad Soyad]
[Unvan]
Hadi Umreye Gidelim
info@hadiumreyegidelim.com | [Telefon]
hadiumreyegidelim.com`
  },
  {
    id: "followup_5days",
    name: "Takip (5–7 gün sonra, tek sefer)",
    channel: "followup",
    content: `Selamün aleyküm {hitap},

Geçen hafta size iş ortaklığı davetimizi iletmiştik; yoğunluk arasında gözden kaçmış olabileceğini düşünerek kısaca hatırlatmak istedim. Takipçilerinizin umresine birlikte vesile olabilirsek çok seviniriz.

Şu an uygun değilse bunu bildirmeniz de bizim için yeterli. Programın sayfası:
{davet}

Hayırlı günler dileriz,
[Adınız] · Hadi Umreye Gidelim`
  }
];

export const GOZLEM_YER_TUTUCU = "[Paylaşımlarına dair tek cümle — \"Hesabı incele ve doldur\" ile doldurulur.]";
export const NEDEN_YER_TUTUCU = "[Neden ona yazdığımız, tek cümle — \"Hesabı incele ve doldur\" ile doldurulur.]";

export function fillTemplate(
  templateContent: string,
  params: { ad?: string; hitap?: string; gozlem?: string; nedenSiz?: string; platform?: string; komisyon?: string; indirim?: string; davet?: string }
): string {
  return templateContent
    .replaceAll("{hitap}", params.hitap || params.ad || "Değerli İçerik Üreticisi")
    .replaceAll("{gozlem}", params.gozlem || GOZLEM_YER_TUTUCU)
    .replaceAll("{nedenSiz}", params.nedenSiz || NEDEN_YER_TUTUCU)
    .replaceAll("{ad}", params.ad || "Değerli İçerik Üreticisi")
    .replaceAll("{platform}", params.platform || "Instagram")
    .replaceAll("{komisyon}", params.komisyon || "{komisyon}")
    .replaceAll("{indirim}", params.indirim || "{indirim}")
    .replaceAll("{davet}", params.davet || "{davet}");
}
