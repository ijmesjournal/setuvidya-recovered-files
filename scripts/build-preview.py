#!/usr/bin/env python3
"""Assemble preview/setuvidya-preview.html. See _preview_parts.py for helpers."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from _preview_css import CSS  # noqa: E402
import base64
import json
from datetime import datetime

from _preview_parts import (
    ROOT,  # noqa: E402
    DATA, OUT, accordion, book_mockup, book_portfolio, btn, e, heading,
    book_commerce, hero_span, institution_marquee, kicker, logo, motif, motif_light,
    data_uri, nav_icon, research_domains, stage_track, thesis_anatomy,
)

B = DATA["brand"]
C = DATA["contact"]
HOME = DATA["home"]
PAGES = DATA["pages"]
FAQS = DATA["faqs"]
GROUPS = DATA["serviceGroups"]
DISC = DATA["disciplines"]
LEGAL = DATA["legal"]
FORM = DATA["form"]
TESTI = DATA["testimonials"]
INSTITUTIONS_HOME_SUBTITLE = DATA["institutions"]["homeSubtitle"]
BRAND = DATA["brand"]
JOURNAL_URL = DATA.get("journalUrl", "")
JOURNAL_OK = JOURNAL_URL.strip().lower().startswith(("http://", "https://"))

_MARK_ICONS = {
    "research": '<path d="M4 2h8l4 4v6"/><path d="M12 2v4h4"/><path d="M4 2v18a1 1 0 0 0 1 1h5"/>'
                '<circle cx="15" cy="16" r="4"/><path d="M18.5 19.5 21.5 22.5"/>',
    "publication": '<path d="M17 3H6a2 2 0 0 0-2 2v13"/><path d="M4 18a3 3 0 0 0 3 3h11a2 2 0 0 0 2-2V8"/>'
                   '<path d="M20 8h-3a2 2 0 0 1-2-2V3"/><path d="M8 8h5"/><path d="M8 12h6"/><path d="M8 16h4"/>',
    "book": '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    "admission": '<path d="M4 22h16"/><path d="M6 18v-8"/><path d="M10 18v-8"/><path d="M14 18v-8"/>'
                 '<path d="M18 18v-8"/><path d="M12 2 2 8h20z"/>',
}

_STRIP_ICONS = {
    "guidance": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>'
                '<path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    "domains": '<path d="M9 18h6"/><path d="M10 22h4"/>'
               '<path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>',
    "tools": '<path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/>'
             '<rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/>',
    "future": '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/>'
              '<path d="M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20z"/>',
}


def _icon(paths, size=19):
    return (f'<svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" '
            f'stroke="currentColor" stroke-width="1.65" stroke-linecap="round" '
            f'stroke-linejoin="round" aria-hidden="true" focusable="false">{paths}</svg>')


def hero_bg():
    """The desk visual, inlined as a data URI. Painted as a background layer so
    there is no <img> box, border or rounded container in the hero."""
    src = (HOME["hero"].get("image", {}).get("src") or "").strip()
    if not src or not (ROOT / "public" / src.lstrip("/")).exists():
        return ""
    # Native width only. Resampling upward here added blur and JPEG artifacts
    # on top of a source that is already being enlarged by the browser.
    return data_uri(src, width=1415, quality=95)


def hero_trust():
    icons = {
        "guidance": '<path d="M22 10v6"/><path d="M6 12.5V17a6 3 0 0 0 12 0v-4.5"/>'
                    '<path d="m2 10 10-5 10 5-10 5z"/>',
        "resources": '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/>'
                     '<path d="M14 2v5h5"/><path d="M8 13h8"/><path d="M8 17h5"/>',
        "opportunities": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>'
                         '<path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
        "possibilities": '<path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/>'
                         '<rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/>',
    }
    out = ""
    for i, item in enumerate(HOME["hero"]["trustRow"]):
        out += (f'<li><span class="hero-trust-item">'
                f'{_icon(icons[item["icon"]], 20)}<span>{e(item["label"])}</span>'
                f'</span></li>')
    return out







def _digits(value):
    d = "".join(ch for ch in (value or "") if ch.isdigit())
    return d if len(d) >= 10 else None


def hours_rows(dark=False):
    """Description list: day range as the term, opening time as the value."""
    h = C["hours"]
    rows = ""
    for r in h["schedule"]:
        cls = "hrs-closed" if r.get("closed") else "hrs-open"
        rows += (f'<div><dt>{e(r["days"])}</dt>'
                 f'<dd class="{cls}">{e(r["time"])}</dd></div>')
    return f'<dl class="hrs{" hrs-dark" if dark else ""}">{rows}</dl>'


def hours_detail():
    h = C["hours"]
    return (f'<div class="detail-list"><div>'
            f'<p class="detail-label">{e(h["label"])}</p>'
            f'<div class="detail-value">{hours_rows()}</div>'
            f'</div></div>')


def contact_href(kind):
    """Mirrors contactLinks in lib/content.ts: one derivation, no re-typing."""
    if kind == "mailto":
        v = C.get("email", "")
        return None if is_ph(v) else "mailto:" + v
    if kind == "tel":
        d = None if is_ph(C.get("phone", "")) else _digits(C.get("phone"))
        return ("tel:+" + d) if d else None
    if kind == "whatsapp":
        d = None if is_ph(C.get("whatsapp", "")) else _digits(C.get("whatsapp"))
        return ("https://wa.me/" + d) if d else None
    return None

HREF = {
    "/": "#/",
    "/about": "#/about",
    "/services": "#/services",
    "/research-thesis": "#/research-thesis",
    "/publication": "#/publication",
    "/book-publication": "#/book-publication",
    "/university-admission": "#/university-admission",
    "/contact": "#/contact",
    "/education-updates": "#/education-updates",
    "/research-guide": "#/research-guide",
    "/scopus-journal-list": "#/scopus-journal-list",
    "/sci-journal-list": "#/sci-journal-list",
    "/abdc-journal-list": "#/abdc-journal-list",
    "/faq": "#/faq",
    "/testimonials": "#/testimonials",
    "/contact#requirement-form": "#/contact",
}


def h(path):
    """Route href only. An anchor in the path travels separately in
    data-scroll, because the preview already routes on the hash and a second
    '#' produces an unresolvable '#/#anchor'."""
    base = path.split("#", 1)[0] or "/"
    return HREF.get(base, "#" + base)


def anchor_of(path):
    """The in-page target of a link like /contact#requirement-form."""
    return path.split("#", 1)[1] if "#" in path else None


def is_ph(v):
    return v.strip().startswith("[")


def cta_block(title=None, body=None, primary=None, secondary=None):
    c = HOME["cta"]
    p = primary or c["primary"]
    s = secondary or c["secondary"]
    return f"""
<section class="cta">{motif_light(0.12)}
  <div class="shell">
    <div>
      <h2>{e(title or c["title"])}</h2>
      <p class="lede">{e(body or c["body"])}</p>
    </div>
    <div class="cta-actions">
      {btn(p["label"], h(p["href"]), "primary", scroll_to=anchor_of(p["href"]))}{btn(s["label"], h(s["href"]), "onDark", scroll_to=anchor_of(s["href"]))}
    </div>
  </div>
</section>"""


def crumbs(trail):
    out = '<nav aria-label="Breadcrumb"><ol class="crumbs">'
    for i, (name, href) in enumerate(trail):
        if i:
            out += '<li class="sep" aria-hidden="true">&rsaquo;</li>'
        if i == len(trail) - 1:
            out += f'<li aria-current="page">{e(name)}</li>'
        else:
            out += f'<li><a href="{h(href)}">{e(name)}</a></li>'
    return out + "</ol></nav>"


def page_hero(k, title, lede, trail, mot, cta=None, extra=""):
    cta_html = (f'<div style="margin-top:32px">'
                f'{btn(cta["label"], h(cta["href"]), "primary", scroll_to=anchor_of(cta["href"]))}'
                f'</div>') if cta else ""
    return f"""
<section class="page-hero">{motif(mot, .06)}
  <div class="shell">
    {crumbs(trail)}
    {kicker(k)}
    <h1>{e(title)}</h1>
    <p class="lede" style="margin-top:20px;max-width:68ch">{e(lede)}</p>
    {cta_html}{extra}
  </div>
</section>"""



def review_cards():
    """Six named students. A card publishes only once that student has confirmed
    their own wording (`approved`), so drafts can sit in the data without ever
    appearing. Stars come from `rating`, only on an approved card. No photos."""
    items = TESTI["items"]
    published = [t for t in items if t.get("approved") and t.get("review", "").strip()]

    star = ('<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">'
            '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 '
            '5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>')

    cards = ""
    for t in published:
        ini = "".join(w[0] for w in t["name"].split()[:2]).upper()
        rating = t.get("rating") or 0
        stars = ""
        if isinstance(rating, int) and rating > 0:
            stars = (f'<p class="review-stars" role="img" aria-label="{rating} out of 5 stars">'
                     + star * rating + '</p>')
        cards += (f'<li class="reveal"><figure class="panel review-card">{stars}'
                  f'<span class="review-quote" aria-hidden="true">&ldquo;</span>'
                  f'<blockquote><p class="review-text">{e(t["review"])}</p></blockquote>'
                  f'<figcaption class="review-by">'
                  f'<span class="review-avatar" aria-hidden="true">{ini}</span>'
                  f'<span><span class="review-name">{e(t["name"])}</span>'
                  f'<span class="review-loc">{e(t["location"])}</span></span>'
                  f'</figcaption></figure></li>')

    if not cards:
        return ""
    # Native horizontal scroller with scroll-snap: no carousel library, so
    # touch swipe and keyboard scrolling work by default.
    return (f'<div class="rv-rail-wrap">'
            f'<ul class="rv-rail">{cards}</ul>'
            f'<div class="rv-controls">'
            f'<button type="button" class="rv-prev" aria-label="Previous testimonials">&#8249;</button>'
            f'<button type="button" class="rv-next" aria-label="More testimonials">&#8250;</button>'
            f'<span class="rv-hint">Scroll or swipe for more</span>'
            f'</div></div>')


def sd_publication_house():
    sd = PAGES["bookPublication"]["sdPublicationHouse"]
    body = "".join(f'<p class="prose" style="margin-top:16px">{e(x)}</p>' for x in sd["body"])
    caps = ""
    for i, c in enumerate(sd["capabilities"]):
        caps += (f'<li class="reveal"><span class="numeral brass" style="font-size:1.5rem;display:block"'
                 f' aria-hidden="true">{i + 1:02d}</span>'
                 f'<h3 class="cell-title">{e(c["title"])}</h3>'
                 f'<p class="cell-body">{e(c["body"])}</p></li>')
    # Publishing identity block. Logo is the visual element; type stays on scale.
    logo_src = (sd.get("logo") or "").strip()
    identity = ""
    if logo_src and (ROOT / "public" / logo_src.lstrip("/")).exists():
        identity = (f'<div class="sd-identity">'
                    f'<img class="sd-logo" src="{data_uri(logo_src, width=900, quality=88)}" '
                    f'alt="{e(sd["logoAlt"])}" width="1556" height="227">'
                    f'<p class="sd-text">{e(sd["identity"])}</p></div>')

    # A bracketed internal reminder renders nothing publicly; real copy shows.
    ph = sd["placeholderNote"].strip().startswith("[")
    note = ("" if ph
            else f'<p class="prose" style="margin-top:24px">{e(sd["placeholderNote"])}</p>')
    return f'''
<section class="section bordered" id="sd-publication-house">{motif("book", .04)}
  <div class="shell split-even">
    <div>
      {heading(sd["kicker"], sd["title"], sd["lede"])}
      {identity}
      {body}
      <div style="margin-top:32px">{btn(sd["cta"]["label"], h(sd["cta"]["href"]), "primary")}</div>
    </div>
    <div>
      <ul class="grid-cells" style="margin-top:0">{caps}</ul>
      {note}
    </div>
  </div>
</section>'''


# ------------------------------------------------------------------ home ---


