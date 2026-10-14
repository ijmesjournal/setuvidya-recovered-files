import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { Container, Section } from '@/components/ui/primitives';
import { PageHero } from '@/components/sections/PageHero';
import { SciJournalBrowser } from '@/components/journals/SciJournalBrowser';
import { sciJournals } from '@/lib/journals';
import { breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = pageMetadata({
  title: sciJournals.title,
  description: `SCI / SCIE journal list: ${sciJournals.intro}`,
  path: '/sci-journal-list',
});

const trail = [
  { name: 'Home', href: '/' },
  { name: sciJournals.title, href: '/sci-journal-list' },
];

export default function SciJournalListPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(trail)),
        }}
      />
      <PageHero
        kicker={sciJournals.kicker}
        title={sciJournals.title}
        lede={sciJournals.intro}
        motif="journal"
        breadcrumb={trail}
      />
      <Section>
        <Container>
          {/* Shown on every visit, not only when the list is empty: indexing
              status changes and must always be confirmed at the source. */}
          <p className="max-w-3xl rounded border-l-2 border-saffron bg-surface p-4 text-[0.9rem] text-body">
            {sciJournals.verifyNote}
          </p>
          <SciJournalBrowser />
        </Container>
      </Section>
    </>
  );
}
