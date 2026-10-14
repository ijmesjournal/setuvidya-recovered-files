# SEO checklist

## Implemented

**Metadata**
- [x] `metadataBase` set from `NEXT_PUBLIC_SITE_URL`, so every relative URL resolves
- [x] Title template `%s | SetuVidya Consultancy`, with a distinct, keyword-appropriate title per page
- [x] Unique meta description per page, written as a sentence rather than a keyword list
- [x] Canonical URL declared on every page via `alternates.canonical`
- [x] Open Graph tags (type, site name, title, description, locale `en_IN`, 1200×630 image)
- [x] Twitter `summary_large_image` card
- [x] `robots` directives with `max-image-preview: large` and `max-snippet: -1`
- [x] `themeColor`, viewport, favicon, Apple touch icon, web manifest

**Crawling**
- [x] `app/sitemap.ts` — all 8 pages plus 3 legal pages, with per-route priority and change frequency
- [x] `app/robots.ts` — allows everything except `/api/`, declares the sitemap
- [x] Real `<a href>` links throughout; no JavaScript-only navigation
- [x] Breadcrumb navigation on every inner page

**Structured data (JSON-LD)**
- [x] `Organization` + `ProfessionalService` with logo, slogan, `knowsAbout`, `areaServed` — sitewide
- [x] `WebSite` — sitewide
- [x] `Service` with an `OfferCatalog` per practice area — home and services pages
- [x] `FAQPage` on home, services, research & thesis, publication, book publication, admission
- [x] `BreadcrumbList` on every inner page
- [x] Contact fields **omitted while they are placeholders** rather than emitting `[ADD PHONE NUMBER]`

**On-page**
- [x] Semantic HTML: `header`, `nav`, `main`, `section`, `article`, `footer`, `address`, `ol`/`ul` for real lists
- [x] One `h1` per page, no skipped heading levels
- [x] Descriptive `aria-label` on meaningful SVGs; decorative motifs are `aria-hidden`
- [x] Internal linking between related pages (services ↔ detail pages, footer, 404)
- [x] Content depth: every service page carries substantive unique copy, not a stub

**Technical**
- [x] Fonts self-hosted via `next/font` — no render-blocking third-party request, no CLS from swap
- [x] Zero raster images above the fold; all visuals are inline SVG
- [x] Server components by default; only Header, Reveal, Accordion and EnquiryForm ship JS
- [x] Security headers in `next.config.mjs`
- [x] `compress: true`, `poweredByHeader: false`

**Positioning**
Titles target the brief's terms without stuffing — "PhD & M.Tech Thesis
Consultancy", "SCI, Scopus & Peer-Reviewed Publication Support", "Academic Book
Publication Support", "University Admission Assistance". Each appears once in a
title, once in a description, and naturally in body copy.

---

## To do before launch

- [ ] Set `NEXT_PUBLIC_SITE_URL` to the production domain and redeploy
- [ ] Verify the domain in Google Search Console; submit `/sitemap.xml`
- [ ] Set up Bing Webmaster Tools
- [ ] Test the OG image in the Facebook Sharing Debugger and LinkedIn Post Inspector
- [ ] Validate structured data in Google's Rich Results Test — check the FAQ and Organization results specifically
- [ ] Run Lighthouse on `/` and `/research-thesis`; investigate anything under 90
- [ ] Add `public/favicon.ico` for older browsers
- [ ] Create a Google Business Profile if you have a physical office (drives local "PhD thesis help near me" queries)
- [ ] Decide on `www` vs apex and 301 the other; set the canonical to match

## To do after launch

- [ ] Add analytics and watch which service page actually converts
- [ ] Write per-page OG images with `next/og`
- [ ] Start an `/insights` section — full editorial plan in `INSIGHTS-CONTENT-PLAN.md`
- [ ] Build citations on academic and business directories
- [ ] Monitor Search Console for pages that get impressions but no clicks; those are description problems, not ranking problems

---

## Structured data and the review section

The `Review` and `AggregateRating` schema types are **deliberately not used**.
They require real, attributable reviews, and Google penalises fabricated review
markup. Add `Review` nodes to `lib/schema.ts` only once the six students have
supplied approved text, and never add `AggregateRating` without a genuine
count and average.

## The honest strategic note

Technical SEO is table stakes and this site has it. It is not what will make
SetuVidya rank.

Search results for "PhD thesis help" and "Scopus publication support" are
dominated by sites making exactly the guarantees this site deliberately refuses
to make. You will not out-compete them on those head terms, and trying to would
mean adopting their claims.

The realistic route is the long tail, where the intent is informational and the
competition is thin:

- "how to respond to reviewer comments major revision"
- "difference between SCI SCIE and Scopus indexing"
- "how to tell if a journal is predatory"
- "converting PhD thesis into a monograph"
- "UGC CARE list requirement for PhD award"

The FAQ answers already in `content/site.json` are the seed of this. They are
written as real answers rather than as bait, which is exactly what ranks and
what earns a scholar's trust well enough to make them enquire.

One genuinely useful article per month on questions like these will do more
than any amount of further metadata work.
