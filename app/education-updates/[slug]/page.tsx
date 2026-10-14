import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container, Section } from '@/components/ui/primitives';
import { ArticleMeta, CategoryTag } from '@/components/updates/UpdatesBrowser';
import { articles, educationUpdates, findArticle } from '@/lib/articles';
import { breadcrumbSchema } from '@/lib/schema';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const resolvedParams = await params;
  const article = findArticle(resolvedParams.slug);
  if (!article) return {};
  return pageMetadata({
    title: article.seoTitle || article.title,
    description: article.metaDescription || article.excerpt,
    path: `/education-updates/${article.slug}`,
    article: { publishedTime: article.publishedAt },
    noindex: article.isDemo,
  });
}

export default async function ArticlePage({ params }: Params) {
  const resolvedParams = await params;
  const article = findArticle(resolvedParams.slug);
  if (!article) notFound();

  const paragraphs = article.body.split(/\n{2,}/).filter(Boolean);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: educationUpdates.title, href: '/education-updates' },
              { name: article.title, href: `/education-updates/${article.slug}` },
            ]),
          ),
        }}
      />

      <Section>
        <Container className="max-w-3xl">
          <p className="mb-8 text-[0.88rem]">
            <Link href="/education-updates" className="text-indigo hover:underline">
              {educationUpdates.title}
            </Link>
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <CategoryTag category={article.category} />
            <ArticleMeta article={article} />
          </div>

          <h1 className="mt-5 text-display">{article.title}</h1>
          <p className="mt-5 text-lede text-body">{article.excerpt}</p>

          {article.isDemo ? (
            <p className="mt-8 rounded border-l-2 border-saffron bg-surface p-4 text-[0.9rem] text-body">
              {educationUpdates.demoNotice}
            </p>
          ) : null}

          <div className="mt-10 space-y-5">
            {paragraphs.map((p) => (
              <p key={p.slice(0, 32)} className="text-[1.02rem] leading-relaxed">
                {p}
              </p>
            ))}
          </div>

          <footer className="mt-12 border-t border-rule pt-6 text-[0.9rem] text-muted">
            {article.author ? <p>Written by {article.author}.</p> : null}
            {/* A source line appears only when one has actually been recorded. */}
            {article.sourceName && article.sourceUrl ? (
              <p className="mt-2">
                Source:{' '}
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo hover:underline"
                >
                  {article.sourceName}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </p>
            ) : null}
          </footer>
        </Container>
      </Section>
    </>
  );
}
