import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import { Container } from '@/components/ui/primitives';
import { Logo } from '@/components/brand/Logo';
import { brand, contact, contactLinks, journalConfigured, journalUrl, legal, workingHours } from '@/lib/content';
import { WorkingHours } from './WorkingHours';

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'About SetuVidya', href: '/about' },
  { label: 'Research & Thesis', href: '/research-thesis' },
  { label: 'Publication', href: '/publication' },
  { label: 'Book Publication', href: '/book-publication' },
  { label: 'University Admission', href: '/university-admission' },
];

/** Academic resources. IJSMS renders as a link only when configured. */
const resourceLinks = [
  { label: 'Academic Updates', href: '/education-updates' },
  { label: 'Research Guide', href: '/research-guide' },
  { label: 'Scopus Journal List', href: '/scopus-journal-list' },
  { label: 'FAQ', href: '/faq' },
];

/**
 * Platform order and labels. A platform renders only when its URL is a real
 * one: an unconfigured entry produces no icon and no link, rather than a
 * button that goes nowhere.
 */
const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram', Icon: Instagram },
  { key: 'facebook', label: 'Facebook', Icon: Facebook },
  { key: 'linkedin', label: 'LinkedIn', Icon: Linkedin },
  { key: 'youtube', label: 'YouTube', Icon: Youtube },
] as const;

function configuredSocials() {
  return SOCIAL_PLATFORMS.map((platform) => ({
    ...platform,
    href: contact.socialLinks[platform.key] ?? '',
  })).filter((platform) => platform.href.trim().startsWith('http'));
}

const isPlaceholder = (v: string) => v.trim().startsWith('[');

function ContactValue({ value, href }: { value: string; href?: string | null }) {
  if (isPlaceholder(value)) {
    return <span className="italic text-white/55">{value}</span>;
  }
  if (!href) {
    return <span>{value}</span>;
  }
  // wa.me and any other off-site destination opens in a new tab, safely.
  const external = href.startsWith('http');
  return (
    <a
      href={href}
      {...(external ? { target: '_blank' as const, rel: 'noopener noreferrer' } : {})}
      className="transition-colors duration-200 hover:text-brand-teal-on-navy"
    >
      {value}
    </a>
  );
}

export function Footer() {
  return (
    <footer className="bg-brand-navy text-white/65">
      <Container className="pb-10 pt-14">
        <div className="grid gap-10 sm:grid-cols-2 sm:gap-x-12 lg:grid-cols-[1fr_0.78fr_0.92fr_1.75fr] lg:gap-9">
          {/* brand ------------------------------------------------------ */}
          <div>
            {/* The official logo has navy lettering, which disappears on this
                navy background. A white tile keeps it legible without
                recolouring the artwork. */}
            <span className="inline-block rounded-lg bg-white px-3 py-2">
              <Logo />
            </span>
            <p className="mt-6 max-w-xs font-serif text-[1.05rem] italic leading-relaxed text-white/80">
              {brand.tagline}
            </p>
            <p className="mt-4 max-w-xs text-[0.9rem] leading-relaxed text-white/65">
              {brand.meaning}
            </p>

          </div>

          {/* quick links ------------------------------------------------ */}
          <nav aria-label="Footer">
            <h2 className="font-sans text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-white">
              Explore
            </h2>
            <ul className="mt-5 space-y-2.5 text-[0.93rem]">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors duration-200 hover:text-brand-teal-on-navy">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* academic resources ----------------------------------------- */}
          <div>
            <h2 className="font-sans text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-white">
              Academic Resources
            </h2>
            <ul className="mt-5 space-y-2.5 text-[0.93rem]">
              {resourceLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors duration-200 hover:text-brand-teal-on-navy">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                {journalConfigured ? (
                  <a
                    href={journalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors duration-200 hover:text-brand-teal-on-navy"
                  >
                    Our Academic Journal (IJSMS)
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  /* Not configured, so not a link. */
                  <span className="text-white/55">Our Academic Journal (IJSMS)</span>
                )}
              </li>
            </ul>
          </div>

          {/* contact ---------------------------------------------------- */}
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-sans text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-white">
                Get in Touch
              </h2>
              {/* Contact is not in the header, so the footer carries the route. */}
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-[0.86rem] font-medium text-brand-teal-on-navy transition-colors duration-200 hover:text-white"
              >
                Get in Touch
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>

            {/* Phone and WhatsApp share a row; Email and Office span it. */}
            <address className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3 text-[0.93rem] not-italic">
              <div className="col-span-2">
                <span className="block text-white/55">Email</span>
                <ContactValue value={contact.email} href={contactLinks.mailto} />
              </div>
              <div>
                <span className="block text-white/55">Phone</span>
                <ContactValue value={contact.phone} href={contactLinks.tel} />
              </div>
              <div>
                <span className="block text-white/55">WhatsApp</span>
                <ContactValue value={contact.whatsapp} href={contactLinks.whatsapp} />
              </div>
              <div className="col-span-2">
                <span className="block text-white/55">Office</span>
                <span className="block">
                  {contact.addressLines.map((line) => (
                    <span key={line} className={isPlaceholder(line) ? 'block italic text-white/55' : 'block'}>
                      {line}
                    </span>
                  ))}
                </span>
              </div>
            </address>

            {/* Working hours and Follow Us share one row instead of stacking. */}
            <div className="mt-4 flex flex-wrap items-start justify-between gap-x-8 gap-y-5 border-t border-white/10 pt-4 text-[0.93rem]">
              <div>
                <span className="block text-white/55">{workingHours.label}</span>
                <WorkingHours tone="dark" className="mt-1" />
              </div>
              {configuredSocials().length > 0 ? (
                <div>
                  <h2 className="font-sans text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-white">
                    Follow Us
                  </h2>
                  <ul className="mt-2.5 flex gap-3">
                    {configuredSocials().map(({ key, label, Icon, href }) => (
                      <li key={key}>
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${brand.short} on ${label}`}
                          className="grid h-11 w-11 place-items-center rounded-full bg-white text-brand-navy transition-colors duration-200 hover:bg-brand-teal-on-navy hover:text-white focus-visible:bg-brand-teal-on-navy focus-visible:text-white"
                        >
                          <Icon size={18} aria-hidden="true" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* integrity statement ------------------------------------------ */}
        <div className="mt-9 border-t border-white/10 pt-6">
          <h2 className="font-sans text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-white">
            {legal.integrity.title}
          </h2>
          <p className="mt-3 max-w-4xl text-[0.9rem] leading-relaxed text-white/70">
            {legal.integrity.body}
          </p>
        </div>

        <nav aria-label="Legal" className="mt-6">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[0.9rem]">
            {legal.documents.map((document) => (
              <li key={document.slug}>
                <Link
                  href={`/legal/${document.slug}`}
                  className="inline-flex min-h-11 items-center rounded transition-colors hover:text-brand-teal-on-navy focus-visible:text-brand-teal-on-navy"
                >
                  {document.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-6 text-[0.85rem] text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {brand.legalName}. All rights reserved.
          </p>
          <p>
            SetuVidya is an independent consultancy and is not affiliated with any university,
            publisher or indexing body.
          </p>
        </div>
      </Container>
    </footer>
  );
}
