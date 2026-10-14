# SetuVidya Consultancy

Marketing site for an academic research and education consultancy.
Next.js 14 (App Router) · TypeScript · Tailwind CSS.

**Bridging Research, Knowledge & Academic Success**

---

## Quick start

```bash
npm install
cp .env.example .env.local     # then fill in at least NEXT_PUBLIC_SITE_URL
npm run dev                    # http://localhost:3000
```

Other commands:

| Command | What it does |
| --- | --- |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (next/core-web-vitals) |
| `npm run typecheck` | `tsc --noEmit` |
| `python3 scripts/build-preview.py` | Rebuild the static design-review preview |
| `python3 scripts/generate-og.py` | Regenerate the social share image |
| `node scripts/qa-preview.js` | Browser QA: navigation, accordions, forms, responsive |
| `node scripts/qa-a11y.js` | Accessibility audit incl. accessibility-tree snapshot |
| `node scripts/qa-contrast.js` | WCAG AA contrast audit across every page |
| `node scripts/qa-books.js` | Published-books portfolio and lightbox |

The three QA scripts need Playwright with a Chromium binary
(`npm i -D playwright && npx playwright install chromium`).

> **Build status: NOT BUILT.** `npm install` fails in the authoring
> environment. The egress proxy returns
> `HTTP 403` with `x-deny-reason: host_not_allowed` for
> `registry.npmjs.org`, and there is no npm cache to install from offline. Consequently
> `npm run lint`, `npm run typecheck` and `npm run build` have **not** been run
> to completion, and no one should read this README as saying the build passes.
>
> Because `next` is never installed, `npm run lint` and `npm run build` both
> fail with `sh: 1: next: not found`, and `npm run typecheck` reports only
> `Cannot find module` errors for the absent dependencies.
>
> What *was* run instead, and passed:
>
> - `tsc --noResolve` — found and fixed one build-blocking error
>   (`column()` called with 3 of 4 arguments in `Motifs.tsx`)
> - Tailwind utility audit — found and fixed `sm:py-18`, which is not on
>   Tailwind's default spacing scale and was silently doing nothing
> - Import/export resolution across all 40 internal modules — clean
> - Server/client boundary audit (`'use client'`, metadata placement,
>   function props crossing the boundary) — clean
> - JSON content-path audit — every path used by a component exists
> - Three browser suites, 145 checks total (see **QA** below)
>
> Run `npm install && npm run typecheck && npm run lint && npm run build`
> yourself. Until that succeeds, treat this project as unverified for
> deployment.

---

## The preview file

`preview/setuvidya-preview.html` is a single self-contained HTML file covering
every page. It is generated from `content/site.json` by
`scripts/build-preview.py`, so its copy can never drift from the real site.

Open it in any browser to review the design without running Node. Navigation,
dropdowns, the mobile drawer, accordions and form validation all work. The
enquiry form has no backend there and says so rather than faking success.

It is a **review artefact**. The deliverable you deploy is the Next.js project.

---

## Where things live

```
setuvidya-consultancy/
├─ app/
│  ├─ layout.tsx                 Fonts, metadata defaults, header/footer, JSON-LD
│  ├─ page.tsx                   Home
│  ├─ globals.css                Design tokens, base type, motion, focus
│  ├─ about/ services/ contact/  Page routes
│  ├─ research-thesis/ publication/ book-publication/ university-admission/
│  ├─ legal/[slug]/              Privacy, terms, disclaimer (data-driven)
│  ├─ api/enquiry/route.ts       Form intake + delivery adapters
│  ├─ sitemap.ts  robots.ts  not-found.tsx
│
├─ components/
│  ├─ ui/primitives.tsx          Container, Section, SectionHeading, Button, Panel
│  ├─ ui/Reveal.tsx              Scroll reveal (client)
│  ├─ ui/Accordion.tsx           FAQ disclosure (client)
│  ├─ ui/StageTrack.tsx          The reusable stage sequence
│  ├─ layout/Header.tsx          Sticky nav, dropdown, mobile drawer (client)
│  ├─ layout/Footer.tsx
│  ├─ brand/Logo.tsx             Bridge mark + wordmark
│  ├─ forms/EnquiryForm.tsx      Validation, loading, success, error (client)
│  ├─ motifs/Motifs.tsx          Six per-section background motifs
│  ├─ motifs/HeroSpan.tsx        The hero bridge diagram
│  ├─ motifs/BookMockup.tsx      Vector book covers
│  └─ sections/                  Page-level composed sections
│
├─ content/site.json             ← every word on the site
├─ lib/
│  ├─ content.ts                 Typed accessors over site.json
│  ├─ validation.ts              Zod schema shared by form and API
│  ├─ schema.ts                  Organization / Service / FAQ / Breadcrumb JSON-LD
│  └─ utils.ts                   cn(), site URL helpers
│
├─ public/                       favicon, logo, OG image, manifest
│  └─ books/                     real book page images (front + back per title)
├─ preview/                      Generated design-review HTML
└─ scripts/                      Preview + OG generators
```

