import { NextResponse } from "next/server";
import { requireBlogAdmin } from "@/lib/seo/guard";
import { generateBlogDraft } from "@/lib/geo-blog/pipeline";

export const maxDuration = 300;

export async function POST(req: Request) {
  const denied = await requireBlogAdmin();
  if (denied) return denied;

  try {
    const { topic } = await req.json();
    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json({ error: "Konu başlığı (topic) zorunludur." }, { status: 400 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await generateBlogDraft(topic, (step, data) => {
            const chunk = JSON.stringify({ step, data }) + "\n";
            controller.enqueue(encoder.encode(chunk));
          });
          controller.close();
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          const chunk = JSON.stringify({ step: "error", error: errMsg }) + "\n";
          controller.enqueue(encoder.encode(chunk));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Geçersiz istek gövdesi." }, { status: 400 });
  }
}
