'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpenText,
  ChevronDown,
  FileSearch,
  Landmark,
  Menu,
  ScrollText,
  X,
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { ButtonLink, Container } from '@/components/ui/primitives';
import { journalConfigured, journalUrl, nav } from '@/lib/content';

/* One icon per practice area, drawn from the same set the service sections
   use, so the menu reads as part of the site rather than as chrome. */
const serviceIcons = {
  research: FileSearch,
  publication: ScrollText,
  book: BookOpenText,
  admission: Landmark,
} as const;
import { cn } from '@/lib/utils';


/** Icon, label and blurb for one dropdown child. Shared by the internal link
 *  and the external (journal) variant so both look identical. */
function ChildBody({
  child,
}: {
  child: { label: string; blurb: string; icon: keyof typeof serviceIcons };
}) {
  const Icon = serviceIcons[child.icon] ?? FileSearch;
  return (
    <>
      <span
        aria-hidden="true"
        className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded border border-rule bg-surface text-navy"
      >
        <Icon size={19} strokeWidth={1.6} />
      </span>
      <span className="min-w-0">
        <span className="block font-serif text-[1.02rem] font-semibold leading-snug text-ink">
          {child.label}
        </span>
        <span className="mt-1.5 block text-[0.88rem] leading-relaxed text-body">{child.blurb}</span>
      </span>
    </>
  );
}

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  // Hover opens the menu; a click pins it so it survives the pointer leaving.
  const [menuPinned, setMenuPinned] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  // Keyed by nav label so Escape can hand focus back to the right trigger.
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close everything on navigation.
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(null);
    setMenuPinned(false);
  }, [pathname]);

  // Escape closes menus; body scroll locks behind the mobile drawer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Closing a menu must not strand focus on a removed element.
        if (menuOpen) triggerRefs.current[menuOpen]?.focus();
        setMenuOpen(null);
        setMenuPinned(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const openMenu = (label: string) => {
    clearTimeout(closeTimer.current);
    setMenuOpen(label);
  };
  const scheduleClose = () => {
    if (menuPinned) return;
    closeTimer.current = setTimeout(() => setMenuOpen(null), 140);
  };
  const toggleMenu = (label: string) => {
    clearTimeout(closeTimer.current);
    const nextPinned = !menuPinned;
    setMenuPinned(nextPinned);
    setMenuOpen(nextPinned ? label : null);
  };

  return (
    <>
      <header
          className={cn(
          // One bar, deep brand navy. No second row.
          // White bar, as in reference Option 1. The official logo reads fully here.
          'sticky top-0 z-50 border-b border-rule bg-paper transition-shadow duration-300',
          scrolled ? 'shadow-lift' : '',
        )}
      >
        <Container className="flex h-[76px] items-center justify-between gap-6">
          <Logo />

          {/* -------------------------------------------------- desktop nav */}
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-9">
              {nav.map((item) => {
                const active = isActive(item.href);

                if (item.external) {
                  const cls =
                    'sv-navlink py-2 text-[0.95rem] font-medium text-brand-navy transition-colors duration-200 hover:text-brand-teal-deep';
                  return (
                    <li key={item.label}>
                      {journalConfigured ? (
                        <a
                          href={journalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(cls, 'text-brand-navy hover:text-brand-teal-deep')}
                        >
                          {item.label}
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      ) : (
                        // No address yet, so no link: plain text instead of a
                        // nav item that goes nowhere.
                        <span className={cn(cls, 'cursor-default text-muted')}>{item.label}</span>
                      )}
                    </li>
                  );
                }

                if (!item.children) {
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        data-active={active}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'sv-navlink py-2 text-[0.95rem] font-medium transition-colors duration-200',
                          active ? 'text-ink' : 'text-body hover:text-ink',
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                }

                const open = menuOpen === item.label;
                const menuId = `sv-menu-${item.label.toLowerCase().replace(/\s+/g, '-')}`;

                return (
                  <li
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => openMenu(item.label)}
                    onMouseLeave={scheduleClose}
                  >
                    <button
                      type="button"
                      ref={(el) => {
                        triggerRefs.current[item.label] = el;
                      }}
                      aria-expanded={open}
                      aria-haspopup="true"
                      aria-controls={open ? menuId : undefined}
                      onClick={() => toggleMenu(item.label)}
                      data-active={active}
                      className={cn(
                        'sv-navlink flex items-center gap-1.5 py-2 text-[0.95rem] font-medium transition-colors duration-200',
                        active ? 'text-ink' : 'text-body hover:text-ink',
                      )}
                    >
                      {item.label}
                      <ChevronDown
                        size={15}
                        aria-hidden="true"
                        className={cn('transition-transform duration-200', open && 'rotate-180')}
                      />
                    </button>

                    {open ? (
                      <div
                        id={menuId}
                        className="absolute left-1/2 top-full z-50 w-[min(46rem,calc(100vw-3rem))] -translate-x-1/2 pt-4"
                        // Same reason as the mobile drawer: a link to the page
                        // already showing does not change `pathname`, so the
                        // menu would stay pinned open.
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest('a')) {
                            setMenuOpen(null);
                            setMenuPinned(false);
                          }
                        }}
                      >
                        <div className="overflow-hidden rounded border border-rule bg-paper shadow-lift">
                          {/* 2x2 mega-menu: every service gets the same footprint,
                              so none of the four reads as more important. */}
                          <ul className="grid gap-px bg-rule sm:grid-cols-2">
                            {item.children.map((child) => {
                              const Icon = serviceIcons[child.icon] ?? FileSearch;
                              return (
                                <li key={child.label} className="bg-paper">
                                  {/* A child may point outside the site (the journal). Those render as
                                      a real external anchor; an unconfigured one renders as plain text
                                      rather than a link that goes nowhere. */}
                                  {child.external ? (
                                    journalConfigured ? (
                                      <a
                                        href={journalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex h-full gap-4 p-5 transition-colors duration-200 hover:bg-surface"
                                      >
                                        <ChildBody child={child} />
                                        <span className="sr-only"> (opens in a new tab)</span>
                                      </a>
                                    ) : (
                                      <span className="flex h-full cursor-default gap-4 p-5 opacity-60">
                                        <ChildBody child={child} />
                                      </span>
                                    )
                                  ) : (
                                  <Link
                                    href={child.href}
                                    className="group/card flex h-full gap-4 p-5 transition-colors duration-200 hover:bg-surface focus-visible:bg-surface"
                                  >
                                    <span
                                      aria-hidden="true"
                                      className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded border border-rule bg-surface text-navy transition-colors duration-200 group-hover/card:border-navy/30 group-hover/card:bg-paper"
                                    >
                                      <Icon size={19} strokeWidth={1.6} />
                                    </span>

                                    <span className="min-w-0">
                                      <span className="block font-serif text-[1.02rem] font-semibold leading-snug text-ink">
                                        {child.label}
                                      </span>
                                      <span className="mt-1.5 block text-[0.88rem] leading-relaxed text-body">
                                        {child.blurb}
                                      </span>
                                      <span className="mt-3 inline-flex items-center gap-1.5 text-[0.85rem] font-medium text-indigo">
                                        {item.exploreLabel ?? 'Explore'}
                                        <ArrowRight
                                          size={13}
                                          aria-hidden="true"
                                          className="transition-transform duration-200 ease-sv group-hover/card:translate-x-0.5"
                                        />
                                      </span>
                                    </span>
                                  </Link>
                                  )}

                                </li>
                              );
                            })}
                          </ul>

                          {item.footerLink ? (
                            <Link
                              href={item.footerLink.href}
                              className="group/all flex items-center justify-center gap-2 border-t border-rule bg-surface/60 px-5 py-3.5 text-[0.89rem] font-medium text-ink transition-colors duration-200 hover:bg-surface hover:text-indigo"
                            >
                              {item.footerLink.label}
                              <ArrowRight
                                size={14}
                                aria-hidden="true"
                                className="transition-transform duration-200 ease-sv group-hover/all:translate-x-1"
                              />
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="hidden items-center lg:flex">
            <ButtonLink
              href="/contact#requirement-form"
              variant="primary"
              size="sm"
              className="bg-brand-teal-deep text-white hover:bg-brand-teal-deep/90"
            >
              Book a Consultation <span aria-hidden="true">&rarr;</span>
            </ButtonLink>
          </div>

          {/* ------------------------------------------------ mobile trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded text-brand-navy lg:hidden"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            aria-controls="sv-mobile-nav"
          >
            <Menu size={22} aria-hidden="true" />
          </button>
        </Container>

      </header>

      {/* Rendered as a sibling of <header>, not inside it: the header carries
          backdrop-blur, and a backdrop-filter makes an element a containing
          block for position:fixed descendants, which pinned the drawer to the
          74px header instead of the viewport. */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-ink/45"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div
            id="sv-mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-paper shadow-lift"
            // Closing on `pathname` alone leaves the drawer open whenever the
            // destination is the page already showing - tapping Home from Home,
            // or Book a Consultation from /contact, where only the hash
            // changes. The body scroll lock then stays on and the site reads as
            // frozen. Any activated link closes it.
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('a')) setMobileOpen(false);
            }}
          >
            <div className="flex h-[74px] shrink-0 items-center justify-between border-b border-rule px-5">
              <Logo />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                autoFocus
                className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded text-ink"
                aria-label="Close menu"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Mobile" className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">
              <ul className="space-y-1">
                {nav.map((item) => (
                  <li key={item.label}>
                    {item.external ? (
                      journalConfigured ? (
                        <a
                          href={journalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded py-3 font-serif text-[1.22rem] font-semibold text-ink"
                        >
                          {item.label}
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      ) : (
                        <span className="block rounded py-3 font-serif text-[1.22rem] font-semibold text-muted">
                          {item.label}
                        </span>
                      )
                    ) : (
                      <Link
                        href={item.href}
                        aria-current={isActive(item.href) ? 'page' : undefined}
                        className={cn(
                          'block rounded py-3 font-serif text-[1.22rem] font-semibold',
                          isActive(item.href) ? 'text-indigo' : 'text-ink',
                        )}
                      >
                        {item.label}
                      </Link>
                    )}

                    {item.children ? (
                      <>
                        {/* Same four cards as the desktop mega-menu, stacked. */}
                        <ul className="mb-3 space-y-2">
                          {item.children.map((child) => {
                            const Icon = serviceIcons[child.icon] ?? FileSearch;
                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  className="flex gap-3.5 rounded border border-rule bg-paper p-3.5 transition-colors duration-200 hover:bg-surface"
                                >
                                  <span
                                    aria-hidden="true"
                                    className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded border border-rule bg-surface text-navy"
                                  >
                                    <Icon size={17} strokeWidth={1.6} />
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block font-sans text-[0.97rem] font-semibold text-ink">
                                      {child.label}
                                    </span>
                                    <span className="mt-1 block text-[0.85rem] leading-relaxed text-body">
                                      {child.blurb}
                                    </span>
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>

                        {item.footerLink ? (
                          <Link
                            href={item.footerLink.href}
                            className="mb-4 flex items-center gap-2 rounded border border-rule bg-surface/60 px-3.5 py-3 text-[0.89rem] font-medium text-ink transition-colors duration-200 hover:bg-surface"
                          >
                            {item.footerLink.label}
                            <ArrowRight size={14} aria-hidden="true" />
                          </Link>
                        ) : null}
                      </>
                    ) : null}
                  </li>
                ))}
              </ul>
            </nav>

            <div className="shrink-0 space-y-3 border-t border-rule px-5 py-5">
              <ButtonLink href="/contact#requirement-form" variant="primary" className="w-full">
                Book a Consultation
              </ButtonLink>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
