'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import {
  activeCategories,
  emptyStateFor,
  categoryAccent,
  educationUpdates,
  filterArticles,
  formatArticleDate,
  type Article,
} from '@/lib/articles';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------
   Search, category chips and the card grid.

   Used by the home section and the archive. Nothing about any article is
   hard-coded: the list is passed in already sorted newest first.
------------------------------------------------------------------------- */

const accentClass = {
  royal: 'border-royal/25 bg-royal/[0.06] text-royal',
  teal: 'border-teal/25 bg-teal/[0.06] text-teal',
  purple: 'border-purple/25 bg-purple/[0.06] text-purple',
  saffron: 'border-saffron/30 bg-saffron/[0.08] text-saffron-text',
} as const;

export function CategoryTag({ category }: { category: string }) {
  return (
    <span
      className={cn(
        'inline-block rounded border px-2 py-0.5 text-[0.72rem] font-semibold uppercase tracking-[0.1em]',
        accentClass[categoryAccent(category)],
      )}
    >
      {category}
    </span>
  );
}

export function ArticleMeta({ article }: { article: Article }) {
  return (
    <p className="text-[0.82rem] text-muted">
      <time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt)}</time>
      {article.readingMinutes ? <> · {article.readingMinutes} min read</> : null}
    </p>
  );
}

export function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  return (
    <article
      className={cn(
        'group flex h-full flex-col rounded-lg border border-rule bg-paper p-6 transition-[border-color,box-shadow,transform] duration-300 ease-sv hover:-translate-y-0.5 hover:border-navy/25 hover:shadow-lift',
        featured && 'sm:p-8',
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <CategoryTag category={article.category} />
        <ArticleMeta article={article} />
      </div>

      <h3
        className={cn(
          'mt-4 font-serif font-semibold leading-snug text-ink',
          featured ? 'text-[1.5rem] sm:text-[1.8rem]' : 'text-[1.08rem]',
        )}
      >
        <Link
          href={`/education-updates/${article.slug}`}
          className="transition-colors duration-200 after:absolute after:inset-0 group-hover:text-indigo"
        >
          {article.title}
        </Link>
      </h3>

      <p className={cn('mt-3 flex-1 text-body', featured ? 'text-[1rem]' : 'text-[0.93rem]')}>
        {article.excerpt}
      </p>

      <p className="mt-5 text-[0.88rem] font-medium text-indigo">
        Read more <span aria-hidden="true">&rarr;</span>
      </p>
    </article>
  );
}

export function UpdatesBrowser({
  list,
  showFeatured = true,
  pageSize,
}: {
  list: Article[];
  showFeatured?: boolean;
  pageSize?: number;
}) {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [shown, setShown] = useState(pageSize ?? list.length);

  const results = useMemo(() => filterArticles(list, category, query), [list, category, query]);
  const featured = showFeatured && category === 'All' && !query ? results[0] : undefined;
  const rest = featured ? results.slice(1) : results;
  const visible = pageSize ? rest.slice(0, shown) : rest;

  const reset = (next: () => void) => {
    next();
    if (pageSize) setShown(pageSize);
  };

  return (
    <>
      <div className="mt-10 flex flex-col gap-5">
        <label className="relative block">
          <span className="sr-only">{educationUpdates.searchPlaceholder}</span>
          <Search
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => reset(() => setQuery(e.target.value))}
            placeholder={educationUpdates.searchPlaceholder}
            className="w-full rounded-lg border border-rule bg-paper py-3.5 pl-12 pr-4 text-[0.95rem] text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted hover:border-navy/35 focus:border-indigo focus:ring-2 focus:ring-indigo/15"
          />
        </label>

        <div
          role="group"
          aria-label="Filter updates by category"
          className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1"
        >
          {activeCategories().map((c) => {
            const active = c === category;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={active}
                onClick={() => reset(() => setCategory(c))}
                className={cn(
                  'shrink-0 snap-start rounded-full border px-4 py-2 text-[0.85rem] font-medium transition-colors duration-200',
                  active
                    ? 'border-ink bg-ink text-white'
                    : 'border-rule bg-paper text-body hover:border-navy/35 hover:text-ink',
                )}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {results.length} update{results.length === 1 ? '' : 's'} shown.
      </p>

      {results.length === 0 ? (
        <p className="mt-10 rounded-lg border border-rule bg-surface p-8 text-center text-body">
          {emptyStateFor(category, query)}
        </p>
      ) : (
        <>
          {featured ? (
            <div className="relative mt-8">
              <ArticleCard article={featured} featured />
            </div>
          ) : null}

          {visible.length ? (
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((a) => (
                <li key={a.slug} className="relative">
                  <ArticleCard article={a} />
                </li>
              ))}
            </ul>
          ) : null}

          {pageSize && rest.length > visible.length ? (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => setShown((n) => n + pageSize)}
                className="rounded border border-navy/25 px-6 py-3 text-[0.92rem] font-medium text-navy transition-colors duration-200 hover:border-navy/60 hover:bg-navy/[0.04]"
              >
                Load more updates
              </button>
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
