// Site ayarları (web: /admin/settings): ana sayfa metinleri, düğme yazıları, iletişim, WhatsApp, sosyal medya, marka renkleri ve
// logosu; "Tüm ayarlar" bölümünde siteye açık her anahtar ham hâliyle düzenlenebilir. Hesap şifresi de buradan değişir.
import { useEffect, useMemo, useState } from "react";
import { Alert, View } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { istek } from "@/api/istemci";
import { GorselAlan } from "@/ui/form";
import AltSayfa from "@/ui/AltSayfa";
import { Alan, Arama, Ayrac, Baslik, Dugme, Ekran, Kart, Satir, Segment, Yazi, Yukleniyor } from "@/ui/temel";
import { R } from "@/tema";

type A = { k: string; etiket: string; varsayilan?: string; gorsel?: boolean; uzun?: boolean };
const GRUP: { ad: string; alanlar: A[] }[] = [
  { ad: "Ana sayfa", alanlar: [
    { k: "HERO_TITLE", etiket: "Giriş başlığı", varsayilan: "Bireysel umrenin kolay yolu." }, { k: "HERO_DESC", etiket: "Giriş açıklaması", uzun: true },
    { k: "home_banner_image", etiket: "Giriş arka plan görseli", gorsel: true }, { k: "HOME_HERO_VIDEO", etiket: "Giriş videosu adresi (MP4)" },
    { k: "HOME_TOURS_KICKER", etiket: "Paketler üst yazı" }, { k: "HOME_TOURS_TITLE", etiket: "Paketler başlığı (*yıldızlı* italik)" },
    { k: "HOME_STEPS_KICKER", etiket: "Adımlar üst yazı" }, { k: "HOME_STEPS_TITLE", etiket: "Adımlar başlığı" },
    { k: "HOME_BLOG_KICKER", etiket: "Blog üst yazı" }, { k: "HOME_BLOG_TITLE", etiket: "Blog başlığı" },
    { k: "HOME_FAQ_TITLE", etiket: "SSS başlığı" }, { k: "HOME_FAQ_DESC", etiket: "SSS açıklaması", uzun: true },
  ] },
  { ad: "Düğmeler", alanlar: [{ k: "HOME_CTA", etiket: "Ana sayfa düğmesi" }, { k: "NAVBAR_CTA", etiket: "Üst menü düğmesi" }, { k: "WHATSAPP_CTA", etiket: "WhatsApp düğmesi" }] },
  { ad: "İletişim", alanlar: [
    { k: "WHATSAPP_NUMBER", etiket: "WhatsApp numarası (905…)" }, { k: "WHATSAPP_MESSAGE", etiket: "WhatsApp hazır mesajı", uzun: true },
    { k: "CONTACT_TITLE", etiket: "İletişim başlığı" }, { k: "CONTACT_DESC", etiket: "İletişim açıklaması", uzun: true }, { k: "CONTACT_EMAIL", etiket: "E-posta" }, { k: "CONTACT_ADDRESS", etiket: "Adres" },
  ] },
  { ad: "Sosyal medya", alanlar: [{ k: "SOCIAL_INSTAGRAM", etiket: "Instagram" }, { k: "SOCIAL_YOUTUBE", etiket: "YouTube" }, { k: "SOCIAL_TIKTOK", etiket: "TikTok" }, { k: "SOCIAL_FACEBOOK", etiket: "Facebook" }, { k: "SOCIAL_TWITTER", etiket: "X / Twitter" }] },
  { ad: "Marka", alanlar: [
    { k: "SITE_LOGO", etiket: "Logo", gorsel: true }, { k: "BRAND_PRIMARY", etiket: "Ana renk" }, { k: "BRAND_SECONDARY", etiket: "İkincil renk" },
    { k: "BRAND_SURFACE", etiket: "Arka plan rengi" }, { k: "BRAND_SURFACE_CARD", etiket: "Kart rengi" }, { k: "BRAND_TEXT", etiket: "Yazı rengi" }, { k: "BUTTON_RADIUS", etiket: "Düğme köşesi (ör. 1rem)" },
  ] },
];
const BILINEN = new Set(GRUP.flatMap((g) => g.alanlar.map((a) => a.k)));

