# /insights — content plan

**Status: plan only. No `/insights` route has been built.**

Your brief says not to add unnecessary pages and to keep the site focused on
the four core services, and a blog with no posts in it is worse than no blog.
So this is the editorial plan; build the route when you have three or four
articles actually written.

---

## Why this is the highest-leverage SEO work left

The technical SEO on this site is complete (see `SEO-CHECKLIST.md`). It is not
what will make SetuVidya rank.

Head terms — "PhD thesis help", "Scopus publication support", "thesis writing
services" — are dominated by sites promising guaranteed publication and
guaranteed acceptance. You cannot outrank them on those terms without making
the same claims, and making them would destroy the positioning the rest of this
site is built on.

The winnable ground is informational long-tail search, where a scholar is
trying to solve a specific problem and the competition is thin, low-quality or
auto-generated. Someone searching "how to respond to reviewer 2 major revision"
has a live problem, is close to needing help, and will remember who answered
them properly.

The FAQ answers already in `content/site.json` are the seed of this. They were
written as real answers rather than as bait, which is exactly what earns both
rankings and enquiries.

---

## Target queries

Grouped by service area. These are the shapes of query worth writing for; check
current volumes yourself before committing to an order.

### Publication
- how to respond to reviewer comments major revision
- difference between SCI, SCIE, ESCI and Scopus
- how to tell if a journal is predatory
- how to check whether a journal is still Scopus indexed
- what does "desk rejected" mean and what to do next
- how to write a cover letter to a journal editor
- choosing between a high-impact and a realistic journal
- what article processing charges actually cover

### Thesis and research
- how to turn a broad interest into a researchable question
- what examiners actually look for in a methodology chapter
- how to make a literature review critical rather than descriptive
- sample size justification for a doctoral study
- how to read a similarity report properly
- what happens in a PhD viva in India
- responding to DRC or RAC feedback on a synopsis

### Book publication
- converting a PhD thesis into a monograph
- traditional vs hybrid vs self-publishing for academics
- how ISBNs work and who should register yours
- what editing an edited volume actually involves

### University admission
- how to check whether a university is UGC recognised
- what makes a statement of purpose read as generic
- documentation and attestation timelines for applications
- how to read an offer letter and a waitlist

---

## Editorial rules

These are not optional; they are what make the section worth having.

1. **One article per month, properly written.** Twelve real articles beat sixty
   thin ones, and thin content actively suppresses a small site.
2. **Answer the question in the first two paragraphs.** No preamble about how
   important research is.
3. **No claims you cannot evidence.** Same standard as the rest of the site: no
   statistics, no success rates, no named institutions you have no relationship
   with.
4. **Link to primary sources** — Clarivate's and Elsevier's own source lists,
   UGC notifications, COPE guidance — not to aggregators.
5. **Date every article and review annually.** Indexing rules, UGC-CARE status
   and journal lists change; a stale article on this subject is a liability.
6. **No AI-generated filler.** Anyone qualified to be your client can tell, and
   the whole proposition here is that a human who knows the field is answering.
7. **Soft CTA only.** A short line at the end pointing to the relevant service
   page. No pop-ups, no gates.

---

## When you build it

The architecture already supports this cleanly:

- Route: `app/insights/page.tsx` (index) and `app/insights/[slug]/page.tsx`.
- Content: either extend `content/site.json` with an `insights` array, or move
  to MDX files under `content/insights/` once you pass roughly ten articles.
- Metadata: reuse the existing `generateMetadata` pattern from
  `app/legal/[slug]/page.tsx`, which already does canonical URLs and titles.
- Structured data: add an `Article` schema builder to `lib/schema.ts` alongside
  the existing `faqSchema` and `breadcrumbSchema`.
- Sitemap: add the slugs to `app/sitemap.ts`, which already maps over
  `legal.documents` and can map over articles the same way.
- Navigation: add `{ "label": "Insights", "href": "/insights" }` to the `nav`
  array in `content/site.json`. Nothing else needs editing.

Estimated build effort once you have the articles: half a day. The reason not
to do it now is content, not code.