def page_home():
    pillars = ""
    for p in HOME["trust"]["pillars"]:
        pillars += (f'<li class="reveal"><h3 class="cell-title">{e(p["title"])}</h3>'
                    f'<p class="cell-body">{e(p["body"])}</p></li>')
    pillars += ('<li class="navy reveal"><p>No claimed statistics, no invented success rates. '
                'Judge us on the scope we agree and the work we return.</p>'
                f'<a href="{h("/about")}">How we work &rarr;</a></li>')

    services = ""
    for i, g in enumerate(GROUPS):
        tags = "".join(f'<li class="tag">{e(x)}</li>' for x in g["items"][:7])
        more = (f'<li class="tag plain">+{len(g["items"]) - 7} more</li>'
                if len(g["items"]) > 7 else "")
        key = SVC_ORDER[i % 4]
        services += f"""
<div class="panel interactive reveal svc-card svc-{key}" style="padding:32px;display:flex;flex-direction:column">
  <span class="svc-bar" aria-hidden="true"></span>
  <div style="display:flex;justify-content:space-between;gap:24px;align-items:flex-start">
    <div>
      <span class="svc-tile">{_icon(_SVC_ICON[key], 22)}</span>
      <h3 style="margin-top:20px"><a class="svc-stretch" href="{h(g["href"])}">{e(g["title"])}</a></h3>
    </div>
    <span class="svc-num" aria-hidden="true">{i + 1:02d}</span>
  </div>
  <p style="margin-top:12px;max-width:68ch">{e(g["blurb"])}</p>
  <ul class="tag-list">{tags}{more}</ul>
  <span style="margin-top:28px;color:var(--indigo);font-weight:500;font-size:.93rem">
    Explore {e(g["title"].lower())} &rarr;</span>
</div>"""

    why = ""
    for w in HOME["why"]["items"]:
        why += (f'<li class="reveal"><span class="check" style="margin:0 0 14px"></span>'
                f'<h3 class="cell-title" style="margin-top:0">{e(w["title"])}</h3>'
                f'<p class="cell-body">{e(w["body"])}</p></li>')

    steps = ""
    for s in HOME["steps"]["items"]:
        steps += (f'<li class="reveal"><span class="numeral brass" style="font-size:2.6rem;display:block"'
                  f' aria-hidden="true">{s["n"]}</span>'
                  f'<h3 class="cell-title">{e(s["title"])}</h3>'
                  f'<p class="cell-body">{e(s["body"])}</p></li>')

    disc = ""
    for d in DISC["items"]:
        disc += (f'<li class="reveal" style="border-top:1px solid var(--rule);padding-top:16px">'
                 f'<h3 class="cell-title" style="margin-top:0;font-size:.98rem">{e(d["name"])}</h3>'
                 f'<p class="cell-body" style="color:var(--muted);font-size:.9rem">{e(d["note"])}</p></li>')

    home_faqs = [
        FAQS["Thesis consultancy"][0], FAQS["Research publication"][0],
        FAQS["University admission"][0], FAQS["Book publication"][0],
        FAQS["Thesis consultancy"][4],
    ]

    # Sections are authored below in a single template for readability, then
    # ordered here to match the brief: core services first, reviews before the
    # FAQ. Every top-level block starts with "<section", so splitting on that
    # gives one chunk per section.

    about_body = "".join(f'<p class="prose" style="margin-bottom:20px">{e(p)}</p>'
                         for p in HOME["aboutPreview"]["body"])

    template = f"""
<section class="hero">
  <div class="hero-visual" aria-hidden="true" style="background-image:url({hero_bg()})"></div>
  <div class="hero-fade" aria-hidden="true"></div>
  <div class="hero-fade-top" aria-hidden="true"></div>
  <div class="hero-fade-bottom" aria-hidden="true"></div>
  <div class="shell">
    <div class="hero-copy">
      <p class="hero-eyebrow"><span class="hero-rule" aria-hidden="true"></span>{e(HOME["hero"]["eyebrow"])}</p>
      <h1 class="hero-title">
        <span class="hero-lead">{e(HOME["hero"]["headlineLead"])}</span>
        <span class="hero-accent">{e(HOME["hero"]["headlineAccent"])}</span>
      </h1>
      <p class="lede hero-sub">{e(HOME["hero"]["sub"])}</p>
      <div class="hero-actions">
        {btn(HOME["hero"]["primaryCta"]["label"] + " \u2192", h(HOME["hero"]["primaryCta"]["href"]), "primary", scroll_to=anchor_of(HOME["hero"]["primaryCta"]["href"]))}
        {btn(HOME["hero"]["secondaryCta"]["label"], h(HOME["hero"]["secondaryCta"]["href"]), "secondary")}
      </div>
      <ul class="hero-trust">{hero_trust()}</ul>
    </div>
  </div>
</section>

<section class="section surface bordered">
  <div class="shell">
    {heading("What we support", HOME["trust"]["title"], HOME["trust"]["intro"])}
    <ul class="grid-cells c3" style="margin-top:48px">{pillars}</ul>
  </div>
</section>

<section class="section ink">
  <div class="shell">
    {heading("The pathway", "Your academic journey, and where the bridge carries you",
             "Most scholars do not need every service. They need the right one at the right point in a sequence that nobody explained to them.", invert=True)}
    {stage_track(DATA["journey"], invert=True)}
  </div>
</section>

<section class="section bordered">{motif("document", .035)}
  <div class="shell split-even">
    <div>
      {heading("About SetuVidya", HOME["aboutPreview"]["title"])}
      <div style="margin-top:32px">{btn(HOME["aboutPreview"]["cta"]["label"], h(HOME["aboutPreview"]["cta"]["href"]), "secondary")}</div>
    </div>
    <div>{about_body}</div>
  </div>
</section>

<section class="section surface bordered">
  <div class="shell">
    {heading("Core services", "Four practice areas, one continuous pathway",
             "Each area works on its own. Together they cover the route from a first research question to published, defensible work.")}
    <div class="cols-2" style="margin-top:48px">{services}</div>
  </div>
</section>

<section class="section bordered">
  <div class="shell">
    {heading("Why SetuVidya", HOME["why"]["title"])}
    <ul style="margin-top:48px;display:grid;gap:36px 40px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">{why}</ul>
  </div>
</section>

<section class="section surface bordered">{motif("network", .045)}
  <div class="shell">
    {heading("How it works", HOME["steps"]["title"], HOME["steps"]["intro"])}
    <ol class="grid-cells c5" style="margin-top:56px">{steps}</ol>
  </div>
</section>

<section class="section bordered">
  <div class="shell">
    {heading("Research domains", DISC["title"], DISC["intro"])}
    <ul style="margin-top:48px;display:grid;gap:28px 32px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">{disc}</ul>
  </div>
</section>

<section class="section surface bordered">
  <div class="shell split">
    <div>
      {heading("Questions", HOME["faqTitle"])}
      <p class="prose" style="margin-top:24px;font-size:.95rem">More questions are answered on each service page, grouped by thesis work, publication, books and admission.</p>
      <div style="margin-top:28px">{btn("See all services", h("/services"), "secondary")}</div>
    </div>
    {accordion(home_faqs, "home-faq")}
  </div>
</section>
{cta_block()}"""

    chunks = ["<section" + c for c in template.split("<section")[1:]]
    # The separate hero strip is gone; the hero carries the trust row inline.
    (hero_c, trust_c, journey_c, about_c, services_c,
     why_c, steps_c, disc_c, faq_c, cta_c) = chunks
    return "".join([
        hero_c,
        # trust_c, journey_c and disc_c are no longer part of Home: each
        # repeated an idea already covered by services, the process section or
        # the single Research Areas section.
        # About preview and the engagement-process section are no longer part
        # of Home; both are covered by the dedicated pages.
        # Home carries previews only; the detail lives on the dedicated pages.
        services_c, about_c,
        # Order: hero, services, about, research areas, research guide,
        # academic updates, resources, why, books, institutions, CTA.
        research_teaser(), thesis_pathways(),
        education_updates(), resource_cards(), why_scholars_choose(),
        published_books_home(), indexing_marquee(),
        institution_marquee('home-institutions', INSTITUTIONS_HOME_SUBTITLE, bordered=True),
        cta_c,
    ])


# ----------------------------------------------------------------- about ---


def page_about():
    p = PAGES["about"]
    secs = ""
    for s in p["sections"]:
        body = "".join(f'<p class="prose" style="margin-top:16px">{e(x)}</p>' for x in s["body"])
        secs += f'<div class="reveal"><h2 style="font-size:clamp(1.3rem,1.15rem + .6vw,1.6rem)">{e(s["heading"])}</h2>{body}</div>'

    vals = ""
    for v in p["values"]:
        vals += (f'<li class="reveal" style="border-top:2px solid rgba(168,128,44,.6);padding-top:20px">'
                 f'<h3 class="cell-title" style="margin-top:0">{e(v["title"])}</h3>'
                 f'<p class="cell-body">{e(v["body"])}</p></li>')

    points = "".join(
        f'<li style="display:flex;gap:12px;border-bottom:1px solid var(--rule);padding-bottom:14px;font-size:.95rem">'
        f'<span class="check"></span>{e(x)}</li>' for x in LEGAL["integrity"]["points"])

    return page_hero("About", p["title"], p["lede"],
                     [("Home", "/"), ("About", "/about")], "document") + f"""
<section class="section">{motif("document", .035)}
  <div class="shell">
    <div style="display:grid;gap:56px 64px;grid-template-columns:repeat(auto-fit,minmax(320px,1fr))">{secs}</div>
  </div>
</section>

<section class="section surface bordered">
  <div class="shell">
    {heading("Principles", "Three commitments that shape every engagement")}
    <ul class="cols-3" style="margin-top:48px">{vals}</ul>
  </div>
</section>

<section class="section ink">
  <div class="shell">
    {heading("The bridge", "What we mean by bridging research and academic success",
             "The name is a description of the service, not a slogan. This is the crossing we help scholars make.", invert=True)}
    {stage_track(DATA["journey"], invert=True)}
  </div>
</section>

<section class="section bordered">
  <div class="shell split">
    {heading("Ethics", LEGAL["integrity"]["title"], LEGAL["integrity"]["body"])}
    <ul style="display:grid;gap:14px">{points}</ul>
  </div>
</section>
{cta_block()}"""


# -------------------------------------------------------------- services ---


def page_services():
    blocks = ""
    for i, g in enumerate(GROUPS):
        items = "".join(f'<li><span class="check"></span>{e(x)}</li>' for x in g["items"])
        rule = '<hr style="margin-top:64px;border:0;border-top:1px solid var(--rule)">' if i < len(GROUPS) - 1 else ""
        blocks += f"""
<div class="reveal">
  <div class="split">
    <div>
      <p class="numeral" style="font-size:2.4rem" aria-hidden="true">{i + 1:02d}</p>
      <h2 style="margin-top:16px">{e(g["title"])}</h2>
      <p class="prose" style="margin-top:12px">{e(g["blurb"])}</p>
      <p style="margin-top:24px"><a href="{h(g["href"])}" style="color:var(--indigo);font-weight:500">Full details &rarr;</a></p>
    </div>
    <div class="panel" style="padding:32px">
      <ul class="checklist two">{items}</ul>
    </div>
  </div>{rule}
</div>"""

    steps = "".join(
        f'<li class="reveal"><span class="numeral brass" style="font-size:2.6rem;display:block" aria-hidden="true">{s["n"]}</span>'
        f'<h3 class="cell-title">{e(s["title"])}</h3><p class="cell-body">{e(s["body"])}</p></li>'
        for s in HOME["steps"]["items"])

    disc = "".join(
        f'<li class="reveal" style="border-top:1px solid var(--rule);padding-top:16px">'
        f'<h3 class="cell-title" style="margin-top:0;font-size:.98rem">{e(d["name"])}</h3>'
        f'<p class="cell-body" style="color:var(--muted);font-size:.9rem">{e(d["note"])}</p></li>'
        for d in DISC["items"])

    faq_items = (FAQS["Thesis consultancy"][:2] + FAQS["Research publication"][:2]
                 + FAQS["Book publication"][:1] + FAQS["University admission"][:1])

    return page_hero("Services", PAGES["services"]["title"], PAGES["services"]["lede"],
                     [("Home", "/"), ("Services", "/services")], "network",
                     {"label": "Book a consultation", "href": "/contact"}) + f"""
<section class="section">
  <div class="shell" style="display:grid;gap:64px">{blocks}</div>
</section>

<section class="section surface bordered">{motif("network", .045)}
  <div class="shell">
    {heading("How it works", HOME["steps"]["title"], HOME["steps"]["intro"])}
    <ol class="grid-cells c5" style="margin-top:56px">{steps}</ol>
  </div>
</section>

<section class="section bordered">
  <div class="shell">
    {heading("Coverage", DISC["title"], DISC["intro"])}
    <ul style="margin-top:48px;display:grid;gap:28px 32px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">{disc}</ul>
  </div>
</section>

<section class="section surface bordered">
  <div class="shell split">
    {heading("Questions", "Before you commit to anything")}
    {accordion(faq_items, "svc-faq")}
  </div>
</section>
{cta_block()}"""


# --------------------------------------------------------------- thesis ----


def page_thesis():
    p = PAGES["researchThesis"]
    blocks = ""
    for s in p["services"]:
        includes = "".join(f'<li><span class="check"></span>{e(x)}</li>' for x in s["includes"])
        delivs = "".join(f'<li class="tag">{e(x)}</li>' for x in s["deliverables"])
        blocks += f"""
<div class="panel reveal" id="{s["id"]}" style="padding:36px">
  <div class="split">
    <div>
      <h3>{e(s["title"])}</h3>
      <p class="prose" style="margin-top:12px">{e(s["summary"])}</p>
      <div style="margin-top:24px;border-top:1px solid var(--rule);padding-top:20px">
        <h4 class="subhead">Who it is for</h4>
        <p style="margin-top:8px;font-size:.94rem">{e(s["who"])}</p>
      </div>
      <div style="margin-top:20px">
        <h4 class="subhead">Key deliverables</h4>
        <ul class="tag-list" style="margin-top:10px">{delivs}</ul>
      </div>
      <div style="margin-top:28px">{btn(p["cta"]["label"], h(p["cta"]["href"]), "secondary")}</div>
    </div>
    <div>
      <h4 class="subhead">What it includes</h4>
      <ul class="checklist" style="margin-top:16px">{includes}</ul>
    </div>
  </div>
</div>"""

    return page_hero("Research & thesis", p["title"], p["lede"],
                     [("Home", "/"), ("Research & Thesis", "/research-thesis")],
                     "document", p["cta"]) + f"""
<section class="section ink">
  <div class="shell">
    {heading("The sequence", p["pipelineTitle"], p["pipelineIntro"], invert=True)}
    {stage_track(p["pipeline"], invert=True)}
  </div>
</section>

<section class="section">{motif("document", .035)}
  <div class="shell">
    {heading("Support in detail", "What each part of the engagement covers",
             "Take one of these, or take the sequence. Scope is agreed in writing before anything begins.")}
    <div style="margin-top:56px;display:grid;gap:24px">{blocks}</div>
  </div>
</section>

{research_domains()}

{thesis_anatomy()}

{institution_marquee()}

<section class="section bordered">
  <div class="shell split">
    {heading("Questions", "Thesis consultancy, answered plainly")}
    {accordion(FAQS["Thesis consultancy"], "thesis-faq")}
  </div>
</section>
{cta_block("Tell us where your research has stalled",
           "Send your draft, your guidelines and your supervisor's feedback. We will tell you what the real problem is.",
           {"label": "Discuss your research", "href": "/contact"},
           {"label": "Send your requirement", "href": "/contact#requirement-form"})}"""


# ---------------------------------------------------------- publication ----


def page_publication():
    p = PAGES["publication"]
    colours = ["#12314F", "#2B4A8B", "#A8802C"]
    tracks = ""
    for i, t in enumerate(p["tracks"]):
        pts = "".join(f'<li><span class="check"></span>{e(x)}</li>' for x in t["points"])
        tracks += f"""
<div class="panel interactive reveal" style="padding:28px;display:flex;flex-direction:column">
  <span aria-hidden="true" style="display:block;height:4px;width:40px;border-radius:999px;background:{colours[i]}"></span>
  <h3 style="margin-top:20px">{e(t["title"])}</h3>
  <p style="margin-top:12px;font-size:.95rem">{e(t["blurb"])}</p>
  <ul class="checklist" style="margin-top:24px;border-top:1px solid var(--rule);padding-top:20px">{pts}</ul>
</div>"""

    svcs = "".join(
        f'<li class="reveal"><span class="numeral" style="font-size:1.6rem" aria-hidden="true">{i + 1:02d}</span>'
        f'<h3 class="cell-title" style="margin-top:12px;font-size:.99rem">{e(s["title"])}</h3>'
        f'<p class="cell-body">{e(s["body"])}</p></li>'
        for i, s in enumerate(p["services"]))

    faq_items = (FAQS["Research publication"] + FAQS["SCI & Scopus"]
                 + FAQS["Peer-reviewed journals"])

    return page_hero("Publication", p["title"], p["lede"],
                     [("Home", "/"), ("Publication", "/publication")],
                     "journal", p["cta"]) + f"""
<section class="section">{motif("journal", .04)}
  <div class="shell">
    {heading("Journal tracks", "Three routes, each with different expectations",
             "The right target depends on the strength of your contribution, your institution's requirement and how much revision time you have.")}
    <div class="cols-3" style="margin-top:48px">{tracks}</div>
    <div class="note reveal">
      <p style="font-size:.95rem">{e(p["integrityNote"])}</p>
    </div>
  </div>
</section>

<section class="section ink">
  <div class="shell">
    {heading("The workflow", p["workflowTitle"],
             "Two of these stages belong entirely to the journal. We prepare you for them; we do not influence them.", invert=True)}
    {stage_track(p["workflow"], invert=True)}
  </div>
</section>

<section class="section bordered">
  <div class="shell">
    {heading("Scope", p["servicesTitle"])}
    <ul class="grid-cells c4" style="margin-top:48px">{svcs}</ul>
    <div style="margin-top:40px">{btn(p["cta"]["label"], h(p["cta"]["href"]), "primary")}</div>
  </div>
</section>

<section class="section surface bordered">
  <div class="shell split">
    {heading("Questions", "Publication, without the promises",
             "Every answer here is one we would give a scholar on a call.")}
    {accordion(faq_items, "pub-faq")}
  </div>
</section>
{cta_block("Have a manuscript that keeps getting desk-rejected?",
           "Send it with the rejection notes. We will tell you whether it is a fit problem, a framing problem or a method problem.",
           {"label": "Discuss your manuscript", "href": "/contact"},
           {"label": "Send your requirement", "href": "/contact#requirement-form"})}"""


