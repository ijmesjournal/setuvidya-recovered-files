import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/* ---------------------------------------------------------------- Container */

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mx-auto w-full max-w-shell px-5 sm:px-8 lg:px-10', className)}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ Section */

type Tone = 'paper' | 'surface' | 'ink';

const toneClass: Record<Tone, string> = {
  paper: 'bg-paper',
  surface: 'bg-surface',
  ink: 'bg-ink text-white/75',
};

export function Section({
  children,
  className,
  tone = 'paper',
  id,
  bordered = false,
  size = 'default',
}: {
  children: ReactNode;
  className?: string;
  tone?: Tone;
  id?: string;
  bordered?: boolean;
  size?: 'default' | 'tight' | 'loose';
}) {
  const pad =
    size === 'tight'
      ? 'py-14 sm:py-16'
      : size === 'loose'
        ? 'py-20 sm:py-28 lg:py-32'
        : 'py-16 sm:py-20 lg:py-24';

  return (
    <section
      id={id}
      className={cn(
        'relative isolate overflow-hidden',
        pad,
        toneClass[tone],
        bordered && 'border-t border-rule',
        className,
      )}
    >
      {children}
    </section>
  );
}

/* ---------------------------------------------------------- Section heading */

/**
 * The kicker is a structural marker, not decoration: it names which part of
 * the academic journey the section belongs to. Sentence case, with a short
 * brass rule rather than tracked-out capitals.
 */
export function SectionHeading({
  kicker,
  title,
  intro,
  align = 'left',
  invert = false,
  as: Tag = 'h2',
  className,
}: {
  kicker?: string;
  title: string;
  intro?: string;
  align?: 'left' | 'center';
  invert?: boolean;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'max-w-3xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {kicker ? (
        <p
          className={cn(
            'mb-4 flex items-center gap-3 text-micro font-semibold',
            // Brass at label size only clears 4.8:1 on ink and 3.6:1 on white,
            // so each surface gets the tone that actually passes on it.
            invert ? 'text-brass-on-dark' : 'text-brass-text',
            align === 'center' && 'justify-center',
          )}
        >
          <span aria-hidden="true" className="h-px w-7 bg-brass/70" />
          {kicker}
        </p>
      ) : null}

      <Tag
        className={cn(
          Tag === 'h1' ? 'text-display-lg' : 'text-display-md',
          invert && 'text-white',
        )}
      >
        {title}
      </Tag>

      {intro ? (
        <p
          className={cn(
            'mt-4 max-w-prose text-lede',
            invert ? 'text-white/70' : 'text-body',
            align === 'center' && 'mx-auto',
          )}
        >
          {intro}
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------- Button */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'onDark';

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded font-sans text-[0.95rem] font-medium ' +
  'transition-[background-color,color,border-color,box-shadow,transform] duration-200 ease-sv ' +
  'disabled:cursor-not-allowed disabled:opacity-55 active:translate-y-px';

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-indigo text-white shadow-panel hover:bg-indigo-lift hover:shadow-lift',
  secondary:
    'border border-navy/25 bg-transparent text-navy hover:border-navy/60 hover:bg-navy/[0.04]',
  ghost: 'text-indigo hover:text-indigo-lift hover:underline underline-offset-4',
  onDark:
    'border border-white/30 bg-transparent text-white hover:border-white/70 hover:bg-white/10',
};

const buttonSizes = {
  md: 'px-5 py-3',
  lg: 'px-7 py-3.5 text-base',
  sm: 'px-4 py-2 text-sm',
};

export function ButtonLink({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...rest
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: keyof typeof buttonSizes;
  className?: string;
} & Omit<React.ComponentProps<typeof Link>, 'href' | 'className'>) {
  const external = href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:');
  const classes = cn(
    buttonBase,
    variant !== 'ghost' && buttonSizes[size],
    buttonVariants[variant],
    className,
  );

  if (external) {
    return (
      <a href={href} className={classes} rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: keyof typeof buttonSizes;
}) {
  return (
    <button
      className={cn(buttonBase, buttonSizes[size], buttonVariants[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------- Panel */

/**
 * The default surface across the site is a hairline panel, not a shadowed
 * card. Elevation is reserved for panels that are actually interactive.
 */
export function Panel({
  children,
  className,
  interactive = false,
  id,
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  /** Anchor target, e.g. the per-service links on the research & thesis page. */
  id?: string;
  as?: 'div' | 'li' | 'article';
}) {
  return (
    <Tag
      id={id}
      className={cn(
        'relative rounded border border-rule bg-paper',
        interactive &&
          'group transition-[border-color,box-shadow,transform] duration-300 ease-sv ' +
            'hover:-translate-y-0.5 hover:border-navy/30 hover:shadow-lift ' +
            'focus-within:border-navy/30 focus-within:shadow-lift',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/* ---------------------------------------------------------------- Hairline  */

export function Hairline({ className }: { className?: string }) {
  return <hr className={cn('border-0 border-t border-rule', className)} aria-hidden="true" />;
}
