import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { ButtonLink, Container } from '@/components/ui/primitives';
import {
  CampusArcadeMotif,
  CitationNetworkMotif,
  DocumentOutlineMotif,
  JournalColumnsMotif,
  PageStackMotif,
  SignalArcsMotif,
} from '@/components/motifs/Motifs';

export type MotifKey =
  | 'network'
  | 'document'
  | 'journal'
  | 'book'
  | 'campus'
  | 'signal';

const motifs: Record<MotifKey, (props: { opacity?: number }) => JSX.Element> = {
  network: (p) => <CitationNetworkMotif {...p} />,
  document: (p) => <DocumentOutlineMotif {...p} />,
  journal: (p) => <JournalColumnsMotif {...p} />,
  book: (p) => <PageStackMotif {...p} />,
  campus: (p) => <CampusArcadeMotif {...p} />,
  signal: (p) => <SignalArcsMotif {...p} />,
};

export function PageHero({
  kicker,
  title,
  lede,
  cta,
  motif,
  breadcrumb,
  children,
}: {
  kicker: string;
  title: string;
  lede: string;
  cta?: { label: string; href: string };
  motif: MotifKey;
  breadcrumb: { name: string; href: string }[];
  children?: ReactNode;
}) {
  const Motif = motifs[motif];

  return (
    <section className="relative isolate overflow-hidden border-b border-rule bg-paper">
      {Motif({ opacity: 0.06 })}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-surface/70 to-paper"
      />

      <Container className="py-14 sm:py-20 lg:py-24">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-1.5 text-[0.85rem] text-muted">
            {breadcrumb.map((crumb, i) => (
              <li key={crumb.href} className="flex items-center gap-1.5">
                {i > 0 ? <ChevronRight size={13} aria-hidden="true" className="text-rule" /> : null}
                {i === breadcrumb.length - 1 ? (
                  <span aria-current="page" className="text-body">
                    {crumb.name}
                  </span>
                ) : (
                  <Link href={crumb.href} className="transition-colors hover:text-indigo">
                    {crumb.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <p className="mb-5 flex items-center gap-3 text-micro font-semibold text-brass-text">
          <span aria-hidden="true" className="h-px w-7 bg-brass/70" />
          {kicker}
        </p>

        <h1 className="max-w-4xl text-display-lg">{title}</h1>
        <p className="mt-5 max-w-prose text-lede text-body">{lede}</p>

        {cta ? (
          <div className="mt-8">
            <ButtonLink href={cta.href} size="lg">
              {cta.label}
            </ButtonLink>
          </div>
        ) : null}

        {children}
      </Container>
    </section>
  );
}
