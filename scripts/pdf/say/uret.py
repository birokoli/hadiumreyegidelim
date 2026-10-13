#!/usr/bin/env python3
"""Sa'y El Kitabı PDF üreticisi (13 Ekim 2026).

Tavaf El Kitabı'nın kardeşi: aynı kimlik ve CSS (scripts/pdf/tavaf/uret.py), sa'ye özel ekler
(Safa–Merve güzergâh şeması, yön etiketi, yeşil ışıklar arası/hervele kutusu, tepede tekbir ve tehlil).

İçerik: icerik.txt (hoca düzeltmeleri yalnızca orada yapılır).
  ## Şavt N · Yön · Başlık      ### Bölüm      @ Ad | Kaynak | Kez  (sonraki satır okunuş, sonraki anlam)
  ~ anlatı (okunuş yerine düz metin)      ! münâcât açılışı      > tepeye varınca notu
Çıktı: public/indir/say-el-kitabi-2026.pdf

Çalıştır: python3 scripts/pdf/say/uret.py
"""
import html
import importlib.util
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[3]
HERE = pathlib.Path(__file__).resolve().parent
OUT_HTML = HERE / "say.html"
OUT_PDF = ROOT / "public" / "indir" / "say-el-kitabi-2026.pdf"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

_spec = importlib.util.spec_from_file_location("tavaf_uret", ROOT / "scripts/pdf/tavaf/uret.py")
tavaf = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(tavaf)

e = lambda s: html.escape(s, quote=False)


def parse(text: str):
    savtlar = []
    cur = sec = None
    lines = [l.rstrip() for l in text.splitlines()]
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.startswith("## "):
            m = re.match(r"## Şavt (\d+) · (.+?) · (.+)", line)
            cur = {"no": int(m.group(1)), "yon": m.group(2), "baslik": m.group(3), "niyet": "", "bolumler": [], "varis": ""}
            savtlar.append(cur)
        elif line.startswith("Niyet: ") and cur and not cur["bolumler"]:
            cur["niyet"] = line[len("Niyet: "):]
        elif line.startswith("### "):
            sec = {"ad": line[4:], "ogeler": []}
            cur["bolumler"].append(sec)
        elif line.startswith("> "):
            cur["varis"] = line[2:]
        elif line.startswith("@ "):
            ad, kaynak, kez = [p.strip() for p in line[2:].split("|")]
            okunus = lines[i + 1]
            anlam = ""
            if i + 2 < len(lines) and lines[i + 2] and not lines[i + 2].startswith(("@", "#", ">", "!")):
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


AR_BAKARA_158 = "إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ ۖ فَمَنْ حَجَّ الْبَيْتَ أَوِ اعْتَمَرَ فَلَا جُنَاحَ عَلَيْهِ أَنْ يَطَّوَّفَ بِهِمَا ۚ وَمَنْ تَطَوَّعَ خَيْرًا فَإِنَّ اللَّهَ شَاكِرٌ عَلِيمٌ"
AR_NEBDEU = "نَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ"
AR_TEHLIL = "اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ وَلِلَّهِ الْحَمْدُ. لَا إِلٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ، لَا إِلٰهَ إِلَّا اللَّهُ وَحْدَهُ، أَنْجَزَ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَهَزَمَ الْأَحْزَابَ وَحْدَهُ"
AR_HERVELE = "رَبِّ اغْفِرْ وَارْحَمْ وَتَجَاوَزْ عَمَّا تَعْلَمُ، إِنَّكَ أَنْتَ الْأَعَزُّ الْأَكْرَمُ"

HERVELE_OKUNUS = "Rabbiğfir verham ve tecâvez ammâ ta'lem, inneke ente'l-Eazzü'l-Ekrem."
HERVELE_ANLAM = "Rabbim! Bağışla, merhamet et ve bildiğin bütün kusurlarımdan geç; şüphesiz sen en aziz ve en kerim olansın."

