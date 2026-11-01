// Influencer adayları (web: /admin/influencer-adaylari): bulunan hesaplar, uygunluk puanı, aşama, not; hesabı inceleyip kişiye özel
// DM hazırlama (şablon web panelindekiyle aynı: dm.ts), davet bağlantısı, yeni aday ekleme ve yapay zekâyla aday bulma.
import { useState } from "react";
import { Alert, Linking, Share, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useQuery } from "@tanstack/react-query";
import { istek } from "@/api/istemci";
import { useIslem } from "@/veri/sorgular";
import { KayitEkrani, Secim } from "@/ui/form";
import AltSayfa from "@/ui/AltSayfa";
import { Alan, Dugme, Kart, Rozet, Segment, Yazi } from "@/ui/temel";
import { goreli } from "@/ui/bicim";
import { DM_TEMPLATES, fillTemplate } from "@site/app/(admin)/admin/influencer-adaylari/dm";
import { R } from "@/tema";

type Aday = {
  id: string; platform: string; handle: string; url: string; name: string; bio: string | null; followers: number | null; avgViews: number | null;
  engagementRate: number | null; postsLast30: number | null; audienceTR: number | null; fitScore: number | null; fitReasons: string | null;
  stage: string; source: string | null; note: string | null; metricsAt: string | null; metricsError: string | null; invitedAt: string | null; createdAt: string;
};
const ASAMA = [{ deger: "bulundu", etiket: "Bulundu" }, { deger: "uygun", etiket: "Uygun" }, { deger: "mesaj", etiket: "Mesaj atıldı" }, { deger: "yanit", etiket: "Yanıt verdi" }, { deger: "anlasildi", etiket: "Anlaşıldı" }, { deger: "red", etiket: "Red" }];
const PLATFORM = [{ deger: "instagram", etiket: "Instagram" }, { deger: "tiktok", etiket: "TikTok" }, { deger: "youtube", etiket: "YouTube" }];
const binlik = (n: number | null) => (n == null ? "—" : n >= 1000 ? `${Math.round(n / 100) / 10} B` : String(n));

