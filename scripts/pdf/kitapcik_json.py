#!/usr/bin/env python3
"""Kitapçık içeriklerini profil "Şavt modu" için JSON'a çevirir (13 Ekim 2026).

Kaynak tek: scripts/pdf/<kitap>/icerik.txt (hoca düzeltmeleri orada). PDF üreticilerinin kendi okuyucuları kullanılır.
Çıktı: src/content/kitapcik/<slug>.json. İçerik değişince bu betiği de çalıştırın.

Çalıştır: python3 scripts/pdf/kitapcik_json.py
"""
import importlib.util
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "src" / "content" / "kitapcik"


def yukle(ad):
    spec = importlib.util.spec_from_file_location(f"{ad}_uret", ROOT / f"scripts/pdf/{ad}/uret.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for ad, slug in (("tavaf", "tavaf"), ("say", "say")):
        mod = yukle(ad)
        savtlar = mod.parse((ROOT / f"scripts/pdf/{ad}/icerik.txt").read_text(encoding="utf-8"))
        (OUT / f"{slug}.json").write_text(json.dumps({"slug": slug, "savtlar": savtlar}, ensure_ascii=False, indent=1), encoding="utf-8")
        print(slug, len(savtlar), "şavt")


if __name__ == "__main__":
    main()
