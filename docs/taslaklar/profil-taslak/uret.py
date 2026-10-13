#!/usr/bin/env python3
"""Profil 2. sürüm tasarım taslağı (13 Ekim 2026). Kod değil, görsel taslak: örnek verilerle statik HTML.

Çıktı: docs/taslaklar/profil-taslak/taslak.html (ikonlar data URI olarak gömülü, yazı tipleri Google Fonts).
Çalıştır: python3 docs/taslaklar/profil-taslak/uret.py
"""
import base64
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[3]
HERE = pathlib.Path(__file__).resolve().parent


def ikon(ad, boyut=20, renk="currentColor", cls=""):
    data = base64.b64encode((ROOT / "public" / "ikon" / f"{ad}.svg").read_bytes()).decode()
    url = f"url(data:image/svg+xml;base64,{data})"
    return (f'<span class="{cls}" style="display:inline-block;flex-shrink:0;width:{boyut}px;height:{boyut}px;background:{renk};'
            f'-webkit-mask:{url} center/contain no-repeat;mask:{url} center/contain no-repeat"></span>')


KAPAK_T = "../../../public/indir/tavaf-el-kitabi-kapak.png"
KAPAK_S = "../../../public/indir/say-el-kitabi-kapak.png"
LOGO = "../../../public/email/logo.png"


def navbar():
    return f'''<div class="flex h-14 items-center justify-between bg-white px-4 shadow-sm">
  <img src="{LOGO}" class="h-8">
  <div class="flex items-center gap-3">{ikon("bireysel", 22, "#1d428a")}<span class="rounded-full bg-[#1d428a] px-3.5 py-2 text-xs font-bold text-white">Niyet Et</span></div>
</div>'''


def ust(baslik, aktif):
    sekmeler = [("kabe", "Özet"), ("paket", "Umrelerim"), ("fiyat", "Teklifler"), ("rehber", "Kitaplık"), ("bireysel", "Hesap")]
    tabs = "".join(
        f'<span class="flex shrink-0 items-center gap-1.5 rounded-t-2xl px-3 py-2.5 text-[12px] font-bold {"bg-[#edf1fe] text-[#1d428a]" if ad == aktif else "text-white/75"}">'
        f'{ikon(i, 15, "#1d428a" if ad == aktif else "#f2dda6")}{ad}</span>' for i, ad in sekmeler)
    return f'''<div class="deep relative overflow-hidden px-4 pt-5 text-white">
  <span class="hat absolute -bottom-6 right-0 text-[6rem] leading-none text-white/[0.05]">لبيك</span>
  <p class="text-[10px] font-bold uppercase tracking-[0.22em] text-[#f2dda6]">Hesabım</p>
  <h1 class="mt-1 text-[24px] font-bold leading-tight">{baslik}</h1>
  <div class="no-scrollbar mt-4 flex gap-0.5 overflow-hidden">{tabs}</div>
</div>'''


def telefon(etiket, govde, yukseklik=1180):
    return f'''<figure class="flex flex-col items-center">
  <figcaption class="mb-3 text-sm font-bold text-[#12295a]">{etiket}</figcaption>
  <div class="w-[390px] overflow-hidden rounded-[44px] border-[10px] border-[#12295a] bg-[#edf1fe] shadow-2xl">
    <div class="overflow-hidden" style="height:{yukseklik}px">{navbar()}{govde}</div>
  </div>
</figure>'''


ADIMLAR = [("Teklif", "2 Eki", 1), ("Onaylandı", "4 Eki", 1), ("Ödeme", "6 Eki", 1), ("Vize başvurusu", "8 Eki", 1), ("Vize çıktı", "11 Eki", 2), ("Yolculuk", "14 Kas", 0), ("Tamamlandı", "", 0)]


def mini_adimlar():
    out = []
    for i, (ad, _, d) in enumerate(ADIMLAR):
        renk = "#1d428a" if d == 1 else ("#f2dda6" if d == 2 else "#d7e0f0")
        out.append(f'<span class="h-1.5 flex-1 rounded-full" style="background:{renk}"></span>')
    return '<div class="flex gap-1">' + "".join(out) + "</div>"


