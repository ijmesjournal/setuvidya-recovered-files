import { BarChart3, FileText, GraduationCap, Users } from 'lucide-react';
import { ButtonLink, Container } from '@/components/ui/primitives';
import { home } from '@/lib/content';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------
   Home hero.

   One integrated banner, not text beside a photo. The academic desk visual is
   painted as a background layer anchored to the right edge, and a horizontal
   gradient fades it into the hero surface so there is no border, card, rounded
   container or visible rectangular edge anywhere.

   The visual is decorative: it repeats nothing the text does not already say,
   so it is hidden from assistive technology and the section carries no img.
------------------------------------------------------------------------- */

const trustIcons = {
  guidance: GraduationCap,
  resources: FileText,
  opportunities: Users,
  possibilities: BarChart3,
} as const;

export function Hero() {
  const {
    eyebrow, headlineLead, headlineAccent, sub,
    primaryCta, secondaryCta, trustRow, image,
  } = home.hero;

  return (
    <section className="relative isolate overflow-hidden border-b border-rule bg-surface">
      {/* The visual, anchored right and bled to the edge. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden sm:block sm:w-[86%] lg:w-[70%] 2xl:w-[68%]"
        style={{
          backgroundImage: `url(${image.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
        }}
      />
      {/* Fade its left edge into the hero surface. Two stops: an opaque run
          behind the text, then a soft dissolve across the middle. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgb(var(--sv-surface))_0%,rgb(var(--sv-surface))_36%,rgb(var(--sv-surface)/0.88)_48%,rgb(var(--sv-surface)/0.45)_60%,rgb(var(--sv-surface)/0)_76%)]"
      />
      {/* Soften the top and bottom joins so no rectangular edge reads. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-16 bg-gradient-to-b from-surface to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-16 bg-gradient-to-t from-surface to-transparent"
      />

      <Container className="py-16 sm:py-20 lg:py-28">
        <div className="max-w-[34rem] lg:max-w-[46rem]">
          <p className="flex items-center gap-4 text-micro font-semibold uppercase text-muted">
            <span aria-hidden="true" className="h-0.5 w-10 bg-brand-teal-deep" />
            {eyebrow}
          </p>

          {/* Exactly two lines. The second is held on one line from lg up. */}
          <h1 className="mt-6 font-serif text-[clamp(1.95rem,1.35rem+1.55vw,2.7rem)] font-semibold leading-[1.14] tracking-[-0.018em]">
            <span className="block text-brand-navy">{headlineLead}</span>
            <span className="block text-brand-teal-deep lg:whitespace-nowrap">
              {headlineAccent}
            </span>
          </h1>

          <p className="mt-6 max-w-[34rem] text-lede text-body">{sub}</p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <ButtonLink
              href={primaryCta.href}
              size="lg"
              className="bg-brand-teal-deep text-white hover:bg-brand-teal-deep/90"
            >
              {primaryCta.label} <span aria-hidden="true">&rarr;</span>
            </ButtonLink>
            <ButtonLink
              href={secondaryCta.href}
              variant="secondary"
              size="lg"
              className="border-brand-teal-deep/40 bg-paper text-brand-teal-deep hover:border-brand-teal-deep hover:bg-brand-teal-deep/[0.06]"
            >
              {secondaryCta.label}
            </ButtonLink>
          </div>

          {/* One horizontal row from sm up; stacked pairs only on small phones. */}
          <ul className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-3 lg:flex-nowrap">
            {trustRow.map((item, i) => {
              const Icon = trustIcons[item.icon];
              return (
                <li
                  key={item.label}
                  className={cn(
                    'flex shrink-0 items-center gap-3',
                    i > 0 && 'before:h-7 before:w-px before:bg-rule before:content-[""]',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon
                      size={16}
                      strokeWidth={1.7}
                      aria-hidden="true"
                      className="shrink-0 text-brand-navy"
                    />
                    <span className="whitespace-nowrap text-[0.78rem] font-medium text-body">
                      {item.label}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}
