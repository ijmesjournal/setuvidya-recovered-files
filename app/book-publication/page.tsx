import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { PageHero } from '@/components/sections/PageHero';
import { ConsultationCta } from '@/components/sections/HomeSections';
import { Container, Panel, Section, SectionHeading } from '@/components/ui/primitives';
import { StageTrack } from '@/components/ui/StageTrack';
import { Reveal } from '@/components/ui/Reveal';
import { Accordion } from '@/components/ui/Accordion';
import { PageStackMotif, GridMotif } from '@/components/motifs/Motifs';
import { BookMockup } from '@/components/motifs/BookMockup';
import { SdPublicationHouse } from '@/components/sections/SdPublicationHouse';
import { BookPortfolio } from '@/components/sections/BookPortfolio';
import { CartProvider } from '@/components/commerce/CartContext';
import { BookCommerce } from '@/components/commerce/BookCommerce';
import { faqs, pages, type Stage } from '@/lib/content';
import { breadcrumbSchema, faqSchema } from '@/lib/schema';

export const metadata: Metadata = pageMetadata({
  title: 'Academic Book Publication Support',
  description: 'Editorial, design and publishing support for academic books, research monographs, textbooks, reference works and edited volumes, from manuscript to distribution.',
  path: '/book-publication',
});

const trail = [
  { name: 'Home', href: '/' },
  { name: 'Book Publication', href: '/book-publication' },
];

export default function BookPublicationPage() {
  const page = pages.bookPublication;
  const items = faqs['Book publication'];

  return (
    <>
      <PageHero
        kicker="Book publication"
        title={page.title}
        lede={page.lede}
        cta={page.cta}
        motif="book"
        breadcrumb={trail}
      >
        <div className="mt-14 lg:mt-16">
          {/* A supplied photograph replaces the vector mockup. Empty src keeps
              the mockup, so the page never falls back to stock imagery. */}
          {page.image.src ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={page.image.src}
              alt={page.image.alt}
              width={1700}
              height={900}
              className="h-auto w-full max-w-3xl rounded border border-rule object-cover"
            />
          ) : (
            <BookMockup />
          )}
        </div>
      </PageHero>

      {/* ------------------------------------------------------ book types */}
      <Section>
        <PageStackMotif opacity={0.035} />
        <Container>
          <SectionHeading
            kicker="What we publish"
            title="Six kinds of academic book, each with a different reader"
            intro="The reader determines everything: structure, register, apparatus and length. We start there rather than with a page count."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {page.types.map((t, i) => (
              <Reveal key={t.title} delay={i * 60}>
                <Panel interactive className="h-full p-7">
                  {/* a spine mark, sized differently per type */}
                  <span
                    aria-hidden="true"
                    className="mb-6 flex items-end gap-1"
                    style={{ height: 34 }}
                  >
                    {[0, 1, 2].map((b) => (
                      <span
                        key={b}
                        className="block w-2 rounded-sm bg-navy/25"
                        style={{ height: 16 + ((i + b) % 3) * 9 }}
                      />
                    ))}
                    <span className="block w-2 rounded-sm bg-brass" style={{ height: 30 }} />
                  </span>

                  <h3 className="font-sans text-[1.04rem] font-semibold text-ink">{t.title}</h3>
                  <p className="mt-2.5 text-[0.93rem]">{t.body}</p>
                </Panel>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* --------------------------------------------------------- pipeline */}
      <Section tone="ink">
        <GridMotif opacity={0.07} light />
        <Container>
          <SectionHeading
            kicker="Production"
            title={page.pipelineTitle}
            intro="Seven stages between a finished manuscript and a book someone can find, buy and cite."
            invert
          />
          <StageTrack stages={page.pipeline as Stage[]} invert className="mt-14" />

          <Reveal>
            <p className="mt-14 max-w-3xl border-l-2 border-brass pl-6 font-serif text-[1.1rem] italic leading-relaxed text-white/85">
              {page.note}
            </p>
          </Reveal>
        </Container>
      </Section>

      <SdPublicationHouse />

      <CartProvider>
        <BookPortfolio />
        <BookCommerce />
      </CartProvider>

      <Section tone="surface" bordered>
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionHeading kicker="Questions" title="Publishing an academic book" />
          <Accordion items={items} />
        </Container>
      </Section>

      <ConsultationCta
        title="Have a manuscript, or a thesis that wants to be a book?"
        body="Send the manuscript or the chapter plan. We will tell you what it needs, and what publishing route fits it."
        primary={{ label: 'Discuss your book', href: '/contact' }}
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