# ─── 1. Özet ───────────────────────────────────────────────────────────────
ozet = ust('Hayırlı akşamlar, <em class="serif text-[#f2dda6]">Ahmet</em>', "Özet") + f'''
<div class="space-y-4 p-4">
  <div class="relative overflow-hidden rounded-[26px] bg-white p-5 ring-1 ring-[#b8c9e3]/60">
    <span class="hat absolute -bottom-6 -right-1 text-[5.5rem] leading-none text-[#1d428a]/[0.05]">عمرة</span>
    <div class="flex items-center justify-between">
      <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1d428a]/60">Yaklaşan umreniz</p>
      <span class="rounded-full bg-[#fbf4e1] px-2.5 py-0.5 text-[11px] font-bold text-[#8a6a1c]">Vize çıktı</span>
    </div>
    <div class="mt-2 flex items-end gap-2"><b class="text-[52px] font-bold leading-none text-[#1d428a]">23</b><span class="mb-1.5 text-[15px] font-semibold text-[#3d4a66]">gün kaldı</span></div>
    <p class="mt-1 text-sm text-[#5b6680]">14 – 24 Kasım 2026 · 2 yetişkin · Önce Mekke</p>
    <div class="mt-4">{mini_adimlar()}</div>
    <div class="mt-4 flex gap-2">
      <span class="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#1d428a] py-3 text-sm font-bold text-white">{ikon("paket", 17, "#f2dda6")}Dosyamı aç</span>
      <span class="flex items-center justify-center rounded-2xl border border-[#b8c9e3] px-4 py-3 text-sm font-bold text-[#1d428a]">{ikon("mesaj", 17, "#1d428a")}</span>
    </div>
  </div>

  <div class="rounded-[26px] bg-[#fbf4e1] p-4 ring-1 ring-[#f2dda6]">
    <p class="flex items-center gap-2 text-[13px] font-bold text-[#5a4612]">{ikon("bilgi", 17, "#b8862f")} Sizden beklenen 1 adım</p>
    <div class="mt-3 flex items-center gap-3 rounded-2xl bg-white p-3">
      <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf1fe]">{ikon("ucak", 20, "#1d428a")}</span>
      <div class="min-w-0 flex-1"><p class="text-[13px] font-bold text-[#14213d]">Uçuş bilgilerinizi ekleyin</p><p class="text-[12px] text-[#5b6680]">Karşılama saatiniz buna göre ayarlanır</p></div>
      {ikon("ok", 16, "#1d428a")}
    </div>
  </div>

  <div class="rounded-[26px] bg-white p-4 ring-1 ring-[#b8c9e3]/60">
    <div class="flex items-center justify-between"><p class="text-[13px] font-bold text-[#14213d]">Yanıt bekleyen teklif</p><span class="text-[12px] font-bold text-[#1d428a]">Tümü →</span></div>
    <div class="mt-3 flex items-center gap-3">
      <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf1fe]">{ikon("fiyat", 20, "#1d428a")}</span>
      <div class="flex-1"><p class="text-[13px] font-bold text-[#14213d]">TKF-2026-0187 · Ramazan umresi</p><p class="text-[12px] text-[#5b6680]">4 kişi · 2 gün içinde geçerli</p></div>
    </div>
  </div>

  <div class="flex gap-3 rounded-[26px] bg-white p-4 ring-1 ring-[#b8c9e3]/60">
    <img src="{KAPAK_T}" class="w-14 -rotate-3 rounded-md shadow-md"><img src="{KAPAK_S}" class="-ml-6 mt-1 w-14 rotate-3 rounded-md shadow-md">
    <div class="flex-1"><p class="text-[13px] font-bold text-[#14213d]">Kitaplığınız</p><p class="text-[12px] leading-snug text-[#5b6680]">Tavaf ve Sa'y El Kitabı; Harem'de şavt modunda okuyun.</p><p class="mt-1.5 text-[12px] font-bold text-[#1d428a]">Kitaplığa git →</p></div>
  </div>

  <div class="relative overflow-hidden rounded-[26px] deep p-5 text-white">
    <span class="hat absolute -bottom-6 -left-1 text-[5rem] leading-none text-white/[0.06]">رمضان</span>
    <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f2dda6]">Size uygun · Kampanya</p>
    <p class="mt-1.5 text-[19px] font-bold leading-snug">Ramazan 2027 umresi <em class="serif text-[#f2dda6]">erken kayıt</em></p>
    <p class="mt-1 text-[12px] text-white/75">Son 10 gün oteller dolmadan yerinizi ayırtın.</p>
    <span class="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#f2dda6] px-3.5 py-2 text-[12px] font-bold text-[#12295a]">İncele {ikon("ok", 14, "#12295a")}</span>
  </div>
</div>'''


# ─── 2. Umre dosyası ───────────────────────────────────────────────────────
def zaman_cizelgesi():
    satir = []
    for i, (ad, tarih, d) in enumerate(ADIMLAR):
        nokta = ("#1d428a", "white") if d == 1 else (("#f2dda6", "#12295a") if d == 2 else ("white", "#8a94ab"))
        cizgi = "" if i == len(ADIMLAR) - 1 else f'<span class="absolute left-[13px] top-7 h-[calc(100%-12px)] w-0.5" style="background:{"#1d428a" if d == 1 else "#d7e0f0"}"></span>'
        isaret = ikon("onay", 14, nokta[1]) if d == 1 else (ikon("vize", 14, nokta[1]) if d == 2 else f'<span style="color:{nokta[1]}" class="text-[11px] font-bold">{i + 1}</span>')
        satir.append(f'''<li class="relative flex gap-3 pb-3.5">{cizgi}
  <span class="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full {"ring-2 ring-[#d7e0f0]" if d == 0 else ""}" style="background:{nokta[0]}">{isaret}</span>
  <div class="flex flex-1 items-baseline justify-between"><p class="text-[13px] {"font-bold text-[#14213d]" if d else "text-[#8a94ab]"}">{ad}{' <span class="ml-1 rounded-full bg-[#fbf4e1] px-2 py-0.5 text-[10px] font-bold text-[#8a6a1c]">şu an</span>' if d == 2 else ""}</p><span class="text-[11px] text-[#8a94ab]">{tarih}</span></div>
</li>''')
    return '<ol class="mt-4">' + "".join(satir) + "</ol>"


def plan_kart(ikon_ad, gun, baslik, alt, ek=""):
    return f'''<div class="flex gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-[#b8c9e3]/60">
  <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf1fe]">{ikon(ikon_ad, 20, "#1d428a")}</span>
  <div class="min-w-0 flex-1"><p class="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1d428a]/60">{gun}</p><p class="text-[13px] font-bold text-[#14213d]">{baslik}</p><p class="text-[12px] leading-snug text-[#5b6680]">{alt}</p>{ek}</div>
</div>'''


