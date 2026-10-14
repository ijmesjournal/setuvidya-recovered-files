import { ButtonLink, Container, Section } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/Reveal';
import { pages } from '@/lib/content';

/* -------------------------------------------------------------------------
   Book publication feature, home page.

   Copy and image both come from content/site.json -> pages.bookPublication, so
   this shares the Book Publication page's heading, lede and asset rather than
   duplicating any of them.
------------------------------------------------------------------------- */

export function BookFeature() {
  const page = pages.bookPublication;
  if (!page.image.src) return null;

  return (
    <Section bordered id="book-feature">
      <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="mb-5 flex items-center gap-3 text-micro font-semibold text-brass-text">
            <span aria-hidden="true" className="h-px w-7 bg-brass/70" />
            Book publication
          </p>
          <h2 className="text-display">{page.title}</h2>
          <p className="mt-4 max-w-prose text-lede text-body">{page.lede}</p>
          <ButtonLink href="/book-publication" className="mt-8">
            Explore book publication
          </ButtonLink>
        </Reveal>

        <Reveal delay={90}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={page.image.src}
            alt={page.image.alt}
            width={1700}
            height={900}
            loading="lazy"
            decoding="async"
            className="h-auto w-full rounded border border-rule object-cover"
          />
        </Reveal>
      </Container>
    </Section>
  );
}
