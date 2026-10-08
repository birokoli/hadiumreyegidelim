#!/usr/bin/env python3
"""Tavaf El Kitabı PDF üreticisi (9 Ekim 2026).

İçerik: icerik.txt (hoca düzeltmeleri yalnızca orada yapılır).
Çıktı: public/indir/tavaf-el-kitabi-2026.pdf (Chrome headless ile HTML'den).
Kimlik: ana sayfa v2 ile aynı — Pantone 7687C #1d428a, 2127C #b8c9e3, 6234C #f2dda6, Brilliant White #edf1fe;
Cairo gövde, Noto Serif italik vurgu, Arapça için Amiri.

Çalıştır: python3 scripts/pdf/tavaf/uret.py
"""
import html
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[3]
HERE = pathlib.Path(__file__).resolve().parent
OUT_HTML = HERE / "tavaf.html"
OUT_PDF = ROOT / "public" / "indir" / "tavaf-el-kitabi-2026.pdf"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

e = lambda s: html.escape(s, quote=False)


def parse(text: str):
    savtlar = []
    cur = sec = None
    lines = [l.rstrip() for l in text.splitlines()]
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.startswith("## "):
            m = re.match(r"## Şavt (\d+) · (.+)", line)
            cur = {"no": int(m.group(1)), "baslik": m.group(2), "niyet": "", "bolumler": []}
            savtlar.append(cur)
        elif line.startswith("Niyet: ") and cur and not cur["bolumler"]:
            cur["niyet"] = line[len("Niyet: "):]
        elif line.startswith("### "):
            sec = {"ad": line[4:], "ogeler": []}
            cur["bolumler"].append(sec)
        elif line.startswith("@ "):
            ad, kaynak, kez = [p.strip() for p in line[2:].split("|")]
            okunus = lines[i + 1]
            anlam = ""
            # "Esmâ ile yakarış" tek satır; diğerleri okunuş + anlam
            if i + 2 < len(lines) and lines[i + 2] and not lines[i + 2].startswith(("@", "#")):
                anlam = lines[i + 2]
                i += 1
            i += 1
            sec["ogeler"].append({"tur": "dua", "ad": ad, "kaynak": kaynak, "kez": kez, "okunus": okunus, "anlam": anlam})
        elif line.startswith("! "):
            sec["ogeler"].append({"tur": "hitap", "metin": line[2:]})
        elif line.strip():
            sec["ogeler"].append({"tur": "paragraf", "metin": line})
        i += 1
    return savtlar


BOLUM_ETIKET = {"Senâ ve zikir": "Senâ ve zikir", "Kur'an'dan": "Kur'an'dan", "Hadislerden": "Hadislerden", "Münâcât": "Münâcât"}

ARAPCA_BASINDA = "بِسْمِ اللهِ، اللهُ أَكْبَرُ، لَا إِلٰهَ إِلَّا اللهُ وَاللهُ أَكْبَرُ"
ARAPCA_SALAVAT = "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ"
ARAPCA_SONUNDA = "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ"

KAYNAKLAR = [
    ("1 · Tevhid", "Bakara 127–128 · Âl-i İmrân 26, 191 · Tevbe 129 · Mümtehine 4", "Tirmizî · Müslim · Ebû Dâvûd · İbn Mâce · Nesâî · Cevşen 1. bab"),
    ("2 · Tövbe", "A'râf 23 · Enbiyâ 87 · Kasas 16 · Âl-i İmrân 16, 147 · Bakara 286 · Mü'minûn 118", "Buhârî · Müslim · Ebû Dâvûd · Tirmizî · İbn Mâce"),
    ("3 · Aile", "İbrâhîm 37, 41 · Furkân 74 · İsrâ 24 · Nûh 28 · Ahkâf 15 · Âl-i İmrân 38", "Buhârî · Ebû Dâvûd · Müslim"),
    ("4 · Rızık", "Âl-i İmrân 173 · Kasas 24 · Mü'minûn 29 · Talâk 2–3 · Kehf 10 · Tâhâ 25–28 · Mâide 114", "Tirmizî · Buhârî · Müslim · İbn Hibbân"),
    ("5 · İstikamet", "Fâtiha 6–7 · Âl-i İmrân 8–9 · Tâhâ 114 · Mü'minûn 97–98 · İsrâ 80 · Bakara 250", "Tirmizî · Müslim · İbn Mâce"),
    ("6 · Şifa", "Enbiyâ 83 · Şuarâ 80 · İsrâ 82 · Bakara 286 · Yûsuf 86 · İnşirâh 5–6", "Buhârî · Müslim · Ebû Dâvûd · Tirmizî · İbn Mâce · Ahmed · Hâkim"),
    ("7 · Kabul", "İbrâhîm 40 · Yûsuf 101 · Âl-i İmrân 193–194 · Tahrîm 8 · Şuarâ 83–87 · Bakara 127", "Buhârî · Müslim · Ahmed · Ebû Dâvûd"),
]

