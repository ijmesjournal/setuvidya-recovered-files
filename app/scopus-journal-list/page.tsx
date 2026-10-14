import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { Container, Section } from '@/components/ui/primitives';
import { PageHero } from '@/components/sections/PageHero';
import { ScopusJournalBrowser } from '@/components/journals/ScopusJournalBrowser';
import { scopusJournals } from '@/lib/journals';
import { breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = pageMetadata({
  title: scopusJournals.title,
  description: `Scopus journal list: ${scopusJournals.intro}`,
  path: '/scopus-journal-list',
});

const trail = [
  { name: 'Home', href: '/' },
  { name: scopusJournals.title, href: '/scopus-journal-list' },
];

export default function ScopusJournalListPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(trail)),
        }}
      />
      <PageHero
        kicker={scopusJournals.kicker}
        title={scopusJournals.title}
        lede={scopusJournals.intro}
        motif="journal"
        breadcrumb={trail}
      />
      <Section>
        <Container>
          {/* Shown on every visit, not only when the list is empty: indexing
              status changes and must always be confirmed at the source. */}
          <p className="max-w-3xl rounded border-l-2 border-saffron bg-surface p-4 text-[0.9rem] text-body">
            {scopusJournals.verifyNote}
          </p>
          <ScopusJournalBrowser />
        </Container>
      </Section>
    </>
  );
}
