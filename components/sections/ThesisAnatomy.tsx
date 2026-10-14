'use client';

import { useId, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import {
  ButtonLink,
  Container,
  Section,
  SectionHeading,
} from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/Reveal';
import { DocumentOutlineMotif } from '@/components/motifs/Motifs';
import { thesisAnatomy } from '@/lib/content';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------
   Understanding Your Thesis.

   Seven numbered chapters as a single-open accordion, matching the pattern the
   FAQ already uses on this page rather than inventing a second one. Collapsed
   rows show only the numeral and the chapter name, so the section reads as an
   index rather than a wall of text.

   The APA entries are formatting templates with placeholder authors. They are
   deliberately not real publications.
------------------------------------------------------------------------- */

export function ThesisAnatomy() {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();

  return (
    <Section bordered id="understanding-your-thesis">
      <DocumentOutlineMotif opacity={0.03} />
      <Container>
        <SectionHeading
          kicker={thesisAnatomy.kicker}
          title={thesisAnatomy.title}
          intro={thesisAnatomy.subtitle}
        />

        <ol className="mt-12 divide-y divide-rule border-y border-rule">
          {thesisAnatomy.chapters.map((chapter, i) => {
            const isOpen = open === i;
            const panelId = `${base}-anatomy-panel-${i}`;
            const buttonId = `${base}-anatomy-button-${i}`;

            return (
              <li key={chapter.id} id={chapter.id} className="scroll-mt-28">
                <h3 className="m-0">
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center gap-5 py-5 text-left transition-colors duration-200 hover:text-indigo sm:gap-7"
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'shrink-0 font-serif text-[1.5rem] font-semibold leading-none tabular-nums transition-colors duration-200',
                        isOpen ? 'text-brass' : 'text-numeral',
                      )}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <span className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1.5">
                      <span className="font-serif text-[1.08rem] font-semibold leading-snug text-ink">
                        {chapter.title}
                      </span>
                      {chapter.label ? (
                        <span className="rounded border border-rule bg-surface px-2 py-0.5 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-muted">
                          {chapter.label}
                        </span>
                      ) : null}
                    </span>

                    <span
                      aria-hidden="true"
                      className={cn(
                        'grid h-7 w-7 shrink-0 place-items-center rounded border transition-colors duration-200',
                        isOpen ? 'border-indigo bg-indigo text-white' : 'border-rule text-navy',
                      )}
                    >
                      {isOpen ? <Minus size={15} /> : <Plus size={15} />}
                    </span>
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className="pb-8 sm:pl-[3.9rem]"
                >
                  <div className="sv-panel-in">
                    {chapter.body.map((p) => (
                      <p key={p.slice(0, 28)} className="mb-3.5 max-w-prose text-[0.95rem] last:mb-0">
                        {p}
                      </p>
                    ))}

                    {chapter.examples?.length ? (
                      <ul className="mt-6 space-y-3">
                        {chapter.examples.map((ex) => (
                          <li key={ex.label} className="rounded border border-rule bg-surface p-4">
                            <p className="text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-muted">
                              {ex.label}
                            </p>
                            {/* A reference entry is a formatted string; the
                                hanging indent mirrors how APA sets it. */}
                            <p className="mt-2 max-w-prose pl-6 -indent-6 text-[0.9rem] leading-relaxed text-ink">
                              {ex.text}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    {chapter.points?.length ? (
                      <>
                        <h4 className="mt-6 text-[0.78rem] font-semibold uppercase tracking-[0.13em] text-muted">
                          {chapter.pointsLabel}
                        </h4>
                        <ul className="mt-3 grid max-w-3xl gap-x-8 gap-y-2 sm:grid-cols-2">
                          {chapter.points.map((point) => (
                            <li key={point} className="flex items-start gap-2.5 text-[0.92rem]">
                              <span
                                aria-hidden="true"
                                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brass"
                              />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : null}

                    {chapter.tools?.length ? (
                      <>
                        <h4 className="mt-6 text-[0.78rem] font-semibold uppercase tracking-[0.13em] text-muted">
                          {chapter.toolsLabel}
                        </h4>
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {chapter.tools.map((t) => (
                            <li
                              key={t}
                              className="rounded border border-brass/35 bg-brass/[0.06] px-2.5 py-1 text-[0.83rem] text-body"
                            >
                              {t}
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : null}

                    {chapter.note ? (
                      <p className="mt-6 max-w-prose border-l-2 border-brass pl-3.5 text-[0.88rem] text-muted">
                        {chapter.note}
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <Reveal>
          <div className="mt-10 flex flex-col items-start justify-between gap-6 rounded border border-rule bg-surface p-7 sm:flex-row sm:items-center sm:p-8">
            <div>
              <h3 className="font-serif text-[1.24rem] font-semibold text-ink">
                {thesisAnatomy.cta.title}
              </h3>
              <p className="mt-1.5 max-w-prose text-[0.95rem]">{thesisAnatomy.cta.body}</p>
            </div>
            <ButtonLink href={thesisAnatomy.cta.href} size="lg" className="shrink-0">
              {thesisAnatomy.cta.label} <span aria-hidden="true">&rarr;</span>
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
