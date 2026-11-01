// WhatsApp yapay zekâ ayarları (web: /admin/whatsapp-ai): bağlantı durumu, açma/kapama, asistanın kuralları, devir anahtar
// kelimeleri, eğitim örnekleri ve deneme sohbeti. Konuşmaların kendisi /whatsapp ekranında.
import { useEffect, useState } from "react";
import { Alert, Image, View } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { istek } from "@/api/istemci";
import { Anahtar } from "@/ui/form";
import AltSayfa from "@/ui/AltSayfa";
import { Alan, Baslik, Bolum, Dugme, Ekran, Kart, Rozet, Sayac, Segment, Yazi, Yukleniyor } from "@/ui/temel";
import { goreli } from "@/ui/bicim";
import { BOSLUK, R } from "@/tema";

type Ornek = { id: string; customerMessage: string; idealReply: string; category: string; createdAt: string };
type Ayar = {
  enabled: boolean; assistantName: string; welcomeMessage: string; tone: string; companyKnowledge: string; salesRules: string; qualityRules: string;
  prohibitedClaims: string[]; trainingExamples: Ornek[]; managerEscalationEnabled: boolean; managerApprovalMode: boolean; managerPhone: string; handoffKeywords: string[]; outOfHoursMessage: string;
};
type Veri = {
  config: Ayar;
  stats: { conversations: number; totalMessages: number; aiMessages: number; handoffCount: number };
  connection: { gemini: boolean; githubModels: boolean; whatsapp: boolean; model: string; bot: { status: string; qr: string | null; phone: string | null; error: string | null; lastEventAt: string | null } };
};
type Test = { reply: string; intent: string; leadType: string; leadScore: number; handoff: boolean; handoffReason: string; provider?: string };

