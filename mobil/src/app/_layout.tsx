// Kök düzen: yazı tipleri, veri önbelleği (cihazda saklanır, çevrimdışı açılışta son veriler görünür), oturum ve bildirimler.
// Oturum yoksa giriş, kilitliyse kilit ekranı; açıkken sayfalar (Stack).
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import { useFonts, Cairo_400Regular, Cairo_500Medium, Cairo_600SemiBold, Cairo_700Bold, Cairo_800ExtraBold } from "@expo-google-fonts/cairo";
import { QueryClient, focusManager, onlineManager } from "@tanstack/react-query";
import { AppState } from "react-native";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { OturumSaglayici, useOturum } from "@/oturum/Oturum";
import { bildirimleriKur, useBildirimDinleyici } from "@/bildirim/kurulum";
import GirisEkrani from "@/ekranlar/Giris";
import KilitEkrani from "@/ekranlar/Kilit";
import { ApiHatasi } from "@/api/istemci";
import { R } from "@/tema";

SplashScreen.preventAutoHideAsync();

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      refetchOnWindowFocus: true,
      gcTime: 7 * 86_400_000,
      retry: (n, e) => !(e instanceof ApiHatasi && [401, 403, 404].includes(e.durum)) && n < 2,
    },
  },
});
// Admin paneliyle senkron: uygulama öne gelince açık ekranların verisi sunucudan yeniden okunur (aynı veritabanı)
focusManager.setEventListener((tazele) => {
  const abone = AppState.addEventListener("change", (s) => tazele(s === "active"));
  return () => abone.remove();
});
onlineManager.setOnline(true);

const saklayici = createAsyncStoragePersister({ storage: AsyncStorage, key: "hy-onbellek" });

function Icerik() {
  const { durum } = useOturum();
  useBildirimDinleyici(durum === "acik");
  useEffect(() => {
    if (durum !== "hazirlaniyor") SplashScreen.hideAsync();
    if (durum === "acik") bildirimleriKur().catch(() => {});
    if (durum === "giris") qc.clear();
  }, [durum]);

  if (durum === "hazirlaniyor") return null;
  if (durum === "giris") return <GirisEkrani />;
  if (durum === "kilitli") return <KilitEkrani />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: R.zemin }, animation: "slide_from_right" }} />;
}

export default function Kok() {
  const [hazir] = useFonts({ Cairo_400Regular, Cairo_500Medium, Cairo_600SemiBold, Cairo_700Bold, Cairo_800ExtraBold });
  if (!hazir) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: R.zemin }}>
      <PersistQueryClientProvider client={qc} persistOptions={{ persister: saklayici, maxAge: 7 * 86_400_000 }}>
        <OturumSaglayici>
          <StatusBar style="dark" />
          <Icerik />
        </OturumSaglayici>
      </PersistQueryClientProvider>
    </GestureHandlerRootView>
  );
}
