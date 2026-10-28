// Sekmeler: telefonda altta, tablette (kısa kenar ≥ 600 dp) solda yan menü. Rozetler canlı sayaçlardan.
import { Tabs } from "expo-router/js-tabs";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ikon from "@/ikonlar/Ikon";
import { useOzet } from "@/veri/sorgular";
import { R, TABLET_ESIK, Y } from "@/tema";

export default function Sekmeler() {
  const { width, height } = useWindowDimensions();
  const tablet = Math.min(width, height) >= TABLET_ESIK;
  const alt = useSafeAreaInsets().bottom;
  const ozet = useOzet().data;
  const sayac = ozet?.sayac;
  const rozet = (n?: number) => (n ? (n > 99 ? "99+" : n) : undefined);
  const ikon = (ad: string) => ({ color }: { color: unknown }) => <Ikon ad={ad} boyut={24} renk={String(color ?? R.soluk)} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: R.lacivert,
        tabBarInactiveTintColor: R.soluk,
        tabBarLabelStyle: { fontFamily: Y.yari, fontSize: 12 },
        tabBarBadgeStyle: { backgroundColor: R.kirmizi, fontFamily: Y.kalin, fontSize: 11 },
        tabBarStyle: tablet ? { backgroundColor: R.kart, borderRightColor: R.cizgi, width: 96 } : { backgroundColor: R.kart, borderTopColor: R.cizgi, height: 64 + alt, paddingTop: 6 },
        tabBarPosition: tablet ? "left" : "bottom",
        tabBarVariant: tablet ? "material" : "uikit",
        sceneStyle: { backgroundColor: R.zemin },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Bugün", tabBarIcon: ikon("ev") }} />
      <Tabs.Screen name="satis" options={{ title: "Satış", tabBarIcon: ikon("dosya"), tabBarBadge: rozet(sayac?.dosya?.talep) }} />
      <Tabs.Screen name="talepler" options={{ title: "Talepler", tabBarIcon: ikon("gelen"), tabBarBadge: rozet(sayac?.yeniTalep) }} />
      <Tabs.Screen name="bildirimler" options={{ title: "Bildirimler", tabBarIcon: ikon("zil"), tabBarBadge: rozet(sayac?.okunmamis) }} />
      <Tabs.Screen name="daha" options={{ title: "Daha", tabBarIcon: ikon("izgara"), tabBarBadge: rozet((sayac?.yorum ?? 0) + (sayac?.icerik ?? 0) + (sayac?.basvuru ?? 0) + (sayac?.destek ?? 0) + (sayac?.whatsapp ?? 0)) }} />
    </Tabs>
  );
}
