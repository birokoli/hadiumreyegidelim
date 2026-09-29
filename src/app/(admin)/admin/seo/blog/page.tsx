import { redirect } from "next/navigation";

/** Blog yazıları tek yerde: İçerik Stüdyosu → Blog İçerikleri (blog motoru orada) */
export default async function SeoBlogRedirect({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const { topic } = await searchParams;
  redirect(topic ? `/admin/content?panel=new&topic=${encodeURIComponent(topic)}` : "/admin/content?panel=new");
}
