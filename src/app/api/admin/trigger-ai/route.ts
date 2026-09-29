import { NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { runAutoBlog, runningJob, pickTopic } from "@/lib/geo-blog/auto";
import { requireBlogAdmin } from "@/lib/seo/guard";

// Araştırma + yazım 5 dakikaya kadar sürebilir; yanıt hemen döner, üretim arkada sürer
export const maxDuration = 300;

/** "Yapay Zeka (AI)" sayfasındaki "Şimdi yaz" düğmesi: GEO motoruyla bir taslak üretir */
export async function POST() {
  const denied = await requireBlogAdmin();
  if (denied) return denied;
  try {
    const running = await runningJob();
    if (running) return NextResponse.json({ error: "Zaten bir yazı üretiliyor; bitmesini bekleyin.", logId: running.id }, { status: 409 });

    const topic = await pickTopic();
    const log = await prisma.aILog.create({ data: { topic, status: "INTERNET_SEARCH", details: `GEO motoru: "${topic}" araştırılıyor` } });
    after(async () => {
      await runAutoBlog({ logId: log.id, topic }).catch((e) => console.error("[trigger-ai]", e));
    });
    return NextResponse.json({ success: true, logId: log.id, topic });
  } catch (err) {
    console.error("[trigger-ai]", err);
    return NextResponse.json({ error: "Tetikleme başarısız." }, { status: 500 });
  }
}