KAYNAKLAR = [
    ("Başlangıç", "Bakara 158", "Müslim (Safa ve Merve'de tehlil)"),
    ("1 · Tevekkül", "Âl-i İmrân 173 · Enfâl 40 · Talâk 2–3 · Tevbe 129 · Mümtehine 4 · İnşirâh 5–6", "Buhârî · Müslim · Ebû Dâvûd · Hâkim · Cevşen 1. bab"),
    ("2 · Tövbe", "Enbiyâ 87 · A'râf 23 · Âl-i İmrân 16 · Mü'minûn 118", "Buhârî · Müslim · Ebû Dâvûd · Tirmizî"),
    ("3 · Aile", "Furkân 74 · İbrâhîm 37, 40, 41 · İsrâ 24 · Ahkâf 15", "Buhârî · Ebû Dâvûd"),
    ("4 · Rızık", "Kasas 24 · Âl-i İmrân 26–27 · Mü'minûn 29 · Tâhâ 25–26", "Tirmizî · Buhârî · Müslim · İbn Hibbân"),
    ("5 · Şifa", "Felak · Nâs · Enbiyâ 83 · Şuarâ 80 · Bakara 286", "Ebû Dâvûd · Tirmizî · Buhârî · Müslim · İbn Mâce"),
    ("6 · İstikamet", "Âl-i İmrân 8 · Fâtiha 6–7 · Tâhâ 25–28, 114 · Mü'minûn 97–98", "Tirmizî · Müslim"),
    ("7 · Kabul", "Bakara 127, 201 · Yûsuf 101 · Âl-i İmrân 193–194", "Müslim · Ebû Dâvûd · Buhârî"),
    ("Sa'yden sonra", "—", "Buhârî · Müslim · İbn Mâce"),
]

CSS = tavaf.CSS.replace("TAVAF EL KİTABI", "SA'Y EL KİTABI") + r"""
:root { --yesil:#2f7d55; --yesil-acik:#e8f3ec; }
.savt-bas { grid-template-columns: 26mm 1fr; }
.yon { display: inline-flex; align-items: center; gap: 5pt; margin-top: 6pt; padding: 2pt 9pt; border-radius: 99pt; border: 1px solid var(--mavi); color: var(--navy); font-size: 7.8pt; font-weight: 700; }
.yon i { font-style: normal; color: #6f8fc6; }

/* Safa–Merve güzergâhı */
.rota { margin: 12pt 0 16pt; padding: 14pt 14pt 10pt; border-radius: 12pt; background: var(--beyaz); break-inside: avoid; }
.rota .hat { display: flex; align-items: center; }
.rota .tepe { width: 22mm; text-align: center; flex: none; }
.rota .tepe b { display: flex; width: 15mm; height: 15mm; margin: 0 auto 4pt; border-radius: 50%; background: var(--navy); color: #fff; align-items: center; justify-content: center; font-size: 8pt; letter-spacing: .08em; }
.rota .tepe span { font-size: 7.2pt; color: var(--muted); line-height: 1.3; display: block; }
.rota .yol { flex: 1; height: 4pt; border-radius: 4pt; background: var(--mavi); position: relative; margin-bottom: 16pt; }
.rota .yol .isik { position: absolute; left: 36%; width: 22%; top: -2pt; height: 8pt; border-radius: 4pt; background: var(--yesil); }
.rota .yol .isik-et { position: absolute; left: 36%; width: 22%; top: 10pt; text-align: center; font-size: 7pt; font-weight: 700; color: var(--yesil); }
.rota .olcu { display: flex; justify-content: space-between; font-size: 7.2pt; color: var(--muted); margin-top: 6pt; padding: 0 22mm; }

/* Yeşil ışıklar arası */
.hervele { margin: 12pt 0 4pt; border-left: 3pt solid var(--yesil); background: var(--yesil-acik); border-radius: 0 10pt 10pt 0; padding: 9pt 12pt; break-inside: avoid; }
.hervele .kicker { color: var(--yesil); opacity: 1; }
.hervele .okunus { margin-top: 2pt; }
.hervele .not-k { font-size: 7.6pt; color: var(--muted); margin: 4pt 0 0; }
.bolum.kapanis { color: var(--yesil); border-bottom-color: var(--yesil); }
.anlati { margin: 0; color: var(--ink); }
"""


