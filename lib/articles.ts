import raw from '@/content/site.json';

/* -------------------------------------------------------------------------
   Education & Academic Updates.

   Data-driven throughout: nothing about an article is written into a
   component. Add an entry to content/site.json -> educationUpdates.articles
   and it appears automatically, newest first, everywhere it belongs.

   `isDemo` marks layout placeholders. They are explanatory guidance, never
   reporting: no announcement, date, notification, statistic or ranking is
   stated as fact, and no source is claimed. Delete every demo entry before
   publishing real editorial content.
------------------------------------------------------------------------- */

export type Article = {
  slug: string;
  title: string;
  category: string;
  /** ISO date. Sorting is on this, descending. */
  publishedAt: string;
  readingMinutes: number;
  image: string;
  imageAlt: string;
  excerpt: string;
  /** Paragraphs separated by a blank line. */
  body: string;
  author: string;
  sourceName: string;
  sourceUrl: string;
  seoTitle: string;
  metaDescription: string;
  isDemo: boolean;
};

export const educationUpdates = raw.educationUpdates as {
  title: string;
  kicker: string;
  intro: string;
  searchPlaceholder: string;
  categories: string[];
  viewAllLabel: string;
  emptyLabel: string;
  emptyByCategory?: Record<string, string>;
  demoNotice: string;
  homeCount: number;
  perPage: number;
  articles: Article[];
};

/** Every article, newest first. The single ordering used site-wide. */
export const articles: Article[] = [...educationUpdates.articles].sort(
  (a, b) => b.publishedAt.localeCompare(a.publishedAt),
);

/** True while nothing real has been published yet. */
export const allArticlesAreDemo = articles.length > 0 && articles.every((a) => a.isDemo);

export function findArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

/**
 * Every configured category, in the configured order. Academic Jobs and
 * Internships stay visible even with no verified entries yet: hiding a filter
 * because its list is empty tells a reader the category does not exist, when
 * in fact nothing has been verified for it. The empty state says which.
 */
export function activeCategories(): string[] {
  return educationUpdates.categories;
}

/** Message shown when a filter matches nothing. Category-specific where the
 *  data supplies one, so an empty Jobs list reads correctly. */
export function emptyStateFor(category: string, query: string): string {
  if (query.trim()) return educationUpdates.emptyLabel;
  return educationUpdates.emptyByCategory?.[category] ?? educationUpdates.emptyLabel;
}

export function filterArticles(list: Article[], category: string, query: string): Article[] {
  const q = query.trim().toLowerCase();
  return list.filter((a) => {
    if (category !== 'All' && a.category !== category) return false;
    if (!q) return true;
    return (
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.body.toLowerCase().includes(q)
    );
  });
}

/** e.g. "28 May 2026". Fixed locale so server and client agree. */
export function formatArticleDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(d);
}

/** Accent per category, drawn from the shared palette. */
export function categoryAccent(category: string): 'royal' | 'teal' | 'purple' | 'saffron' {
  switch (category) {
    case 'Research':
    case 'Education Policy':
      return 'royal';
    case 'Admissions':
    case 'Higher Education':
      return 'teal';
    case 'Scholarships':
    case 'AI & EdTech':
      return 'purple';
    default:
      return 'saffron';
  }
}
