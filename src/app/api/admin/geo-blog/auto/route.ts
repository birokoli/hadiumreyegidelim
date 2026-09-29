import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAutoBlogEnabled, isAutoPublishEnabled, pickTopic } from "@/lib/geo-blog/auto";
import { requireSeoAdmin } from "@/lib/seo/guard";

const KEYS = ["AUTO_BLOG_ENABLED", "GEO_BLOG_AUTOPUBLISH"] as const;

/** 07 Blog → "Otomatik yazı" paneli: ayarlar, sıradaki konu, son çalıştırmalar */
export async function GET() {
  const denied = await requireSeoAdmin();
  if (denied) return denied;
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const [autoBlog, autoPublish, nextTopic, logs, today] = await Promise.all([
    isAutoBlogEnabled(),
    isAutoPublishEnabled(),
    pickTopic().catch(() => null),
    prisma.aILog.findMany({ orderBy: { createdAt: "desc" }, take: 8, select: { id: true, topic: true, status: true, details: true, createdAt: true, completedAt: true } }).catch(() => []),
    prisma.post.count({ where: { createdAt: { gte: todayStart } } }).catch(() => 0),
  ]);
  return NextResponse.json({
    autoBlog,
    autoPublish,
    anthropicKey: Boolean(process.env.ANTHROPIC_API_KEY),
    cronSecret: Boolean(process.env.CRON_SECRET),
    schedule: ["06:00 UTC (09:00 TSİ)", "08:00 UTC (11:00 TSİ)"],
    nextTopic,
    createdToday: today,
    logs,
  });
}

export async function POST(req: Request) {
  const denied = await requireSeoAdmin();
  if (denied) return denied;
  const { key, value } = (await req.json().catch(() => ({}))) as { key?: string; value?: unknown };
  if (!KEYS.includes(key as (typeof KEYS)[number]) || typeof value !== "boolean") {
    return NextResponse.json({ error: "Geçersiz ayar." }, { status: 400 });
  }
  await prisma.setting.upsert({ where: { key: key! }, update: { value: String(value) }, create: { key: key!, value: String(value) } });
  return NextResponse.json({ success: true, key, value });
}
