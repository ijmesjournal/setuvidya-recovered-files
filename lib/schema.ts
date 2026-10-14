import { brand, contact, serviceGroups, workingHours, type Faq } from './content';
import { absoluteUrl, siteUrl } from './utils';

const isPlaceholder = (v?: string) => !v || v.trim().startsWith('[');

/**
 * Organization + ProfessionalService.
 * Contact fields are omitted entirely while they are still placeholders,
 * because emitting "[ADD PHONE NUMBER]" as structured data is worse than
 * emitting nothing.
 */
export function organizationSchema() {
  // Only real, configured profile URLs go into sameAs.
  const sameAs = Object.values(contact.socialLinks).filter(
    (url): url is string => typeof url === 'string' && url.trim().startsWith('http'),
  );

  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'ProfessionalService'],
    '@id': `${siteUrl}/#organization`,
    name: brand.name,
    legalName: brand.legalName,
    url: siteUrl,
    slogan: brand.tagline,
    description:
      'Academic research and education consultancy providing thesis support, research methodology guidance, journal publication assistance, book publication support and university admission guidance.',
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/logo.svg'),
    },
    ...(isPlaceholder(contact.email) ? {} : { email: contact.email }),
    ...(isPlaceholder(contact.phone) ? {} : { telephone: contact.phone }),
    ...(sameAs.length ? { sameAs } : {}),
    areaServed: 'IN',
    // Machine-readable opening hours, taken from the same schedule the page
    // renders. Days the business is closed are simply omitted, which is how
    // openingHoursSpecification expresses a closure.
    openingHoursSpecification: workingHours.schedule
      .filter((row) => !row.closed && row.opens && row.closes)
      .map((row) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: row.dayOfWeek,
        opens: row.opens,
        closes: row.closes,
      })),
    knowsAbout: [
      'Academic research methodology',
      'Doctoral thesis development',
      'Scholarly publishing',
      'Academic editing',
      'Higher education admissions',
    ],
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: siteUrl,
    name: brand.name,
    publisher: { '@id': `${siteUrl}/#organization` },
  };
}

/** One Service node per practice area, offered by the organization. */
export function servicesSchema() {
  return serviceGroups.map((group) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: group.title,
    name: `${group.title} — ${brand.name}`,
    description: group.blurb,
    url: absoluteUrl(group.href),
    provider: { '@id': `${siteUrl}/#organization` },
    areaServed: 'IN',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: group.title,
      itemListElement: group.items.map((item) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: item },
      })),
    },
  }));
}

export function faqSchema(items: Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function breadcrumbSchema(trail: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  };
}