dosya = f'''<div class="deep relative overflow-hidden px-4 pb-5 pt-4 text-white">
  <span class="hat absolute -bottom-8 right-0 text-[6rem] leading-none text-white/[0.05]">عمرة</span>
  <p class="flex items-center gap-1.5 text-[12px] text-white/70">{ikon("ok", 13, "rgba(255,255,255,.7)", "rotate-180")} Umrelerim</p>
  <p class="mt-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#f2dda6]">Umre dosyası · HUG-2026-0142</p>
  <h1 class="mt-1 text-[24px] font-bold leading-tight">14 – 24 Kasım <em class="serif text-[#f2dda6]">umreniz</em></h1>
  <p class="mt-1 text-[12px] text-white/75">2 yetişkin · 6 gece Mekke · 4 gece Medine</p>
</div>
<div class="space-y-4 p-4">
  <div class="rounded-[26px] bg-white p-4 ring-1 ring-[#b8c9e3]/60">
    <div class="flex items-center justify-between"><p class="text-[13px] font-bold text-[#14213d]">Dosyanızın durumu</p><span class="text-[11px] text-[#8a94ab]">Son güncelleme 11 Eki</span></div>
    {zaman_cizelgesi()}
  </div>

  <div class="rounded-[26px] bg-white p-4 ring-1 ring-[#b8c9e3]/60">
    <p class="text-[13px] font-bold text-[#14213d]">Yolculuk planı</p>
    <div class="mt-3 space-y-2.5">
      {plan_kart("ucak", "14 Kas · Gidiş", "İstanbul → Cidde", "Uçuş bilgileriniz henüz eklenmedi", '<span class="mt-2 inline-flex rounded-xl bg-[#1d428a] px-3 py-1.5 text-[11px] font-bold text-white">Uçuş bilgisi ekle</span>')}
      {plan_kart("transfer", "14 Kas · Karşılama", "Cidde Havalimanı, Hac Terminali", "Sizi Mustafa Bey karşılayacak · özel araç ile otele", '<span class="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-[#e8f3ec] px-3 py-1.5 text-[11px] font-bold text-[#2f7d55]">' + ikon("mesaj", 13, "#2f7d55") + 'WhatsApp\'tan yazın</span>')}
      {plan_kart("otel", "14 – 20 Kas · Mekke · 6 gece", "Örnek Otel Mekke", "Kâbe'ye 650 m yürüme · Onay no: 88412 · 2 kişilik oda", '<span class="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#1d428a]">' + ikon("konum", 13, "#1d428a") + 'Haritada ve rehberde gör</span>')}
      {plan_kart("tren", "20 Kas · Haremeyn treni", "Mekke → Medine, 10:30", "Ekonomi · 2 bilet · istasyona transfer dahil")}
      {plan_kart("medine", "20 – 24 Kas · Medine · 4 gece", "Örnek Otel Medine", "Mescid-i Nebevi'ye 300 m · Onay no: 51907")}
      {plan_kart("ucak", "24 Kas · Dönüş", "Medine Havalimanı", "Otelden havalimanına transfer · saat uçuşunuza göre")}
    </div>
  </div>

  <div class="rounded-[26px] bg-white p-4 ring-1 ring-[#b8c9e3]/60">
    <p class="text-[13px] font-bold text-[#14213d]">Belgeleriniz</p>
    <div class="mt-2 divide-y divide-[#e1e6ef]">
      {"".join(f'<div class="flex items-center gap-3 py-2.5">{ikon(i, 18, "#1d428a")}<p class="flex-1 text-[13px] text-[#14213d]">{ad}</p><span class="text-[11px] font-bold text-[#1d428a]">İndir</span></div>' for i, ad in [("vize", "Umre vizesi (2 kişi)"), ("otel", "Otel belgesi · Mekke"), ("otel", "Otel belgesi · Medine"), ("tren", "Tren biletleri")])}
    </div>
  </div>

  <div class="rounded-[26px] bg-white p-4 ring-1 ring-[#b8c9e3]/60">
    <p class="text-[13px] font-bold text-[#14213d]">Ödeme</p>
    <div class="mt-3 h-2 overflow-hidden rounded-full bg-[#edf1fe]"><div class="h-full w-[60%] rounded-full bg-[#1d428a]"></div></div>
    <div class="mt-2 flex justify-between text-[12px]"><span class="text-[#5b6680]">Ödenen <b class="text-[#14213d]">2.400 $</b></span><span class="text-[#5b6680]">Kalan <b class="text-[#14213d]">1.600 $</b></span></div>
    <p class="mt-1 text-[11px] text-[#8a94ab]">Toplam 4.000 $ · Kalan tutar 7 Kasım'a kadar</p>
  </div>
</div>'''


# ─── 3. Tekliflerim ────────────────────────────────────────────────────────
def teklif(no, baslik, alt, durum, renk, aktif):
    btn = (f'<div class="mt-3 flex gap-2"><span class="flex-1 rounded-xl bg-[#1d428a] py-2.5 text-center text-[12px] font-bold text-white">Onaylıyorum</span>'
           f'<span class="flex items-center gap-1 rounded-xl border border-[#b8c9e3] px-3 py-2.5 text-[12px] font-bold text-[#1d428a]">{ikon("mesaj", 14, "#1d428a")}Sor</span>'
           f'<span class="rounded-xl border border-[#b8c9e3] px-3 py-2.5 text-[12px] font-bold text-[#1d428a]">PDF</span></div>') if aktif else ""
    return f'''<div class="rounded-[22px] bg-white p-4 ring-1 ring-[#b8c9e3]/60">
  <div class="flex items-center justify-between"><p class="text-[11px] font-bold tracking-[0.12em] text-[#8a94ab]">{no}</p><span class="rounded-full px-2.5 py-0.5 text-[11px] font-bold {renk}">{durum}</span></div>
  <p class="mt-1 text-[15px] font-bold text-[#14213d]">{baslik}</p><p class="text-[12px] text-[#5b6680]">{alt}</p>{btn}
</div>'''


