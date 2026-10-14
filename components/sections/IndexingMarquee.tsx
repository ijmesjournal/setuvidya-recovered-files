import { Container, Section } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/Reveal';
import { indexing, journalConfigured, journalUrl } from '@/lib/content';

/* -------------------------------------------------------------------------
   Publication & Indexing.

   Four items, each the supplied logo file unmodified: height is set and width
   follows the source, so none is stretched or cropped.

   Each note tells the reader to confirm status at the source. Nothing here
   states or implies that SetuVidya is indexed by, affiliated with or endorsed
   by Scopus, Web of Science or ABDC.
------------------------------------------------------------------------- */

export function IndexingMarquee() {
  const items = indexing.items;
  if (items.length === 0) return null;

  return (
    <Section tone="surface" bordered id="publication-indexing">
      <Container>
        <h2 className="text-[0.8rem] font-semibold uppercase tracking-[0.13em] text-muted">
          {indexing.title}
        </h2>

        <ul className="mt-8 grid grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-4">
          {items.map((item, i) => {
            const live = item.external && journalConfigured;
            const inner = (
              <>
                <span className="grid h-[58px] place-items-center rounded border border-rule bg-paper px-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.file}
                    alt={item.name}
                    width={item.width}
                    height={item.height}
                    loading="lazy"
                    decoding="async"
                    style={{ maxHeight: `${item.maxHeight ?? 34}px` }}
                    className="w-auto max-w-full object-contain"
                  />
                </span>
                {item.label ? (
                  <span className="mt-3 block text-[0.88rem] font-semibold text-ink">{item.label}</span>
                ) : null}
                <span className={`${item.label ? 'mt-1' : 'mt-3'} block text-[0.82rem] leading-relaxed text-muted`}>
                  {item.note}
                </span>
              </>
            );
            return (
              <Reveal as="li" key={item.name} delay={i * 60}>
                {live ? (
                  <a
                    href={journalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded transition-opacity duration-200 hover:opacity-90"
                  >
                    {inner}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  inner
                )}
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
