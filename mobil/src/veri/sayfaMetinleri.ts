// Sayfa metinleri (web: /admin/sayfa-metinleri): tanımlar sunucudan gelir (src/lib/page-texts/registry.ts), değerler ayardan.
import { useQuery } from "@tanstack/react-query";
import { istek } from "@/api/istemci";

export type MetinAlani = { key: string; label: string; default: string; multiline?: boolean; help?: string };
export type SayfaTanim = { id: string; label: string; path: string; fields: MetinAlani[] };
export const useSayfaMetinleri = () => useQuery({ queryKey: ["sayfa-metinleri"], queryFn: () => istek<{ pages: SayfaTanim[]; values: Record<string, Record<string, string>> }>("/api/admin/page-texts") });
