#!/usr/bin/env python3
"""Harem Dua Haritası kitapçığı PDF üreticisi (16 Ekim 2026).

Tavaf ve Sa'y El Kitabı ile aynı kimlik (lacivert, kum, Cairo + Noto Serif + Amiri). İçerik tek kaynaktan gelir:
icerik.docx (Word; kullanıcının "Harem Dua Haritası — Tam Sürüm" belgesi). Metin düzeltmeleri Word'de yapılır,
sonra bu betik yeniden çalıştırılır. Belgedeki kroki görseli kullanılmaz; yerine harita.py'deki SVG çizilir.

Görseller: img/ (Pexels, ücretsiz lisans; kimlikler img/KAYNAK.txt).
Çıktı: public/indir/harem-dua-haritasi-2026.pdf

Çalıştır: python3 scripts/pdf/dua-haritasi/uret.py
"""
import html
import pathlib
import re
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import docx_oku  # noqa: E402
import harita  # noqa: E402

ROOT = HERE.parents[2]
OUT_HTML = HERE / "dua-haritasi.html"
OUT_PDF = ROOT / "public" / "indir" / "harem-dua-haritasi-2026.pdf"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

e = lambda s: html.escape(s, quote=False)
ARAP = re.compile(r"[؀-ۿ]")
DERECE = {"sahih": "sahih", "hasen": "hasen", "hasen sahih": "hasen", "sahih / hasen": "hasen", "zayıf": "zayif"}
DERECE_AD = {"kuran": "Kur'an", "sahih": "Sahih", "hasen": "Hasen", "zayif": "Zayıf", "alim": "Âlimlerin bildirdiği"}
# Belgedeki bariz yazım hataları (anlamı değiştirmeyen)
DUZELT = [("yatı namazından", "yatsı namazından")]

KISIM_FOTO = {
    "Birinci": ("harem-gece.jpg", "50% 60%"), "İkinci": ("kabe-ihram.jpg", "50% 55%"), "Üçüncü": ("kabe-ust.jpg", "50% 45%"),
    "Dördüncü": ("kabe-saat.jpg", "50% 30%"), "Beşinci": ("kabe-kalabalik.jpg", "50% 50%"), "Altıncı": ("harem-genis.jpg", "50% 50%"),
    "Yedinci": ("kabe-yakin.jpg", "50% 40%"),
}
KISIM_NO = {"Birinci": 1, "İkinci": 2, "Üçüncü": 3, "Dördüncü": 4, "Beşinci": 5, "Altıncı": 6, "Yedinci": 7}


# ─── Satır içi biçim ───────────────────────────────────────────────────────
def rozet(tur, metin=None):
    return f'<span class="rz rz-{tur}">{e(metin or DERECE_AD[tur])}</span>'


def satir_ici(runs):
    out = []
    for metin, b, i, href in runs:
        for a, z in DUZELT:
            metin = metin.replace(a, z)
        anahtar = metin.strip().lower()
        if b and anahtar in DERECE:
            out.append(rozet(DERECE[anahtar], metin.strip()))
            continue
        h = e(metin)
        if href:
            h = f'<a href="{e(href)}">{h}</a>'
        if b:
            h = f"<b>{h}</b>"
        if i:
            h = f"<i>{h}</i>"
        out.append(h)
    return "".join(out)


def kaynak_ayir(h):
    """Sondaki (kaynak) parantezini ayırır: (metin, kaynak) döner."""
    m = re.search(r"\s*\(((?:[^()]|\([^()]*\))*)\)[.:]?\s*$", h)
    if not m or len(m.group(1)) > 160:
        return h, ""
    return h[: m.start()], m.group(1)


def kaynak_html(k):
    if not k:
        return ""
    ek = rozet("kuran") if ("Suresi" in k and "rz-" not in k) else ""
    return f'<span class="cite">{k}</span>{ek}'


def bold_bas(b):
    """Paragraf kalın bir etiketle başlıyorsa (etiket, kalan runs) döner."""
    r = b["runs"]
    if r and r[0][1] and len(r[0][0]) < 90 and r[0][0].strip().lower() not in DERECE:
        return r[0][0].strip(), r[1:]
    return None, r


def arapca_mi(b):
    t = docx_oku.duz(b)
    return len(ARAP.findall(t)) > len(t.replace(" ", "")) * 0.5


def okunus_mu(b):
    r = b.get("runs") or []
    return bool(r) and r[0][2] and not r[0][1] and not ARAP.search(r[0][0])


def tum_italik(b):
    return all(r[2] for r in b["runs"] if r[0].strip())


def dua_karti(etiket, ar, ok):
    """etiket (str|None), ar (blok|None), ok (blok|None) → dua kartı."""
    p = ['<div class="dua">']
    if etiket:
        p.append(f'<p class="dua-et">{e(etiket.rstrip(":"))}</p>')
    if ar:
        p.append(f'<p class="ar">{e(docx_oku.duz(ar))}</p>')
    if ok:
        okunus = ok["runs"][0][0].strip()
        kalan, kaynak = kaynak_ayir(satir_ici(ok["runs"][1:]).strip())
        p.append(f'<p class="okunus">{e(okunus)}</p>')
        if kalan:
            p.append(f'<p class="anlam">{kalan}</p>')
        if kaynak:
            p.append(f'<p class="dua-k">{kaynak_html(kaynak)}</p>')
    p.append("</div>")
    return "".join(p)


