import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container, Section } from '@/components/ui/primitives';
import { PageHero } from '@/components/sections/PageHero';
import { guideHref, pathways, pathwayGuides, pathwayAccent, type GuideType } from '@/lib/guides';
import { breadcrumbSchema } from '@/lib/schema';
import { cn } from '@/lib/utils';

const TITLE = 'Research guide';
const LEDE =
  'Understand the research process, from choosing a topic to final submission. ' +
  'Twenty stages across two pathways, each explained in its own guide.';

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: LEDE,
  path: '/research-guide',
});

function Pathway({ type }: { type: GuideType }) {
  const meta = pathways[type];
  const steps = pathwayGuides(type);
  const accent = pathwayAccent(type);
  const num =
    accent === 'royal'
      ? 'border-royal/25 bg-royal/[0.07] text-royal'
      : 'border-teal/25 bg-teal/[0.07] text-teal';

  return (
    <section aria-labelledby={`pathway-${type}`}>
      <h2 id={`pathway-${type}`} className="text-display-sm">{meta.title}</h2>
      <p className="mt-2 max-w-prose">{meta.intro}</p>

      <ol className="mt-7 grid gap-4 sm:grid-cols-2">
        {steps.map((step) => (
          <li key={step.slug}>
            <Link
              href={guideHref(step)}
              className="group flex h-full gap-4 rounded-lg border border-rule bg-paper p-5 transition-[border-color,box-shadow,transform] duration-300 ease-sv hover:-translate-y-0.5 hover:border-navy/25 hover:shadow-lift"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'grid h-9 w-9 shrink-0 place-items-center rounded border text-[0.8rem] font-semibold tabular-nums',
                  num,
                )}
              >
                {String(step.order).padStart(2, '0')}
              </span>
              <span className="min-w-0">
                <span className="block font-serif text-[1.02rem] font-semibold leading-snug text-ink">
                  {step.shortTitle}
                </span>
                <span className="mt-1.5 block text-[0.89rem] text-body">{step.description}</span>
                <span className="mt-2.5 inline-flex items-center gap-1.5 text-[0.86rem] font-medium text-indigo">
                  Read guide
                  <ArrowRight
                    size={14}
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

const trail = [
  { name: 'Home', href: '/' },
  { name: TITLE, href: '/research-guide' },
];

export default function ResearchGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(trail)),
        }}
      />
      <PageHero
  kicker="Research knowledge hub"
  title={TITLE}
  lede={LEDE}
  motif="document"
  breadcrumb={trail}
/>
      <Section>
        <Container className="space-y-16">
          <Pathway type="thesis" />
          <Pathway type="paper" />
        </Container>
      </Section>
    </>
  );
}
