import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { Container, Section } from '@/components/ui/primitives';
import { PageHero } from '@/components/sections/PageHero';
import { ReviewGrid } from '@/components/sections/StudentReviews';
import { testimonials, testimonialsPage } from '@/lib/content';
import { breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = pageMetadata({
  title: testimonialsPage.title,
  description: testimonialsPage.intro,
  path: '/testimonials',
});

/* The dedicated page. Cards come from the same `testimonials` data and the same
   ReviewGrid component the Home preview uses, so there is one source of truth
   and no contradictory copy. */
const trail = [
  { name: 'Home', href: '/' },
  { name: testimonialsPage.title, href: '/testimonials' },
];

export default function TestimonialsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(trail)),
        }}
      />
      <PageHero
        kicker={testimonialsPage.kicker}
        title={testimonialsPage.title}
        lede={testimonialsPage.intro}
        motif="network"
        breadcrumb={trail}
      />
      <Section>
        <Container>
          {testimonials.intro ? (
            <p className="max-w-3xl text-[0.95rem] text-body">{testimonials.intro}</p>
          ) : null}
          <ReviewGrid />
        </Container>
      </Section>
    </>
  );
}
