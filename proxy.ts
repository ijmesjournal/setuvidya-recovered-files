import { NextResponse, type NextRequest } from 'next/server';
import { deploymentModeAgrees, productionAllowed } from '@/lib/deployment-policy.mjs';
import { submissionDenial } from '@/lib/submission-policy';

// Apply before application pages/assets, including prerendered HTML and RSC.
// Platform errors, redirects before Proxy and external caches need separate
// platform verification. This is not an authentication/access-control layer.
export function proxy(request: NextRequest) {
  if (!deploymentModeAgrees()) {
    return new NextResponse('This deployment is unavailable because its configuration does not match its build.', {
      status: 503,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      },
    });
  }

  const pathname = request.nextUrl.pathname;
  if (request.method === 'POST' && (pathname === '/api/enquiry' || pathname === '/api/orders')) {
    const denied = submissionDenial();
    if (denied) return denied;
  }

  const response = NextResponse.next();
  if (!productionAllowed()) {
    response.headers.set('X-Robots-Tag', 'noindex');
    if (!pathname.startsWith('/_next/static/')) {
      response.headers.set('Cache-Control', 'no-store');
    }
  }
  return response;
}

// No asset or API exclusions: do not expose a stale production page through
// a data request, asset path or alternate application route on a mismatch.
export const config = { matcher: '/:path*' };
