'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/primitives';
import { useCart } from './CartContext';
import {
  buildWhatsappMessage,
  commerce,
  formatMoney,
  whatsappHref,
  type OrderItem,
  type Totals,
} from '@/lib/commerce';
import { PriceBlock } from './PriceBlock';
import { orderSchema, type OrderFieldErrors } from '@/lib/validation';
import { cn } from '@/lib/utils';
import { SUBMISSION_DENIAL_MESSAGE } from '@/lib/deployment-policy.mjs';

const submissionsEnabled = process.env.NEXT_PUBLIC_SUBMISSIONS_ENABLED === 'true';

/* -------------------------------------------------------------------------
   Book ordering UI.

   Three states in one drawer: cart, checkout, confirmation. Plus a small buy
   dialog opened from a book card.

   Amounts are printed only when configured. Where a price or shipping charge
   is missing the UI says so in words; it never shows a zero, and it never
   claims a payment has been taken.
------------------------------------------------------------------------- */

const initialCustomer = {
  name: '', email: '', mobile: '', address: '',
  city: '', state: '', pin: '', country: 'India', notes: '', company: '',
};

function Money({ amount, fallback }: { amount: number | null; fallback?: string }) {
  const text = formatMoney(amount);
  if (text) return <span className="tabular-nums">{text}</span>;
  return <span className="text-muted">{fallback ?? commerce.totalUnavailableLabel}</span>;
}

function TotalsBlock({ totals }: { totals: Totals }) {
  return (
    <dl className="space-y-2 text-[0.92rem]">
      <div className="flex justify-between gap-4">
        <dt className="text-muted">Subtotal</dt>
        <dd><Money amount={totals.subtotal} /></dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-muted">Shipping</dt>
        <dd>
          {totals.shippingConfigured
            ? <Money amount={totals.shipping} />
            : <span className="text-muted">Confirmed after your request</span>}
        </dd>
      </div>
      <div className="flex justify-between gap-4 border-t border-rule pt-2 font-medium text-ink">
        <dt>Total</dt>
        <dd><Money amount={totals.total} /></dd>
      </div>
      {totals.hasUnpricedItem ? (
        <p className="pt-1 text-[0.85rem] text-muted">{commerce.priceUnavailableLabel}</p>
      ) : null}
    </dl>
  );
}

