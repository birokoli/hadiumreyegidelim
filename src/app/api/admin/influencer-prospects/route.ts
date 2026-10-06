// Influencer aday havuzu API'si (sözleşme: docs/antigravity/G12-INFLUENCER.md, G12-2)
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { testMetaConnection } from "@/lib/influencer/meta";
import { PLATFORMS, STAGES, addProspect, rescoreBatch, cleanupList, findSimilar, draftMessage, createInvite, discoverProspects, getProspect, listProspects, refreshProspect, setNote, setStage, type Platform, type Stage } from "@/lib/influencer/prospects";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

export async function GET(req: NextRequest) {
  if (!(await getAdminSession())) return fail("Yetkisiz.", 401);
  const sp = req.nextUrl.searchParams;
  try {
    if (sp.get("test") === "meta") return NextResponse.json(await testMetaConnection());
    const id = sp.get("id");
    if (id) {
      const item = await getProspect(id);
      return item ? NextResponse.json({ item }) : fail("Aday bulunamadı.", 404);
    }
    const minScore = Number(sp.get("minScore")) || undefined;
    return NextResponse.json(await listProspects({ stage: sp.get("stage") || undefined, q: sp.get("q")?.trim() || undefined, minScore }));
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e), 500);
  }
}

export async function POST(req: NextRequest) {
  if (!(await getAdminSession())) return fail("Yetkisiz.", 401);
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const platform = (PLATFORMS as readonly string[]).includes(String(b.platform)) ? (b.platform as Platform) : "instagram";
  const id = typeof b.id === "string" ? b.id : "";
  try {
    switch (b.action) {
      case "add": {
        if (typeof b.handle !== "string" || !b.handle.trim()) return fail("Kullanıcı adı gerekli.");
        const r = await addProspect({ platform, handle: b.handle, name: typeof b.name === "string" ? b.name : undefined, note: typeof b.note === "string" ? b.note : undefined });
        return NextResponse.json({ ok: true, item: r.item, created: r.created });
      }
      case "discover": {
        const q = typeof b.query === "string" ? b.query.trim() : "";
        if (q.length < 3) return fail("Arama metni en az 3 karakter olmalı.");
        return NextResponse.json({ ok: true, ...(await discoverProspects(q, platform, b.mode === "google" ? "google" : "ai")) });
      }
      case "cleanup":
        return NextResponse.json({ ok: true, ...(await cleanupList()) });
      case "similar":
        if (!id) return fail("id gerekli.");
        return NextResponse.json({ ok: true, ...(await findSimilar(id)) });
      case "draft":
        if (!id) return fail("id gerekli.");
        return NextResponse.json({ ok: true, text: await draftMessage(id) });
      case "rescore":
        return NextResponse.json({ ok: true, refreshed: await rescoreBatch() });
      case "score":
        if (!id) return fail("id gerekli.");
        return NextResponse.json({ ok: true, item: await refreshProspect(id) });
      case "stage":
        if (!id || !(STAGES as readonly string[]).includes(String(b.stage))) return fail("Geçersiz aşama.");
        return NextResponse.json({ ok: true, item: await setStage(id, b.stage as Stage) });
      case "note": {
        if (!id) return fail("id gerekli.");
        const tr = b.audienceTR === undefined ? undefined : b.audienceTR === null || b.audienceTR === "" ? null : Number(b.audienceTR);
        if (tr !== undefined && tr !== null && !Number.isFinite(tr)) return fail("Türkiye payı sayı olmalı.");
        return NextResponse.json({ ok: true, item: await setNote(id, typeof b.note === "string" ? b.note : "", tr) });
      }
      case "invite":
        if (!id) return fail("id gerekli.");
        return NextResponse.json({ ok: true, ...(await createInvite(id)) });
      default:
        return fail("Bilinmeyen işlem.");
    }
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e), 500);
  }
}