### Editing content

Almost every change is a `content/site.json` edit — services, FAQs,
disciplines, legal text, form dropdown options, contact details. No component
changes required. The disciplines list in particular is a flat array designed
to be edited or trimmed as your actual expertise changes.

After editing, rebuild the preview if you use it:
`python3 scripts/build-preview.py`.

---

## QA

Three Playwright suites run against `preview/setuvidya-preview.html`, which
shares its markup, copy, CSS tokens and interaction behaviour with the Next.js
app. Last recorded run:

| Suite | Result |
| --- | --- |
| `qa-preview.js` | 119 checks, 119 passed |
| `qa-a11y.js` | 26 checks, 26 passed |
| `qa-contrast.js` | no WCAG AA failures |
| `qa-books.js` | 51 checks, 51 passed |

`qa-preview.js` covers all 11 pages, heading hierarchy, 36 accordion items,
the Services dropdown, every internal link, the mobile drawer and submenu,
the review section, the enquiry form's validation and states, keyboard
operation, nine viewport widths from 320px to 1920px, reduced motion, the
JS-disabled fallback, and a scan for guarantee claims in the copy.

These test the preview, not the React build. Re-run them after
`npm install` succeeds by pointing Playwright at `localhost:3000`.

## Design system

| Token | Value | Used for |
| --- | --- | --- |
| `ink` | `#0B1B2B` | Headings, dark sections |
| `navy` | `#12314F` | Structure, icons, motif strokes |
| `indigo` | `#2B4A8B` | Links, primary buttons |
| `brass` | `#A8802C` | Accent marks, rules, bridge nodes (non-text) |
| `brass-text` | `#86661F` | Brass at label size on light — 5.3:1 |
| `brass-on-dark` | `#C6A04E` | Brass at label size on ink — 7.1:1 |
| `numeral` | `#7C8B9F` | Large decorative numerals — 3.5:1 |
| `teal` | `#0F6A72` | Data and success marks only |
| `surface` | `#F4F6F9` | Alternating section fills |
| `rule` | `#DDE3EA` | Hairlines and panel borders |

Every one of those values was measured with `scripts/qa-contrast.js`, not
chosen by eye. Brass has three tokens because a single brass fails AA at label
sizes on one surface or the other.

Type: **Source Serif 4** for headings, **IBM Plex Sans** for UI and body, both
self-hosted through `next/font`. Radius is 4px throughout; shadows are reserved
for elements that are actually interactive.

The recurring structural device is a **bridge span** — a hairline with pier
nodes — used for the hero, the academic journey, the research pipeline, the
publication workflow and the admission pathway.

### Backgrounds

Each section's background describes the service behind it, per the brief:

| Motif | Where |
| --- | --- |
| Citation network | Home, services, closing CTA |
| Document outline with margin ruler | About, research & thesis, legal |
| Journal columns, results chart, bracketed citations | Publication |
| Book spines and an open book | Book publication |
| Campus colonnade with a converging path | University admission |
| Correspondence signal arcs | Contact |

All are inline SVG at 3–6% opacity, `aria-hidden`, and add no image weight.

---

## Information architecture note

The brief lists eight top-level nav items. Eight does not fit a desktop bar at
a readable size without crowding, so the desktop nav is:

**Home · About · Services ▾ · Research · Publication · Contact** + *Book a consultation*

Research and Publication appear both as top-level shortcuts and inside the
Services dropdown, which also carries Book Publication, University Admission
and an "All services" link. The mobile drawer lists everything, flat, with the
Services children nested underneath.

To change this, edit the `nav` array in `content/site.json`.

---

## Environment variables

See `.env.example`. Only the first is required to build.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | yes | Canonical origin for metadata, OG tags, sitemap, robots |
| `RESEND_API_KEY`, `ENQUIRY_TO_EMAIL`, `ENQUIRY_FROM_EMAIL` | one channel | Email delivery via Resend |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | one channel | Insert into a `enquiries` table |
| `GOOGLE_SHEETS_WEBHOOK_URL` | one channel | Apps Script Web App endpoint |
| `ENQUIRY_WEBHOOK_URL`, `ENQUIRY_WEBHOOK_SECRET` | one channel | CRM / Zapier / Make / n8n / WhatsApp Business API |

