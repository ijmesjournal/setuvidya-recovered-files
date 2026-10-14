import { isExplicitProduction } from './lib/deployment-policy.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Public display hint only; API handlers independently enforce the policy.
  env: {
    SETUVIDYA_BUILD_MODE: isExplicitProduction() ? 'production' : 'restricted',
    NEXT_PUBLIC_SUBMISSIONS_ENABLED: String(isExplicitProduction()),
  },
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          ...(!isExplicitProduction() ? [{ key: 'X-Robots-Tag', value: 'noindex' }] : []),
        ],
      },
    ];
  },
};

export default nextConfig;
