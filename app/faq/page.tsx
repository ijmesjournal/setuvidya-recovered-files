import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { Container, Section } from '@/components/ui/primitives';
import { PageHero } from '@/components/sections/PageHero';
import { Accordion } from '@/components/ui/Accordion';
import { faqPage, faqs } from '@/lib/content';
import { breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = pageMetadata({
  title: faqPage.title,
  description: faqPage.intro,
  path: '/faq',
});

/* The single home for the FAQ. Questions come from the same `faqs` groups the
   service pages use, so nothing is duplicated or rewritten here. */
const trail = [
  { name: 'Home', href: '/' },
  { name: faqPage.title, href: '/faq' },
];

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(trail)),
        }}
      />
     <PageHero
  kicker={faqPage.kicker}
  title={faqPage.title}
  lede={faqPage.intro}
  motif="document"
  breadcrumb={trail}
/>
      <Section>
        <Container className="max-w-3xl space-y-14">
          {Object.entries(faqs).map(([group, items]) => {
            const id = `faq-${group.replace(/\s+/g, '-').toLowerCase()}`;
            return (
              <section key={group} aria-labelledby={id}>
                <h2 id={id} className="text-[0.8rem] font-semibold uppercase tracking-[0.13em] text-muted">
                  {group}
                </h2>
                <div className="mt-5">
                  <Accordion items={items} />
                </div>
              </section>
            );
          })}
        </Container>
      </Section>
    </>
  );
}
