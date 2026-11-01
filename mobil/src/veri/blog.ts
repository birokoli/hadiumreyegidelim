// Blog yazısı (web: /api/posts). PUT bütün alanları yazar; bu yüzden düzenlemede yazının tamamı gönderilir.
import { useQuery } from "@tanstack/react-query";
import { istek } from "@/api/istemci";

export type Yazi = {
  id: string; slug: string; title: string; metaTitle: string | null; description: string | null; content: string; keywords: string | null; tags: string | null;
  authorId: string | null; imageUrl: string | null; imageAlt: string | null; tldr: string | null; faq: string | null; published: boolean; categoryId: string | null;
  focusKeyword: string | null; seoScore: number | null; personalExperience: string | null; references: string | null; scheduledAt: string | null; createdAt: string; updatedAt: string;
  category?: { id: string; name: string } | null; authorModel?: { id: string; name: string } | null;
};
export const useYazilar = () => useQuery({ queryKey: ["yazilar"], queryFn: () => istek<Yazi[]>("/api/posts") });
export const yaziKaydet = (y: Partial<Yazi>, yeni: boolean) => {
  const { category, authorModel, createdAt, updatedAt, ...govde } = y;
  return yeni ? istek<Yazi>("/api/posts", { govde }) : istek<Yazi>(`/api/posts?id=${y.id}`, { method: "PUT", govde });
};