# ─── Bloğu HTML'e çevir (bağlama göre) ─────────────────────────────────────
def isle(bloklar, baglam=""):
    """Bir alt bölümün bloklarını sırayla işler. baglam: h3 başlığı."""
    out = []
    i = 0
    acik = None  # açık liste kabı

    def kapat():
        nonlocal acik
        if acik:
            out.append({"ul": "</ul>", "ol": "</ol>", "check": "</div>", "facts": "</div>", "quotes": "</div>", "munacat": "</div>"}[acik])
            acik = None

    def ac(tur, html_ac):
        nonlocal acik
        if acik != tur:
            kapat()
            out.append(html_ac)
            acik = tur

    while i < len(bloklar):
        b = bloklar[i]
        t = b["t"]
        if t == "table":
            kapat()
            out.append(tablo(b["rows"], baglam))
            i += 1
            continue
        if t == "img":
            i += 1
            continue
        duz = docx_oku.duz(b).strip()
        etiket, kalan = bold_bas(b)

        # Dua grubu: [etiket:] [arapça] [okunuş]
        if t in ("p", "li") and etiket and duz.endswith(":") and len(b["runs"]) == 1:
            ar = bloklar[i + 1] if i + 1 < len(bloklar) and arapca_mi(bloklar[i + 1]) else None
            j = i + (2 if ar else 1)
            ok = bloklar[j] if j < len(bloklar) and okunus_mu(bloklar[j]) else None
            if ar or ok:
                kapat()
                out.append(dua_karti(etiket, ar, ok))
                i = j + (1 if ok else 0)
                continue
        if arapca_mi(b):
            ok = bloklar[i + 1] if i + 1 < len(bloklar) and okunus_mu(bloklar[i + 1]) else None
            kapat()
            out.append(dua_karti(None, b, ok))
            i += 2 if ok else 1
            continue

        if baglam.startswith("Münâcât") or (t == "p" and tum_italik(b) and len(duz) > 120):
            ac("munacat", '<div class="munacat">')
            cls = "m-not" if duz.startswith("(") else ""
            out.append(f'<p class="{cls}">{e(duz)}</p>')
            i += 1
            continue

        if t == "quote":
            kapat()
            if etiket:
                out.append(f'<div class="not"><b>{e(etiket)}</b> {satir_ici(kalan)}</div>')
            else:
                metin, k = kaynak_ayir(satir_ici(b["runs"]))
                out.append(f'<blockquote class="ayet"><p>{metin}</p>{kaynak_html(k)}</blockquote>')
            i += 1
            continue

        if t == "li":
            if duz.startswith("☐"):
                ac("check", '<div class="check">')
                runs = [(b["runs"][0][0].lstrip("☐ ").lstrip(),) + b["runs"][0][1:]] + b["runs"][1:]
                out.append(f'<div class="ck"><span class="kutu"></span><p>{satir_ici(runs)}</p></div>')
            elif baglam.startswith("Nerede") and etiket:
                ac("facts", '<div class="facts">')
                out.append(f'<div class="fact"><p class="f-et">{e(etiket.rstrip(":"))}</p><p>{satir_ici(kalan).strip()}</p></div>')
            elif baglam.startswith(("Ayetler", "Hadis-i")) and not etiket:
                ac("quotes", '<div class="quotes">')
                metin, k = kaynak_ayir(satir_ici(b["runs"]))
                out.append(f'<div class="q"><p>{metin}</p>{kaynak_html(k)}</div>')
            elif b.get("num") == "decimal":
                ac("ol", '<ol class="say">')
                out.append(f"<li>{satir_ici(b['runs'])}</li>")
            else:
                ac("ul", '<ul class="mad">')
                out.append(f"<li>{satir_ici(b['runs'])}</li>")
            i += 1
            continue

        kapat()
        if etiket and etiket.endswith(":") and etiket.rstrip(":") in ("Dayanağı", "Harem'de"):
            cls = "an-harem" if etiket.startswith("Harem") else "an-dayanak"
            out.append(f'<div class="an-sat {cls}"><p class="an-et">{e(etiket.rstrip(":"))}</p><p>{satir_ici(kalan).strip()}</p></div>')
        elif etiket and baglam.startswith("Duayı engelleyen"):
            out.append(f'<div class="engel"><p class="en-et">{e(etiket.rstrip("."))}</p><p>{satir_ici(kalan).strip()}</p></div>')
        else:
            out.append(f"<p>{satir_ici(b['runs'])}</p>")
        i += 1
    kapat()
    return "".join(out)


