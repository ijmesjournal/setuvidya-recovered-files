import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { PageHero } from '@/components/sections/PageHero';
import { Container, Panel, Section } from '@/components/ui/primitives';
import { EnquiryForm } from '@/components/forms/EnquiryForm';
import { SignalArcsMotif } from '@/components/motifs/Motifs';
import { contact, contactLinks, legal, pages, workingHours } from '@/lib/content';
import { WorkingHours } from '@/components/layout/WorkingHours';
import { breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = pageMetadata({
  title: 'Contact & Consultation',
  description: 'Send your research, thesis, publication, book or admission requirement to SetuVidya Consultancy and receive an honest assessment of how we can help.',
  path: '/contact',
});

const trail = [
  { name: 'Home', href: '/' },
  { name: 'Contact', href: '/contact' },
];

const isPlaceholder = (v: string) => v.trim().startsWith('[');

function Detail({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Mail;
  label: string;
  value: string | string[];
  href?: string | null;
}) {
  const lines = Array.isArray(value) ? value : [value];
  const placeholder = lines.every(isPlaceholder);

  return (
    <div className="flex gap-4 border-b border-rule py-5 last:border-b-0">
      <Icon size={19} className="mt-0.5 shrink-0 text-navy" strokeWidth={1.7} aria-hidden="true" />
      <div>
        <p className="text-[0.82rem] font-medium uppercase tracking-[0.13em] text-muted">{label}</p>
        <div className="mt-1.5 text-[0.98rem]">
          {placeholder ? (
            lines.map((l) => (
              <span key={l} className="block italic text-muted">
                {l}
              </span>
            ))
          ) : href ? (
            <a
              href={href}
              {...(href.startsWith('http')
                ? { target: '_blank' as const, rel: 'noopener noreferrer' }
                : {})}
              className="text-ink transition-colors hover:text-indigo"
            >
              {lines.join(', ')}
            </a>
          ) : (
            lines.map((l) => (
              <span key={l} className="block text-ink">
                {l}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const page = pages.contact;

  return (
    <>
      <PageHero
        kicker="Contact"
        title={page.title}
        lede={page.lede}
        motif="signal"
        breadcrumb={trail}
      />

      <Section id="requirement-form" className="scroll-mt-28">
        <SignalArcsMotif opacity={0.035} />
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.35fr_0.65fr] lg:gap-16">
            {/* ------------------------------------------------------ form */}
            <div>
              <h2 className="text-display-sm">Requirement form</h2>
              <p className="mt-3 max-w-prose text-[0.96rem]">
                The more precisely you describe where you are, the more useful our first reply will
                be. Attach guidelines, drafts or reviewer comments if you have them.
              </p>
              <div className="mt-9">
                <EnquiryForm />
              </div>
            </div>

            {/* --------------------------------------------------- details */}
            <aside className="lg:pt-2">
              <Panel className="p-7">
                <h2 className="font-sans text-[0.85rem] font-semibold uppercase tracking-[0.14em] text-muted">
                  Reach us directly
                </h2>
                <div className="mt-2">
                  <Detail icon={Mail} label="Email" value={contact.email} href={contactLinks.mailto} />
                  <Detail icon={Phone} label="Phone" value={contact.phone} href={contactLinks.tel} />
                  <Detail
                    icon={MessageCircle}
                    label="WhatsApp"
                    value={contact.whatsapp}
                    href={contactLinks.whatsapp}
                  />
                  <Detail icon={MapPin} label="Office" value={contact.addressLines} />
                                    {/* Hours are a schedule, not a single value, so they get a
                      description list rather than the one-line Detail row. */}
                  <div className="flex gap-4 border-b border-rule py-5 last:border-b-0">
                    <Clock
                      size={19}
                      className="mt-0.5 shrink-0 text-navy"
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.82rem] font-medium uppercase tracking-[0.13em] text-muted">
                        {workingHours.label}
                      </p>
                      <WorkingHours className="mt-2 max-w-xs text-[0.95rem]" />
                    </div>
                  </div>
                </div>
              </Panel>

              <div className="mt-6 rounded border-l-2 border-brass bg-surface p-6">
                <h2 className="font-sans text-[0.95rem] font-semibold text-ink">
                  {legal.integrity.title}
                </h2>
                <p className="mt-2.5 text-[0.9rem]">{legal.integrity.body}</p>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(trail)) }}
      />
    </>
  );
}
