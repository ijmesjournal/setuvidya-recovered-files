'use client';

import { useId, useState } from 'react';
import { Atom, ChevronDown, Cpu, Library, LineChart, ShieldAlert } from 'lucide-react';
import {
  ButtonLink,
  Container,
  Section,
  SectionHeading,
} from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/Reveal';
import { DocumentOutlineMotif } from '@/components/motifs/Motifs';
import { researchDomains, type ResearchDomain } from '@/lib/content';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------
   Research domains.

   Four cards, each a disclosure. The first six subjects and the intro are
   always visible; the rest of the subjects and the tooling sit behind an
   "Explore domains" button. Nothing is hover-only, and every hidden panel is
   wired with aria-expanded / aria-controls, so the content is reachable by
   keyboard and announced by a screen reader.

   Wording is deliberately bounded: analysis, methodology, literature and
   documentation. No laboratory work, no fieldwork, no outcome guarantees.
------------------------------------------------------------------------- */

const domainIcons = {
  management: LineChart,
  humanities: Library,
  science: Atom,
  technical: Cpu,
} as const;

const VISIBLE_SUBJECTS = 6;

function DomainCard({ domain, index }: { domain: ResearchDomain; index: number }) {
  const [open, setOpen] = useState(false);
  const panelId = `${useId()}-domain-panel`;
  const Icon = domainIcons[domain.icon] ?? LineChart;

  const shown = domain.subjects.slice(0, VISIBLE_SUBJECTS);
  const hidden = domain.subjects.slice(VISIBLE_SUBJECTS);
  const hasMore = hidden.length > 0 || Boolean(domain.tools?.length) || Boolean(domain.scopeNote);

  return (
    <Reveal as="li" delay={index * 70} className="h-full">
      <article className="flex h-full flex-col rounded border border-rule bg-paper p-7 transition-[border-color,box-shadow] duration-300 ease-sv hover:border-navy/25 hover:shadow-lift">
        <span
          aria-hidden="true"
          className="grid h-11 w-11 place-items-center rounded border border-rule bg-surface text-navy"
        >
          <Icon size={20} strokeWidth={1.6} />
        </span>

        <h3 className="mt-5 font-serif text-[1.14rem] font-semibold leading-snug text-ink">
          {domain.title}
        </h3>
        <p className="mt-2.5 text-[0.93rem] leading-relaxed">{domain.intro}</p>

        <h4 className="mt-6 text-[0.78rem] font-semibold uppercase tracking-[0.13em] text-muted">
          {researchDomains.subjectsLabel}
        </h4>
        <ul className="mt-3 flex flex-wrap gap-2">
          {shown.map((s) => (
            <li
              key={s}
              className="rounded border border-rule bg-surface/70 px-2.5 py-1 text-[0.83rem] text-body"
            >
              {s}
            </li>
          ))}
          {!open && hidden.length > 0 ? (
            <li className="px-1 py-1 text-[0.83rem] text-muted">+{hidden.length} more</li>
          ) : null}
        </ul>

        {hasMore ? (
          <>
            <div id={panelId} hidden={!open}>
              {hidden.length > 0 ? (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {hidden.map((s) => (
                    <li
                      key={s}
                      className="rounded border border-rule bg-surface/70 px-2.5 py-1 text-[0.83rem] text-body"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              ) : null}

              {domain.tools?.length ? (
                <>
                  <h4 className="mt-6 text-[0.78rem] font-semibold uppercase tracking-[0.13em] text-muted">
                    {domain.toolsLabel}
                  </h4>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {domain.tools.map((t) => (
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

              {domain.scopeNote ? (
                <p className="mt-5 border-l-2 border-brass pl-3.5 text-[0.87rem] text-muted">
                  {domain.scopeNote}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((v) => !v)}
              className="mt-6 inline-flex items-center gap-1.5 self-start rounded text-[0.88rem] font-medium text-indigo transition-colors duration-200 hover:text-indigo-lift"
            >
              {open ? researchDomains.collapseLabel : researchDomains.expandLabel}
              <ChevronDown
                size={14}
                aria-hidden="true"
                className={cn('transition-transform duration-200', open && 'rotate-180')}
              />
            </button>
          </>
        ) : null}
      </article>
    </Reveal>
  );
}

export function ResearchDomains() {
  return (
    <Section tone="surface" bordered id="research-domains">
      <DocumentOutlineMotif opacity={0.03} />
      <Container>
        <SectionHeading
          kicker={researchDomains.kicker}
          title={researchDomains.title}
          intro={researchDomains.subtitle}
        />

        <ul className="mt-12 grid gap-6 lg:grid-cols-2">
          {researchDomains.categories.map((d, i) => (
            <DomainCard key={d.id} domain={d} index={i} />
          ))}
        </ul>

        <Reveal>
          <div className="mt-10 flex items-start gap-4 rounded border-l-2 border-brass bg-paper p-6">
            <ShieldAlert size={20} className="mt-0.5 shrink-0 text-brass" aria-hidden="true" />
            <p className="max-w-3xl text-[0.93rem]">{researchDomains.note}</p>
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-10 flex flex-col items-start justify-between gap-6 rounded border border-rule bg-paper p-7 sm:flex-row sm:items-center sm:p-8">
            <div>
              <h3 className="font-serif text-[1.24rem] font-semibold text-ink">
                {researchDomains.cta.title}
              </h3>
              <p className="mt-1.5 text-[0.95rem]">{researchDomains.cta.body}</p>
            </div>
            <ButtonLink href={researchDomains.cta.href} size="lg" className="shrink-0">
              {researchDomains.cta.label} <span aria-hidden="true">&rarr;</span>
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
