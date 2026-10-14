# Information you need to replace

Everything below is a placeholder. Nothing here has been invented — where real
business information was unavailable, the site shows a bracketed placeholder in
muted grey rather than a plausible-looking fake.

Search the project for `[ADD` to find every one of them.

---

## 1. Contact details — `content/site.json` → `contact`

| Field | Placeholder | Notes |
| --- | --- | --- |
| `email` | `[ADD EMAIL ADDRESS]` | Appears in the footer, contact page and as the enquiry reply-to |
| `phone` | `[ADD PHONE NUMBER]` | Include country code, e.g. `+91 98765 43210` |
| `whatsapp` | `[ADD WHATSAPP NUMBER]` | Or replace with a `wa.me` link |
| `addressLines` | 3 placeholder lines | Or delete the entry entirely if you have no public office |
| `hours` | `[ADD WORKING HOURS]` | e.g. `Mon–Sat, 10:00–19:00 IST` |

While these are placeholders they are **also omitted from the structured
data** (`lib/schema.ts`), because publishing `[ADD PHONE NUMBER]` as machine
readable data is worse than publishing nothing. They appear in the JSON-LD
automatically once you fill them in.

## 2. Social links — `content/site.json` → `contact.social`

All four (LinkedIn, Instagram, Facebook, YouTube) are `#`. Replace with real
profile URLs, or delete the keys you do not use — the footer renders whatever
is in the object.

## 3. Domain — `.env.local`

`NEXT_PUBLIC_SITE_URL=https://www.yourdomain.com`

Used for canonical URLs, Open Graph tags, `sitemap.xml` and `robots.txt`. Also
update `brand.url` in `content/site.json`.

## 4. Legal documents — `content/site.json` → `legal.documents`

These are scaffolds with the structure a lawyer will expect, not finished legal
text. Placeholders to fill:

- Every `updated` field: `[ADD LAST-UPDATED DATE]`
- Privacy → Retention: `[ADD RETENTION PERIOD]`
- Terms → Fees: `[ADD FEE, PAYMENT AND REFUND TERMS]`
- Terms → Revisions: `[ADD REVISION POLICY]`
- Terms → Limitation of liability: `[ADD LIABILITY TERMS, REVIEWED BY A QUALIFIED LAWYER]`
- Terms → Governing law: `[ADD GOVERNING LAW AND JURISDICTION]`

**Have a lawyer review all three documents before launch.** If you handle data
from scholars in the EU or UK, the privacy policy needs GDPR-specific clauses
that are not present here.

## 5. Student reviews — `content/site.json` → `testimonials.items`

Six students are reserved by name and city, exactly as you supplied them:

| Name | Location |
| --- | --- |
| Shivani Sharma | Muzaffarnagar |
| Himanshu Tomar | Delhi |
| Rohit Kareya | Gwalior |
| Jitendra Dubey | Agra |
| Om Pandey | Rewa |
| Shubham Pandey | Varanasi |

Each `review` field currently reads `[Insert approved student review here]`.
Replace it with the student's own approved words.

Two things happen automatically when you do:

- the italic placeholder styling reverts to normal review text
- the "reviews have not been supplied yet" notice above the grid disappears

There is nothing to remember to delete. Until then, no card claims to be a
verified review.

**Do not add** university names, degrees, research topics, publication or
admission outcomes, photographs, star ratings, or an aggregate score unless the
student has approved that specific detail. The section is built to work without
any of them.

## 6. SD Publication House — `content/site.json` → `pages.bookPublication.sdPublicationHouse`

The section describes the division's editorial, design, production and advisory
work. The `placeholderNote` field holds everything that has not been confirmed:

`[ADD SD PUBLICATION HOUSE DETAILS ONCE CONFIRMED: registered entity or imprint
status, ISBN arrangements, printing partners and distribution channels.]`

It renders as a visible bracketed note. Replace it with real detail and it
renders as normal body copy instead. Nothing about registration, ISBNs,
printing or distribution has been assumed.

## 7. Published books — `content/site.json` → `pages.bookPublication.portfolio`

Five real books are live, built from the PDFs you supplied. Page images were
rendered directly from those files and live in `public/books/`. No cover was
generated or substituted.

| # | Title | Author | ISBN |
| --- | --- | --- | --- |
| 1 | Organic Chemistry (Semester-IV, as per NEP), 2025 | Mr. Mrityunjay Mandal | 978-819933139-6 |
| 2 | Physical Chemistry: States of Matter and Ionic Equilibrium, 2025 | Mr. Mrityunjay Mandal | 978-93-49653-47-4 |
| 3 | डिजिटल युग में बाल मनः… | Dr. Shikha Jain, with Abhilash Kumar Jain | 978-819933134-1 |
| 4 | भावनात्मक बुद्धिमत्ता आधारित शिक्षा… | Dr. Shikha Jain, with Abhilash Kumar Jain | 978-819933130-3 |
| 5 | परीक्षा तनाव और सफल प्रबंधन… | Dr. Shikha Jain, with Abhilash Kumar Jain | 978-819933137-2 |

Publisher is SD Publication House for all five. Books 3–5 show no year on
either page, so no year is displayed for them.

### Adding books 6 to 10

Slots 6–10 already exist in the JSON with empty fields. A slot renders only
when it has **both** a `title` and a `frontImage`, so empty slots are invisible.
To add one:

1. Put the two page images in `public/books/` as `<slug>-front.jpg` and
   `<slug>-back.jpg`. To render them from a PDF the way the first five were
   done: `pdftoppm -f 1 -l 1 -r 72 -png book.pdf out` then resize to 900px wide.
2. Fill in the matching slot in `portfolio.books`, including `frontAlt` and
   `backAlt` (screen readers depend on these).
