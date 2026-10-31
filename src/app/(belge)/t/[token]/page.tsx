// Teklif sayfası (14 Ekim): WhatsApp mesajındaki bağlantı. Oteller, dahil hizmetler, toplam, ödeme planı ve onay.
// 15 Ekim (kullanıcı, şeffaf fiyat politikası): her otelin ve hizmetin satış fiyatı satırında görünür.
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDosya, geceSayisi, hitapAdi, KALEM_TURLERI, kalemToplam, odemeDagilimi, teklifSuresiDoldu, onaylandiMi, oteller, toplam, genelToplam, kdvTutari, kartla, KART_PAYI, KDV_ETIKETI, trTarih, usd, tumSecenekler, secenekUygula, indirimGenel, indirimsizGenel, indirimOf, type DosyaData } from "@/lib/satis";
import { durakSayisi, rotaOf } from "@/lib/satis/ziyaret";
import ZiyaretRotasi from "@/components/satis/ZiyaretRotasi";
import { findDirectoryHotel, kaabaText } from "@/lib/catalog/hotel-directory";
import HugIcon, { type HugIconName } from "@/components/icons/HugIcon";
import Accent from "@/components/home/Accent";
import TeklifOnayla from "@/components/profil/TeklifOnayla";
import { cookies, headers } from "next/headers";
import { after } from "next/server";
import { acilisKaydet } from "@/lib/satis/acilis";
import { TEKLIF_ONIZLEME } from "@/lib/satis/onizleme";

export const dynamic = "force-dynamic";
// Paylaşım önizlemesi: src/lib/satis/onizleme.ts
export const metadata = TEKLIF_ONIZLEME;