teklifler = ust('Teklif<em class="serif text-[#f2dda6]">leriniz</em>', "Teklifler") + f'''
<div class="space-y-3 p-4">
  {teklif("TKF-2026-0187", "Ramazan umresi · 4 kişi", "8 – 18 Mart 2027 · Mekke 6 gece, Medine 4 gece · 9.800 $", "Yanıt bekliyor", "bg-[#fbf4e1] text-[#8a6a1c]", True)}
  {teklif("TKF-2026-0142", "Kasım umresi · 2 kişi", "14 – 24 Kasım 2026 · 4.000 $", "Onaylandı · dosyaya dönüştü", "bg-[#e8f3ec] text-[#2f7d55]", False)}
  {teklif("TKF-2026-0098", "Eylül umresi · 2 kişi", "Süresi doldu", "Geçersiz", "bg-[#edf1fe] text-[#8a94ab]", False)}

  <div class="rounded-[22px] border-2 border-dashed border-[#b8c9e3] bg-white p-4">
    <p class="flex items-center gap-2 text-[13px] font-bold text-[#14213d]">{ikon("ara", 17, "#1d428a")} Teklifinizi göremiyor musunuz?</p>
    <p class="mt-1 text-[12px] leading-snug text-[#5b6680]">Teklif başka bir telefon ya da e-postayla hazırlandıysa numarasını yazın; teklifteki iletişim bilgisine kod gönderip hesabınıza bağlayalım.</p>
    <div class="mt-3 rounded-xl border border-[#b8c9e3] bg-[#edf1fe]/60 px-3 py-2.5 text-[13px] text-[#7d88a3]">TKF-2026-…</div>
    <span class="mt-2 block rounded-xl bg-[#1d428a] py-2.5 text-center text-[12px] font-bold text-white">Hesabıma bağla</span>
  </div>
</div>'''


# ─── 4. Admin: umre dosyası formu ──────────────────────────────────────────
def alan(etiket, deger, genis=False, ipucu=""):
    return f'''<label class="{"col-span-2" if genis else ""} block"><span class="text-[11px] font-bold uppercase tracking-wider text-[#5b6680]">{etiket}</span>
<div class="mt-1 rounded-xl border border-[#e4e4e7] bg-white px-3 py-2 text-[13px] text-[#14213d]">{deger}</div>{f'<span class="mt-1 block text-[11px] text-[#8a94ab]">{ipucu}</span>' if ipucu else ""}</label>'''


def bolum(no, baslik, icerik):
    return f'''<section class="rounded-2xl border border-[#e4e4e7] bg-white p-5"><p class="text-[11px] font-bold uppercase tracking-[0.16em] text-[#1d428a]/70">{no}</p><h3 class="text-[15px] font-bold text-[#14213d]">{baslik}</h3><div class="mt-3 grid grid-cols-2 gap-3">{icerik}</div></section>'''


asama = "".join(f'<span class="rounded-lg px-2.5 py-1.5 text-[11px] font-bold {"bg-[#1d428a] text-white" if d == 2 else ("bg-[#edf1fe] text-[#1d428a]" if d == 1 else "border border-[#e4e4e7] text-[#8a94ab]")}">{ad}</span>' for ad, _, d in ADIMLAR)