export default function WhatsappAi() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["whatsapp-ai-ayar"], queryFn: () => istek<Veri>("/api/admin/whatsapp-ai") });
  const [sekme, setSekme] = useState<"durum" | "kurallar" | "egitim" | "dene">("durum");
  const [a, setA] = useState<Ayar | null>(null);
  useEffect(() => { if (q.data) setA(q.data.config); }, [q.data]);
  const [mesgul, setMesgul] = useState<string | null>(null);
  const [yeni, setYeni] = useState<{ musteri: string; cevap: string; kategori: string } | null>(null);
  const [deneme, setDeneme] = useState<{ yon: "INBOUND" | "OUTBOUND"; metin: string; bilgi?: string }[]>([]);
  const [yaz, setYaz] = useState("");
  const tazele = () => qc.invalidateQueries({ queryKey: ["whatsapp-ai-ayar"] });
  const is = async (ad: string, f: () => Promise<unknown>) => {
    setMesgul(ad);
    try { await f(); } catch (e) { Alert.alert("Olmadı", e instanceof Error ? e.message : ""); } finally { setMesgul(null); }
  };
  const kaydet = (yeniAyar: Ayar) => is("kaydet", async () => {
    await istek("/api/admin/whatsapp-ai", { govde: yeniAyar });
    await tazele();
    Alert.alert("Kaydedildi");
  });
  if (q.isPending || !a) return <View style={{ flex: 1 }}><Baslik baslik="WhatsApp AI" geri /><Yukleniyor /></View>;
  const d = q.data!;
  const bot = d.connection.bot;
  const set = <K extends keyof Ayar>(k: K, v: Ayar[K]) => setA({ ...a, [k]: v });
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik="WhatsApp AI" alt={a.enabled ? "Asistan açık" : "Asistan kapalı"} geri />
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <Segment secenekler={[{ deger: "durum", etiket: "Durum" }, { deger: "kurallar", etiket: "Kurallar" }, { deger: "egitim", etiket: `Eğitim ${a.trainingExamples.length}` }, { deger: "dene", etiket: "Dene" }]} deger={sekme} degisti={setSekme} />
      </View>
      <Ekran yenile={q.refetch} yenileniyor={q.isRefetching}>
        {sekme === "durum" ? (
          <>
            <Kart style={{ gap: 8 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Yazi tur="altBaslik" style={{ flex: 1 }}>WhatsApp bağlantısı</Yazi>
                <Rozet metin={bot.status} ton={d.connection.whatsapp ? "yesil" : "kirmizi"} />
              </View>
              {bot.phone ? <Yazi tur="kucuk">{`Numara: ${bot.phone}`}</Yazi> : null}
              {bot.lastEventAt ? <Yazi tur="kucuk">{`Son sinyal: ${goreli(bot.lastEventAt)}`}</Yazi> : null}
              {bot.error ? <Yazi tur="kucuk" renk={R.kirmizi}>{bot.error}</Yazi> : null}
              {bot.qr && !d.connection.whatsapp ? (
                <>
                  <Yazi tur="kucuk">Bağlamak için WhatsApp → Bağlı cihazlar → Cihaz bağla ile bu kodu okutun (başka bir telefondan).</Yazi>
                  <Image source={{ uri: bot.qr.startsWith("data:") ? bot.qr : `data:image/png;base64,${bot.qr}` }} style={{ width: 240, height: 240, alignSelf: "center" }} />
                </>
              ) : null}
              <Yazi tur="kucuk">{`Model: ${d.connection.model} · Gemini ${d.connection.gemini ? "tanımlı" : "yok"}`}</Yazi>
            </Kart>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: BOSLUK.m }}>
              <Sayac etiket="Konuşma" deger={d.stats.conversations} ikon="sohbet" />
              <Sayac etiket="Mesaj" deger={d.stats.totalMessages} ikon="mesaj" />
              <Sayac etiket="Yapay zekâ cevabı" deger={d.stats.aiMessages} ikon="yapayzeka" />
              <Sayac etiket="İnsana devredilen" deger={d.stats.handoffCount} ikon="kullanici" ton={d.stats.handoffCount ? "kirmizi" : "mavi"} />
            </View>
            <Anahtar etiket="Yapay zekâ cevap versin" alt="Kapalıyken mesajlar yalnızca kaydedilir, ekip cevaplar" deger={a.enabled} degisti={(v) => kaydet({ ...a, enabled: v })} />
          </>
        ) : null}
        {sekme === "kurallar" ? (
          <Kart style={{ gap: 12 }}>
            <Alan etiket="Asistanın adı" value={a.assistantName} onChangeText={(v) => set("assistantName", v)} />
            <Alan etiket="Karşılama mesajı" value={a.welcomeMessage} onChangeText={(v) => set("welcomeMessage", v)} multiline />
            <Alan etiket="Üslup" value={a.tone} onChangeText={(v) => set("tone", v)} multiline />
            <Alan etiket="Şirket bilgisi" value={a.companyKnowledge} onChangeText={(v) => set("companyKnowledge", v)} multiline />
            <Alan etiket="Satış kuralları" value={a.salesRules} onChangeText={(v) => set("salesRules", v)} multiline />
            <Alan etiket="Kalite kuralları" value={a.qualityRules} onChangeText={(v) => set("qualityRules", v)} multiline />
            <Alan etiket="Söylenmeyecekler (satır satır)" value={a.prohibitedClaims.join("\n")} onChangeText={(v) => set("prohibitedClaims", v.split("\n"))} multiline />
            <Alan etiket="İnsana devir kelimeleri (satır satır)" value={a.handoffKeywords.join("\n")} onChangeText={(v) => set("handoffKeywords", v.split("\n"))} multiline />
            <Alan etiket="Mesai dışı / devir mesajı" value={a.outOfHoursMessage} onChangeText={(v) => set("outOfHoursMessage", v)} multiline />
            <Anahtar etiket="Yöneticiye haber ver" alt="Devredilen konuşmada yöneticiye WhatsApp gider" deger={a.managerEscalationEnabled} degisti={(v) => set("managerEscalationEnabled", v)} />
            <Anahtar etiket="Yönetici onayı modu" alt="Cevaplar gönderilmeden önce onay bekler" deger={a.managerApprovalMode} degisti={(v) => set("managerApprovalMode", v)} />
            <Alan etiket="Yönetici telefonu" value={a.managerPhone} onChangeText={(v) => set("managerPhone", v)} keyboardType="phone-pad" />
            <Dugme metin="Kuralları kaydet" ikon="tik" yukleniyor={mesgul === "kaydet"} onPress={() => kaydet({ ...a, prohibitedClaims: a.prohibitedClaims.map((x) => x.trim()).filter(Boolean), handoffKeywords: a.handoffKeywords.map((x) => x.trim()).filter(Boolean) })} />
          </Kart>
        ) : null}
        {sekme === "egitim" ? (
          <>
            <Dugme metin="Örnek ekle" ikon="arti" onPress={() => setYeni({ musteri: "", cevap: "", kategori: "Genel" })} />
            <Yazi tur="kucuk">Asistan benzer bir mesaj gelince bu cevapları örnek alır.</Yazi>
            {a.trainingExamples.slice().reverse().map((o) => (
              <Kart key={o.id} style={{ gap: 6 }}>
                <Rozet metin={o.category} ton="kum" />
                <Yazi tur="kucuk">{`Müşteri: ${o.customerMessage}`}</Yazi>
                <Yazi>{o.idealReply}</Yazi>
                <Dugme metin="Sil" kucuk tur="tehlike" onPress={() => Alert.alert("Örnek silinsin mi?", "", [{ text: "Vazgeç" }, { text: "Sil", style: "destructive", onPress: () => is("sil", async () => { await istek("/api/admin/whatsapp-ai/feedback", { method: "DELETE", govde: { id: o.id } }); await tazele(); }) }])} />
              </Kart>
            ))}
          </>
        ) : null}
        {sekme === "dene" ? (
          <>
            <Yazi tur="kucuk">Müşteri gibi yazın; asistanın vereceği cevabı görürsünüz. Kimseye mesaj gitmez.</Yazi>
            {deneme.map((m, i) => (
              <Kart key={i} style={{ gap: 4, alignSelf: m.yon === "INBOUND" ? "flex-end" : "flex-start", maxWidth: "88%", backgroundColor: m.yon === "INBOUND" ? R.maviZemin : R.kart }}>
                <Yazi>{m.metin}</Yazi>
                {m.bilgi ? <Yazi tur="kucuk">{m.bilgi}</Yazi> : null}
              </Kart>
            ))}
            <Bolum baslik="Mesaj">
              <Alan etiket="Müşteri mesajı" value={yaz} onChangeText={setYaz} multiline />
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Dugme metin="Temizle" tur="ikincil" onPress={() => setDeneme([])} style={{ flex: 1 }} />
                <Dugme metin="Gönder" ikon="gonder2" yukleniyor={mesgul === "dene"} devreDisi={!yaz.trim()} style={{ flex: 2 }} onPress={() => is("dene", async () => {
                  const gecmis = deneme.map((m) => ({ direction: m.yon, content: m.metin }));
                  const metin = yaz.trim();
                  setDeneme((o) => [...o, { yon: "INBOUND", metin }]);
                  setYaz("");
                  const r = await istek<Test>("/api/admin/whatsapp-ai/test", { govde: { message: metin, history: gecmis } });
                  setDeneme((o) => [...o, { yon: "OUTBOUND", metin: r.reply, bilgi: `${r.leadType} · puan ${r.leadScore}${r.handoff ? ` · insana devir: ${r.handoffReason}` : ""}` }]);
                })} />
              </View>
            </Bolum>
          </>
        ) : null}
      </Ekran>
      <AltSayfa acik={!!yeni} kapat={() => setYeni(null)} baslik="Eğitim örneği">
        <Alan etiket="Müşteri mesajı" value={yeni?.musteri ?? ""} onChangeText={(musteri) => setYeni((o) => (o ? { ...o, musteri } : o))} multiline />
        <Alan etiket="İdeal cevap" value={yeni?.cevap ?? ""} onChangeText={(cevap) => setYeni((o) => (o ? { ...o, cevap } : o))} multiline />
        <Alan etiket="Kategori" value={yeni?.kategori ?? ""} onChangeText={(kategori) => setYeni((o) => (o ? { ...o, kategori } : o))} />
        <Dugme metin="Ekle" yukleniyor={mesgul === "ekle"} devreDisi={!yeni?.musteri.trim() || !yeni?.cevap.trim()} onPress={() => yeni && is("ekle", async () => {
          await istek("/api/admin/whatsapp-ai/feedback", { govde: { customerMessage: yeni.musteri.trim(), idealReply: yeni.cevap.trim(), category: yeni.kategori.trim() || "Genel" } });
          await tazele();
          setYeni(null);
        })} />
      </AltSayfa>
    </View>
  );
}