# ─── Tablolar ──────────────────────────────────────────────────────────────
def derece_rozet(metin):
    m = metin.lower()
    rz = []
    if "kur'an" in m:
        rz.append(rozet("kuran"))
    if "sahih" in m and "hasen" not in m:
        rz.append(rozet("sahih"))
    elif "hasen" in m:
        rz.append(rozet("hasen", "Sahih / Hasen" if "sahih" in m else "Hasen"))
    if "zayıf" in m:
        rz.append(rozet("zayif"))
    if "sahabe" in m or "geleneksel" in m:
        rz.append(rozet("alim", "Sahabe / gelenek"))
    ek = re.sub(r"(?i)^(kur'an,?\s*|sahih\s*/\s*hasen|sahih|hasen|zayıf|isnadı zayıf)[;,]?\s*", "", metin).strip(" ;,")
    if ek and ek.lower() not in ("sahih", "hasen", "zayıf", "sahabe sözü"):
        rz.append(f'<span class="cite">{e(ek)}</span>')
    return " ".join(rz)


def tablo(rows, baglam):
    bas = rows[0]
    if bas[:2] == ["İşaret", "Anlamı"]:
        tur = {"Kur'an": "kuran", "Sahih / Hasen": "hasen", "Zayıf": "zayif", "Âlimlerin bildirdiği": "alim"}
        kartlar = "".join(f'<div class="lg">{rozet(tur.get(a, "alim"), a)}<p>{e(b)}</p></div>' for a, b in rows[1:])
        return f'<div class="lejant">{kartlar}</div>'
    if bas[:2] == ["Saat", "Yoğunluk"]:
        return kalabalik(rows)
    if bas[:2] == ["Sıra", "Durak"]:
        return rota(rows)
    if bas[:2] == ["Saat", "Ne yapılır"]:
        return dua_gunu(rows)
    if bas[-1] == "Derece":
        govde = "".join(f"<tr><td>{e(a)}</td><td>{e(b)}</td><td class='k'>{e(c)}</td><td>{derece_rozet(d)}</td></tr>" for a, b, c, d in rows[1:])
        return f'<table class="tb kaynakca"><thead><tr>{"".join(f"<th>{e(h)}</th>" for h in bas)}</tr></thead><tbody>{govde}</tbody></table>'
    bos = all(not "".join(r[1:]).strip() for r in rows[1:])
    if bos:  # doldurulacak liste
        sutun = len(bas)
        genis = {2: "34mm 1fr", 3: "1fr 1.3fr 1fr"}.get(sutun, "1fr " * sutun)
        if bas[0] == "Bardak":
            satirlar = "".join(f'<div class="yaz-s" style="grid-template-columns:{genis}"><span class="bardak">{e(r[0])}</span><span></span></div>' for r in rows[1:])
        else:
            satirlar = "".join(f'<div class="yaz-s" style="grid-template-columns:{genis}">{"<span></span>" * sutun}</div>' for _ in rows[1:])
        return f'<div class="yaz"><div class="yaz-b" style="grid-template-columns:{genis}">{"".join(f"<span>{e(h)}</span>" for h in bas)}</div>{satirlar}</div>'
    govde = "".join("<tr>" + "".join(f"<td>{e(c)}</td>" for c in r) + "</tr>" for r in rows[1:])
    return f'<table class="tb"><thead><tr>{"".join(f"<th>{e(h)}</th>" for h in bas)}</tr></thead><tbody>{govde}</tbody></table>'


# ─── İnfografikler ─────────────────────────────────────────────────────────
X0, X1 = 30, 610
hx = lambda h: X0 + (X1 - X0) * h / 24
SEVIYE = {"Sakin": ("#dcefe3", "#2f7d55"), "Orta": ("#fbf0d2", "#8a6a1c"), "En yoğun": ("#f6dad3", "#b4483c")}


def saat_ekseni(y):
    s = []
    for h in range(0, 25, 3):
        s.append(f'<text x="{hx(h)}" y="{y}" font-size="9" fill="#8a94ab" text-anchor="middle">{h:02d}.00</text>')
    return "".join(s)


