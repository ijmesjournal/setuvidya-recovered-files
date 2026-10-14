import Link from 'next/link';
import { cn } from '@/lib/utils';
import { brand } from '@/lib/content';

/**
 * Retained for the favicon, which needs a square standalone glyph. The header
 * and footer use the supplied logo artwork via <Logo> below.
 *
 * The mark is the bridge the name describes: two piers, a span across them,
 * and a raised node at midpoint where knowledge crosses. Drawn in strokes so
 * it reads at 24px in a browser tab as well as at poster size.
 */
export function LogoMark({ className, invert = false }: { className?: string; invert?: boolean }) {
  const line = invert ? '#FFFFFF' : 'rgb(18 49 79)';
  const accent = 'rgb(168 128 44)';

  return (
    <svg
      viewBox="0 0 40 40"
      className={cn('h-9 w-9 shrink-0', className)}
      role="img"
      aria-label={`${brand.short} mark`}
      focusable="false"
    >
      <rect x="0.75" y="0.75" width="38.5" height="38.5" rx="3" fill="none" stroke={line} strokeWidth="1.5" opacity={invert ? 0.5 : 0.28} />
      {/* deck */}
      <line x1="7" y1="27" x2="33" y2="27" stroke={line} strokeWidth="2" strokeLinecap="round" />
      {/* span */}
      <path d="M7 27 C 12 12, 28 12, 33 27" fill="none" stroke={line} strokeWidth="2" strokeLinecap="round" />
      {/* hangers */}
      <line x1="13.5" y1="27" x2="13.5" y2="19.6" stroke={line} strokeWidth="1.2" opacity="0.75" />
      <line x1="26.5" y1="27" x2="26.5" y2="19.6" stroke={line} strokeWidth="1.2" opacity="0.75" />
      {/* piers */}
      <line x1="7" y1="27" x2="7" y2="33" stroke={line} strokeWidth="2" strokeLinecap="round" />
      <line x1="33" y1="27" x2="33" y2="33" stroke={line} strokeWidth="2" strokeLinecap="round" />
      {/* crossing node */}
      <circle cx="20" cy="16.4" r="3.1" fill={accent} />
    </svg>
  );
}

export function Logo({
  invert = false,
  className,
  withTagline = false,
}: {
  invert?: boolean;
  className?: string;
  withTagline?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn('group inline-flex items-center gap-3 rounded', className)}
      aria-label={`${brand.name}, home`}
    >
      {/* The supplied artwork, used as-is. Height is fixed and width follows
          the source, so the logo is never stretched. On the navy header a
          white plate keeps the navy half of the mark legible.
          eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={brand.logo}
        alt={brand.logoAlt}
        width={2171}
        height={724}
        className={cn(
          'w-auto object-contain',
          invert ? 'h-[52px]' : 'h-12',
        )}
      />
      {withTagline ? (
        <span className={cn('text-sm', invert ? 'text-white/70' : 'text-muted')}>
          {brand.tagline}
        </span>
      ) : null}
    </Link>
  );
}