admin = f'''<figure class="flex flex-col items-center">
<figcaption class="mb-3 text-sm font-bold text-[#12295a]">4 · Admin → Fiyat teklifleri → TKF-2026-0142 → Umre dosyası (satışı yapan kişi doldurur)</figcaption>
<div class="w-[1180px] overflow-hidden rounded-2xl border border-[#e4e4e7] bg-[#f6f6f7] shadow-2xl">
  <div class="flex h-12 items-center gap-3 border-b border-[#e4e4e7] bg-white px-5"><img src="{LOGO}" class="h-7"><span class="rounded bg-[#fbf4e1] px-2 py-0.5 text-[10px] font-bold text-[#8a6a1c]">ADMIN</span><span class="ml-6 text-[13px] text-[#5b6680]">Satış › Fiyat teklifleri › TKF-2026-0142</span></div>
  <div class="grid grid-cols-[1fr_360px] gap-5 p-6">
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div><p class="text-[10px] font-bold uppercase tracking-widest text-[#236b40]">Teklif onaylandı → umre dosyası</p><h2 class="text-[22px] font-bold text-[#1d428a]">HUG-2026-0142 · Ahmet Yılmaz</h2>
        <p class="mt-0.5 flex items-center gap-1.5 text-[12px] text-[#236b40]">{ikon("onay", 14, "#236b40")} Üye hesabıyla eşleşti (telefon) · müşteri profilinde görüyor</p></div>
        <span class="rounded-xl bg-[#1d428a] px-5 py-2.5 text-[13px] font-bold text-white">Kaydet</span>
      </div>
      {bolum("01", "Durum", f'<div class="col-span-2 flex flex-wrap gap-1.5">{asama}</div><label class="col-span-2 flex items-center gap-2 text-[12px] text-[#14213d]"><span class="flex h-4 w-4 items-center justify-center rounded bg-[#1d428a]">{ikon("onay", 11, "white")}</span>Durum değişince müşteriye e-posta gönder</label>')}
      {bolum("02", "Yolculuk", alan("Gidiş", "14 Kasım 2026") + alan("Dönüş", "24 Kasım 2026") + alan("Uçuş (gidiş)", '<span class="text-[#8a94ab]">Müşteri ekleyecek · ya da siz yazın</span>', True))}
      {bolum("03", "Konaklama", alan("Mekke oteli", "Örnek Otel Mekke ▾", ipucu="Otel rehberinden seçilir; harita ve uzaklık otomatik gelir") + alan("Mekke · giriş / çıkış · onay no", "14 → 20 Kas · 88412") + alan("Medine oteli", "Örnek Otel Medine ▾") + alan("Medine · giriş / çıkış · onay no", "20 → 24 Kas · 51907"))}
      {bolum("04", "Karşılama ve ulaşım", alan("Karşılama noktası", "Cidde Havalimanı · Hac Terminali ▾") + alan("Karşılayan kişi · telefon", "Mustafa Bey · +966 5x xxx xx xx") + alan("Tren", "20 Kas · 10:30 · Mekke → Medine", True))}
      {bolum("05", "Ödeme", alan("Toplam", "4.000 $") + alan("Ödenen", "2.400 $") + alan("Kalan için son tarih", "7 Kasım 2026", True))}
      {bolum("06", "Belgeler", '<div class="col-span-2 rounded-xl border-2 border-dashed border-[#d7e0f0] p-4 text-center text-[12px] text-[#5b6680]">PDF ya da fotoğrafı sürükleyin · Vize · Otel belgesi · Tren bileti</div>' + "".join(f'<div class="flex items-center gap-2 rounded-xl bg-[#edf1fe]/60 px-3 py-2 text-[12px] text-[#14213d]">{ikon(i, 15, "#1d428a")}{ad}</div>' for i, ad in [("vize", "vize-ahmet-ayse.pdf"), ("otel", "voucher-mekke.pdf")]))}
      {bolum("07", "Müşteriye not", '<div class="col-span-2 rounded-xl border border-[#e4e4e7] bg-white px-3 py-2 text-[13px] text-[#14213d]">İhram için Mikat\'tan önce niyet edin; havalimanında Mustafa Bey çıkışta isminizin yazılı olduğu kartla bekleyecek.</div>')}
    </div>
    <aside class="space-y-3">
      <p class="text-[11px] font-bold uppercase tracking-[0.16em] text-[#5b6680]">Müşteri böyle görecek</p>
      <div class="overflow-hidden rounded-[26px] bg-[#edf1fe] ring-1 ring-[#b8c9e3]">
        <div class="deep p-4 text-white"><p class="text-[10px] font-bold tracking-[0.2em] text-[#f2dda6]">HUG-2026-0142</p><p class="text-[18px] font-bold">14 – 24 Kasım <em class="serif text-[#f2dda6]">umreniz</em></p></div>
        <div class="space-y-2 p-3">{plan_kart("transfer", "Karşılama", "Cidde Havalimanı", "Mustafa Bey karşılayacak")}{plan_kart("otel", "Mekke · 6 gece", "Örnek Otel Mekke", "Onay no 88412")}</div>
      </div>
      <div class="rounded-2xl border border-[#e4e4e7] bg-white p-4 text-[12px] leading-relaxed text-[#5b6680]"><b class="text-[#14213d]">Eşleşme:</b> teklifteki telefon ya da e-posta bir üyeninkiyle aynıysa dosya kendiliğinden o profile düşer. Değilse müşteri teklif numarasıyla bağlar.</div>
    </aside>
  </div>
</div>
</figure>'''


# ─── Masaüstü görünümleri ──────────────────────────────────────────────────
def tarayici(etiket, govde):
    return f"""<figure class="flex flex-col items-center">
<figcaption class="mb-3 text-sm font-bold text-[#12295a]">{etiket}</figcaption>
<div class="w-[1240px] overflow-hidden rounded-2xl border border-[#d7e0f0] bg-[#edf1fe] shadow-2xl">
  <div class="flex h-9 items-center gap-2 bg-[#e9edf5] px-4"><span class="h-3 w-3 rounded-full bg-[#f87171]"></span><span class="h-3 w-3 rounded-full bg-[#fbbf24]"></span><span class="h-3 w-3 rounded-full bg-[#34d399]"></span><span class="ml-4 rounded-md bg-white px-3 py-0.5 text-[11px] text-[#5b6680]">hadiumreyegidelim.com/profil</span></div>
  <div class="flex h-16 items-center justify-between bg-white px-10 shadow-sm"><img src="{LOGO}" class="h-9">
    <div class="flex gap-8 font-['Noto_Serif'] text-[14px] text-[#3d4a66]"><span>Paketler</span><span>Bireysel Tasarım</span><span>Rehberler</span><span>Blog</span><span>İletişim</span></div>
    <div class="flex items-center gap-4">{ikon("bireysel", 22, "#1d428a")}<span class="rounded-full bg-[#1d428a] px-5 py-2 text-sm font-bold text-white">Niyet Et</span></div></div>
  {govde}
</div></figure>"""


