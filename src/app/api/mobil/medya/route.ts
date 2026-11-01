// Medya kütüphanesi (uygulama): web panelinin /api/admin/media listesi + her dosyanın sitede kullanılan herkese açık adresi.
// Silme ve yükleme web paneliyle aynı uçlardan yapılır (/api/admin/media DELETE, /api/upload).
import { NextResponse } from "next/server";
import { mobilOturum, oturumYok, yetkili } from "@/lib/mobil/istek";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const o = await mobilOturum(req);
  if (!o) return oturumYok();
  if (!yetkili(o, "content")) return NextResponse.json({ hata: "Yetkiniz yok." }, { status: 403 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ hata: "Depolama tanımlı değil." }, { status: 500 });
  const r = await fetch(`${url}/storage/v1/object/list/uploads`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ prefix: "", limit: 500, offset: 0, sortBy: { column: "created_at", order: "desc" } }),
    cache: "no-store",
  }).catch(() => null);
  const liste = r?.ok ? ((await r.json()) as { id: string; name: string; created_at: string; metadata?: { size: number; mimetype: string } }[]) : [];
  return NextResponse.json({
    dosyalar: (Array.isArray(liste) ? liste : [])
      .filter((f) => f.name !== ".emptyFolderPlaceholder" && f.metadata)
      .map((f) => ({ id: f.id, ad: f.name, url: `${url}/storage/v1/object/public/uploads/${encodeURIComponent(f.name)}`, boyut: f.metadata!.size, tur: f.metadata!.mimetype, tarih: f.created_at })),
  });
}