def kalabalik(rows):
    # Tablo: 22–04 sakin, 05–08 orta, 09–16 sakin, 17–21 en yoğun; aradaki saatler geçiş (orta) sayılır
    bant = [(0, 4, "Sakin"), (4, 5, "Orta"), (5, 8, "Orta"), (8, 9, "Orta"), (9, 16, "Sakin"), (16, 17, "Orta"), (17, 21, "En yoğun"), (21, 22, "Orta"), (22, 24, "Sakin")]
    s = ['<svg viewBox="0 0 640 132" xmlns="http://www.w3.org/2000/svg" font-family="Cairo, sans-serif">']
    for a, b, sv in bant:
        s.append(f'<rect x="{hx(a)}" y="34" width="{hx(b) - hx(a)}" height="44" fill="{SEVIYE[sv][0]}"/>')
    for a, b, sv in [(0, 4, "Sakin"), (5, 8, "Orta"), (9, 16, "Sakin"), (17, 21, "En yoğun"), (22, 24, "Sakin")]:
        s.append(f'<text x="{(hx(a) + hx(b)) / 2}" y="61" font-size="{10 if b - a > 2 else 8.5}" font-weight="700" fill="{SEVIYE[sv][1]}" text-anchor="middle">{sv}</text>')
    s.append(f'<rect x="{X0}" y="34" width="{X1 - X0}" height="44" rx="6" fill="none" stroke="#d7e0f0"/>')
    s.append(f'<path d="M{hx(1)},28 L{hx(1)},84" stroke="#1d428a" stroke-width="1.5" stroke-dasharray="3 3"/><text x="{hx(1) + 4}" y="24" font-size="9" fill="#1d428a" font-weight="700">01.00 · en sakin</text>')
    s.append(f'<path d="M{hx(2)},90 L{hx(5)},90" stroke="#1d428a" stroke-width="3" stroke-linecap="round"/><text x="{hx(3.5)}" y="104" font-size="9" fill="#1d428a" text-anchor="middle" font-weight="700">seher</text>')
    s.append(saat_ekseni(124))
    s.append("</svg>")
    notlar = "".join(f'<div class="kn"><span class="kn-s">{e(r[0])}</span>{rozet_seviye(r[1])}<span>{e(r[2])}</span></div>' for r in rows[1:])
    return f'<div class="info">{"".join(s)}<p class="info-alt">Yoğunluk, rehberdeki tabloya göre çizilmiştir; günden güne ve mevsime göre değişebilir.</p></div><div class="kalabalik">{notlar}</div>'


def rozet_seviye(sv):
    a, b = SEVIYE.get(sv, ("#edf1fe", "#1d428a"))
    return f'<span class="sv" style="background:{a};color:{b}">{e(sv)}</span>'


ROTA_DURAK = [("Harem kapısı", 1), ("Hacerü'l-Esved", 3), ("Metâf", 2), ("Mîzâb", 6), ("İki rükün", 7), ("Mültezem", 4),
              ("Makam", 8), ("Zemzem", 9), ("Safa", 10), ("Mes'â", 11), ("Merve", 12)]


def rota(rows):
    out = ['<div class="rota">']
    for sira, durak, ne, dua in rows[1:]:
        no = next((n for k, n in ROTA_DURAK if durak.startswith(k)), None)
        cip = f'<span class="r-cip">Durak {no}</span>' if no else '<span class="r-cip r-son">Umre tamam</span>'
        out.append(f'<div class="r-s"><span class="r-no">{e(sira)}</span><div><p class="r-ad">{e(durak)} {cip}</p>'
                   f'<p class="r-ne">{e(ne)}</p><p class="r-dua">{e(dua)}</p></div></div>')
    out.append("</div>")
    return "".join(out)


def dua_gunu(rows):
    out = ['<div class="gun">']
    for saat, ne, an in rows[1:]:
        out.append(f'<div class="g-s"><span class="g-saat">{e(saat)}</span><div><p class="g-ne">{e(ne)}</p><p class="g-an">{e(an)}</p></div></div>')
    out.append("</div>")
    return "".join(out)