# ----------------------------------------------------------------- book ----


ACCENTS = [
    ("royal", "#1E3A8A"), ("teal", "#0F6A72"),
    ("purple", "#5B3E8E"), ("saffron", "#86661F"),
]

SVC_ORDER = ["royal", "teal", "saffron", "purple"]

_SVC_ICON = {
    "royal": '<path d="M4 2h8l4 4v6"/><path d="M12 2v4h4"/><path d="M4 2v18a1 1 0 0 0 1 1h5"/>'
             '<circle cx="15" cy="16" r="4"/><path d="M18.5 19.5 21.5 22.5"/>',
    "teal": '<path d="M17 3H6a2 2 0 0 0-2 2v13"/><path d="M4 18a3 3 0 0 0 3 3h11a2 2 0 0 0 2-2V8"/>'
            '<path d="M20 8h-3a2 2 0 0 1-2-2V3"/><path d="M8 8h5"/><path d="M8 12h6"/><path d="M8 16h4"/>',
    "saffron": '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 '
               '4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    "purple": '<path d="M4 22h16"/><path d="M6 18v-8"/><path d="M10 18v-8"/><path d="M14 18v-8"/>'
              '<path d="M18 18v-8"/><path d="M12 2 2 8h20z"/>',
}

_DOMAIN_TILE = {
    "royal": '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/>',
    "teal": '<path d="M16 6H3"/><path d="M16 12H3"/><path d="M11 18H3"/><path d="M18 9v12"/><path d="m15 12 3-3 3 3"/>',
    "purple": '<circle cx="12" cy="12" r="1.6"/><path d="M20.2 20.2c1.6-1.6.4-6-2.7-9.1S10.4 6.2 8.8 7.8s-.4 6 2.7 9.1 7.1 4.9 8.7 3.3Z"/><path d="M3.8 20.2c-1.6-1.6-.4-6 2.7-9.1S13.6 6.2 15.2 7.8s.4 6-2.7 9.1-7.1 4.9-8.7 3.3Z"/>',
    "saffron": '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v2"/><path d="M15 2v2"/><path d="M9 20v2"/><path d="M15 20v2"/><path d="M2 9h2"/><path d="M2 15h2"/><path d="M20 9h2"/><path d="M20 15h2"/>',
}


def updates_archive():
    """Full archive: every article, same search and chips as the home section."""
    eu = DATA["educationUpdates"]
    arts = sorted(eu["articles"], key=lambda a: a["publishedAt"], reverse=True)
    all_demo = all(a.get("isDemo") for a in arts)
    cats = eu["categories"]
    chips = "".join(
        f'<button type="button" class="eu-chip" data-cat="{e(c)}" '
        f'aria-pressed="{"true" if c == "All" else "false"}">{e(c)}</button>' for c in cats)
    cards = "".join(update_card(a) for a in arts)
    note = (f'<p class="eu-note">{e(eu["demoNotice"])}</p>' if all_demo else "")
    return page_hero(eu["kicker"], eu["title"], eu["intro"],
                     [("Education & Academic Updates", "/education-updates")],
                     "document") + f'''
<section class="section">
  <div class="shell">
    {note}
    <div class="eu-controls">
      <label class="eu-search"><span class="sr-only">{e(eu["searchPlaceholder"])}</span>
        <input type="search" id="eu-q2" placeholder="{e(eu["searchPlaceholder"])}"></label>
      <div class="eu-chips" role="group" aria-label="Filter updates by category">{chips}</div>
    </div>
    <p class="sr-only" id="eu-live2" role="status" aria-live="polite"></p>
    <h2 class="sr-only">All updates</h2>
    <ul class="eu-grid" style="margin-top:40px">{cards}</ul>
    <p class="eu-empty" id="eu-empty2" hidden data-empty='{e(json.dumps(eu.get("emptyByCategory", {})))}' data-default="{e(eu["emptyLabel"])}">{e(eu["emptyLabel"])}</p>
  </div>
</section>'''


def update_card(a, featured=False):
    d = datetime.strptime(a["publishedAt"], "%Y-%m-%d").strftime("%-d %B %Y")
    mins = f' · {a["readingMinutes"]} min read' if a.get("readingMinutes") else ""
    return (f'<li class="eu-item{" eu-feat" if featured else ""}" '
            f'data-cat="{e(a["category"])}" '
            f'data-text="{e((a["title"] + " " + a["excerpt"] + " " + a["category"] + " " + a.get("body", "")).lower())}">'
            f'<article class="eu-card">'
            f'<div class="eu-meta"><span class="eu-tag eu-{cat_accent(a["category"])}">'
            f'{e(a["category"])}</span><span class="eu-date">{e(d)}{mins}</span></div>'
            f'<h3>{e(a["title"])}</h3>'
            f'<p class="eu-excerpt">{e(a["excerpt"])}</p>'
            f'<p class="eu-more">Read update &rarr;</p></article></li>')


GUIDES = json.loads((ROOT / "content" / "research-guides.json").read_text(encoding="utf-8"))


def _pathway(kind):
    return sorted([g for g in GUIDES["guides"] if g["type"] == kind], key=lambda g: g["order"])


def _guide_href(g):
    return h(f'/research-guide/{g["type"]}/{g["slug"]}')


def _accent(kind):
    return "royal" if kind == "thesis" else "teal"


def thesis_pathways():
    """Homepage teaser. Every step links to its own guide page."""
    cols = ""
    for kind in ("thesis", "paper"):
        meta = GUIDES["pathways"][kind]
        steps = ""
        for g in _pathway(kind):
            steps += (f'<li><a class="gp-step" href="{_guide_href(g)}">'
                      f'<span class="gp-num">{g["order"]:02d}</span>'
                      f'<span class="gp-label">{e(g["shortTitle"])}</span>'
                      f'<span class="gp-arrow" aria-hidden="true">&rarr;</span></a></li>')
        cols += (f'<div class="gp-card gp-{_accent(kind)} reveal">'
                 f'<span class="gp-bar" aria-hidden="true"></span>'
                 f'<h3>{e(meta["title"])}</h3><p class="gp-intro">{e(meta["intro"])}</p>'
                 f'<ol class="gp-steps">{steps}</ol></div>')
    return f'''
<section class="section surface bordered" id="research-guide-teaser">
  <div class="shell">
    {heading("Research knowledge hub", "How to make your thesis & research paper",
             "Understand the research process, from choosing a topic to final submission.")}
    <div class="gp-grid">{cols}</div>
    <p class="gp-all"><a href="{h("/research-guide")}">Open the research guide &rarr;</a></p>
  </div>
</section>'''


def page_previews():
    """Publication, SD Publication House and University Admission previews.
    Each uses its own page's title and lede; no copy is rewritten here."""
    items = HOME.get("previews") or []
    if not items:
        return ""
    cards = ""
    for x in items:
        cards += (f'<li class="reveal"><div class="pv-card">'
                  f'<p class="pv-kicker">{e(x["kicker"])}</p>'
                  f'<h3>{e(x["title"])}</h3>'
                  f'<p class="pv-body">{e(x["body"])}</p>'
                  f'<a class="pv-cta" href="{h(x["href"])}">{e(x["ctaLabel"])} &rarr;</a>'
                  f'</div></li>')
    return f'''
<section class="section surface bordered" id="page-previews">
  <div class="shell">
    {heading("What we support", "Where SetuVidya helps", "")}
    <ul class="pv-grid">{cards}</ul>
  </div>
</section>'''


def resource_cards():
    """Two resource cards. Lighter than the services section by design; no
    indexing, metric or status is claimed for either."""
    r = HOME["resources"]
    cards = ""
    for c in r["cards"]:
        sub = f'<p class="rc-sub">{e(c["subtitle"])}</p>' if c.get("subtitle") else ""
        if c.get("external"):
            if JOURNAL_OK:
                cta = (f'<a class="rc-cta" href="{e(JOURNAL_URL)}" target="_blank" '
                       f'rel="noopener noreferrer">{e(c["ctaLabel"])} &rarr;'
                       f'<span class="sr-only"> (opens in a new tab)</span></a>')
            else:
                cta = ""  # no address configured: no link, no notice
        else:
            cta = f'<a class="rc-cta" href="{h(c["href"])}">{e(c["ctaLabel"])} &rarr;</a>'
        cards += (f'<li class="reveal"><div class="rc-card">'
                  f'<h3>{e(c["title"])}</h3>{sub}'
                  f'<p class="rc-body">{e(c["body"])}</p>{cta}</div></li>')
    return f'''
<section class="section bordered" id="academic-resources">
  <div class="shell">
    {heading(r["kicker"], r["title"], "")}
    <ul class="rc-grid">{cards}</ul>
  </div>
</section>'''


def testimonials_page():
    """Dedicated page. Same data and the same card builder the Home preview
    uses, so there is one source of truth and no duplicate copy."""
    tp = DATA["testimonialsPage"]
    intro = (f'<p class="prose" style="max-width:56rem">{e(TESTI["intro"])}</p>'
             if TESTI.get("intro") else "")
    return page_hero(tp["kicker"], tp["title"], tp["intro"],
                     [(tp["title"], "/testimonials")], "document") + f'''
<section class="section"><div class="shell">
  {intro}
  {review_cards()}
</div></section>'''


def faq_page():
    """The single home for the FAQ. Same groups the service pages use."""
    fp = DATA["faqPage"]
    blocks = ""
    for i, (group, items) in enumerate(DATA["faqs"].items()):
        blocks += (f'<section class="faq-group"><h2 class="faq-group-title">{e(group)}</h2>'
                   f'{accordion(items, f"faqpage{i}")}</section>')
    return page_hero(fp["kicker"], fp["title"], fp["intro"],
                     [(fp["title"], "/faq")], "document") + f'''
<section class="section"><div class="shell shell-narrow">{blocks}</div></section>'''


def scopus_journal_list():
    """Structure only. The record list is empty until verified entries exist;
    nothing about a journal is generated here."""
    sj = DATA["scopusJournals"]
    subs = [x for x in sj["subjects"] if any(j.get("subject") == x for j in sj["journals"])]
    chips = ""
    if subs:
        chips = '<div class="eu-chips" role="group" aria-label="Filter by subject area">'
        for i, c in enumerate(["All"] + subs):
            chips += (f'<button type="button" class="eu-chip" data-cat="{e(c)}" '
                      f'aria-pressed="{"true" if i == 0 else "false"}">{e(c)}</button>')
        chips += "</div>"

    if sj["journals"]:
        head = "".join(f'<th scope="col">{e(c)}</th>' for c in sj["columns"])
        rows = ""
        for j in sj["journals"]:
            src = (f'<a href="{e(j["sourceUrl"])}" target="_blank" rel="noopener noreferrer">'
                   f'{e(j.get("sourceName") or "Source")}'
                   f'<span class="sr-only"> (opens in a new tab)</span></a>') if j.get("sourceUrl") else "&mdash;"
            rows += ("<tr>"
                     f'<td class="sj-name">{e(j["name"])}</td>'
                     f'<td>{e(j.get("issn") or "—")}</td>'
                     f'<td>{e(j.get("publisher") or "—")}</td>'
                     f'<td>{e(j.get("subject") or "—")}</td>'
                     f'<td>{e(j.get("status") or "—")}</td>'
                     f'<td>{src}</td></tr>')
        body = f'<div class="sj-wrap"><table class="sj-table"><thead><tr>{head}</tr></thead><tbody>{rows}</tbody></table></div>'
    else:
        body = f'<p class="eu-empty">{e(sj["emptyState"])}</p>'

    return page_hero(sj["kicker"], sj["title"], sj["intro"],
                     [(sj["title"], "/scopus-journal-list")], "document") + f'''
<section class="section"><div class="shell">
  <p class="eu-note">{e(sj["verifyNote"])}</p>
  <div class="eu-controls">
    <label class="eu-search"><span class="sr-only">{e(sj["searchPlaceholder"])}</span>
      <input type="search" id="sj-q" placeholder="{e(sj["searchPlaceholder"])}"></label>
    {chips}
  </div>
  {body}
</div></section>'''


def sci_journal_list():
    """Same structure and the same rules as the Scopus list: no record,
    ISSN, publisher or indexing status is generated here."""
    sj = DATA["sciJournals"]
    body = f'<p class="eu-empty">{e(sj["emptyState"])}</p>' if not sj["journals"] else ""
    return page_hero(sj["kicker"], sj["title"], sj["intro"],
                     [(sj["title"], "/sci-journal-list")], "document") + f'''
<section class="section"><div class="shell">
  <p class="eu-note">{e(sj["verifyNote"])}</p>
  <div class="eu-controls">
    <label class="eu-search"><span class="sr-only">{e(sj["searchPlaceholder"])}</span>
      <input type="search" id="sci-q" placeholder="{e(sj["searchPlaceholder"])}"></label>
  </div>
  {body}
</div></section>'''


def abdc_journal_list():
    """Same structure and rules as the Scopus and SCI lists: no record or
    rating is generated here."""
    sj = DATA["abdcJournals"]
    body = f'<p class="eu-empty">{e(sj["emptyState"])}</p>' if not sj["journals"] else ""
    return page_hero(sj["kicker"], sj["title"], sj["intro"],
                     [(sj["title"], "/abdc-journal-list")], "document") + f'''
<section class="section"><div class="shell">
  <p class="eu-note">{e(sj["verifyNote"])}</p>
  <div class="eu-controls">
    <label class="eu-search"><span class="sr-only">{e(sj["searchPlaceholder"])}</span>
      <input type="search" id="abdc-q" placeholder="{e(sj["searchPlaceholder"])}"></label>
  </div>
  {body}
</div></section>'''


def research_guide_hub():
    blocks = ""
    for kind in ("thesis", "paper"):
        meta = GUIDES["pathways"][kind]
        cards = ""
        for g in _pathway(kind):
            cards += (f'<li><a class="gh-card gp-{_accent(kind)}" href="{_guide_href(g)}">'
                      f'<span class="gp-num">{g["order"]:02d}</span>'
                      f'<span><span class="gh-title">{e(g["shortTitle"])}</span>'
                      f'<span class="gh-desc">{e(g["description"])}</span>'
                      f'<span class="gh-read">Read guide &rarr;</span></span></a></li>')
        blocks += (f'<section class="gh-block"><h2>{e(meta["title"])}</h2>'
                   f'<p class="gh-intro">{e(meta["intro"])}</p>'
                   f'<ol class="gh-grid">{cards}</ol></section>')
    lede = ("Understand the research process, from choosing a topic to final submission. "
            "Twenty stages across two pathways, each explained in its own guide.")
    return page_hero("Research knowledge hub", "Research guide", lede,
                     [("Research guide", "/research-guide")], "document") + f'''
<section class="section"><div class="shell">{blocks}</div></section>'''


