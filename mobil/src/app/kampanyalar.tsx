// Kampanyalar (salt okunur özet): durum, tarih, katılımcı. Düzenleme ve brief web panelinde.
import { Linking, View } from "react-native";
import { API_URL } from "@/api/istemci";
import { useKampanyalar } from "@/veri/sorgular";
import { Baslik, IkonDugme, Rozet, Satir } from "@/ui/temel";
import Liste from "@/ui/Liste";
import { tarih } from "@/ui/bicim";

export default function Kampanyalar() {
  const q = useKampanyalar();
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik="Kampanyalar" geri sag={<IkonDugme ikon="web" etiket="Web panelinde aç" onPress={() => Linking.openURL(`${API_URL}/admin/campaigns`)} />} />
      <Liste q={q} veri={q.data?.campaigns ?? []} anahtar={(k) => k.id} bos="Kampanya yok" satir={(k) => (
        <Satir ikon="kampanya2" baslik={k.title} alt={[k.startDate && `${tarih(k.startDate)} – ${tarih(k.endDate)}`, k._count?.participants != null ? `${k._count.participants} katılımcı` : null, k.commissionPct ? `%${k.commissionPct} komisyon` : null].filter(Boolean).join(" · ")} sag={<Rozet metin={k.status} ton={k.status === "active" ? "yesil" : "gri"} />} />
      )} />
    </View>
  );
}