def dua(o):
    kez = f'<span class="kez">{e(o["kez"])}</span>' if o["kez"] else ""
    kaynak = f'<span class="kaynak">{e(o["kaynak"])}</span>' if o["kaynak"] else ""
    if o["okunus"].startswith("~ "):
        metin = f'<p class="anlati">{e(o["okunus"][2:])}</p>'
    else:
        anlam = f'<p class="anlam">{e(o["anlam"])}</p>' if o["anlam"] else ""
        metin = f'<p class="okunus">{e(o["okunus"])}</p>{anlam}'
    return f'<div class="satir"><div class="etiket">{e(o["ad"])}{kaynak}{kez}</div><div>{metin}</div></div>'


def hervele_kutu(kisa=True):
    ek = '<p class="not-k">Erkekler adımlarını hızlandırır; kadınlar vakarla normal yürür. Herkes aynı duayı okur.</p>' if kisa else ""
    return (f'<div class="hervele"><p class="kicker">Yeşil ışıklar arası · Hervele</p>'
            f'<p class="okunus">{e(HERVELE_OKUNUS)}</p><p class="anlam">{e(HERVELE_ANLAM)} (İbn Mes\'ûd ve İbn Ömer\'den rivayet)</p>{ek}</div>')


def da(yer):
    return f"{yer}'da" if yer == "Safa" else f"{yer}'de"


def savt_html(s):
    bas, son = s["yon"].split("'dan ") if "'dan " in s["yon"] else s["yon"].split("'den ")
    hedef = son.replace("'ye", "").replace("'ya", "")
    out = ['<section class="sayfa">',
           f'<div class="savt-bas"><div class="savt-no"><b>{s["no"]}</b><span>ŞAVT</span></div>'
           f'<div><p class="kicker">{s["no"]}. şavt</p><h1>{e(s["baslik"])}</h1>'
           f'<span class="yon">{e(bas)} <i>→</i> {e(hedef)}</span></div></div>',
           f'<div class="niyet"><b>Niyet:</b> {e(s["niyet"])}</div>',
           f'<p class="sure">Yavaş bir yürüyüşle 6–8 dakika. {e(da(bas))} Kâbe\'ye dönüp tekbir ve tehlil getirdikten sonra yürümeye başlayın.</p>']
    for b in s["bolumler"]:
        if b["ad"].startswith("Yeşil ışıktan"):
            out.append(hervele_kutu())
            out.append(f'<div class="bolum kapanis">{e(b["ad"])}</div>')
        else:
            out.append(f'<div class="bolum">{e(b["ad"])}</div>')
        if b["ad"] == "Münâcât":
            out.append('<div class="munacat" style="padding-top:8pt">')
            for o in b["ogeler"]:
                out.append(f'<p class="hitap">{e(o["metin"])}</p>' if o["tur"] == "hitap" else f'<p>{e(o["metin"])}</p>')
            out.append("</div>")
        else:
            for o in b["ogeler"]:
                out.append(dua(o) if o["tur"] == "dua" else f'<p style="margin:8pt 0 0">{e(o["metin"])}</p>')
    kicker = "Sa'yin sonu" if s["no"] == 7 else da(hedef)
    out.append(f'<div class="son"><p class="kicker">{e(kicker)}</p><p>{e(s["varis"])}</p></div>')
    out.append("</section>")
    return "\n".join(out)


ROTA = """
<div class="rota">
  <div class="hat">
    <div class="tepe"><b>SAFA</b><span>Başlangıç<br>1, 3, 5, 7. şavt buradan</span></div>
    <div class="yol"><div class="isik"></div><div class="isik-et">Yeşil ışıklar · hervele</div></div>
    <div class="tepe"><b>MERVE</b><span>Bitiş<br>2, 4, 6. şavt buradan</span></div>
  </div>
  <div class="olcu"><span>Tepede: Kâbe'ye dön, tekbir ve tehlil</span><span>Her şavt yaklaşık 400 m · 6–8 dk</span><span>Tepede: tekbir ve tehlil</span></div>
</div>"""