**The form does not fake success.** If no channel is configured, `/api/enquiry`
returns `503` and the form shows a real error telling the visitor to email you
directly. Configure a channel before launch, then submit a test enquiry and
confirm it arrives.

### Adding a CRM

Write one more `deliverVia…` function in `app/api/enquiry/route.ts` returning
`true` on success and `false` when its env vars are absent, then add it to the
`||` chain. The adapters are deliberately small.

---

## Deployment

### Vercel (recommended)

1. Push to GitHub, then import the repository at vercel.com.
2. Framework preset: **Next.js**. Build command and output are detected.
3. Add the environment variables above under Project → Settings → Environment
   Variables. Set `NEXT_PUBLIC_SITE_URL` to your production domain.
4. Add your domain under Project → Settings → Domains and point DNS.
5. Redeploy after adding env vars — Next.js inlines `NEXT_PUBLIC_*` at build.

### Anywhere else

`npm run build && npm start` behind a reverse proxy, or Docker with a Node 18+
base image. The enquiry route needs a Node runtime; a fully static export
(`output: 'export'`) would drop it, so keep server rendering enabled.

### After going live

- Submit `https://yourdomain.com/sitemap.xml` in Google Search Console.
- Verify `robots.txt` and the OG image with a social share debugger.
- Run Lighthouse on the home page and on `/research-thesis`.
- Send one test enquiry end to end.

---

## Accessibility

Built in rather than retrofitted: skip link, visible `:focus-visible` rings,
semantic landmarks, one `h1` per page with an ordered heading hierarchy,
`aria-expanded`/`aria-controls` on the nav dropdown and FAQ accordion, labelled
form fields with `aria-invalid` and `aria-describedby` error wiring, an
`role="alert"` error summary that takes focus, `aria-current` on active nav and
breadcrumbs, `aria-hidden` on every decorative SVG, and full
`prefers-reduced-motion` support.

Reveal animations are gated behind a `data-js` flag set before paint, so a
script failure or a no-JS reader gets the whole page rather than a blank one.

Not yet verified: colour contrast has been designed to pass AA but not measured
with a tool, and the site has not been tested with a real screen reader. Both
are on the list below.

---

## Recommended next steps

**Before launch**
1. `npm install`, then `npm run typecheck`, `npm run lint` and `npm run build`.
   None of these has been run successfully; see the build-status note above.
2. Fill in everything in `CONTENT-TO-REPLACE.md`, including the six student
   reviews and the SD Publication House details.
3. Configure and test one enquiry delivery channel.
4. Have a lawyer review the privacy policy and terms; the current text is a
   scaffold with placeholders, not legal advice.
5. Re-run the three QA suites against the running Next.js app, not the preview.
6. Test with a real screen reader (NVDA or VoiceOver). The audit script checks
   structure, names and the accessibility tree, but it cannot tell you how the
   page actually sounds.

**Soon after**
6. Add Turnstile or hCaptcha to the form (env vars are already stubbed).
7. Replace the in-memory rate limiter in `app/api/enquiry/route.ts` with Upstash
   Redis — the current one resets on every serverless cold start.
8. Add analytics (Vercel Analytics or Plausible) and set up Search Console.
9. Store uploads in object storage (S3, R2, Supabase Storage) rather than
   attaching them to email, once volume justifies it.

**Later**
10. A blog or resources section under `/insights` — the strongest SEO lever
    left. Full editorial plan, target queries and build notes are in
    `INSIGHTS-CONTENT-PLAN.md`. Not built: a blog with no posts is worse than
    no blog.
11. Case studies, once you have client permission. Anonymised and specific
    beats testimonials.
12. `next-intl` if you want Hindi or regional language versions.
13. A CMS (Sanity, Payload) if non-technical staff need to edit copy. The
    `content/site.json` structure maps cleanly onto one.
14. Per-page OG images generated with `next/og`.

---

## What this site deliberately does not do

No invented statistics, success rates, university affiliations, journal
partnerships, testimonials or client counts. No guarantee of publication,
acceptance or admission anywhere in the copy. Trust is carried by qualitative
capability statements and by the academic integrity position, which is stated
in the footer of every page, on the about page, on the publication and
admission pages, and in the contact form's consent text.

If you add claims later, add ones you can substantiate.
