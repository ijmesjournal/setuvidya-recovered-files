import { commerce, discountAmount, formatMoney, hasDiscount, unitPrice, type Product } from '@/lib/commerce';
import { bookPortfolio } from '@/lib/content';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------
   MRP, discount badge and selling price.

   One component for every place a price appears, reading the derived value
   from lib/commerce.ts. No component computes or hard-codes an amount.
------------------------------------------------------------------------- */

export function PriceBlock({
  product,
  size = 'sm',
  className,
}: {
  product: Product | undefined;
  size?: 'sm' | 'lg';
  className?: string;
}) {
  const price = product ? unitPrice(product) : null;
  const formatted = formatMoney(price);

  if (!formatted) {
    return (
      <p className={cn('text-[0.88rem] text-muted', className)}>
        {commerce.priceUnavailableLabel}
      </p>
    );
  }

  const showMrp = product ? hasDiscount(product) : false;
  const saved = product ? discountAmount(product) : null;

  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2.5 gap-y-1', className)}>
      <span
        className={cn(
          'font-semibold text-ink',
          size === 'lg' ? 'text-[1.25rem]' : 'text-[1.02rem]',
        )}
      >
        {formatted}
      </span>

      {showMrp && product ? (
        <>
          <span className="text-[0.88rem] text-muted line-through">
            {formatMoney(product.mrp)}
          </span>
          {typeof product.discountPercent === 'number' ? (
            <span className="rounded border border-brass/40 bg-brass/[0.08] px-1.5 py-0.5 text-[0.74rem] font-semibold uppercase tracking-[0.04em] text-brass-text">
              {product.discountPercent}% {bookPortfolio.discountLabelSuffix}
            </span>
          ) : null}
          {saved ? (
            <span className="sr-only">You save {formatMoney(saved)}.</span>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