CSS = r"""
@page { size: A4; margin: 17mm 16mm 17mm 16mm;
  @bottom-left { content: "HADİ UMREYE GİDELİM · TAVAF EL KİTABI"; font: 600 6.5pt Cairo, sans-serif; letter-spacing: .14em; color: #8a94ab; }
  @bottom-right { content: "hadiumreyegidelim.com · " counter(page); font: 400 7pt Cairo, sans-serif; color: #8a94ab; } }
@page kapak { margin: 0; @bottom-left { content: none; } @bottom-right { content: none; } }
:root { --navy:#1d428a; --mavi:#b8c9e3; --kum:#f2dda6; --beyaz:#edf1fe; --ink:#14213d; --muted:#5b6680; --cizgi:#d7e0f0; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin:0; font-family: Cairo, sans-serif; color: var(--ink); font-size: 9.2pt; line-height: 1.5; }
em, .serif { font-family: "Noto Serif", serif; font-style: italic; font-weight: 400; }
.ar { font-family: Amiri, "Noto Naskh Arabic", serif; direction: rtl; text-align: right; font-size: 15pt; line-height: 2; color: var(--navy); }
.kicker { font-size: 6.8pt; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; color: var(--navy); opacity: .75; margin: 0 0 4pt; }
h1 { font-size: 22pt; line-height: 1.15; margin: 0; color: var(--navy); font-weight: 700; }
h1 em { color: #6f8fc6; }
.rule { width: 34pt; height: 3pt; background: var(--navy); border-radius: 2pt; margin: 9pt 0 14pt; }
.lead { color: var(--muted); margin: 0 0 14pt; }
.sayfa { break-before: page; }

/* Kapak */
.kapak { page: kapak; height: 297mm; width: 210mm; background: var(--navy); color: #fff; position: relative; overflow: hidden; padding: 30mm 22mm; }
.kapak .hat { position: absolute; right: -14mm; top: 46mm; font-family: "Aref Ruqaa", Amiri, serif; font-size: 190pt; color: rgba(237,241,254,.07); direction: rtl; line-height: 1; }
.kapak .kicker { color: var(--kum); opacity: 1; }
.kapak h1 { color: #fff; font-size: 46pt; margin-top: 70mm; }
.kapak h1 em { color: var(--mavi); display: block; font-size: 40pt; }
.kapak .rule { background: var(--kum); width: 46pt; }
.kapak p { color: rgba(255,255,255,.85); max-width: 120mm; font-size: 11pt; }
.kapak .alt { position: absolute; left: 22mm; right: 22mm; bottom: 20mm; border-top: 1px solid rgba(184,201,227,.4); padding-top: 8pt; display: flex; justify-content: space-between; font-size: 8pt; color: rgba(255,255,255,.7); }
.kapak .rozet { display: inline-block; margin-top: 14pt; padding: 5pt 10pt; border-radius: 99pt; background: rgba(242,221,166,.16); color: var(--kum); font-size: 8.5pt; font-weight: 600; }

/* Satır düzeni (örnekteki gibi: solda etiket, sağda metin) */
.satir { display: grid; grid-template-columns: 36mm 1fr; gap: 0 6mm; padding: 6pt 0; border-bottom: 1px solid var(--cizgi); break-inside: avoid; }
.satir:last-child { border-bottom: 0; }
.etiket { font-weight: 700; color: var(--navy); font-size: 8.6pt; line-height: 1.35; }
.etiket .kaynak { display: block; font-weight: 400; color: var(--muted); font-size: 7.6pt; margin-top: 2pt; }
.kez { display: inline-block; margin-top: 4pt; padding: 1pt 7pt; border-radius: 99pt; background: var(--kum); color: #5a4612; font-size: 7.4pt; font-weight: 700; }
.okunus { font-weight: 600; color: var(--ink); margin: 0 0 3pt; }
.anlam { color: var(--muted); margin: 0; font-size: 8.6pt; line-height: 1.45; }

/* Şavt başlığı */
.savt-bas { display: grid; grid-template-columns: 26mm 1fr; gap: 0 6mm; align-items: center; margin-bottom: 10pt; }
.savt-no { width: 24mm; height: 24mm; border-radius: 50%; background: var(--navy); color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1; }
.savt-no b { font-size: 26pt; font-weight: 700; }
.savt-no span { font-size: 6.5pt; letter-spacing: .2em; color: var(--kum); margin-top: 3pt; font-weight: 700; }
.niyet { background: var(--beyaz); border-left: 3pt solid var(--navy); border-radius: 0 8pt 8pt 0; padding: 9pt 12pt; margin: 4pt 0 6pt; }
.niyet b { color: var(--navy); }
.sure { font-size: 7.6pt; color: var(--muted); margin: 0 0 6pt; }
.bolum { font-size: 7pt; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--navy); margin: 12pt 0 2pt; padding-bottom: 5pt; border-bottom: 1.5pt solid var(--navy); break-after: avoid; }
.hitap { font-family: "Noto Serif", serif; font-style: italic; color: var(--navy); font-size: 11pt; margin: 0 0 6pt; }
.munacat p { margin: 0 0 5pt; }
.son { margin-top: 12pt; background: var(--navy); color: #fff; border-radius: 10pt; padding: 11pt 14pt; break-inside: avoid; }
.son .kicker { color: var(--kum); opacity: 1; }
.son p { margin: 0; color: rgba(255,255,255,.92); }

/* Kutular */
.not { background: #fbf4e1; border: 1px solid var(--kum); border-radius: 10pt; padding: 10pt 13pt; margin: 12pt 0; break-inside: avoid; }
.not b { color: #5a4612; }
.adim { display: grid; grid-template-columns: 9mm 1fr; gap: 0 4mm; padding: 7pt 0; border-bottom: 1px solid var(--cizgi); break-inside: avoid; }
.adim .n { width: 7mm; height: 7mm; border-radius: 50%; background: var(--beyaz); color: var(--navy); font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 8.5pt; }
.icindekiler { display: grid; grid-template-columns: 1fr 1fr; gap: 0 10mm; margin-top: 6pt; }
.icindekiler h3 { font-size: 8.6pt; color: var(--navy); margin: 0 0 4pt; padding-bottom: 4pt; border-bottom: 1.5pt solid var(--navy); }
.icindekiler div.s { display: flex; gap: 8pt; padding: 4pt 0; border-bottom: 1px solid var(--cizgi); font-size: 8.8pt; }
.icindekiler div.s span:first-child { color: #6f8fc6; font-weight: 700; width: 14pt; }
table { width: 100%; border-collapse: collapse; font-size: 8.4pt; }
th { text-align: left; color: var(--navy); font-size: 7.4pt; letter-spacing: .12em; text-transform: uppercase; border-bottom: 1.5pt solid var(--navy); padding: 5pt 6pt 5pt 0; }
td { border-bottom: 1px solid var(--cizgi); padding: 6pt 6pt 6pt 0; vertical-align: top; }
td:first-child { font-weight: 700; color: var(--navy); white-space: nowrap; }

/* Son sayfa: bireysel umre */
.cta { background: var(--navy); color: #fff; border-radius: 14pt; padding: 18pt 18pt 16pt; margin-top: 10pt; break-inside: avoid; }
.cta h2 { margin: 0 0 4pt; font-size: 17pt; }
.cta h2 em { color: var(--mavi); }
.cta p { color: rgba(255,255,255,.88); margin: 0 0 10pt; }
.cta .adimlar { display: grid; grid-template-columns: repeat(3,1fr); gap: 8pt; margin: 10pt 0 12pt; }
.cta .adimlar div { background: rgba(237,241,254,.08); border: 1px solid rgba(184,201,227,.3); border-radius: 10pt; padding: 9pt 10pt; }
.cta .adimlar b { color: var(--kum); display: block; font-size: 9.5pt; }
.cta .adimlar span { font-size: 8.4pt; color: rgba(255,255,255,.85); }
.cta .hizmet { display: flex; flex-wrap: wrap; gap: 5pt; margin-bottom: 12pt; }
.cta .hizmet span { border: 1px solid rgba(184,201,227,.45); border-radius: 99pt; padding: 2pt 9pt; font-size: 8pt; }
.cta .iletisim { border-top: 1px solid rgba(184,201,227,.35); padding-top: 9pt; font-size: 8.6pt; color: rgba(255,255,255,.85); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 6pt; }
.cta .iletisim b { color: var(--kum); }
"""


