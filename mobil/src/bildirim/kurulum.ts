// Anlık bildirimler: Android kanalları (her olay türü ayrı kanal, telefonun ayarlarından ayrı ayrı susturulabilir),
// izin, FCM anahtarının sunucuya kaydı ve bildirime dokununca ilgili ekranı açma.
import { useEffect } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { istek } from "@/api/istemci";

export const KANALLAR: { id: string; ad: string; onem: Notifications.AndroidImportance }[] = [
  { id: "talep", ad: "Yeni talepler", onem: Notifications.AndroidImportance.HIGH },
  { id: "teklif", ad: "Teklif açıldı / onaylandı", onem: Notifications.AndroidImportance.HIGH },
  { id: "odeme", ad: "Ödemeler", onem: Notifications.AndroidImportance.HIGH },
  { id: "ramazan", ad: "Ramazan rezervasyonları", onem: Notifications.AndroidImportance.HIGH },
  { id: "hatirlatma", ad: "Hatırlatmalar", onem: Notifications.AndroidImportance.DEFAULT },
  { id: "uye", ad: "Yeni üyeler", onem: Notifications.AndroidImportance.LOW },
  { id: "yorum", ad: "Yorum onayı", onem: Notifications.AndroidImportance.DEFAULT },
  { id: "icerik", ad: "Influencer içerikleri", onem: Notifications.AndroidImportance.DEFAULT },
  { id: "basvuru", ad: "Influencer başvuruları", onem: Notifications.AndroidImportance.DEFAULT },
  { id: "destek", ad: "Destek mesajları", onem: Notifications.AndroidImportance.HIGH },
  { id: "whatsapp", ad: "WhatsApp devirleri", onem: Notifications.AndroidImportance.HIGH },
];

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: true }),
});

/** Kanallar → izin → anahtar → sunucu. İzin verilmezse sessizce geçer (uygulama içi Bildirimler listesi yine çalışır). */
export async function bildirimleriKur(): Promise<"acik" | "izin-yok" | "desteklenmiyor"> {
  if (Platform.OS !== "android") return "desteklenmiyor";
  for (const k of KANALLAR) {
    await Notifications.setNotificationChannelAsync(k.id, { name: k.ad, importance: k.onem, lightColor: "#B8902A", vibrationPattern: [0, 200, 120, 200] });
  }
  const izin = await Notifications.getPermissionsAsync();
  const sonuc = izin.granted ? izin : await Notifications.requestPermissionsAsync();
  if (!sonuc.granted) return "izin-yok";
  try {
    const t = await Notifications.getDevicePushTokenAsync();
    await istek("/api/mobil/bildirim-anahtari", { govde: { anahtar: String(t.data) } });
    return "acik";
  } catch (e) {
    // Firebase yapılandırması (google-services.json) yoksa anahtar alınamaz; uygulama yine çalışır
    console.warn("[bildirim] anahtar alınamadı", e);
    return "desteklenmiyor";
  }
}

/** Kök düzende: dokunulan bildirimin ekranını açar, gelen bildirimde listeleri tazeler, anahtar değişirse yeniden kaydeder */
export function useBildirimDinleyici(aktif: boolean) {
  const qc = useQueryClient();
  const son = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (!aktif || !son || son.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const yol = son.notification.request.content.data?.yol;
    if (typeof yol === "string" && yol.startsWith("/")) router.push(yol as never);
    Notifications.clearLastNotificationResponseAsync();
  }, [aktif, son]);

  useEffect(() => {
    if (!aktif) return;
    const gelen = Notifications.addNotificationReceivedListener(() => qc.invalidateQueries());
    const anahtar = Notifications.addPushTokenListener((t) => {
      istek("/api/mobil/bildirim-anahtari", { govde: { anahtar: String(t.data) } }).catch(() => {});
    });
    return () => {
      gelen.remove();
      anahtar.remove();
    };
  }, [aktif, qc]);
}
