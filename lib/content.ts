import raw from '@/content/site.json';

/* -------------------------------------------------------------------------
   All editable copy lives in /content/site.json.
   Edit that file to change the site; no component changes are required.
------------------------------------------------------------------------- */

export type Cta = { label: string; href: string };

export type NavChild = {
  /** Points at journalUrl rather than an internal route. */
  external?: boolean;
  label: string;
  href: string;
  blurb: string;
  icon: 'research' | 'publication' | 'book' | 'admission';
};

export type NavItem = {
  label: string;
  href: string;
  /** Points at journalUrl rather than an internal route. */
  external?: boolean;
  children?: NavChild[];
  /** Label on the per-card link inside the mega-menu. */
  exploreLabel?: string;
  /** Full-width link across the foot of the mega-menu. */
  footerLink?: { label: string; href: string };
};

export type Stage = { stage: string; note: string };

export type ServiceGroup = {
  id: string;
  title: string;
  href: string;
  blurb: string;
  items: string[];
};

export type DetailService = {
  id: string;
  title: string;
  summary: string;
  includes: string[];
  who: string;
  deliverables: string[];
};

export type Faq = { q: string; a: string };

export type Institution = {
  /** Stable key, also the logo filename stem. */
  slug: string;
  /** Institution name, shown under the logo and used in the alt text. */
  name: string;
  /** Path under /public, e.g. /institutions/<slug>.webp */
  logo: string;
  /** Official website, opened in a new tab. */
  url: string;
  /** Alt-text override. */
  alt?: string;
};

export type ThesisChapter = {
  id: string;
  title: string;
  body: string[];
  label?: string;
  pointsLabel?: string;
  points?: string[];
  toolsLabel?: string;
  tools?: string[];
  note?: string;
  /** Illustrative APA formatting templates, not real publications. */
  examples?: { label: string; text: string }[];
};

export type ResearchDomain = {
  id: string;
  icon: 'management' | 'humanities' | 'science' | 'technical';
  title: string;
  intro: string;
  subjects: string[];
  toolsLabel?: string;
  tools?: string[];
  scopeNote?: string;
};

export type Testimonial = {
  /** Publish only after the student confirms their wording. */
  approved: boolean;
  name: string;
  location: string;
  review: string;
  /** Star rating, shown only where the student approved one. */
  rating?: number;
};

export type PublishedBook = {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  coAuthor: string;
  year: string;
  publisher: string;
  isbn: string;
  frontImage: string;
  backImage: string;
  frontAlt: string;
  backAlt: string;
  /* Commercial fields. `null` means "not configured yet" and must stay
     representable: a missing price is never the same as a price of zero. */
  /** Printed cover price, in the smallest whole currency unit. */
  mrp: number | null;
  /** Percentage off the MRP. Null when no discount is configured. */
  discountPercent: number | null;
  /**
   * Explicit selling-price override. Normally null: the price is derived from
   * mrp + discountPercent by unitPrice() in lib/commerce.ts, so there is one
   * place to change and nothing to keep in sync.
   */
  price: number | null;
  currency: string;
  available: boolean;
  description: string;
};

export const site = raw;

export const brand = raw.brand;
export const contact = raw.contact;

export type OpeningRow = {
  /** Human wording, e.g. "Monday – Saturday". */
  days: string;
  /** Human wording, e.g. "10:00 AM – 5:00 PM" or "Closed". */
  time: string;
  /** Machine-readable, for schema.org openingHoursSpecification. */
  dayOfWeek: string[];
  opens: string;
  closes: string;
  closed: boolean;
};

/** Written once in content/site.json; read by the contact page, footer and JSON-LD. */
export const workingHours = raw.contact.hours as {
  label: string;
  schedule: OpeningRow[];
};
export const nav = raw.nav as NavItem[];

/**
 * The future journal address. Until a real URL is set, the nav item renders as
 * plain text: a link that goes nowhere is worse than one that is clearly not
 * ready yet.
 */
