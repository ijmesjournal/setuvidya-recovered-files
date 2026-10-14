import { Atom, Cpu, Library, LineChart } from 'lucide-react';
import { Container, Section, SectionHeading } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/Reveal';
import { researchDomains } from '@/lib/content';
import { cn } from '@/lib/utils';
import { SubjectList } from '@/components/sections/SubjectList';

/* -------------------------------------------------------------------------
   Condensed homepage teaser.

   Titles and subject counts come from the same data that drives the full
   sections on /research-thesis, so nothing is duplicated or invented. The
   detailed domain cards and the seven-part accordion stay on that page.
------------------------------------------------------------------------- */

const ACCENTS = [
  { icon: LineChart, tile: 'border-royal/25 bg-royal/[0.07] text-royal', bar: 'bg-royal' },
  { icon: Library, tile: 'border-teal/25 bg-teal/[0.07] text-teal', bar: 'bg-teal' },
  { icon: Atom, tile: 'border-purple/25 bg-purple/[0.07] text-purple', bar: 'bg-purple' },
  { icon: Cpu, tile: 'border-saffron/30 bg-saffron/[0.09] text-saffron-text', bar: 'bg-saffron' },
] as const;

export function ResearchTeaser() {
  return (
    <Section bordered id="research-areas">
      <Container>
        <SectionHeading
          kicker="Research areas we support"
          title="Multidisciplinary research support"
          intro={researchDomains.subtitle}
        />

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {researchDomains.categories.map((domain, i) => {
            const accent = ACCENTS[i % ACCENTS.length];
            const Icon = accent.icon;
            return (
              <Reveal as="li" key={domain.id} delay={i * 70} className="h-full">
                <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-rule bg-paper p-6 transition-[border-color,box-shadow,transform] duration-300 ease-sv hover:-translate-y-0.5 hover:border-navy/25 hover:shadow-lift">
                  <span aria-hidden="true" className={cn('absolute inset-x-0 top-0 h-1', accent.bar)} />
                  <span className={cn('grid h-11 w-11 place-items-center rounded-lg border', accent.tile)}>
                    <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-serif text-[1.04rem] font-semibold leading-snug text-ink">
                    {domain.title}
                  </h3>
                  <p className="mt-2 text-[0.87rem] text-muted">
                    {domain.subjects.length} subject areas
                  </p>
                  <SubjectList id={domain.id} subjects={domain.subjects} />
                </article>
              </Reveal>
            );
          })}
        </ul>

      </Container>
    </Section>
  );
}