def on_an_info():
    """Duanın kabul olduğu 10 an: vakte bağlı olanlar 24 saatlik şerit üzerinde, hâle bağlı olanlar kartlarla."""
    vakit = [(5.1, "Sabah"), (12.4, "Öğle"), (15.8, "İkindi"), (18.3, "Akşam"), (19.8, "Yatsı")]
    s = ['<svg viewBox="0 0 640 196" xmlns="http://www.w3.org/2000/svg" font-family="Cairo, sans-serif">']
    s.append(f'<rect x="{X0}" y="92" width="{X1 - X0}" height="16" rx="8" fill="#edf1fe"/>')
    s.append(f'<rect x="{hx(0)}" y="92" width="{hx(5.6) - hx(0)}" height="16" rx="8" fill="#d6dff0"/><rect x="{hx(19)}" y="92" width="{hx(24) - hx(19)}" height="16" rx="8" fill="#d6dff0"/>')
    # Seher (An 3)
    s.append(f'<path d="M{hx(2.2)},80 L{hx(5)},80" stroke="#1d428a" stroke-width="4" stroke-linecap="round"/>')
    s.append(f'<text x="{hx(3.6)}" y="70" font-size="10" font-weight="700" fill="#1d428a" text-anchor="middle">3 · Seher</text>')
    s.append(f'<text x="{hx(3.6)}" y="58" font-size="8.5" fill="#5b6680" text-anchor="middle">gecenin son üçte biri</text>')
    for h, ad in vakit:
        s.append(f'<circle cx="{hx(h)}" cy="100" r="7" fill="#1d428a"/><circle cx="{hx(h)}" cy="100" r="2.5" fill="#f2dda6"/>')
        s.append(f'<text x="{hx(h)}" y="126" font-size="9.5" font-weight="700" fill="#14213d" text-anchor="middle">{ad}</text>')
    # Ezan–kamet ve farz arkası (An 1, An 4)
    s.append(f'<path d="M{hx(12.4) - 14},44 L{hx(12.4) - 3},92" stroke="#6f8fc6" stroke-width="1.2"/><path d="M{hx(12.4) + 14},44 L{hx(12.4) + 3},92" stroke="#6f8fc6" stroke-width="1.2"/>')
    s.append(f'<text x="{hx(12.4) - 16}" y="38" font-size="9.5" font-weight="700" fill="#1d428a" text-anchor="end">1 · Ezan ile kamet arası</text>')
    s.append(f'<text x="{hx(12.4) + 16}" y="38" font-size="9.5" font-weight="700" fill="#1d428a">4 · Farz namazın ardından</text>')
    s.append(f'<text x="{hx(12.4)}" y="24" font-size="8.5" fill="#5b6680" text-anchor="middle">her vakitte</text>')
    # İftar (An 6) ve Cuma (An 5)
    s.append(f'<path d="M{hx(18.3)},132 L{hx(18.3)},150" stroke="#2f7d55" stroke-width="1.2"/><text x="{hx(18.3)}" y="162" font-size="9.5" font-weight="700" fill="#2f7d55" text-anchor="middle">6 · İftar anı</text>')
    s.append(f'<path d="M{hx(15.8)},140 L{hx(18.3) - 4},140" stroke="#c9a24a" stroke-width="4" stroke-linecap="round"/>')
    s.append(f'<text x="{hx(15.8) - 6}" y="144" font-size="9.5" font-weight="700" fill="#8a6a1c" text-anchor="end">5 · Cuma: ikindiden akşama</text>')
    s.append(saat_ekseni(188))
    s.append("</svg>")
    hal = [("2", "Secde", "Kulun Rabbine en yakın anı"), ("7", "Yağmur", "Rahmetin yeni indiği an"),
           ("8", "Yolcu ve misafir", "Evden çıktığınız andan dönene kadar"), ("9", "Zemzem", "Her bardak bir niyet"),
           ("10", "Gıyabi dua", "Melek \"sana da\" der")]
    kart = "".join(f'<div class="hal"><span>{n}</span><b>{e(a)}</b><p>{e(b)}</p></div>' for n, a, b in hal)
    return (f'<div class="info"><p class="info-bas">Vakte bağlı anlar</p>{"".join(s)}'
            f'<p class="info-alt">Namaz saatleri Mekke için yaklaşıktır; mevsime göre değişir.</p>'
            f'<p class="info-bas" style="margin-top:10pt">Hâle bağlı anlar · günün her saatinde</p><div class="haller">{kart}</div></div>')


def bakista():
    """Önsözden sonra: rehber bir bakışta."""
    oran = 18 / 22
    import math
    r = 52
    cevre = 2 * math.pi * r
    halka = (f'<svg viewBox="0 0 140 140" class="halka"><circle cx="70" cy="70" r="{r}" fill="none" stroke="#f2dda6" stroke-width="16"/>'
             f'<circle cx="70" cy="70" r="{r}" fill="none" stroke="#1d428a" stroke-width="16" stroke-dasharray="{cevre * oran:.1f} {cevre:.1f}" transform="rotate(-90 70 70)"/>'
             f'<text x="70" y="70" font-family="Cairo" font-size="30" font-weight="700" fill="#1d428a" text-anchor="middle">18</text>'
             f'<text x="70" y="90" font-family="Cairo" font-size="11" fill="#5b6680" text-anchor="middle">22 dayanaktan</text></svg>')
    rota_seridi = "".join(
        f'<div class="ser-d"><span class="ser-no">{n}</span><span class="ser-ad">{e(harita.ADLAR[n])}</span></div>'
        for n in (1, 3, 2, 6, 7, 4, 8, 9, 10, 11, 12))
    return f"""
<section class="sayfa bakista">
  <p class="kicker">Rehber bir bakışta</p>
  <h1>Şerefli yerler, <em>şerefli anlar</em></h1>
  <div class="rule"></div>
  <div class="sayilar">
    <div><b>12</b><span>dua durağı</span><p>Kâbe'nin ilk göründüğü andan Merve'ye</p></div>
    <div><b>10</b><span>kabul anı</span><p>Sahih ve hasen hadislerle sabit vakit ve haller</p></div>
    <div><b>7</b><span>adımda bir dua</span><p>Hamd ile başlayıp salavatla biten</p></div>
    <div><b>1</b><span>dua listesi</span><p>Sevdiklerinizin emanetleri için</p></div>
  </div>
  <div class="bk-iki">
    <div class="bk-halka">{halka}<div><p class="bk-b">Dayanağı sağlam</p><p>Bu rehberdeki 22 durak ve anın 18'i Kur'an'a ya da sahih veya hasen bir hadise dayanır. Kalan 4'ü zayıf rivayetlere ya da sahabe ve âlimlerin uygulamasına dayanır; bunlar ayrıca işaretlidir.</p></div></div>
    <div><p class="bk-b">Umre sırasında geçeceğiniz sıra</p><div class="serit">{rota_seridi}</div></div>
  </div>
</section>"""


