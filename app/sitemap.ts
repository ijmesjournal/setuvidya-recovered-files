import type { MetadataRoute } from 'next';
import { articles } from '@/lib/articles';
import { guides } from '@/lib/guides';
import { legal } from '@/lib/content';
import { absoluteUrl } from '@/lib/utils';
import { productionAllowed } from '@/lib/deployment-policy.mjs';

const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.8, changeFrequency: 'yearly' },
  { path: '/services', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/research-thesis', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/publication', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/book-publication', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/university-admission', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.7, changeFrequency: 'yearly' },
  { path: '/education-updates', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/research-guide', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/scopus-journal-list', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/sci-journal-list', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/abdc-journal-list', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/testimonials', priority: 0.6, changeFrequency: 'yearly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  if (!productionAllowed()) return [];
  const now = new Date();

  return [
    ...guides.map((g) => ({
      url: absoluteUrl(`/research-guide/${g.type}/${g.slug}`),
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.7,
    })),
    ...articles.filter((a) => !a.isDemo).map((a) => ({
      url: absoluteUrl(`/education-updates/${a.slug}`),
      lastModified: new Date(a.publishedAt),
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
    ...routes.map((r) => ({
      url: absoluteUrl(r.path),
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...legal.documents.map((d) => ({
      url: absoluteUrl(`/legal/${d.slug}`),
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    })),
  ];
}