def guide_page(g):
    kind = g["type"]
    meta = GUIDES["pathways"][kind]
    steps = _pathway(kind)
    i = [x["slug"] for x in steps].index(g["slug"])
    prev, nxt = (steps[i - 1] if i else None), (steps[i + 1] if i + 1 < len(steps) else None)

    how = "".join(
        f'<li><span class="gd-n">{n + 1:02d}</span><span>'
        f'<span class="gd-step">{e(x["step"])}</span>'
        f'<span class="gd-text">{e(x["text"])}</span></span></li>'
        for n, x in enumerate(g["howTo"]))

    nodes = ""
    for n, node in enumerate(g["diagram"]["nodes"]):
        nodes += (f'<li><span class="gd-node"><span class="gd-dot">{n + 1}</span>'
                  f'{e(node)}</span>'
                  + ('<span class="gd-link" aria-hidden="true"></span>'
                     if n < len(g["diagram"]["nodes"]) - 1 else '')
                  + '</li>')

    mistakes = "".join(f'<li>{e(m)}</li>' for m in g["mistakes"])
    checks = "".join(f'<li>{e(c)}</li>' for c in g["checklist"])

    related = []
    other = "paper" if kind == "thesis" else "thesis"
    same = next((x for x in GUIDES["guides"] if x["type"] == other and x["slug"] == g["slug"]), None)
    for cand in (same, nxt, prev):
        if cand and cand not in related:
            related.append(cand)
    rel = "".join(
        f'<li><a href="{_guide_href(r)}">{e(r["shortTitle"])}'
        f'<span class="gd-rel-kind">{e(GUIDES["pathways"][r["type"]]["label"])}</span></a></li>'
        for r in related[:3])

    nav_prev = (f'<a href="{_guide_href(prev)}">&larr; {e(prev["shortTitle"])}</a>'
                if prev else '<span></span>')
    nav_next = (f'<a href="{_guide_href(nxt)}">{e(nxt["shortTitle"])} &rarr;</a>'
                if nxt else '<span></span>')

    return f'''
<section class="section"><div class="shell shell-narrow">
  <nav class="gd-crumb" aria-label="Breadcrumb">
    <a href="{h("/research-guide")}">Research guide</a>
    <span aria-hidden="true"> &rsaquo; </span>{e(meta["label"])}
    <span aria-hidden="true"> &rsaquo; </span><span class="gd-here">{e(g["shortTitle"])}</span>
  </nav>
  <p class="gd-step-of">{e(meta["label"])} &middot; Step {g["order"]} of {len(steps)}</p>
  <h1>{e(g["title"])}</h1>
  <p class="lede" style="margin-top:20px;color:var(--body)">{e(g["intro"])}</p>

  <h2 class="gd-h">What is it?</h2><p class="gd-p">{e(g["whatIsIt"])}</p>
  <h2 class="gd-h">Why does it matter?</h2><p class="gd-p">{e(g["whyItMatters"])}</p>
  <h2 class="gd-h">How to do it</h2><ol class="gd-how">{how}</ol>
  <h2 class="gd-h">The process</h2>
  <figure class="gd-diagram gp-{_accent(kind)}">
    <figcaption>{e(g["diagram"]["title"])}</figcaption>
    <ol>{nodes}</ol>
  </figure>
  <h2 class="gd-h">Stronger and weaker examples</h2>
  <div class="gd-ex">
    <div class="gd-strong"><p class="gd-ex-label">Stronger</p><p>{e(g["examples"]["strong"])}</p></div>
    <div class="gd-weak"><p class="gd-ex-label">Weaker</p><p>{e(g["examples"]["weak"])}</p></div>
  </div>
  <h2 class="gd-h">Common mistakes</h2><ul class="gd-list gd-mistakes">{mistakes}</ul>
  <h2 class="gd-h">Practical checklist</h2><ul class="gd-list gd-checks">{checks}</ul>
  <div class="gd-take"><p class="gd-ex-label">Key takeaway</p><p>{e(g["takeaway"])}</p></div>
  <nav class="gd-nav" aria-label="Guide navigation">
    {nav_prev}<a class="gd-back" href="{h("/research-guide")}">Back to research guide</a>{nav_next}
  </nav>
  <h2 class="gd-h">Related guides</h2><ul class="gd-rel">{rel}</ul>
</div></section>'''


def why_scholars_choose():
    """One section, two parts. The review cards come from the same builder the
    Student Reviews section uses, so testimonials are not duplicated."""
    wc = HOME["whyChoose"]
    reasons = ""
    for i, r in enumerate(wc["reasons"]):
        reasons += (f'<li class="reveal"><div class="wsc-card">'
                    f'<span class="wsc-num" aria-hidden="true">{i + 1:02d}</span>'
                    f'<p class="wsc-title">{e(r["title"])}</p>'
                    f'<p class="wsc-body">{e(r["body"])}</p></div></li>')
    return f'''
<section class="section surface bordered" id="why-scholars-choose">
  <div class="shell">
    {heading(wc["kicker"], wc["reasonsTitle"], "")}
    <ul class="wsc-grid">{reasons}</ul>
  </div>
</section>'''


def indexing_marquee():
    """Four items, each the supplied logo unmodified. Every note points the
    reader at the source; nothing implies SetuVidya is indexed by, affiliated
    with or endorsed by any of them."""
    ix = DATA.get("indexing") or {}
    items = ix.get("items") or []
    if not items:
        return ""
    cards = ""
    for item in items:
        img = (f'<span class="idx-tile"><img class="idx-logo" '
               f'src="{data_uri(item["file"], width=min(item["width"], 700))}" alt="{e(item["name"])}" '
               f'width="{item["width"]}" height="{item["height"]}" loading="lazy" '
               f'decoding="async" style="max-height:{item.get("maxHeight", 34)}px"></span>')
        label = (f'<span class="idx-label">{e(item["label"])}</span>' if item.get("label") else "")
        note = label + f'<span class="idx-note-sm">{e(item["note"])}</span>'
        if item.get("external") and JOURNAL_OK:
            body = (f'<a class="idx-link" href="{e(JOURNAL_URL)}" target="_blank" '
                    f'rel="noopener noreferrer">{img}{note}'
                    f'<span class="sr-only"> (opens in a new tab)</span></a>')
        else:
            body = img + note
        cards += f'<li class="reveal">{body}</li>'
    return f'''
<section class="section surface bordered section-compact" id="publication-indexing">
  <div class="shell">
    <h2 class="idx-title">{e(ix["title"])}</h2>
    <ul class="idx-grid">{cards}</ul>
  </div>
</section>'''


def published_books_home():
    """Compact index of the same five titles held in the portfolio data. No new
    content, and none of the lightbox, pricing or cart behaviour: those stay on
    /book-publication."""
    pf = DATA["pages"]["bookPublication"]["portfolio"]
    books = [b for b in pf["books"] if b.get("title") and b.get("frontImage")]
    if not books:
        return ""
    cards = ""
    for b in books:
        cards += (f'<li class="reveal"><a class="pbh-card" href="{h("/book-publication")}">'
                  f'<img src="{data_uri(b["frontImage"], width=320, quality=86)}" '
                  f'alt="{e(b["frontAlt"])}" width="900" height="1436" loading="lazy">'
                  f'<span class="pbh-title">{e(b["title"])}</span>'
                  f'<span class="pbh-author">{e(b["author"])}</span></a></li>')
    label = "View all published books"
    return f'''
<section class="section bordered" id="published-books-home">
  <div class="shell">
    {heading(pf["kicker"], pf["title"], pf["intro"])}
    <ul class="pbh-grid">{cards}</ul>
    <p class="pbh-all"><a href="{h("/book-publication")}">{e(label)} &rarr;</a></p>
  </div>
</section>'''


def research_teaser():
    """Condensed homepage teaser. Same data as /research-thesis; the detailed
    cards and the seven-part accordion stay on that page."""
    dm = DATA["pages"]["researchThesis"]["domains"]

    cards = ""
    for i, c in enumerate(dm["categories"]):
        key = ACCENTS[i % 4][0]
        # Both lists are rendered; the button swaps which one is visible, so
        # the full set is real markup, not generated on click.
        preview = " · ".join(c["subjects"][:4])
        full = " · ".join(c["subjects"])
        more = len(c["subjects"]) > 4
        sid = f'subjects-{c["id"]}'
        subs_html = (f'<p class="rt-subs" id="{sid}" data-preview="{e(preview)}" '
                     f'data-full="{e(full)}">{e(preview)}</p>')
        if more:
            subs_html += (f'<button type="button" class="rt-toggle" aria-expanded="false" '
                          f'aria-controls="{sid}">View all subjects &rarr;</button>')
        cards += (f'<li class="reveal"><article class="rt-card rt-{key}">'
                  f'<span class="rt-bar" aria-hidden="true"></span>'
                  f'<span class="rt-tile">{_icon(_DOMAIN_TILE[key], 20)}</span>'
                  f'<h3>{e(c["title"])}</h3>'
                  f'<p class="rt-count">{len(c["subjects"])} subject areas</p>'
                  f'{subs_html}</article></li>')


    return f'''
<section class="section bordered" id="research-areas">
  <div class="shell">
    {heading("Research areas we support", "Multidisciplinary research support", dm["subtitle"])}
    <ul class="rt-grid">{cards}</ul>
  </div>
</section>'''


def education_updates():
    """Newest updates on the home page. Search and chips are live."""
    eu = DATA.get("educationUpdates")
    if not eu or not eu["articles"]:
        return ""
    arts = sorted(eu["articles"], key=lambda a: a["publishedAt"], reverse=True)
    latest = arts[:eu["homeCount"]]
    all_demo = all(a.get("isDemo") for a in arts)

    # Every configured category stays visible: hiding a filter because its
    # list is empty would read as "this category does not exist".
    cats = eu["categories"]
    chips = "".join(
        f'<button type="button" class="eu-chip" data-cat="{e(c)}" '
        f'aria-pressed="{"true" if c == "All" else "false"}">{e(c)}</button>' for c in cats)

    note = (f'<p class="eu-note">{e(eu["demoNotice"])}</p>' if all_demo else "")
    feat = update_card(latest[0], featured=True)
    rest = "".join(update_card(a) for a in latest[1:])

    return f'''
<section class="section surface bordered" id="education-updates">
  <div class="shell">
    {heading(eu["kicker"], eu["title"], eu["intro"])}
    {note}
    <div class="eu-controls">
      <label class="eu-search">
        <span class="sr-only">{e(eu["searchPlaceholder"])}</span>
        <input type="search" id="eu-q" placeholder="{e(eu["searchPlaceholder"])}">
      </label>
      <div class="eu-chips" role="group" aria-label="Filter updates by category">{chips}</div>
    </div>
    <p class="sr-only" id="eu-live" role="status" aria-live="polite"></p>
    <ul class="eu-featured">{feat}</ul>
    <ul class="eu-grid">{rest}</ul>
    <p class="eu-empty" id="eu-empty" hidden data-empty='{e(json.dumps(eu.get("emptyByCategory", {})))}' data-default="{e(eu["emptyLabel"])}">{e(eu["emptyLabel"])}</p>
    <div class="eu-all">{btn(eu["viewAllLabel"] + " \u2192", h("/education-updates"), "secondary")}</div>
  </div>
</section>'''


def cat_accent(cat):
    if cat in ("Research", "Education Policy"):
        return "royal"
    if cat in ("Admissions", "Higher Education"):
        return "teal"
    if cat in ("Scholarships", "AI & EdTech"):
        return "purple"
    return "saffron"



def book_hero_visual():
    """Supplied photograph if there is one, the vector mockup otherwise."""
    img = DATA["pages"]["bookPublication"].get("image", {})
    src = (img.get("src") or "").strip()
    if not src:
        return book_mockup()
    asset = ROOT / "public" / src.lstrip("/")
    if not asset.exists():
        return book_mockup()
    uri = data_uri(src, width=1200, quality=84)
    return (f'<img class="book-hero-photo" src="{uri}" alt="{e(img.get("alt", ""))}" '
            f'width="1700" height="900">')


def page_book():
    p = PAGES["bookPublication"]
    types = ""
    for i, t in enumerate(p["types"]):
        bars = "".join(
            f'<span style="display:block;width:8px;border-radius:2px;background:rgba(18,49,79,.25);'
            f'height:{16 + ((i + b) % 3) * 9}px"></span>' for b in range(3))
        bars += '<span style="display:block;width:8px;border-radius:2px;background:var(--brass);height:30px"></span>'
        types += f"""
<div class="panel interactive reveal" style="padding:28px">
  <span aria-hidden="true" style="display:flex;align-items:flex-end;gap:4px;height:34px;margin-bottom:24px">{bars}</span>
  <h3 class="cell-title" style="margin-top:0;font-size:1.04rem">{e(t["title"])}</h3>
  <p class="cell-body">{e(t["body"])}</p>
</div>"""

    return page_hero("Book publication", p["title"], p["lede"],
                     [("Home", "/"), ("Book Publication", "/book-publication")],
                     "book", p["cta"], extra=book_hero_visual()) + f"""
<section class="section">{motif("book", .035)}
  <div class="shell">
    {heading("What we publish", "Six kinds of academic book, each with a different reader",
             "The reader determines everything: structure, register, apparatus and length. We start there rather than with a page count.")}
    <div class="cols-3" style="margin-top:48px">{types}</div>
  </div>
</section>

<section class="section ink">
  <div class="shell">
    {heading("Production", p["pipelineTitle"],
             "Seven stages between a finished manuscript and a book someone can find, buy and cite.", invert=True)}
    {stage_track(p["pipeline"], invert=True)}
    <div class="note flat reveal"><p>{e(p["note"])}</p></div>
  </div>
</section>

{sd_publication_house()}

{book_portfolio()}

{book_commerce()}

<section class="section bordered">
  <div class="shell split">
    {heading("Questions", "Publishing an academic book")}
    {accordion(FAQS["Book publication"], "book-faq")}
  </div>
</section>
{cta_block("Have a manuscript, or a thesis that wants to be a book?",
           "Send the manuscript or the chapter plan. We will tell you what it needs, and what publishing route fits it.",
           {"label": "Discuss your book", "href": "/contact"},
           {"label": "Send your requirement", "href": "/contact#requirement-form"})}"""


# ------------------------------------------------------------ admission ----


def page_admission():
    p = PAGES["universityAdmission"]
    svcs = ""
    for i, s in enumerate(p["services"]):
        svcs += f"""
<div class="panel reveal" style="padding:28px">
  <div style="display:flex;gap:16px;align-items:baseline">
    <span class="numeral brass" style="font-size:1.5rem" aria-hidden="true">{i + 1:02d}</span>
    <h3 class="cell-title" style="margin-top:0;font-size:1.02rem">{e(s["title"])}</h3>
  </div>
  <p class="cell-body">{e(s["body"])}</p>
</div>"""

    return page_hero("University admission", p["title"], p["lede"],
                     [("Home", "/"), ("University Admission", "/university-admission")],
                     "campus", p["cta"]) + f"""
<section class="section ink">
  <div class="shell">
    {heading("The pathway", p["pathwayTitle"],
             "Six stages. Applicants usually lose the cycle at stage two or stage five, and both are avoidable.", invert=True)}
    {stage_track(p["pathway"], invert=True, cols=3)}
  </div>
</section>

<section class="section">{motif("campus", .035)}
  <div class="shell">
    {heading("Scope", "What admission assistance covers",
             "All of it is guidance. The application is yours, in your words, submitted by you.")}
    <div class="cols-2" style="margin-top:48px">{svcs}</div>
    <div class="note reveal"><p style="font-size:.95rem">{e(p["note"])}</p></div>
  </div>
</section>

<section class="section surface bordered">
  <div class="shell split">
    {heading("Questions", "Admission guidance, honestly framed")}
    {accordion(FAQS["University admission"], "adm-faq")}
  </div>
</section>
{cta_block("Not sure which programme you are actually eligible for?",
           "Send us your academic record and what you want to do next. We will shortlist honestly, including telling you when the answer is to wait a cycle.",
           {"label": "Talk to an admission advisor", "href": "/contact"},
           {"label": "Send your requirement", "href": "/contact#requirement-form"})}"""


