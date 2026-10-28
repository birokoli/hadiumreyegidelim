// Web admin sayfası uygulamanın içinde (28 Ekim, kullanıcı: "admin sayfasında ne yaparsam appte onu yapabilmeliyim").
// Uygulamanın kendi ekranı olmayan her admin sayfası (SEO Masası, blog, paketler, ayarlar…) burada, ayrı giriş istemeden açılır:
// tek kullanımlık geçiş kodu → sunucu admin çerezini yazar → sayfa. Aynı sunucu ve veritabanı; yapılan her şey web panelinde de görünür.
import { useCallback, useEffect, useRef, useState, type ComponentType, type Ref } from "react";
import { ActivityIndicator, BackHandler, Linking, View } from "react-native";
import { WebView, type WebViewNavigation, type WebViewProps } from "react-native-webview";

// react-native-webview 14 sınıf tipleri React 19.3 tipleriyle birleşmiyor (props "never" çıkıyor); çalışma zamanı aynı
const Web = WebView as unknown as ComponentType<WebViewProps & { ref?: Ref<WebView> }>;
import { router, useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { API_URL, istek } from "@/api/istemci";
import { Baslik, Dugme, Ekran, HataKutusu, IkonDugme } from "@/ui/temel";
import { R } from "@/tema";

export default function Panel() {
  const p = useLocalSearchParams<{ yol?: string; baslik?: string }>();
  const yol = p.yol && p.yol.startsWith("/admin") ? p.yol : "/admin";
  const [adres, setAdres] = useState<string | null>(null);
  const [hata, setHata] = useState<unknown>(null);
  const [geriVar, setGeriVar] = useState(false);
  const [baslik, setBaslik] = useState(p.baslik ?? "Admin");
  const web = useRef<WebView>(null);
  const qc = useQueryClient();

  const ac = useCallback(async (hedef: string) => {
    setHata(null);
    try {
      const { kod } = await istek<{ kod: string }>("/api/mobil/web-gecis", { govde: {} });
      setAdres(`${API_URL}/api/mobil/web-gecis?kod=${encodeURIComponent(kod)}&yol=${encodeURIComponent(hedef)}&t=${Date.now()}`);
    } catch (e) {
      setHata(e);
    }
  }, []);

  useEffect(() => {
    ac(yol);
  }, [ac, yol]);

  // Android geri tuşu önce sayfa geçmişinde geri gider
  useEffect(() => {
    const abone = BackHandler.addEventListener("hardwareBackPress", () => {
      if (geriVar) {
        web.current?.goBack();
        return true;
      }
      return false;
    });
    return () => abone.remove();
  }, [geriVar]);

  const degisti = (n: WebViewNavigation) => {
    setGeriVar(n.canGoBack);
    if (n.title && !n.loading && !/^https?:/.test(n.title)) setBaslik(n.title.replace(/\s*[|–-]\s*(Hadi Umreye Gidelim|Yönetim Paneli).*$/i, "").trim() || baslik);
    // Oturum düştüyse (giriş sayfasına yönlendi) yeni geçiş kodu ile aynı sayfaya dön
    if (n.url.includes("/admin/login") && !n.loading) ac(yol);
  };

  return (
    <View style={{ flex: 1, backgroundColor: R.zemin }}>
      <Baslik
        baslik={baslik}
        geri
        sag={
          <View style={{ flexDirection: "row", gap: 8 }}>
            <IkonDugme ikon="yenile" etiket="Yenile" onPress={() => web.current?.reload()} />
            <IkonDugme ikon="disari" etiket="Tarayıcıda aç" onPress={() => Linking.openURL(`${API_URL}${yol}`)} />
          </View>
        }
      />
      {hata ? (
        <Ekran>
          <HataKutusu hata={hata} tekrar={() => ac(yol)} />
          <Dugme metin="Geri dön" tur="hafif" onPress={() => router.back()} />
        </Ekran>
      ) : !adres ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={R.lacivert} size="large" /></View>
      ) : (
        <Web
          ref={web}
          source={{ uri: adres }}
          onNavigationStateChange={degisti}
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          domStorageEnabled
          javaScriptEnabled
          allowFileAccess
          allowsBackForwardNavigationGestures
          pullToRefreshEnabled
          setSupportMultipleWindows={false}
          startInLoadingState
          renderLoading={() => <View style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", backgroundColor: R.zemin }}><ActivityIndicator color={R.lacivert} size="large" /></View>}
          onShouldStartLoadWithRequest={(r: { url: string }) => {
            // Site dışı bağlantılar (WhatsApp, Instagram, telefon…) telefonun kendi uygulamasında açılır
            if (r.url.startsWith(API_URL) || r.url.startsWith("about:")) return true;
            Linking.openURL(r.url).catch(() => {});
            return false;
          }}
          onLoadEnd={() => qc.invalidateQueries()}
          style={{ flex: 1, backgroundColor: R.zemin }}
        />
      )}
    </View>
  );
}
