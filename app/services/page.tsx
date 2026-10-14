import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { PageHero } from '@/components/sections/PageHero';
import { ConsultationCta, StepsSection } from '@/components/sections/HomeSections';
import { Container, Panel, Section, SectionHeading } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/Reveal';
import { Accordion } from '@/components/ui/Accordion';
import { CitationNetworkMotif } from '@/components/motifs/Motifs';
import { disciplines, faqs, pages, serviceGroups } from '@/lib/content';
import { breadcrumbSchema, faqSchema, servicesSchema } from '@/lib/schema';

export const metadata: Metadata = pageMetadata({
  title: 'Academic Consultancy Services',
  description: 'Thesis and dissertation support, research paper publication guidance, book publication and university admission assistance for scholars and academicians.',
  path: '/services',
});

const trail = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services' },
];

export default function ServicesPage() {
  const faqItems = [
    ...faqs['Thesis consultancy'].slice(0, 2),
    ...faqs['Research publication'].slice(0, 2),
    ...faqs['Book publication'].slice(0, 1),
    ...faqs['University admission'].slice(0, 1),
  ];

  return (
    <>
      <PageHero
        kicker="Services"
        title={pages.services.title}
        lede={pages.services.lede}
        motif="network"
        breadcrumb={trail}
        cta={{ label: 'Book a consultation', href: '/contact' }}
      />

      <Section>
        <Container>
          <div className="space-y-16">
            {serviceGroups.map((group, gi) => (
              <Reveal key={group.id}>
                <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
                  <div>
                    <p className="font-serif text-[2.4rem] leading-none text-numeral" aria-hidden="true">
                      {String(gi + 1).padStart(2, '0')}
                    </p>
                    <h2 className="mt-4 text-display-md">{group.title}</h2>
                    <p className="mt-3 max-w-prose">{group.blurb}</p>
                    <Link
                      href={group.href}
                      className="mt-6 inline-flex items-center gap-2 font-medium text-indigo transition-colors hover:text-indigo-lift"
                    >
                      Full details
                      <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  </div>

                  <Panel className="p-6 sm:p-8">
                    <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                      {group.items.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-[0.94rem]">
                          <Check
                            size={15}
                            className="mt-1 shrink-0 text-brass"
                            aria-hidden="true"
                            strokeWidth={2.4}
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Panel>
                </div>
                {gi < serviceGroups.length - 1 ? (
                  <hr className="mt-16 border-0 border-t border-rule" />
                ) : null}
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <StepsSection />

      <Section bordered>
        <CitationNetworkMotif opacity={0.04} />
        <Container>
          <SectionHeading kicker="Coverage" title={disciplines.title} intro={disciplines.intro} />
          <ul className="mt-12 grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
            {disciplines.items.map((d, i) => (
              <Reveal as="li" key={d.name} delay={i * 35} className="border-t border-rule pt-4">
                <h3 className="font-sans text-[0.98rem] font-semibold text-ink">{d.name}</h3>
                <p className="mt-1.5 text-[0.9rem] text-muted">{d.note}</p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="surface" bordered>
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionHeading kicker="Questions" title="Before you commit to anything" />
          <Accordion items={faqItems} />
        </Container>
      </Section>

      <ConsultationCta />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            ...servicesSchema(),
            faqSchema(faqItems),
            breadcrumbSchema(trail),
          ]),
        }}
      />
    </>
  );
}
