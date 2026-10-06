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
// {hitap} ve {gozlem} "Hesabı incele ve doldur" ile hesabın paylaşımlarından doldurulur (prospects.ts → draftMessage);
// [köşeli parantezli] imza satırları elle yazılır.
export const DM_TEMPLATES: DmTemplate[] = [
  {
    id: "instagram_dm_short",
    name: "Instagram DM (ilk temas)",
    channel: "instagram_dm",
    content: `Selamün aleyküm {hitap},

Hadi Umreye Gidelim adına yazıyorum. {gozlem}

Sizi iş ortaklığı programımıza davet etmek isteriz. Program kapsamında takipçilerinize özel {indirim} indirim kodu tanımlanır; kodunuzla tamamlanan her umre kaydı için {komisyon} komisyon hakkı kazanırsınız. Belirli bir paylaşım sayısı veya takvim talep etmiyoruz.

Ayrıntıları iletebilmemiz için e-posta adresinizi paylaşabilir ya da programı aşağıdaki bağlantıdan inceleyebilirsiniz:
{davet}

Saygılarımızla,
Hadi Umreye Gidelim`
  },
  {
    id: "email_long",
    name: "E-posta (iş birliği teklifi)",
    channel: "email",
    subject: "Hadi Umreye Gidelim – İş Ortaklığı Teklifi",
    content: `Sayın {hitap},

Selamün aleyküm.

Hadi Umreye Gidelim adına size ulaşıyorum. {gozlem} Takipçilerinizle kurduğunuz güvene dayalı iletişimin, umre yolculuğuna hazırlanan kişiler için değerli bir rehberlik sunduğunu düşünüyoruz.

Hadi Umreye Gidelim, umre yolculuğunu misafirlerinin tarih ve bütçe tercihlerine göre planlayan bir bireysel umre organizasyonudur. Vize, konaklama, transfer ve rehberlik hizmetlerini tek bir süreç içinde sunmaktayız. Instagram'da 19.500 kişilik bir topluluğa ulaşıyor, misafirlerimizin değerlendirmelerini doğrulanmış olarak web sitemizde yayımlıyoruz (hadiumreyegidelim.com/yorumlar).

Bu çerçevede sizi iş ortaklığı programımıza davet etmek isteriz. Program kapsamında:

• Takipçilerinize özel {indirim} indirim sağlayan kişisel bir kod tanımlanır.
• Kodunuz veya bağlantınız aracılığıyla tamamlanan her umre kaydı için {komisyon} oranında komisyon hakkı kazanırsınız.
• Yönlendirmelerinizi, kayıtları ve kazançlarınızı size özel panel üzerinden anlık olarak takip edebilirsiniz.
• Kazançlarınızı nakit olarak çekebilir ya da kendi umre yolculuğunuzda kullanabilirsiniz.

İş birliği süresince belirli bir paylaşım sayısı veya yayın takvimi talep etmiyoruz. İçeriklerinizde kullanabileceğiniz görsel materyaller tarafımızca hazırlanarak tarafınıza iletilecektir.

Teklifimizi değerlendirmeniz hâlinde programın ayrıntılarını yazılı olarak iletebilir ya da size uygun bir zamanda kısa bir görüşme planlayabiliriz. Başvurunuzu aşağıdaki bağlantı üzerinden de iletebilirsiniz:
{davet}

Değerlendirmeniz için şimdiden teşekkür eder, çalışmalarınızda başarılar dileriz.

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
    content: `Sayın {hitap},

Selamün aleyküm.

Geçtiğimiz hafta tarafınıza ilettiğimiz iş ortaklığı teklifimizi hatırlatmak isteriz. Program kapsamında takipçilerinize özel {indirim} indirim kodu tanımlanmakta, kodunuzla tamamlanan her umre kaydı için {komisyon} komisyon hakkı kazanmaktasınız.

Teklifimizi değerlendirme fırsatınız olduysa dönüşünüzü memnuniyetle bekleriz. Programın ayrıntılarına aşağıdaki bağlantıdan ulaşabilirsiniz:
{davet}

Saygılarımızla,
Hadi Umreye Gidelim`
  }
];

export const GOZLEM_YER_TUTUCU = "[İçeriğine dair tek cümlelik özel gözlem — \"Hesabı incele ve doldur\" ile doldurulur.]";

export function fillTemplate(
  templateContent: string,
  params: { ad?: string; hitap?: string; gozlem?: string; platform?: string; komisyon?: string; indirim?: string; davet?: string }
): string {
  return templateContent
    .replaceAll("{hitap}", params.hitap || params.ad || "Değerli İçerik Üreticisi")
    .replaceAll("{gozlem}", params.gozlem || GOZLEM_YER_TUTUCU)
    .replaceAll("{ad}", params.ad || "Değerli İçerik Üreticisi")
    .replaceAll("{platform}", params.platform || "Instagram")
    .replaceAll("{komisyon}", params.komisyon || "{komisyon}")
    .replaceAll("{indirim}", params.indirim || "{indirim}")
    .replaceAll("{davet}", params.davet || "{davet}");
}
