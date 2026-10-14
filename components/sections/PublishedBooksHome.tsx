import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container, Section, SectionHeading } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/Reveal';
import { pages } from '@/lib/content';

/* -------------------------------------------------------------------------
   Selected published books, home page.

   A compact index of the same five titles held in
   pages.bookPublication.portfolio — no new content, and none of the
   lightbox, pricing or cart behaviour, which stays on /book-publication.
------------------------------------------------------------------------- */

export function PublishedBooksHome() {
  const portfolio = pages.bookPublication.portfolio;
  const books = portfolio.books.filter((b) => b.title && b.frontImage);
  if (books.length === 0) return null;

  return (
    <Section bordered id="published-books-home">
      <Container>
        <SectionHeading
          kicker={portfolio.kicker}
          title={portfolio.title}
          intro={portfolio.intro}
        />

        <ul className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {books.map((book, i) => (
            <Reveal as="li" key={book.id} delay={i * 60}>
              <Link
                href="/book-publication"
                className="group block rounded-lg border border-rule bg-paper p-4 transition-[border-color,box-shadow,transform] duration-300 ease-sv hover:-translate-y-0.5 hover:border-navy/25 hover:shadow-lift"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={book.frontImage}
                  alt={book.frontAlt}
                  width={900}
                  height={1436}
                  loading="lazy"
                  decoding="async"
                  className="h-auto w-full rounded border border-rule object-cover"
                />
                <p className="mt-3.5 font-serif text-[0.95rem] font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-indigo">
                  {book.title}
                </p>
                <p className="mt-1 text-[0.82rem] text-muted">{book.author}</p>
              </Link>
            </Reveal>
          ))}
        </ul>

        <div className="mt-10 text-center">
          <Link
            href="/book-publication"
            className="inline-flex items-center gap-2 text-[0.95rem] font-medium text-indigo transition-colors duration-200 hover:text-indigo-lift"
          >
            View all published books
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </Section>
  );
}
