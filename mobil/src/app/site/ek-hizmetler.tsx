// Ek hizmetler (web: /admin/services): eski sabit hizmet listesi (otel, tren, transfer, uçuş, ekstra).
import { useQuery } from "@tanstack/react-query";
import { istek } from "@/api/istemci";
import { KayitEkrani } from "@/ui/form";
import { usd } from "@/ui/bicim";

type Hizmet = { id: string; type: string; name: string; description: string | null; price: number | string; extraData: string | null };
const TUR = [{ deger: "HOTEL", etiket: "Otel" }, { deger: "TRAIN", etiket: "Tren" }, { deger: "TRANSFER", etiket: "Transfer" }, { deger: "FLIGHT", etiket: "Uçuş" }, { deger: "EXTRA", etiket: "Ekstra" }];
const IKON: Record<string, string> = { HOTEL: "otel", TRAIN: "tren", TRANSFER: "transfer", FLIGHT: "ucak", EXTRA: "paket" };

export default function EkHizmetler() {
  const q = useQuery({ queryKey: ["ek-hizmetler"], queryFn: () => istek<Hizmet[]>("/api/services") });
  return (
    <KayitEkrani<Hizmet>
      baslik="Ek hizmetler"
      q={q}
      anahtar={["ek-hizmetler"]}
      veri={q.data ?? []}
      bos="Hizmet yok"
      suzgec={{ secenekler: [{ deger: "ALL", etiket: "Tümü" }, ...TUR], uygula: (h, d) => d === "ALL" || h.type === d }}
      satir={(h) => ({ baslik: h.name, alt: [TUR.find((t) => t.deger === h.type)?.etiket, usd(Number(h.price))].filter(Boolean).join(" · "), ikon: IKON[h.type] ?? "paket" })}
      alanlar={[
        { k: "type", etiket: "Kategori", tur: "secim", secenekler: TUR },
        { k: "name", etiket: "Hizmet adı" },
        { k: "price", etiket: "Fiyat ($)", tur: "sayi" },
        { k: "description", etiket: "Açıklama", tur: "uzun" },
        { k: "extraData", etiket: "Ek bilgi (JSON)", tur: "uzun", alt: "Gelişmiş: web panelindeki ek veri alanı" },
      ]}
      yeni={() => ({ id: "", type: "EXTRA", name: "", description: "", price: "", extraData: "" })}
      kaydet={(h, yeni) => istek("/api/services", { method: yeni ? "POST" : "PUT", govde: { ...h, price: Number(h.price) || 0 } })}
      sil={(h) => istek(`/api/services?id=${h.id}`, { method: "DELETE" })}
    />
  );
}