def build(savtlar):
    toc = "".join(f'<div class="s"><span>0{s["no"]}</span><span>{e(s["baslik"])}</span></div>' for s in savtlar)
    parts = [f"""<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>Sa'y El Kitabı</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Noto+Serif:ital@1&family=Amiri:wght@400;700&family=Aref+Ruqaa&display=block" rel="stylesheet">
<style>{CSS}</style></head><body>
<section class="kapak">
  <div class="hat">سعي</div>
  <p class="kicker">Misafir rehberi · 2026</p>
  <h1>Sa'y <em>El Kitabı</em></h1>
  <div class="rule"></div>
  <p>Safa ile Merve arasında, Hz. Hâcer validemizin adımlarında okunacak dualar: her şavt bir niyete ayrılır; Kur'an-ı Kerim'den, hadislerden, Cevşen geleneğinden ve münâcâtlardan beslenir.</p>
  <span class="rozet">7 şavt · 7 niyet · Safa'dan Merve'ye</span>
  <div class="alt"><span>hadiumreyegidelim.com</span><span>MBD Travel LLC · Dubai · İstanbul</span></div>
</section>

<section class="sayfa">
  <p class="kicker">Başlarken</p>
  <h1>Sa'ye <em>başlarken</em></h1>
  <div class="rule"></div>
  <p class="lead">Sa'y Safa'da başlar, yedinci şavtla Merve'de biter. Her şavt yavaş bir yürüyüşle 6–8 dakika sürer ve bu kitapçık o süreyi dolduracak kadar dua içerir.</p>
  {ROTA}
  <div class="bolum">Her şavtın düzeni</div>
  <div class="satir"><div class="etiket">1 · Tepede</div><div>Safa'ya ya da Merve'ye her varışta Kâbe'ye dönülür, tekbir ve tehlil getirilir.</div></div>
  <div class="satir"><div class="etiket">2 · Zikir ve Esmâ</div><div>Yürüyüş boyunca tekrarlanan kısa zikirler ve Cevşen üslubunda Esmâ-i Hüsnâ ile yakarış.</div></div>
  <div class="satir"><div class="etiket">3 · Kur'an'dan ve hadislerden</div><div>Şavtın niyetine uygun, kaynağı belli dualar.</div></div>
  <div class="satir"><div class="etiket">4 · Münâcât</div><div>Aziz Mahmud Hüdâyî ve Bediüzzaman gibi büyüklerimizin münâcât geleneğinden ilhamla, kendi dilimizle yakarış.</div></div>
  <div class="satir"><div class="etiket">5 · Yeşil ışıklar arası</div><div>Erkekler adımlarını hızlandırır (hervele); kadınlar vakarla normal yürür. Herkes aynı duayı okur.</div></div>
  <div class="satir"><div class="etiket">6 · Yeşil ışıktan tepeye</div><div>Şavtı kapatan kısa dua.</div></div>
  <div class="not"><b>Hatırlatma:</b> Dualar erken biterse zikirleri tekrarlayın; tepeye varınca kaldığınız yeri bırakıp yeni şavta geçin. Şavtlara özel farz ya da sünnet bir dua yoktur; bu sıralama kalbi her şavtta bir niyete toplamak içindir. Dilediğiniz duayı kendi dilinizle de edebilirsiniz.</div>
  <div class="icindekiler">
    <div><h3>Şavtlar</h3>{toc}</div>
    <div><h3>Ayrıca</h3>
      <div class="s"><span>·</span><span>Safa'da ve Merve'de, her varışta</span></div>
      <div class="s"><span>·</span><span>Sa'yden sonra</span></div>
      <div class="s"><span>·</span><span>Kaynaklar</span></div>
      <div class="s"><span>·</span><span>Umrenizi birlikte planlayalım</span></div>
    </div>
  </div>
</section>

<section class="sayfa">
  <p class="kicker">Safa ve Merve</p>
  <h1>Tepede, her <em>varışta</em></h1>
  <div class="rule"></div>
  <div class="bolum">Safa'ya çıkarken</div>
  <p class="ar" style="margin-top:8pt">{AR_BAKARA_158}</p>
  <p class="okunus">İnne's-Safâ ve'l-Mervete min şeâirillâh, fe men hacce'l-beyte evi'temera fe lâ cünâha aleyhi en yettavvefe bihimâ, ve men tetavvaa hayran fe innallâhe şâkirun alîm.</p>
  <p class="anlam">Şüphesiz Safa ile Merve, Allah'ın nişanelerindendir. Kim Kâbe'yi hac veya umre maksadıyla ziyaret ederse, bu ikisi arasında sa'y etmesinde bir sakınca yoktur. Kim gönülden bir hayır yaparsa, şüphesiz Allah karşılığını verir ve her şeyi bilir. (Bakara, 158)</p>
  <p class="ar" style="margin-top:10pt">{AR_NEBDEU}</p>
  <p class="okunus">Nebdeü bi-mâ bedeallâhu bih.</p>
  <p class="anlam">Allah'ın başladığı yerden başlıyoruz. Efendimiz (s.a.v.) Safa'ya yaklaşırken bu ayeti okumuş ve bu cümleyi söylemiştir (Müslim).</p>

  <div class="bolum">Safa'da ve Merve'de, her varışta</div>
  <p class="lead" style="margin:8pt 0 4pt">Kâbe'nin göründüğü yere çıkın, yüzünüzü Kâbe'ye dönün, ellerinizi göğüs hizasında açın:</p>
  <p class="ar">{AR_TEHLIL}</p>
  <p class="okunus">Allâhu ekber, Allâhu ekber, Allâhu ekber ve lillâhi'l-hamd. Lâ ilâhe illallâhu vahdehû lâ şerîke leh, lehü'l-mülkü ve lehü'l-hamdü ve hüve alâ külli şey'in kadîr. Lâ ilâhe illallâhu vahdeh, encaze va'deh, ve nasara abdeh, ve hezeme'l-ahzâbe vahdeh.</p>
  <p class="anlam">Allah'tan başka ilah yoktur; O tektir, ortağı yoktur. Mülk O'nundur, hamd O'nadır ve O her şeye gücü yetendir. Allah'tan başka ilah yoktur; O tektir. Vaadini yerine getirdi, kuluna yardım etti ve düşman toplulukları tek başına yendi.</p>
  <div class="not" style="margin-top:8pt"><b>Üç kez:</b> Efendimiz (s.a.v.) bunu üç kez okumuş, aralarında dua etmiştir; aynısını Merve'de de yapmıştır (Müslim). Siz de her tepede üç kez okuyup aralarında dilediğinizi isteyin.</div>

  <div class="bolum">Yeşil ışıklar arasında</div>
  <p class="ar" style="margin-top:8pt">{AR_HERVELE}</p>
  <p class="okunus">{e(HERVELE_OKUNUS)}</p>
  <p class="anlam">{e(HERVELE_ANLAM)} Bu dua Efendimiz'den (s.a.v.) değil, sahabeden (İbn Mes'ûd ve İbn Ömer) rivayet edilir.</p>

  <div class="niyet" style="margin-top:14pt"><b>Niyet:</b> Allah'ım! Senin rızan için Safa ile Merve arasında yedi şavt ile sa'y etmeye niyet ettim. Bu ibadeti bana kolaylaştır, eksiklerimi lütfunla tamamla ve katında makbul eyle.</div>
</section>
"""]
    parts.extend(savt_html(s) for s in savtlar)
    kaynak_rows = "".join(f"<tr><td>{e(a)}</td><td>{e(b)}</td><td>{e(c)}</td></tr>" for a, b, c in KAYNAKLAR)
    parts.append(f"""
<section class="sayfa">
  <p class="kicker">Sa'y bitti</p>
  <h1>Sa'yden <em>sonra</em></h1>
  <div class="rule"></div>
  <p class="lead">Sa'y Merve'de biter; ardından tıraş olunur ve umre tamamlanır.</p>
  <div class="satir"><div class="etiket">1 · Merve'de son dua</div><div>Kâbe'ye dönüp tekbir ve tehlili okuduktan sonra elinizi açın, umrenizin kabulü için dua edin.</div></div>
  <div class="satir"><div class="etiket">2 · Tıraş</div><div>Erkekler saçlarını tamamen kazıtır (halk) ya da kısaltır (taksîr); kazıtmak daha faziletlidir. Efendimiz (s.a.v.) saçını kazıtanlar için üç kez, kısaltanlar için bir kez rahmet dilemiştir: <b>Allâhumme'rhami'l-muhallikîn.</b> Allah'ım, saçını kazıtanlara rahmet et (Buhârî, Müslim). Kadınlar saçlarının ucundan parmak ucu kadar keser.</div></div>
  <div class="satir"><div class="etiket">3 · İhramdan çıkış</div><div>Tıraştan sonra ihram yasakları sona erer; umreniz tamamlanmıştır.</div></div>
  <div class="satir"><div class="etiket">4 · Şükür</div><div>Sizi bu kapıya getiren Rabbinize hamd edin; tekrar davet edilmeyi isteyin.</div></div>
  <div class="son"><p class="kicker">Hamd</p><p><b>Elhamdülillâhillezî bi ni'metihî tetimmü's-sâlihât.</b> Nimetiyle iyilikler tamamlanan Allah'a hamd olsun. Efendimiz (s.a.v.) hoşuna giden bir şey gördüğünde böyle derdi (İbn Mâce).</p></div>

  <div class="bolum" style="margin-top:24pt">Kaynaklar</div>
  <p class="anlam" style="margin:6pt 0 6pt">Kur'an ve hadis dualarının kaynakları her duanın başlığında verildi; tablo şavt bazında özetler.</p>
  <table><thead><tr><th>Bölüm</th><th>Kur'an</th><th>Hadis ve rivayet</th></tr></thead><tbody>{kaynak_rows}</tbody></table>
  <div class="not"><b>Not:</b> Yeşil ışıklar arasında okunan "Rabbiğfir verham..." duası sahabeden (İbn Mes'ûd ve İbn Ömer) rivayet edilir. Münâcâtlar ve "Esmâ ile yakarış" bölümleri, Aziz Mahmud Hüdâyî ve Bediüzzaman gibi büyüklerimizin münâcât ve Cevşen üslubundan ilhamla bu kitapçık için yazılmıştır; onlara ait alıntı değildir. Cevşen'den doğrudan alınan kısım yalnızca 1. bab ve "Sübhâneke..." nakaratıdır.</div>
</section>

<section class="sayfa">
  <p class="kicker">Hadi Umreye Gidelim</p>
  <h1>Umrenizi kendi tarihinizde <em>planlayın</em></h1>
  <div class="rule"></div>
  <p class="lead">Bu kitapçığı sa'yinizde yanınızda taşımanız için hazırladık. Yolculuğun geri kalanını da birlikte planlayabiliriz: tur takvimine bağlı kalmadan, kendi tarihinizde ve kendi bütçenizle.</p>
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
  <div class="not" style="margin-top:16pt"><b>Tavaf El Kitabı da hazır:</b> Kâbe'nin etrafındaki yedi şavt için hazırladığımız kardeş kitapçığı hadiumreyegidelim.com/tavaf-kitapcigi adresinden ücretsiz indirebilirsiniz. Sa'yde bizleri de dualarınızdan eksik etmeyin.</div>
</section>
</body></html>""")
    return "\n".join(parts)


def main():
    savtlar = parse((HERE / "icerik.txt").read_text(encoding="utf-8"))
    assert len(savtlar) == 7, f"7 şavt bekleniyordu, {len(savtlar)} bulundu"
    for s in savtlar:
        n = sum(len(b["ogeler"]) for b in s["bolumler"])
        assert s["varis"], f"Şavt {s['no']}: varış notu yok"
        print(f"Şavt {s['no']} ({s['yon']}): {len(s['bolumler'])} bölüm, {n} öğe")
    OUT_HTML.write_text(build(savtlar), encoding="utf-8")
    OUT_PDF.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--virtual-time-budget=15000",
                    f"--print-to-pdf={OUT_PDF}", OUT_HTML.as_uri()], check=True, capture_output=True)
    print("PDF:", OUT_PDF, f"{OUT_PDF.stat().st_size // 1024} KB")


if __name__ == "__main__":
    sys.exit(main())
