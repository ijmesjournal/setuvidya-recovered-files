import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans, Source_Serif_4 } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { brand, seo } from '@/lib/content';
import { organizationSchema, websiteSchema } from '@/lib/schema';
import { siteUrl } from '@/lib/utils';
import { pageMetadata } from '@/lib/seo';

/* Two families, clearly distinct: a scholarly serif for headings and a
   humanist sans for everything a reader has to work through. Both are
   self-hosted by next/font, so there is no render-blocking font request. */
const sans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

const serif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  ...pageMetadata({ title: seo.defaultTitle, description: seo.defaultDescription, path: '/' }),
  metadataBase: new URL(siteUrl),
  title: {
    default: seo.defaultTitle,
    template: `%s | ${brand.name}`,
  },
  description: seo.defaultDescription,
  keywords: seo.keywords,
  applicationName: brand.name,
  authors: [{ name: brand.name }],
  creator: brand.name,
  alternates: { canonical: '/' },
  icons: { icon: '/favicon.svg', apple: '/apple-touch-icon.png' },
};

export const viewport: Viewport = {
  themeColor: '#0B1B2B',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${sans.variable} ${serif.variable}`}>
      <head>
        {/* Runs before paint. Everything that hides itself for an entrance
            animation is gated on this flag, so no-JS readers see all content. */}
        <script
          dangerouslySetInnerHTML={{
            // Failsafe: if nothing has revealed itself shortly after load,
            // hydration or IntersectionObserver did not run. Dropping the flag
            // makes every section visible again instead of leaving the page at
            // opacity 0 and looking dead.
            __html: [
              "document.documentElement.setAttribute('data-reveal','on');",
              'window.setTimeout(function(){',
              "if(!document.querySelector('.sv-reveal[data-shown=\"true\"]'))",
              "{document.documentElement.removeAttribute('data-reveal');}",
              '},2500);',
            ].join(''),
          }}
        />
      </head>
      <body>
        <a href="#main" className="sv-skip">
          Skip to content
        </a>

        <Header />
        <main id="main">{children}</main>
        <Footer />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationSchema(), websiteSchema()]),
          }}
        />
      </body>
    </html>
  );
}