def yedi_adim(bloklar):
    """Bir duanın yedi adımı: kalın etiketli maddeler; ardından gelen arapça/okunuş maddeleri o adıma eklenir."""
    adimlar = []
    for b in bloklar:
        etiket, kalan = bold_bas(b)
        if etiket:
            adimlar.append([etiket.rstrip(":"), kalan, []])
        elif adimlar:
            adimlar[-1][2].append(b)
    out = ['<div class="adimlar7">']
    for n, (et, kalan, ek) in enumerate(adimlar, 1):
        ic = satir_ici(kalan).strip()
        ar = next((x for x in ek if arapca_mi(x)), None)
        ok = next((x for x in ek if okunus_mu(x)), None)
        dua = dua_karti(None, ar, ok) if (ar or ok) else ""
        out.append(f'<div class="a7"><span class="a7-n">{n}</span><div><p class="a7-et">{e(et)}</p>{f"<p>{ic}</p>" if ic else ""}{dua}</div></div>')
    out.append("</div>")
    return "".join(out)


def gazali(bloklar):
    out = ['<div class="gz">']
    for n, b in enumerate(bloklar, 1):
        out.append(f'<div class="gz-k"><span>{n:02d}</span><p>{satir_ici(b["runs"])}</p></div>')
    out.append("</div>")
    return "".join(out)


UC_CEVAP = """<div class="uc"><div><span>1</span><b>Hemen verir</b><p>İstediğiniz dünyada karşınıza çıkar.</p></div>
<div><span>2</span><b>Ahirete saklar</b><p>Daha hayırlısı olarak sizi bekler.</p></div>
<div><span>3</span><b>Bir belayı uzaklaştırır</b><p>Duanın benzeri bir kötülük sizden çevrilir.</p></div></div>"""


# ─── Bölümler ──────────────────────────────────────────────────────────────
def bol(bloklar, seviye):
    """[(baslik_blok, [bloklar])] — seviye: 'h2' ya da 'h3'. İlk başlıktan öncekiler (None, [...])"""
    parcalar = [(None, [])]
    for b in bloklar:
        if b["t"] == seviye:
            parcalar.append((b, []))
        else:
            parcalar[-1][1].append(b)
    return parcalar


def alt_bolumler(bloklar, ozel=None):
    out = []
    for bas, ic in bol(bloklar, "h3"):
        if bas is None:
            if ic:
                out.append(isle(ic))
            continue
        ad = docx_oku.duz(bas)
        if ozel and ad in ozel:
            out.append(ozel[ad](ad, ic))
            continue
        out.append(f'<h3>{e(ad)}</h3>')
        out.append(isle(ic, ad))
    return "".join(out)


def foto_bas(dosya, konum, kicker, baslik, alt=""):
    yol = (HERE / "img" / dosya).as_uri()
    return (f'<div class="foto-bas" style="background-image:url({yol});background-position:{konum}"><div class="fb-ic">'
            f'<p class="kicker">{e(kicker)}</p><h1>{baslik}</h1>{f"<p class=fb-alt>{alt}</p>" if alt else ""}</div></div>')


def vurgu_baslik(metin):
    """'Birinci Kısım: Duanın sırrı' → (kicker, başlık) ; başlığın son kelimesi italik."""
    if ": " in metin:
        k, b = metin.split(": ", 1)
    else:
        k, b = "", metin
    kel = b.rsplit(" ", 1)
    bh = f"{e(kel[0])} <em>{e(kel[1])}</em>" if len(kel) == 2 else f"<em>{e(b)}</em>"
    return k, bh


def kisim(baslik, ic):
    ad = docx_oku.duz(baslik)
    ilk = ad.split(" ", 1)[0]
    foto, konum = KISIM_FOTO.get(ilk, ("harem-genis.jpg", "50% 50%"))
    kicker, bh = vurgu_baslik(ad)
    giris, govde = [], ic
    if govde and govde[0]["t"] == "p":
        giris, govde = [govde[0]], govde[1:]
    giris_html = f'<p class="giris">{satir_ici(giris[0]["runs"])}</p>' if giris else ""
    no = KISIM_NO.get(ilk)
    out = [f'<section class="sayfa kisim" id="k{no}">', foto_bas(foto, konum, kicker, bh), f'<span class="k-no">{no:02d}</span>' if no else "", giris_html]
    if ilk == "Dördüncü":
        out.append(on_an_info())
        out.append(alt_bolumler(govde, ozel={}).replace("<h3>An ", '<h3 class="an-h">An '))
    elif ilk == "Beşinci":
        out.append(alt_bolumler(govde, ozel={
            "Bir duanın yedi adımı": lambda a, ic: f"<h3>{e(a)}</h3>" + yedi_adim(ic),
            "İmam Gazâlî'nin on dua adabı": lambda a, ic: f"<h3>{e(a)}</h3>" + isle([x for x in ic if x["t"] != "li"]) + gazali([x for x in ic if x["t"] == "li"]),
            "Dua hiçbir zaman boşa gitmez": lambda a, ic: f"<h3>{e(a)}</h3>" + isle(ic) + UC_CEVAP,
            "Duayı engelleyen şeyler": lambda a, ic: f"<h3>{e(a)}</h3>" + '<div class="engeller">' + isle(ic, a) + "</div>",
        }))
    elif ilk == "Üçüncü":
        metin = [b for b in govde if b["t"] != "img" and docx_oku.duz(b) != "Harem krokisi · 12 dua durağı"]
        out.append(harita_sayfasi(metin))
    else:
        out.append(alt_bolumler(govde))
    out.append("</section>")
    return "".join(out)


