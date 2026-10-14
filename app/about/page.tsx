import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { Compass, Lock, Sparkles } from 'lucide-react';
import { PageHero } from '@/components/sections/PageHero';
import { ConsultationCta } from '@/components/sections/HomeSections';
import { Container, Section, SectionHeading } from '@/components/ui/primitives';
import { StageTrack } from '@/components/ui/StageTrack';
import { Reveal } from '@/components/ui/Reveal';
import { DocumentOutlineMotif, GridMotif } from '@/components/motifs/Motifs';
import { journey, legal, pages } from '@/lib/content';
import { breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = pageMetadata({
  title: 'About SetuVidya Consultancy',
  description: 'An independent academic research and education consultancy providing structured, ethical support for PhD scholars, postgraduate students, researchers and authors.',
  path: '/about',
});

const valueIcons = [Compass, Sparkles, Lock];

export default function AboutPage() {
  const page = pages.about;

  return (
    <>
      <PageHero
        kicker="About"
        title={page.title}
        lede={page.lede}
        motif="document"
        breadcrumb={[
          { name: 'Home', href: '/' },
          { name: 'About', href: '/about' },
        ]}
      />

      <Section>
        <DocumentOutlineMotif opacity={0.035} />
        <Container>
          <div className="grid gap-x-16 gap-y-14 lg:grid-cols-2">
            {page.sections.map((s, i) => (
              <Reveal key={s.heading} delay={i * 60}>
                <h2 className="text-display-sm">{s.heading}</h2>
                <div className="mt-4 space-y-4">
                  {s.body.map((p) => (
                    <p key={p.slice(0, 24)} className="max-w-prose">
                      {p}
                    </p>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="surface" bordered>
        <Container>
          <SectionHeading kicker="Principles" title="Three commitments that shape every engagement" />
          <ul className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-3">
            {page.values.map((v, i) => {
              const Icon = valueIcons[i % valueIcons.length];
              return (
                <Reveal as="li" key={v.title} delay={i * 70} className="border-t-2 border-brass/60 pt-5">
                  <Icon size={20} className="text-navy" strokeWidth={1.7} aria-hidden="true" />
                  <h3 className="mt-4 font-sans text-[1.02rem] font-semibold text-ink">{v.title}</h3>
                  <p className="mt-2 text-[0.93rem]">{v.body}</p>
                </Reveal>
              );
            })}
          </ul>
        </Container>
      </Section>

      <Section tone="ink">
        <GridMotif opacity={0.07} light />
        <Container>
          <SectionHeading
            kicker="The bridge"
            title="What we mean by bridging research and academic success"
            intro="The name is a description of the service, not a slogan. This is the crossing we help scholars make."
            invert
          />
          <StageTrack stages={journey} invert className="mt-14" />
        </Container>
      </Section>

      <Section bordered>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <SectionHeading kicker="Ethics" title={legal.integrity.title} intro={legal.integrity.body} />
            <ul className="space-y-3.5 lg:pt-2">
              {legal.integrity.points.map((point) => (
                <li key={point} className="flex gap-3 border-b border-rule pb-3.5 text-[0.95rem]">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      <ConsultationCta />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: 'Home', href: '/' },
              { name: 'About', href: '/about' },
            ]),
          ),
        }}
      />
    </>
  );
}
