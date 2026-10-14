'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Container, Section, SectionHeading } from '@/components/ui/primitives';
import { bookPortfolio, type PublishedBook } from '@/lib/content';
import {
  commerce,
  discountAmount,
  findProduct,
  formatMoney,
  hasDiscount,
  unitPrice,
} from '@/lib/commerce';
import { PriceBlock } from '@/components/commerce/PriceBlock';
import { useCart } from '@/components/commerce/CartContext';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------
   Selected published books.

   Images are the actual pages of the printed books, rendered from the
   publisher's PDFs. Nothing here is a generated or substitute cover.

   The data holds ten slots; entries without both a title and a front image
   are skipped, so books 6 to 10 can be filled in later with no code change.
------------------------------------------------------------------------- */

const isFilled = (b: PublishedBook) => Boolean(b.title && b.frontImage);

export function BookPortfolio() {
  const cart = useCart();
  const books = bookPortfolio.books.filter(isFilled);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [side, setSide] = useState<'front' | 'back'>('front');
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpenIndex(null);
    lastFocused.current?.focus();
  }, []);

  const open = (i: number) => {
    lastFocused.current = document.activeElement as HTMLElement;
    setSide('front');
    setOpenIndex(i);
  };

  const step = useCallback(
    (delta: number) => {
      setOpenIndex((i) => (i === null ? i : (i + delta + books.length) % books.length));
      setSide('front');
    },
    [books.length],
  );

  // Escape closes; arrows move between books; Tab is trapped inside the dialog.
  useEffect(() => {
    if (openIndex === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); return; }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); return; }
      if (e.key !== 'Tab') return;

      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };

    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    // Move focus into the dialog once it exists.
    const t = window.setTimeout(() => {
      dialogRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    }, 0);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      window.clearTimeout(t);
    };
  }, [openIndex, close, step]);

  if (books.length === 0) return null;

  const active = openIndex === null ? null : books[openIndex];

  return (
    <Section tone="surface" bordered id="published-books">
      <Container>
        <SectionHeading
          kicker={bookPortfolio.kicker}
          title={bookPortfolio.title}
          intro={bookPortfolio.intro}
        />

        <ul className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((b, i) => (
            <li key={b.id}>
              <article className="group flex h-full flex-col">
                <button
                  type="button"
                  onClick={() => open(i)}
                  aria-label={`View ${b.title}, front cover and author page`}
                  className={cn(
                    'relative block w-full overflow-hidden rounded border border-rule bg-paper',
                    'transition-[box-shadow,transform,border-color] duration-300 ease-sv',
                    'hover:-translate-y-1 hover:border-navy/30 hover:shadow-lift',
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.frontImage}
                    alt={b.frontAlt || `Front cover of ${b.title}`}
                    width={900}
                    height={1436}
                    loading="lazy"
                    decoding="async"
                    className="h-auto w-full"
                  />
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute inset-x-0 bottom-0 flex items-center justify-center bg-ink/85 py-2.5',
                      'text-[0.85rem] font-medium text-white opacity-0 transition-opacity duration-300',
                      'group-hover:opacity-100 group-focus-within:opacity-100',
                    )}
                  >
                    {bookPortfolio.viewLabel}
                  </span>
                </button>

                <div className="mt-4 flex-1">
                  <h3 className="font-serif text-[1.06rem] font-semibold leading-snug text-ink">
                    {b.title}
                  </h3>
                  {b.subtitle ? <p className="mt-1 text-[0.9rem] text-muted">{b.subtitle}</p> : null}

                  <dl className="mt-3 space-y-1 text-[0.88rem]">
                    <div className="flex gap-2">
                      <dt className="sr-only">Author</dt>
                      <dd>{b.author}</dd>
                    </div>
                    {b.coAuthor ? (
                      <div className="flex gap-2">
                        <dt className="text-muted">Co-author</dt>
                        <dd>{b.coAuthor}</dd>
                      </div>
                    ) : null}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-muted">
                      {b.year ? <span>{b.year}</span> : null}
                      {b.publisher ? <span>{b.publisher}</span> : null}
                    </div>
                    {b.isbn ? (
                      <div className="flex gap-2 text-muted">
                        <dt>ISBN</dt>
                        <dd className="tabular-nums">{b.isbn}</dd>
                      </div>
                    ) : null}
                  </dl>

                  {/* Ordering. "View book" above is unchanged. */}
                  <div className="mt-5">
                    <PriceBlock product={findProduct(b.id)} />
                    <button
                      type="button"
                      onClick={() => {
                        const product = findProduct(b.id);
                        if (product) cart.openBuy(product);
                      }}
                      className="mt-3 inline-flex items-center justify-center rounded border border-navy/25 px-4 py-2.5 text-[0.88rem] font-medium text-navy transition-colors duration-200 hover:border-navy/60 hover:bg-navy/[0.04]"
                    >
                      {commerce.labels.buy}
                    </button>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Container>

      {/* ------------------------------------------------------- lightbox */}
      {active ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-8">
          <div className="absolute inset-0 bg-ink/80" onClick={close} aria-hidden="true" />

          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${active.title} — front cover and author page`}
            className="relative flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded bg-paper shadow-lift"
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-rule px-5 py-4 sm:px-7">
              <div className="min-w-0">
                <h3 className="truncate font-serif text-[1.1rem] font-semibold text-ink">
                  {active.title}
                </h3>
                <p className="mt-0.5 text-[0.87rem] text-muted">
                  {active.author}
                  {active.coAuthor ? ` · with ${active.coAuthor}` : ''}
                  {active.year ? ` · ${active.year}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                data-autofocus
                aria-label="Close"
                className="-mr-2 -mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded text-ink transition-colors hover:bg-surface"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {/* front / back switch */}
            <div
              role="tablist"
              aria-label="Book view"
              className="flex shrink-0 gap-1 border-b border-rule px-5 py-3 sm:px-7"
            >
              {(['front', 'back'] as const).map((s) => (
                <button
                  key={s}
                  role="tab"
                  type="button"
                  aria-selected={side === s}
                  onClick={() => setSide(s)}
                  className={cn(
                    'rounded px-3.5 py-1.5 text-[0.88rem] font-medium transition-colors duration-200',
                    side === s ? 'bg-indigo text-white' : 'text-body hover:bg-surface',
                  )}
                >
                  {s === 'front' ? 'Front cover' : 'About the author'}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto bg-surface p-5 sm:p-7">
              {/* Both pages are in the DOM so the second is already decoded when
                  the reader switches; only the selected one is shown. */}
              {(['front', 'back'] as const).map((s) => (
                <div key={s} hidden={side !== s}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s === 'front' ? active.frontImage : active.backImage}
                    alt={
                      (s === 'front' ? active.frontAlt : active.backAlt) ||
                      `${s === 'front' ? 'Front cover' : 'Author page'} of ${active.title}`
                    }
                    width={900}
                    height={1436}
                    className="mx-auto h-auto w-full max-w-md rounded border border-rule bg-paper"
                  />
                </div>
              ))}

              <dl className="mx-auto mt-6 grid max-w-md gap-y-1.5 text-[0.88rem]">
                {active.publisher ? (
                  <div className="flex gap-3">
                    <dt className="w-24 shrink-0 text-muted">Publisher</dt>
                    <dd>{active.publisher}</dd>
                  </div>
                ) : null}
                {active.isbn ? (
                  <div className="flex gap-3">
                    <dt className="w-24 shrink-0 text-muted">ISBN</dt>
                    <dd className="tabular-nums">{active.isbn}</dd>
                  </div>
                ) : null}
                {bookPortfolio.displayMrp && active.mrp ? (
                  <div className="flex gap-3">
                    <dt className="w-24 shrink-0 text-muted">MRP</dt>
                    <dd>{formatMoney(active.mrp)}</dd>
                  </div>
                ) : null}
              </dl>
            </div>

            {books.length > 1 ? (
              <div className="flex shrink-0 items-center justify-between border-t border-rule px-5 py-3 sm:px-7">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="inline-flex items-center gap-1.5 rounded px-2 py-2 text-[0.9rem] font-medium text-body transition-colors hover:text-indigo"
                >
                  <ChevronLeft size={16} aria-hidden="true" /> Previous
                </button>
                <p aria-live="polite" className="text-[0.85rem] text-muted">
                  {(openIndex ?? 0) + 1} of {books.length}
                </p>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="inline-flex items-center gap-1.5 rounded px-2 py-2 text-[0.9rem] font-medium text-body transition-colors hover:text-indigo"
                >
                  Next <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </Section>
  );
}
