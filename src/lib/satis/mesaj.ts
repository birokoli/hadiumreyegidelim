// Satış masası WhatsApp mesajları (14 Ekim, kullanıcı: "teklifi WhatsApp'tan mesaj olarak atıyoruz; PDF çok uzundu;
// satın alımdan sonra voucher gönderiyoruz"). Kısa, düzgün metin + onay/voucher bağlantısı. İstemcide de çalışır.
import { SITE_URL } from "@/lib/seo/site";
import { geceSayisi, genelToplam, hitapAdi, indirimGenel, indirimsizGenel, KALEM_TURLERI, kartla, KART_PAYI, odemeDagilimi, onaylandiMi, oteller, secenekUygula, trTarih, tumSecenekler, usd, type Dosya } from "./ortak";
import { durakSayisi, rotaOf } from "./ziyaret";

const hitap = (x: Dosya["data"]) => hitapAdi(x);
const tarihAraligi = (g?: string, d?: string) => (g ? `${trTarih(g)}${d ? ` – ${trTarih(d, { day: "numeric", month: "long", year: "numeric" })}` : ""}` : "");
const kisi = (x: Dosya["data"]) => [x.yetiskin && `${x.yetiskin} yetişkin`, x.cocuk && `${x.cocuk} çocuk`, x.bebek && `${x.bebek} bebek`].filter(Boolean).join(", ");

export const teklifLinki = (d: Dosya) => `${SITE_URL}/t/${d.token}`;
export const voucherLinki = (d: Dosya) => `${SITE_URL}/v/${d.token}`;

export function teklifMesaji(d: Dosya): string {
  const x = d.data;
  const s: string[] = [];
  s.push(`Selamün aleyküm ${hitap(x)},`, "", `Umre teklifiniz hazır (${d.no}):`, "");
  const tarih = tarihAraligi(x.gidis, x.donus);
  if (tarih || kisi(x)) s.push(`📅 ${[tarih, kisi(x)].filter(Boolean).join(" · ")}`);
  const otelSatirlari = (dd: typeof x) => oteller(dd).map((k) => {
    const g = geceSayisi(k.otel?.giris, k.otel?.cikis);
    return `${k.tur === "otel_mekke" ? "🕋 Mekke" : "🕌 Medine"}: ${k.otel?.ad}${g ? ` · ${g} gece` : ""}${k.otel?.oda ? ` · ${k.otel.oda}` : ""}`;
  });
  // Seçenekli teklif (31 Ekim): her seçeneğin otelleri ve fiyatı; WhatsApp'ta ~üstü çizili~ ve *kalın*
  const secs = onaylandiMi(d.status) ? [] : tumSecenekler(x);
  const kisiSayisi = x.yetiskin + x.cocuk;
  const fiyat = (dd: typeof x) => {
    const t = genelToplam(dd);
    const ind = indirimGenel(dd);
    return `${ind > 0 ? `~${usd(indirimsizGenel(dd))}~ ` : ""}*${usd(t)}*${kisiSayisi > 1 ? ` · kişi başı ${usd(t / kisiSayisi)}` : ""}${ind > 0 ? ` · 🎁 ${usd(ind)} indirim` : ""}`;
  };
  if (secs.length) {
    s.push("", `Size ${secs.length} seçenek hazırladık:`);
    secs.forEach((sc, i) => {
      const dd = secenekUygula(x, sc.id === "ana" ? null : sc);
      s.push("", `*${i + 1}) ${sc.ad || "Seçenek"}*${sc.id === (x.onerilen ?? "ana") ? " (önerimiz)" : ""}`, ...otelSatirlari(dd), `Toplam: ${fiyat(dd)}${x.kdv ? " (KDV dahil)" : ""}`);
    });
    s.push("");
  } else s.push(...otelSatirlari(x));
  const dahil = [...new Set(x.kalemler.filter((k) => !k.tur.startsWith("otel_")).map((k) => {
    const r = rotaOf(k.rota);
    return r ? `${r.ad} (${durakSayisi(r)} durak)` : k.ad || KALEM_TURLERI[k.tur].label;
  }))];
  if (dahil.length) s.push(`✅ Dahil: ${dahil.join(", ").toLocaleLowerCase("tr-TR")}`);
  const t = genelToplam(x);
  if (!secs.length) s.push("", `Toplam: ${fiyat(x)}${x.kdv ? " (KDV dahil)" : ""}`);
  if (x.kdv) s.push(secs.length ? `Kartla ödemede %${Math.round(KART_PAYI * 100)} kart payı eklenir.` : `Kartla ödemede: ${usd(kartla(t))} (%${Math.round(KART_PAYI * 100)} kart payı)`);
  if (x.odemePlani === "bolunmus" && !secs.length) {
    const o = odemeDagilimi(x);
    s.push(`Ödeme: ${usd(o.onden)} önden, ${usd(o.varis)} Cidde'de`);
  }
  if (x.gecerlilik) s.push(`Geçerlilik: ${trTarih(x.gecerlilik)} tarihine kadar`);
  if (x.teklifNotu) s.push("", x.teklifNotu);
  s.push("", `${secs.length ? "Seçenekleri karşılaştırıp onaylamak için" : "Ayrıntılar ve onay"}: ${teklifLinki(d)}`, "", "Hadi Umreye Gidelim");
  return s.join("\n");
}

export function voucherMesaji(d: Dosya): string {
  const x = d.data;
  const s: string[] = [`Selamün aleyküm ${hitap(x)},`, "", `Umre belgeniz (voucher) hazır: ${d.no}`, ""];
  const tarih = tarihAraligi(x.gidis, x.donus);
  if (tarih) s.push(`📅 ${tarih}`);
  for (const k of oteller(x)) s.push(`${k.tur === "otel_mekke" ? "🕋 Mekke" : "🕌 Medine"}: ${k.otel?.ad}${k.otel?.giris ? ` · ${trTarih(k.otel.giris, { day: "numeric", month: "short" })} – ${trTarih(k.otel.cikis, { day: "numeric", month: "short" })}` : ""}${k.otel?.onayNo ? ` · Onay no ${k.otel.onayNo}` : ""}`);
  if (x.karsilamaYeri) s.push(`🚐 Karşılama: ${x.karsilamaYeri}${x.karsilayanAd ? ` · ${x.karsilayanAd}` : ""}${x.karsilayanTel ? ` (${x.karsilayanTel})` : ""}`);
  s.push("", `Belgeniz: ${voucherLinki(d)}`, "Telefonunuza kaydedin ya da yazdırın; havalimanında ve otelde göstermeniz yeterli.", "", "Rabbim umrenizi kolaylaştırsın.", "Hadi Umreye Gidelim");
  return s.join("\n");
}

export const waLink = (numara: string, metin: string) => `https://wa.me/${numara}?text=${encodeURIComponent(metin)}`;
