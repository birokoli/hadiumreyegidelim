// Ortak bileşenler. Dokunmalar Pressable + hafif titreşim (expo-haptics); gölgeler yumuşak, köşeler marka ölçüsünde.
import { type ReactNode } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Ikon from "@/ikonlar/Ikon";
import { BOSLUK, KOSE, R, Y } from "@/tema";

export const titret = () => Haptics.selectionAsync().catch(() => {});

export function Yazi({ children, tur = "govde", renk, style, satir }: { children: ReactNode; tur?: "baslik" | "altBaslik" | "govde" | "kucuk" | "etiket" | "buyuk"; renk?: string; style?: StyleProp<TextStyle>; satir?: number }) {
  return (
    <Text numberOfLines={satir} style={[s[tur], renk ? { color: renk } : null, style]}>
      {children}
    </Text>
  );
}

/** Sekme ve alt sayfaların başlığı: büyük başlık, isteğe bağlı geri ve sağ düğmeler */
export function Baslik({ baslik, alt, geri, sag }: { baslik: string; alt?: string; geri?: boolean; sag?: ReactNode }) {
  const ust = useSafeAreaInsets().top;
  return (
    <View style={[s.baslikKutu, { paddingTop: ust + BOSLUK.s }]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: BOSLUK.s }}>
        {geri && (
          <Pressable hitSlop={12} onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} style={s.geri}>
            <Ikon ad="geri" boyut={24} />
          </Pressable>
        )}
        <View style={{ flex: 1 }}>
          <Yazi tur={geri ? "altBaslik" : "buyuk"} satir={1}>{baslik}</Yazi>
          {alt ? <Yazi tur="kucuk" satir={1}>{alt}</Yazi> : null}
        </View>
        {sag}
      </View>
    </View>
  );
}

export function Ekran({ children, yenile, yenileniyor, kaydir = true, style }: { children: ReactNode; yenile?: () => void; yenileniyor?: boolean; kaydir?: boolean; style?: StyleProp<ViewStyle> }) {
  if (!kaydir) return <View style={[{ flex: 1, backgroundColor: R.zemin }, style]}>{children}</View>;
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: R.zemin }}
      contentContainerStyle={[{ padding: BOSLUK.l, paddingBottom: 48, gap: BOSLUK.m }, style]}
      refreshControl={yenile ? <RefreshControl refreshing={!!yenileniyor} onRefresh={yenile} colors={[R.lacivert]} /> : undefined}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

export function Kart({ children, style, onPress }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  if (!onPress) return <View style={[s.kart, style]}>{children}</View>;
  return (
    <Pressable onPress={() => (titret(), onPress())} style={({ pressed }) => [s.kart, pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] }, style]}>
      {children}
    </Pressable>
  );
}