export const journalUrl = raw.journalUrl;
export const journalConfigured = /^https?:\/\//.test(journalUrl.trim());
export const journey = raw.journey as Stage[];
export const home = raw.home as Omit<typeof raw.home, 'hero'> & {
  previews: {
    kicker: string; title: string; body: string; ctaLabel: string; href: string;
  }[];
  resources: {
    kicker: string;
    title: string;
    cards: {
      title: string; subtitle: string; body: string;
      ctaLabel: string; href: string; external: boolean;
    }[];
  };
  whyChoose: {
    kicker: string;
    title: string;
    reasonsTitle: string;
    reviewsTitle: string;
    reasons: { title: string; body: string }[];
  };
  hero: Omit<typeof raw.home.hero, 'trustRow'> & {
    eyebrow: string;
    headlineLead: string;
    headlineAccent: string;
    trustRow: {
      icon: 'guidance' | 'resources' | 'opportunities' | 'possibilities';
      label: string;
    }[];
    /** Photograph slot. Empty src falls back to the bridge diagram. */
    image: { src: string; alt: string; credit: string };
  };
};
export const disciplines = raw.disciplines;
export const serviceGroups = raw.serviceGroups as ServiceGroup[];
export const pages = raw.pages as typeof raw.pages & {
  bookPublication: typeof raw.pages.bookPublication & {
    /** Optional photograph. Empty src keeps the vector book mockup. */
    image: { src: string; alt: string };
  };
};
export const faqs = raw.faqs as Record<string, Faq[]>;
export const formOptions = raw.form;
export const legal = raw.legal;
export const institutions = raw.institutions as {
  kicker: string;
  title: string;
  subtitle: string;
  homeSubtitle: string;
  speedSeconds: number;
  items: Institution[];
};
export const thesisAnatomy = raw.pages.researchThesis.anatomy as {
  kicker: string;
  title: string;
  subtitle: string;
  chapters: ThesisChapter[];
  cta: { title: string; body: string; label: string; href: string };
};
export const researchDomains = raw.pages.researchThesis.domains as {
  kicker: string;
  title: string;
  subtitle: string;
  expandLabel: string;
  collapseLabel: string;
  subjectsLabel: string;
  note: string;
  categories: ResearchDomain[];
  cta: { title: string; body: string; label: string; href: string };
};
export const bookPortfolio = raw.pages.bookPublication.portfolio as {
  kicker: string;
  title: string;
  intro: string;
  viewLabel: string;
  displayMrp: boolean;
  discountLabelSuffix: string;
  emptySlotNote: string;
  books: PublishedBook[];
};
export const testimonials = raw.testimonials as {
  title: string;
  intro: string;
  items: Testimonial[];
};
export const seo = raw.seo;

/* -------------------------------------------------------------------------
   Contact links.

   Built from content/site.json in one place so no component re-types a number
   or hand-rolls a tel:/mailto:/wa.me URL. Each returns null while its value is
   still a bracketed placeholder, which is what lets the UI render it as
   unlinked grey text instead of a dead link.
------------------------------------------------------------------------- */

/** A value is a placeholder while it is still wrapped in square brackets. */
export function isContactPlaceholder(value: string | undefined): boolean {
  return !value || value.trim().startsWith('[');
}

/** Digits only, e.g. "+91 98765 43210" -> "919876543210". */
export function contactDigits(value: string | undefined): string | null {
  if (isContactPlaceholder(value)) return null;
  const digits = (value ?? '').replace(/\D/g, '');
  return digits.length >= 10 ? digits : null;
}

export const contactLinks = {
  get mailto(): string | null {
    return isContactPlaceholder(contact.email) ? null : `mailto:${contact.email}`;
  },
  /** tel: URIs must not contain spaces. */
  get tel(): string | null {
    const digits = contactDigits(contact.phone);
    return digits ? `tel:+${digits}` : null;
  },
  get whatsapp(): string | null {
    const digits = contactDigits(contact.whatsapp);
    return digits ? `https://wa.me/${digits}` : null;
  },
};

/**
 * Resolves {{email}} / {{phone}} / {{whatsapp}} / {{address}} inside legal
 * copy against the central contact config, so the policies stay accurate
 * without duplicating a contact value into the legal text.
 *
 * A token whose value is still a placeholder resolves to the neutral phrase
 * below rather than printing "[ADD ...]" into a published policy.
 */
export function resolveContactTokens(text: string): string {
  const values: Record<string, string> = {
    email: contact.email,
    phone: contact.phone,
    whatsapp: contact.whatsapp,
    address: contact.addressLines.join(', '),
  };
  return text.replace(/\{\{(email|phone|whatsapp|address)\}\}/g, (_match, key: string) => {
    const value = values[key];
    return isContactPlaceholder(value) ? 'the details on our contact page' : value;
  });
}

export const indexing = raw.indexing as {
  title: string;
  items: {
    name: string;
    file: string;
    width: number;
    height: number;
    note: string;
    external?: boolean;
    label?: string;
    maxHeight?: number;
  }[];
};

export const faqPage = raw.faqPage as { kicker: string; title: string; intro: string };

export const testimonialsPage = raw.testimonialsPage as {
  kicker: string; title: string; intro: string;
};

/** Flattened FAQ list, used for the FAQPage structured data. */
export const allFaqs: Faq[] = Object.values(faqs).flat();

/** A short, general selection for the home page. */
export const homeFaqs: Faq[] = [
  faqs['Thesis consultancy'][0],
  faqs['Research publication'][0],
  faqs['University admission'][0],
  faqs['Book publication'][0],
  faqs['Thesis consultancy'][4],
];
