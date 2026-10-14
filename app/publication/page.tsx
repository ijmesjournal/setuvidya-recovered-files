import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { Check, ShieldAlert } from 'lucide-react';
import { PageHero } from '@/components/sections/PageHero';
import { ConsultationCta } from '@/components/sections/HomeSections';
import {
  ButtonLink,
  Container,
  Panel,
  Section,
  SectionHeading,
} from '@/components/ui/primitives';
import { StageTrack } from '@/components/ui/StageTrack';
import { Reveal } from '@/components/ui/Reveal';
import { Accordion } from '@/components/ui/Accordion';
import { JournalColumnsMotif, GridMotif } from '@/components/motifs/Motifs';
import { faqs, pages, type Stage } from '@/lib/content';
import { breadcrumbSchema, faqSchema } from '@/lib/schema';

export const metadata: Metadata = pageMetadata({
  title: 'SCI, Scopus & Peer-Reviewed Publication Support',
  description: 'Manuscript preparation, journal selection guidance, formatting, submission support and reviewer response assistance for SCI, Scopus and peer-reviewed journals.',
  path: '/publication',
});

const trail = [
  { name: 'Home', href: '/' },
  { name: 'Publication', href: '/publication' },
];

export default function PublicationPage() {
  const page = pages.publication;
  const items = [...faqs['Research publication'], ...faqs['SCI & Scopus'], ...faqs['Peer-reviewed journals']];

  return (
    <>
      <PageHero
        kicker="Publication"
        title={page.title}
        lede={page.lede}
        cta={page.cta}
        motif="journal"
        breadcrumb={trail}
      />

      {/* ------------------------------------------------------ three tracks */}
      <Section>
        <JournalColumnsMotif opacity={0.04} />
        <Container>
          <SectionHeading
            kicker="Journal tracks"
            title="Three routes, each with different expectations"
            intro="The right target depends on the strength of your contribution, your institution's requirement and how much revision time you have."
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {page.tracks.map((track, i) => (
              <Reveal key={track.id} delay={i * 80}>
                <Panel interactive className="flex h-full flex-col p-7">
                  <span
                    aria-hidden="true"
                    className="block h-1 w-10 rounded-full"
                    style={{ background: ['#12314F', '#2B4A8B', '#A8802C'][i] }}
                  />
                  <h3 className="mt-5 text-display-sm">{track.title}</h3>
                  <p className="mt-3 text-[0.95rem]">{track.blurb}</p>

                  <ul className="mt-6 flex-1 space-y-2.5 border-t border-rule pt-5">
                    {track.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-[0.92rem]">
                        <Check size={15} className="mt-1 shrink-0 text-brass" aria-hidden="true" strokeWidth={2.4} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </Panel>
              </Reveal>
            ))}
          </div>

          {/* the honesty note, given real prominence rather than fine print */}
          <Reveal>
            <div className="mt-10 flex items-start gap-4 rounded border-l-2 border-brass bg-surface p-6">
              <ShieldAlert size={20} className="mt-0.5 shrink-0 text-brass" aria-hidden="true" />
              <p className="max-w-3xl text-[0.95rem] text-body">{page.integrityNote}</p>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* --------------------------------------------------------- workflow */}
      <Section tone="ink">
        <GridMotif opacity={0.07} light />
        <Container>
          <SectionHeading
            kicker="The workflow"
            title={page.workflowTitle}
            intro="Two of these stages belong entirely to the journal. We prepare you for them; we do not influence them."
            invert
          />
          <StageTrack stages={page.workflow as Stage[]} invert className="mt-14" />
        </Container>
      </Section>

      {/* -------------------------------------------------------- what we do */}
      <Section bordered>
        <Container>
          <SectionHeading kicker="Scope" title={page.servicesTitle} />
          <ul className="mt-12 grid gap-px overflow-hidden rounded border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
            {page.services.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 45} className="bg-paper p-6">
                <span
                  aria-hidden="true"
                  className="font-serif text-[1.6rem] leading-none text-numeral"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 font-sans text-[0.99rem] font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-[0.91rem]">{s.body}</p>
              </Reveal>
            ))}
          </ul>

          <div className="mt-10">
            <ButtonLink href="/contact" size="lg">
              {page.cta.label}
            </ButtonLink>
          </div>
        </Container>
      </Section>

      <Section tone="surface" bordered>
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionHeading
            kicker="Questions"
            title="Publication, without the promises"
            intro="Every answer here is one we would give a scholar on a call."
          />
          <Accordion items={items} />
        </Container>
      </Section>

      <ConsultationCta
        title="Have a manuscript that keeps getting desk-rejected?"
        body="Send it with the rejection notes. We will tell you whether it is a fit problem, a framing problem or a method problem."
        primary={{ label: 'Discuss your manuscript', href: '/contact' }}
        secondary={{ label: 'Send your requirement', href: '/contact#requirement-form' }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([faqSchema(items), breadcrumbSchema(trail)]),
        }}
      />
    </>
  );
}
