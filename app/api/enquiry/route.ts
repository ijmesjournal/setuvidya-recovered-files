import { NextResponse } from 'next/server';
import { submissionDenial } from '@/lib/submission-policy';
import { enquirySchema, MAX_UPLOAD_BYTES } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* -------------------------------------------------------------------------
   Enquiry intake.

   Deliberately, this route does NOT fake success. If no delivery channel is
   configured it returns 503 and the form shows a real error, so an unfinished
   deployment cannot silently swallow a scholar's enquiry.

   Configure exactly one channel in .env.local. Each adapter below is small on
   purpose: swapping in a CRM is a matter of writing one more `deliverVia…`.
------------------------------------------------------------------------- */

type Enquiry = Record<string, string> & { reference: string; receivedAt: string };

/** Very small in-memory rate limiter. Replace with Upstash/Redis in production. */
const hits = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

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

function makeReference() {
  const stamp = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SV-${stamp}-${rand}`;
}

/* --------------------------------------------------------------- adapters */

async function deliverViaResend(enquiry: Enquiry, file: File | null) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ENQUIRY_TO_EMAIL;
  const from = process.env.ENQUIRY_FROM_EMAIL;
  if (!key || !to || !from) return false;

  const rows = Object.entries(enquiry)
    .map(([k, v]) => `<tr><td style="padding:6px 14px 6px 0;color:#6F7E91">${k}</td><td style="padding:6px 0">${escapeHtml(v)}</td></tr>`)
    .join('');

  const attachments = file
    ? [
        {
          filename: file.name,
          content: Buffer.from(await file.arrayBuffer()).toString('base64'),
        },
      ]
    : undefined;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: enquiry.email,
      subject: `New requirement ${enquiry.reference} — ${enquiry.service}`,
      html: `<h2 style="font-family:Georgia,serif">New requirement</h2><table style="font-family:system-ui,sans-serif;font-size:14px">${rows}</table>`,
      attachments,
    }),
  });

  if (!res.ok) throw new Error(`Resend responded ${res.status}`);
  return true;
}

async function deliverViaGoogleSheets(enquiry: Enquiry) {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!url) return false;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(enquiry),
  });
  if (!res.ok) throw new Error(`Sheets webhook responded ${res.status}`);
  return true;
}

async function deliverViaWebhook(enquiry: Enquiry) {
  const url = process.env.ENQUIRY_WEBHOOK_URL;
  if (!url) return false;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.ENQUIRY_WEBHOOK_SECRET
        ? { 'X-SetuVidya-Secret': process.env.ENQUIRY_WEBHOOK_SECRET }
        : {}),
    },
    body: JSON.stringify(enquiry),
  });
  if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
  return true;
}

async function deliverViaSupabase(enquiry: Enquiry) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return false;

  const res = await fetch(`${url}/rest/v1/enquiries`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify([enquiry]),
  });
  if (!res.ok) throw new Error(`Supabase responded ${res.status}`);
  return true;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
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
      { message: 'Too many enquiries from this connection. Try again in a few minutes.' },
      { status: 429 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ message: 'The request could not be read.' }, { status: 400 });
  }

  const raw = {
    fullName: String(form.get('fullName') ?? ''),
    email: String(form.get('email') ?? ''),
    phone: String(form.get('phone') ?? ''),
    academicLevel: String(form.get('academicLevel') ?? ''),
    service: String(form.get('service') ?? ''),
    discipline: String(form.get('discipline') ?? ''),
    requirement: String(form.get('requirement') ?? ''),
    message: String(form.get('message') ?? ''),
    consent: form.get('consent') === 'true',
    company: String(form.get('company') ?? ''),
  };

  const parsed = enquirySchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    });
    return NextResponse.json(
      { message: 'Check the highlighted fields and send again.', fieldErrors },
      { status: 422 },
    );
  }

  // Honeypot hit: accept quietly so the bot learns nothing.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true, reference: makeReference() });
  }

  const file = form.get('document');
  const upload = file instanceof File && file.size > 0 ? file : null;
  if (upload && upload.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { message: 'That file is over 10 MB.', fieldErrors: { document: 'That file is over 10 MB.' } },
      { status: 413 },
    );
  }

  const reference = makeReference();
  const enquiry: Enquiry = {
    reference,
    receivedAt: new Date().toISOString(),
    fullName: parsed.data.fullName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    academicLevel: parsed.data.academicLevel,
    service: parsed.data.service,
    discipline: parsed.data.discipline,
    requirement: parsed.data.requirement,
    message: parsed.data.message ?? '',
    documentName: upload?.name ?? '',
    source: 'website',
  };

  try {
    const delivered =
      (await deliverViaResend(enquiry, upload)) ||
      (await deliverViaSupabase(enquiry)) ||
      (await deliverViaGoogleSheets(enquiry)) ||
      (await deliverViaWebhook(enquiry));

    if (!delivered) {
      console.error(
        '[enquiry] No delivery channel configured. Set RESEND_API_KEY, SUPABASE_URL, ' +
          'GOOGLE_SHEETS_WEBHOOK_URL or ENQUIRY_WEBHOOK_URL in your environment.',
      );
      return NextResponse.json(
        {
          message:
            'Enquiries are not being accepted through this form yet. Please email us directly using the address on this page.',
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ ok: true, reference });
  } catch (error) {
    console.error('[enquiry] Delivery failed', error);
    return NextResponse.json(
      {
        message:
          'The enquiry could not be delivered. Try again shortly, or email us directly using the address on this page.',
      },
      { status: 502 },
    );
  }
}