def ust_masa(baslik, aktif, alt=""):
    sekmeler = [("kabe", "Özet"), ("paket", "Umrelerim"), ("fiyat", "Teklifler"), ("rehber", "Kitaplık"), ("bireysel", "Hesap")]
    tabs = "".join(
        f'<span class="flex items-center gap-2 rounded-t-2xl px-5 py-3 text-[14px] font-bold {"bg-[#edf1fe] text-[#1d428a]" if ad == aktif else "text-white/75"}">'
        f'{ikon(i, 18, "#1d428a" if ad == aktif else "#f2dda6")}{ad}</span>' for i, ad in sekmeler)
    return f"""<div class="deep relative overflow-hidden px-14 pt-10 text-white">
  <span class="hat absolute -bottom-10 right-16 text-[11rem] leading-none text-white/[0.05]">لبيك</span>
  <p class="text-[11px] font-bold uppercase tracking-[0.24em] text-[#f2dda6]">Hesabım</p>
  <h1 class="mt-2 text-[40px] font-bold leading-tight">{baslik}</h1>{alt}
  <div class="mt-8 flex gap-1">{tabs}</div>
</div>"""


ozet_masa = ust_masa('Hayırlı akşamlar, <em class="serif text-[#f2dda6]">Ahmet</em>', "Özet", '<p class="mt-1 text-sm text-white/70">ahmet@ornek.com</p>') + f"""
<div class="grid grid-cols-[1.45fr_1fr] gap-5 px-14 py-10">
  <div class="relative overflow-hidden rounded-[28px] bg-white p-8 ring-1 ring-[#b8c9e3]/60">
    <span class="hat absolute -bottom-10 -right-2 text-[9rem] leading-none text-[#1d428a]/[0.05]">عمرة</span>
    <div class="flex items-center justify-between"><p class="text-[11px] font-bold uppercase tracking-[0.22em] text-[#1d428a]/60">Yaklaşan umreniz · HUG-2026-0142</p><span class="rounded-full bg-[#fbf4e1] px-3 py-1 text-[12px] font-bold text-[#8a6a1c]">Vize çıktı</span></div>
    <div class="mt-4 flex items-end gap-6">
      <div class="flex items-end gap-2"><b class="text-[80px] font-bold leading-none text-[#1d428a]">23</b><span class="mb-3 text-[18px] font-semibold text-[#3d4a66]">gün kaldı</span></div>
      <div class="mb-3 border-l border-[#e1e6ef] pl-6 text-[14px] text-[#5b6680]"><b class="block text-[16px] text-[#14213d]">14 – 24 Kasım 2026</b>2 yetişkin · 6 gece Mekke · 4 gece Medine</div>
    </div>
    <div class="mt-6">{mini_adimlar()}</div>
    <div class="mt-2 flex justify-between text-[11px] text-[#8a94ab]">{"".join(f"<span>{ad}</span>" for ad, _, _ in ADIMLAR)}</div>
    <div class="mt-6 grid grid-cols-3 gap-3">
      {plan_kart("transfer", "Karşılama", "Cidde Havalimanı", "Mustafa Bey")}
      {plan_kart("otel", "Mekke · 6 gece", "Örnek Otel Mekke", "Kâbe'ye 650 m")}
      {plan_kart("medine", "Medine · 4 gece", "Örnek Otel Medine", "Harem'e 300 m")}
    </div>
    <div class="mt-6 flex gap-3"><span class="flex items-center gap-2 rounded-2xl bg-[#1d428a] px-6 py-3.5 text-[15px] font-bold text-white">{ikon("paket", 18, "#f2dda6")}Dosyamı aç</span><span class="flex items-center gap-2 rounded-2xl border border-[#b8c9e3] px-6 py-3.5 text-[15px] font-bold text-[#1d428a]">{ikon("mesaj", 18, "#1d428a")}WhatsApp'tan sorun</span></div>
  </div>
  <div class="space-y-5">
    <div class="rounded-[28px] bg-[#fbf4e1] p-6 ring-1 ring-[#f2dda6]">
      <p class="flex items-center gap-2 text-[14px] font-bold text-[#5a4612]">{ikon("bilgi", 18, "#b8862f")} Sizden beklenen 1 adım</p>
      <div class="mt-4 flex items-center gap-3 rounded-2xl bg-white p-4"><span class="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf1fe]">{ikon("ucak", 22, "#1d428a")}</span><div class="flex-1"><p class="text-[14px] font-bold text-[#14213d]">Uçuş bilgilerinizi ekleyin</p><p class="text-[12px] text-[#5b6680]">Karşılama saatiniz buna göre ayarlanır</p></div>{ikon("ok", 18, "#1d428a")}</div>
    </div>
    <div class="rounded-[28px] bg-white p-6 ring-1 ring-[#b8c9e3]/60">
      <div class="flex items-center justify-between"><p class="text-[14px] font-bold text-[#14213d]">Yanıt bekleyen teklif</p><span class="text-[13px] font-bold text-[#1d428a]">Tümü →</span></div>
      <p class="mt-3 text-[11px] font-bold tracking-[0.12em] text-[#8a94ab]">TKF-2026-0187</p><p class="text-[16px] font-bold text-[#14213d]">Ramazan umresi · 4 kişi</p><p class="text-[13px] text-[#5b6680]">8 – 18 Mart 2027 · 9.800 $ · 2 gün içinde geçerli</p>
      <div class="mt-4 flex gap-2"><span class="flex-1 rounded-xl bg-[#1d428a] py-2.5 text-center text-[13px] font-bold text-white">Onaylıyorum</span><span class="rounded-xl border border-[#b8c9e3] px-4 py-2.5 text-[13px] font-bold text-[#1d428a]">PDF</span></div>
    </div>
  </div>
  <div class="col-span-2 grid grid-cols-[1.45fr_1fr] gap-5">
    <div class="flex items-center gap-6 rounded-[28px] bg-white p-6 ring-1 ring-[#b8c9e3]/60">
      <div class="relative h-28 w-40 shrink-0"><img src="{KAPAK_T}" class="absolute left-0 top-1 w-20 -rotate-6 rounded-md shadow-lg"><img src="{KAPAK_S}" class="absolute left-14 top-0 w-20 rotate-6 rounded-md shadow-lg"></div>
      <div><p class="text-[11px] font-bold uppercase tracking-[0.22em] text-[#1d428a]/60">Kitaplığınız</p><p class="mt-1 text-[20px] font-bold text-[#1d428a]">Tavaf ve Sa'y El Kitabı</p><p class="text-[13px] text-[#5b6680]">Harem'de telefonunuzdan şavt modunda, büyük yazıyla okuyun.</p><p class="mt-2 text-[13px] font-bold text-[#1d428a]">Kitaplığa git →</p></div>
    </div>
    <div class="deep relative overflow-hidden rounded-[28px] p-6 text-white"><span class="hat absolute -bottom-8 -left-1 text-[7rem] leading-none text-white/[0.06]">رمضان</span><p class="text-[11px] font-bold uppercase tracking-[0.22em] text-[#f2dda6]">Size uygun · Kampanya</p><p class="mt-2 text-[22px] font-bold leading-snug">Ramazan 2027 umresi <em class="serif text-[#f2dda6]">erken kayıt</em></p><p class="mt-1 text-[13px] text-white/75">Son 10 gün oteller dolmadan yerinizi ayırtın.</p><span class="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#f2dda6] px-4 py-2 text-[13px] font-bold text-[#12295a]">İncele {ikon("ok", 14, "#12295a")}</span></div>
  </div>
</div>"""


