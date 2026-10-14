'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Container, Section, SectionHeading } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/Reveal';
import { GridMotif } from '@/components/motifs/Motifs';
import { testimonials, type Testimonial } from '@/lib/content';

/* -------------------------------------------------------------------------
   Student reviews.

   Six named students. A card is published only when that student has confirmed
   their own wording: `approved` on their entry gates it. Draft text can sit in
   content/site.json indefinitely without ever appearing on the site, so wording
   nobody has signed off can never read as a real quote. Nothing about that
   gating is ever surfaced publicly: an unapproved card simply does not render.

   Stars come from `rating` on that entry, never a default, and only ever appear
   on an approved card. No aggregate score is shown, and there are no
   photographs of any kind — not of the students, not stock, not generated.
   Identity is carried by initials, name and city.
------------------------------------------------------------------------- */

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

/**
 * A testimonial is a first-person claim in a named person's name, so a card is
 * published only when that student has confirmed their own wording. Draft text
 * can sit in the data indefinitely without ever appearing on the site.
 */
const isPublished = (t: Testimonial) => t.approved && t.review.trim().length > 0;

/** The review cards on their own, so another section can reuse them
    without duplicating the markup. */

/**
 * Native horizontal scroller with scroll-snap. No carousel library: the rail is
 * a normal overflow-x list, so touch swipe and keyboard scrolling work by
 * default and reduced-motion users get instant jumps rather than animation.
 * The buttons move by one card width and disable at each end.
 */
function ReviewScroller({ count, children }: { count: number; children: React.ReactNode }) {
  const rail = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = rail.current?.querySelector('ul');
    if (!el) return;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = rail.current?.querySelector('ul');
    if (!el) return;
    sync();
    el.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      el.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [sync]);

  const nudge = (dir: 1 | -1) => {
    const el = rail.current?.querySelector('ul');
    if (!el) return;
    const card = el.querySelector('li');
    const step = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  return (
    <div ref={rail} className="mt-12">
      {children}
      {count > 1 ? (
        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => nudge(-1)}
            disabled={atStart}
            aria-label="Previous testimonials"
            className="grid h-11 w-11 place-items-center rounded-full border border-rule bg-paper text-ink transition-colors duration-200 hover:border-navy/40 disabled:cursor-default disabled:opacity-35"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => nudge(1)}
            disabled={atEnd}
            aria-label="More testimonials"
            className="grid h-11 w-11 place-items-center rounded-full border border-rule bg-paper text-ink transition-colors duration-200 hover:border-navy/40 disabled:cursor-default disabled:opacity-35"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
          <p className="text-[0.86rem] text-muted">Scroll or swipe for more</p>
        </div>
      ) : null}
    </div>
  );
}

export function ReviewGrid() {
  const published = testimonials.items.filter(isPublished);
  if (published.length === 0) return null;
  return (
    <ReviewScroller count={published.length}>
      <ul
        className="sv-rail flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 motion-reduce:scroll-auto"
        style={{ scrollbarWidth: 'none' }}
      >
      {published.map((t, i) => {
        return (
          <Reveal as="li" key={t.name} delay={i * 60} className="w-[84%] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]">
            <figure className="flex h-full flex-col rounded border border-rule bg-paper p-7">
              {typeof t.rating === 'number' && t.rating > 0 ? (
                <p
                  role="img"
                  aria-label={`${t.rating} out of 5 stars`}
                  className="flex items-center gap-0.5"
                >
                  {Array.from({ length: t.rating }).map((_, star) => (
                    <Star
                      key={star}
                      size={15}
                      aria-hidden="true"
                      className="fill-brass text-brass"
                    />
                  ))}
                </p>
              ) : null}

              <span
                aria-hidden="true"
                className="mt-3 block font-serif text-[2.2rem] leading-none text-brass/70"
              >
                &ldquo;
              </span>

              <blockquote className="mt-2 flex-1">
                <p className="text-[0.97rem] leading-relaxed text-body">{t.review}</p>
              </blockquote>

              <figcaption className="mt-7 flex items-center gap-3.5 border-t border-rule pt-5">
                <span
                  aria-hidden="true"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-navy/20 bg-surface font-sans text-[0.85rem] font-semibold tracking-wide text-navy"
                >
                  {initials(t.name)}
                </span>
                <span>
                  <span className="block font-sans text-[0.97rem] font-semibold text-ink">
                    {t.name}
                  </span>
                  <span className="block text-[0.87rem] text-muted">{t.location}</span>
                </span>
              </figcaption>
            </figure>
          </Reveal>
        );
      })}
      </ul>
    </ReviewScroller>
  );
}

export function StudentReviews() {
  const published = testimonials.items.filter(isPublished);

  return (
    <Section tone="surface" bordered id="reviews">
      <GridMotif opacity={0.04} />
      <Container>
        <SectionHeading
          kicker="Student reviews"
          title={testimonials.title}
          intro={testimonials.intro}
        />


        <ReviewGrid />
      </Container>
    </Section>
  );
}