# -------------------------------------------------------------- contact ----


def page_contact():
    p = PAGES["contact"]

    def opts(values):
        return "".join(f'<option value="{e(v)}">{e(v)}</option>' for v in values)

    def detail(label, value, href=None):
        lines = value if isinstance(value, list) else [value]
        ph = all(is_ph(x) for x in lines)
        cls = "detail-value ph" if ph else "detail-value"
        if not ph and href:
            ext = ' target="_blank" rel="noopener noreferrer"' if href.startswith("http") else ""
            inner = f'<a href="{href}"{ext}>{e(", ".join(lines))}</a>'
        else:
            inner = "".join(f"<span style='display:block'>{e(x)}</span>" for x in lines)
        return (f'<div class="detail-list"><div><p class="detail-label">{e(label)}</p>'
                f'<div class="{cls}">{inner}</div></div></div>')

    return page_hero("Contact", p["title"], p["lede"],
                     [("Home", "/"), ("Contact", "/contact")], "signal") + f"""
<section class="section" id="requirement-form">{motif("signal", .035)}
  <div class="shell" style="display:grid;gap:48px;grid-template-columns:minmax(0,1fr)">
    <div style="display:grid;gap:48px" class="contact-grid">
      <div>
        <h2 style="font-size:clamp(1.3rem,1.15rem + .6vw,1.6rem)">Requirement form</h2>
        <p class="prose" style="margin-top:12px;font-size:.96rem">The more precisely you describe where you are, the more useful our first reply will be. Attach guidelines, drafts or reviewer comments if you have them.</p>

        <form id="enquiry-form" novalidate style="margin-top:36px">
          <div id="form-alert-slot"></div>

          <div class="form-grid form-row">
            <div><label class="field" for="fullName">Full name</label>
              <input class="input" id="fullName" name="fullName" autocomplete="name" placeholder="Ananya Raghavan"><p class="err" id="fullName-err" data-err="fullName" hidden></p></div>
            <div><label class="field" for="email">Email</label>
              <input class="input" id="email" name="email" type="email" autocomplete="email" placeholder="name@university.edu"><p class="err" id="email-err" data-err="email" hidden></p></div>
            <div><label class="field" for="phone">Phone</label>
              <input class="input" id="phone" name="phone" type="tel" autocomplete="tel" placeholder="+91 00000 00000"><p class="err" id="phone-err" data-err="phone" hidden></p></div>
            <div><label class="field" for="academicLevel">Academic level</label>
              <select class="select" id="academicLevel" name="academicLevel"><option value="">Choose one</option>{opts(FORM["academicLevels"])}</select><p class="err" id="academicLevel-err" data-err="academicLevel" hidden></p></div>
            <div><label class="field" for="service">Service required</label>
              <select class="select" id="service" name="service"><option value="">Choose one</option>{opts(FORM["services"])}</select><p class="err" id="service-err" data-err="service" hidden></p></div>
            <div><label class="field" for="discipline">Research discipline</label>
              <input class="input" id="discipline" name="discipline" placeholder="Structural Engineering"><p class="err" id="discipline-err" data-err="discipline" hidden></p></div>
          </div>

          <div class="form-row"><label class="field" for="requirement">Your requirement</label>
            <textarea class="textarea" id="requirement" name="requirement" rows="5" placeholder="Where you are in the process, what your university or journal has asked for, and what you need help with."></textarea><p class="err" id="requirement-err" data-err="requirement" hidden></p></div>

          <div class="form-row"><label class="field" for="message">Anything else <span class="opt">(optional)</span></label>
            <textarea class="textarea" id="message" name="message" rows="3" placeholder="Deadlines, supervisor feedback, preferred contact time."></textarea></div>

          <div class="form-row">
            <span class="field">Upload your document <span class="opt">(optional, max 10 MB)</span></span>
            <label class="dropzone" for="document"><span id="file-label">Attach a PDF, Word, text, image or ZIP file</span>
              <input class="sr-only" id="document" name="document" type="file" accept=".pdf,.doc,.docx,.txt,.zip,.png,.jpg,.jpeg"></label>
            <p class="err" id="document-err" data-err="document" hidden></p>
            <p style="margin-top:8px;font-size:.85rem;color:var(--muted)">{e(p["formNote"])}</p>
          </div>

          <div class="form-row">
            <label class="consent" for="consent"><input type="checkbox" id="consent" name="consent">
              <span>I agree that SetuVidya may contact me about this enquiry, and I confirm that I remain responsible for the originality and final submission of my academic work.</span></label>
            <p class="err" id="consent-err" data-err="consent" hidden></p>
          </div>

          <button type="submit" class="btn btn-primary btn-lg" id="submit-btn">Submit your requirement</button>
        </form>

        <div id="form-success" hidden class="panel" style="padding:36px" role="status">
          <h3>Requirement received</h3>
          <p class="prose" style="margin-top:12px">We have your enquiry and will reply with an honest assessment of whether and how we can help.</p>
        </div>
      </div>

      <aside>
        <div class="panel" style="padding:28px">
          <h2 class="subhead">Reach us directly</h2>
          <div style="margin-top:8px">
            {detail("Email", C["email"], contact_href("mailto"))}
            {detail("Phone", C["phone"], contact_href("tel"))}
            {detail("WhatsApp", C["whatsapp"], contact_href("whatsapp"))}
            {detail("Office", C["addressLines"])}
            {hours_detail()}
          </div>
        </div>
        <div class="note">
          <h2 style="font-family:var(--sans);font-size:.95rem;font-weight:600;color:var(--ink)">{e(LEGAL["integrity"]["title"])}</h2>
          <p style="margin-top:10px;font-size:.9rem">{e(LEGAL["integrity"]["body"])}</p>
        </div>
      </aside>
    </div>
  </div>
</section>"""


# ---------------------------------------------------------------- legal ----


def resolve_tokens(text):
    """Mirrors resolveContactTokens() in lib/content.ts."""
    values = {
        "email": C.get("email", ""),
        "phone": C.get("phone", ""),
        "whatsapp": C.get("whatsapp", ""),
        "address": ", ".join(C.get("addressLines", [])),
    }
    for key, value in values.items():
        token = "{{" + key + "}}"
        if token in text:
            text = text.replace(
                token,
                "the details on our contact page" if is_ph(value) else value,
            )
    return text


def page_legal(doc):
    # Sections still holding a bracketed internal note are omitted entirely.
    secs = "".join(
        f'<div class="reveal"><h2 style="font-size:clamp(1.3rem,1.15rem + .6vw,1.6rem)">{e(s["heading"])}</h2>'
        f'<p class="prose" style="margin-top:12px">{e(resolve_tokens(s["body"]))}</p></div>'
        for s in doc["sections"] if not s["body"].strip().startswith("["))
    extra = ""
    if doc["slug"] == "disclaimer":
        pts = "".join(f'<li style="display:flex;gap:12px;font-size:.95rem"><span class="check"></span>{e(x)}</li>'
                      for x in LEGAL["integrity"]["points"])
        extra = (f'<ul class="prose" style="margin-top:48px;display:grid;gap:12px;'
                 f'border-top:1px solid var(--rule);padding-top:32px">{pts}</ul>')

    return page_hero("Legal", doc["title"], (f'{doc["title"]} for {BRAND["name"]}.' if doc["updated"].strip().startswith("[")
                      else f'Last updated: {doc["updated"]}'),
                     [("Home", "/"), (doc["title"], f'/legal/{doc["slug"]}')], "document") + f"""
<section class="section"><div class="shell">
  <div style="display:grid;gap:40px;max-width:68ch">{secs}</div>{extra}
</div></section>"""


# ---------------------------------------------------------------- chrome ---


def dm_child(c):
    """One drawer submenu entry. Mirrors mm_child: external children become
    real new-tab anchors, and an anchor travels in data-scroll."""
    body = (f'<span class="mm-icon" aria-hidden="true">{nav_icon(c.get("icon",""))}</span>'
            f'<span class="mm-text"><span class="mm-title">{e(c["label"])}</span>'
            f'<span class="mm-blurb">{e(c["blurb"])}</span></span>')
    if c.get("external"):
        if JOURNAL_OK:
            return (f'<li><a class="dm-card" href="{e(JOURNAL_URL)}" target="_blank" '
                    f'rel="noopener noreferrer">{body}'
                    f'<span class="sr-only"> (opens in a new tab)</span></a></li>')
        return f'<li><span class="dm-card mm-pending">{body}</span></li>'
    anchor = anchor_of(c["href"])
    scroll = f' data-scroll="{anchor}"' if anchor else ""
    return f'<li><a class="dm-card" href="{h(c["href"])}"{scroll}>{body}</a></li>'


def mm_child(c, item):
    """One dropdown child. An external child (the journal) becomes a real
    new-tab anchor; an unconfigured one is plain text, never a dead link."""
    body = (f'<span class="mm-icon" aria-hidden="true">{nav_icon(c.get("icon",""))}</span>'
            f'<span class="mm-text"><span class="mm-title">{e(c["label"])}</span>'
            f'<span class="mm-blurb">{e(c["blurb"])}</span>')
    if c.get("external"):
        if JOURNAL_OK:
            return (f'<li><a class="mm-card" href="{e(JOURNAL_URL)}" target="_blank" '
                    f'rel="noopener noreferrer">{body}'
                    f'<span class="sr-only"> (opens in a new tab)</span></span></a></li>')
        return f'<li><span class="mm-card mm-pending">{body}</span></span></li>'
    explore = (f'<span class="mm-explore">{e(item.get("exploreLabel","Explore"))} '
               f'<span aria-hidden="true">&rarr;</span></span>')
    anchor = anchor_of(c["href"])
    scroll = f' data-scroll="{anchor}"' if anchor else ""
    return (f'<li><a class="mm-card" href="{h(c["href"])}"{scroll}>'
            f'{body}{explore}</span></a></li>')


def header_html():
    links = ""
    for item in DATA["nav"]:
        if "children" in item:
            menu_id = "sv-menu-" + item["label"].lower().replace(" ", "-")
            cards = "".join(
                mm_child(c, item) for c in item["children"])
            foot = ""
            if item.get("footerLink"):
                foot = (f'<a class="mm-all" href="{h(item["footerLink"]["href"])}">'
                        f'{e(item["footerLink"]["label"])} <span aria-hidden="true">&rarr;</span></a>')
            links += f"""<li class="has-menu">
  <button type="button" class="navlink" aria-expanded="false" aria-haspopup="true"
          aria-controls="{menu_id}" data-route="{item["href"]}">{e(item["label"])}
    <svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
  </button>
  <div class="menu" id="{menu_id}"><div class="menu-inner">
    <ul class="mm-grid">{cards}</ul>{foot}
  </div></div></li>"""
        elif item.get("external"):
            if JOURNAL_OK:
                links += (f'<li><a class="navlink" href="{e(JOURNAL_URL)}" target="_blank" '
                          f'rel="noopener noreferrer">{e(item["label"])}'
                          f'<span class="sr-only"> (opens in a new tab)</span></a></li>')
            else:
                # No address yet, so no link.
                links += f'<li><span class="navlink navlink-pending">{e(item["label"])}</span></li>'
        else:
            links += f'<li><a class="navlink" href="{h(item["href"])}" data-route="{item["href"]}">{e(item["label"])}</a></li>'

    drawer_links = ""
    for item in DATA["nav"]:
        if item.get("external"):
            if JOURNAL_OK:
                drawer_links += (f'<li><a href="{e(JOURNAL_URL)}" target="_blank" '
                                 f'rel="noopener noreferrer">{e(item["label"])}'
                                 f'<span class="sr-only"> (opens in a new tab)</span></a></li>')
            else:
                drawer_links += f'<li><span class="dm-pending">{e(item["label"])}</span></li>'
            continue
        drawer_links += f'<li><a href="{h(item["href"])}">{e(item["label"])}</a>'
        if "children" in item:
            subs = "".join(
                dm_child(c) for c in item["children"])
            drawer_links += f'<ul class="sub">{subs}</ul>'
            if item.get("footerLink"):
                drawer_links += (f'<a class="dm-all" href="{h(item["footerLink"]["href"])}">'
                                 f'{e(item["footerLink"]["label"])} <span aria-hidden="true">&rarr;</span></a>')
        drawer_links += "</li>"

    return f"""
<header class="header" id="site-header">
  <div class="shell">
    {logo()}
    <nav class="nav" aria-label="Primary"><ul>{links}</ul></nav>
    <div class="header-cta">
      {btn("Book a Consultation \u2192", h("/contact"), "primary", scroll_to="requirement-form")}
    </div>
    <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false" aria-controls="drawer">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
    </button>
  </div>
</header>

<!-- The drawer must not live inside <header>: the header has backdrop-filter,
     which makes it a containing block for position:fixed descendants and
     collapses the drawer to the header's own height. -->
<div class="drawer" id="drawer">
    <div class="drawer-scrim" data-close></div>
    <div class="drawer-panel" role="dialog" aria-modal="true" aria-label="Site menu">
      <div class="drawer-head">{logo()}
        <button class="burger" data-close aria-label="Close menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
      <nav aria-label="Mobile"><ul>{drawer_links}</ul></nav>
      <div class="drawer-foot">
        {btn("Book a Consultation \u2192", h("/contact"), "primary", scroll_to="requirement-form")}
      </div>
    </div>
</div>"""


