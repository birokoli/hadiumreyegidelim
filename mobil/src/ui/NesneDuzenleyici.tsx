// Ayar nesnesi düzenleyici: metin, sayı, açma/kapama, metin listesi ve tekrarlanan gruplar (ör. kampanya paketleri, SSS).
// Kampanya sayfaları ve benzeri büyük ayar nesneleri için: alanlar gruplara ayrılır, etiketler sözlükten gelir.
import { View } from "react-native";
import { Alan, Dugme, Kart, Yazi } from "./temel";
import { Anahtar, GorselAlan } from "./form";

type Deger = string | number | boolean | null | string[] | Record<string, unknown>[] | Record<string, unknown>;

export function NesneDuzenleyici({ nesne, degisti, etiket = {}, alanlar }: { nesne: Record<string, unknown>; degisti: (n: Record<string, unknown>) => void; etiket?: Record<string, string>; alanlar?: string[] }) {
  const set = (k: string, v: Deger) => degisti({ ...nesne, [k]: v });
  return (
    <>
      {(alanlar ?? Object.keys(nesne)).filter((k) => k in nesne).map((k) => <AlanDuzenle key={k} ad={k} etiket={etiket[k] ?? k} deger={nesne[k] as Deger} set={(v) => set(k, v)} sozluk={etiket} />)}
    </>
  );
}

const gorselMi = (k: string) => /image|gorsel|resim|logo|foto/i.test(k);
const uzunMu = (k: string, v: string) => v.length > 60 || /description|aciklama|detail|note|message|mesaj|metin|answer|^a$|bio/i.test(k);

function AlanDuzenle({ ad, etiket, deger, set, sozluk }: { ad: string; etiket: string; deger: Deger; set: (v: Deger) => void; sozluk: Record<string, string> }) {
  if (typeof deger === "boolean") return <Anahtar etiket={etiket} deger={deger} degisti={set} />;
  if (typeof deger === "number") return <Alan etiket={etiket} value={String(deger)} onChangeText={(x) => set(Number(x.replace(",", ".")) || 0)} keyboardType="decimal-pad" />;
  if (Array.isArray(deger)) {
    if (deger.length && deger.every((x) => Array.isArray(x))) {
      // Tablo satırları: her satır bir dizi; hücreler " | " ile ayrılır
      return <Alan etiket={`${etiket} (her satır bir sıra, hücreler | ile)`} value={(deger as unknown as string[][]).map((r) => r.join(" | ")).join("\n")} onChangeText={(x) => set(x.split("\n").map((r) => r.split("|").map((c) => c.trim())) as unknown as string[])} multiline />;
    }
    if (deger.every((x) => typeof x === "string")) {
      return <Alan etiket={`${etiket} (satır satır)`} value={(deger as string[]).join("\n")} onChangeText={(x) => set(x.split("\n"))} multiline />;
    }
    const liste = deger as Record<string, unknown>[];
    const sablon = Object.fromEntries(Object.keys(liste[0] ?? {}).map((k) => [k, ""]));
    return (
      <View style={{ gap: 8 }}>
        <Yazi tur="etiket">{etiket}</Yazi>
        {liste.map((o, i) => (
          <Kart key={i} style={{ gap: 8, padding: 12 }}>
            <NesneDuzenleyici nesne={o} etiket={sozluk} degisti={(n) => set(liste.map((x, j) => (j === i ? n : x)) as Record<string, unknown>[])} />
            <Dugme metin="Bu satırı kaldır" kucuk tur="tehlike" onPress={() => set(liste.filter((_, j) => j !== i) as Record<string, unknown>[])} />
          </Kart>
        ))}
        {liste.length ? <Dugme metin="Satır ekle" ikon="arti" kucuk tur="hafif" onPress={() => set([...liste, sablon] as Record<string, unknown>[])} /> : null}
      </View>
    );
  }
  if (deger && typeof deger === "object") {
    return (
      <View style={{ gap: 8 }}>
        <Yazi tur="etiket">{etiket}</Yazi>
        <NesneDuzenleyici nesne={deger as Record<string, unknown>} etiket={sozluk} degisti={set} />
      </View>
    );
  }
  const s = String(deger ?? "");
  if (gorselMi(ad)) return <GorselAlan etiket={etiket} deger={s || null} degisti={(u) => set(u ?? "")} />;
  return <Alan etiket={etiket} value={s} onChangeText={set} multiline={uzunMu(ad, s)} autoCapitalize={/url|slug|href/i.test(ad) ? "none" : "sentences"} />;
}
