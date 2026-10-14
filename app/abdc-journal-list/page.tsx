import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { Container, Section } from '@/components/ui/primitives';
import { PageHero } from '@/components/sections/PageHero';
import { AbdcJournalBrowser } from '@/components/journals/AbdcJournalBrowser';
import { abdcJournals } from '@/lib/journals';
import { breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = pageMetadata({
  title: abdcJournals.title,
  description: abdcJournals.intro,
  path: '/abdc-journal-list',
});

const trail = [
  { name: 'Home', href: '/' },
  { name: abdcJournals.title, href: '/abdc-journal-list' },
];

export default function AbdcJournalListPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(trail)),
        }}
      />
      <PageHero
  kicker={abdcJournals.kicker}
  title={abdcJournals.title}
  lede={abdcJournals.intro}
  motif="journal"
  breadcrumb={trail}
/>
      <Section>
        <Container>
          {/* Shown on every visit, not only when the list is empty: indexing
              status changes and must always be confirmed at the source. */}
          <p className="max-w-3xl rounded border-l-2 border-saffron bg-surface p-4 text-[0.9rem] text-body">
            {abdcJournals.verifyNote}
          </p>
          <AbdcJournalBrowser />
        </Container>
      </Section>
    </>
  );
}
