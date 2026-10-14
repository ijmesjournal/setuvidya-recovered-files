import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { ShieldAlert } from 'lucide-react';
import { PageHero } from '@/components/sections/PageHero';
import { ConsultationCta } from '@/components/sections/HomeSections';
import { Container, Panel, Section, SectionHeading } from '@/components/ui/primitives';
import { StageTrack } from '@/components/ui/StageTrack';
import { Reveal } from '@/components/ui/Reveal';
import { Accordion } from '@/components/ui/Accordion';
import { CampusArcadeMotif, GridMotif } from '@/components/motifs/Motifs';
import { faqs, pages, type Stage } from '@/lib/content';
import { breadcrumbSchema, faqSchema } from '@/lib/schema';

export const metadata: Metadata = pageMetadata({
  title: 'University Admission Assistance',
  description: 'Guidance on university and programme selection, eligibility, documentation and the application process. Independent advice, with no institutional affiliations.',
  path: '/university-admission',
});

const trail = [
  { name: 'Home', href: '/' },
  { name: 'University Admission', href: '/university-admission' },
];

export default function UniversityAdmissionPage() {
  const page = pages.universityAdmission;
  const items = faqs['University admission'];

  return (
    <>
      <PageHero
        kicker="University admission"
        title={page.title}
        lede={page.lede}
        cta={page.cta}
        motif="campus"
        breadcrumb={trail}
      />

      <Section tone="ink">
        <GridMotif opacity={0.07} light />
        <Container>
          <SectionHeading
            kicker="The pathway"
            title={page.pathwayTitle}
            intro="Six stages. Applicants usually lose the cycle at stage two or stage five, and both are avoidable."
            invert
          />
          <StageTrack stages={page.pathway as Stage[]} columns={3} invert className="mt-14" />
        </Container>
      </Section>

      <Section>
        <CampusArcadeMotif opacity={0.035} />
        <Container>
          <SectionHeading
            kicker="Scope"
            title="What admission assistance covers"
            intro="All of it is guidance. The application is yours, in your words, submitted by you."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {page.services.map((s, i) => (
              <Reveal key={s.title} delay={i * 50}>
                <Panel className="h-full p-7">
                  <div className="flex items-baseline gap-4">
                    <span aria-hidden="true" className="font-serif text-[1.5rem] leading-none text-brass">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-sans text-[1.02rem] font-semibold text-ink">{s.title}</h3>
                  </div>
                  <p className="mt-3 text-[0.94rem]">{s.body}</p>
                </Panel>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-10 flex items-start gap-4 rounded border-l-2 border-brass bg-surface p-6">
              <ShieldAlert size={20} className="mt-0.5 shrink-0 text-brass" aria-hidden="true" />
              <p className="max-w-3xl text-[0.95rem]">{page.note}</p>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section tone="surface" bordered>
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionHeading kicker="Questions" title="Admission guidance, honestly framed" />
          <Accordion items={items} />
        </Container>
      </Section>

      <ConsultationCta
        title="Not sure which programme you are actually eligible for?"
        body="Send us your academic record and what you want to do next. We will shortlist honestly, including telling you when the answer is to wait a cycle."
        primary={{ label: 'Talk to an admission advisor', href: '/contact' }}
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
