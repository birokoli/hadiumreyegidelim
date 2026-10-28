// Sunucu istemcisi: her istekte 1 saatlik erişim anahtarı (Bearer). 401 gelirse yenileme anahtarıyla bir kez yenilenir;
// yenileme de reddedilirse oturum kapanır (giriş ekranı). Anahtarlar cihazın güvenli deposunda (expo-secure-store).
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import * as Application from "expo-application";

export const API_URL: string = process.env.EXPO_PUBLIC_API_URL || (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl || "https://hadiumreyegidelim.com";
export const SURUM = Application.nativeApplicationVersion ?? Constants.expoConfig?.version ?? "1.0.0";

const K_ERISIM = "hy_erisim";
const K_YENILEME = "hy_yenileme";
const K_YONETICI = "hy_yonetici";

export type Yonetici = { id: string; ad: string; kullaniciAdi: string; rol: string; yetkiler: string[] };
type Anahtarlar = { erisim: string; yenileme: string; yonetici: Yonetici };

let erisim: string | null = null;
let yenilemeSuruyor: Promise<boolean> | null = null;
let oturumKapandi: (() => void) | null = null;

export class ApiHatasi extends Error {
  constructor(public durum: number, mesaj: string) {
    super(mesaj);
  }
}

export function oturumKapaninca(f: () => void) {
  oturumKapandi = f;
}

export async function kayitliOturum(): Promise<Yonetici | null> {
  const [e, y, k] = await Promise.all([SecureStore.getItemAsync(K_ERISIM), SecureStore.getItemAsync(K_YENILEME), SecureStore.getItemAsync(K_YONETICI)]);
  if (!y || !k) return null;
  erisim = e;
  try {
    return JSON.parse(k) as Yonetici;
  } catch {
    return null;
  }
}

async function sakla(a: Anahtarlar) {
  erisim = a.erisim;
  await Promise.all([
    SecureStore.setItemAsync(K_ERISIM, a.erisim),
    SecureStore.setItemAsync(K_YENILEME, a.yenileme),
    SecureStore.setItemAsync(K_YONETICI, JSON.stringify(a.yonetici)),
  ]);
}

export async function temizle() {
  erisim = null;
  await Promise.all([SecureStore.deleteItemAsync(K_ERISIM), SecureStore.deleteItemAsync(K_YENILEME), SecureStore.deleteItemAsync(K_YONETICI)]);
}

async function jsonVeHata(r: Response) {
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new ApiHatasi(r.status, (j && (j.hata || j.error)) || `Sunucu hatası (${r.status})`);
  return j;
}

export async function girisYap(kullanici: string, sifre: string, cihazAdi: string): Promise<Yonetici> {
  const r = await fetch(`${API_URL}/api/mobil/giris`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ kullanici, sifre, cihazAdi, platform: "android", surum: SURUM }),
  });
  const a = (await jsonVeHata(r)) as Anahtarlar;
  await sakla(a);
  return a.yonetici;
}

/** Yenileme anahtarıyla yeni erişim anahtarı; aynı anda gelen 401'ler tek yenilemeyi bekler */
async function yenile(): Promise<boolean> {
  yenilemeSuruyor ??= (async () => {
    const y = await SecureStore.getItemAsync(K_YENILEME);
    if (!y) return false;
    try {
      const r = await fetch(`${API_URL}/api/mobil/yenile`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ yenileme: y, surum: SURUM }) });
      if (r.status === 401) return false;
      if (!r.ok) throw new Error(String(r.status));
      await sakla((await r.json()) as Anahtarlar);
      return true;
    } catch {
      // Ağ hatasında oturum kapatılmaz; istek hata verir, kullanıcı yeniden dener
      throw new ApiHatasi(0, "Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.");
    }
  })().finally(() => {
    yenilemeSuruyor = null;
  });
  return yenilemeSuruyor;
}

export async function istek<T = unknown>(yol: string, secenek: { method?: string; govde?: unknown } = {}): Promise<T> {
  const gonder = () =>
    fetch(`${API_URL}${yol}`, {
      method: secenek.method ?? (secenek.govde !== undefined ? "POST" : "GET"),
      headers: { authorization: `Bearer ${erisim ?? ""}`, ...(secenek.govde !== undefined ? { "content-type": "application/json" } : {}) },
      body: secenek.govde !== undefined ? JSON.stringify(secenek.govde) : undefined,
    });
  let r: Response;
  try {
    r = await gonder();
    if (r.status === 401) {
      if (!(await yenile())) {
        await temizle();
        oturumKapandi?.();
        throw new ApiHatasi(401, "Oturum sona erdi. Yeniden giriş yapın.");
      }
      r = await gonder();
    }
  } catch (e) {
    if (e instanceof ApiHatasi) throw e;
    throw new ApiHatasi(0, "Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.");
  }
  if (r.status === 403) throw new ApiHatasi(403, "Bu işlem için yetkiniz yok.");
  return (await jsonVeHata(r)) as T;
}

export async function cikisYap() {
  await istek("/api/mobil/cikis", { govde: {} }).catch(() => {});
  await temizle();
}
