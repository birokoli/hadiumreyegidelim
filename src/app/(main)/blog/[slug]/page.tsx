import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

// 1. Dinamik Meta Etiketleri Altyapısı (Open Graph & Twitter)
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  
  if (!post) {
    return { title: 'Bulunamadı - Hadi Umreye Gidelim' };
  }
  
  return {
    title: `${post.title} | Hadi Umre'ye Gidelim`,
    description: post.description,
    keywords: post.keywords?.split(',').map(k => k.trim()),
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description || undefined,
      type: 'article',
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.authorId ? "https://hadiumreyegidelim.com/blog" : post.author],
      url: `https://hadiumreyegidelim.com/blog/${slug}`,
      images: post.imageUrl ? [{ url: post.imageUrl }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description || undefined,
      images: post.imageUrl ? [post.imageUrl] : [],
    }
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ 
    where: { slug },
    include: { category: true, authorModel: true }
  });
  
  if (!post) notFound();

  // 3. Yapılandırılmış Veri (Schema Markup) - BlogPosting JSON-LD & Person (E-E-A-T)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.imageUrl ? [post.imageUrl] : [],
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: [{
      '@type': 'Person',
      name: post.authorModel?.name || post.author,
      url: post.authorModel?.linkedin || post.authorModel?.twitter || 'https://hadiumreyegidelim.com/hakkimizda',
      jobTitle: post.authorModel?.expertise || undefined,
      description: post.authorModel?.bio || undefined,
      image: post.authorModel?.image || undefined
    }]
  };

  // Breadcrumb Schema for Blog Post
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Anasayfa', item: 'https://hadiumreyegidelim.com' },
      { '@type': 'ListItem', position: 2, name: 'Manevi Rehberlik Blogu', item: 'https://hadiumreyegidelim.com/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://hadiumreyegidelim.com/blog/${post.slug}` }
    ]
  };

  return (
    // 2. Semantik HTML Kullanımı (<main> ve <article>)
    <main className="pt-32 pb-24 min-h-screen bg-surface">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <article className="max-w-3xl mx-auto px-6">
        <header className="mb-12">
          {/* Visual Breadcrumbs */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
              <li className="inline-flex items-center">
                <Link href="/" className="inline-flex items-center text-xs font-bold text-outline hover:text-primary transition-colors tracking-widest uppercase">
                  Anasayfa
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-[14px] text-outline-variant mx-1">chevron_right</span>
                  <Link href="/blog" className="ms-1 text-xs font-bold text-outline hover:text-primary transition-colors tracking-widest uppercase">
                    Blog
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-[14px] text-outline-variant mx-1">chevron_right</span>
                  <span className="ms-1 text-xs font-bold text-primary/60 tracking-widest uppercase line-clamp-1 max-w-[150px] md:max-w-[300px]">
                    {post.title}
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          {post.imageUrl && (
            <div className="w-full h-[400px] mb-10 rounded-3xl overflow-hidden shadow-[0px_32px_64px_-12px_rgba(0,55,129,0.06)] border border-outline-variant/10">
              <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-4 text-xs text-outline mb-6 uppercase tracking-[0.2em] font-bold">
            {post.category && (
              <span className="bg-primary text-white px-3 py-1.5 rounded-full shadow-sm">{post.category.name}</span>
            )}
            <span className="bg-primary/5 text-primary px-3 py-1.5 rounded-full">
              Yayın: {new Date(post.createdAt).toLocaleDateString('tr-TR')}
            </span>
            {post.updatedAt.getTime() - post.createdAt.getTime() > 86400000 && (
              <span className="bg-secondary/10 text-secondary px-3 py-1.5 rounded-full" title="İçerik güncelliği okuyucu güvenini artırır (E-E-A-T)">
                Son Güncelleme: {new Date(post.updatedAt).toLocaleDateString('tr-TR')}
              </span>
            )}
            <span className="w-1.5 h-1.5 bg-outline-variant rounded-full"></span>
            <span>Kaleme Alan: {post.authorModel?.name || post.author}</span>
          </div>
          
          {/* H1 Semantik Başlık */}
          <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl text-primary font-bold leading-tight tracking-tight drop-shadow-sm">
            {post.title}
          </h1>
        </header>

        {/* E-E-A-T Experience Injection */}
        {post.personalExperience && (
          <div className="my-10 bg-[#f8fafc] border-l-4 border-secondary p-8 rounded-r-3xl shadow-sm italic relative">
            <span className="material-symbols-outlined absolute top-4 right-6 text-slate-200 text-6xl opacity-30 select-none">format_quote</span>
            <div className="flex items-center gap-2 mb-3">
               <span className="material-symbols-outlined text-secondary text-[18px]">verified_user</span>
               <span className="text-secondary font-bold text-[10px] uppercase tracking-widest font-headline">Yazarın Kişisel Deneyimi</span>
            </div>
            <p className="text-[#334155] text-lg leading-relaxed relative z-10 font-body">"{post.personalExperience}"</p>
          </div>
        )}

        {/* CSS Typography Hiyerarşisi Kusursuz Tasarım Breathtaking Styles */}
        <div 
          className="
            w-full max-w-full overflow-hidden
            [&>h2]:whitespace-normal [&>h2]:break-words [&>h2]:font-headline [&>h2]:text-3xl [&>h2]:md:text-4xl [&>h2]:text-primary [&>h2]:mt-20 [&>h2]:mb-8 [&>h2]:font-bold [&>h2]:tracking-tight [&>h2]:border-b [&>h2]:border-outline-variant/20 [&>h2]:pb-4
            [&>h3]:whitespace-normal [&>h3]:break-words [&>h3]:font-headline [&>h3]:text-2xl [&>h3]:text-secondary [&>h3]:mt-12 [&>h3]:mb-6 [&>h3]:font-bold [&>h3]:italic
            [&>p]:whitespace-normal [&>p]:text-[#334155] [&>p]:leading-[2.2] [&>p]:mb-8 [&>p]:font-body [&>p]:text-[1.125rem] [&>p]:tracking-wide [&>p]:break-words
            [&_a]:text-blue-600 [&_a]:font-bold [&_a]:underline [&_a]:underline-offset-[3px] [&_a]:decoration-blue-600/30 [&_a]:hover:decoration-blue-600 [&_a]:hover:text-blue-800 [&_a]:transition-all [&_a]:break-words [&_a]:bg-blue-50/50 [&_a]:px-1 [&_a]:rounded-md
            [&>ul]:list-none [&>ul]:pl-0 [&>ul]:mb-10 [&>ul>li]:relative [&>ul>li]:pl-8 [&>ul>li]:mb-4 [&>ul>li]:text-[#334155] [&>ul>li]:leading-[1.8] [&>ul>li]:break-words [&>ul>li]:whitespace-normal
            [&>ul>li::before]:content-[''] [&>ul>li::before]:absolute [&>ul>li::before]:left-0 [&>ul>li::before]:top-[0.6em] [&>ul>li::before]:w-3 [&>ul>li::before]:h-3 [&>ul>li::before]:bg-secondary/40 [&>ul>li::before]:rounded-full
            [&>blockquote]:whitespace-normal [&>blockquote]:break-words [&>blockquote]:border-l-4 [&>blockquote]:border-secondary [&>blockquote]:bg-secondary/5 [&>blockquote]:p-8 [&>blockquote]:rounded-r-3xl [&>blockquote]:italic [&>blockquote]:my-12 [&>blockquote]:text-xl [&>blockquote]:text-primary/90 [&>blockquote]:font-headline [&>blockquote]:shadow-sm
            [&>img]:w-full [&>img]:h-auto [&>img]:rounded-[2rem] [&>img]:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] [&>img]:my-16 [&>img]:object-cover [&>img]:border [&>img]:border-outline-variant/10 [&>img]:max-h-[600px]
          "
          dangerouslySetInnerHTML={{ __html: post.content }} 
        />
      </article>

      {/* E-E-A-T References Injection */}
      {post.references && (
        <div className="max-w-3xl mx-auto px-6 mt-16 pt-10 border-t border-outline-variant/20">
          <h3 className="font-headline text-2xl text-primary font-bold tracking-tight mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">menu_book</span> Kaynakça ve Referanslar
          </h3>
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 text-sm text-on-surface-variant leading-relaxed break-words whitespace-pre-wrap">
            {post.references}
          </div>
        </div>
      )}
      
      {/* 5. Otoriter İçerik Alanı Alt Bilgi (Author Box) */}
      <div className="max-w-3xl mx-auto px-6 mt-12 pt-10 border-t border-outline-variant/20">
        <div className="bg-surface-container-lowest p-8 rounded-3xl flex flex-col md:flex-row items-center md:items-start gap-8 border border-outline-variant/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary to-secondary" />
          
          <div className="w-24 h-24 shrink-0 rounded-full bg-primary-container text-primary flex items-center justify-center font-headline text-4xl font-bold shadow-md overflow-hidden border-2 border-white ring-4 ring-primary/5">
            {post.authorModel?.image ? (
              <img src={post.authorModel.image} alt={post.authorModel.name} className="w-full h-full object-cover" />
            ) : (
               (post.authorModel?.name || post.author).charAt(0).toUpperCase()
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h4 className="font-headline font-bold text-primary text-2xl mb-1">{post.authorModel?.name || post.author}</h4>
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <span className="text-secondary font-bold text-[10px] tracking-widest uppercase bg-secondary/10 px-3 py-1 rounded-full">
                {post.authorModel?.expertise || "Manevi Rehber"}
              </span>
              {(post.authorModel?.linkedin || post.authorModel?.twitter) && <span className="w-1 h-1 bg-outline rounded-full" />}
              <div className="flex gap-2">
                {post.authorModel?.linkedin && (
                  <a href={post.authorModel.linkedin} target="_blank" rel="noopener noreferrer" className="text-outline hover:text-[#0077b5] transition-colors" title="LinkedIn Profili">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                )}
                {post.authorModel?.twitter && (
                  <a href={post.authorModel.twitter} target="_blank" rel="noopener noreferrer" className="text-outline hover:text-secondary transition-colors" title="X (Twitter) Profili">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                )}
              </div>
            </div>
            
            <p className="text-sm text-[#475569] leading-relaxed max-w-2xl mx-auto md:mx-0">
              {post.authorModel?.bio || "Manevi rehberliği ve tecrübesiyle hac ve umre rotalarında bilinmeyenleri gün yüzüne çıkaran yazar ekibimiz."}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