export default function SiteAyarlari() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["site-ayarlari"], queryFn: () => istek<Record<string, string>>("/api/admin/settings") });
  const [d, setD] = useState<Record<string, string> | null>(null);
  useEffect(() => { if (q.data && !d) setD(q.data); }, [q.data, d]);
  const [grup, setGrup] = useState(GRUP[0].ad);
  const [mesgul, setMesgul] = useState(false);
  const [ham, setHam] = useState<{ k: string; v: string; yeni?: boolean } | null>(null);
  const [ara, setAra] = useState("");
  const [sifre, setSifre] = useState<{ eski: string; yeni: string } | null>(null);
  const degisen = useMemo(() => (d && q.data ? Object.keys(d).filter((k) => (q.data[k] ?? "") !== (d[k] ?? "")) : []), [d, q.data]);
  if (!d) return <View style={{ flex: 1 }}><Baslik baslik="Site ayarları" geri /><Yukleniyor /></View>;
  const kaydet = async (degerler: Record<string, string>) => {
    setMesgul(true);
    try {
      await istek("/api/admin/settings", { govde: degerler });
      const yeni = await qc.fetchQuery({ queryKey: ["site-ayarlari"], queryFn: () => istek<Record<string, string>>("/api/admin/settings") });
      setD(yeni);
      Alert.alert("Kaydedildi", "Site güncellendi.");
    } catch (e) {
      Alert.alert("Kaydedilemedi", e instanceof Error ? e.message : "");
    } finally {
      setMesgul(false);
    }
  };
  const g = GRUP.find((x) => x.ad === grup);
  const digerleri = Object.keys(d).filter((k) => !BILINEN.has(k) && (!ara || k.toLowerCase().includes(ara.toLowerCase()))).sort();
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik="Site ayarları" geri />
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <Segment secenekler={[...GRUP.map((x) => ({ deger: x.ad, etiket: x.ad })), { deger: "tum", etiket: "Tüm ayarlar" }, { deger: "hesap", etiket: "Hesabım" }]} deger={grup} degisti={setGrup} />
      </View>
      <Ekran>
        {g ? (
          <Kart style={{ gap: 12 }}>
            {g.alanlar.map((a) => a.gorsel ? (
              <GorselAlan key={a.k} etiket={a.etiket} deger={d[a.k] || null} degisti={(v) => setD({ ...d, [a.k]: v ?? "" })} />
            ) : (
              <Alan key={a.k} etiket={a.etiket} value={d[a.k] ?? ""} onChangeText={(v) => setD({ ...d, [a.k]: v })} multiline={a.uzun} placeholder={a.varsayilan} autoCapitalize={a.k.startsWith("SOCIAL") || a.k.includes("VIDEO") || a.k.startsWith("BRAND") ? "none" : "sentences"} />
            ))}
          </Kart>
        ) : grup === "tum" ? (
          <>
            <Yazi tur="kucuk">Siteye açık bütün ayar anahtarları. Değiştirdiğiniz değer hemen sitede geçerli olur; neyi değiştirdiğinizi bilmiyorsanız dokunmayın.</Yazi>
            <Arama deger={ara} degisti={setAra} yer="Anahtar ara" />
            <Dugme metin="Yeni anahtar" ikon="arti" kucuk tur="hafif" onPress={() => setHam({ k: "", v: "", yeni: true })} />
            <Kart style={{ padding: 0, overflow: "hidden" }}>
              {digerleri.map((k, i) => (
                <View key={k}>
                  {i ? <Ayrac /> : null}
                  <Satir baslik={k} alt={(d[k] ?? "").slice(0, 90)} onPress={() => setHam({ k, v: d[k] ?? "" })} />
                </View>
              ))}
            </Kart>
          </>
        ) : (
          <Kart style={{ gap: 12 }}>
            <Yazi tur="altBaslik">Şifre değiştir</Yazi>
            <Alan etiket="Mevcut şifre" value={sifre?.eski ?? ""} onChangeText={(eski) => setSifre((o) => ({ yeni: o?.yeni ?? "", eski }))} secureTextEntry autoCapitalize="none" />
            <Alan etiket="Yeni şifre (en az 8 karakter)" value={sifre?.yeni ?? ""} onChangeText={(yeni) => setSifre((o) => ({ eski: o?.eski ?? "", yeni }))} secureTextEntry autoCapitalize="none" />
            <Dugme metin="Şifreyi değiştir" devreDisi={!sifre?.eski || (sifre?.yeni.length ?? 0) < 8} yukleniyor={mesgul} onPress={async () => {
              if (!sifre) return;
              setMesgul(true);
              try {
                await istek("/api/admin/change-password", { govde: { currentPassword: sifre.eski, newPassword: sifre.yeni } });
                setSifre(null);
                Alert.alert("Şifre değişti", "Web paneline yeni şifreyle girin. Bu cihazın oturumu açık kalır.");
              } catch (e) {
                Alert.alert("Değişmedi", e instanceof Error ? e.message : "");
              } finally {
                setMesgul(false);
              }
            }} />
          </Kart>
        )}
      </Ekran>
      {degisen.length && grup !== "hesap" ? (
        <View style={{ padding: 16, backgroundColor: R.kart, borderTopWidth: 1, borderTopColor: R.cizgi, flexDirection: "row", gap: 8 }}>
          <Dugme metin="Vazgeç" tur="ikincil" onPress={() => setD(q.data ?? d)} style={{ flex: 1 }} />
          <Dugme metin={`${degisen.length} ayarı kaydet`} ikon="tik" yukleniyor={mesgul} onPress={() => kaydet(Object.fromEntries(degisen.map((k) => [k, d[k] ?? ""])))} style={{ flex: 2 }} />
        </View>
      ) : null}
      <AltSayfa acik={!!ham} kapat={() => setHam(null)} baslik={ham?.yeni ? "Yeni ayar" : ham?.k ?? ""}>
        {ham?.yeni ? <Alan etiket="Anahtar" value={ham.k} onChangeText={(k) => setHam({ ...ham, k: k.trim() })} autoCapitalize="characters" /> : null}
        <Alan etiket="Değer" value={ham?.v ?? ""} onChangeText={(v) => setHam((o) => (o ? { ...o, v } : o))} multiline autoCapitalize="none" style={{ minHeight: 160, fontSize: 13 }} />
        <Dugme metin="Kaydet" yukleniyor={mesgul} devreDisi={!ham?.k} onPress={async () => { if (!ham) return; await kaydet({ [ham.k]: ham.v }); setHam(null); }} />
      </AltSayfa>
    </View>
  );
}
