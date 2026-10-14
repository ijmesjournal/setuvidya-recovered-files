import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container, Section, SectionHeading } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/Reveal';
import { home } from '@/lib/content';

/* Short previews of Publication, SD Publication House and University Admission.
   Each carries its own page's title and lede, so nothing is rewritten here and
   the detail stays on the dedicated page. */
export function PagePreviews() {
  const previews = home.previews;
  if (!previews?.length) return null;

  return (
    <Section tone="surface" bordered id="page-previews">
      <Container>
        <SectionHeading kicker="What we support" title="Where SetuVidya helps" />
        <ul className="mt-10 grid gap-6 lg:grid-cols-3">
          {previews.map((p, i) => (
            <Reveal as="li" key={p.href} delay={i * 70} className="h-full">
              <div className="flex h-full flex-col rounded-lg border border-rule bg-paper p-6 sm:p-7">
                <p className="text-micro font-semibold uppercase text-brass-text">{p.kicker}</p>
                <h3 className="mt-3 font-serif text-[1.12rem] font-semibold leading-snug text-ink">
                  {p.title}
                </h3>
                <p className="mt-3 flex-1 text-[0.93rem]">{p.body}</p>
                <Link
                  href={p.href}
                  className="mt-6 inline-flex items-center gap-2 text-[0.9rem] font-medium text-indigo hover:underline"
                >
                  {p.ctaLabel}
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
