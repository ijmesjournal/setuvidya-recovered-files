import raw from '@/content/site.json';
import { bookPortfolio, contact, contactDigits, type PublishedBook } from './content';

/* -------------------------------------------------------------------------
   Commerce domain logic.

   One rule runs through all of this: a total is only ever produced from
   configured numbers. Where a price or a shipping charge has not been supplied
   the value stays null and the UI says so, rather than inventing a figure or
   quietly treating the gap as zero.
------------------------------------------------------------------------- */

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type OrderStatus =
  | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

/**
 * A catalogue entry. The commercial fields now live on PublishedBook itself,
 * so there is one shape for a book across the portfolio, the cart and orders.
 */
export type Product = PublishedBook;

export type CartLine = { id: string; quantity: number };

export type OrderCustomer = {
  name: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  country: string;
};

export type OrderItem = {
  id: string;
  title: string;
  isbn: string;
  quantity: number;
  unitPrice: number | null;
  lineTotal: number | null;
};

export type Order = {
  orderId: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number | null;
  shipping: number | null;
  total: number | null;
  currency: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
};

export const commerce = raw.commerce as {
  currency: string;
  currencySymbol: string;
  locale: string;
  priceUnavailableLabel: string;
  totalUnavailableLabel: string;
  shipping: { enabled: boolean; charge: number | null; freeAbove: number | null; note: string };
  payment: { provider: string; enabled: boolean; status: string; note: string };
  orderStatuses: OrderStatus[];
  paymentStatuses: PaymentStatus[];
  labels: Record<string, string>;
  confirmation: { title: string; body: string; nextStepsLabel: string; nextSteps: string[] };
  states: { india: string[] };
};

/** The catalogue. Single source of truth: content/site.json. */
export const products: Product[] = bookPortfolio.books.filter(
  (b) => b.title && b.frontImage,
);

export function findProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

/**
 * The authoritative unit selling price.
 *
 * Derived rather than stored, so MRP and discount are the only numbers anyone
 * edits and no component can drift from them. An explicit `price` overrides the
 * calculation; otherwise mrp less discountPercent, rounded to the whole rupee.
 * Returns null when there is nothing configured to calculate from.
 *
 * Every total in the app and in app/api/orders/route.ts goes through here.
 */
export function unitPrice(product: Product): number | null {
  if (typeof product.price === 'number') return product.price;
  if (typeof product.mrp !== 'number') return null;
  if (typeof product.discountPercent !== 'number') return product.mrp;
  return Math.round(product.mrp * (1 - product.discountPercent / 100));
}

/** Money saved against the MRP, or null when either side is unconfigured. */
export function discountAmount(product: Product): number | null {
  const price = unitPrice(product);
  if (typeof product.mrp !== 'number' || typeof price !== 'number') return null;
  const saved = product.mrp - price;
  return saved > 0 ? saved : null;
}

/** True when the MRP is worth showing struck through beside the price. */
export function hasDiscount(product: Product): boolean {
  return (discountAmount(product) ?? 0) > 0;
}

/** Formats an amount, or returns null when there is nothing to format. */
export function formatMoney(amount: number | null | undefined): string | null {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return null;
  return `${commerce.currencySymbol}${amount.toLocaleString(commerce.locale)}`;
}

export type Totals = {
  subtotal: number | null;
  shipping: number | null;
  total: number | null;
  /** True when at least one line has no configured price. */
  hasUnpricedItem: boolean;
  shippingConfigured: boolean;
  itemCount: number;
};

/**
 * Totals are null unless every input is a real configured number. An unpriced
 * line makes the subtotal unknown; unknown shipping makes the grand total
 * unknown. Nothing is silently coerced to zero.
 */
export function calculateTotals(lines: CartLine[]): Totals {
  const itemCount = lines.reduce((n, l) => n + l.quantity, 0);
  let subtotal = 0;
  let hasUnpricedItem = false;

  for (const line of lines) {
    const product = findProduct(line.id);
    const price = product ? unitPrice(product) : null;
    if (typeof price !== 'number') {
      hasUnpricedItem = true;
      continue;
    }
    subtotal += price * line.quantity;
  }

  const resolvedSubtotal = hasUnpricedItem || lines.length === 0 ? null : subtotal;

  const shippingConfigured =
    !commerce.shipping.enabled || typeof commerce.shipping.charge === 'number';

  let shipping: number | null = null;
  if (!commerce.shipping.enabled) {
    shipping = 0;
  } else if (typeof commerce.shipping.charge === 'number') {
    const freeAbove = commerce.shipping.freeAbove;
    shipping =
      typeof freeAbove === 'number' &&
      typeof resolvedSubtotal === 'number' &&
      resolvedSubtotal >= freeAbove
        ? 0
        : commerce.shipping.charge;
  }

  const total =
    typeof resolvedSubtotal === 'number' && typeof shipping === 'number'
      ? resolvedSubtotal + shipping
      : null;

  return { subtotal: resolvedSubtotal, shipping, total, hasUnpricedItem, shippingConfigured, itemCount };
}

export function buildOrderItems(lines: CartLine[]): OrderItem[] {
  return lines.flatMap((line) => {
    const p = findProduct(line.id);
    if (!p) return [];
    const price = unitPrice(p);
    return [{
      id: p.id,
      title: p.title,
      isbn: p.isbn,
      quantity: line.quantity,
      unitPrice: price,
      lineTotal: price === null ? null : price * line.quantity,
    }];
  });
}

/** SV-BK-<yymmdd>-<rand>. Distinct from the enquiry reference prefix. */
export function makeOrderReference(): string {
  const stamp = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SV-BK-${stamp}-${rand}`;
}

/** Digits only, for a wa.me link. Delegates to the shared contact helper so
 *  there is a single derivation of the number anywhere in the project. */
export function whatsappDigits(): string | null {
  return contactDigits(contact.whatsapp);
}

/**
 * Builds the WhatsApp order message. Amounts appear only when configured, so
 * the message never quotes a figure the site cannot stand behind.
 */
export function buildWhatsappMessage(args: {
  customerName?: string;
  items: OrderItem[];
  totals: Totals;
  reference?: string | null;
}): string {
  const { customerName, items, totals, reference } = args;
  const lines: string[] = ['Book order request — SetuVidya / SD Publication House', ''];

  if (customerName) lines.push(`Name: ${customerName}`);
  if (reference) lines.push(`Reference: ${reference}`);
  if (customerName || reference) lines.push('');

  lines.push('Items:');
  items.forEach((item, i) => {
    const price = formatMoney(item.lineTotal);
    lines.push(`${i + 1}. ${item.title} — qty ${item.quantity}${price ? ` — ${price}` : ''}`);
    if (item.isbn) lines.push(`   ISBN: ${item.isbn}`);
  });

  const total = formatMoney(totals.total);
  if (total) {
    lines.push('', `Total: ${total}`);
  } else {
    lines.push('', 'Total: to be confirmed.');
  }
  return lines.join('\n');
}

export function whatsappHref(message: string): string | null {
  const digits = whatsappDigits();
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
