import { Container, Section, SectionHeading } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/Reveal';
import { home } from '@/lib/content';

/* -------------------------------------------------------------------------
   One section, two parts: the reasons scholars work with us, then what they
   said. The review cards are the same component the Student Reviews section
   uses, so the testimonials are not duplicated anywhere.
------------------------------------------------------------------------- */

export function WhyScholarsChoose() {
  const wc = home.whyChoose;

  return (
    <Section tone="surface" bordered id="why-scholars-choose">
      <Container>
        <SectionHeading kicker={wc.kicker} title={wc.reasonsTitle} />

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wc.reasons.map((r, i) => (
            <Reveal as="li" key={r.title} delay={i * 60} className="h-full">
              <div className="flex h-full flex-col rounded-lg border border-rule bg-paper p-6">
                <span
                  aria-hidden="true"
                  className="font-serif text-[1.05rem] font-semibold text-brand-teal-deep"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="mt-3 font-serif text-[1.02rem] font-semibold leading-snug text-ink">
                  {r.title}
                </p>
                <p className="mt-2.5 text-[0.93rem]">{r.body}</p>
              </div>
            </Reveal>
          ))}
        </ul>

      </Container>
    </Section>
  );
}