function QuantityStepper({
  value, onChange, label,
}: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="inline-flex items-center rounded border border-rule">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        aria-label={`Decrease quantity of ${label}`}
        className="grid h-11 w-11 place-items-center text-navy transition-colors hover:bg-surface"
      >
        <Minus size={15} aria-hidden="true" />
      </button>
      <span aria-live="off" className="w-10 text-center text-[0.95rem] font-medium tabular-nums text-ink">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label={`Increase quantity of ${label}`}
        className="grid h-11 w-11 place-items-center text-navy transition-colors hover:bg-surface"
      >
        <Plus size={15} aria-hidden="true" />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------ whatsapp cta */

function WhatsappButton({
  items, totals, customerName, reference, className,
}: {
  items: OrderItem[]; totals: Totals; customerName?: string;
  reference?: string | null; className?: string;
}) {
  if (!submissionsEnabled || items.length === 0) return null;
  const href = whatsappHref(buildWhatsappMessage({ items, totals, customerName, reference }));
  if (!href) return null;
  return (
    <ButtonLink href={href} variant="secondary" className={className}>
      {commerce.labels.whatsapp}
    </ButtonLink>
  );
}

/* -------------------------------------------------------------- the drawer */

export function BookCommerce() {
  const cart = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const open = cart.view !== 'closed';

  // Focus management: trap Tab inside, Escape closes, focus returns on close.
  useEffect(() => {
    if (!open) {
      lastFocused.current?.focus();
      return;
    }
    lastFocused.current = document.activeElement as HTMLElement;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); cart.close(); return; }
      if (e.key !== 'Tab') return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };

    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(
      () => panelRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus(), 0);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      window.clearTimeout(t);
    };
  }, [open, cart]);

  return (
    <>
      {/* Cart updates are announced politely, not shouted. */}
      <p className="sr-only" role="status" aria-live="polite">{cart.announcement}</p>
      {!submissionsEnabled ? (
        <p role="status" className="rounded border border-rule bg-paper p-6">{SUBMISSION_DENIAL_MESSAGE}</p>
      ) : null}

      {cart.count > 0 && !open ? (
        <button
          type="button"
          onClick={cart.openCart}
          data-cart-button
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 rounded border border-navy/20 bg-ink px-5 py-3.5 text-[0.92rem] font-medium text-white shadow-lift transition-colors hover:bg-navy"
        >
          <ShoppingBag size={17} aria-hidden="true" />
          {commerce.labels.cart}
          <span className="grid h-6 min-w-6 place-items-center rounded-full bg-brass px-1.5 text-[0.78rem] font-semibold tabular-nums text-ink">
            {cart.count}
          </span>
        </button>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-[70] flex justify-end">
          <div className="absolute inset-0 bg-ink/70" onClick={cart.close} aria-hidden="true" />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={
              cart.view === 'buy' ? 'Buy this book'
                : cart.view === 'checkout' ? 'Checkout'
                : cart.view === 'confirmed' ? commerce.confirmation.title
                : commerce.labels.cart
            }
            data-commerce-panel
            className="relative flex h-full w-full max-w-lg flex-col bg-paper shadow-lift"
          >
            {cart.view === 'buy' ? <BuyPanel /> : null}
            {cart.view === 'cart' ? <CartPanel /> : null}
            {cart.view === 'checkout' ? <CheckoutPanel /> : null}
            {cart.view === 'confirmed' ? <ConfirmationPanel /> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

function PanelHeader({ title }: { title: string }) {
  const cart = useCart();
  return (
    <div className="flex shrink-0 items-center justify-between gap-4 border-b border-rule px-5 py-4 sm:px-7">
      <h2 className="font-serif text-[1.15rem] font-semibold text-ink">{title}</h2>
      <button
        type="button"
        onClick={cart.close}
        data-autofocus
        aria-label="Close"
        className="-mr-2 grid h-11 w-11 place-items-center rounded text-ink transition-colors hover:bg-surface"
      >
        <X size={20} aria-hidden="true" />
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------- buy view */

function BuyPanel() {
  const cart = useCart();
  const product = cart.buyProduct;
  const [qty, setQty] = useState(1);
  if (!product) return null;

  return (
    <>
      <PanelHeader title={commerce.labels.buy} />
      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
        <div className="flex gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.frontImage}
            alt={product.frontAlt || `Front cover of ${product.title}`}
            className="h-40 w-auto shrink-0 rounded border border-rule object-contain"
          />
          <div className="min-w-0">
            <h3 className="font-serif text-[1.05rem] font-semibold leading-snug text-ink">
              {product.title}
            </h3>
            {product.subtitle ? (
              <p className="mt-1 text-[0.88rem] text-muted">{product.subtitle}</p>
            ) : null}
            <dl className="mt-3 space-y-1 text-[0.87rem]">
              <div><dt className="sr-only">Author</dt><dd>{product.author}</dd></div>
              {product.coAuthor ? (
                <div className="flex gap-2">
                  <dt className="text-muted">Co-author</dt><dd>{product.coAuthor}</dd>
                </div>
              ) : null}
              {product.publisher ? (
                <div className="flex gap-2">
                  <dt className="text-muted">Publisher</dt><dd>{product.publisher}</dd>
                </div>
              ) : null}
              {product.year ? (
                <div className="flex gap-2"><dt className="text-muted">Year</dt><dd>{product.year}</dd></div>
              ) : null}
              {product.isbn ? (
                <div className="flex gap-2">
                  <dt className="text-muted">ISBN</dt><dd className="tabular-nums">{product.isbn}</dd>
                </div>
              ) : null}
            </dl>

            <PriceBlock product={product} size="lg" className="mt-4" />
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-4">
          <span className="text-[0.9rem] font-medium text-ink">Quantity</span>
          <QuantityStepper value={qty} onChange={(n) => setQty(Math.max(1, Math.min(50, n)))} label={product.title} />
        </div>

        <p className="mt-6 rounded border-l-2 border-brass bg-surface p-4 text-[0.87rem] text-body">
          {commerce.payment.note}
        </p>
      </div>

      <div className="shrink-0 space-y-3 border-t border-rule px-5 py-5 sm:px-7">
        <Button
          className="w-full"
          onClick={() => { cart.add(product.id, qty); cart.openCart(); }}
        >
          {commerce.labels.addToCart}
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => { cart.add(product.id, qty); cart.openCheckout(); }}
        >
          {commerce.labels.buyNow}
        </Button>
      </div>
    </>
  );
}

/* --------------------------------------------------------------- cart view */

function CartPanel() {
  const cart = useCart();

  if (cart.items.length === 0) {
    return (
      <>
        <PanelHeader title={commerce.labels.cart} />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <ShoppingBag size={30} className="text-rule" aria-hidden="true" />
          <p className="font-medium text-ink">{commerce.labels.emptyCart}</p>
          <p className="max-w-xs text-[0.9rem] text-muted">{commerce.labels.emptyCartHint}</p>
          <Button variant="secondary" className="mt-3" onClick={cart.close}>
            Back to the collection
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <PanelHeader title={`${commerce.labels.cart} (${cart.count})`} />
      <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
        <ul className="divide-y divide-rule">
          {cart.items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-start justify-between gap-4 py-5">
              <div className="min-w-0 flex-1">
                <p className="font-serif text-[0.99rem] font-semibold leading-snug text-ink">
                  {item.title}
                </p>
                <p className="mt-1 text-[0.85rem] text-muted">
                  {formatMoney(item.unitPrice) ?? commerce.priceUnavailableLabel}
                </p>
                <button
                  type="button"
                  onClick={() => cart.remove(item.id)}
                  className="mt-1.5 min-h-[32px] py-2 text-[0.85rem] font-medium text-indigo hover:underline"
                >
                  Remove
                </button>
              </div>
              <div className="flex flex-col items-end gap-2">
                <QuantityStepper
                  value={item.quantity}
                  onChange={(n) => cart.setQuantity(item.id, n)}
                  label={item.title}
                />
                <span className="text-[0.9rem] font-medium text-ink">
                  <Money amount={item.lineTotal} fallback="—" />
                </span>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded border border-rule bg-surface p-5">
          <TotalsBlock totals={cart.totals} />
        </div>

        <button
          type="button"
          onClick={cart.clear}
          className="mt-2 min-h-[32px] py-2 text-[0.85rem] font-medium text-indigo hover:underline"
        >
          Empty cart
        </button>
      </div>

      <div className="shrink-0 space-y-3 border-t border-rule px-5 py-5 sm:px-7">
        <Button className="w-full" onClick={cart.openCheckout}>
          {commerce.labels.checkout}
        </Button>
        <WhatsappButton items={cart.items} totals={cart.totals} className="w-full" />
      </div>
    </>
  );
}

/* ----------------------------------------------------------- checkout view */

function Err({ name, error }: {
  name: keyof OrderFieldErrors;
  error: OrderFieldErrors[keyof OrderFieldErrors];
}) {
  return error ? (
    <p id={`order-${name}-error`} className="mt-2 flex items-start gap-1.5 text-[0.84rem] text-red-700">
      <AlertCircle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
      {error}
    </p>
  ) : null;
}

function CheckoutPanel() {
  const cart = useCart();
  const [values, setValues] = useState(initialCustomer);
  const [errors, setErrors] = useState<OrderFieldErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [formError, setFormError] = useState<string | null>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  const set = (name: keyof typeof initialCustomer, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!submissionsEnabled) return;
    setFormError(null);

    const parsed = orderSchema.safeParse(values);
    if (!parsed.success) {
      const next: OrderFieldErrors = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof OrderFieldErrors;
        if (!next[key]) next[key] = issue.message;
      });
      setErrors(next);
      setStatus('error');
      setFormError('Check the highlighted fields and submit again.');
      requestAnimationFrame(() => alertRef.current?.focus());
      return;
    }

    setStatus('submitting');
    try {
      // Only ids and quantities are sent. The server recomputes every amount.
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer: parsed.data, lines: cart.lines }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data?.fieldErrors) setErrors(data.fieldErrors);
        setStatus('error');
        setFormError(data?.message ?? 'The order request could not be submitted.');
        requestAnimationFrame(() => alertRef.current?.focus());
        return;
      }
      cart.confirm(data.orderId);
    } catch {
      setStatus('error');
      setFormError('The order request could not be submitted, probably a network problem. Try again, or order by WhatsApp.');
      requestAnimationFrame(() => alertRef.current?.focus());
    }
  }

  if (!submissionsEnabled) {
    return (
      <>
        <PanelHeader title={commerce.labels.checkout} />
        <p role="status" className="p-6">{SUBMISSION_DENIAL_MESSAGE}</p>
        <Button variant="secondary" onClick={cart.openCart}>Back to cart</Button>
      </>
    );
  }

  const field = (name: keyof OrderFieldErrors) =>
    cn(
      'w-full rounded border bg-paper px-4 py-3 text-[0.95rem] text-ink outline-none',
      'transition-[border-color,box-shadow] duration-200 placeholder:text-muted',
      'focus:border-indigo focus:ring-2 focus:ring-indigo/15',
      errors[name] ? 'border-red-600/70' : 'border-rule hover:border-navy/35',
    );
  const labelCls = 'mb-2 block text-[0.88rem] font-medium text-ink';
  const aria = (name: keyof OrderFieldErrors) => ({
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `order-${name}-error` : undefined,
  });

  return (
    <>
      <PanelHeader title={commerce.labels.checkout} />
      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
        {formError ? (
          <div
            ref={alertRef}
            tabIndex={-1}
            role="alert"
            className="mb-5 flex items-start gap-3 rounded border border-red-600/40 bg-red-50 px-4 py-3 text-[0.9rem] text-red-800"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{formError}</span>
          </div>
        ) : null}

        <form id="order-form" onSubmit={onSubmit} noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="order-name" className={labelCls}>Full name</label>
              <input id="order-name" autoComplete="name" className={field('name')}
                value={values.name} onChange={(e) => set('name', e.target.value)} {...aria('name')} />
              <Err name="name" error={errors.name} />
            </div>
            <div>
              <label htmlFor="order-email" className={labelCls}>Email</label>
              <input id="order-email" type="email" autoComplete="email" className={field('email')}
                value={values.email} onChange={(e) => set('email', e.target.value)} {...aria('email')} />
              <Err name="email" error={errors.email} />
            </div>
            <div>
              <label htmlFor="order-mobile" className={labelCls}>Mobile number</label>
              <input id="order-mobile" type="tel" autoComplete="tel" className={field('mobile')}
                placeholder="+91 98765 43210"
                value={values.mobile} onChange={(e) => set('mobile', e.target.value)} {...aria('mobile')} />
              <Err name="mobile" error={errors.mobile} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="order-address" className={labelCls}>Delivery address</label>
              <textarea id="order-address" rows={3} autoComplete="street-address"
                className={cn(field('address'), 'resize-y')}
                value={values.address} onChange={(e) => set('address', e.target.value)} {...aria('address')} />
              <Err name="address" error={errors.address} />
            </div>
            <div>
              <label htmlFor="order-city" className={labelCls}>City</label>
              <input id="order-city" autoComplete="address-level2" className={field('city')}
                value={values.city} onChange={(e) => set('city', e.target.value)} {...aria('city')} />
              <Err name="city" error={errors.city} />
            </div>
            <div>
              <label htmlFor="order-state" className={labelCls}>State</label>
              <select id="order-state" autoComplete="address-level1" className={field('state')}
                value={values.state} onChange={(e) => set('state', e.target.value)} {...aria('state')}>
                <option value="">Choose one</option>
                {commerce.states.india.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <Err name="state" error={errors.state} />
            </div>
            <div>
              <label htmlFor="order-pin" className={labelCls}>PIN code</label>
              <input id="order-pin" inputMode="numeric" autoComplete="postal-code" className={field('pin')}
                placeholder="110001"
                value={values.pin} onChange={(e) => set('pin', e.target.value)} {...aria('pin')} />
              <Err name="pin" error={errors.pin} />
            </div>
            <div>
              <label htmlFor="order-country" className={labelCls}>Country</label>
              <input id="order-country" autoComplete="country-name" className={field('country')}
                value={values.country} onChange={(e) => set('country', e.target.value)} {...aria('country')} />
              <Err name="country" error={errors.country} />
            </div>
          </div>

          {/* honeypot */}
          <div aria-hidden="true" className="hidden">
            <label htmlFor="order-company">Company</label>
            <input id="order-company" tabIndex={-1} autoComplete="off"
              value={values.company} onChange={(e) => set('company', e.target.value)} />
          </div>
        </form>

        <section aria-labelledby="order-summary-heading" className="mt-7">
          <h3 id="order-summary-heading" className="text-[0.8rem] font-semibold uppercase tracking-[0.13em] text-muted">
            Order summary
          </h3>
          <table className="mt-3 w-full text-[0.88rem]">
            <thead>
              <tr className="border-b border-rule text-left text-muted">
                <th scope="col" className="py-2 font-medium">Book</th>
                <th scope="col" className="py-2 text-center font-medium">Qty</th>
                <th scope="col" className="py-2 text-right font-medium">Unit</th>
                <th scope="col" className="py-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {cart.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2.5 pr-3">{item.title}</td>
                  <td className="py-2.5 text-center tabular-nums">{item.quantity}</td>
                  <td className="py-2.5 text-right"><Money amount={item.unitPrice} fallback="—" /></td>
                  <td className="py-2.5 text-right"><Money amount={item.lineTotal} fallback="—" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 rounded border border-rule bg-surface p-5">
            <TotalsBlock totals={cart.totals} />
          </div>
          <p className="mt-4 rounded border-l-2 border-brass bg-surface p-4 text-[0.86rem] text-body">
            {commerce.payment.note}
          </p>
        </section>
      </div>

      <div className="shrink-0 space-y-3 border-t border-rule px-5 py-5 sm:px-7">
        <Button type="submit" form="order-form" className="w-full" disabled={status === 'submitting'}>
          {status === 'submitting' ? (
            <><Loader2 size={16} className="animate-spin" aria-hidden="true" /> Submitting request</>
          ) : 'Submit order request'}
        </Button>
        <WhatsappButton
          items={cart.items} totals={cart.totals}
          customerName={values.name || undefined} className="w-full"
        />
        <button type="button" onClick={cart.openCart}
          className="w-full min-h-[32px] py-2 text-[0.86rem] font-medium text-indigo hover:underline">
          Back to cart
        </button>
      </div>
    </>
  );
}

/* ------------------------------------------------------- confirmation view */

function ConfirmationPanel() {
  const cart = useCart();
  const c = cart.confirmation;
  if (!submissionsEnabled || !c) return null;

  return (
    <>
      <PanelHeader title={commerce.confirmation.title} />
      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
        <CheckCircle2 size={32} className="text-teal" aria-hidden="true" />
        <h3 className="mt-4 font-serif text-[1.2rem] font-semibold text-ink">
          {commerce.confirmation.title}
        </h3>
        <p className="mt-3 text-[0.93rem]">{commerce.confirmation.body}</p>

        <p className="mt-5 text-[0.9rem]">
          <span className="text-muted">Order reference: </span>
          <span className="font-medium tabular-nums text-ink">{c.reference}</span>
        </p>

        <ul className="mt-6 divide-y divide-rule border-y border-rule">
          {c.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-3 text-[0.9rem]">
              <span>{item.title} <span className="text-muted">× {item.quantity}</span></span>
              <Money amount={item.lineTotal} fallback="—" />
            </li>
          ))}
        </ul>

        <div className="mt-5 rounded border border-rule bg-surface p-5">
          <TotalsBlock totals={c.totals} />
        </div>

        <h4 className="mt-7 text-[0.8rem] font-semibold uppercase tracking-[0.13em] text-muted">
          {commerce.confirmation.nextStepsLabel}
        </h4>
        <ol className="mt-3 space-y-2">
          {commerce.confirmation.nextSteps.map((step, i) => (
            <li key={step} className="flex gap-3 text-[0.91rem]">
              <span aria-hidden="true" className="font-serif text-brass">{i + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div className="shrink-0 space-y-3 border-t border-rule px-5 py-5 sm:px-7">
        <WhatsappButton
          items={c.items} totals={c.totals} reference={c.reference} className="w-full"
        />
        <Button variant="secondary" className="w-full" onClick={cart.close}>Done</Button>
      </div>
    </>
  );
}
