// Oturum durumu: hazırlanıyor → giriş | kilitli | açık. Kilit: uygulama açılışında ve 5 dakikadan uzun arka planda
// kaldıktan sonra parmak izi / yüz / cihaz şifresi istenir (cihazda biyometri yoksa kilit uygulanmaz).
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AppState } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { cikisYap, girisYap, kayitliOturum, oturumKapaninca, type Yonetici } from "@/api/istemci";

type Durum = "hazirlaniyor" | "giris" | "kilitli" | "acik";
type Deger = {
  durum: Durum;
  yonetici: Yonetici | null;
  giris: (kullanici: string, sifre: string, cihazAdi: string) => Promise<void>;
  cikis: () => Promise<void>;
  kilidiAc: () => Promise<boolean>;
  yetki: (y: "orders" | "marketing" | "content" | "dashboard" | "settings") => boolean;
};

const Baglam = createContext<Deger | null>(null);
const KILIT_SURESI = 5 * 60_000;

async function biyometriVar() {
  try {
    return (await LocalAuthentication.hasHardwareAsync()) && (await LocalAuthentication.isEnrolledAsync());
  } catch {
    return false;
  }
}

export function OturumSaglayici({ children }: { children: ReactNode }) {
  const [durum, setDurum] = useState<Durum>("hazirlaniyor");
  const [yonetici, setYonetici] = useState<Yonetici | null>(null);
  const arkaPlan = useRef<number | null>(null);

  useEffect(() => {
    oturumKapaninca(() => {
      setYonetici(null);
      setDurum("giris");
    });
    (async () => {
      const y = await kayitliOturum();
      if (!y) return setDurum("giris");
      setYonetici(y);
      setDurum((await biyometriVar()) ? "kilitli" : "acik");
    })();
  }, []);

  useEffect(() => {
    const abone = AppState.addEventListener("change", async (s) => {
      if (s === "background") arkaPlan.current = Date.now();
      if (s === "active" && arkaPlan.current && Date.now() - arkaPlan.current > KILIT_SURESI) {
        arkaPlan.current = null;
        setDurum((d) => (d === "acik" ? "kilitli" : d));
        if (!(await biyometriVar())) setDurum((d) => (d === "kilitli" ? "acik" : d));
      }
    });
    return () => abone.remove();
  }, []);

  const kilidiAc = useCallback(async () => {
    const r = await LocalAuthentication.authenticateAsync({ promptMessage: "Hadi Yönetim'i açın", cancelLabel: "Vazgeç", disableDeviceFallback: false });
    if (r.success) setDurum("acik");
    return r.success;
  }, []);

  const giris = useCallback(async (k: string, s: string, c: string) => {
    const y = await girisYap(k, s, c);
    setYonetici(y);
    setDurum("acik");
  }, []);

  const cikis = useCallback(async () => {
    await cikisYap();
    setYonetici(null);
    setDurum("giris");
  }, []);

  const yetki = useCallback((y: string) => !!yonetici && (yonetici.yetkiler.includes("*") || yonetici.yetkiler.includes(y)), [yonetici]);

  const deger = useMemo(() => ({ durum, yonetici, giris, cikis, kilidiAc, yetki }), [durum, yonetici, giris, cikis, kilidiAc, yetki]);
  return <Baglam.Provider value={deger}>{children}</Baglam.Provider>;
}

export function useOturum() {
  const d = useContext(Baglam);
  if (!d) throw new Error("useOturum OturumSaglayici içinde kullanılmalı");
  return d;
}
