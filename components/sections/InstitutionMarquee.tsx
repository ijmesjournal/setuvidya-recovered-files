'use client';

import { Container, Section, SectionHeading } from '@/components/ui/primitives';
import { institutions, type Institution } from '@/lib/content';

/* -------------------------------------------------------------------------
   Universities & Institutions.

   Carousel behaviour is unchanged from the tested implementation: the list
   renders twice and the track slides by exactly -50%, so the loop closes with
   no visible jump. Hover and focus-within pause it; prefers-reduced-motion
   stops it and turns the band into a normal scrollable strip.

   The duplicate copy is aria-hidden AND removed from the tab order, so a
   screen reader does not announce each institution twice and keyboard users do
   not tab through phantom links.

   Logos are the files supplied by the client, served from /public. Height is
   constrained and width follows the source, so nothing is stretched or
   cropped. Grayscale at rest, full colour on hover and focus.

   Wording is deliberate: "institutions", never "partners" or "approved".
------------------------------------------------------------------------- */

function Tile({ item, duplicate }: { item: Institution; duplicate: boolean }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      // The duplicate exists only to close the animation loop.
      tabIndex={duplicate ? -1 : undefined}
      aria-hidden={duplicate || undefined}
      aria-label={duplicate ? undefined : `${item.name}, opens the official website in a new tab`}
      className="group/tile flex w-[13.5rem] shrink-0 flex-col items-center gap-3.5 px-4 py-2 sm:w-[15rem] sm:px-5"
    >
      <span className="grid h-[5.5rem] w-full place-items-center rounded border border-rule bg-paper px-5 transition-[border-color,box-shadow] duration-300 ease-sv group-hover/tile:border-navy/25 group-hover/tile:shadow-lift group-focus-visible/tile:border-navy/25">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.logo}
          alt={duplicate ? '' : item.alt || `${item.name} logo`}
          loading="lazy"
          decoding="async"
          className="max-h-14 w-auto max-w-full object-contain opacity-80 grayscale transition-[opacity,filter] duration-300 ease-sv group-hover/tile:opacity-100 group-hover/tile:grayscale-0 group-focus-visible/tile:opacity-100 group-focus-visible/tile:grayscale-0"
        />
      </span>

      <span className="text-center text-[0.82rem] font-medium leading-snug text-body transition-colors duration-200 group-hover/tile:text-ink">
        {item.name}
      </span>
    </a>
  );
}

/**
 * Reusable across pages. The eight institutions come from
 * content/site.json -> institutions.items; nothing is duplicated per page.
 *
 * `id` must be unique per page so anchors and aria references never collide.
 */
export function InstitutionMarquee({
  id = 'institutions',
  subtitle,
  bordered = false,
}: {
  id?: string;
  subtitle?: string;
  bordered?: boolean;
} = {}) {
  const items = institutions.items.filter((i) => i.name && i.logo && i.url);
  if (items.length === 0) return null;

  const strip = (duplicate: boolean) => (
    <ul
      className="flex shrink-0 items-stretch"
      aria-hidden={duplicate || undefined}
      role={duplicate ? 'presentation' : undefined}
    >
      {items.map((item) => (
        <li key={item.slug} className="flex">
          <Tile item={item} duplicate={duplicate} />
        </li>
      ))}
    </ul>
  );

  return (
    <Section id={id} size="tight" bordered={bordered} className="bg-paper">
      <Container>
        <SectionHeading
          kicker={institutions.kicker}
          title={institutions.title}
          intro={subtitle ?? institutions.subtitle}
          align="center"
        />
      </Container>

      {/* Full-bleed band. overflow-hidden here is what keeps the duplicated
          track from widening the page. */}
      <div
        className="sv-marquee group relative mt-12 overflow-hidden"
        role="region"
        aria-label={institutions.title}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-paper to-transparent sm:w-24"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-paper to-transparent sm:w-24"
        />

        <div
          className="sv-marquee-track flex w-max"
          style={{ ['--sv-marquee-duration' as string]: `${institutions.speedSeconds}s` }}
        >
          {strip(false)}
          {strip(true)}
        </div>
      </div>

    </Section>
  );
}
