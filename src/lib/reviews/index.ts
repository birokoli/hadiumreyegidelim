// Müşteri yorumları (4 Ekim, kullanıcı): kişiye özel bağlantıdan yorum + admin'den eski yorumların elle girişi.
// Kurallar: yalnızca gerçek müşteri; olumsuz yorum puanı yüzünden gizlenmez (yalnızca hakaret, kişisel bilgi,
// konu dışı içerik reddedilir); sitede yıldız şeması (AggregateRating) verilmez: Google kendi sitesindeki
// işletme yorumlarını "self-serving" sayar.
import { randomBytes } from "crypto";
import { unstable_cache, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ensureReviewSchema } from "@/lib/reviews/schema";
import { SITE_URL } from "@/lib/seo/site";

export const REVIEW_TAG = "reviews";
export const STATUSES = ["invited", "pending", "approved", "rejected"] as const;
export type ReviewStatus = (typeof STATUSES)[number];

export type PublicReview = { id: string; name: string; city: string | null; umreMonth: string | null; rating: number | null; text: string; photoUrl: string | null; reply: string | null; verified: boolean; date: string };

/** "Ayşe Yılmaz" → "Ayşe Y." */
export function shortName(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return parts[0] ?? "";
  return `${parts.slice(0, -1).join(" ")} ${parts[parts.length - 1][0].toLocaleUpperCase("tr-TR")}.`;
}

export const reviewUrl = (token: string) => `${SITE_URL}/yorum/${token}`;

export async function createInvite(customerName: string) {
  await ensureReviewSchema();
  const token = randomBytes(9).toString("base64url");
  const r = await prisma.review.create({ data: { token, customerName: customerName.trim(), displayName: shortName(customerName), status: "invited", source: "link" } });
  return { review: r, url: reviewUrl(token) };
}

export async function addManual(input: { customerName: string; displayName?: string; city?: string; umreMonth?: string; rating?: number | null; text: string; photoUrl?: string; date?: string }) {
  await ensureReviewSchema();
  const at = input.date ? new Date(input.date) : new Date();
  return prisma.review.create({
    data: {
      customerName: input.customerName.trim(),
      displayName: input.displayName?.trim() || shortName(input.customerName),
      city: input.city?.trim() || null,
      umreMonth: input.umreMonth?.trim() || null,
      rating: input.rating ?? null,
      text: input.text.trim(),
      photoUrl: input.photoUrl?.trim() || null,
      status: "pending",
      source: "manuel",
      consent: true,
      submittedAt: Number.isNaN(at.getTime()) ? new Date() : at,
    },
  });
}

export async function getByToken(token: string) {
  await ensureReviewSchema();
  return prisma.review.findUnique({ where: { token } });
}

export async function submitByToken(token: string, d: { displayName: string; city?: string; umreMonth?: string; rating: number; text: string; photoUrl?: string; consent: boolean }) {
  await ensureReviewSchema();
  const r = await prisma.review.findUnique({ where: { token } });
  if (!r) throw new Error("Bağlantı geçersiz.");
  if (r.status !== "invited") throw new Error("Bu bağlantıyla zaten yorum gönderilmiş. Teşekkür ederiz.");
  if (!d.consent) throw new Error("Yorumunuzun sitede yayımlanması için onay gerekli.");
  return prisma.review.update({
    where: { token },
    data: {
      displayName: d.displayName.trim().slice(0, 60) || shortName(r.customerName),
      city: d.city?.trim().slice(0, 60) || null,
      umreMonth: d.umreMonth?.trim().slice(0, 40) || null,
      rating: Math.max(1, Math.min(5, Math.round(d.rating))),
      text: d.text.trim().slice(0, 3000),
      photoUrl: d.photoUrl || null,
      consent: true,
      status: "pending",
      submittedAt: new Date(),
    },
  });
}

export async function adminList() {
  await ensureReviewSchema();
  return prisma.review.findMany({ orderBy: [{ updatedAt: "desc" }], take: 500 });
}

export async function adminUpdate(id: string, data: { status?: ReviewStatus; reply?: string | null; displayName?: string; text?: string; city?: string | null; umreMonth?: string | null; rating?: number | null; photoUrl?: string | null }) {
  await ensureReviewSchema();
  const r = await prisma.review.update({
    where: { id },
    data: {
      ...data,
      ...(data.status === "approved" ? { approvedAt: new Date() } : {}),
    },
  });
  revalidateTag(REVIEW_TAG, { expire: 0 });
  return r;
}

const toPublic = (r: Awaited<ReturnType<typeof prisma.review.findFirst>>): PublicReview => ({
  id: r!.id,
  name: r!.displayName || shortName(r!.customerName),
  city: r!.city,
  umreMonth: r!.umreMonth,
  rating: r!.rating,
  text: r!.text ?? "",
  photoUrl: r!.photoUrl,
  reply: r!.reply,
  // Elle eklenenler de doğrulanmış sayılır (kullanıcı, 5 Ekim): admin eklerken gerçek müşteri olduğunu onaylar
  verified: true,
  date: (r!.submittedAt ?? r!.createdAt).toISOString(),
});

/** Sitede gösterilen onaylı yorumlar (en yeni önce) */
export const getApprovedReviews = unstable_cache(
  async (limit = 200): Promise<PublicReview[]> => {
    try {
      await ensureReviewSchema();
      const rows = await prisma.review.findMany({ where: { status: "approved" }, orderBy: [{ submittedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }], take: limit });
      return rows.map(toPublic);
    } catch (e) {
      console.error("[reviews] okunamadı", e);
      return [];
    }
  },
  ["reviews-approved-v1"],
  { tags: [REVIEW_TAG], revalidate: 3600 },
);

/** Yorum fotoğrafı için imzalı yükleme adresi (yalnızca geçerli bağlantıyla ya da admin'den) */
export async function signReviewPhoto(ext: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !key) throw new Error("Depolama ayarlı değil.");
  const safe = ({ jpg: "jpg", jpeg: "jpg", png: "png", webp: "webp" } as Record<string, string>)[ext.toLowerCase()] ?? "webp";
  const filename = `yorum-${Date.now()}-${randomBytes(4).toString("hex")}.${safe}`;
  const res = await fetch(`${supabaseUrl}/storage/v1/object/upload/sign/uploads/${filename}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ upsert: false }),
  });
  if (!res.ok) throw new Error(`Yükleme adresi alınamadı (${res.status}).`);
  const body = (await res.json()) as { signedURL?: string; signed_url?: string; url?: string };
  const raw = body.signedURL || body.signed_url || body.url || "";
  if (!raw) throw new Error("Yükleme adresi alınamadı.");
  const signedURL = raw.startsWith("http") ? raw : `${supabaseUrl}${raw.startsWith("/storage/v1") ? "" : "/storage/v1"}${raw}`;
  return { signedURL, publicUrl: `${supabaseUrl}/storage/v1/object/public/uploads/${filename}` };
}