export default function Adaylar() {
  const q = useQuery({ queryKey: ["adaylar"], queryFn: () => istek<{ items: Aday[]; counts: Record<string, number> }>("/api/admin/influencer-prospects") });
  const [ac, setAc] = useState<Aday | null>(null);
  const [ekle, setEkle] = useState<{ platform: string; handle: string; not: string } | null>(null);
  const [bul, setBul] = useState<{ platform: string; sorgu: string } | null>(null);
  const [dm, setDm] = useState<{ sablon: string; hitap: string; gozlem: string; nedenSiz: string; komisyon: string; indirim: string; davet: string } | null>(null);
  const [mesgul, setMesgul] = useState<string | null>(null);
  const islem = useIslem((g: Record<string, unknown>) => istek<{ item?: Aday; inviteUrl?: string } & Record<string, unknown>>("/api/admin/influencer-prospects", { govde: g }), [["adaylar"]]);
  const yap = async (ad: string, g: Record<string, unknown>) => {
    setMesgul(ad);
    try {
      const r = await islem.mutateAsync(g);
      if (r.item && ac && r.item.id === ac.id) setAc(r.item);
      return r;
    } catch (e) {
      Alert.alert("Olmadı", e instanceof Error ? e.message : "");
      return null;
    } finally {
      setMesgul(null);
    }
  };
  const sayac = q.data?.counts ?? {};
  const sablon = DM_TEMPLATES.find((t) => t.id === dm?.sablon) ?? DM_TEMPLATES[0];
  const metin = dm ? fillTemplate(sablon.content, { ad: ac?.name, hitap: dm.hitap, gozlem: dm.gozlem, nedenSiz: dm.nedenSiz, komisyon: dm.komisyon, indirim: dm.indirim, davet: dm.davet }) : "";
  /** Davet bağlantısını (bir kez) oluşturup metne yerleştirir */
  const davetli = async () => {
    if (!dm || !ac) return null;
    let davet = dm.davet;
    if (!davet) {
      const r = (await yap("davet", { action: "invite", id: ac.id })) as { inviteUrl?: string } | null;
      if (!r?.inviteUrl) return null;
      davet = r.inviteUrl;
      setDm({ ...dm, davet });
    }
    return fillTemplate(sablon.content, { ad: ac.name, hitap: dm.hitap, gozlem: dm.gozlem, nedenSiz: dm.nedenSiz, komisyon: dm.komisyon, indirim: dm.indirim, davet });
  };
  return (
    <>
      <KayitEkrani<Aday>
        baslik="Influencer adayları"
        q={q}
        anahtar={["adaylar"]}
        veri={(q.data?.items ?? []).slice().sort((a, b) => (b.fitScore ?? -1) - (a.fitScore ?? -1))}
        bos="Aday yok"
        ara={(a) => `${a.name} ${a.handle}`}
        suzgec={{ secenekler: [{ deger: "tumu", etiket: "Tümü" }, ...ASAMA.map((s) => ({ ...s, sayi: sayac[s.deger] || undefined }))], uygula: (a, d) => d === "tumu" || a.stage === d }}
        satir={(a) => ({ baslik: a.name, alt: `@${a.handle} · ${a.platform} · ${binlik(a.followers)} takipçi${a.audienceTR != null ? ` · TR %${a.audienceTR}` : ""}`, ikon: "davet", rozet: a.fitScore != null ? { metin: `${a.fitScore}/10`, ton: a.fitScore >= 7 ? "yesil" : a.fitScore >= 5 ? "turuncu" : "gri" } : undefined })}
        sec={setAc}
        ust={
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Dugme metin="Aday ekle" ikon="arti" kucuk onPress={() => setEkle({ platform: "instagram", handle: "", not: "" })} style={{ flex: 1 }} />
            <Dugme metin="Yapay zekâyla bul" ikon="yapayzeka" kucuk tur="hafif" onPress={() => setBul({ platform: "instagram", sorgu: "" })} style={{ flex: 1 }} />
          </View>
        }
      />
      <AltSayfa acik={!!ac && !dm} kapat={() => setAc(null)} baslik={ac?.name ?? ""}>
        {ac ? (
          <>
            <Yazi tur="kucuk">{`@${ac.handle} · ${ac.platform} · eklendi ${goreli(ac.createdAt)}${ac.invitedAt ? ` · davet ${goreli(ac.invitedAt)}` : ""}`}</Yazi>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              <Rozet metin={`${binlik(ac.followers)} takipçi`} />
              {ac.avgViews != null ? <Rozet metin={`${binlik(ac.avgViews)} izlenme`} /> : null}
              {ac.engagementRate != null ? <Rozet metin={`etkileşim %${Math.round(ac.engagementRate * 10) / 10}`} /> : null}
              {ac.postsLast30 != null ? <Rozet metin={`30 günde ${ac.postsLast30} paylaşım`} /> : null}
              {ac.fitScore != null ? <Rozet metin={`uygunluk ${ac.fitScore}/10`} ton={ac.fitScore >= 7 ? "yesil" : "turuncu"} /> : null}
            </View>
            {ac.bio ? <Yazi tur="kucuk">{ac.bio}</Yazi> : null}
            {ac.fitReasons ? <Kart style={{ padding: 12 }}><Yazi tur="kucuk">{ac.fitReasons}</Yazi></Kart> : null}
            {ac.metricsError ? <Yazi tur="kucuk" renk={R.kirmizi}>{ac.metricsError}</Yazi> : null}
            <Secim etiket="Aşama" secenekler={ASAMA} deger={ac.stage} degisti={(stage) => yap("asama", { action: "stage", id: ac.id, stage })} />
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              <Dugme metin="Profili aç" ikon="disari" kucuk tur="hafif" onPress={() => Linking.openURL(ac.url)} />
              <Dugme metin="Yeniden puanla" ikon="yenile" kucuk tur="hafif" yukleniyor={mesgul === "puan"} onPress={() => yap("puan", { action: "score", id: ac.id })} />
              {ac.platform === "instagram" ? <Dugme metin="Benzerlerini bul" ikon="ara2" kucuk tur="hafif" yukleniyor={mesgul === "benzer"} onPress={async () => {
                const r = await yap("benzer", { action: "similar", id: ac.id });
                if (r) Alert.alert("Benzer hesaplar", `${(r as { added?: number }).added ?? 0} yeni aday eklendi.`);
              }} /> : null}
            </View>
            <Dugme metin="Mesaj hazırla" ikon="mesaj" yukleniyor={mesgul === "dm"} onPress={async () => {
              const r = (await yap("dm", { action: "draft", id: ac.id })) as { hitap?: string; gozlem?: string; nedenSiz?: string } | null;
              setDm({ sablon: DM_TEMPLATES[0].id, hitap: r?.hitap ?? "", gozlem: r?.gozlem ?? "", nedenSiz: r?.nedenSiz ?? "", komisyon: "", indirim: "", davet: "" });
            }} />
            <NotAlani aday={ac} kaydet={(note, audienceTR) => yap("not", { action: "note", id: ac.id, note, audienceTR })} mesgul={mesgul === "not"} />
          </>
        ) : null}
      </AltSayfa>
      <AltSayfa acik={!!dm} kapat={() => setDm(null)} baslik="Mesaj taslağı">
        {dm ? (
          <>
            <Segment secenekler={DM_TEMPLATES.map((t) => ({ deger: t.id, etiket: t.name }))} deger={dm.sablon} degisti={(sablon) => setDm({ ...dm, sablon })} />
            <Alan etiket="Hitap" value={dm.hitap} onChangeText={(hitap) => setDm({ ...dm, hitap })} />
            <Alan etiket="Gözlem cümlesi" value={dm.gozlem} onChangeText={(gozlem) => setDm({ ...dm, gozlem })} multiline />
            <Alan etiket="Neden size yazıyoruz" value={dm.nedenSiz} onChangeText={(nedenSiz) => setDm({ ...dm, nedenSiz })} multiline />
            <Alan etiket="Takipçi indirimi" value={dm.indirim} onChangeText={(indirim) => setDm({ ...dm, indirim })} placeholder="ör. 50 $" />
            <Alan etiket="Komisyon" value={dm.komisyon} onChangeText={(komisyon) => setDm({ ...dm, komisyon })} placeholder="ör. %5" />
            <Kart style={{ padding: 12 }}><Yazi tur="kucuk">{metin}</Yazi></Kart>
            {/\[|\{(?!davet)/.test(metin) ? <Yazi tur="kucuk" renk={R.turuncu}>Köşeli ya da süslü parantezli yerleri göndermeden önce doldurun.</Yazi> : null}
            <Yazi tur="kucuk">Kopyalayınca kişiye özel davet bağlantısı oluşur ve aday "Mesaj atıldı" aşamasına geçer.</Yazi>
            <Dugme metin="Kopyala ve profili aç" ikon="kopyala" yukleniyor={mesgul === "davet"} onPress={async () => {
              const son = await davetli();
              if (!son) return;
              await Clipboard.setStringAsync(son);
              if (ac) Linking.openURL(ac.url);
            }} />
            <Dugme metin="Paylaş" ikon="paylas" tur="hafif" onPress={async () => { const son = await davetli(); if (son) Share.share({ message: son }); }} />
          </>
        ) : null}
      </AltSayfa>
      <AltSayfa acik={!!ekle} kapat={() => setEkle(null)} baslik="Aday ekle">
        <Segment secenekler={PLATFORM} deger={ekle?.platform ?? "instagram"} degisti={(platform) => setEkle((o) => (o ? { ...o, platform } : o))} />
        <Alan etiket="Kullanıcı adı" value={ekle?.handle ?? ""} onChangeText={(handle) => setEkle((o) => (o ? { ...o, handle } : o))} autoCapitalize="none" placeholder="@hesap" />
        <Alan etiket="Not (isteğe bağlı)" value={ekle?.not ?? ""} onChangeText={(not) => setEkle((o) => (o ? { ...o, not } : o))} />
        <Dugme metin="Ekle ve puanla" yukleniyor={mesgul === "ekle"} devreDisi={!ekle?.handle.trim()} onPress={async () => {
          if (!ekle) return;
          const r = await yap("ekle", { action: "add", platform: ekle.platform, handle: ekle.handle.replace(/^@/, "").trim(), note: ekle.not });
          if (r) { setEkle(null); if (r.item) setAc(r.item); }
        }} />
      </AltSayfa>
      <AltSayfa acik={!!bul} kapat={() => setBul(null)} baslik="Yapay zekâyla aday bul">
        <Yazi tur="kucuk">Konu yazın (ör. "umre rehberi", "hac hatırası"); uygun hesaplar bulunup puanlanır ve listeye eklenir. Bir dakika kadar sürebilir.</Yazi>
        <Segment secenekler={PLATFORM} deger={bul?.platform ?? "instagram"} degisti={(platform) => setBul((o) => (o ? { ...o, platform } : o))} />
        <Alan etiket="Arama" value={bul?.sorgu ?? ""} onChangeText={(sorgu) => setBul((o) => (o ? { ...o, sorgu } : o))} />
        <Dugme metin="Bul" ikon="yapayzeka" yukleniyor={mesgul === "bul"} devreDisi={(bul?.sorgu.trim().length ?? 0) < 3} onPress={async () => {
          if (!bul) return;
          const r = (await yap("bul", { action: "discover", query: bul.sorgu.trim(), platform: bul.platform })) as { added?: number; checked?: number } | null;
          if (r) { setBul(null); Alert.alert("Tamam", `${r.checked ?? 0} hesap incelendi, ${r.added ?? 0} yeni aday eklendi.`); }
        }} />
      </AltSayfa>
    </>
  );
}

function NotAlani({ aday, kaydet, mesgul }: { aday: Aday; kaydet: (not: string, tr: number | null) => void; mesgul: boolean }) {
  const [not, setNot] = useState(aday.note ?? "");
  const [tr, setTr] = useState(aday.audienceTR == null ? "" : String(aday.audienceTR));
  return (
    <>
      <Alan etiket="Not" value={not} onChangeText={setNot} multiline />
      <Alan etiket="Türkiye kitlesi %" value={tr} onChangeText={setTr} keyboardType="decimal-pad" />
      <Dugme metin="Notu kaydet" kucuk tur="hafif" yukleniyor={mesgul} onPress={() => kaydet(not, tr === "" ? null : Number(tr.replace(",", ".")))} />
    </>
  );
}
