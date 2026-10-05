// Blog → "Kişisel deneyim": yazarın kısa notlarını okunur bir paragrafa çevirir. Notlarda olmayan bilgi eklenmez
// (deneyim uydurmak yanıltıcı olur ve Google'ın "deneyim" sinyaline zarar verir).
import { NextRequest, NextResponse } from "next/server";
import { requireBlogAdmin } from "@/lib/seo/guard";
import { callClaude } from "@/lib/geo-blog/claude";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const denied = await requireBlogAdmin();
  if (denied) return denied;
  const { notes, title } = (await req.json().catch(() => ({}))) as { notes?: string; title?: string };
  if (!notes || notes.trim().length < 15) return NextResponse.json({ error: "Önce birkaç kelimelik not yazın (en az 15 karakter)." }, { status: 400 });
  try {
    const { text } = await callClaude({
      feature: "blog",
      effort: "low",
      maxTokens: 1500,
      system:
        "Bir umre organizasyonunun yazarının kısa notlarını, blog yazısının başındaki 'Yazarın Kişisel Deneyimi' kutusu için 2–5 cümlelik, birinci tekil ya da çoğul şahıs, sade ve samimi bir Türkçe paragrafa çeviriyorsun. " +
        "KURAL: Notlarda olmayan hiçbir olay, sayı, yer, kişi ya da duygu ekleme; yalnızca notları dilbilgisi ve akış açısından düzenle. Abartı, satış dili, 'en iyi', 'garanti', 'sıfır', '7/24' yok. Başlık, tırnak, açıklama yazma; sadece paragrafı döndür.",
      prompt: `Yazı başlığı: ${title ?? "-"}\n\nNotlar:\n${notes.trim().slice(0, 2000)}`,
    });
    return NextResponse.json({ text: text.trim() });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