def footer_html():
    quick = [("Home", "/"), ("About", "/about"), ("Services", "/services"),
             ("Research & Thesis", "/research-thesis"), ("Publication", "/publication"),
             ("Book Publication", "/book-publication"),
             ("University Admission", "/university-admission"), ("Contact", "/contact")]
    explore_html = "".join(
        f'<li><a href="{h(hf)}">{e(lb)}</a></li>' for hf, lb in [
            ("/", "Home"), ("/about", "About SetuVidya"), ("/research-thesis", "Research & Thesis"),
            ("/publication", "Publication"), ("/book-publication", "Book Publication"),
            ("/university-admission", "University Admission")])
    _journal_li = (
        f'<li><a href="{e(JOURNAL_URL)}" target="_blank" rel="noopener noreferrer">'
        f'Our Academic Journal (IJSMS)<span class="sr-only"> (opens in a new tab)</span></a></li>'
        if JOURNAL_OK else
        '<li><span style="color:rgba(255,255,255,.55)">Our Academic Journal (IJSMS)</span></li>')
    resources_html = "".join(
        f'<li><a href="{h(hf)}">{e(lb)}</a></li>' for hf, lb in [
            ("/education-updates", "Academic Updates"), ("/research-guide", "Research Guide"),
            ("/scopus-journal-list", "Scopus Journal List"), ("/faq", "FAQ")]) + _journal_li
    quick_html = "".join(f'<li><a href="{h(href)}">{e(n)}</a></li>' for n, href in quick)
    svc_html = "".join(f'<li><a href="{h(g["href"])}">{e(g["title"])}</a></li>' for g in GROUPS)
    legal_html = "".join(f'<li><a href="#/legal/{d["slug"]}">{e(d["title"])}</a></li>'
                         for d in LEGAL["documents"])
    # Real brand icons, and only for platforms with a configured URL. The old
    # rendering printed the first letter of each platform name, which is where
    # the stray L / I / F / Y came from.
    SOCIAL_ICONS = {
        "instagram": ('<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>'
                      '<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>'
                      '<line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>'),
        "facebook": '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
        "linkedin": ('<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>'
                     '<rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>'),
        "youtube": ('<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0'
                    'A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0'
                    'A2 2 0 0 1 2.5 17"/><polygon points="10 15 15 12 10 9"/>'),
    }
    SOCIAL_LABELS = {"instagram": "Instagram", "facebook": "Facebook",
                     "linkedin": "LinkedIn", "youtube": "YouTube"}
    socials = ""
    for key in ("instagram", "facebook", "linkedin", "youtube"):
        url = (C.get("socialLinks", {}).get(key) or "").strip()
        if not url.startswith("http"):
            continue          # not configured: render nothing at all
        socials += (
            f'<li><a href="{e(url)}" target="_blank" rel="noopener noreferrer" '
            f'aria-label="SetuVidya on {SOCIAL_LABELS[key]}">'
            f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'
            f'{SOCIAL_ICONS[key]}</svg></a></li>'
        )

    def addr(label, value, href=None):
        lines = value if isinstance(value, list) else [value]
        ph = all(is_ph(x) for x in lines)
        ext = ' target="_blank" rel="noopener noreferrer"' if (href or "").startswith("http") else ""
        body = ("".join(f'<span style="display:block" class="ph">{e(x)}</span>' for x in lines) if ph
                else (f'<a href="{href}"{ext}>{e(", ".join(lines))}</a>' if href
                      else "".join(f'<span style="display:block">{e(x)}</span>' for x in lines)))
        return f'<div style="margin-bottom:12px"><span style="display:block;color:rgba(255,255,255,.55)">{e(label)}</span>{body}</div>'

    return f"""
<footer class="footer">
  <div class="shell">
    <div class="footer-grid">
      <div>
        <span class="footer-logo-tile">{logo()}</span>
        <p class="tagline">{e(B["tagline"])}</p>
        <p class="meaning">{e(B["meaning"])}</p>
      </div>
      <nav aria-label="Footer"><h2>Explore</h2><ul>{explore_html}</ul></nav>
      <div><h2>Academic Resources</h2><ul>{resources_html}</ul>
        <h2 style="margin-top:32px">Legal</h2><ul>{legal_html}</ul></div>
      <div class="ft-touch"><div class="ft-head"><h2>Get in Touch</h2>
        <a class="footer-touch" href="{h("/contact")}">Get in Touch &rarr;</a></div>
        <address class="ft-contact">
          <div class="ft-full">{addr("Email", C["email"], contact_href("mailto"))}</div>
          {addr("Phone", C["phone"], contact_href("tel"))}
          {addr("WhatsApp", C["whatsapp"], contact_href("whatsapp"))}
          <div class="ft-full">{addr("Office", C["addressLines"])}</div>
        </address>
        <!-- Hours and Follow Us share one row instead of stacking. -->
        <div class="ft-lower">
          <div>
            <span class="ft-label">{e(C["hours"]["label"])}</span>
            {hours_rows(dark=True)}
          </div>
          {f'<div class="follow"><h2>Follow Us</h2><ul class="socials">{socials}</ul></div>' if socials else ""}
        </div>
      </div>
    </div>
    <div style="margin-top:36px;border-top:1px solid rgba(255,255,255,.1);padding-top:24px">
      <h2>{e(LEGAL["integrity"]["title"])}</h2>
      <p style="margin-top:12px;max-width:64rem;font-size:.9rem;line-height:1.7;color:rgba(255,255,255,.55)">{e(LEGAL["integrity"]["body"])}</p>
    </div>
    <div class="footer-bar">
      <p>&copy; 2026 {e(B["legalName"])}. All rights reserved.</p>
      <p>SetuVidya is an independent consultancy and is not affiliated with any university, publisher or indexing body.</p>
    </div>
  </div>
</footer>"""


