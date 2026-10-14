import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container, Section, SectionHeading } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/Reveal';
import { home, journalConfigured, journalUrl } from '@/lib/content';

/* Two resource cards. Deliberately lighter than the services section so they
   do not outweigh it. No indexing, metric or status is claimed for either. */
export function ResourceCards() {
  const r = home.resources;

  return (
    <Section bordered id="academic-resources">
      <Container>
        <SectionHeading kicker={r.kicker} title={r.title} />

        <ul className="mt-10 grid gap-6 lg:grid-cols-2">
          {r.cards.map((card, i) => {
            const live = !card.external || journalConfigured;
            const href = card.external ? journalUrl : card.href;
            return (
              <Reveal as="li" key={card.title} delay={i * 80} className="h-full">
                <div className="flex h-full flex-col rounded-lg border border-rule bg-paper p-7">
                  <h3 className="font-serif text-[1.22rem] font-semibold text-ink">{card.title}</h3>
                  {card.subtitle ? (
                    <p className="mt-1.5 text-[0.88rem] text-muted">{card.subtitle}</p>
                  ) : null}
                  <p className="mt-3 flex-1 text-[0.95rem]">{card.body}</p>

                  {card.external ? (
                    live ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-flex items-center gap-2 text-[0.92rem] font-medium text-brand-teal-deep hover:underline"
                      >
                        {card.ctaLabel}
                        <ArrowRight size={15} aria-hidden="true" />
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : null /* no address configured: no link, no notice */
                  ) : (
                    <Link
                      href={card.href}
                      className="mt-6 inline-flex items-center gap-2 text-[0.92rem] font-medium text-brand-teal-deep hover:underline"
                    >
                      {card.ctaLabel}
                      <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
