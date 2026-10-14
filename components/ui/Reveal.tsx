'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * A quiet fade-and-rise on first scroll into view.
 * Content is visible by default if JavaScript never runs, and the CSS in
 * globals.css disables the movement entirely under prefers-reduced-motion.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'li' | 'article' | 'section';
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            observer.unobserve(entry.target);
          }
        });
      },
      // threshold 0, not 0.05: on a phone a section can be taller than the
      // viewport, so requiring 5% of it to be visible may never be satisfiable
      // and the section would stay hidden forever.
      // threshold 0, not 0.05: on a phone a section can be taller than
      // the viewport, so requiring a percentage of it to be visible may
      // never be satisfiable and it would stay hidden forever.
      { rootMargin: '0px 0px -8% 0px', threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const Element = Tag as React.ElementType;

  return (
    <Element
      ref={ref as React.Ref<HTMLElement>}
      data-shown={shown ? 'true' : 'false'}
      style={{ animationDelay: `${delay}ms` }}
      className={cn('sv-reveal', className)}
    >
      {children}
    </Element>
  );
}