def harita_sayfasi(metin):
    lejant = "".join(
        f'<div class="hl"><span class="hl-n">{n}</span><div><b>{e(harita.ADLAR[n])}</b><small>{e(harita.YER[n])}</small></div></div>'
        for n in range(1, 13))
    gruplar = [("Harem'e giriş", [1], "Kapıdan girip metâfa inerken Kâbe'yi ilk gördüğünüz an."),
               ("Kâbe'nin çevresi", [2, 3, 4, 5, 6, 7], "Tavafın yedi şavtı boyunca geçtiğiniz noktalar."),
               ("Tavaftan sonra", [8, 9], "İki rekât tavaf namazı ve Zemzem."),
               ("Sa'y", [10, 11, 12], "Safa'dan Merve'ye yedi şavt.")]
    faz = "".join(f'<div class="faz"><p class="faz-a">{e(a)}</p><p class="faz-n">{"".join(f"<span>{n}</span>" for n in ns)}</p><p class="faz-p">{e(p)}</p></div>' for a, ns, p in gruplar)
    return f"""{isle(metin)}
<h3>12 durak, umre sırasıyla</h3><div class="hl-izgara">{lejant}</div>
<div class="harita-sayfa"><div class="harita-kart"><p class="kicker">Harem krokisi · 12 dua durağı</p>{harita.harita()}
<p class="info-alt">Şematik kroki, ölçekli değildir. Numaralar durak numaralarıdır. Tavaf, Kâbe solunuzda kalacak şekilde döner.</p></div>
<div class="fazlar">{faz}</div></div>"""


def durak(baslik, ic):
    ad = docx_oku.duz(baslik)
    m = re.match(r"Durak (\d+): (.+)", ad)
    n, isim = int(m.group(1)), m.group(2)
    giris, govde = [], ic
    while govde and govde[0]["t"] in ("p", "quote"):
        giris.append(govde[0])
        govde = govde[1:]
    giris_html = isle(giris)
    return f"""
<section class="sayfa durak" id="d{n}">
  <div class="d-bas">
    <div>
      <p class="kicker">{e(harita.GRUP[n])} · {n}. durak</p>
      <div class="d-baslik"><span class="d-no">{n:02d}</span><h1>{e(isim)}</h1></div>
      <div class="d-giris">{giris_html}</div>
    </div>
    <div class="d-harita">{harita.harita(vurgu=n)}<p>{e(harita.YER[n])}</p></div>
  </div>
  {alt_bolumler(govde)}
</section>"""


def onsoz(baslik, ic):
    kicker, bh = vurgu_baslik(docx_oku.duz(baslik))
    return f"""<section class="sayfa onsoz"><p class="kicker">{e(kicker)}</p><h1>{bh}</h1><div class="rule"></div>
{alt_bolumler(ic)}</section>""" + bakista()


def kaynakca(baslik, ic):
    return f"""<section class="sayfa kaynak"><p class="kicker">Kaynakça</p><h1>Rivayetlerin <em>değerlendirmesi</em></h1><div class="rule"></div>
{alt_bolumler(ic)}</section>"""


def son_sayfa(baslik, ic):
    p = [x for x in ic if x["t"] == "p"]
    metinler = [satir_ici(x["runs"]) for x in p]
    return f"""
<section class="sayfa son-s">
  <p class="kicker">Duanıza ortak olun</p>
  <h1>Bu rehberi bir dua kardeşinize <em>iletin</em></h1>
  <div class="rule"></div>
  <p class="giris">{metinler[0]}</p>
  <blockquote class="ayet"><p>{metinler[1]}</p></blockquote>
  <div class="cta" style="margin-top:18pt">
    <h2>Umrenizi kendi tarihinizde <em>planlayın</em></h2>
    <p>{metinler[4] if len(metinler) > 4 else ""}</p>
    <div class="adimlar">
      <div><b>1 · Tasarla</b><span>Tarihi, otel tercihini ve Mekke–Medine gün sayısını seçin.</span></div>
      <div><b>2 · Teklif al</b><span>Seçimlerinize göre hazırlanan teklifi WhatsApp'tan alın.</span></div>
      <div><b>3 · Yola çık</b><span>Vize, otel ve transfer ayarlanır; yolculuk boyunca yanınızdayız.</span></div>
    </div>
    <div class="hizmet"><span>Bireysel Umre</span><span>Hanım Umresi</span><span>İlk Umrem</span><span>Grup Umre</span><span>Vize dahil</span><span>Transfer dahil</span></div>
    <div class="iletisim"><span><b>Planlamaya başlayın:</b> hadiumreyegidelim.com/bireysel-umre</span><span><b>WhatsApp:</b> +90 540 401 00 38</span><span><b>Instagram:</b> @hadiumreyegidelim</span></div>
  </div>
  <p class="anlam" style="margin-top:14pt">{metinler[3] if len(metinler) > 3 else ""}</p>
</section>"""


