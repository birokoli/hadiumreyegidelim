export interface DmTemplate {
  id: string;
  name: string;
  channel: "instagram_dm" | "email" | "followup";
  subject?: string;
  content: string;
}

export const DM_TEMPLATES: DmTemplate[] = [
  {
    id: "instagram_dm_short",
    name: "Instagram DM (Kısa & Samimi)",
    channel: "instagram_dm",
    content: `Selamün aleyküm {ad},

{platform} üzerindeki paylaşımlarınızı ve takipçilerinizle kurduğunuz samimi bağı takdirle takip ediyoruz. Hadi Umreye Gidelim olarak, muhafazakâr ve dindar kitlemize özel, şeffaf ve güvenilir umre seyahat çözümleri sunuyoruz.

Topluluğunuza özel tanımlayacağımız indirim kuponu ve gerçekleştireceğiniz her yönlendirme için {komisyon} komisyon modeli ile bir iş birliği başlatmak isteriz.

Detayları incelemek ve iş birliği davetimizi kabul etmek için aşağıdaki bağlantıyı kullanabilirsiniz:
{davet}

Hayırlı günler dileriz.`
  },
  {
    id: "email_long",
    name: "E-posta Daveti (Detaylı & Kurumsal)",
    channel: "email",
    subject: "Hadi Umreye Gidelim — Özel İş Birliği Daveti",
    content: `Sayın {ad},

Selamün aleyküm.

{platform} platformunda gerçekleştirdiğiniz nitelikli ve samimi içerikleri ilgiyle takip ediyoruz. Kutsal topraklara özlem duyan muhafazakâr ve dindar misafirlerimiz için hazırladığımız bireysel ve esnek umre seyahati çözümlerimizi daha geniş kitlelere duyurmak amacıyla sizinle çalışmak isteriz.

İş Birliği Detayları:
• Takipçilerinize özel indirim sağlayan kişiselleştirilmiş kupon kodu.
• Sizin yönlendirmenizle tamamlanan her umre rezervasyonu için {komisyon} tutarında komisyon ödemesi.
• Şeffaf takip paneli ve düzenli ödeme imkanı.

Daveti kabul etmek ve panelinize erişmek için aşağıdaki kişisel bağlantınızı kullanabilirsiniz:
{davet}

Sormak istediğiniz tüm sorular için bu e-postaya yanıt verebilirsiniz.

Selam ve hürmetlerimizle,
Hadi Umreye Gidelim Ekibi`
  },
  {
    id: "followup_5days",
    name: "Takip Mesajı (5 Gün Sonra Hatırlatma)",
    channel: "followup",
    content: `Selamün aleyküm {ad},

Geçtiğimiz günlerde ilettiğimiz umre seyahati iş birliği davetimizi hatırlatmak istedik. Takipçi kitlenize özel tanımladığımız {komisyon} komisyon oranlı iş birliği fırsatımız hâlen geçerlidir.

Detaylı bilgi ve davet bağlantınız:
{davet}

Zaman ayırdığınız için teşekkür eder, hayırlı çalışmalar dileriz.`
  }
];

export function fillTemplate(
  templateContent: string,
  params: { ad?: string; platform?: string; komisyon?: string; davet?: string }
): string {
  return templateContent
    .replaceAll("{ad}", params.ad || "Değerli İçerik Üreticisi")
    .replaceAll("{platform}", params.platform || "Instagram")
    .replaceAll("{komisyon}", params.komisyon || "{komisyon}")
    .replaceAll("{davet}", params.davet || "[DAVET_BAGLANTISI]");
}
