// Bülten ve e-posta (18 Kasım): paket bültenini telefondan hazırlayıp gönderme (2 haftada bir, elle) ve hoş geldin serisi.
// Sunucu: /api/admin/paket-bulteni (src/lib/paket-bulteni), /api/admin/hosgeldin (src/lib/hosgeldin).
// Bülten kodu günün tarihi: aynı gün iki kez basılırsa aynı kişiye iki kez gitmez, ertesi bülten yine herkese gider.
import { useEffect, useMemo, useState } from "react";
import { Alert, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { istek } from "@/api/istemci";
import { useIslem } from "@/veri/sorgular";
import { Anahtar } from "@/ui/form";
import { Alan, Ayrac, Baslik, Bolum, Cip, Dugme, Ekran, HataKutusu, Kart, Satir, Yazi, Yukleniyor } from "@/ui/temel";
import { goreli } from "@/ui/bicim";
import { BOSLUK } from "@/tema";

type PaketKart = { slug: string; otel: string; not: string; fiyat: number; ay: string };
type Gecmis = { id: string; konu: string; toplam: number; gonderilen: number; acildi: number; tiklandi: number; createdAt: string };
type Onizleme = { konu: string; alici: number; uye: number; havuz: number; engelli: number; zatenGitti: number };
type Bulten = { secenekler: PaketKart[]; onizleme: Onizleme | null; gecmis: Gecmis[] };
type Adim = { no: number; gun: number; ad: string; konu: string | null; gonderilen: number; acilan: number; tiklanan: number; bugun: number };
type Seri = { aktif: boolean; baslangic: string | null; epostaHazir: boolean; adimlar: Adim[] };

const usd = (n: number) => `${n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
const bugunKodu = () => `bulten-${new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(new Date())}`;
const epostaGecerli = (a: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.trim());

export default function BultenEkrani() {
  const [secili, setSecili] = useState<string[] | null>(null);
  const [metin, setMetin] = useState({ konu: "", kicker: "", baslik: "", giris: "" });
  const [adres, setAdres] = useState("");
  const kod = useMemo(bugunKodu, []);

  const temel = useQuery({ queryKey: ["bulten"], queryFn: () => istek<Bulten>("/api/admin/paket-bulteni") });
  const seri = useQuery({ queryKey: ["hosgeldin"], queryFn: () => istek<Seri>("/api/admin/hosgeldin") });

  // İlk açılışta bütün paketler seçili; metinler ayın adından ve en düşük fiyattan (web paneliyle aynı)
  useEffect(() => {
    const ks = temel.data?.secenekler;
    if (!ks?.length || secili) return;
    const ay = ks[0].ay;
    setSecili(ks.map((k) => k.slug));
    setMetin({
      konu: `${ay}'da Mekke: vize dahil umre paketleri ${usd(Math.min(...ks.map((k) => k.fiyat)))}'dan`,
      kicker: `${ay} · Mekke umre paketleri`,
      baslik: "Vize dahil umre paketleri",
      giris: `${ay} için vize dahil umre paketlerimizi hazırladık. Gece ve kişi sayınızı seçip fiyatınızı hemen görebilirsiniz.`,
    });
  }, [temel.data, secili]);

  const ayar = { kod, ...metin, paketler: secili ?? [] };
  const sorgu = new URLSearchParams({ ...metin, kod, paketler: (secili ?? []).join(",") }).toString();
  const sayim = useQuery({
    queryKey: ["bulten-sayim", sorgu],
    queryFn: () => istek<Bulten>(`/api/admin/paket-bulteni?${sorgu}`),
    enabled: !!secili?.length,
  });
  const o = sayim.data?.onizleme;

  const deneme = useIslem((g: Record<string, unknown>) => istek("/api/admin/paket-bulteni", { govde: { ...g, action: "deneme" } }), []);
  const gonder = useIslem((g: Record<string, unknown>) => istek<{ gonderilen: number; hatali: number }>("/api/admin/paket-bulteni", { govde: { ...g, action: "gonder", onay: "GÖNDER" } }), [["bulten"], ["bulten-sayim"]]);
  const seriAyar = useIslem((aktif: boolean) => istek("/api/admin/hosgeldin", { govde: { action: "ayar", aktif } }), [["hosgeldin"]]);
  const seriDeneme = useIslem((no: number) => istek("/api/admin/hosgeldin", { govde: { action: "deneme", adim: no, adres: adres.trim() } }), []);

  const hata = (e: unknown) => Alert.alert("Olmadı", e instanceof Error ? e.message : "Bir hata oluştu.");
  const gonderOnay = () => {
    if (!o) return;
    Alert.alert("Bülten gönderilsin mi?", `${o.alici} kişiye gidecek. Geri alınamaz.`, [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Gönder",
        style: "destructive",
        onPress: () => gonder.mutate(ayar, { onSuccess: (r) => Alert.alert("Gönderildi", `${r.gonderilen} kişiye gitti${r.hatali ? `, ${r.hatali} hata` : ""}.`), onError: hata }),
      },
    ]);
  };
  const son = temel.data?.gecmis?.[0];

  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik="Bülten ve e-posta" geri />
      <Ekran yenile={() => (temel.refetch(), seri.refetch())} yenileniyor={temel.isFetching}>
        {temel.isPending ? <Yukleniyor /> : temel.error ? <HataKutusu hata={temel.error} tekrar={temel.refetch} /> : (
          <>
            <Bolum baslik="Paket bülteni">
              <Kart style={{ padding: 14, gap: 10 }}>
                <Yazi tur="kucuk">
                  {son ? `Son bülten ${goreli(son.createdAt)} gitti: ${son.gonderilen} kişi, ${son.acildi} açılma.` : "Henüz bülten gönderilmedi."} 2 haftada bir göndermeniz önerilir; zamanı gelince bildirim gelir.
                </Yazi>
                <Yazi tur="etiket">Paketler</Yazi>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: BOSLUK.s }}>
                  {(temel.data?.secenekler ?? []).map((k) => (
                    <Cip key={k.slug} metin={`${k.otel} · ${usd(k.fiyat)}`} secili={!!secili?.includes(k.slug)} onPress={() => setSecili((l) => (l?.includes(k.slug) ? l.filter((x) => x !== k.slug) : [...(l ?? []), k.slug]))} />
                  ))}
                </View>
                <Alan etiket="Konu" value={metin.konu} onChangeText={(v) => setMetin((m) => ({ ...m, konu: v }))} />
                <Alan etiket="Üst etiket" value={metin.kicker} onChangeText={(v) => setMetin((m) => ({ ...m, kicker: v }))} />
                <Alan etiket="Başlık" value={metin.baslik} onChangeText={(v) => setMetin((m) => ({ ...m, baslik: v }))} />
                <Alan etiket="Giriş metni" value={metin.giris} onChangeText={(v) => setMetin((m) => ({ ...m, giris: v }))} multiline />
                <Yazi tur="kucuk">
                  {sayim.isFetching ? "Alıcılar sayılıyor…" : o ? `${o.alici} kişiye gidecek (${o.uye} üye, ${o.havuz} müşteri havuzu). Atlanan: ${o.engelli} geçersiz adres, ${o.zatenGitti} bugün zaten almış.` : "Paket seçin."}
                </Yazi>
              </Kart>
            </Bolum>

            <Bolum baslik="Deneme ve gönderim">
              <Kart style={{ padding: 14, gap: 10 }}>
                <Alan etiket="Deneme adresi" value={adres} onChangeText={setAdres} keyboardType="email-address" autoCapitalize="none" placeholder="sizin@adresiniz.com" />
                <Dugme metin="Bülteni bana deneme gönder" tur="ikincil" yukleniyor={deneme.isPending} devreDisi={!epostaGecerli(adres) || !secili?.length} onPress={() => deneme.mutate({ ...ayar, adres: adres.trim() }, { onSuccess: () => Alert.alert("Deneme gönderildi", adres.trim()), onError: hata })} />
                <Dugme metin={o ? `${o.alici} kişiye gönder` : "Gönder"} ikon="gonder2" yukleniyor={gonder.isPending} devreDisi={!o?.alici || !metin.konu.trim() || !metin.baslik.trim()} onPress={gonderOnay} />
              </Kart>
            </Bolum>

            <Bolum baslik="Hoş geldin serisi">
              {seri.data ? (
                <Kart style={{ padding: 14, gap: 10 }}>
                  <Anahtar
                    etiket={seri.data.aktif ? "Açık" : "Kapalı"}
                    alt="Kitapçık indirip izin veren ya da izinle üye olan kişiye 2, 5 ve 10 gün sonra kendiliğinden 3 e-posta. Yalnızca açtıktan sonra gelenlere gider."
                    deger={seri.data.aktif}
                    degisti={(v) => seriAyar.mutate(v, { onError: hata })}
                  />
                  {!seri.data.epostaHazir ? <Yazi tur="kucuk" renk="#b42318">E-posta servisi yapılandırılmamış; gönderim yapılmaz.</Yazi> : null}
                  {seri.data.adimlar.map((a, i) => (
                    <View key={a.no}>
                      {i ? <Ayrac /> : null}
                      <Satir
                        ikon="eposta"
                        baslik={`${a.no}. adım · ${a.gun}. gün`}
                        alt={`${a.konu ?? a.ad} · ${a.gonderilen} gönderildi, ${a.acilan} açıldı${a.bugun ? ` · bugün ${a.bugun}` : ""}`}
                        sag={<Dugme metin="Deneme" tur="hafif" kucuk devreDisi={!epostaGecerli(adres)} yukleniyor={seriDeneme.isPending && seriDeneme.variables === a.no} onPress={() => seriDeneme.mutate(a.no, { onSuccess: () => Alert.alert("Deneme gönderildi", `${a.no}. adım · ${adres.trim()}`), onError: hata })} />}
                      />
                    </View>
                  ))}
                  <Yazi tur="kucuk">Deneme için yukarıdaki deneme adresi kullanılır.</Yazi>
                </Kart>
              ) : seri.error ? <HataKutusu hata={seri.error} tekrar={seri.refetch} /> : <Yukleniyor />}
            </Bolum>
          </>
        )}
      </Ekran>
    </View>
  );
}