def dua(o):
    kez = f'<span class="kez">{e(o["kez"])}</span>' if o["kez"] else ""
    kaynak = f'<span class="kaynak">{e(o["kaynak"])}</span>' if o["kaynak"] else ""
    anlam = f'<p class="anlam">{e(o["anlam"])}</p>' if o["anlam"] else ""
    return f'<div class="satir"><div class="etiket">{e(o["ad"])}{kaynak}{kez}</div><div><p class="okunus">{e(o["okunus"])}</p>{anlam}</div></div>'


def savt_html(s):
    out = [f'<section class="sayfa">',
           f'<div class="savt-bas"><div class="savt-no"><b>{s["no"]}</b><span>ŞAVT</span></div>'
           f'<div><p class="kicker">{s["no"]}. şavt</p><h1>{e(s["baslik"])}</h1></div></div>',
           f'<div class="niyet"><b>Niyet:</b> {e(s["niyet"])}</div>',
           '<p class="sure">Yavaş ve huzurlu bir okumayla yaklaşık 12–15 dakika. Önce şavtın başındaki tekbiri getirin (bkz. "Her şavtta").</p>']
    for b in s["bolumler"]:
        out.append(f'<div class="bolum">{e(b["ad"])}</div>')
        if b["ad"] == "Münâcât":
            out.append('<div class="munacat" style="padding-top:8pt">')
            for o in b["ogeler"]:
                out.append(f'<p class="hitap">{e(o["metin"])}</p>' if o["tur"] == "hitap" else f'<p>{e(o["metin"])}</p>')
            out.append("</div>")
        else:
            out.extend(dua(o) for o in b["ogeler"])
    if s["no"] < 7:
        out.append('<div class="son"><p class="kicker">Şavtın sonu</p><p>Salavat-ı İbrâhîmiyye (3 kez), ardından Rükn-i Yemânî ile Hacerü\'l-Esved arasında: <b>Rabbenâ âtinâ fi\'d-dünyâ haseneten ve fi\'l-âhireti haseneten ve kınâ azâbe\'n-nâr.</b></p></div>')
    else:
        out.append('<div class="son"><p class="kicker">Tavafın sonu</p><p>Salavat-ı İbrâhîmiyye (3 kez), ardından Rükn-i Yemânî ile Hacerü\'l-Esved arasında: <b>Rabbenâ âtinâ fi\'d-dünyâ haseneten ve fi\'l-âhireti haseneten ve kınâ azâbe\'n-nâr. Ve edhilnâ\'l-cennete mea\'l-ebrâr, yâ Azîzü yâ Gaffâr.</b> (Son cümle yaygın okunan bir ektir; "iyilerle birlikte" ifadesi Âl-i İmrân 193\'ten gelir.) Hacerü\'l-Esved hizasında tekbir ile tavaf tamamlanır.</p></div>')
    out.append("</section>")
    return "\n".join(out)


