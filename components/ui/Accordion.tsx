'use client';

import { useId, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Faq } from '@/lib/content';

/**
 * Native disclosure behaviour built on buttons so it works with keyboard and
 * screen readers. Only the height transition is animated, because that is the
 * one thing the user needs to see change.
 */
export function Accordion({ items, className }: { items: Faq[]; className?: string }) {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();

  return (
    <div className={cn('divide-y divide-rule border-y border-rule', className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${base}-panel-${i}`;
        const buttonId = `${base}-button-${i}`;

        return (
          <div key={item.q}>
            <h3 className="m-0">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-start justify-between gap-6 py-5 text-left transition-colors duration-200 hover:text-indigo"
              >
                <span className="font-sans text-[1.02rem] font-medium leading-snug text-ink">
                  {item.q}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded border transition-colors duration-200',
                    isOpen ? 'border-indigo bg-indigo text-white' : 'border-rule text-navy',
                  )}
                >
                  {isOpen ? <Minus size={15} /> : <Plus size={15} />}
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="pb-6 pr-10"
            >
              <p className="max-w-prose text-[0.97rem]">{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
