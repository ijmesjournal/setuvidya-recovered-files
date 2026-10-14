import { ButtonLink, Container, Section, SectionHeading } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/Reveal';
import { PageStackMotif } from '@/components/motifs/Motifs';
import { pages } from '@/lib/content';

/* -------------------------------------------------------------------------
   SD Publication House — the book publication division.

   Everything here describes work the division does. Nothing claims registered
   status, ISBN arrangements, printing partners, distribution reach or sales,
   because none of that has been confirmed. The placeholder note carries those
   gaps visibly rather than filling them with plausible-sounding text.
------------------------------------------------------------------------- */

export function SdPublicationHouse() {
  const sd = pages.bookPublication.sdPublicationHouse;
  const isPlaceholder = sd.placeholderNote.trim().startsWith('[');

  return (
    <Section bordered id="sd-publication-house" className="scroll-mt-24">
      <PageStackMotif opacity={0.04} />
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div>
            <SectionHeading kicker={sd.kicker} title={sd.title} intro={sd.lede} />

            {/* Publishing identity block. The logo is the visual element; the
                typography stays on the shared scale. */}
            {sd.logo ? (
              <div className="mt-8 rounded-lg border border-rule bg-paper p-6 sm:p-7">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sd.logo}
                  alt={sd.logoAlt}
                  width={1556}
                  height={227}
                  className="h-auto w-full max-w-sm object-contain"
                />
                <p className="mt-5 max-w-prose text-[1.02rem]">{sd.identity}</p>
              </div>
            ) : null}

            <div className="mt-6 space-y-4">
              {sd.body.map((p) => (
                <p key={p.slice(0, 24)} className="max-w-prose">
                  {p}
                </p>
              ))}
            </div>

            <ButtonLink href={sd.cta.href} className="mt-8">
              {sd.cta.label}
            </ButtonLink>
          </div>

          <div>
            <ul className="grid gap-px overflow-hidden rounded border border-rule bg-rule sm:grid-cols-2">
              {sd.capabilities.map((c, i) => (
                <Reveal as="li" key={c.title} delay={i * 60} className="bg-paper p-6">
                  <span
                    aria-hidden="true"
                    className="font-serif text-[1.5rem] leading-none text-brass"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-3 font-sans text-[1rem] font-semibold text-ink">{c.title}</h3>
                  <p className="mt-2 text-[0.92rem]">{c.body}</p>
                </Reveal>
              ))}
            </ul>

            {/* While this is still a bracketed internal note it renders
                nothing: a "[ADD …]" reminder does not belong on a public page.
                Real copy replaces it and appears normally. */}
            {isPlaceholder ? null : (
              <p className="mt-6 max-w-prose text-[0.92rem]">{sd.placeholderNote}</p>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
