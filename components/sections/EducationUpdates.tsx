import { ButtonLink, Container, Section, SectionHeading } from '@/components/ui/primitives';
import { UpdatesBrowser } from '@/components/updates/UpdatesBrowser';
import { allArticlesAreDemo, articles, educationUpdates } from '@/lib/articles';

/* Home section. Shows the newest `homeCount` articles; ordering and content
   come entirely from the data, so a new entry surfaces automatically. */
export function EducationUpdates() {
  if (articles.length === 0) return null;
  const latest = articles.slice(0, educationUpdates.homeCount);

  return (
    <Section tone="surface" bordered id="education-updates">
      <Container>
        <SectionHeading
          kicker={educationUpdates.kicker}
          title={educationUpdates.title}
          intro={educationUpdates.intro}
        />

        {allArticlesAreDemo ? (
          <p className="mt-6 max-w-3xl rounded border-l-2 border-saffron bg-paper p-4 text-[0.9rem] text-body">
            {educationUpdates.demoNotice}
          </p>
        ) : null}

        <UpdatesBrowser list={latest} />

        <div className="mt-10 text-center">
          <ButtonLink href="/education-updates" variant="secondary">
            {educationUpdates.viewAllLabel} <span aria-hidden="true">&rarr;</span>
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}
