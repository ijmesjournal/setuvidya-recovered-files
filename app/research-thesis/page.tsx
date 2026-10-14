import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { Check } from 'lucide-react';
import { PageHero } from '@/components/sections/PageHero';
import { ConsultationCta } from '@/components/sections/HomeSections';
import { ResearchDomains } from '@/components/sections/ResearchDomains';
import { ThesisAnatomy } from '@/components/sections/ThesisAnatomy';
import { InstitutionMarquee } from '@/components/sections/InstitutionMarquee';
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
import { DocumentOutlineMotif, GridMotif } from '@/components/motifs/Motifs';
import { faqs, pages, type DetailService, type Stage } from '@/lib/content';
import { breadcrumbSchema, faqSchema } from '@/lib/schema';

export const metadata: Metadata = pageMetadata({
  title: 'PhD & M.Tech Thesis Consultancy',
  description: 'Research proposal, literature review, methodology, data analysis, thesis development and defence preparation support for PhD scholars and M.Tech students.',
  path: '/research-thesis',
});

const trail = [
  { name: 'Home', href: '/' },
  { name: 'Research & Thesis', href: '/research-thesis' },
];

export default function ResearchThesisPage() {
  const page = pages.researchThesis;
  const items = faqs['Thesis consultancy'];

  return (
    <>
      <PageHero
        kicker="Research & thesis"
        title={page.title}
        lede={page.lede}
        cta={{ ...page.cta, href: "/contact#requirement-form" }}
        motif="document"
        breadcrumb={trail}
      />

      {/* ------------------------------------------------ research pipeline */}
      <Section tone="ink">
        <GridMotif opacity={0.07} light />
        <Container>
          <SectionHeading
            kicker="The sequence"
            title={page.pipelineTitle}
            intro={page.pipelineIntro}
            invert
          />
          <StageTrack stages={page.pipeline as Stage[]} invert className="mt-14" />
        </Container>
      </Section>

      {/* --------------------------------------------------------- services */}
      <Section>
        <DocumentOutlineMotif opacity={0.035} />
        <Container>
          <SectionHeading
            kicker="Support in detail"
            title="What each part of the engagement covers"
            intro="Take one of these, or take the sequence. Scope is agreed in writing before anything begins."
          />

          <div className="mt-14 space-y-6">
            {(page.services as DetailService[]).map((service, i) => (
              <Reveal key={service.id} delay={i * 40}>
                <Panel id={service.id} className="scroll-mt-28 p-7 sm:p-9">
                  <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
                    <div>
                      <h3 className="text-display-sm">{service.title}</h3>
                      <p className="mt-3 max-w-prose">{service.summary}</p>

                      <div className="mt-6 border-t border-rule pt-5">
                        <h4 className="font-sans text-[0.85rem] font-semibold uppercase tracking-[0.13em] text-muted">
                          Who it is for
                        </h4>
                        <p className="mt-2 text-[0.94rem]">{service.who}</p>
                      </div>

                      <div className="mt-5">
                        <h4 className="font-sans text-[0.85rem] font-semibold uppercase tracking-[0.13em] text-muted">
                          Key deliverables
                        </h4>
                        <ul className="mt-2.5 flex flex-wrap gap-2">
                          {service.deliverables.map((d) => (
                            <li
                              key={d}
                              className="rounded border border-rule bg-surface px-2.5 py-1 text-[0.84rem]"
                            >
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <ButtonLink href="/contact" variant="secondary" size="sm" className="mt-7">
                        {page.cta.label}
                      </ButtonLink>
                    </div>

                    <div className="lg:border-l lg:border-rule lg:pl-14">
                      <h4 className="font-sans text-[0.85rem] font-semibold uppercase tracking-[0.13em] text-muted">
                        What it includes
                      </h4>
                      <ul className="mt-4 space-y-2.5">
                        {service.includes.map((inc) => (
                          <li key={inc} className="flex items-start gap-2.5 text-[0.94rem]">
                            <Check
                              size={15}
                              className="mt-1 shrink-0 text-brass"
                              aria-hidden="true"
                              strokeWidth={2.4}
                            />
                            {inc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Panel>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <ResearchDomains />

      <ThesisAnatomy />

      <InstitutionMarquee />

      <Section bordered>
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionHeading kicker="Questions" title="Thesis consultancy, answered plainly" />
          <Accordion items={items} />
        </Container>
      </Section>

      <ConsultationCta
        title="Tell us where your research has stalled"
        body="Send your draft, your guidelines and your supervisor's feedback. We will tell you what the real problem is."
        primary={{ label: 'Discuss your research', href: '/contact#requirement-form' }}
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