dosya_masa = f"""<div class="deep relative overflow-hidden px-14 pb-8 pt-8 text-white">
  <span class="hat absolute -bottom-12 right-16 text-[11rem] leading-none text-white/[0.05]">عمرة</span>
  <p class="flex items-center gap-1.5 text-[13px] text-white/70">{ikon("ok", 14, "rgba(255,255,255,.7)", "rotate-180")} Umrelerim</p>
  <div class="mt-4 flex items-end justify-between">
    <div><p class="text-[11px] font-bold uppercase tracking-[0.24em] text-[#f2dda6]">Umre dosyası · HUG-2026-0142</p><h1 class="mt-1 text-[40px] font-bold leading-tight">14 – 24 Kasım <em class="serif text-[#f2dda6]">umreniz</em></h1><p class="text-[14px] text-white/75">2 yetişkin · 6 gece Mekke · 4 gece Medine · Önce Mekke</p></div>
    <div class="flex items-center gap-5 rounded-2xl bg-white/10 px-6 py-4 ring-1 ring-white/15"><div><b class="text-[44px] font-bold leading-none">23</b><span class="ml-2 text-white/75">gün kaldı</span></div><span class="flex items-center gap-2 rounded-xl bg-[#f2dda6] px-4 py-2.5 text-[13px] font-bold text-[#12295a]">{ikon("mesaj", 16, "#12295a")}Dosyam hakkında yaz</span></div>
  </div>
</div>
<div class="grid grid-cols-[360px_1fr] gap-6 px-14 py-10">
  <aside class="space-y-5">
    <div class="rounded-[28px] bg-white p-6 ring-1 ring-[#b8c9e3]/60"><div class="flex items-center justify-between"><p class="text-[14px] font-bold text-[#14213d]">Dosyanızın durumu</p><span class="text-[11px] text-[#8a94ab]">11 Eki</span></div>{zaman_cizelgesi()}</div>
    <div class="rounded-[28px] bg-white p-6 ring-1 ring-[#b8c9e3]/60"><p class="text-[14px] font-bold text-[#14213d]">Ödeme</p><div class="mt-3 h-2 overflow-hidden rounded-full bg-[#edf1fe]"><div class="h-full w-[60%] rounded-full bg-[#1d428a]"></div></div><div class="mt-2 flex justify-between text-[13px]"><span class="text-[#5b6680]">Ödenen <b class="text-[#14213d]">2.400 $</b></span><span class="text-[#5b6680]">Kalan <b class="text-[#14213d]">1.600 $</b></span></div><p class="mt-1 text-[12px] text-[#8a94ab]">Toplam 4.000 $ · Kalan tutar 7 Kasım'a kadar</p></div>
  </aside>
  <div class="space-y-5">
    <div class="rounded-[28px] bg-[#fbf4e1] p-5 ring-1 ring-[#f2dda6]"><div class="flex items-center gap-4"><span class="flex h-11 w-11 items-center justify-center rounded-xl bg-white">{ikon("ucak", 22, "#1d428a")}</span><div class="flex-1"><p class="text-[14px] font-bold text-[#5a4612]">Uçuş bilgilerinizi ekleyin</p><p class="text-[13px] text-[#8a6a1c]">Karşılama saatiniz buna göre ayarlanır.</p></div><span class="rounded-xl bg-[#1d428a] px-4 py-2.5 text-[13px] font-bold text-white">Uçuş bilgisi ekle</span></div></div>
    <div class="rounded-[28px] bg-white p-6 ring-1 ring-[#b8c9e3]/60">
      <p class="text-[14px] font-bold text-[#14213d]">Yolculuk planı</p>
      <div class="mt-4 grid grid-cols-2 gap-3">
        {plan_kart("ucak", "14 Kas · Gidiş", "İstanbul → Cidde", "Uçuş bilgileriniz henüz eklenmedi")}
        {plan_kart("transfer", "14 Kas · Karşılama", "Cidde Havalimanı, Hac Terminali", "Sizi Mustafa Bey karşılayacak · özel araç ile otele", '<span class="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-[#e8f3ec] px-3 py-1.5 text-[11px] font-bold text-[#2f7d55]">' + ikon("mesaj", 13, "#2f7d55") + "WhatsApp'tan yazın</span>")}
        {plan_kart("otel", "14 – 20 Kas · Mekke · 6 gece", "Örnek Otel Mekke", "Kâbe'ye 650 m yürüme · Onay no: 88412", '<span class="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#1d428a]">' + ikon("konum", 13, "#1d428a") + "Haritada ve rehberde gör</span>")}
        {plan_kart("tren", "20 Kas · Haremeyn treni", "Mekke → Medine, 10:30", "Ekonomi · 2 bilet · istasyona transfer dahil")}
        {plan_kart("medine", "20 – 24 Kas · Medine · 4 gece", "Örnek Otel Medine", "Mescid-i Nebevi'ye 300 m · Onay no: 51907")}
        {plan_kart("ucak", "24 Kas · Dönüş", "Medine Havalimanı", "Otelden havalimanına transfer")}
      </div>
    </div>
    <div class="grid grid-cols-2 gap-5">
      <div class="rounded-[28px] bg-white p-6 ring-1 ring-[#b8c9e3]/60"><p class="text-[14px] font-bold text-[#14213d]">Belgeleriniz</p><div class="mt-2 divide-y divide-[#e1e6ef]">{"".join(f'<div class="flex items-center gap-3 py-2.5">{ikon(i, 18, "#1d428a")}<p class="flex-1 text-[13px] text-[#14213d]">{ad}</p><span class="text-[12px] font-bold text-[#1d428a]">İndir</span></div>' for i, ad in [("vize", "Umre vizesi (2 kişi)"), ("otel", "Otel belgesi · Mekke"), ("otel", "Otel belgesi · Medine"), ("tren", "Tren biletleri")])}</div></div>
      <div class="rounded-[28px] bg-white p-6 ring-1 ring-[#b8c9e3]/60"><p class="text-[14px] font-bold text-[#14213d]">Ekibimizden not</p><p class="mt-2 font-['Noto_Serif'] text-[15px] italic leading-relaxed text-[#1d428a]">İhram için Mikat'tan önce niyet edin; havalimanında Mustafa Bey çıkışta isminizin yazılı olduğu kartla bekleyecek.</p><p class="mt-4 flex items-center gap-2 text-[13px] font-bold text-[#1d428a]">{ikon("rehber", 17, "#1d428a")} Hazırlık listesi ve şavt modu kitaplığınızda</p></div>
    </div>
  </div>
</div>"""


