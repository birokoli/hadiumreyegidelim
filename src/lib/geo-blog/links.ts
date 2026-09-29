import { prisma } from "@/lib/prisma";
import { loadInventory } from "@/lib/geo-blog/inventory";

export interface LinkSuggestion {
  term: string;
  targetPath: string;
  targetTitle: string;
}

export interface PostLinkAnalysis {
  postId: string;
  postTitle: string;
  postSlug: string;
  hasRehberLinks: boolean;
  rehberLinkCount: number;
  suggestions: LinkSuggestion[];
}

/**
 * HTML içerisindeki kırık /rehber linklerini /blog olarak düzeltir.
 * /rehber/slug -> /blog/slug
 * /rehber -> /blog
 */
export function fixRehberLinks(html: string): string {
  if (!html || !html.includes("/rehber")) return html;
  return html
    .replace(/href=(["'])\/rehber\//gi, 'href=$1/blog/')
    .replace(/href=(["'])\/rehber(["'])/gi, 'href=$1/blog$2');
}

/**
 * HTML etiketlerini koruyarak (mevcut <a> ve <h1..6> içine girmeden)
 * belirtilen terimin ilk geçen halini linke dönüştürür.
 */
export function insertInternalLink(
  html: string,
  term: string,
  targetPath: string
): { updatedHtml: string; inserted: boolean } {
  if (!html || !term || !targetPath) return { updatedHtml: html, inserted: false };

  // Eğer sayfada bu link hedefi zaten varsa tekrar ekleme
  if (html.includes(`href="${targetPath}"`) || html.includes(`href='${targetPath}'`)) {
    return { updatedHtml: html, inserted: false };
  }

  const tokenRegex = /(<\/?[a-z0-9]+[^>]*>)/gi;
  const tokens = html.split(tokenRegex);

  let inserted = false;
  let inAnchor = false;
  let inHeading = false;

  const termLower = term.toLocaleLowerCase("tr");

  const resultTokens = tokens.map((token) => {
    if (token.startsWith("<")) {
      const lower = token.toLowerCase();
      if (lower.startsWith("<a ") || lower === "<a>") inAnchor = true;
      if (lower === "</a>") inAnchor = false;
      if (/^<h[1-6]/i.test(lower)) inHeading = true;
      if (/^<\/h[1-6]>/i.test(lower)) inHeading = false;
      return token;
    }

    if (!inserted && !inAnchor && !inHeading) {
      const idx = token.toLocaleLowerCase("tr").indexOf(termLower);
      if (idx !== -1) {
        const matchedText = token.slice(idx, idx + term.length);
        const before = token.slice(0, idx);
        const after = token.slice(idx + term.length);
        inserted = true;
        return `${before}<a href="${targetPath}">${matchedText}</a>${after}`;
      }
    }

    return token;
  });

  return { updatedHtml: resultTokens.join(""), inserted };
}

/**
 * Tüm yazıları veya belirli bir yazıyı iç link fırsatları ve /rehber linkleri yönünden analiz eder.
 */
export async function analyzePostLinks(targetPostId?: string): Promise<PostLinkAnalysis[]> {
  const inventory = await loadInventory();
  const whereClause = targetPostId ? { id: targetPostId } : {};

  const posts = await prisma.post.findMany({
    where: whereClause,
    select: { id: true, title: true, slug: true, content: true },
  });

  const results: PostLinkAnalysis[] = [];

  for (const post of posts) {
    const rehberMatches = post.content.match(/href=(["'])\/rehber/gi);
    const rehberLinkCount = rehberMatches ? rehberMatches.length : 0;

    const suggestions: LinkSuggestion[] = [];

    for (const target of inventory) {
      if (target.path === `/blog/${post.slug}`) continue;

      if (post.content.includes(`href="${target.path}"`) || post.content.includes(`href='${target.path}'`)) {
        continue;
      }

      for (const topic of target.topics) {
        if (!topic || topic.length < 4) continue;
        const topicLower = topic.toLocaleLowerCase("tr");
        if (post.content.toLocaleLowerCase("tr").includes(topicLower)) {
          if (!suggestions.some((s) => s.targetPath === target.path)) {
            suggestions.push({
              term: topic,
              targetPath: target.path,
              targetTitle: target.title,
            });
          }
          break;
        }
      }

      if (suggestions.length >= 6) break;
    }

    if (rehberLinkCount > 0 || suggestions.length > 0) {
      results.push({
        postId: post.id,
        postTitle: post.title,
        postSlug: post.slug,
        hasRehberLinks: rehberLinkCount > 0,
        rehberLinkCount,
        suggestions,
      });
    }
  }

  return results;
}

/**
 * Bir yazının kırık /rehber linklerini ve/veya seçilen önerilen iç linkleri uygular.
 */
export async function applyPostLinks(
  postId: string,
  options: { fixRehber?: boolean; linksToApply?: Array<{ term: string; targetPath: string }> }
) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new Error("Yazı bulunamadı.");

  let updatedContent = post.content;
  let fixedRehberCount = 0;
  let insertedLinkCount = 0;

  if (options.fixRehber) {
    const before = updatedContent;
    updatedContent = fixRehberLinks(updatedContent);
    if (before !== updatedContent) {
      fixedRehberCount = (before.match(/href=(["'])\/rehber/gi) || []).length;
    }
  }

  if (options.linksToApply && options.linksToApply.length > 0) {
    for (const item of options.linksToApply) {
      const res = insertInternalLink(updatedContent, item.term, item.targetPath);
      if (res.inserted) {
        updatedContent = res.updatedHtml;
        insertedLinkCount++;
      }
    }
  }

  if (updatedContent !== post.content) {
    await prisma.post.update({
      where: { id: postId },
      data: { content: updatedContent },
    });
  }

  return {
    success: true,
    postId,
    fixedRehberCount,
    insertedLinkCount,
  };
}

/**
 * Tüm veritabanındaki kırık /rehber linklerini toplu olarak düzeltir.
 */
export async function bulkFixRehberLinks() {
  const posts = await prisma.post.findMany({
    select: { id: true, content: true },
  });

  let fixedPostsCount = 0;
  let fixedLinksTotal = 0;

  for (const post of posts) {
    if (!post.content.includes("/rehber")) continue;
    const matches = post.content.match(/href=(["'])\/rehber/gi);
    const linkCount = matches ? matches.length : 0;
    const updated = fixRehberLinks(post.content);

    if (updated !== post.content) {
      await prisma.post.update({
        where: { id: post.id },
        data: { content: updated },
      });
      fixedPostsCount++;
      fixedLinksTotal += linkCount;
    }
  }

  return { fixedPostsCount, fixedLinksTotal };
}
