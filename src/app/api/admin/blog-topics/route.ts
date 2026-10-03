// Blog konu kuyruğu (docs/BLOG-MOTORU.md). GET: kuyruk, güncelleme önerileri, engelli ve öne alınan konular.
// POST { action: "refresh" } kuyruğu yeniden hesaplar; { action: "pin" | "unpin" | "block" | "unblock" | "dismissUpdate", topic | postSlug }.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { pickTopics, TOPIC_KEYS } from "@/lib/geo-blog/topic-select";

const read = async <T,>(key: string, fallback: T): Promise<T> => {
  const row = await prisma.setting.findUnique({ where: { key } });
  try {
    return row ? (JSON.parse(row.value) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key: string, v: unknown) => prisma.setting.upsert({ where: { key }, update: { value: JSON.stringify(v) }, create: { key, value: JSON.stringify(v) } });

async function state() {
  const [queue, updates, blocked, pinned] = await Promise.all([
    read(TOPIC_KEYS.QUEUE_KEY, []),
    read(TOPIC_KEYS.UPDATES_KEY, []),
    read<string[]>(TOPIC_KEYS.BLOCK_KEY, []),
    read<string[]>(TOPIC_KEYS.PIN_KEY, []),
  ]);
  return { queue, updates, blocked, pinned };
}

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  return NextResponse.json(await state());
}

export async function POST(req: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as { action?: string; topic?: string; postSlug?: string };
  const topic = b.topic?.trim().slice(0, 200);
  if (b.action === "refresh") {
    await pickTopics(0);
  } else if (b.action === "pin" || b.action === "unpin" || b.action === "block" || b.action === "unblock") {
    if (!topic) return NextResponse.json({ error: "Konu gerekli." }, { status: 400 });
    const key = b.action.endsWith("pin") ? TOPIC_KEYS.PIN_KEY : TOPIC_KEYS.BLOCK_KEY;
    const list = await read<string[]>(key, []);
    const next = b.action.startsWith("un") ? list.filter((t) => t !== topic) : [...new Set([...list, topic])];
    await write(key, next);
  } else if (b.action === "dismissUpdate") {
    const list = await read<{ postSlug: string }[]>(TOPIC_KEYS.UPDATES_KEY, []);
    await write(TOPIC_KEYS.UPDATES_KEY, list.filter((u) => u.postSlug !== b.postSlug));
  } else {
    return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
  }
  return NextResponse.json(await state());
}
