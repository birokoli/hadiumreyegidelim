"""Harem krokisi (SVG), 16 Ekim 2026. Şematiktir, ölçekli değildir.

Yerleşim gerçek yönlere göre: Hacerü'l-Esved doğu köşesinde, kapı ve Mültezem Hacerü'l-Esved ile Irâkî köşe arasında,
Hatîm ve Mîzâb Irâkî ile Şâmî köşe arasında, Rükn-i Yemânî güney köşesinde. Tavaf saat yönünün tersine (Kâbe solda).
Sa'y yolu sağda: Safa altta (Hacerü'l-Esved tarafı), Merve üstte.

harita()            tam sayfa kroki, etiketli
harita(vurgu=n)     durak sayfası için küçük kroki; n numaralı durak öne çıkar
"""

NAVY, MAVI, KUM, BEYAZ, INK, MUTED = "#1d428a", "#b8c9e3", "#f2dda6", "#edf1fe", "#14213d", "#5b6680"
ALTIN, YESIL, KABE = "#c9a24a", "#2f7d55", "#16191f"

# Durak no → (x, y, etiket, etiket konumu)
DURAKLAR = {
    1: (230, 408, "Kâbe'nin ilk görünüşü", "r"),
    2: (96, 300, "Metâf", "b"),
    3: (306, 284, "Hacerü'l-Esved", "r"),
    4: (310, 232, "Mültezem", "r"),
    5: (198, 112, "Hatîm", "l"),
    6: (262, 122, "Mîzâb", "r"),
    7: (230, 298, "İki rükün arası", "b"),
    8: (333, 158, "Makam-ı İbrahim", "r"),
    9: (374, 266, "Zemzem", "r"),
    10: (540, 392, "Safa", "c"),
    11: (540, 300, "Mes'â", "b"),
    12: (540, 48, "Merve", "c"),
}
ADLAR = {
    1: "Kâbe'nin ilk göründüğü an", 2: "Metâf", 3: "Hacerü'l-Esved", 4: "Mültezem", 5: "Hatîm", 6: "Mîzâb-ı Rahmet",
    7: "İki rükün arası", 8: "Makam-ı İbrahim", 9: "Zemzem", 10: "Safa", 11: "Mes'â ve yeşil ışıklar", 12: "Merve",
}
YER = {
    1: "Harem kapısından metâfa inerken", 2: "Kâbe'nin çevresindeki tavaf alanı", 3: "Doğu köşesi, tavafın başlangıcı",
    4: "Hacerü'l-Esved ile Kâbe kapısı arası", 5: "Kâbe'nin kuzeyindeki yarım daire", 6: "Hatîm tarafındaki altın oluk",
    7: "Rükn-i Yemânî ile Hacerü'l-Esved arası", 8: "Kâbe kapısının karşısı", 9: "Tavaf namazından sonra",
    10: "Sa'yin başladığı tepe", 11: "Safa ile Merve arası", 12: "Sa'yin bittiği tepe",
}
GRUP = {1: "Harem'e giriş", 2: "Kâbe'nin çevresi", 3: "Kâbe'nin çevresi", 4: "Kâbe'nin çevresi", 5: "Kâbe'nin çevresi",
        6: "Kâbe'nin çevresi", 7: "Kâbe'nin çevresi", 8: "Tavaftan sonra", 9: "Tavaftan sonra", 10: "Sa'y", 11: "Sa'y", 12: "Sa'y"}


def _ok(x1, y1, x2, y2, renk, kalin=1.6):
    return f'<path d="M{x1},{y1} L{x2},{y2}" stroke="{renk}" stroke-width="{kalin}" fill="none" marker-end="url(#ok)"/>'


