import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAutoBlogEnabled, runAutoBlog, runningJob } from "@/lib/geo-blog/auto";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Vercel Cron (vercel.json: 06:00 ve 08:00 UTC). Her çalıştırmanın sonucu "Yapay Zeka (AI)"
 * sayfasındaki kayıtlarda görünür; atlanan çalıştırmalar da nedeniyle kaydedilir.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const force = new URL(request.url).searchParams.get("force") === "true";

  const skip = async (reason: string) => {
    await prisma.aILog.create({ data: { topic: "otomatik yazı (cron)", status: "COMPLETED", details: `Atlandı: ${reason}`, completedAt: new Date() } }).catch(() => {});
    return NextResponse.json({ success: true, skipped: true, message: reason });
  };

  if (!force && !(await isAutoBlogEnabled())) return skip("Otomatik blog kapalı. Açmak için: Yapay Zeka (AI) sayfası → Otomatik Blog anahtarı.");
  if (!process.env.ANTHROPIC_API_KEY) return skip("ANTHROPIC_API_KEY tanımlı değil.");

  if (!force) {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const today = await prisma.post.count({ where: { createdAt: { gte: todayStart } } }).catch(() => 0);
    if (today > 0) return skip(`Bugün zaten ${today} yazı/taslak oluşturuldu (günde bir otomatik yazı).`);
  }

  const running = await runningJob();
  if (running) return skip(`Başka bir yazı üretimi sürüyor (${running.topic ?? running.id}).`);

  try {
    const result = await runAutoBlog();
    return NextResponse.json({
      success: true,
      postId: result.postId,
      title: result.title,
      seoScore: result.gateReport.score,
      gatePassed: result.gateReport.passed,
      published: result.published,
      status: result.published ? "PUBLISHED" : "DRAFT_CREATED",
    });
  } catch (e) {
    // Hata pipeline içinde AILog'a FAILED olarak yazıldı
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
