// Dashboard "Bugün" (6 Ekim, kullanıcı: admin çok yoğun): bekleyen işler tek listede, her satır ilgili sayfaya gider.
// Her kaynak ayrı denenir; biri hata verirse o satır atlanır, panel yine açılır.
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBudget } from "@/lib/ai-budget";
import { readJson, SEO_KEYS } from "@/lib/seo/store";

type Task = { count: number; label: string; hint: string; href: string; icon: string; urgent?: boolean };

const safe = async <T,>(fn: () => Promise<T>, fallback: T) => {
  try {
    return await fn();
  } catch {
    return fallback;
  }
};

export default async function TodayPanel() {
  const [unread, drafts, reviews, replies, openChats, audit, budget] = await Promise.all([
    safe(() => prisma.contactRequest.count({ where: { status: "UNREAD" } }), 0),
    safe(() => prisma.post.count({ where: { published: false } }), 0),
    safe(async () => {
      const { ensureReviewSchema } = await import("@/lib/reviews/schema");
      await ensureReviewSchema();
      return prisma.review.count({ where: { status: "pending" } });
    }, 0),
    safe(async () => {
      const { ensureProspectSchema } = await import("@/lib/influencer/schema");
      await ensureProspectSchema();
      return prisma.influencerProspect.count({ where: { stage: "yanit" } });
    }, 0),
    safe(() => prisma.supportChat.count({ where: { status: "open", unreadByAdmin: { gt: 0 } } }), 0),
    safe(() => readJson<{ issues?: unknown[] } | null>(SEO_KEYS.audit, null), null),
    safe(() => getBudget(), null),
  ]);

  const auditIssues = Array.isArray(audit?.issues) ? audit!.issues!.length : 0;
  const budgetPct = budget && budget.limit > 0 ? Math.round((budget.usd / budget.limit) * 100) : 0;

  const tasks: Task[] = [
    { count: unread, label: "talep cevap bekliyor", hint: "Form ve WhatsApp'tan gelenler", href: "/admin/contact", icon: "mark_email_unread", urgent: true },
    { count: openChats, label: "canlı destek mesajı okunmadı", hint: "Influencer destek sohbetleri", href: "/admin/support", icon: "support_agent", urgent: true },
    { count: reviews, label: "yorum onay bekliyor", hint: "Yayımla ya da reddet", href: "/admin/yorumlar", icon: "reviews" },
    { count: drafts, label: "blog taslağı onay bekliyor", hint: "Blog motorunun yazdıkları dahil", href: "/admin/content", icon: "edit_note" },
    { count: replies, label: "influencer yanıt verdi", hint: "'Yanıt alındı' aşamasındakiler", href: "/admin/influencer-adaylari", icon: "person_search" },
    { count: auditIssues, label: "SEO denetim sorunu", hint: "Son denetime göre", href: "/admin/seo/denetim", icon: "travel_explore" },
    ...(budgetPct >= 80 ? [{ count: budgetPct, label: "% Claude bütçesi kullanıldı", hint: `${budget!.usd.toFixed(2)} / ${budget!.limit.toFixed(0)} $ bu ay`, href: "/admin/seo/blog", icon: "savings", urgent: budgetPct >= 100 }] : []),
  ].filter((t) => t.count > 0);

  return (
    <section className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-headline text-lg font-bold text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-[22px]">today</span> Bugün
        </h2>
        <span className="text-[11px] text-outline">{new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long", timeZone: "Europe/Istanbul" })}</span>
      </div>
      {tasks.length === 0 ? (
        <p className="mt-4 text-sm text-on-surface-variant">Bekleyen iş yok. Kolay gelsin.</p>
      ) : (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {tasks.map((t) => (
            <li key={t.href + t.label}>
              <Link href={t.href} className={`flex items-center gap-3 rounded-xl border p-3.5 transition-colors ${t.urgent ? "border-error/25 bg-error/[0.04] hover:border-error/50" : "border-outline-variant/20 hover:border-primary/40 hover:bg-primary/[0.03]"}`}>
                <span className={`material-symbols-outlined text-[22px] ${t.urgent ? "text-error" : "text-primary"}`}>{t.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-on-surface">
                    <b className={t.urgent ? "text-error" : "text-primary"}>{t.count}</b> {t.label}
                  </span>
                  <span className="block text-[11px] text-outline">{t.hint}</span>
                </span>
                <span className="material-symbols-outlined text-[18px] text-outline">chevron_right</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
