import type { Metadata } from 'next';
import { brand } from './content';
import { absoluteUrl } from './utils';
import { productionAllowed } from './deployment-policy.mjs';

/** Preview builds and demo content must not be indexed. */
export function robotsMetadata(noindex = false): Metadata['robots'] {
  const index = !noindex && productionAllowed();
  return {
    index,
    follow: true,
    googleBot: { index, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  };
}

/** Next replaces nested metadata objects, so each page includes shared fields. */
export function pageMetadata({
  title,
  description,
  path,
  article,
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  article?: { publishedTime?: string };
  noindex?: boolean;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      type: article ? 'article' : 'website',
      ...(article || {}),
      siteName: brand.name,
      locale: 'en_IN',
      images: [{ url: '/og-default.png', width: 1200, height: 630, alt: brand.tagline }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-default.png'],
    },
    robots: robotsMetadata(noindex),
  };
}
