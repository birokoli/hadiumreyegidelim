import { NextResponse } from "next/server";

// Uygulama içi güncelleme denetimi (28 Ekim): en son APK sürümü public/indir/hadi-yonetim/surum.json'da.
// Uygulama açılışta buraya bakar; sürümü eskiyse "Güncelle" gösterir (zorunlu ise başka ekrana geçirmez).
export const dynamic = "force-static";
export async function GET() {
  const s = await import("../../../../../public/indir/hadi-yonetim/surum.json").then((m) => m.default).catch(() => null);
  return NextResponse.json(s ?? { surum: "0.0.0", kod: 0, apk: null, zorunlu: false, notlar: [] });
}