def icindekiler(h2ler):
    kisimlar, duraklar = [], []
    for ad in h2ler:
        m = re.match(r"Durak (\d+): (.+)", ad)
        if m:
            duraklar.append(f'<div class="s"><span>{int(m.group(1)):02d}</span><span>{e(m.group(2))}</span></div>')
        elif ad != "İçindekiler":
            kisimlar.append(f'<div class="s"><span>·</span><span>{e(ad)}</span></div>')
    return f"""<div class="icindekiler"><div><h3>Bölümler</h3>{"".join(kisimlar)}</div><div><h3>12 dua durağı</h3>{"".join(duraklar)}</div></div>"""


# ─── Sayfa ─────────────────────────────────────────────────────────────────
CSS = (HERE / "stil.css").read_text(encoding="utf-8")


def build(bloklar):
    h2ler = [docx_oku.duz(b) for b in bloklar if b["t"] == "h2"]
    parts = [f"""<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>Harem Dua Haritası</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Noto+Serif:ital@0;1&family=Amiri:wght@400;700&family=Aref+Ruqaa&display=block" rel="stylesheet">
<style>{CSS}</style></head><body>
<section class="kapak" style="background-image:linear-gradient(180deg, rgba(10,22,52,.35) 0%, rgba(10,22,52,.15) 35%, rgba(13,30,70,.92) 70%, #0f2552 100%), url({(HERE / 'img' / 'kabe-gece.jpg').as_uri()})">
  <div class="hat">دعاء</div>
  <p class="kicker">Misafir rehberi · Tam sürüm · 2026</p>
  <div class="kapak-alt">
    <h1>Harem <em>Dua Haritası</em></h1>
    <div class="rule"></div>
    <p>Kâbe'de duanın kabul olduğu yerler ve anlar: Kur'an-ı Kerim, hadis-i şerifler, sahabe rivayetleri ve âlimlerimizin dilinden.</p>
    <div class="rozetler"><span>12 dua durağı</span><span>Duanın kabul olduğu 10 an</span><span>Dua listem</span></div>
  </div>
  <div class="alt"><span>hadiumreyegidelim.com</span><span>Hadi Umreye Gidelim</span></div>
</section>
<section class="sayfa ic-s">
  <p class="kicker">İçindekiler</p>
  <h1>Bu rehberde <em>neler var</em></h1>
  <div class="rule"></div>
  <p class="lead">Önce duanın kendisini, sonra Harem'deki 12 durağı ve duanın kabul olduğu 10 anı anlatır; adap, rota ve sizin dolduracağınız dua listesiyle biter.</p>
  {icindekiler(h2ler)}
  <div class="not" style="margin-top:16pt"><b>Tavaf El Kitabı ve Sa'y El Kitabı ile birlikte okuyun.</b> Şavt şavt okunacak dualar o iki kitapçıkta; bu rehber nerede ve ne zaman dua edeceğinizi gösterir.</div>
</section>"""]
    for bas, ic in bol(bloklar, "h2")[1:]:
        ad = docx_oku.duz(bas)
        if ad == "İçindekiler":
            continue
        if ad.startswith("Önsöz"):
            parts.append(onsoz(bas, ic))
        elif ad.startswith("Durak "):
            parts.append(durak(bas, ic))
        elif ad.startswith("Kaynakça"):
            parts.append(kaynakca(bas, ic))
        elif ad.startswith("Bu rehberi"):
            parts.append(son_sayfa(bas, ic))
        else:
            parts.append(kisim(bas, ic))
    parts.append("</body></html>")
    return "\n".join(parts)


def main():
    bloklar = docx_oku.oku(HERE / "icerik.docx")
    h2 = [docx_oku.duz(b) for b in bloklar if b["t"] == "h2"]
    duraklar = [x for x in h2 if x.startswith("Durak ")]
    assert len(duraklar) == 12, f"12 durak bekleniyordu, {len(duraklar)} bulundu"
    print(f"{len(bloklar)} blok, {len(h2)} bölüm, {len(duraklar)} durak")
    OUT_HTML.write_text(build(bloklar), encoding="utf-8")
    OUT_PDF.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--virtual-time-budget=20000",
                    "--allow-file-access-from-files", f"--print-to-pdf={OUT_PDF}", OUT_HTML.as_uri()], check=True, capture_output=True)
    print("PDF:", OUT_PDF, f"{OUT_PDF.stat().st_size // 1024} KB")


if __name__ == "__main__":
    sys.exit(main())