JS = r"""
(function(){
  /* NodeList.prototype.forEach is missing in older engines, and one throw here
     would leave every .reveal element stuck at opacity 0. Iterate over a real
     array instead, and isolate each feature so a failure stays local. */
  function each(list, fn){
    var arr = Array.prototype.slice.call(list || []);
    for(var i = 0; i < arr.length; i++){ fn(arr[i], i); }
  }
  function guard(fn){ try { fn(); } catch(err){ if(window.console) console.error(err); } }

  /* Derived from the pages actually emitted, so a new route can never be
     rendered but unreachable. */
  var routes = Array.prototype.map.call(
    document.querySelectorAll('.page[data-route]'),
    function(p){ return p.getAttribute('data-route'); });

  function currentRoute(){
    var r = (location.hash || '#/').slice(1);
    return routes.indexOf(r) === -1 ? '/' : r;
  }

  function show(route){
    each(document.querySelectorAll('.page'), function(p){
      p.setAttribute('data-active', p.dataset.route === route ? 'true' : 'false');
    });
    /* Nav links only. This previously selected every [data-route], which
       includes the page containers, so a nested route such as
       /research-guide/thesis/x also marked /research-guide active. */
    each(document.querySelectorAll('a[data-route]'), function(l){
      var r = l.getAttribute('data-route');
      l.setAttribute('data-active', r === route || (r !== '/' && route.indexOf(r) === 0) ? 'true' : 'false');
    });
    document.title = (route === '/' ? 'SetuVidya Consultancy | Academic Research, Thesis & Publication Support'
      : (document.querySelector('.page[data-route="'+route+'"] h1') || {}).textContent + ' | SetuVidya Consultancy');
    window.scrollTo(0,0);
    observeReveals();

    if(pendingScroll){
      var target = document.getElementById(pendingScroll);
      pendingScroll = null;
      if(target){
        window.setTimeout(function(){
          target.scrollIntoView({behavior:'smooth', block:'start'});
        }, 60);
      }
    }

    /* A hash change does not reload the document, so without this a keyboard
       user stays focused wherever they were on the previous page. Move focus
       to the new page's container, but not on first load. */
    if(booted){
      var main = document.getElementById('main');
      if(main && main.focus) main.focus({preventScroll:true});
    }
    booted = true;
  }
  var booted = false;

  /* A link may ask for an in-page target once its route is rendered. The
     preview routes on the hash, so the anchor travels in data-scroll. */
  var pendingScroll = null;
  document.addEventListener('click', function(ev){
    var a = ev.target && ev.target.closest ? ev.target.closest('a[data-scroll]') : null;
    if(a){
      pendingScroll = a.getAttribute('data-scroll');
      /* Same-route anchor: the hash does not change, so show() never runs and
         the pending scroll would sit unconsumed. Scroll here instead. */
      var href = a.getAttribute('href') || '';
      if(href.slice(1) === currentRoute()){
        var t = document.getElementById(pendingScroll);
        pendingScroll = null;
        if(t) window.setTimeout(function(){ t.scrollIntoView({behavior:'smooth', block:'start'}); }, 30);
      }
    }
  });

  window.addEventListener('hashchange', function(){ show(currentRoute()); closeAll(); });

  /* ---- header state ---- */
  var header = document.getElementById('site-header');
  guard(function(){
  function onScroll(){ header.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
  });

  /* ---- dropdown ---- */
  each(document.querySelectorAll('.has-menu'), function(li){
    var btn = li.querySelector('.navlink');
    var t, pinned = false;
    function open(v){ li.setAttribute('data-open', v); btn.setAttribute('aria-expanded', v); }

    /* Hover opens the menu; clicking the trigger pins it open so it survives
       the pointer leaving. Without the pin, a hover followed by a click reads
       as the menu closing the moment you try to use it. */
    li.addEventListener('mouseenter', function(){ clearTimeout(t); open('true'); });
    li.addEventListener('mouseleave', function(){
      if(pinned) return;
      t = setTimeout(function(){ open('false'); }, 140);
    });
    btn.addEventListener('click', function(){
      clearTimeout(t);
      pinned = !pinned;
      open(pinned ? 'true' : 'false');
    });
    li.addEventListener('sv:reset', function(){ pinned = false; clearTimeout(t); open('false'); });
  });

  /* ---- drawer ---- */
  var drawer = document.getElementById('drawer'), burger = document.getElementById('burger');
  function closeAll(){
    drawer.setAttribute('data-open','false'); burger.setAttribute('aria-expanded','false');
    document.body.style.overflow='';
    each(document.querySelectorAll('.has-menu'), function(li){
      li.dispatchEvent(new CustomEvent('sv:reset'));
    });
  }
  burger.addEventListener('click', function(){
    drawer.setAttribute('data-open','true'); burger.setAttribute('aria-expanded','true');
    document.body.style.overflow='hidden';
  });
  each(drawer.querySelectorAll('[data-close]'), function(el){ el.addEventListener('click', closeAll); });
  each(drawer.querySelectorAll('a'), function(a){ a.addEventListener('click', closeAll); });
  document.addEventListener('keydown', function(ev){ if(ev.key === 'Escape') closeAll(); });

  /* ---- accordion ---- */
  each(document.querySelectorAll('.acc-btn'), function(btn){
    btn.addEventListener('click', function(){
      var item = btn.closest('.acc-item');
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      var isOpen = item.hasAttribute('data-open');
      each(item.parentElement.querySelectorAll('.acc-item'), function(other){
        other.removeAttribute('data-open');
        other.querySelector('.acc-btn').setAttribute('aria-expanded','false');
        other.querySelector('.acc-panel').hidden = true;
      });
      if(!isOpen){
        item.setAttribute('data-open','');
        btn.setAttribute('aria-expanded','true');
        panel.hidden = false;
      }
    });
  });

  /* ---- reveal on scroll ---- */
  var io = null;
  function observeReveals(){
    var nodes = document.querySelectorAll('.page[data-active="true"] .reveal');
    if(!('IntersectionObserver' in window)){
      each(nodes, function(n){ n.setAttribute('data-shown','true'); }); return;
    }
    if(io) io.disconnect();
    io = new IntersectionObserver(function(entries){
      each(entries, function(en){
        if(en.isIntersecting){ en.target.setAttribute('data-shown','true'); io.unobserve(en.target); }
      });
    }, {rootMargin:'0px 0px -8% 0px', threshold:0});
    each(nodes, function(n, i){
      n.style.animationDelay = ((i % 6) * 60) + 'ms';
      io.observe(n);
    });
  }

  /* ---- enquiry form ---- */
  var form = document.getElementById('enquiry-form');
  if(form){
    var fileInput = document.getElementById('document');
    fileInput.addEventListener('change', function(){
      var f = fileInput.files[0];
      document.getElementById('file-label').textContent =
        f ? f.name : 'Attach a PDF, Word, text, image or ZIP file';
    });

    var rules = {
      fullName: function(v){ return v.trim().length >= 2 ? '' : 'Enter your full name.'; },
      email: function(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' :
        'Enter a valid email address, for example name@university.edu.'; },
      phone: function(v){ return /^[+0-9()\-\s]{7,24}$/.test(v.trim()) ? '' :
        'Enter a phone number with country code.'; },
      academicLevel: function(v){ return v ? '' : 'Choose your academic level.'; },
      service: function(v){ return v ? '' : 'Choose the service you need.'; },
      discipline: function(v){ return v.trim().length >= 2 ? '' :
        'Enter your research discipline, for example Structural Engineering.'; },
      requirement: function(v){ return v.trim().length >= 20 ? '' :
        'Describe your requirement in at least 20 characters so we can assess it.'; }
    };

    function setErr(name, msg){
      var p = form.querySelector('[data-err="'+name+'"]');
      var field = form.elements[name];
      if(p){ p.textContent = msg; p.hidden = !msg; }
      if(field){
        if(msg){ field.setAttribute('aria-invalid','true'); field.setAttribute('aria-describedby', name+'-err'); }
        else { field.removeAttribute('aria-invalid'); field.removeAttribute('aria-describedby'); }
      }
    }

    form.addEventListener('submit', function(ev){
      ev.preventDefault();
      var alertSlot = document.getElementById('form-alert-slot');

      /* Render the error container only when there is a message, and remove it
         entirely when there is not. No permanently-present hidden element. */
      function setFormAlert(msg){
        var existing = document.getElementById('form-alert');
        if(!msg){
          if(existing) existing.remove();
          return null;
        }
        if(!existing){
          existing = document.createElement('div');
          existing.id = 'form-alert';
          existing.className = 'alert';
          existing.setAttribute('role', 'alert');
          existing.setAttribute('tabindex', '-1');
          alertSlot.appendChild(existing);
        }
        existing.textContent = msg;
        return existing;
      }
      var ok = true;
      each(Object.keys(rules), function(name){
        var msg = rules[name](form.elements[name].value);
        setErr(name, msg);
        if(msg) ok = false;
      });
      var consentMsg = form.elements.consent.checked ? '' :
        'Tick the box to let us contact you about this enquiry.';
      setErr('consent', consentMsg);
      if(consentMsg) ok = false;

      var f = fileInput.files[0];
      var fileMsg = (f && f.size > 10*1024*1024) ?
        'That file is over 10 MB. Compress it or send a download link in your requirement.' : '';
      setErr('document', fileMsg);
      if(fileMsg) ok = false;

      if(!ok){
        var box = setFormAlert('Check the highlighted fields and send again.');
        if(box) box.focus();
        return;
      }

      /* This preview has no backend, and it says so rather than faking a
         success state. In the Next.js app this posts to /api/enquiry. */
      setFormAlert('Validation passed. This static preview has no backend, so nothing was sent \u2014 in the Next.js project this posts to /api/enquiry.');
    });
  }

  /* ---- understanding your thesis (single-open, mirrors the FAQ) ---- */
  guard(function(){
    each(document.querySelectorAll('.ta-btn'), function(btn){
      btn.addEventListener('click', function(){
        var item = btn.closest('.ta-item');
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        var wasOpen = item.hasAttribute('data-open');
        each(item.parentElement.querySelectorAll('.ta-item'), function(other){
          other.removeAttribute('data-open');
          other.querySelector('.ta-btn').setAttribute('aria-expanded','false');
          other.querySelector('.ta-panel').hidden = true;
        });
        if(!wasOpen){
          item.setAttribute('data-open','');
          btn.setAttribute('aria-expanded','true');
          panel.hidden = false;
        }
      });
    });
  });

  /* ---- research domain disclosures ---- */
  guard(function(){
    each(document.querySelectorAll('.rd-toggle'), function(btn){
      btn.addEventListener('click', function(){
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        panel.hidden = open;
        btn.querySelector('.rd-toggle-text').textContent =
          open ? btn.getAttribute('data-expand') : btn.getAttribute('data-collapse');
        /* the "+N more" counter is only accurate while the panel is closed */
        var more = btn.closest('.rd-card').querySelector('.rd-more');
        if(more) more.style.display = open ? '' : 'none';
      });
    });
  });

  /* ---- research-area cards: each expands on its own ---- */
  guard(function(){
    each(document.querySelectorAll('.rt-toggle'), function(btn){
      btn.addEventListener('click', function(){
        var list = document.getElementById(btn.getAttribute('aria-controls'));
        if(!list) return;
        var open = btn.getAttribute('aria-expanded') === 'true';
        list.textContent = open ? list.getAttribute('data-preview') : list.getAttribute('data-full');
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        btn.textContent = open ? 'View all subjects \u2192' : 'Show less \u2191';
      });
    });
  });

  /* ---- testimonial rail: prev/next, disabled at each end ---- */
  guard(function(){
    each(document.querySelectorAll('.rv-rail-wrap'), function(wrap){
      var rail = wrap.querySelector('.rv-rail');
      var prev = wrap.querySelector('.rv-prev');
      var next = wrap.querySelector('.rv-next');
      if(!rail || !prev || !next) return;
      function sync(){
        prev.disabled = rail.scrollLeft <= 2;
        next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2;
      }
      function step(dir){
        var card = rail.querySelector('li');
        var w = card ? card.getBoundingClientRect().width + 24 : rail.clientWidth * 0.8;
        rail.scrollBy({left: dir * w, behavior: 'smooth'});
      }
      prev.addEventListener('click', function(){ step(-1); });
      next.addEventListener('click', function(){ step(1); });
      rail.addEventListener('scroll', sync, {passive:true});
      window.addEventListener('resize', sync);
      sync();
    });
  });

  /* ---- education updates: search + category chips ---- */
  guard(function(){
    /* Home section and archive each have their own controls. */
    each([['eu-q','eu-empty','eu-live','#education-updates'],
          ['eu-q2','eu-empty2','eu-live2','.page[data-route="/education-updates"]']],
         function(cfg){ wireUpdates(cfg[0], cfg[1], cfg[2], cfg[3]); });
  });

  function wireUpdates(qId, emptyId, liveId, scope){
    var root = document.querySelector(scope);
    var q = document.getElementById(qId);
    if(!root || !q) return;
    var chips = root.querySelectorAll('.eu-chip');
    var items = root.querySelectorAll('.eu-item');
    var empty = document.getElementById(emptyId);
    var live = document.getElementById(liveId);
    var cat = 'All';

    function apply(){
      var text = q.value.trim().toLowerCase();
      var shown = 0;
      each(items, function(li){
        var okCat = (cat === 'All') || (li.getAttribute('data-cat') === cat);
        var okText = !text || li.getAttribute('data-text').indexOf(text) !== -1;
        var show = okCat && okText;
        li.hidden = !show;
        if(show) shown++;
      });
      if(empty){
        empty.hidden = shown > 0;
        if(shown === 0){
          var map = {};
          try { map = JSON.parse(empty.getAttribute('data-empty') || '{}'); } catch(err) { map = {}; }
          empty.textContent = (!text && map[cat]) ? map[cat] : empty.getAttribute('data-default');
        }
      }
      if(live) live.textContent = shown + (shown === 1 ? ' update shown.' : ' updates shown.');
    }

    q.addEventListener('input', apply);
    each(chips, function(btn){
      btn.addEventListener('click', function(){
        cat = btn.getAttribute('data-cat');
        each(chips, function(b){ b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
        apply();
      });
    });
  }

  /* ---- book commerce: buy, cart, checkout, confirmation ---- */
  guard(function(){
    var dataEl = document.getElementById('cm-data');
    var overlay = document.getElementById('cm-overlay');
    if(!dataEl || !overlay) return;

    var CFG = JSON.parse(dataEl.textContent);
    var panel = document.getElementById('cm-panel');
    var titleEl = document.getElementById('cm-title');
    var bodyEl = document.getElementById('cm-body');
    var footEl = document.getElementById('cm-foot');
    var liveEl = document.getElementById('cm-live');
    var cartBtn = document.getElementById('cm-cart-btn');
    var countEl = document.getElementById('cm-count');

    var lines = [];            /* {id, quantity} only - prices are derived */
    var view = 'closed';
    var buyId = null;
    var buyQty = 1;
    var confirmation = null;
    var customer = {name:'',email:'',mobile:'',address:'',city:'',state:'',pin:'',country:'India'};
    var errors = {};
    var formError = null;
    var lastFocused = null;

    function esc(t){
      return String(t == null ? '' : t).replace(/[&<>"']/g, function(c){
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
      });
    }
    function product(id){
      for(var i=0;i<CFG.products.length;i++){ if(CFG.products[i].id === id) return CFG.products[i]; }
      return null;
    }
    function money(v){
      if(typeof v !== 'number' || isNaN(v)) return null;
      return CFG.currencySymbol + v.toLocaleString('en-IN');
    }
    function announce(msg){ if(liveEl) liveEl.textContent = msg; }

    /* Totals mirror lib/commerce.ts: a figure appears only when every input is
       a configured number. Nothing is coerced to zero. */
    function totals(){
      var count = 0, sub = 0, unpriced = false;
      each(lines, function(l){
        count += l.quantity;
        var p = product(l.id);
        if(!p || typeof p.price !== 'number'){ unpriced = true; return; }
        sub += p.price * l.quantity;
      });
      var subtotal = (unpriced || lines.length === 0) ? null : sub;
      var shipCfg = CFG.shipping;
      var shippingConfigured = !shipCfg.enabled || typeof shipCfg.charge === 'number';
      var shipping = null;
      if(!shipCfg.enabled) shipping = 0;
      else if(typeof shipCfg.charge === 'number') shipping = shipCfg.charge;
      var total = (typeof subtotal === 'number' && typeof shipping === 'number')
        ? subtotal + shipping : null;
      return {subtotal:subtotal, shipping:shipping, total:total,
              hasUnpricedItem:unpriced, shippingConfigured:shippingConfigured, itemCount:count};
    }

    function items(){
      var out = [];
      each(lines, function(l){
        var p = product(l.id);
        if(!p) return;
        var unit = typeof p.price === 'number' ? p.price : null;
        out.push({id:p.id, title:p.title, isbn:p.isbn, quantity:l.quantity,
                  unitPrice:unit, lineTotal: unit === null ? null : unit * l.quantity});
      });
      return out;
    }

    function amountCell(v, fallback){
      var m = money(v);
      return m ? '<span>' + m + '</span>'
               : '<span class="cm-tbc">' + esc(fallback || CFG.totalUnavailable) + '</span>';
    }

    function totalsBlock(t){
      return '<div class="cm-totals">'
        + '<div><dt>Subtotal</dt><dd>' + amountCell(t.subtotal) + '</dd></div>'
        + '<div><dt>Shipping</dt><dd>'
        + (t.shippingConfigured ? amountCell(t.shipping)
            : '<span class="cm-tbc">Confirmed after your request</span>') + '</dd></div>'
        + '<div class="cm-grand"><dt>Total</dt><dd>' + amountCell(t.total) + '</dd></div>'
        + (t.hasUnpricedItem ? '<p class="cm-tbc">' + esc(CFG.priceUnavailable) + '</p>' : '')
        + '</div>';
    }

    function waHref(extra){
      if(!CFG.whatsapp) return null;
      var its = (extra && extra.items) || items();
      var t = (extra && extra.totals) || totals();
      var msg = ['Book order request \u2014 SetuVidya / SD Publication House',''];
      if(extra && extra.name) msg.push('Name: ' + extra.name);
      if(extra && extra.reference) msg.push('Reference: ' + extra.reference);
      if((extra && extra.name) || (extra && extra.reference)) msg.push('');
      msg.push('Items:');
      each(its, function(it, i){
        var lt = money(it.lineTotal);
        msg.push((i+1) + '. ' + it.title + ' \u2014 qty ' + it.quantity + (lt ? ' \u2014 ' + lt : ''));
        if(it.isbn) msg.push('   ISBN: ' + it.isbn);
      });
      var tot = money(t.total);
      msg.push('', tot ? ('Total: ' + tot) : 'Total: to be confirmed.');
      return 'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(msg.join('\n'));
    }

    function waButton(extra){
      var href = waHref(extra);
      if(!href || items().length === 0 && !(extra && extra.items && extra.items.length)) return '';
      return '<a class="btn btn-secondary" id="cm-wa" href="' + href + '" target="_blank" '
           + 'rel="noopener noreferrer">' + esc(CFG.labels.whatsapp) + '</a>';
    }

    /* ------------------------------------------------------------ renders */

    function renderBuy(){
      var p = product(buyId);
      if(!p) return;
      titleEl.textContent = CFG.labels.buy;
      panel.setAttribute('aria-label', CFG.labels.buy);
      var meta = '';
      if(p.coAuthor) meta += '<div><dt>Co-author</dt><dd>' + esc(p.coAuthor) + '</dd></div>';
      if(p.publisher) meta += '<div><dt>Publisher</dt><dd>' + esc(p.publisher) + '</dd></div>';
      if(p.year) meta += '<div><dt>Year</dt><dd>' + esc(p.year) + '</dd></div>';
      if(p.isbn) meta += '<div><dt>ISBN</dt><dd>' + esc(p.isbn) + '</dd></div>';
      bodyEl.innerHTML =
        '<div class="cm-buy-book">'
        + '<img src="' + p.front + '" alt="' + esc(p.frontAlt || ('Front cover of ' + p.title)) + '">'
        + '<div class="cm-buy-meta"><h3>' + esc(p.title) + '</h3>'
        + (p.subtitle ? '<p class="cm-tbc">' + esc(p.subtitle) + '</p>' : '')
        + '<dl><div><dt>Author</dt><dd>' + esc(p.author) + '</dd></div>' + meta + '</dl>'
        + (p.priceHtml || '') + '</div></div>'
        + '<div class="cm-qty-row"><span style="font-weight:500;color:var(--ink)">Quantity</span>'
        + '<span class="cm-qty">'
        + '<button type="button" id="cm-buy-dec" aria-label="Decrease quantity of ' + esc(p.title) + '">&minus;</button>'
        + '<span id="cm-buy-qty">' + buyQty + '</span>'
        + '<button type="button" id="cm-buy-inc" aria-label="Increase quantity of ' + esc(p.title) + '">+</button>'
        + '</span></div>'
        + '<p class="cm-note">' + esc(CFG.payment.note) + '</p>';
      footEl.innerHTML =
        '<button type="button" class="btn btn-primary" id="cm-add">' + esc(CFG.labels.addToCart) + '</button>'
        + '<button type="button" class="btn btn-secondary" id="cm-buynow">' + esc(CFG.labels.buyNow) + '</button>';

      document.getElementById('cm-buy-dec').addEventListener('click', function(){
        buyQty = Math.max(1, buyQty - 1); document.getElementById('cm-buy-qty').textContent = buyQty; });
      document.getElementById('cm-buy-inc').addEventListener('click', function(){
        buyQty = Math.min(50, buyQty + 1); document.getElementById('cm-buy-qty').textContent = buyQty; });
      document.getElementById('cm-add').addEventListener('click', function(){
        add(buyId, buyQty); setView('cart'); });
      document.getElementById('cm-buynow').addEventListener('click', function(){
        add(buyId, buyQty); setView('checkout'); });
    }

    function renderCart(){
      var its = items(), t = totals();
      titleEl.textContent = its.length ? (CFG.labels.cart + ' (' + t.itemCount + ')') : CFG.labels.cart;
      panel.setAttribute('aria-label', CFG.labels.cart);
      if(its.length === 0){
        bodyEl.innerHTML = '<div class="cm-empty"><strong>' + esc(CFG.labels.emptyCart) + '</strong>'
          + '<p>' + esc(CFG.labels.emptyCartHint) + '</p>'
          + '<button type="button" class="btn btn-secondary" id="cm-back">Back to the collection</button></div>';
        footEl.innerHTML = '';
        document.getElementById('cm-back').addEventListener('click', close);
        return;
      }
      var rows = '';
      each(its, function(it){
        rows += '<div class="cm-line" data-line="' + esc(it.id) + '">'
          + '<div style="flex:1;min-width:0"><h4>' + esc(it.title) + '</h4>'
          + '<p class="cm-line-unit">' + (money(it.unitPrice) || esc(CFG.priceUnavailable)) + '</p>'
          + '<button type="button" class="cm-remove" data-remove="' + esc(it.id) + '">Remove</button></div>'
          + '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">'
          + '<span class="cm-qty">'
          + '<button type="button" data-dec="' + esc(it.id) + '" aria-label="Decrease quantity of ' + esc(it.title) + '">&minus;</button>'
          + '<span data-qty="' + esc(it.id) + '">' + it.quantity + '</span>'
          + '<button type="button" data-inc="' + esc(it.id) + '" aria-label="Increase quantity of ' + esc(it.title) + '">+</button>'
          + '</span><span style="font-weight:500;color:var(--ink)">' + amountCell(it.lineTotal, '\u2014') + '</span>'
          + '</div></div>';
      });
      bodyEl.innerHTML = rows + totalsBlock(t)
        + '<button type="button" class="cm-remove" id="cm-clear" style="margin-top:16px">Empty cart</button>';
      footEl.innerHTML = '<button type="button" class="btn btn-primary" id="cm-checkout">'
        + esc(CFG.labels.checkout) + '</button>' + waButton();

      each(bodyEl.querySelectorAll('[data-inc]'), function(b){
        b.addEventListener('click', function(){ setQty(b.getAttribute('data-inc'), +1); }); });
      each(bodyEl.querySelectorAll('[data-dec]'), function(b){
        b.addEventListener('click', function(){ setQty(b.getAttribute('data-dec'), -1); }); });
      each(bodyEl.querySelectorAll('[data-remove]'), function(b){
        b.addEventListener('click', function(){ remove(b.getAttribute('data-remove')); }); });
      document.getElementById('cm-clear').addEventListener('click', function(){
        lines = []; announce('Cart emptied.'); render(); });
      document.getElementById('cm-checkout').addEventListener('click', function(){ setView('checkout'); });
    }

    var RULES = {
      name: function(v){ return v.trim().length >= 2 ? '' : 'Enter the name the order should be addressed to.'; },
      email: function(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? ''
        : 'Enter a valid email address, for example name@example.com.'; },
      mobile: function(v){
        if(!/^[+0-9()\-\s]{10,18}$/.test(v.trim())) return 'Enter a mobile number with country code, e.g. +91 98765 43210.';
        return v.replace(/\D/g,'').length >= 10 ? '' : 'A mobile number needs at least 10 digits.'; },
      address: function(v){ return v.trim().length >= 8 ? ''
        : 'Enter the full delivery address, including house or flat number.'; },
      city: function(v){ return v.trim().length >= 2 ? '' : 'Enter your city.'; },
      state: function(v){ return v.trim().length >= 2 ? '' : 'Choose your state.'; },
      pin: function(v){ return /^[1-9][0-9]{5}$/.test(v.trim()) ? ''
        : 'Enter a 6-digit Indian PIN code, e.g. 110001.'; },
      country: function(v){ return v.trim().length >= 2 ? '' : 'Enter your country.'; }
    };
    var FIELDS = [
      ['name','Full name','text',true],['email','Email','email',false],
      ['mobile','Mobile number','tel',false],['address','Delivery address','textarea',true],
      ['city','City','text',false],['state','State','select',false],
      ['pin','PIN code','text',false],['country','Country','text',false]
    ];

    function renderCheckout(){
      var its = items(), t = totals();
      titleEl.textContent = CFG.labels.checkout;
      panel.setAttribute('aria-label', CFG.labels.checkout);

      var fields = '';
      each(FIELDS, function(f){
        var key = f[0], label = f[1], type = f[2], span = f[3];
        var err = errors[key];
        var describe = err ? ' aria-describedby="cm-' + key + '-err" aria-invalid="true"' : '';
        var input;
        if(type === 'textarea'){
          input = '<textarea id="cm-' + key + '" class="textarea" rows="3"' + describe + '>'
                + esc(customer[key]) + '</textarea>';
        } else if(type === 'select'){
          var opts = '<option value="">Choose one</option>';
          each(CFG.states, function(st){
            opts += '<option value="' + esc(st) + '"' + (customer[key] === st ? ' selected' : '') + '>'
                  + esc(st) + '</option>'; });
          input = '<select id="cm-' + key + '" class="select"' + describe + '>' + opts + '</select>';
        } else {
          input = '<input id="cm-' + key + '" class="input" type="' + type + '" value="'
                + esc(customer[key]) + '"' + describe + '>';
        }
        fields += '<div' + (span ? ' class="cm-span2"' : '') + '>'
          + '<label class="cm-field" for="cm-' + key + '">' + esc(label) + '</label>' + input
          + (err ? '<p class="cm-err" id="cm-' + key + '-err">' + esc(err) + '</p>' : '')
          + '</div>';
      });

      var rows = '';
      each(its, function(it){
        rows += '<tr><td>' + esc(it.title) + '</td>'
          + '<td class="num">' + it.quantity + '</td>'
          + '<td class="num">' + amountCell(it.unitPrice, '\u2014') + '</td>'
          + '<td class="num">' + amountCell(it.lineTotal, '\u2014') + '</td></tr>';
      });

      bodyEl.innerHTML =
        (formError ? '<div class="cm-alert" id="cm-alert" role="alert" tabindex="-1">'
                   + esc(formError) + '</div>' : '')
        + '<form id="cm-form" novalidate><div class="cm-grid">' + fields + '</div></form>'
        + '<section class="cm-summary" aria-labelledby="cm-sum-h"><h3 id="cm-sum-h">Order summary</h3>'
        + '<table><thead><tr><th scope="col">Book</th><th scope="col" class="num">Qty</th>'
        + '<th scope="col" class="num">Unit</th><th scope="col" class="num">Total</th></tr></thead>'
        + '<tbody>' + rows + '</tbody></table>'
        + totalsBlock(t)
        + '<p class="cm-note">' + esc(CFG.payment.note) + '</p></section>';

      footEl.innerHTML =
        '<button type="submit" form="cm-form" class="btn btn-primary" id="cm-submit">Submit order request</button>'
        + waButton({name: customer.name || null})
        + '<button type="button" class="cm-remove" id="cm-back-cart" style="text-align:center">Back to cart</button>';

      each(FIELDS, function(f){
        var el = document.getElementById('cm-' + f[0]);
        el.addEventListener('input', function(){ customer[f[0]] = el.value; });
        el.addEventListener('change', function(){ customer[f[0]] = el.value; });
      });
      document.getElementById('cm-back-cart').addEventListener('click', function(){ setView('cart'); });
      document.getElementById('cm-form').addEventListener('submit', submitOrder);
      if(formError){ var a = document.getElementById('cm-alert'); if(a) a.focus(); }
    }

    function submitOrder(ev){
      ev.preventDefault();
      errors = {}; formError = null;
      var ok = true;
      each(Object.keys(RULES), function(k){
        var msg = RULES[k](customer[k] || '');
        if(msg){ errors[k] = msg; ok = false; }
      });
      if(!ok){
        formError = 'Check the highlighted fields and submit again.';
        render();
        return;
      }
      /* The Next.js app posts ids and quantities to /api/orders, which
         recomputes every amount server-side. This static preview has no
         backend, so it shows the confirmation state with that stated plainly
         and nothing actually sent. */
      confirmation = {
        reference: 'SV-BK-' + new Date().toISOString().slice(2,10).replace(/-/g,'')
                   + '-' + Math.random().toString(36).slice(2,6).toUpperCase(),
        items: items(), totals: totals(), name: customer.name, previewOnly: true
      };
      lines = [];
      announce('Order request received.');
      setView('confirmed');
    }

    function renderConfirmed(){
      var c = confirmation;
      if(!c) return;
      titleEl.textContent = CFG.confirmation.title;
      panel.setAttribute('aria-label', CFG.confirmation.title);
      var rows = '';
      each(c.items, function(it){
        rows += '<div class="cm-line" style="padding:12px 0"><span>' + esc(it.title)
          + ' <span class="cm-tbc">\u00d7 ' + it.quantity + '</span></span>'
          + amountCell(it.lineTotal, '\u2014') + '</div>';
      });
      var steps = '';
      each(CFG.confirmation.nextSteps, function(st, i){
        steps += '<li><span>' + (i+1) + '.</span>' + esc(st) + '</li>'; });
      bodyEl.innerHTML =
        '<p class="cm-ok">' + esc(CFG.confirmation.title) + '</p>'
        + '<p style="margin-top:12px;font-size:.93rem">' + esc(CFG.confirmation.body) + '</p>'
        + (c.previewOnly ? '<p class="cm-note">This static preview has no backend, so nothing was '
            + 'submitted. In the Next.js app this posts to /api/orders, which recomputes every '
            + 'amount server-side.</p>' : '')
        + '<p style="margin-top:20px;font-size:.9rem"><span class="cm-tbc">Order reference: </span>'
        + '<strong id="cm-ref">' + esc(c.reference) + '</strong></p>'
        + '<div style="margin-top:20px;border-top:1px solid var(--rule)">' + rows + '</div>'
        + totalsBlock(c.totals)
        + '<h4 class="cm-field" style="margin-top:28px;text-transform:uppercase;letter-spacing:.13em;'
        + 'font-size:.8rem;color:var(--muted)">' + esc(CFG.confirmation.nextStepsLabel) + '</h4>'
        + '<ol class="cm-steps">' + steps + '</ol>';
      footEl.innerHTML = waButton({items:c.items, totals:c.totals, name:c.name, reference:c.reference})
        + '<button type="button" class="btn btn-secondary" id="cm-done">Done</button>';
      document.getElementById('cm-done').addEventListener('click', close);
    }

    /* ------------------------------------------------------------- state */

    function add(id, qty){
      var p = product(id);
      if(!p || !p.available) return;
      var found = null;
      each(lines, function(l){ if(l.id === id) found = l; });
      if(found) found.quantity = Math.min(50, found.quantity + (qty || 1));
      else lines.push({id:id, quantity: Math.min(50, qty || 1)});
      var now = 0; each(lines, function(l){ if(l.id === id) now = l.quantity; });
      announce(p.title + ' added to cart. Quantity ' + now + '.');
      updateCartBtn();
    }
    function setQty(id, delta){
      var p = product(id), next = null;
      each(lines, function(l){ if(l.id === id) next = l.quantity + delta; });
      if(next === null) return;
      if(next <= 0){ remove(id); return; }
      each(lines, function(l){ if(l.id === id) l.quantity = Math.min(50, next); });
      announce((p ? p.title : 'Item') + ' quantity ' + Math.min(50, next) + '.');
      render();
    }
    function remove(id){
      var p = product(id);
      lines = lines.filter(function(l){ return l.id !== id; });
      announce((p ? p.title : 'Item') + ' removed from cart.');
      render();
    }
    function updateCartBtn(){
      var t = totals();
      countEl.textContent = t.itemCount;
      cartBtn.hidden = !(t.itemCount > 0 && view === 'closed');
    }

    function render(){
      if(view === 'buy') renderBuy();
      else if(view === 'cart') renderCart();
      else if(view === 'checkout') renderCheckout();
      else if(view === 'confirmed') renderConfirmed();
      updateCartBtn();
    }

    function setView(v){
      if(view === 'closed' && v !== 'closed') lastFocused = document.activeElement;
      view = v;
      if(v === 'closed'){ close(); return; }
      overlay.hidden = false;
      document.body.style.overflow = 'hidden';
      render();
      var focusTarget = panel.querySelector('.cm-close');
      if(focusTarget) focusTarget.focus();
    }

    function close(){
      view = 'closed';
      overlay.hidden = true;
      document.body.style.overflow = '';
      errors = {}; formError = null;
      updateCartBtn();
      if(lastFocused && lastFocused.focus) lastFocused.focus();
    }

    each(document.querySelectorAll('[data-buy]'), function(btn){
      btn.addEventListener('click', function(){
        buyId = btn.getAttribute('data-buy'); buyQty = 1; setView('buy'); });
    });
    cartBtn.addEventListener('click', function(){ setView('cart'); });
    each(overlay.querySelectorAll('[data-cm-close]'), function(el){
      el.addEventListener('click', close); });

    document.addEventListener('keydown', function(ev){
      if(overlay.hidden) return;
      if(ev.key === 'Escape'){ ev.preventDefault(); close(); return; }
      if(ev.key !== 'Tab') return;
      var f = Array.prototype.slice.call(panel.querySelectorAll(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])'))
        .filter(function(el){ return el.offsetParent !== null; });
      if(!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if(ev.shiftKey && document.activeElement === first){ ev.preventDefault(); last.focus(); }
      else if(!ev.shiftKey && document.activeElement === last){ ev.preventDefault(); first.focus(); }
    });

    updateCartBtn();
  });

  /* ---- published-books lightbox ---- */
  guard(function(){
    var dataEl = document.getElementById('bk-data');
    var box = document.getElementById('bk-lightbox');
    if(!dataEl || !box) return;

    var books = JSON.parse(dataEl.textContent);
    var idx = 0, side = 'front', lastFocused = null;
    var img = document.getElementById('bk-img');
    var titleEl = document.getElementById('bk-title');
    var byline = document.getElementById('bk-byline');
    var details = document.getElementById('bk-details');
    var count = document.getElementById('bk-count');

    function row(label, value){
      return value ? '<div><dt>'+label+'</dt><dd>'+value+'</dd></div>' : '';
    }

    function render(){
      var b = books[idx];
      titleEl.textContent = b.title;
      byline.textContent = b.author
        + (b.coAuthor ? ' \u00b7 with ' + b.coAuthor : '')
        + (b.year ? ' \u00b7 ' + b.year : '');
      img.src = side === 'front' ? b.front : b.back;
      img.alt = (side === 'front' ? b.frontAlt : b.backAlt) || b.title;
      details.innerHTML = row('Publisher', b.publisher) + row('ISBN', b.isbn) + row('MRP', b.mrp);
      count.textContent = (idx + 1) + ' of ' + books.length;
      each(box.querySelectorAll('.bk-tab'), function(t){
        t.setAttribute('aria-selected', t.getAttribute('data-side') === side ? 'true' : 'false');
      });
      box.querySelector('.bk-nav').style.display = books.length > 1 ? '' : 'none';
    }

    function open(i){
      lastFocused = document.activeElement;
      idx = i; side = 'front';
      render();
      box.hidden = false;
      document.body.style.overflow = 'hidden';
      box.querySelector('.bk-close').focus();
    }

    function close(){
      box.hidden = true;
      document.body.style.overflow = '';
      if(lastFocused && lastFocused.focus) lastFocused.focus();
    }

    function step(d){
      idx = (idx + d + books.length) % books.length;
      side = 'front';
      render();
    }

    each(document.querySelectorAll('.bk-open'), function(btn){
      btn.addEventListener('click', function(){ open(parseInt(btn.getAttribute('data-book'), 10)); });
    });
    each(box.querySelectorAll('[data-bk-close]'), function(el){
      el.addEventListener('click', close);
    });
    each(box.querySelectorAll('.bk-tab'), function(t){
      t.addEventListener('click', function(){ side = t.getAttribute('data-side'); render(); });
    });
    document.getElementById('bk-prev').addEventListener('click', function(){ step(-1); });
    document.getElementById('bk-next').addEventListener('click', function(){ step(1); });

    document.addEventListener('keydown', function(ev){
      if(box.hidden) return;
      if(ev.key === 'Escape'){ ev.preventDefault(); close(); return; }
      if(ev.key === 'ArrowRight'){ ev.preventDefault(); step(1); return; }
      if(ev.key === 'ArrowLeft'){ ev.preventDefault(); step(-1); return; }
      if(ev.key !== 'Tab') return;
      /* keep Tab inside the dialog */
      var f = Array.prototype.slice.call(
        box.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'))
        .filter(function(el){ return el.offsetParent !== null; });
      if(!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if(ev.shiftKey && document.activeElement === first){ ev.preventDefault(); last.focus(); }
      else if(!ev.shiftKey && document.activeElement === last){ ev.preventDefault(); first.focus(); }
    });
  });

  guard(function(){ show(currentRoute()); });
})();
"""


