import Link from 'next/link';
import { ButtonLink, Container } from '@/components/ui/primitives';
import { CitationNetworkMotif } from '@/components/motifs/Motifs';
import { serviceGroups } from '@/lib/content';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <section className="relative isolate overflow-hidden bg-paper py-24 lg:py-32">
      <CitationNetworkMotif opacity={0.05} />
      <Container>
        <p className="font-serif text-[3.4rem] leading-none text-brass/80">404</p>
        <h1 className="mt-4 text-display-lg">That page is not here</h1>
        <p className="mt-4 max-w-prose text-lede">
          The link may be out of date, or the page may have moved. These are the places most people
          are looking for.
        </p>

        <ul className="mt-10 grid max-w-3xl gap-x-10 gap-y-4 sm:grid-cols-2">
          {serviceGroups.map((g) => (
            <li key={g.id} className="border-t border-rule pt-3">
              <Link href={g.href} className="font-medium text-ink transition-colors hover:text-indigo">
                {g.title}
              </Link>
              <p className="mt-1 text-[0.9rem] text-muted">{g.blurb}</p>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/">Back to home</ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Contact us
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
