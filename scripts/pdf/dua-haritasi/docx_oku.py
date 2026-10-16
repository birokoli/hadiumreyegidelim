"""icerik.docx'i (Word) bloklara çevirir; yalnızca standart kütüphane (16 Ekim 2026).

Blok: {"t": "h1"|"h2"|"h3"|"p"|"li"|"quote"|"img"|"table", "runs": [(metin, kalin, italik, link)], "num": "bullet"|"decimal"|None}
Tablo: {"t": "table", "rows": [[hücre_metni, ...], ...]}
"""
import re
import zipfile
import xml.etree.ElementTree as ET

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
R = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
STIL = {"Heading1": "h1", "Heading2": "h2", "Heading3": "h3", "ListParagraph": "li", "Quote": "quote"}


def _acik(el, ad):
    """w:b / w:i açık mı (w:val="0" ya da "false" kapalı demektir)."""
    x = el.find(f"{W}rPr/{W}{ad}")
    return x is not None and x.get(f"{W}val") not in ("0", "false")


def _runs(p, linkler):
    out = []
    for ch in p:
        if ch.tag == f"{W}r":
            metin = "".join(t.text or "" for t in ch.iter(f"{W}t"))
            if ch.find(f"{W}tab") is not None:
                metin = metin or " "
            if metin:
                out.append((metin, _acik(ch, "b"), _acik(ch, "i"), None))
        elif ch.tag == f"{W}hyperlink":
            href = linkler.get(ch.get(f"{R}id"))
            for r in ch.iter(f"{W}r"):
                metin = "".join(t.text or "" for t in r.iter(f"{W}t"))
                if metin:
                    out.append((metin, _acik(r, "b"), _acik(r, "i"), href))
    # Aynı biçimdeki komşu parçaları birleştir
    birlesik = []
    for r in out:
        if birlesik and birlesik[-1][1:] == r[1:]:
            birlesik[-1] = (birlesik[-1][0] + r[0],) + r[1:]
        else:
            birlesik.append(r)
    return birlesik


def oku(yol):
    z = zipfile.ZipFile(yol)
    doc = ET.fromstring(z.read("word/document.xml"))
    rels = ET.fromstring(z.read("word/_rels/document.xml.rels"))
    linkler = {r.get("Id"): r.get("Target") for r in rels if r.get("Type", "").endswith("/hyperlink")}
    numara = {}
    try:
        num = ET.fromstring(z.read("word/numbering.xml"))
        soyut = {}
        for a in num.findall(f"{W}abstractNum"):
            fmt = a.find(f"{W}lvl/{W}numFmt")
            soyut[a.get(f"{W}abstractNumId")] = fmt.get(f"{W}val") if fmt is not None else "bullet"
        for n in num.findall(f"{W}num"):
            numara[n.get(f"{W}numId")] = soyut.get(n.find(f"{W}abstractNumId").get(f"{W}val"), "bullet")
    except KeyError:
        pass

    bloklar = []
    for el in doc.find(f"{W}body"):
        if el.tag == f"{W}p":
            stil = el.find(f"{W}pPr/{W}pStyle")
            t = STIL.get(stil.get(f"{W}val") if stil is not None else "", "p")
            if el.find(f".//{W}drawing") is not None:
                bloklar.append({"t": "img"})
            runs = _runs(el, linkler)
            n = el.find(f"{W}pPr/{W}numPr/{W}numId")
            fmt = numara.get(n.get(f"{W}val")) if n is not None else None
            if t == "p" and fmt:
                t = "li"
            if runs and "".join(r[0] for r in runs).strip():
                bloklar.append({"t": t, "runs": runs, "num": fmt})
        elif el.tag == f"{W}tbl":
            rows = []
            for tr in el.findall(f"{W}tr"):
                rows.append([re.sub(r"\s+", " ", " / ".join(
                    "".join(t.text or "" for t in p.iter(f"{W}t")) for p in tc.findall(f"{W}p"))).strip(" /")
                    for tc in tr.findall(f"{W}tc")])
            bloklar.append({"t": "table", "rows": rows})
    return bloklar


def duz(b):
    return "".join(r[0] for r in b.get("runs", []))
