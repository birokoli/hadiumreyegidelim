// Üye tercihleri (Profil 2, 14 Ekim): umre planı ve iletişim izni. İzin değişikliği geçmişe kaydedilir (kaynak + IP).
import { NextResponse } from "next/server";
import { uyeOturumu } from "@/lib/members/guard";
import { getClientIp } from "@/lib/rate-limit";
import { saveTercih, type TercihGirdi } from "@/lib/uye-kampanya";

const KAYNAKLAR = ["pencere", "hesap", "plan", "kayit"]; // "abonelik" yalnızca imzalı e-posta bağlantısından

export async function POST(req: Request) {
  const o = await uyeOturumu();
  if (!o) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const g: TercihGirdi = {};
  for (const k of ["planDonem", "planKimle", "planOtel"] as const) if (k in b) g[k] = b[k] == null ? null : String(b[k]);
  if ("planKisi" in b) g.planKisi = b.planKisi == null ? null : Number(b.planKisi);
  if ("izinEposta" in b) g.izinEposta = b.izinEposta === true;
  if ("izinWhatsapp" in b) g.izinWhatsapp = b.izinWhatsapp === true;
  if (b.soruldu === true) g.soruldu = true;
  const kaynak = KAYNAKLAR.includes(String(b.kaynak)) ? String(b.kaynak) : "hesap";
  const t = await saveTercih(o.m.id, o.m.email, g, kaynak, getClientIp(req));
  return NextResponse.json({ ok: true, tercih: t });
}
