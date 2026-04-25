import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import BrandImageFallback from '@/components/ui/BrandImageFallback';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: { absolute: 'Manevi Rehberlik Blogu — Umre & Hac Yazıları | HadiUmreyeGidelim' },
  description: 'Umre ve hac yolculuğunuzda size rehberlik edecek yazılar, Mekke ve Medine hakkında derinlemesine bilgiler, pratik ipuçları ve bireysel deneyimler.',
  alternates: { canonical: '/blog' },
};

export const revalidate = 60;

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

  const heroPost = posts[0];
  const gridPosts = posts.slice(1);

  // Sahte Okunma Süresi Hesaplayıcı (1000 karaktere 1 dakika)
  const getReadTime = (content: string | null) => {
    if (!content) return "2 Dk Okuma";
    return Math.max(2, Math.ceil(content.length / 1000)) + " Dk Okuma";
  };

  return (
    <main className="pt-32 pb-24 min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Visual Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <header className="mb-16 text-center max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] bg-white border border-slate-200 text-slate-500 shadow-sm mb-6">
            İLİM VE İRFAN YOLCULUĞU
          </span>
          <h1 className="font-headline text-5xl md:text-6xl text-slate-900 leading-tight mb-6 font-bold tracking-tight">
            Manevi Rehber<span className="text-primary opacity-60">lik</span>
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            Hac ve Umre bültenimizi takip edin, Medine ve Mekke'ye dair sırları, güncel konaklama ve ziyaret taktiklerini ilk siz öğrenin.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/blog" className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-primary text-white shadow-md shadow-primary/20 hover:scale-105 transition-transform">
              Tümü
            </Link>
            {categories.map((cat: any) => (
              <Link 
                key={cat.id} 
                href={`/blog/kategori/${cat.slug}`} 
                className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-sm hover:shadow-md transition-all whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </header>

        {posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-2xl mx-auto">
            <span className="material-symbols-outlined text-6xl mb-4 text-slate-300">article</span>
            <p className="text-xl font-headline text-slate-800 font-medium">Henüz yayınlanmış bir bülten bulunmuyor.</p>
            <p className="text-sm mt-2 text-slate-500">Çok yakında harika içeriklerle burada olacağız.</p>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Manşet Post (Hero) */}
            {heroPost && (
              <Link href={`/blog/${heroPost.slug}`} className="group block">
                <article className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-md hover:shadow-xl hover:border-primary/20 transition-all duration-500 flex flex-col md:flex-row relative z-20">
                  <div className="md:w-3/5 h-[300px] md:h-[450px] relative overflow-hidden bg-slate-100">
                    {heroPost.imageUrl ? (
                      <Image 
                        src={heroPost.imageUrl} 
                        alt={heroPost.title} 
                        fill 
                        sizes="(max-width: 768px) 100vw, 60vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                        priority 
                      />
                    ) : (
                      <BrandImageFallback icon="auto_awesome" iconSize={6} />
                    )}
                    <div className="absolute top-6 left-6 flex gap-2">
                      <span className="bg-amber-400 text-amber-950 px-3 py-1.5 rounded-lg text-xs font-bold uppercase shadow-lg">
                        YENİ
                      </span>
                    </div>
                  </div>
                  
                  <div className="md:w-2/5 p-8 md:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-3 text-xs font-medium text-slate-500 mb-6">
                      {heroPost.category && (
                        <span className="font-bold uppercase tracking-wider text-primary">
                          {heroPost.category.name}
                        </span>
                      )}
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>{new Date(heroPost.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    
                    <h2 className="font-headline text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight group-hover:text-primary transition-colors line-clamp-3">
                      {heroPost.title}
                    </h2>
                    
                    <p className="text-slate-600 text-base leading-relaxed line-clamp-3 mb-8">
                      {heroPost.description}
                    </p>
                    
                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-6">
                      <div className="flex items-center gap-2 text-primary font-bold text-sm group-hover:translate-x-1 transition-transform">
                        İncele <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        {getReadTime(heroPost.content)}
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            )}

            {/* Grid Posts */}
            {gridPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {gridPosts.map((post) => (
                  <Link href={`/blog/${post.slug}`} key={post.id} className="group flex h-full">
                    <article className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col w-full">
                      
                      <div className="h-56 relative overflow-hidden bg-slate-100 mb-2">
                        {post.imageUrl ? (
                          <Image 
                            src={post.imageUrl} 
                            alt={post.title} 
                            fill 
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                          />
                        ) : (
                          <BrandImageFallback icon="auto_stories" iconSize={4} />
                        )}
                        {post.category && (
                          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                            {post.category.name}
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="font-headline text-xl font-bold text-slate-900 mb-3 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
                          {post.description}
                        </p>
                        
                        <div className="mt-auto border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                            {new Date(post.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px]">timer</span>
                            {getReadTime(post.content)}
                          </span>
                        </div>
                      </div>

                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