def build(savtlar):
    toc = "".join(f'<div class="s"><span>0{s["no"]}</span><span>{e(s["baslik"])}</span></div>' for s in savtlar)
    parts = [f"""<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>Tavaf El Kitabı</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Noto+Serif:ital@1&family=Amiri:wght@400;700&family=Aref+Ruqaa&display=block" rel="stylesheet">
<style>{CSS}</style></head><body>
<section class="kapak">
  <div class="hat">طواف</div>
  <p class="kicker">Misafir rehberi · 2026</p>
  <h1>Tavaf <em>El Kitabı</em></h1>
  <div class="rule"></div>
  <p>Her şavt için yaklaşık 12–15 dakika aralıksız okunacak, birbirinden farklı dualar: Kur'an-ı Kerim'den, hadislerden, Cevşen'den ve münâcât geleneğinden.</p>
  <span class="rozet">7 şavt · 7 niyet · okunuş ve anlamlarıyla</span>
  <div class="alt"><span>hadiumreyegidelim.com</span><span>MBD Travel LLC · Dubai · İstanbul</span></div>
</section>

<section class="sayfa">
  <p class="kicker">Başlarken</p>
  <h1>Bu kitapçık nasıl <em>okunur</em></h1>
  <div class="rule"></div>
  <p class="lead">Her şavt beş bölümden oluşur ve yavaş, huzurlu bir okuma ile 12–15 dakika sürer.</p>
  <div class="satir"><div class="etiket">1 · Senâ ve zikir</div><div>Allah'ı isimleriyle anarak şavta başlamak.</div></div>
  <div class="satir"><div class="etiket">2 · Kur'an'dan</div><div>Peygamberlerin ve salih kulların Kur'an'da geçen duaları.</div></div>
  <div class="satir"><div class="etiket">3 · Hadislerden</div><div>Efendimiz'in (s.a.v.) öğrettiği dualar.</div></div>
  <div class="satir"><div class="etiket">4 · Münâcât</div><div>Aziz Mahmud Hüdâyî ve Bediüzzaman gibi büyüklerimizin münâcât geleneğinden ilhamla, kendi dilimizle yazılmış yakarış. Bu metinler onlara ait alıntı değildir; bu kitapçık için yazılmıştır.</div></div>
  <div class="satir"><div class="etiket">5 · Şavtın sonu</div><div>Salavat ve Rükn-i Yemânî ile Hacerü'l-Esved arasında okunan dua.</div></div>

  <div class="bolum">Pratik notlar</div>
  <div class="adim"><span class="n">1</span><div>Kalabalıkta adımlarınız yavaşlarsa okumaya devam edin; Hacerü'l-Esved hizasına gelince kaldığınız yeri bırakıp yeni şavtın başına geçin.</div></div>
  <div class="adim"><span class="n">2</span><div>Dualar erken biterse <span class="kez" style="margin:0">kez</span> ile işaretli zikirlerin sayısını artırın.</div></div>
  <div class="adim"><span class="n">3</span><div>Okunuşlar Türkçe harflerle verildi; anlamları her duanın altında.</div></div>
  <div class="adim"><span class="n">4</span><div>Münâcâtlarda "(isimlerini anın)" yazan yerlerde sevdiklerinizi adıyla anın.</div></div>
  <div class="not"><b>Hatırlatma:</b> Şavtlara özel farz ya da sünnet bir dua yoktur. Bu dualar kalbinizi her şavtta bir niyete toplamak için sıralanmıştır; dilediğiniz duayı kendi dilinizle de edebilirsiniz.</div>

  <div class="icindekiler">
    <div><h3>Şavtlar</h3>{toc}</div>
    <div><h3>Ayrıca</h3>
      <div class="s"><span>·</span><span>Her şavtın başında ve sonunda</span></div>
      <div class="s"><span>·</span><span>Tavaftan sonra</span></div>
      <div class="s"><span>·</span><span>Kaynaklar</span></div>
      <div class="s"><span>·</span><span>Umrenizi birlikte planlayalım</span></div>
    </div>
  </div>
</section>

<section class="sayfa">
  <p class="kicker">Her şavtta</p>
  <h1>Başında, ortasında, <em>sonunda</em></h1>
  <div class="rule"></div>
  <div class="bolum">Her şavtın başında</div>
  <p class="lead" style="margin:8pt 0 4pt">Hacerü'l-Esved hizasında, ona doğru elinizi kaldırarak:</p>
  <p class="ar">{ARAPCA_BASINDA}</p>
  <p class="okunus">Bismillâhi, Allâhu ekber. Lâ ilâhe illallâhu vallâhu ekber.</p>
  <p class="anlam">Allah'ın adıyla. Allah en büyüktür. Allah'tan başka ilah yoktur ve Allah en büyüktür.</p>
  <div class="bolum">Salavat-ı İbrâhîmiyye</div>
  <p class="lead" style="margin:8pt 0 4pt">Hz. İbrahim'in inşa ettiği evin etrafında, Efendimiz'e (s.a.v.) ve İbrahim'e (a.s.) birlikte salavat:</p>
  <p class="ar">{ARAPCA_SALAVAT}</p>
  <p class="okunus">Allâhumme salli alâ Muhammedin ve alâ âli Muhammed, kemâ salleyte alâ İbrâhîme ve alâ âli İbrâhîm, inneke Hamîdün Mecîd. Allâhumme bârik alâ Muhammedin ve alâ âli Muhammed, kemâ bârakte alâ İbrâhîme ve alâ âli İbrâhîm, inneke Hamîdün Mecîd.</p>
  <p class="anlam">(Buhârî)</p>
  <div class="bolum">Her şavtın sonunda</div>
  <p class="lead" style="margin:8pt 0 4pt">Rükn-i Yemânî ile Hacerü'l-Esved arasında:</p>
  <p class="ar">{ARAPCA_SONUNDA}</p>
  <p class="okunus">Rabbenâ âtinâ fi'd-dünyâ haseneten ve fi'l-âhireti haseneten ve kınâ azâbe'n-nâr.</p>
  <p class="anlam">Rabbimiz! Bize dünyada da iyilik ver, ahirette de iyilik ver ve bizi ateş azabından koru. (Bakara, 201; Ebû Dâvûd)</p>
</section>
"""]
    parts.extend(savt_html(s) for s in savtlar)
    kaynak_rows = "".join(f"<tr><td>{e(a)}</td><td>{e(b)}</td><td>{e(c)}</td></tr>" for a, b, c in KAYNAKLAR)
    parts.append(f"""
<section class="sayfa">
  <p class="kicker">Tavaf bitti</p>
  <h1>Tavaftan <em>sonra</em></h1>
  <div class="rule"></div>
  <p class="lead">Yedinci şavt Hacerü'l-Esved hizasında biter; ardından sırasıyla şunlar yapılır.</p>
  <div class="satir"><div class="etiket">1 · Mültezem</div><div>Hacerü'l-Esved ile Kâbe kapısı arasındaki kısımdır. Sahabeden göğsünü, yüzünü ve kollarını buraya dayayarak dua edenler olduğu rivayet edilir (Ebû Dâvûd). Kalabalıkta ulaşamıyorsanız, uzaktan yönelip dua etmeniz yeterlidir; kimseyi itmeyin.</div></div>
  <div class="satir"><div class="etiket">2 · İki rekat tavaf namazı</div><div>Mümkünse Makam-ı İbrahim'in gerisinde, kalabalıksa Harem'in uygun bir yerinde kılınır. Efendimiz (s.a.v.) birinci rekatta Kâfirûn, ikinci rekatta İhlâs suresini okumuştur (Müslim).</div></div>
  <div class="satir"><div class="etiket">3 · Zemzem</div><div>Namazdan sonra zemzem içilir ve dua edilir. Efendimiz (s.a.v.) "Zemzem ne niyetle içilirse onun içindir" buyurmuştur (İbn Mâce).</div></div>
  <div class="satir"><div class="etiket">4 · Sa'ye geçiş</div><div>Umre tavafından sonra Safa tepesine yönelinir. Sa'y Safa'da başlar, yedinci şavtla Merve'de biter.</div></div>

  <div class="bolum" style="margin-top:24pt">Kaynaklar</div>
  <p class="anlam" style="margin:6pt 0 6pt">Kur'an ve hadis dualarının kaynakları her duanın başlığında verildi; tablo şavt bazında özetler.</p>
  <table><thead><tr><th>Şavt</th><th>Kur'an</th><th>Hadis</th></tr></thead><tbody>{kaynak_rows}</tbody></table>
  <div class="not"><b>Not:</b> Münâcâtlar, Aziz Mahmud Hüdâyî ve Bediüzzaman gibi büyüklerimizin üslubundan ilhamla bu kitapçık için yazılmıştır; onlara ait alıntı değildir. Cevşen'den yalnızca 1. bab eklenmiştir.</div>
</section>

<section class="sayfa">
  <p class="kicker">Hadi Umreye Gidelim</p>
  <h1>Umrenizi kendi tarihinizde <em>planlayın</em></h1>
  <div class="rule"></div>
  <p class="lead">Bu kitapçığı tavafınızda yanınızda taşımanız için hazırladık. Yolculuğun geri kalanını da birlikte planlayabiliriz: tur takvimine bağlı kalmadan, kendi tarihinizde ve kendi bütçenizle.</p>
  <div class="cta">
    <h2>Bireysel umre, <em>size göre</em></h2>
    <p>Tarihinizi, otelinizi ve Mekke–Medine gün sayısını siz seçin; teklifiniz WhatsApp'tan gelsin.</p>
    <div class="adimlar">
      <div><b>1 · Tasarla</b><span>Tarihi, otel tercihini ve Mekke–Medine gün sayısını seçin.</span></div>
      <div><b>2 · Teklif al</b><span>Seçimlerinize göre hazırlanan teklifi WhatsApp'tan alın.</span></div>
      <div><b>3 · Yola çık</b><span>Vize, otel ve transfer ayarlanır; yolculuk boyunca yanınızdayız.</span></div>
    </div>
    <div class="hizmet"><span>Umre vizesi</span><span>Mekke ve Medine otelleri</span><span>Havalimanı ve şehirler arası transfer</span><span>Haremeyn hızlı treni</span><span>Ziyaret ve rehberlik</span></div>
    <div class="iletisim"><span><b>Planlamaya başlayın:</b> hadiumreyegidelim.com/bireysel-umre</span><span><b>WhatsApp:</b> +90 540 401 00 38</span><span><b>E-posta:</b> info@hadiumreyegidelim.com</span></div>
  </div>
  <div class="not" style="margin-top:16pt"><b>Duanıza ortak olun:</b> Bu kitapçığı umreye gidecek yakınlarınızla paylaşabilirsiniz. Tavafta bizleri de dualarınızdan eksik etmeyin.</div>
</section>
</body></html>""")
    return "\n".join(parts)


def main():
    savtlar = parse((HERE / "icerik.txt").read_text(encoding="utf-8"))
    assert len(savtlar) == 7, f"7 şavt bekleniyordu, {len(savtlar)} bulundu"
    for s in savtlar:
        n = sum(len(b["ogeler"]) for b in s["bolumler"])
        print(f"Şavt {s['no']}: {len(s['bolumler'])} bölüm, {n} öğe")
    OUT_HTML.write_text(build(savtlar), encoding="utf-8")
    OUT_PDF.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--virtual-time-budget=15000",
                    f"--print-to-pdf={OUT_PDF}", OUT_HTML.as_uri()], check=True, capture_output=True)
    print("PDF:", OUT_PDF, f"{OUT_PDF.stat().st_size // 1024} KB")


if __name__ == "__main__":
    sys.exit(main())
