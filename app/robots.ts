import type { MetadataRoute } from 'next';
import { absoluteUrl, siteUrl } from '@/lib/utils';
import { productionAllowed } from '@/lib/deployment-policy.mjs';

export default function robots(): MetadataRoute.Robots {
  if (!productionAllowed()) {
    // Let crawlers observe noindex; robots disallow alone is not deindexing.
    // Private access must be enforced separately by the hosting platform.
    return { rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }] };
  }
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: siteUrl,
  };
}
