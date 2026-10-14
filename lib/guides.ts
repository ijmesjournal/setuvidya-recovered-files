import raw from '@/content/research-guides.json';

/* -------------------------------------------------------------------------
   Research Knowledge Hub.

   One source of truth: content/research-guides.json. Twenty guides share an
   identical shape, so a single page component renders all of them and previous
   / next / related are derived from `order` rather than written per page.

   The content is explanatory only. It teaches legitimate practice and nowhere
   offers instructions for plagiarism, fabricated data, invented citations,
   result manipulation, authorship trading or detection evasion. No journal is
   described as indexed anywhere, and no outcome is promised.
------------------------------------------------------------------------- */

export type GuideType = 'thesis' | 'paper';

export type Guide = {
  type: GuideType;
  slug: string;
  order: number;
  title: string;
  shortTitle: string;
  description: string;
  intro: string;
  whatIsIt: string;
  whyItMatters: string;
  howTo: { step: string; text: string }[];
  diagram: { title: string; nodes: string[] };
  examples: { strong: string; weak: string };
  mistakes: string[];
  checklist: string[];
  takeaway: string;
  seoTitle: string;
  metaDescription: string;
};

export const pathways = raw.pathways as Record<
  GuideType,
  { label: string; title: string; intro: string }
>;

export const guides = raw.guides as Guide[];

/** One pathway, in step order. */
export function pathwayGuides(type: GuideType): Guide[] {
  return guides.filter((g) => g.type === type).sort((a, b) => a.order - b.order);
}

export function findGuide(type: string, slug: string): Guide | undefined {
  return guides.find((g) => g.type === type && g.slug === slug);
}

export function guideHref(guide: Pick<Guide, 'type' | 'slug'>): string {
  return `/research-guide/${guide.type}/${guide.slug}`;
}

/** Previous and next within the same pathway, derived from order. */
export function neighbours(guide: Guide): { previous?: Guide; next?: Guide; total: number } {
  const list = pathwayGuides(guide.type);
  const i = list.findIndex((g) => g.slug === guide.slug);
  return { previous: list[i - 1], next: list[i + 1], total: list.length };
}

/**
 * Related guides: the matching step in the other pathway where one exists,
 * then neighbours, to a maximum of three. Derived, never hand-listed.
 */
export function relatedGuides(guide: Guide): Guide[] {
  const other: GuideType = guide.type === 'thesis' ? 'paper' : 'thesis';
  const sameSlug = guides.find((g) => g.type === other && g.slug === guide.slug);
  const { previous, next } = neighbours(guide);
  const out: Guide[] = [];
  for (const candidate of [sameSlug, next, previous]) {
    if (candidate && !out.some((g) => g.type === candidate.type && g.slug === candidate.slug)) {
      out.push(candidate);
    }
  }
  return out.slice(0, 3);
}

/** Accent per pathway, from the shared palette. */
export function pathwayAccent(type: GuideType): 'royal' | 'teal' {
  return type === 'thesis' ? 'royal' : 'teal';
}
