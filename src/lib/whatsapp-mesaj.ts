// WhatsApp'a giden hazır mesaj: ziyaretçinin bulunduğu sayfaya göre (yüzen düğme ve mobil alt çubuk aynı metni kullanır)

export function whatsappMesaji(pathname: string | null | undefined): string {
  const p = pathname ?? "/";
  if (p === "/bireysel-umre") return "Merhaba Yasin Bey, Bireysel Umre Konfigüratöründeyim. Özel Umre tasarımı hakkında fiyat ve destek almak istiyorum.";
  if (p.startsWith("/umre-vizesi")) return "Merhaba, Suudi Arabistan Turist/Umre Vizesi sayfanızı inceliyorum. Acaba işlemler nasıl yürüyor bilgi alabilir miyim?";
  if (p.startsWith("/blog/")) return `Merhaba, blogunuzdaki "${p.replace("/blog/", "")}" başlıklı yazıyı okudum. Umre süreci hakkında size danışmak istediğim birkaç konu var.`;
  if (p.startsWith("/paketler/")) return "Merhaba, Vip Umre paketlerinizi inceliyorum. Bu paketin detayları hakkında görüşebilir miyiz?";
  if (p.startsWith("/oteller/")) return `Merhaba, sitenizde ${p.replace("/oteller/", "")} otelini inceliyorum. Fiyat ve müsaitlik hakkında bilgi alabilir miyim?`;
  if (p === "/") return "Merhaba Ana Sayfanızdan ulaşıyorum. Ailemle özel bir umre yapmak istiyorum, detaylı bilgi alabilir miyim?";
  return "Merhaba, Hadi Umreye Gidelim hizmetleriniz hakkında bilgi almak istiyorum.";
}

export const whatsappLinki = (numara: string, pathname: string | null | undefined) =>
  `https://wa.me/${numara.replace(/[^\d]/g, "")}?text=${encodeURIComponent(whatsappMesaji(pathname))}`;
