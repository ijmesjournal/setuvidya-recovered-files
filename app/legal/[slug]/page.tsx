import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { notFound } from 'next/navigation';
import { PageHero } from '@/components/sections/PageHero';
import { Container, Section } from '@/components/ui/primitives';
import { brand, legal, resolveContactTokens } from '@/lib/content';
import { breadcrumbSchema } from '@/lib/schema';

type Params = { params: Promise<{ slug: string }> };

const find = (slug: string) => legal.documents.find((d) => d.slug === slug);

export function generateStaticParams() {
  return legal.documents.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const resolvedParams = await params;
  const doc = find(resolvedParams.slug);
  if (!doc) return {};
  return pageMetadata({
    title: doc.title,
    description: `${doc.title} for SetuVidya Consultancy.`,
    path: `/legal/${doc.slug}`,
  });
}

export default async function LegalPage({ params }: Params) {
  const resolvedParams = await params;
  const doc = find(resolvedParams.slug);
  if (!doc) notFound();

  const trail = [
    { name: 'Home', href: '/' },
    { name: doc.title, href: `/legal/${doc.slug}` },
  ];

  return (
    <>
      <PageHero
        kicker="Legal"
        title={doc.title}
        // An unset date renders no date line rather than "[ADD …]".
        lede={
          doc.updated.trim().startsWith('[')
            ? `${doc.title} for ${brand.name}.`
            : `Last updated: ${doc.updated}`
        }
        motif="document"
        breadcrumb={trail}
      />

      <Section>
        <Container>
          <div className="sv-prose max-w-prose space-y-10">
            {/* A section whose body is still a bracketed internal note is
                omitted entirely: an empty heading or a visible "[ADD …]" both
                read worse than the section simply not being there yet. */}
            {doc.sections
              .filter((s) => !s.body.trim().startsWith('['))
              .map((s) => (
              <div key={s.heading}>
                <h2 className="text-display-sm">{s.heading}</h2>
                <p className="mt-3">{resolveContactTokens(s.body)}</p>
              </div>
            ))}
          </div>

          {doc.slug === 'disclaimer' ? (
            <ul className="mt-12 max-w-prose space-y-3 border-t border-rule pt-8">
              {legal.integrity.points.map((p) => (
                <li key={p} className="flex gap-3 text-[0.95rem]">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
                  {p}
                </li>
              ))}
            </ul>
          ) : null}
        </Container>
      </Section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(trail)) }}
      />
    </>
  );
}
