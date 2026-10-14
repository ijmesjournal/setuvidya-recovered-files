import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container, Section, SectionHeading } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/Reveal';
import { guideHref, pathwayAccent, pathways, pathwayGuides, type GuideType } from '@/lib/guides';
import { cn } from '@/lib/utils';

/* Homepage teaser for the Research Knowledge Hub. Every step is a real link to
   its own guide page; nothing here is decorative text. */
function Pathway({ type }: { type: GuideType }) {
  const meta = pathways[type];
  const steps = pathwayGuides(type);
  const accent = pathwayAccent(type);
  const bar = accent === 'royal' ? 'bg-royal' : 'bg-teal';
  const num =
    accent === 'royal'
      ? 'border-royal/25 bg-royal/[0.07] text-royal'
      : 'border-teal/25 bg-teal/[0.07] text-teal';

  return (
    <div className="relative overflow-hidden rounded-lg border border-rule bg-paper p-6 sm:p-8">
      <span aria-hidden="true" className={cn('absolute inset-x-0 top-0 h-1', bar)} />
      <h3 className="font-serif text-[1.3rem] font-semibold text-ink">{meta.title}</h3>
      <p className="mt-2 text-[0.94rem]">{meta.intro}</p>

      <ol className="mt-6 space-y-2">
        {steps.map((step) => (
          <li key={step.slug}>
            <Link
              href={guideHref(step)}
              className="group flex items-center gap-3.5 rounded border border-transparent px-3 py-2.5 transition-colors duration-200 hover:border-rule hover:bg-surface"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'grid h-8 w-8 shrink-0 place-items-center rounded border text-[0.78rem] font-semibold tabular-nums',
                  num,
                )}
              >
                {String(step.order).padStart(2, '0')}
              </span>
              <span className="flex-1 text-[0.93rem] font-medium text-ink">{step.shortTitle}</span>
              <ArrowRight
                size={15}
                aria-hidden="true"
                className="shrink-0 text-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-indigo"
              />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ThesisPathways() {
  return (
    <Section tone="surface" bordered id="research-guide-teaser">
      <Container>
        <SectionHeading
          kicker="Research knowledge hub"
          title="How to make your thesis &amp; research paper"
          intro="Understand the research process, from choosing a topic to final submission."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Reveal><Pathway type="thesis" /></Reveal>
          <Reveal delay={90}><Pathway type="paper" /></Reveal>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/research-guide"
            className="inline-flex items-center gap-2 text-[0.95rem] font-medium text-indigo transition-colors duration-200 hover:text-indigo-lift"
          >
            Open the research guide
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </Section>
  );
}