3. Rebuild the preview if you use it: `python3 scripts/build-preview.py`.

No component or CSS change is needed, for these five or for any beyond ten —
the grid and lightbox are driven entirely by the array length.

### MRP display

`portfolio.displayMrp` is set to **`false`**. The printed MRP for each book is
already recorded in the data (₹450 / ₹350); flipping that one flag to `true`
shows it on the cards and in the lightbox. You said MRP was optional, so it is
off by default.

## 8. University / institution logos — `content/site.json` → `institutions.items`

All nine institutions are live on the **Research & Thesis** page with their exact
official names and official website links. **No logo files have been supplied,
and I did not download any.** Every logo area shows a "Logo required"
placeholder. Nothing was substituted, traced or generated.

### Files I need from you

Save each as SVG (preferred) or transparent PNG at 300px+ tall into
`public/institutions/`, using exactly these filenames:

| # | Institution | Save as | Official site |
| --- | --- | --- | --- |
| 1 | Amity University Noida | `amity-university-noida.svg` | https://noida.amity.edu/ |
| 2 | Jaypee Institute of Information Technology (JIIT), Noida | `jiit-noida.svg` | https://www.jiit.ac.in/ |
| 3 | J.S. University, Shikohabad, Uttar Pradesh | `js-university-shikohabad.svg` | https://www.jsu.ac.in/ |
| 4 | Shri Venkateshwara University, Gajraula, Uttar Pradesh | `shri-venkateshwara-university.svg` | https://www.svu.edu.in/ |
| 5 | Vikrant University, Gwalior | `vikrant-university-gwalior.svg` | https://vikrantuniversity.ac.in/ |
| 6 | ITM University, Gwalior | `itm-university-gwalior.svg` | https://www.itmuniversity.ac.in/ |
| 7 | Banasthali Vidyapith, Rajasthan | `banasthali-vidyapith.svg` | https://www.banasthali.org/ |
| 8 | Amity University Gwalior | `amity-university-gwalior.svg` | https://www.amity.edu/gwalior/ |
| 9 | Madhav Institute of Technology & Science (MITS), Gwalior | `mits-gwalior.svg` | https://web.mitsgwalior.in/ |

Then, for each one, set its `logo` field to the same path, e.g.:

```json
"logo": "/institutions/jiit-noida.svg"
```

The tile switches from placeholder to real logo the moment `logo` is non-empty.
No component change is needed, and you can do them one at a time.

### Why I did not fetch these myself

Two reasons, both real:

1. **Technically I could not.** My browsing tool returns extracted text, not
   image bytes, and my container has no outbound network. Of the sites I
   checked, Amity Noida and MITS Gwalior exposed no logo URL at all, and
   Banasthali Vidyapith blocks automated access outright
   (`ROBOTS_DISALLOWED`). Only JIIT exposed a usable path.
2. **You need permission anyway.** University marks are trademarks. Most Indian
   universities restrict third-party use, and several require written consent
   even for identification-only display. Getting the file is the easy half;
   the permission is the half that matters, and only you can obtain it.

### The wording is deliberate

The section says "institutions", never "partners", "associated", "approved" or
"affiliated". The standing disclaimer below the carousel reads:

> SetuVidya is an independent consultancy. Institution names and logos are the
> property of their respective owners and are shown for identification only.
> Their inclusion does not imply affiliation, partnership, approval or
> endorsement.

A QA test scans the rendered section for eight affiliation phrases and fails on
any that appear un-negated.

### Other settings

- `speedSeconds` — one full loop, default `48`. Higher is slower.
- `missingLogoLabel` — the placeholder wording, currently "Logo required".
- To hide the section entirely until logos arrive, remove the entries from
  `items` (the component renders nothing when the list is empty).

## 9. Company registration details

Not currently anywhere on the site. If SetuVidya is a registered entity, add
your registered name, CIN/LLPIN or GSTIN to the footer — many Indian scholars
check for this, and its absence reads as a warning sign on a consultancy site.

Add to `content/site.json` → `brand`, then render in `components/layout/Footer.tsx`.

This matters more now that SD Publication House is presented as a division: a
reader who takes the publishing arm seriously will look for the entity behind it.

---

## Things that are intentionally absent

These were **not** generated, because inventing them would be dishonest and
because a scholar who checks and finds them false will not come back:

- Student, scholar or publication counts
- Success, acceptance or admission rates
- Years in business or founding date
- Team member names, photographs or credentials
- Testimonials or reviews
- University, publisher or journal partnerships
- Awards, certifications or accreditations
- Client logos
- Pricing

Add any of these only when they are true and you can evidence them.

The two places most worth filling once you can are:

1. **A team or founder section on `/about`.** For an academic consultancy this
   is the single strongest trust signal available: a named person with a real
   research background, ideally with an ORCID or Scholar profile. Right now the
   about page argues for the service without ever showing who delivers it.
2. **Anonymised case studies.** "A management scholar came to us after two desk
   rejections; here is what we changed and what happened" is worth more than any
   testimonial, and it can be written without identifying anyone.

---

## Images

There are no photographs anywhere in the project, by design — the brief ruled
out generic student stock imagery, and every visual is drawn as vector SVG
(the bridge diagram, six background motifs, the book covers, the logo).

Nothing needs replacing. If you later commission photography of your team or
office, that is where it should go — on the about page, not as decoration.

The Open Graph share image at `public/og-default.png` is generated by
`scripts/generate-og.py` from the brand tokens. Regenerate it after any brand
change, or replace it with a designed 1200×630 PNG.

Missing and worth adding: `public/favicon.ico` for older browsers (an SVG
favicon and a 180px Apple touch icon are both present).
