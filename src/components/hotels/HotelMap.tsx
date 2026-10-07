"use client";
// Otel haritası (7 Ekim, kullanıcı): sitenin renklerinde; Kâbe (Medine'de Mescid-i Nebevi) ve otel işaretli, aralarında
// kesik çizgi. Altlık OpenFreeMap (ücretsiz, anahtarsız, ticari kullanım serbest), MapLibre ile. Kütüphane yalnızca
// harita görünür alana gelince yüklenir; sayfa açılışını yavaşlatmaz.
import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

const LANDMARK = {
  mekke: { name: "Kâbe", lat: 21.42250, lon: 39.82620, icon: "kabe" },
  medine: { name: "Mescid-i Nebevi", lat: 24.46720, lon: 39.61110, icon: "medine" },
} as const;

// Pantone paleti: 7687C #1d428a, 2127C #b8c9e3, Brilliant White #edf1fe
const PAINT: [RegExp, string, string][] = [
  [/^background$/, "background-color", "#f7f9fe"],
  [/^water$/, "fill-color", "#b8c9e3"],
  [/^park$|landcover_wood/, "fill-color", "#e8eef9"],
  [/landuse_residential/, "fill-color", "#eef2fb"],
  [/^building$/, "fill-color", "#e3e9f6"],
  [/highway_(minor|path)/, "line-color", "#ffffff"],
  [/highway_(major|motorway)_(inner|subtle)/, "line-color", "#ffffff"],
  [/_casing$/, "line-color", "#d5deef"],
];

function pin(icon: string, label: string, tone: "navy" | "white") {
  const el = document.createElement("div");
  const navy = tone === "navy";
  el.setAttribute("aria-label", label);
  el.style.cssText = `display:flex;align-items:center;gap:6px;padding:6px 10px 6px 6px;border-radius:999px;font:600 12px/1 Cairo,system-ui,sans-serif;white-space:nowrap;box-shadow:0 4px 14px rgba(29,66,138,.25);background:${navy ? "#1d428a" : "#fff"};color:${navy ? "#fff" : "#1d428a"};border:1px solid ${navy ? "#1d428a" : "#b8c9e3"}`;
  const ic = document.createElement("span");
  ic.style.cssText = `display:inline-block;width:20px;height:20px;background:${navy ? "#fff" : "#1d428a"};-webkit-mask:url(/ikon/${icon}.svg) center/contain no-repeat;mask:url(/ikon/${icon}.svg) center/contain no-repeat`;
  el.append(ic, document.createTextNode(label));
  return el;
}

export default function HotelMap({ name, lat, lon, city = "mekke", distanceLabel }: { name: string; lat: number; lon: number; city?: "mekke" | "medine"; distanceLabel?: string | null }) {
  const box = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const lm = LANDMARK[city];

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !box.current) return;
    let map: import("maplibre-gl").Map | undefined;
    let cancelled = false;
    import("maplibre-gl").then(({ default: maplibregl }) => {
      if (cancelled || !box.current) return;
      map = new maplibregl.Map({
        container: box.current,
        style: "https://tiles.openfreemap.org/styles/positron",
        center: [(lon + lm.lon) / 2, (lat + lm.lat) / 2],
        zoom: 14,
        cooperativeGestures: true,
        attributionControl: { compact: true },
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      const side = Math.min(140, Math.round(box.current.clientWidth * 0.22));
      map.fitBounds([[Math.min(lon, lm.lon), Math.min(lat, lm.lat)], [Math.max(lon, lm.lon), Math.max(lat, lm.lat)]], { padding: { top: 60, bottom: 60, left: side, right: side }, maxZoom: 16.5, duration: 0 });
      map.on("load", () => {
        if (!map) return;
        for (const layer of map.getStyle().layers ?? []) {
          for (const [re, prop, color] of PAINT) if (re.test(layer.id)) map.setPaintProperty(layer.id, prop as never, color);
          if (layer.type === "symbol") map.setPaintProperty(layer.id, "text-color", "#5b6680");
        }
        map.addSource("link", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[lon, lat], [lm.lon, lm.lat]] } } });
        map.addLayer({ id: "link", type: "line", source: "link", paint: { "line-color": "#1d428a", "line-width": 2.5, "line-dasharray": [2, 2] } });
      });
      new maplibregl.Marker({ element: pin(lm.icon, lm.name, "navy") }).setLngLat([lm.lon, lm.lat]).addTo(map);
      new maplibregl.Marker({ element: pin("otel", name, "white") }).setLngLat([lon, lat]).addTo(map);
    });
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [visible, lat, lon, lm, name]);

  const walk = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lon}&destination=${lm.lat},${lm.lon}&travelmode=walking`;

  return (
    <div className="overflow-hidden rounded-2xl border border-outline-variant/20 bg-white">
      <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 pt-4">
        <h2 className="font-headline text-lg font-bold text-primary">{name} ve {lm.name}</h2>
        {distanceLabel && <span className="text-[13px] text-on-surface-variant">Kuş uçuşu {distanceLabel}</span>}
      </div>
      <div ref={box} className="mt-3 h-80 w-full bg-[#f7f9fe]" role="region" aria-label={`${name} ile ${lm.name} arasındaki harita`} />
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-[13px]">
        <span className="text-on-surface-variant">Yakınlaştırmak için Ctrl / iki parmak kullanın.</span>
        <a href={walk} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">{lm.name}&apos;ye yürüme rotası</a>
      </div>
    </div>
  );
}