export default async function TeklifSayfasi({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ onizleme?: string; s?: string }> }) {
  const d = await getDosya("token", (await params).token);
  if (!d || d.status === "iptal" || !d.data.kalemler.length) notFound();
  // Açılma kaydı (21 Ekim): sayfa gönderildikten sonra yazılır; botlar, admin önizlemesi ve admin oturumu sayılmaz
  const [h, c, sp] = await Promise.all([headers(), cookies(), searchParams]);
  const acilan = { ua: h.get("user-agent") ?? "", ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip"), admin: Boolean(c.get("admin_token")), onizleme: sp.onizleme === "1" };
  after(() => acilisKaydet(d.id, acilan));
  // Seçenekler (31 Ekim): kartlardan biri seçilidir (?s=), sayfanın geri kalanı o seçenekle hesaplanır. Onaydan sonra seçenek yok
  const secs = onaylandiMi(d.status) ? [] : tumSecenekler(d.data);
  const onerilen = d.data.onerilen ?? "ana";
  const secili = secs.find((s) => s.id === sp.s) ?? secs.find((s) => s.id === onerilen) ?? secs[0];
  const x: DosyaData = secenekUygula(d.data, secili?.id === "ana" ? null : secili);
  const kisiS = Math.max(1, d.data.yetiskin + d.data.cocuk);
  const kartlar = secs.map((s) => {
    const dd = secenekUygula(d.data, s.id === "ana" ? null : s);
    return { s, dd, g: genelToplam(dd), ind: indirimGenel(dd) };
  });
  const t = genelToplam(x);
  const net = toplam(x);
  const kisi = x.yetiskin + x.cocuk;
  const ots = await Promise.all(
    oteller(x).map(async (k) => {
      const h = k.otel?.slug && !k.otel.slug.startsWith("svc:") ? await findDirectoryHotel(k.otel.slug).catch(() => null) : null;
      return { k, h };
    }),
  );
  const dahil = x.kalemler.filter((k) => !k.tur.startsWith("otel_"));
  const rotalar = dahil.map((k) => rotaOf(k.rota)).filter((r): r is NonNullable<typeof r> => !!r);
  const suresiDoldu = teklifSuresiDoldu(x.gecerlilik) && !onaylandiMi(d.status);
  const wa = `https://wa.me/905404010038?text=${encodeURIComponent(`Merhaba, ${d.no} numaralı teklifim hakkında yazıyorum.`)}`;

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 pb-16">
      <section className="bg-deep on-dark relative overflow-hidden rounded-[28px] p-6 text-white md:p-8">
        <span aria-hidden className="hat pointer-events-none absolute -bottom-12 right-4 select-none text-[9rem] leading-none text-white/[0.05]">عمرة</span>
        <p className="relative text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--h-sand)]">Umre teklifiniz · {d.no}</p>
        <h1 className="relative mt-2 text-3xl font-bold leading-tight md:text-[40px]"><Accent text={`${hitapAdi(x)}, umreniz *hazır*`} /></h1>
        <p className="relative mt-2 text-sm text-white/80">
          {x.gidis ? `${trTarih(x.gidis)} – ${trTarih(x.donus, { day: "numeric", month: "long", year: "numeric" })} · ` : ""}
          {x.yetiskin} yetişkin{x.cocuk ? `, ${x.cocuk} çocuk` : ""}{x.bebek ? `, ${x.bebek} bebek` : ""}
        </p>
      </section>

      {kartlar.length > 0 && (
        <section className="rounded-[28px] bg-white p-6 ring-1 ring-[var(--h-sky)]/60">
          <h2 className="text-lg font-bold text-[var(--h-blue)]">Size {kartlar.length} seçenek hazırladık</h2>
          <p className="mt-1 text-[13px] text-[#5b6680]">Oteller farklı; diğer hizmetler hepsinde aynı. Bir seçeneğe dokunun, ayrıntısı aşağıda.</p>
          <div className={`mt-4 grid gap-3 ${kartlar.length > 2 ? "md:grid-cols-3" : "sm:grid-cols-2"}`}>
            {kartlar.map(({ s, dd, g, ind }) => {
              const aktif = s.id === secili?.id;
              const q = new URLSearchParams({ s: s.id, ...(sp.onizleme === "1" ? { onizleme: "1" } : {}) });
              return (
                <Link key={s.id} href={`?${q}`} scroll={false} className={`relative flex flex-col rounded-2xl p-4 transition ${aktif ? "bg-[var(--h-blue)] text-white shadow-[0_14px_28px_-16px_rgba(29,66,138,0.9)]" : "bg-[var(--h-white)] text-[#14213d] ring-1 ring-[var(--h-sky)] hover:ring-[var(--h-blue)]/40"}`}>
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[15px] font-bold">{s.ad || "Seçenek"}</span>
                    {s.id === onerilen && <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${aktif ? "bg-[var(--h-sand)] text-[var(--h-blue-deep)]" : "bg-[var(--h-blue)] text-white"}`}>Önerimiz</span>}
                  </span>
                  <span className={`mt-2 space-y-0.5 text-[12px] ${aktif ? "text-white/80" : "text-[#5b6680]"}`}>
                    {oteller(dd).map((k) => { const n = geceSayisi(k.otel?.giris, k.otel?.cikis); return <span key={k.id} className="block">{k.tur === "otel_mekke" ? "Mekke" : "Medine"}: <b className={aktif ? "text-white" : "text-[#14213d]"}>{k.otel?.ad}</b>{n ? ` · ${n} gece` : ""}{k.otel?.oda ? ` · ${k.otel.oda}` : ""}</span>; })}
                  </span>
                  <span className="mt-auto pt-3">
                    {ind > 0 && <span className={`block text-[12px] line-through ${aktif ? "text-white/60" : "text-[#8a94ab]"}`}>{usd(indirimsizGenel(dd))}</span>}
                    <span className="block text-2xl font-bold">{usd(g)}</span>
                    <span className={`block text-[12px] ${aktif ? "text-white/80" : "text-[#5b6680]"}`}>{kisiS > 1 ? `Kişi başı ${usd(g / kisiS)}` : "Toplam"}</span>
                    {ind > 0 && <span className="mt-2 inline-flex rounded-full bg-[var(--h-sand)] px-2.5 py-1 text-[11px] font-bold text-[var(--h-blue-deep)]">{usd(ind)} indirim</span>}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {ots.length > 0 && (
        <section className="rounded-[28px] bg-white p-6 ring-1 ring-[var(--h-sky)]/60">
          <h2 className="text-lg font-bold text-[var(--h-blue)]">Konaklama</h2>
          <div className="mt-4 space-y-3">
            {ots.map(({ k, h }) => {
              const g = geceSayisi(k.otel?.giris, k.otel?.cikis);
              return (
                <div key={k.id} className="flex gap-4 rounded-2xl bg-[var(--h-white)] p-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--h-blue)]"><HugIcon name={k.tur === "otel_mekke" ? "otel" : "medine"} size={22} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--h-blue)]/60">{k.tur === "otel_mekke" ? "Mekke" : "Medine"}{g ? ` · ${g} gece` : ""}{k.otel?.giris ? ` · ${trTarih(k.otel.giris, { day: "numeric", month: "short" })} – ${trTarih(k.otel.cikis, { day: "numeric", month: "short" })}` : ""}</p>
                    <p className="text-[15px] font-bold text-[#14213d]">{k.otel?.ad}</p>
                    <p className="text-[13px] text-[#5b6680]">{[k.otel?.oda, k.adet > 1 && `${k.adet} oda`, h?.kaabaMeters != null && `${k.tur === "otel_mekke" ? "Kâbe'ye" : "Harem'e"} ${kaabaText(h.kaabaMeters)}`].filter(Boolean).join(" · ")}</p>
                    {h && <Link href={`/oteller/${h.slug}`} className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[var(--h-blue)]"><HugIcon name="konum" size={13} /> Otel rehberinde gör</Link>}
                  </div>
                  {kalemToplam(k) > 0 && (
                    <div className="shrink-0 text-right">
                      <p className="text-[15px] font-bold text-[var(--h-blue)]">{usd(kalemToplam(k))}</p>
                      <p className="text-[11px] text-[#5b6680]">{Math.max(1, g)} gece{k.adet > 1 ? ` × ${k.adet} oda` : ""} × {usd(k.birim)}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {dahil.length > 0 && (
        <section className="rounded-[28px] bg-white p-6 ring-1 ring-[var(--h-sky)]/60">
          <h2 className="text-lg font-bold text-[var(--h-blue)]">Fiyata dahil</h2>
          <ul className="mt-3 divide-y divide-[#e1e6ef]">
            {dahil.map((k) => (
              <li key={k.id} className="flex items-start gap-3 py-3">
                <HugIcon name={KALEM_TURLERI[k.tur].ikon as HugIconName} size={20} className="mt-0.5 text-[var(--h-blue)]" />
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-[#14213d]">{rotaOf(k.rota)?.ad ?? k.ad}</p>
                  {rotaOf(k.rota) ? <p className="text-[13px] text-[#5b6680]">{durakSayisi(rotaOf(k.rota)!)} durak · rotası aşağıda</p> : k.aciklama && <p className="text-[13px] text-[#5b6680]">{k.aciklama}</p>}
                </div>
                {kalemToplam(k) > 0 ? (
                  <div className="shrink-0 text-right">
                    <p className="text-[14px] font-bold text-[var(--h-blue)]">{usd(kalemToplam(k))}</p>
                    {k.adet > 1 && <p className="text-[11px] text-[#5b6680]">{k.adet}{k.tur === "tur" || k.tur === "transfer" ? " araç" : ""} × {usd(k.birim)}</p>}
                  </div>
                ) : (
                  <span className="shrink-0 text-xs font-semibold text-[#2f7d55]">Dahil</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {rotalar.length > 0 && (
        <section className="rounded-[28px] bg-white p-6 ring-1 ring-[var(--h-sky)]/60">
          <h2 className="text-lg font-bold text-[var(--h-blue)]">Ziyaret turlarınız</h2>
          <p className="mt-1 text-[13px] text-[#5b6680]">Türkçe konuşan rehberimiz eşliğinde, özel araçla.</p>
          <div className={`mt-5 grid gap-8 ${rotalar.length > 1 ? "md:grid-cols-2" : ""}`}>
            {rotalar.map((r) => <ZiyaretRotasi key={r.ad} rota={r} />)}
          </div>
        </section>
      )}

      <section className="rounded-[28px] bg-white p-6 ring-1 ring-[var(--h-sky)]/60">
        {/* İndirim (31 Ekim, kullanıcı: "büyük bir şey gibi olmalı"): üstü çizili fiyat kalemlerin gerçek toplamıdır */}
        {indirimGenel(x) > 0 && (
          <div className="relative -mx-2 -mt-2 mb-5 overflow-hidden rounded-[22px] bg-[var(--h-sand)] px-5 py-4 text-[var(--h-blue-deep)]">
            <span aria-hidden className="pointer-events-none absolute -right-3 -top-6 select-none text-[6.5rem] font-bold leading-none opacity-[0.08]">%</span>
            <p className="relative text-[11px] font-bold uppercase tracking-[0.22em]">{hitapAdi(x)}, size özel indirim</p>
            <p className="relative mt-1 text-4xl font-bold md:text-5xl">{usd(indirimGenel(x))}</p>
            <p className="relative mt-1 text-[13px] font-semibold">
              Normal fiyat <span className="line-through">{usd(indirimsizGenel(x))}</span>{kisi > 1 ? ` · kişi başı ${usd(indirimGenel(x) / kisi)} kazancınız` : ""}
            </p>
          </div>
        )}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--h-blue)]/60">{secili ? `${secili.ad || "Seçenek"} · ` : ""}Toplam{x.kdv ? " · KDV dahil" : ""}</p>
            {indirimGenel(x) > 0 && <p className="text-lg font-semibold text-[#8a94ab] line-through">{usd(indirimsizGenel(x))}</p>}
            <p className="text-4xl font-bold text-[var(--h-blue)]">{usd(t)}</p>
            {kisi > 1 && <p className="text-sm text-[#5b6680]">Kişi başı {usd(t / kisi)}</p>}
          </div>
          {x.gecerlilik && <p className={`rounded-full px-3 py-1 text-xs font-bold ${suresiDoldu ? "bg-red-50 text-red-700" : "bg-[#fbf4e1] text-[#8a6a1c]"}`}>{suresiDoldu ? "Süresi doldu" : `${trTarih(x.gecerlilik)} tarihine kadar geçerli`}</p>}
        </div>
        {x.kdv && (
          <dl className="mt-4 space-y-1.5 border-t border-[var(--h-sky)]/60 pt-4 text-sm">
            {indirimOf(x) > 0 && <div className="flex justify-between text-[#5b6680]"><dt>Hizmetler (KDV hariç)</dt><dd>{usd(net + indirimOf(x))}</dd></div>}
            {indirimOf(x) > 0 && <div className="flex justify-between font-semibold text-[#8a6a1c]"><dt>Size özel indirim</dt><dd>−{usd(indirimOf(x))}</dd></div>}
            <div className="flex justify-between text-[#5b6680]"><dt>{indirimOf(x) > 0 ? "İndirimli tutar (KDV hariç)" : "Hizmetler (KDV hariç)"}</dt><dd>{usd(net)}</dd></div>
            <div className="flex justify-between text-[#5b6680]"><dt>{KDV_ETIKETI}</dt><dd>{usd(kdvTutari(x))}</dd></div>
            <div className="flex justify-between font-bold text-[#14213d]"><dt>Havale / EFT ile</dt><dd>{usd(t)}</dd></div>
            <div className="flex justify-between font-bold text-[#14213d]"><dt>Kredi kartıyla (%{Math.round(KART_PAYI * 100)} kart payı dahil)</dt><dd>{usd(kartla(t))}</dd></div>
          </dl>
        )}
        {x.odemePlani === "bolunmus" && (() => { const o = odemeDagilimi(x); return (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="rounded-2xl bg-[var(--h-white)] p-4"><p className="text-xs text-[#5b6680]">Önden (otel, vize, hoca ücretinin yarısı)</p><p className="text-lg font-bold text-[#14213d]">{usd(o.onden)}</p></div>
            <div className="rounded-2xl bg-[var(--h-white)] p-4"><p className="text-xs text-[#5b6680]">Cidde&apos;de (transfer, hoca ücretinin yarısı)</p><p className="text-lg font-bold text-[#14213d]">{usd(o.varis)}</p></div>
          </div>
        ); })()}
        {x.teklifNotu && <p className="mt-4 text-sm text-[#5b6680]">{x.teklifNotu}</p>}
      </section>

      {!suresiDoldu && <TeklifOnayla token={d.token} onaylandi={onaylandiMi(d.status)} secenek={secili ? { id: secili.id, ad: secili.ad || "Seçenek" } : undefined} />}
      <div className="grid gap-2 sm:grid-cols-2">
        <a href={wa} className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--h-sky)] bg-white px-5 py-3.5 text-sm font-bold text-[var(--h-blue)]"><HugIcon name="mesaj" size={18} /> WhatsApp&apos;tan sorun</a>
        <Link href="/profil/uye-ol" className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--h-sand)] px-5 py-3.5 text-sm font-bold text-[var(--h-blue-deep)]"><HugIcon name="bireysel" size={18} /> Üye olun, umrenizi takip edin</Link>
      </div>
      <p className="text-center text-xs text-[#8a94ab]">Üye olurken bu teklifteki e-posta adresinizi kullanırsanız dosyanız profilinize kendiliğinden bağlanır.</p>
    </div>
  );
}
