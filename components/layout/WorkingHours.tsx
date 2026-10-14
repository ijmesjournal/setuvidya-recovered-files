import { workingHours } from '@/lib/content';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------
   Working hours.

   A description list is the honest markup here: each day range is the term and
   its opening time is the description, so a screen reader announces them as a
   pair rather than as two loose lines.

   Content comes from content/site.json -> contact.hours, so the schedule is
   written once and read by the contact page, the footer and the JSON-LD.
------------------------------------------------------------------------- */

export function WorkingHours({
  tone = 'light',
  className,
}: {
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const dark = tone === 'dark';

  return (
    <dl className={cn('grid gap-1.5', className)}>
      {/* Stacked rather than justified apart: the day range is too long to sit
          opposite its time in a narrow column, and half-wrapping looked ragged. */}
      {workingHours.schedule.map((row) => (
        <div key={row.days}>
          <dt className={dark ? 'text-white/70' : 'text-body'}>{row.days}</dt>
          <dd
            className={cn(
              row.closed
                ? dark
                  ? 'text-white/55'
                  : 'text-muted'
                : dark
                  ? 'font-medium text-white'
                  : 'font-medium text-ink',
            )}
          >
            {row.time}
          </dd>
        </div>
      ))}
    </dl>
  );
}
