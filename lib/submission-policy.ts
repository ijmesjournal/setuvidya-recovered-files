import { NextResponse } from 'next/server';
import {
  productionAllowed,
  SUBMISSION_DENIAL_CODE,
  SUBMISSION_DENIAL_MESSAGE,
} from './deployment-policy.mjs';

/** Call before inspecting a request body or invoking any delivery helper. */
export function submissionDenial() {
  if (productionAllowed()) return null;
  return NextResponse.json(
    { ok: false, code: SUBMISSION_DENIAL_CODE, message: SUBMISSION_DENIAL_MESSAGE },
    {
      status: 503,
      headers: {
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      },
    },
  );
}
