import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { Container, Section } from '@/components/ui/primitives';
import { PageHero } from '@/components/sections/PageHero';
import { UpdatesBrowser } from '@/components/updates/UpdatesBrowser';
import { allArticlesAreDemo, articles, educationUpdates } from '@/lib/articles';
import { breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = pageMetadata({
  title: educationUpdates.title,
  description: educationUpdates.intro,
  path: '/education-updates',
});

const trail = [
  { name: 'Home', href: '/' },
  { name: educationUpdates.title, href: '/education-updates' },
];

export default function EducationUpdatesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(trail)),
        }}
      />
      <PageHero
  kicker={educationUpdates.kicker}
  title={educationUpdates.title}
  lede={educationUpdates.intro}
  motif="signal"
  breadcrumb={trail}
/>
      <Section>
        <Container>
          {allArticlesAreDemo ? (
            <p className="max-w-3xl rounded border-l-2 border-saffron bg-surface p-4 text-[0.9rem] text-body">
              {educationUpdates.demoNotice}
            </p>
          ) : null}
          {/* The cards are h3; without this the page would jump h1 -> h3. */}
          <h2 className="sr-only">All updates</h2>
          <UpdatesBrowser list={articles} pageSize={educationUpdates.perPage} />
        </Container>
      </Section>
    </>
  );
}