def harita(vurgu=None):
    mini = vurgu is not None
    s = []
    s.append('<svg viewBox="0 0 640 440" xmlns="http://www.w3.org/2000/svg" font-family="Cairo, sans-serif">')
    s.append(f'<defs><marker id="ok" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">'
             f'<path d="M0,0 L10,5 L0,10 z" fill="{MAVI}"/></marker>'
             f'<pattern id="mermer" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0,8 L8,0" stroke="{BEYAZ}" stroke-width="1"/></pattern></defs>')
    # Metâf
    s.append(f'<circle cx="230" cy="210" r="182" fill="#f7f9fe"/>')
    s.append(f'<circle cx="230" cy="210" r="182" fill="none" stroke="{MAVI}" stroke-width="1.4" stroke-dasharray="5 5"/>')
    s.append(f'<circle cx="230" cy="210" r="140" fill="none" stroke="{BEYAZ}" stroke-width="22"/>')
    # Tavaf yönü (saat yönünün tersi): solda aşağı, sağda yukarı, üstte sola
    s.append(f'<path d="M62,150 A182,182 0 0 0 62,270" fill="none" stroke="{NAVY}" stroke-opacity=".55" stroke-width="2" marker-end="url(#okn)"/>')
    s.append(f'<path d="M398,270 A182,182 0 0 0 398,150" fill="none" stroke="{NAVY}" stroke-opacity=".55" stroke-width="2" marker-end="url(#okn)"/>')
    s.append(f'<path d="M290,40 A182,182 0 0 0 170,40" fill="none" stroke="{NAVY}" stroke-opacity=".55" stroke-width="2" marker-end="url(#okn)"/>')
    s.append(f'<defs><marker id="okn" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="{NAVY}" fill-opacity=".7"/></marker></defs>')
    if not mini:
        s.append(f'<text x="40" y="214" font-size="10" fill="{NAVY}" font-weight="700" letter-spacing="1.5" transform="rotate(-90 40 214)" text-anchor="middle">TAVAF YÖNÜ</text>')
    # Başlangıç çizgisi
    s.append(f'<path d="M290,270 L388,336" stroke="{YESIL}" stroke-width="3" stroke-linecap="round"/>')
    if not mini:
        s.append(f'<text x="392" y="350" font-size="10" fill="{YESIL}" font-weight="700">başlangıç çizgisi</text>')
    # Hatîm
    s.append(f'<path d="M182,150 A48,48 0 0 1 278,150" fill="{BEYAZ}" stroke="{MAVI}" stroke-width="5"/>')
    # Kâbe
    s.append(f'<rect x="170" y="150" width="120" height="120" rx="3" fill="{KABE}"/>')
    s.append(f'<rect x="170" y="166" width="120" height="8" fill="{ALTIN}" opacity=".9"/>')
    s.append(f'<rect x="290.5" y="160" width="6" height="34" rx="1.5" fill="{ALTIN}"/>')  # kapı
    s.append(f'<rect x="225" y="141" width="10" height="11" rx="1.5" fill="{ALTIN}"/>')  # Mîzâb
    s.append(f'<path d="M296,198 L296,264" stroke="#6f8fc6" stroke-width="5" stroke-linecap="round"/>')  # Mültezem
    s.append(f'<path d="M176,280 L284,280" stroke="#6f8fc6" stroke-width="5" stroke-linecap="round"/>')  # iki rükün
    s.append(f'<circle cx="290" cy="270" r="7" fill="{KABE}" stroke="#d9dde6" stroke-width="2.5"/>')  # Hacerü'l-Esved
    s.append(f'<circle cx="170" cy="270" r="4.5" fill="#d9dde6"/>')  # Yemânî
    if not mini:
        s.append(f'<text x="230" y="222" font-size="17" fill="#fff" font-weight="700" text-anchor="middle">Kâbe</text>')
        s.append(f'<text x="284" y="184" font-size="8.5" fill="{KUM}" text-anchor="end">kapı</text>')
        for x, y, t, a in ((160, 146, "Rükn-i Şâmî", "end"), (300, 146, "Rükn-i Irâkî", "start"), (160, 284, "Rükn-i Yemânî", "end")):
            s.append(f'<text x="{x}" y="{y}" font-size="9" fill="{MUTED}" text-anchor="{a}">{t}</text>')
    # Makam ve Zemzem
    s.append(f'<rect x="324" y="178" width="18" height="18" rx="4" fill="{KUM}" stroke="{ALTIN}" stroke-width="1.5"/>')
    s.append(f'<path d="M350,252 C350,252 342,262 342,267 a8,8 0 0 0 16,0 C358,262 350,252 350,252 z" fill="{BEYAZ}" stroke="{NAVY}" stroke-width="1.5"/>')
    # Sa'y yolu
    s.append(f'<rect x="500" y="30" width="80" height="380" rx="10" fill="#f7f9fe" stroke="{MAVI}" stroke-width="1.4"/>')
    s.append(f'<rect x="501" y="196" width="78" height="44" fill="{YESIL}" opacity=".12"/>')
    s.append(f'<path d="M501,196 L579,196 M501,240 L579,240" stroke="{YESIL}" stroke-width="3"/>')
    s.append(f'<path d="M540,368 L540,76" stroke="{MAVI}" stroke-width="1.6" stroke-dasharray="3 4" marker-end="url(#ok)"/>')
    s.append(f'<rect x="500" y="370" width="80" height="40" rx="10" fill="{NAVY}"/><rect x="500" y="30" width="80" height="40" rx="10" fill="{NAVY}"/>')
    if not mini:
        s.append(f'<text x="540" y="222" font-size="9" fill="{YESIL}" font-weight="700" text-anchor="middle">yeşil ışıklar</text>')
        s.append(f'<text x="586" y="222" font-size="8.5" fill="{MUTED}" transform="rotate(90 590 222)" text-anchor="middle">yaklaşık 450 m · 7 şavt</text>')
    # Tavaftan Sa'ye geçiş
    s.append(f'<path d="M384,276 C430,276 440,300 440,350 C440,385 470,390 496,390" stroke="{MAVI}" stroke-width="1.6" stroke-dasharray="4 4" fill="none" marker-end="url(#ok)"/>')
    if not mini:
        s.append(f'<text x="446" y="318" font-size="9" fill="{MUTED}">Sa\'ye geçiş</text>')
    # Harem kapısı
    s.append(f'<path d="M206,430 L206,418 A24,24 0 0 1 254,418 L254,430" fill="none" stroke="{NAVY}" stroke-width="2"/>')

    # Duraklar
    for n, (x, y, ad, yon) in DURAKLAR.items():
        if n in (10, 12):
            renk = KUM if vurgu == n else "#fff"
            yazi = f"{n} · {ad}" if not mini else ("● " if vurgu == n else "") + ad
            s.append(f'<text x="{x}" y="{y + 4}" font-size="{12 if not mini else 13}" fill="{renk}" font-weight="700" text-anchor="middle">{yazi}</text>')
            continue
        aktif = vurgu == n
        r = 22 if aktif else (11 if not mini else 8.5)
        dolgu = KUM if aktif else (NAVY if not mini else "#8a94ab")
        yazi_renk = NAVY if aktif else "#fff"
        if aktif:
            s.append(f'<circle cx="{x}" cy="{y}" r="36" fill="{KUM}" opacity=".4"/>')
        s.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{dolgu}" stroke="#fff" stroke-width="2"/>')
        s.append(f'<text x="{x}" y="{y + (7 if aktif else 4)}" font-size="{20 if aktif else (11 if not mini else 9)}" fill="{yazi_renk}" font-weight="700" text-anchor="middle">{n}</text>')
        if not mini:
            dx, anchor = {"r": (16, "start"), "l": (-16, "end"), "b": (0, "middle"), "c": (0, "middle")}[yon]
            dy = 26 if yon == "b" else 4
            if n == 1:
                dx, dy, anchor = 30, 4, "start"
            s.append(f'<text x="{x + dx}" y="{y + dy}" font-size="11" fill="{INK}" font-weight="700" text-anchor="{anchor}">{ad}</text>')
    s.append("</svg>")
    return "".join(s)
