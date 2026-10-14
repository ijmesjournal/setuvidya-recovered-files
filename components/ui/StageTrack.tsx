import { cn } from '@/lib/utils';
import type { Stage } from '@/lib/content';
import { Reveal } from './Reveal';

/* -------------------------------------------------------------------------
   A sequence of stages, drawn as a span with piers.

   Numbering is deliberate here: these really are ordered stages, and the
   order is the point. On narrow screens the track turns vertical rather than
   shrinking, because eight horizontal stages are unreadable on a phone.
------------------------------------------------------------------------- */

export function StageTrack({
  stages,
  columns = 4,
  invert = false,
  className,
}: {
  stages: Stage[];
  columns?: 3 | 4;
  invert?: boolean;
  className?: string;
}) {
  const colClass = columns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4';

  return (
    <ol className={cn('grid gap-x-8 gap-y-10 sm:grid-cols-2', colClass, className)}>
      {stages.map((s, i) => (
        <Reveal as="li" key={s.stage} delay={i * 70} className="relative">
          {/* the span: a hairline that runs behind every node in the row */}
          <span
            aria-hidden="true"
            className={cn(
              'absolute left-0 right-0 top-[9px] hidden h-px sm:block',
              invert ? 'bg-white/20' : 'bg-rule',
            )}
          />
          <span
            aria-hidden="true"
            className={cn(
              'relative block h-[18px] w-[18px] rounded-full border-2 bg-paper',
              invert ? 'border-brass bg-ink' : 'border-navy',
              i === stages.length - 1 && (invert ? 'bg-brass' : 'bg-brass border-brass'),
            )}
          />

          <p
            className={cn(
              'mt-5 font-serif text-[1.06rem] font-semibold leading-snug',
              invert ? 'text-white' : 'text-ink',
            )}
          >
            <span className={cn('mr-2 tabular-nums', invert ? 'text-brass' : 'text-brass')}>
              {String(i + 1).padStart(2, '0')}
            </span>
            {s.stage}
          </p>
          <p className={cn('mt-2 text-[0.93rem]', invert ? 'text-white/65' : 'text-body')}>
            {s.note}
          </p>
        </Reveal>
      ))}
    </ol>
  );
}
