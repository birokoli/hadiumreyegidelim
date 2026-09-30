import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { CONTENT_PAGES, contentPath } from "@/content/pages";
import { validateContentPage } from "@/content/pages/validate";
import { sanitizeContentPage } from "@/content/pages/form";
import { knownContentPaths } from "@/content/pages/known-paths";
import { CONTENT_OVERRIDE_PREFIX, getContentOverrides, revalidateContentPage, type ContentOverride } from "@/content/pages/store";

// Yetki middleware'de ("content"); burada ayrıca imzalı oturum aranır
async function session() {
  return getAdminSession();
}

/** Liste (slug yok) ya da tek sayfa (?slug=) */
export async function GET(request: Request) {
  if (!(await session())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const overrides = await getContentOverrides(true);
  const slug = new URL(request.url).searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({
      pages: CONTENT_PAGES.map((p) => {
        const ov = overrides[p.slug];
        return {
          slug: p.slug,
          group: p.group,
          path: contentPath(p),
          h1: ov?.page.h1 ?? p.h1,
          keyword: ov?.page.keyword ?? p.keyword,
          reviewed: ov?.page.reviewed ?? p.reviewed,
          edited: Boolean(ov),
          savedAt: ov?.savedAt ?? null,
          savedBy: ov?.savedBy ?? null,
          // Kod dosyası admin kaydından sonra güncellendiyse admin sürümü onu gölgeliyor
          codeNewer: Boolean(ov && p.reviewed > ov.baseReviewed),
        };
      }),
    });
  }

  const code = CONTENT_PAGES.find((p) => p.slug === slug);
  if (!code) return NextResponse.json({ error: "Sayfa bulunamadı" }, { status: 404 });
  const ov = overrides[slug];
  return NextResponse.json({
    page: ov ? { ...ov.page, slug: code.slug, group: code.group } : code,
    path: contentPath(code),
    edited: Boolean(ov),
    savedAt: ov?.savedAt ?? null,
    savedBy: ov?.savedBy ?? null,
    codeNewer: Boolean(ov && code.reviewed > ov.baseReviewed),
    knownPaths: [...knownContentPaths()].sort(),
  });
}

/** Denetle ({ dryRun: true }) ya da denetimden geçerse kaydet ve yayınla */
export async function POST(request: Request) {
  const admin = await session();
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const code = CONTENT_PAGES.find((p) => p.slug === body?.slug);
  if (!code || !body?.page) return NextResponse.json({ error: "Eksik veri" }, { status: 400 });

  const page = sanitizeContentPage(body.page as Record<string, unknown>, code);
  const issues = validateContentPage(page, knownContentPaths());
  const errors = issues.filter((i) => i.level === "hata");
  if (body.dryRun || errors.length) {
    return NextResponse.json({ ok: !errors.length, saved: false, issues, page }, { status: errors.length && !body.dryRun ? 422 : 200 });
  }

  const record: ContentOverride = { page, savedAt: new Date().toISOString(), savedBy: admin.name || admin.username, baseReviewed: code.reviewed };
  const key = CONTENT_OVERRIDE_PREFIX + code.slug;
  await prisma.setting.upsert({ where: { key }, update: { value: JSON.stringify(record) }, create: { key, value: JSON.stringify(record) } });
  revalidateContentPage(code);
  return NextResponse.json({ ok: true, saved: true, issues, page });
}

/** Admin sürümünü siler; sayfa kod dosyasındaki hâline döner */
export async function DELETE(request: Request) {
  if (!(await session())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const slug = new URL(request.url).searchParams.get("slug");
  const code = CONTENT_PAGES.find((p) => p.slug === slug);
  if (!code) return NextResponse.json({ error: "Sayfa bulunamadı" }, { status: 404 });
  await prisma.setting.deleteMany({ where: { key: CONTENT_OVERRIDE_PREFIX + code.slug } });
  revalidateContentPage(code);
  return NextResponse.json({ ok: true });
}
