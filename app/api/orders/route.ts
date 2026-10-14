import { NextResponse } from 'next/server';
import { submissionDenial } from '@/lib/submission-policy';
import {
  buildOrderItems,
  calculateTotals,
  commerce,
  findProduct,
  makeOrderReference,
  type Order,
} from '@/lib/commerce';
import { orderLinesSchema, orderSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* -------------------------------------------------------------------------
   Book order intake.

   Security posture:
   - The browser sends product ids and quantities only. Prices, subtotal,
     shipping and total are never read from the request; they are recomputed
     here from the server's own catalogue.
   - No payment is taken. There is no gateway connected, so this route records
     an order REQUEST and says so. It never reports a payment as successful.
   - No secrets live in client code. When Razorpay (or another provider) is
     added, the key secret stays in the environment and signature verification
     happens in this file, not in the browser.

   Payment integration status: ready-for-integration. See the note at the foot
   of this file for exactly where the gateway hooks in.
------------------------------------------------------------------------- */

const hits = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 8;

function rateLimited(ip: string) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
}

/* --------------------------------------------------------------- delivery */

async function deliverViaResend(order: Order) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_TO_EMAIL || process.env.ENQUIRY_TO_EMAIL;
  const from = process.env.ENQUIRY_FROM_EMAIL;
  if (!key || !to || !from) return false;

  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 14px 6px 0">${escapeHtml(i.title)}</td>` +
        `<td style="padding:6px 14px 6px 0">${i.quantity}</td>` +
        `<td style="padding:6px 0">${i.lineTotal ?? 'to be confirmed'}</td></tr>`,
    )
    .join('');

  const c = order.customer;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: c.email,
      subject: `Book order request ${order.orderId}`,
      html:
        `<h2 style="font-family:Georgia,serif">Book order request ${order.orderId}</h2>` +
        `<p>${escapeHtml(c.name)} &lt;${escapeHtml(c.email)}&gt; · ${escapeHtml(c.mobile)}</p>` +
        `<p>${escapeHtml(c.address)}<br>${escapeHtml(c.city)}, ${escapeHtml(c.state)} ${escapeHtml(c.pin)}<br>${escapeHtml(c.country)}</p>` +
        `<table style="font-family:system-ui,sans-serif;font-size:14px">${rows}</table>` +
        `<p>Subtotal: ${order.subtotal ?? 'to be confirmed'}<br>` +
        `Shipping: ${order.shipping ?? 'to be confirmed'}<br>` +
        `Total: ${order.total ?? 'to be confirmed'}</p>` +
        `<p>Payment status: ${order.paymentStatus}. No payment has been taken.</p>`,
    }),
  });
  if (!res.ok) throw new Error(`Resend responded ${res.status}`);
  return true;
}

async function deliverViaSupabase(order: Order) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return false;

  const res = await fetch(`${url}/rest/v1/book_orders`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify([order]),
  });
  if (!res.ok) throw new Error(`Supabase responded ${res.status}`);
  return true;
}

async function deliverViaWebhook(order: Order) {
  const url = process.env.ORDER_WEBHOOK_URL || process.env.ENQUIRY_WEBHOOK_URL;
  if (!url) return false;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.ENQUIRY_WEBHOOK_SECRET
        ? { 'X-SetuVidya-Secret': process.env.ENQUIRY_WEBHOOK_SECRET }
        : {}),
    },
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
  return true;
}

/* ------------------------------------------------------------------ route */

export async function POST(request: Request) {
  const denied = submissionDenial();
  if (denied) return denied;

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  if (rateLimited(ip)) {
    return NextResponse.json(
      { message: 'Too many order requests from this connection. Try again in a few minutes.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'The request could not be read.' }, { status: 400 });
  }

  const payload = body as { customer?: unknown; lines?: unknown };

  const customer = orderSchema.safeParse(payload.customer);
  if (!customer.success) {
    const fieldErrors: Record<string, string> = {};
    customer.error.issues.forEach((issue) => {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    });
    return NextResponse.json(
      { message: 'Check the highlighted fields and submit again.', fieldErrors },
      { status: 422 },
    );
  }

  // Honeypot hit: accept quietly so the bot learns nothing.
  if (customer.data.company) {
    return NextResponse.json({ ok: true, orderId: makeOrderReference() });
  }

  const lines = orderLinesSchema.safeParse(payload.lines);
  if (!lines.success) {
    return NextResponse.json(
      { message: lines.error.issues[0]?.message ?? 'Your cart is empty.' },
      { status: 422 },
    );
  }

  // Every id must exist in the catalogue and be available.
  const unknown = lines.data.filter((l) => {
    const p = findProduct(l.id);
    return !p || !p.available;
  });
  if (unknown.length > 0) {
    return NextResponse.json(
      { message: 'One of the titles in your cart is no longer available. Refresh and try again.' },
      { status: 409 },
    );
  }

  // Totals are recomputed here. Anything the browser sent is ignored.
  const items = buildOrderItems(lines.data);
  const totals = calculateTotals(lines.data);

  const order: Order = {
    orderId: makeOrderReference(),
    customer: {
      name: customer.data.name,
      email: customer.data.email,
      mobile: customer.data.mobile,
      address: customer.data.address,
      city: customer.data.city,
      state: customer.data.state,
      pin: customer.data.pin,
      country: customer.data.country,
    },
    items,
    subtotal: totals.subtotal,
    shipping: totals.shipping,
    total: totals.total,
    currency: commerce.currency,
    // No gateway is connected, so payment can only be pending. This route will
    // never return "paid"; only a verified gateway callback may set that.
    paymentStatus: 'pending',
    orderStatus: 'pending',
    createdAt: new Date().toISOString(),
  };

  try {
    const delivered =
      (await deliverViaResend(order)) ||
      (await deliverViaSupabase(order)) ||
      (await deliverViaWebhook(order));

    if (!delivered) {
      console.error(
        '[order] No delivery channel configured. Set RESEND_API_KEY + ORDER_TO_EMAIL, ' +
          'SUPABASE_URL, or ORDER_WEBHOOK_URL in your environment.',
      );
      return NextResponse.json(
        {
          message:
            'Online ordering is not switched on yet. Please send your order by WhatsApp or email ' +
            'using the details on this page.',
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      orderId: order.orderId,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      // Explicit, so no client can mistake this for a completed payment.
      paymentTaken: false,
    });
  } catch (error) {
    console.error('[order] Delivery failed', error);
    return NextResponse.json(
      {
        message:
          'The order request could not be submitted. Try again shortly, or order by WhatsApp.',
      },
      { status: 502 },
    );
  }
}

/* -------------------------------------------------------------------------
   Adding a payment gateway later (Razorpay shown as the example)

   1. Environment only, never in client code:
        RAZORPAY_KEY_ID          (safe to expose as NEXT_PUBLIC_ if needed)
        RAZORPAY_KEY_SECRET      (server only — never NEXT_PUBLIC_)

   2. In this file, once `order` is built and totals recomputed above, create
      the gateway order from the SERVER-side total:
        const rp = await fetch('https://api.razorpay.com/v1/orders', { ... amount: order.total * 100 })
      Reject the request if `order.total` is null: you cannot charge an amount
      that has not been configured.

   3. Add app/api/orders/verify/route.ts to receive the callback and verify the
      signature with RAZORPAY_KEY_SECRET using an HMAC comparison. Only after
      that check passes may paymentStatus become 'paid'.

   4. Never accept an amount, subtotal or total from the browser at any point.
------------------------------------------------------------------------- */
