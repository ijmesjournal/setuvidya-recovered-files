import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, CircleAlert } from 'lucide-react';
import { Container, Section } from '@/components/ui/primitives';
import { GuideDiagram } from '@/components/guides/GuideDiagram';
import {
  findGuide,
  guideHref,
  guides,
  neighbours,
  pathwayAccent,
  pathways,
  relatedGuides,
} from '@/lib/guides';
import { breadcrumbSchema } from '@/lib/schema';

type Params = { params: Promise<{ type: string; slug: string }> };

export function generateStaticParams() {
  return guides.map((g) => ({ type: g.type, slug: g.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const resolvedParams = await params;
  const guide = findGuide(resolvedParams.type, resolvedParams.slug);
  if (!guide) return {};
  const path = `/research-guide/${guide.type}/${guide.slug}`;
  return pageMetadata({
    title: guide.seoTitle,
    description: guide.metaDescription,
    path,
    article: {},
  });
}

function Block({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-[0.8rem] font-semibold uppercase tracking-[0.13em] text-muted">
        {heading}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default async function GuidePage({ params }: Params) {
  const resolvedParams = await params;
  const guide = findGuide(resolvedParams.type, resolvedParams.slug);
  if (!guide) notFound();

  const { previous, next, total } = neighbours(guide);
  const related = relatedGuides(guide);
  const accent = pathwayAccent(guide.type);
  const pathway = pathways[guide.type];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: 'Research guide', href: '/research-guide' },
              { name: guide.shortTitle, href: guideHref(guide) },
            ]),
          ),
        }}
      />

      <Section>
        <Container className="max-w-3xl">
          <nav aria-label="Breadcrumb" className="text-[0.86rem] text-muted">
            <Link href="/research-guide" className="text-indigo hover:underline">
              Research guide
            </Link>
            <span aria-hidden="true"> › </span>
            <span aria-current="page" className="text-ink">{guide.shortTitle}</span>
          </nav>

          <p className="mt-7 text-[0.82rem] font-semibold uppercase tracking-[0.13em] text-muted">
            {pathway.label} · Step {guide.order} of {total}
          </p>
          <h1 className="mt-3 text-display">{guide.title}</h1>
          <p className="mt-5 text-lede text-body">{guide.intro}</p>

          <Block heading="What is it?">
            <p className="text-[1.02rem] leading-relaxed">{guide.whatIsIt}</p>
          </Block>

          <Block heading="Why does it matter?">
            <p className="text-[1.02rem] leading-relaxed">{guide.whyItMatters}</p>
          </Block>

          <Block heading="How to do it">
            <ol className="space-y-5">
              {guide.howTo.map((item, i) => (
                <li key={item.step} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 font-serif text-[1.1rem] font-semibold text-saffron-text"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>
                    <span className="block font-medium text-ink">{item.step}</span>
                    <span className="mt-1 block text-[0.96rem]">{item.text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Block>

          <Block heading="The process">
            <GuideDiagram title={guide.diagram.title} nodes={guide.diagram.nodes} accent={accent} />
          </Block>

          <Block heading="Stronger and weaker examples">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-teal/30 bg-teal/[0.05] p-5">
                <p className="flex items-center gap-2 text-[0.82rem] font-semibold uppercase tracking-[0.1em] text-teal">
                  <Check size={15} aria-hidden="true" /> Stronger
                </p>
                <p className="mt-2.5 text-[0.95rem]">{guide.examples.strong}</p>
              </div>
              <div className="rounded-lg border border-rule bg-surface p-5">
                <p className="flex items-center gap-2 text-[0.82rem] font-semibold uppercase tracking-[0.1em] text-muted">
                  <CircleAlert size={15} aria-hidden="true" /> Weaker
                </p>
                <p className="mt-2.5 text-[0.95rem]">{guide.examples.weak}</p>
              </div>
            </div>
          </Block>

          <Block heading="Common mistakes">
            <ul className="space-y-2.5">
              {guide.mistakes.map((m) => (
                <li key={m} className="flex gap-3 text-[0.96rem]">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />
                  {m}
                </li>
              ))}
            </ul>
          </Block>

          <Block heading="Practical checklist">
            <ul className="space-y-2.5">
              {guide.checklist.map((c) => (
                <li key={c} className="flex gap-3 text-[0.96rem]">
                  <Check size={16} aria-hidden="true" className="mt-1 shrink-0 text-teal" />
                  {c}
                </li>
              ))}
            </ul>
          </Block>

          <div className="mt-10 rounded-lg border-l-2 border-saffron bg-surface p-6">
            <p className="text-[0.8rem] font-semibold uppercase tracking-[0.13em] text-muted">
              Key takeaway
            </p>
            <p className="mt-2 font-serif text-[1.1rem] leading-relaxed text-ink">
              {guide.takeaway}
            </p>
          </div>

          <nav
            aria-label="Guide navigation"
            className="mt-12 flex flex-col gap-3 border-t border-rule pt-7 sm:flex-row sm:items-center sm:justify-between"
          >
            {previous ? (
              <Link
                href={guideHref(previous)}
                className="inline-flex items-center gap-2 text-[0.92rem] font-medium text-indigo hover:underline"
              >
                <ArrowLeft size={15} aria-hidden="true" />
                {previous.shortTitle}
              </Link>
            ) : (
              <span />
            )}
            <Link href="/research-guide" className="text-[0.9rem] text-muted hover:text-ink">
              Back to research guide
            </Link>
            {next ? (
              <Link
                href={guideHref(next)}
                className="inline-flex items-center gap-2 text-[0.92rem] font-medium text-indigo hover:underline"
              >
                {next.shortTitle}
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            ) : (
              <span />
            )}
          </nav>

          {related.length ? (
            <section aria-labelledby="related" className="mt-12">
              <h2 id="related" className="text-[0.8rem] font-semibold uppercase tracking-[0.13em] text-muted">
                Related guides
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                {related.map((r) => (
                  <li key={`${r.type}-${r.slug}`}>
                    <Link
                      href={guideHref(r)}
                      className="block h-full rounded-lg border border-rule bg-paper p-4 text-[0.92rem] font-medium text-ink transition-colors duration-200 hover:border-navy/25 hover:text-indigo"
                    >
                      {r.shortTitle}
                      <span className="mt-1 block text-[0.8rem] font-normal text-muted">
                        {pathways[r.type].label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </Container>
      </Section>
    </>
  );
}
