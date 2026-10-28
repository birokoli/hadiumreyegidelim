// Veri kancaları (React Query). Uçlar web panelinin kullandıklarıyla aynı; mobil uçlar yalnızca uygulamaya özel işler için.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { istek } from "@/api/istemci";
import type { Aday, Bildirim, CrmKayit, DestekSohbet, Dosya, HavuzKayit, Icerik, Iletisim, Influencer, Kampanya, Ozet, Rezervasyon, Uye, WaKonusma, Yorum } from "./tipler";

export const useOzet = () => useQuery({ queryKey: ["ozet"], queryFn: () => istek<Ozet>("/api/mobil/ozet"), refetchInterval: 60_000 });

export const useBildirimler = () => useQuery({ queryKey: ["bildirimler"], queryFn: () => istek<{ bildirimler: Bildirim[]; okunmamis: number }>("/api/mobil/bildirimler") });

export type SatisListe = { dosyalar: Dosya[]; ekip: { id: string; name: string }[]; ben: { id: string; name: string }; acilis: Record<string, { sayi: number; son: string } | undefined> };
export const useDosyalar = () => useQuery({ queryKey: ["satis"], queryFn: () => istek<SatisListe>("/api/admin/satis") });

export type DosyaAyrinti = {
  dosya: Dosya;
  belgeler: { id: string; ad: string; tur: string; mime: string; createdAt: string }[];
  oneri: { id: string; name: string; email: string }[];
  bagliUye: { id: string; name: string; email: string } | null;
  acilislar: { id: string; tur: string; cihaz: string; createdAt: string }[];
  asamalar: { key: string; label: string }[];
  ekip: { id: string; name: string }[];
  oteller: { slug: string; ad: string; sehir: string; kabe: number | null }[];
  kutuphane: { id: string; kategori: string; ad: string; alis: number; satis: number | null }[];
  bildirim?: string | null;
};
export const useDosya = (no: string) => useQuery({ queryKey: ["satis", no], queryFn: () => istek<DosyaAyrinti>(`/api/admin/satis/${encodeURIComponent(no)}`), enabled: !!no });

export const useIletisim = () => useQuery({ queryKey: ["iletisim"], queryFn: () => istek<Iletisim[]>("/api/admin/contact") });
export const useCrm = () => useQuery({ queryKey: ["crm"], queryFn: () => istek<{ leads: CrmKayit[] }>("/api/admin/crm") });
export const useHavuz = () => useQuery({ queryKey: ["havuz"], queryFn: () => istek<{ leads: HavuzKayit[] }>("/api/admin/leads") });
export const useRamazan = () => useQuery({ queryKey: ["ramazan"], queryFn: () => istek<{ liste: Rezervasyon[] }>("/api/admin/ramazan") });
export const useYorumlar = () => useQuery({ queryKey: ["yorumlar"], queryFn: () => istek<{ items: Yorum[] }>("/api/admin/reviews") });
export const useUyeler = () => useQuery({ queryKey: ["uyeler"], queryFn: () => istek<{ uyeler: Uye[] }>("/api/mobil/uyeler") });
export const useInfluencerlar = () => useQuery({ queryKey: ["influencerlar"], queryFn: () => istek<{ influencers: Influencer[] }>("/api/admin/influencers") });
export const useIcerikler = (durum: string) => useQuery({ queryKey: ["icerikler", durum], queryFn: () => istek<{ icerikler: Icerik[] }>(`/api/mobil/icerikler?durum=${durum}`) });
export const useAdaylar = () => useQuery({ queryKey: ["adaylar"], queryFn: () => istek<{ items: Aday[]; counts: Record<string, number> }>("/api/admin/influencer-prospects") });
export const useKampanyalar = () => useQuery({ queryKey: ["kampanyalar"], queryFn: () => istek<{ campaigns: Kampanya[] }>("/api/admin/campaigns") });
export const useDestekler = () => useQuery({ queryKey: ["destek"], queryFn: () => istek<{ chats: DestekSohbet[] }>("/api/admin/support") });
export const useDestek = (id: string) => useQuery({ queryKey: ["destek", id], queryFn: () => istek<{ chat: DestekSohbet }>(`/api/admin/support/${id}`), refetchInterval: 15_000 });
export const useWhatsapp = () => useQuery({ queryKey: ["whatsapp"], queryFn: () => istek<{ conversations: WaKonusma[] }>("/api/admin/whatsapp-ai"), refetchInterval: 30_000 });
export const useFiyatlar = () =>
  useQuery({ queryKey: ["fiyatlar"], queryFn: () => istek<{ months: string[]; prices: { serviceId: string; month: string; variant: string; salePriceUsd: number }[]; payment: { usdTry: number | null; rateDate: string | null; ibanPercent: number; cardPercent: number } }>("/api/admin/service-prices") });

/** Değişiklik + ilgili listeleri ve özeti tazele */
export function useIslem<G, S = unknown>(fn: (g: G) => Promise<S>, tazele: string[][]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      for (const k of [...tazele, ["ozet"]]) qc.invalidateQueries({ queryKey: k });
    },
  });
}