HTML = f'''<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>Profil 2 · Tasarım taslağı</title>
<script src="https://cdn.tailwindcss.com/3.4.17"></script>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Noto+Serif:ital@1&family=Aref+Ruqaa&display=block" rel="stylesheet">
<style>
body {{ font-family: Cairo, sans-serif; background: #f4f6fb; }}
.serif {{ font-family: "Noto Serif", Georgia, serif; font-style: italic; font-weight: 400; }}
.hat {{ font-family: "Aref Ruqaa", serif; direction: rtl; pointer-events: none; position: absolute; }}
.deep {{ background: linear-gradient(135deg, #12295a 0%, #1d428a 100%); }}
</style></head><body class="p-10">
<header class="mx-auto mb-10 max-w-[1260px]">
  <p class="text-xs font-bold uppercase tracking-[0.24em] text-[#1d428a]/60">Tasarım taslağı · örnek verilerle · kod değil</p>
  <h1 class="mt-2 text-4xl font-bold text-[#1d428a]">Profil 2: <em class="serif">umrenin takibi</em></h1>
  <p class="mt-2 max-w-3xl text-[15px] text-[#5b6680]">Müşteri satın aldığı umrenin her adımını, otelini, karşılayan kişiyi, belgelerini ve ödemesini profilinde görür; yeni teklifleri profilinden onaylar. Puan ve hoş geldin hediyesi bu sürümde yok.</p>
</header>
<div class="mx-auto flex max-w-[1260px] flex-wrap items-start justify-center gap-10">
  {telefon("1 · Profil özeti", ozet)}
  {telefon("2 · Umre dosyası", dosya, 1700)}
  {telefon("3 · Tekliflerim", teklifler)}
</div>
<div class="mx-auto mt-16 flex max-w-[1260px] flex-col items-center gap-14">{tarayici("5 · Masaüstü · Profil özeti", ozet_masa)}{tarayici("6 · Masaüstü · Umre dosyası", dosya_masa)}</div>
<div class="mx-auto mt-14 flex max-w-[1260px] justify-center">{admin}</div>
</body></html>'''

(HERE / "taslak.html").write_text(HTML, encoding="utf-8")
print("yazıldı:", HERE / "taslak.html")