def build():
    pages = [
        ("/", page_home()),
        ("/about", page_about()),
        ("/services", page_services()),
        ("/research-thesis", page_thesis()),
        ("/publication", page_publication()),
        ("/book-publication", page_book()),
        ("/university-admission", page_admission()),
        ("/contact", page_contact()),
        ("/education-updates", updates_archive()),
        ("/research-guide", research_guide_hub()),
        ("/scopus-journal-list", scopus_journal_list()),
        ("/sci-journal-list", sci_journal_list()),
        ("/abdc-journal-list", abdc_journal_list()),
        ("/faq", faq_page()),
        ("/testimonials", testimonials_page()),
    ]
    for _g in GUIDES["guides"]:
        pages.append((f'/research-guide/{_g["type"]}/{_g["slug"]}', guide_page(_g)))
    for doc in LEGAL["documents"]:
        pages.append((f'/legal/{doc["slug"]}', page_legal(doc)))

    body = "".join(
        f'<div class="page" data-route="{route}" '
        f'data-active="{"true" if route == "/" else "false"}">{html_}</div>'
        for route, html_ in pages)

    doc = f"""<!DOCTYPE html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(DATA["seo"]["defaultTitle"])}</title>
<meta name="description" content="{e(DATA["seo"]["defaultDescription"])}">
<meta property="og:title" content="{e(DATA["seo"]["defaultTitle"])}">
<meta property="og:description" content="{e(DATA["seo"]["defaultDescription"])}">
<meta property="og:type" content="website">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap" rel="stylesheet">
<style>{CSS}
.contact-grid{{grid-template-columns:minmax(0,1fr)}}
@media(min-width:1024px){{.contact-grid{{grid-template-columns:1.35fr .65fr;gap:64px}}}}
</style>
</head>
<body>
<script>document.documentElement.setAttribute('data-reveal','on');window.setTimeout(function(){{if(!document.querySelector('.reveal[data-shown="true"]')){{document.documentElement.removeAttribute('data-reveal');}}}},2500);</script>
<a class="skip" href="#main">Skip to content</a>
{header_html()}
<main id="main" tabindex="-1">{body}</main>
{footer_html()}
<script>{JS}</script>
</body>
</html>
"""
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(doc, encoding="utf-8")
    print(f"wrote {OUT.relative_to(OUT.parent.parent)}  ({len(doc)/1024:.0f} KB)")


if __name__ == "__main__":
    build()