export function Satir({ ikon, baslik, alt, sag, onPress, rozet }: { ikon?: string; baslik: string; alt?: string; sag?: ReactNode; onPress?: () => void; rozet?: number }) {
  return (
    <Pressable onPress={onPress ? () => (titret(), onPress()) : undefined} style={({ pressed }) => [s.satir, pressed && onPress ? { backgroundColor: R.maviZemin } : null]}>
      {ikon ? (
        <View style={s.satirIkon}>
          <Ikon ad={ikon} boyut={22} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Yazi tur="govde" style={{ fontFamily: Y.yari, color: R.yazi }} satir={1}>{baslik}</Yazi>
        {alt ? <Yazi tur="kucuk" satir={2}>{alt}</Yazi> : null}
      </View>
      {rozet ? <Sayi n={rozet} /> : null}
      {sag ?? (onPress ? <Ikon ad="ileri" boyut={18} renk={R.soluk} /> : null)}
    </Pressable>
  );
}

export const Ayrac = () => <View style={{ height: 1, backgroundColor: R.cizgi, marginLeft: 56 }} />;

export function Sayi({ n }: { n: number }) {
  return (
    <View style={s.sayi}>
      <Text style={s.sayiYazi}>{n > 99 ? "99+" : n}</Text>
    </View>
  );
}

const TON = {
  mavi: [R.maviZemin, R.lacivert], yesil: [R.yesilZemin, R.yesil], kirmizi: [R.kirmiziZemin, R.kirmizi],
  turuncu: [R.turuncuZemin, R.turuncu], kum: ["#FBF3DE", R.altin], gri: ["#EEF1F6", R.metin],
} as const;
export type Ton = keyof typeof TON;
export function Rozet({ metin, ton = "mavi" }: { metin: string; ton?: Ton }) {
  return (
    <View style={[s.rozet, { backgroundColor: TON[ton][0] }]}>
      <Text style={[s.rozetYazi, { color: TON[ton][1] }]}>{metin}</Text>
    </View>
  );
}

export function Dugme({ metin, onPress, ikon, tur = "ana", yukleniyor, devreDisi, kucuk, style }: { metin: string; onPress: () => void; ikon?: string; tur?: "ana" | "ikincil" | "tehlike" | "whatsapp" | "hafif"; yukleniyor?: boolean; devreDisi?: boolean; kucuk?: boolean; style?: StyleProp<ViewStyle> }) {
  const renk = { ana: [R.lacivert, "#fff"], ikincil: [R.kart, R.lacivert], tehlike: [R.kirmiziZemin, R.kirmizi], whatsapp: [R.whatsapp, "#fff"], hafif: [R.maviZemin, R.lacivert] }[tur];
  return (
    <Pressable
      disabled={devreDisi || yukleniyor}
      onPress={() => (titret(), onPress())}
      style={({ pressed }) => [s.dugme, kucuk && s.dugmeKucuk, { backgroundColor: renk[0] }, tur === "ikincil" && { borderWidth: 1, borderColor: R.cizgi }, (pressed || devreDisi) && { opacity: 0.7 }, style]}
    >
      {yukleniyor ? <ActivityIndicator color={renk[1]} /> : ikon ? <Ikon ad={ikon} boyut={kucuk ? 18 : 20} renk={renk[1]} /> : null}
      <Text style={[s.dugmeYazi, kucuk && { fontSize: 14 }, { color: renk[1] }]}>{metin}</Text>
    </Pressable>
  );
}

export function IkonDugme({ ikon, onPress, renk = R.lacivert, zemin = R.kart, etiket }: { ikon: string; onPress: () => void; renk?: string; zemin?: string; etiket?: string }) {
  return (
    <Pressable accessibilityLabel={etiket} hitSlop={8} onPress={() => (titret(), onPress())} style={({ pressed }) => [s.ikonDugme, { backgroundColor: zemin }, pressed && { opacity: 0.7 }]}>
      <Ikon ad={ikon} boyut={22} renk={renk} />
    </Pressable>
  );
}

export function Arama({ deger, degisti, yer = "Ara" }: { deger: string; degisti: (s: string) => void; yer?: string }) {
  return (
    <View style={s.arama}>
      <Ikon ad="ara2" boyut={20} renk={R.soluk} />
      <TextInput value={deger} onChangeText={degisti} placeholder={yer} placeholderTextColor={R.soluk} style={s.aramaGirdi} autoCorrect={false} clearButtonMode="while-editing" />
      {deger ? (
        <Pressable hitSlop={10} onPress={() => degisti("")}>
          <Ikon ad="kapat" boyut={18} renk={R.soluk} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function Segment<T extends string>({ secenekler, deger, degisti }: { secenekler: { deger: T; etiket: string; sayi?: number }[]; deger: T; degisti: (d: T) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: BOSLUK.s }}>
      {secenekler.map((o) => {
        const secili = o.deger === deger;
        return (
          <Pressable key={o.deger} onPress={() => (titret(), degisti(o.deger))} style={[s.cip, secili && { backgroundColor: R.lacivert, borderColor: R.lacivert }]}>
            <Text style={[s.cipYazi, secili && { color: "#fff" }]}>
              {o.etiket}
              {o.sayi != null ? `  ${o.sayi}` : ""}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function Sayac({ etiket, deger, ikon, ton = "mavi", onPress }: { etiket: string; deger: number | string; ikon: string; ton?: Ton; onPress?: () => void }) {
  return (
    <Kart onPress={onPress} style={{ flex: 1, minWidth: 150, gap: BOSLUK.s }}>
      <View style={[s.sayacIkon, { backgroundColor: TON[ton][0] }]}>
        <Ikon ad={ikon} boyut={20} renk={TON[ton][1]} />
      </View>
      <Text style={s.sayacDeger}>{deger}</Text>
      <Yazi tur="kucuk" satir={1}>{etiket}</Yazi>
    </Kart>
  );
}

export function Yukleniyor() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40, backgroundColor: R.zemin }}>
      <ActivityIndicator color={R.lacivert} size="large" />
    </View>
  );
}

export function Bos({ ikon = "tik", baslik, alt }: { ikon?: string; baslik: string; alt?: string }) {
  return (
    <View style={{ alignItems: "center", padding: 32, gap: 8 }}>
      <View style={[s.sayacIkon, { width: 56, height: 56, borderRadius: 28 }]}>
        <Ikon ad={ikon} boyut={28} />
      </View>
      <Yazi tur="altBaslik" style={{ textAlign: "center" }}>{baslik}</Yazi>
      {alt ? <Yazi tur="kucuk" style={{ textAlign: "center" }}>{alt}</Yazi> : null}
    </View>
  );
}

export function HataKutusu({ hata, tekrar }: { hata: unknown; tekrar?: () => void }) {
  return (
    <Kart style={{ backgroundColor: R.kirmiziZemin, gap: 8 }}>
      <Yazi tur="govde" renk={R.kirmizi} style={{ fontFamily: Y.yari }}>{hata instanceof Error ? hata.message : "Bir şeyler ters gitti."}</Yazi>
      {tekrar ? <Dugme metin="Tekrar dene" tur="tehlike" kucuk onPress={tekrar} ikon="yenile" /> : null}
    </Kart>
  );
}

export function Bolum({ baslik, children, sag }: { baslik: string; children: ReactNode; sag?: ReactNode }) {
  return (
    <View style={{ gap: BOSLUK.s }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 4 }}>
        <Yazi tur="etiket">{baslik}</Yazi>
        {sag}
      </View>
      {children}
    </View>
  );
}

export function Alan({ etiket, ...p }: { etiket: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={{ gap: 6 }}>
      <Yazi tur="etiket">{etiket}</Yazi>
      <TextInput placeholderTextColor={R.soluk} {...p} style={[s.girdi, p.multiline && { minHeight: 96, textAlignVertical: "top", paddingTop: 12 }, p.style]} />
    </View>
  );
}

const s = StyleSheet.create({
  buyuk: { fontFamily: Y.ekstra, fontSize: 30, color: R.yazi, letterSpacing: -0.4, lineHeight: 38 },
  baslik: { fontFamily: Y.kalin, fontSize: 22, color: R.yazi, lineHeight: 30 },
  altBaslik: { fontFamily: Y.kalin, fontSize: 18, color: R.yazi, lineHeight: 26 },
  govde: { fontFamily: Y.normal, fontSize: 15.5, color: R.yazi, lineHeight: 23 },
  kucuk: { fontFamily: Y.normal, fontSize: 13.5, color: R.metin, lineHeight: 19 },
  etiket: { fontFamily: Y.kalin, fontSize: 12, color: R.metin, letterSpacing: 1.2, textTransform: "uppercase" },
  baslikKutu: { backgroundColor: R.zemin, paddingHorizontal: BOSLUK.l, paddingBottom: BOSLUK.s },
  geri: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: R.kart },
  kart: { backgroundColor: R.kart, borderRadius: KOSE.l, padding: BOSLUK.l, shadowColor: R.gece, shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 1 },
  satir: { flexDirection: "row", alignItems: "center", gap: BOSLUK.m, paddingVertical: 12, paddingHorizontal: BOSLUK.l, backgroundColor: R.kart, minHeight: 56 },
  satirIkon: { width: 36, height: 36, borderRadius: 12, backgroundColor: R.maviZemin, alignItems: "center", justifyContent: "center" },
  sayi: { minWidth: 22, height: 22, borderRadius: 11, backgroundColor: R.kirmizi, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  sayiYazi: { color: "#fff", fontFamily: Y.kalin, fontSize: 12 },
  rozet: { alignSelf: "flex-start", borderRadius: KOSE.hap, paddingHorizontal: 10, paddingVertical: 3 },
  rozetYazi: { fontFamily: Y.kalin, fontSize: 12 },
  dugme: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 50, borderRadius: KOSE.m, paddingHorizontal: 18 },
  dugmeKucuk: { minHeight: 40, paddingHorizontal: 14, borderRadius: KOSE.s },
  dugmeYazi: { fontFamily: Y.kalin, fontSize: 16 },
  ikonDugme: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  arama: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: R.kart, borderRadius: KOSE.m, paddingHorizontal: 14, minHeight: 48, borderWidth: 1, borderColor: R.cizgi },
  aramaGirdi: { flex: 1, fontFamily: Y.normal, fontSize: 16, color: R.yazi, paddingVertical: 10 },
  cip: { borderRadius: KOSE.hap, borderWidth: 1, borderColor: R.cizgi, backgroundColor: R.kart, paddingHorizontal: 14, paddingVertical: 8 },
  cipYazi: { fontFamily: Y.yari, fontSize: 14, color: R.yazi },
  sayacIkon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: R.maviZemin },
  sayacDeger: { fontFamily: Y.ekstra, fontSize: 28, color: R.yazi, lineHeight: 34 },
  girdi: { backgroundColor: R.kart, borderRadius: KOSE.m, borderWidth: 1, borderColor: R.cizgi, paddingHorizontal: 14, minHeight: 50, fontFamily: Y.normal, fontSize: 16, color: R.yazi },
});
