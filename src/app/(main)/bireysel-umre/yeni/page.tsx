import { permanentRedirect } from "next/navigation";

// Önizleme bitti: planlayıcı /bireysel-umre'de (sorgu dizesi korunur, ör. ?mekkeotel=…)
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const qs = new URLSearchParams(Object.entries(sp).flatMap(([k, v]) => (v == null ? [] : (Array.isArray(v) ? v : [v]).map((x) => [k, x] as [string, string])))).toString();
  permanentRedirect(qs ? `/bireysel-umre?${qs}` : "/bireysel-umre");
}
