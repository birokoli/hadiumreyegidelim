// Sayfa Metinleri: GET kayıt defteri + kayıtlı değerler; PUT { page, values } kaydeder (boş değer = varsayılana dön).
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { revalidateSiteSettings } from "@/lib/site-settings";
import { PAGE_TEXTS, pageTextDef, pageTextsSettingKey } from "@/lib/page-texts/registry";

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const rows = await prisma.setting.findMany({ where: { key: { in: PAGE_TEXTS.map((p) => pageTextsSettingKey(p.id)) } } });
  const values: Record<string, Record<string, string>> = {};
  for (const r of rows) {
    try {
      values[r.key.slice("PAGE_TEXTS:".length)] = JSON.parse(r.value);
    } catch {
      /* bozuk kayıt yok sayılır */
    }
  }
  return NextResponse.json({ pages: PAGE_TEXTS, values });
}

export async function PUT(req: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { page?: string; values?: Record<string, unknown> };
  const def = pageTextDef(body.page ?? "");
  if (!def) return NextResponse.json({ error: "Sayfa bulunamadı." }, { status: 400 });
  // Yalnızca tanımlı alanlar; varsayılanla aynı ya da boş olan saklanmaz
  const clean: Record<string, string> = {};
  for (const f of def.fields) {
    const v = body.values?.[f.key];
    if (typeof v === "string" && v.trim() && v.trim() !== f.default) clean[f.key] = v.trim().slice(0, 20000); // SSS listesi uzun olabilir
  }
  const key = pageTextsSettingKey(def.id);
  const value = JSON.stringify(clean);
  await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  revalidateSiteSettings();
  try {
    revalidatePath(def.path);
  } catch {
    /* sayfa yeniden üretimi kaydı engellemez */
  }
  return NextResponse.json({ ok: true, saved: Object.keys(clean).length });
}
