import Link from 'next/link';
import {
  ArrowRight,
  BookOpenText,
  FileSearch,
  GraduationCap,
  Landmark,
  Microscope,
  PenLine,
  ScrollText,
  ShieldCheck,
  Sigma,
} from 'lucide-react';
import {
  ButtonLink,
  Container,
  Panel,
  Section,
  SectionHeading,
} from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/Reveal';
import { cn } from '@/lib/utils';
import { StageTrack } from '@/components/ui/StageTrack';
import { Accordion } from '@/components/ui/Accordion';
import {
  CitationNetworkMotif,
  DocumentOutlineMotif,
  GridMotif,
} from '@/components/motifs/Motifs';
import {
  disciplines,
  home,
  homeFaqs,
  journey,
  serviceGroups,
} from '@/lib/content';

/* ------------------------------------------------------------ Trust strip */

const pillarIcons = [Microscope, ScrollText, Sigma, BookOpenText, GraduationCap];

export function TrustSection() {
  return (
    <Section tone="surface" bordered id="capabilities">
      <Container>
        <SectionHeading
          kicker="What we support"
          title={home.trust.title}
          intro={home.trust.intro}
        />

        <ul className="mt-12 grid gap-px overflow-hidden rounded border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3">
          {home.trust.pillars.map((p, i) => {
            const Icon = pillarIcons[i % pillarIcons.length];
            return (
              <Reveal as="li" key={p.title} delay={i * 60} className="bg-paper p-7">
                <Icon size={22} className="text-navy" aria-hidden="true" strokeWidth={1.6} />
                <h3 className="mt-5 font-sans text-[1.02rem] font-semibold text-ink">{p.title}</h3>
                <p className="mt-2.5 text-[0.93rem]">{p.body}</p>
              </Reveal>
            );
          })}

          <Reveal as="li" delay={300} className="flex flex-col justify-between bg-navy p-7 text-white/75">
            <p className="font-serif text-[1.12rem] italic leading-relaxed text-white">
              No claimed statistics, no invented success rates. Judge us on the scope we agree and
              the work we return.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-flex items-center gap-2 text-[0.93rem] font-medium text-white transition-colors hover:text-brass"
            >
              How we work
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </Reveal>
        </ul>
      </Container>
    </Section>
  );
}

/* --------------------------------------------------------- The journey arc */

