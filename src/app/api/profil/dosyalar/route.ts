// Üyenin umre dosyaları (19 Kasım, müşteri uygulaması): profil sayfalarının gösterdiği verinin JSON hâli. Yalnızca okuma.
// Müşteriye görünmemesi gerekenler (alış fiyatı, kâr, iç notlar, geçmiş kayıtları, sorumlu) gönderilmez.
import { NextResponse } from "next/server";
import { uyeOturumu } from "@/lib/members/guard";
import {
  dosyalarOfMember, genelToplam, indirimGenel, indirimsizGenel, kalemToplam, kartla, listBelgeler, odemeDagilimi, odenen,
  secenekUygula, teklifSuresiDoldu, tumSecenekler, BELGE_TURLERI, KALEM_TURLERI, type DosyaData, type Kalem,
} from "@/lib/satis";

export const dynamic = "force-dynamic";

const yuvarla = (n: number) => Math.round(n * 100) / 100;
/** KDV dahil kalem tutarı (müşterinin gördüğü); alış gönderilmez */
const kalemOf = (k: Kalem, carpan: number) => ({
  id: k.id, tur: k.tur, turAd: KALEM_TURLERI[k.tur]?.label ?? k.tur, ad: k.ad, aciklama: k.aciklama ?? null, adet: k.adet,
  tutar: yuvarla(kalemToplam(k) * carpan), rota: k.rota ?? null,
  otel: k.otel ? { ad: k.otel.ad, giris: k.otel.giris ?? null, cikis: k.otel.cikis ?? null, oda: k.otel.oda ?? null, onayNo: k.otel.onayNo ?? null } : null,
});
const ozet = (d: DosyaData) => {
  const g = genelToplam(d);
  const ara = d.kalemler.reduce((s, k) => s + kalemToplam(k), 0);
  const carpan = ara > 0 ? indirimsizGenel(d) / ara : 1; // KDV çarpanı (dosyada KDV yoksa 1)
  return { kalemler: d.kalemler.map((k) => kalemOf(k, carpan)), toplam: yuvarla(g), indirimsiz: yuvarla(indirimsizGenel(d)), indirim: yuvarla(indirimGenel(d)), kartla: yuvarla(kartla(g)) };
};

export async function GET() {
  const o = await uyeOturumu();
  if (!o) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  const dosyalar = await dosyalarOfMember(o.m, o.dogrulandi);
  const liste = await Promise.all(dosyalar.map(async (x) => {
    const d = x.data;
    const teklifAsamasi = x.status === "talep" || x.status === "teklif";
    const secenekler = teklifAsamasi ? tumSecenekler(d).map((s) => ({ id: s.id, ad: s.ad, onerilen: (d.onerilen ?? "ana") === s.id, ...ozet(secenekUygula(d, s.id === "ana" ? null : s)) })) : [];
    const o2 = ozet(d);
    const odenmis = odenen(d);
    const belgeler = await listBelgeler(x.id).catch(() => []);
    return {
      no: x.no, token: x.token, durum: x.status, olusturuldu: x.createdAt, asamaTarihleri: d.asamaTarihleri ?? {},
      musteriAdi: d.musteriAdi, yetiskin: d.yetiskin ?? null, cocuk: d.cocuk ?? null, gidis: d.gidis ?? null, donus: d.donus ?? null,
      // Teklif henüz gönderilmediyse (talep aşaması) fiyat ve kalem gösterilmez
      teklifVar: d.kalemler.length > 0 && x.status !== "talep",
      ...(x.status === "talep" ? { kalemler: [], toplam: 0, indirimsiz: 0, indirim: 0, kartla: 0 } : o2),
      secenekler,
      gecerlilik: d.gecerlilik ?? null, sureDoldu: teklifAsamasi ? teklifSuresiDoldu(d.gecerlilik) : false, teklifNotu: d.teklifNotu ?? null,
      odemePlani: d.odemePlani, dagilim: d.odemePlani === "bolunmus" ? odemeDagilimi(d) : null,
      odenen: yuvarla(odenmis), kalan: yuvarla(Math.max(0, o2.toplam - odenmis)),
      odemeler: d.odemeler.map((p) => ({ tarih: p.tarih, tutar: p.tutar, yontem: p.yontem, yer: p.yer })),
      ucusGidis: d.ucusGidis ?? null, ucusDonus: d.ucusDonus ?? null,
      karsilamaYeri: d.karsilamaYeri ?? null, karsilayanAd: d.karsilayanAd ?? null, karsilayanTel: d.karsilayanTel ?? null,
      rehberAd: d.rehberAd ?? null, rehberTel: d.rehberTel ?? null, tren: d.tren ?? null, donusTransfer: d.donusTransfer ?? null, musteriyeNot: d.musteriyeNot ?? null,
      belgeler: belgeler.map((b) => ({ id: b.id, ad: b.ad, tur: b.tur, turAd: BELGE_TURLERI[b.tur] ?? "Belge" })),
    };
  }));
  return NextResponse.json({ dogrulandi: o.dogrulandi, dosyalar: liste }, { headers: { "Cache-Control": "private, no-store" } });
}
