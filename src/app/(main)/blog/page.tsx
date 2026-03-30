import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import BrandImageFallback from '@/components/ui/BrandImageFallback';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Blog & Manevi Rehberlik | Ethereal Serenity',
  description: 'Manevi yolculuğunuzda size rehberlik edecek yazılar, Medine ve Mekke hakkında derinlemesine bilgiler ve AI destekli rotalar.',
};

export default async function BlogIndexPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    include: { category: true }
  });

  const categories = await prisma.category.findMany({
    where: {
      posts: { some: { published: true } }
    },
    orderBy: { name: 'asc' }
  });

  return (
    <main className="pt-32 pb-24 min-h-screen bg-surface relative overflow-hidden">
      {/* Visual Accents */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] -z-10 rounded-full mix-blend-multiply pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <header className="mb-16 text-center max-w-3xl mx-auto">
          <span className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary mb-6 block bg-tertiary-fixed-dim/20 w-fit mx-auto px-4 py-1.5 rounded-full">
            İLİM VE İRFAN YOLCULUĞU
          </span>
          <h1 className="font-headline text-5xl md:text-6xl text-primary leading-tight mb-6 font-bold tracking-tight drop-shadow-sm">
            Manevi Rehberlik Blogu
          </h1>
          <p className="text-on-surface-variant text-lg leading-relaxed font-body mb-10">
            Kutsal topraklara yapacağınız ziyaret öncesinde, rotanızı aydınlatacak ve ruhunuzu hazırlayacak özel içeriklerimizi keşfedin.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/blog" className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-primary text-white shadow-md">
              Tümü
            </Link>
            {categories.map((cat: any) => (
              <Link 
                key={cat.id} 
                href={`/blog/kategori/${cat.slug}`} 
                className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-surface-container-high text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors border border-outline-variant/20 shadow-sm"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </header>

        {posts.length === 0 ? (
          <div className="text-center text-outline-variant py-20 bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-sm max-w-2xl mx-auto">
            <span className="material-symbols-outlined text-6xl mb-4 text-primary/30" style={{fontVariationSettings: "'FILL' 1"}}>menu_book</span>
            <p className="text-xl font-headline text-primary/70">Henüz yayınlanmış bir yazı bulunmuyor.</p>
            <p className="text-sm mt-2 text-outline">Lütfen daha sonra tekrar ziyaret edin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <Link href={`/blog/${post.slug}`} key={post.id} className="group h-full">
                <article className="bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant/10 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full bg-white relative">
                  {post.imageUrl ? (
                    <div className="h-60 overflow-hidden bg-surface-container relative">
                      <Image 
                        src={post.imageUrl} 
                        alt={post.title} 
                        fill 
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                        priority={index < 3} 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  ) : (
                    <div className="h-60 relative overflow-hidden">
                      <BrandImageFallback icon="menu_book" iconSize={4} />
                    </div>
                  )}
                  
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 text-[10px] font-bold tracking-widest uppercase text-tertiary mb-4">
                      {post.category && (
                        <span className="bg-primary/5 text-primary px-2 py-1 rounded-md">
                          {post.category.name}
                        </span>
                      )}
                      <span>{post.author}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary/30"></span>
                      <span>{new Date(post.createdAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <h2 className="font-headline text-2xl font-bold text-primary mb-3 leading-snug group-hover:text-secondary transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-3 flex-1 mb-8 opacity-90">
                      {post.description}
                    </p>
                    <div className="mt-auto pt-5 border-t border-outline-variant/10 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-primary group-hover:text-secondary transition-colors">
                      Yazıyı Oku <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
