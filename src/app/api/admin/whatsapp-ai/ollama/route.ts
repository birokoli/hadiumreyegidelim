import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const maxDuration = 60;

const DEFAULT_OLLAMA_URL = "https://crawling-lusty-scarecrow.ngrok-free.dev";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session || !(session.legacy || session.role === "super_admin" || session.permissions.includes("marketing"))) {
    return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const messages = Array.isArray(body.messages)
      ? body.messages.slice(-20).map((message: { role?: string; content?: string }) => ({
          role: message.role === "assistant" ? "assistant" : "user",
          content: String(message.content || "").slice(0, 5000),
        })).filter((message: { content: string }) => message.content)
      : [];
    if (!messages.length) return NextResponse.json({ error: "Mesaj gerekli" }, { status: 400 });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55_000);
    const response = await fetch(`${process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ model: process.env.OLLAMA_MODEL || "llama3.2", messages, stream: false }),
      cache: "no-store",
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) throw new Error(`Ollama ${response.status}`);
    const result = await response.json() as { message?: { content?: string } };
    const reply = String(result.message?.content || "").trim();
    if (!reply) throw new Error("Ollama boş yanıt döndürdü");
    return NextResponse.json({ reply, provider: `Ollama · ${process.env.OLLAMA_MODEL || "llama3.2"}` });
  } catch {
    return NextResponse.json({ error: "Bağlantı hatası: Sunucu kapalı olabilir" }, { status: 502 });
  }
}
