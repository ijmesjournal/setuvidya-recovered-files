import { cn } from '@/lib/utils';

/* A real flow diagram: each node is a stage in the process being explained,
   connected in order. Semantic list underneath, so screen readers get the
   sequence rather than a decorative graphic. */
export function GuideDiagram({
  title,
  nodes,
  accent = 'royal',
}: {
  title: string;
  nodes: string[];
  accent?: 'royal' | 'teal';
}) {
  const bar = accent === 'royal' ? 'bg-royal' : 'bg-teal';
  const tone =
    accent === 'royal'
      ? 'border-royal/25 bg-royal/[0.06] text-royal'
      : 'border-teal/25 bg-teal/[0.06] text-teal';

  return (
    <figure className="rounded-lg border border-rule bg-surface p-6 sm:p-8">
      <figcaption className="text-[0.78rem] font-semibold uppercase tracking-[0.13em] text-muted">
        {title}
      </figcaption>
      <ol className="mt-5 flex flex-col gap-0">
        {nodes.map((node, i) => (
          <li key={node} className="flex flex-col">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={cn(
                  'grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[0.8rem] font-semibold tabular-nums',
                  tone,
                )}
              >
                {i + 1}
              </span>
              <span className="text-[0.95rem] font-medium text-ink">{node}</span>
            </div>
            {i < nodes.length - 1 ? (
              <span aria-hidden="true" className={cn('ml-4 h-5 w-px', bar, 'opacity-40')} />
            ) : null}
          </li>
        ))}
      </ol>
    </figure>
  );
}