export function JourneySection() {
  return (
    <Section tone="ink" id="journey">
      <GridMotif opacity={0.07} light />
      <Container>
        <SectionHeading
          kicker="The pathway"
          title="Your academic journey, and where the bridge carries you"
          intro="Most scholars do not need every service. They need the right one at the right point in a sequence that nobody explained to them."
          invert
        />
        <StageTrack stages={journey} columns={4} invert className="mt-14" />
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------------ About teaser */

export function AboutPreview() {
  return (
    <Section bordered>
      <DocumentOutlineMotif opacity={0.04} />
      <Container className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <div>
          <SectionHeading kicker="About SetuVidya" title={home.aboutPreview.title} />
          <ButtonLink href={home.aboutPreview.cta.href} variant="secondary" className="mt-8">
            {home.aboutPreview.cta.label}
          </ButtonLink>
        </div>
        <div className="space-y-5 lg:pt-4">
          {home.aboutPreview.body.map((p) => (
            <p key={p.slice(0, 24)} className="max-w-prose">
              {p}
            </p>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* --------------------------------------------------------------- Services  */

const groupIcons: Record<string, typeof FileSearch> = {
  thesis: FileSearch,
  publication: ScrollText,
  book: BookOpenText,
  admission: Landmark,
};

/** One accent per practice area, drawn from the shared palette. */
const SERVICE_ACCENTS = [
  { rule: 'before:bg-royal', tile: 'border-royal/25 bg-royal/[0.07] text-royal', numeral: 'text-royal/60' },
  { rule: 'before:bg-teal', tile: 'border-teal/25 bg-teal/[0.07] text-teal', numeral: 'text-teal/70' },
  { rule: 'before:bg-saffron', tile: 'border-saffron/30 bg-saffron/[0.09] text-saffron-text', numeral: 'text-saffron-text/95' },
  { rule: 'before:bg-purple', tile: 'border-purple/25 bg-purple/[0.07] text-purple', numeral: 'text-purple/65' },
] as const;

export function ServicesEcosystem() {
  return (
    <Section tone="surface" bordered id="services">
      <Container>
        <SectionHeading
          kicker="Core services"
          title="Four practice areas, one continuous pathway"
          intro="Each area works on its own. Together they cover the route from a first research question to published, defensible work."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {serviceGroups.map((group, i) => {
            const Icon = groupIcons[group.id] ?? FileSearch;
            const accent = SERVICE_ACCENTS[i % SERVICE_ACCENTS.length];
            return (
              <Reveal key={group.id} delay={i * 80}>
                <Panel
                  interactive
                  className={cn(
                    'flex h-full flex-col overflow-hidden p-7 sm:p-8',
                    // a colour rule along the top gives each practice area its
                    // own identity without tinting the whole card
                    'before:absolute before:inset-x-0 before:top-0 before:h-1 before:content-[""]',
                    accent.rule,
                  )}
                >
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <span
                        className={cn(
                          'grid h-12 w-12 place-items-center rounded-lg border',
                          accent.tile,
                        )}
                      >
                        <Icon size={22} aria-hidden="true" strokeWidth={1.6} />
                      </span>
                      <h3 className="mt-5 text-display-sm">
                        <Link href={group.href} className="after:absolute after:inset-0">
                          {group.title}
                        </Link>
                      </h3>
                    </div>
                    <span
                      aria-hidden="true"
                      className={cn('mt-1 font-serif text-[2.6rem] leading-none', accent.numeral)}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <p className="mt-3 max-w-prose">{group.blurb}</p>

                  <ul className="mt-6 flex flex-wrap gap-x-2 gap-y-2">
                    {group.items.slice(0, 7).map((item) => (
                      <li
                        key={item}
                        className="rounded border border-rule bg-surface/70 px-2.5 py-1 text-[0.83rem] text-body"
                      >
                        {item}
                      </li>
                    ))}
                    {group.items.length > 7 ? (
                      <li className="px-2.5 py-1 text-[0.83rem] text-muted">
                        +{group.items.length - 7} more
                      </li>
                    ) : null}
                  </ul>

                  <span className="mt-7 inline-flex items-center gap-2 text-[0.93rem] font-medium text-indigo">
                    Explore {group.title.toLowerCase()}
                    <ArrowRight
                      size={15}
                      aria-hidden="true"
                      className="transition-transform duration-300 ease-sv group-hover:translate-x-1"
                    />
                  </span>
                </Panel>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------------- Why section */

const whyIcons = [
  Microscope,
  FileSearch,
  ScrollText,
  Sigma,
  ShieldCheck,
  PenLine,
  BookOpenText,
  GraduationCap,
];

export function WhySection() {
  return (
    <Section bordered id="why">
      <Container>
        <SectionHeading kicker="Why SetuVidya" title={home.why.title} />

        <ul className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
          {home.why.items.map((item, i) => {
            const Icon = whyIcons[i % whyIcons.length];
            return (
              <Reveal as="li" key={item.title} delay={i * 50}>
                <Icon size={20} className="text-brass" aria-hidden="true" strokeWidth={1.7} />
                <h3 className="mt-4 font-sans text-[1rem] font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-[0.92rem]">{item.body}</p>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}

/* --------------------------------------------------------------- Process   */

export function StepsSection() {
  return (
    <Section tone="surface" bordered id="how-it-works">
      <CitationNetworkMotif opacity={0.045} />
      <Container>
        <SectionHeading kicker="How it works" title={home.steps.title} intro={home.steps.intro} />

        <ol className="mt-14 grid gap-px overflow-hidden rounded border border-rule bg-rule md:grid-cols-3 lg:grid-cols-5">
          {home.steps.items.map((step, i) => (
            <Reveal as="li" key={step.n} delay={i * 70} className="bg-paper p-7">
              <span
                aria-hidden="true"
                className="block font-serif text-[2.6rem] font-semibold leading-none text-brass"
              >
                {step.n}
              </span>
              <h3 className="mt-4 font-sans text-[1rem] font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-[0.92rem]">{step.body}</p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------------ Disciplines  */

export function DisciplinesSection() {
  return (
    <Section bordered id="disciplines">
      <Container>
        <SectionHeading
          kicker="Research domains"
          title={disciplines.title}
          intro={disciplines.intro}
        />

        <ul className="mt-12 grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
          {disciplines.items.map((d, i) => (
            <Reveal as="li" key={d.name} delay={i * 40} className="border-t border-rule pt-4">
              <h3 className="font-sans text-[0.98rem] font-semibold text-ink">{d.name}</h3>
              <p className="mt-1.5 text-[0.9rem] text-muted">{d.note}</p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

/* ---------------------------------------------------------------- FAQ      */

export function HomeFaqSection() {
  return (
    <Section bordered id="faq">
      <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div>
          <SectionHeading kicker="Questions" title={home.faqTitle} />
          <p className="mt-6 max-w-prose text-[0.95rem]">
            More questions are answered on each service page, grouped by thesis work, publication,
            books and admission.
          </p>
          <ButtonLink href="/services" variant="secondary" className="mt-7">
            See all services
          </ButtonLink>
        </div>
        <Accordion items={homeFaqs} />
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------------- Closing CTA */

export function ConsultationCta({
  title,
  body,
  primary,
  secondary,
}: {
  title?: string;
  body?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  const cta = home.cta;
  return (
    <Section tone="ink" size="tight">
      <CitationNetworkMotif opacity={0.12} light />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/95 to-navy/40"
      />
      <Container className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-display-md text-white">{title ?? cta.title}</h2>
          <p className="mt-4 text-lede text-white/70">{body ?? cta.body}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <ButtonLink href={(primary ?? cta.primary).href} size="lg">
            {(primary ?? cta.primary).label}
          </ButtonLink>
          <ButtonLink href={(secondary ?? cta.secondary).href} variant="onDark" size="lg">
            {(secondary ?? cta.secondary).label}
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}
