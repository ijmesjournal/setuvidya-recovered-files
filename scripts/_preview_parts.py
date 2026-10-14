#!/usr/bin/env python3
"""
Build a single self-contained HTML preview of the whole site from
content/site.json, so the design can be reviewed without running Next.js.

Run:  python3 scripts/build-preview.py
Out:  preview/setuvidya-preview.html

The preview reads the same content file the Next.js app reads, so the copy in
it can never drift from the real site. It is a review artefact, not the
deliverable: the production site is the Next.js project.
"""

import base64
import html
import io
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / "content" / "site.json").read_text())
OUT = ROOT / "preview" / "setuvidya-preview.html"

e = html.escape


# --------------------------------------------------------------- primitives


def kicker(text):
    return f'<p class="kicker"><span class="kicker-rule"></span>{e(text)}</p>'


def heading(k, title, intro=None, invert=False, tag="h2", center=False):
    cls = " invert" if invert else ""
    if center:
        cls += " center"
    out = f'<div class="sec-head{cls}">'
    if k:
        out += kicker(k)
    out += f"<{tag}>{e(title)}</{tag}>"
    if intro:
        out += f'<p class="lede">{e(intro)}</p>'
    return out + "</div>"


def btn(label, href, variant="primary", scroll_to=None):
    """`scroll_to` names an element to scroll to after the route renders. The
    preview routes on the hash, so a second in-page hash is not available."""
    attr = f' data-scroll="{scroll_to}"' if scroll_to else ""
    return f'<a class="btn btn-{variant}" href="{href}"{attr}>{e(label)}</a>'


def stage_track(stages, invert=False, cols=4):
    items = ""
    for i, s in enumerate(stages):
        last = " last" if i == len(stages) - 1 else ""
        items += (
            f'<li class="reveal"><span class="track-line"></span>'
            f'<span class="track-node{last}"></span>'
            f'<p class="track-title"><span class="track-num">{i + 1:02d}</span>{e(s["stage"])}</p>'
            f'<p class="track-note">{e(s["note"])}</p></li>'
        )
    cls = "track" + (" invert" if invert else "") + f" cols-{cols}"
    return f'<ol class="{cls}">{items}</ol>'


def accordion(items, idp):
    out = '<div class="accordion">'
    for i, f in enumerate(items):
        open_attr = " data-open" if i == 0 else ""
        out += (
            f'<div class="acc-item"{open_attr}>'
            f'<h3><button type="button" class="acc-btn" aria-expanded="{"true" if i == 0 else "false"}"'
            f' aria-controls="{idp}-{i}"><span>{e(f["q"])}</span>'
            f'<span class="acc-icon" aria-hidden="true"></span></button></h3>'
            f'<div class="acc-panel" id="{idp}-{i}"{"" if i == 0 else " hidden"}>'
            f'<p>{e(f["a"])}</p></div></div>'
        )
    return out + "</div>"


# ------------------------------------------------------------------- motifs


def citation_network(light=False):
    nodes = [
        (90, 120, 4), (250, 70, 3), (400, 165, 5), (545, 90, 3), (700, 190, 4),
        (860, 105, 3), (1010, 200, 5), (1140, 120, 3), (160, 300, 3), (330, 380, 4),
        (500, 305, 3), (660, 400, 5), (820, 320, 3), (980, 420, 4), (1120, 340, 3),
        (70, 500, 4), (240, 560, 3), (430, 500, 3), (600, 580, 4), (780, 520, 3),
        (950, 585, 3), (1130, 520, 4),
    ]
    edges = [
        (0, 1), (1, 2), (2, 3), (3, 4), (4, 5), (5, 6), (6, 7), (0, 8), (8, 9),
        (2, 9), (9, 10), (10, 11), (4, 11), (11, 12), (12, 13), (6, 13), (13, 14),
        (8, 15), (15, 16), (16, 17), (9, 17), (17, 18), (11, 18), (18, 19),
        (19, 20), (13, 20), (20, 21), (14, 21), (3, 10), (5, 12),
    ]
    ink = "#ffffff" if light else "#12314F"
    gold = "#C6A04E" if light else "#A8802C"
    lines = "".join(
        f'<line x1="{nodes[a][0]}" y1="{nodes[a][1]}" x2="{nodes[b][0]}" y2="{nodes[b][1]}"/>'
        for a, b in edges
    )
    dots = "".join(
        f'<circle cx="{x}" cy="{y}" r="{r}" fill="{gold if i % 5 == 0 else ink}"/>'
        for i, (x, y, r) in enumerate(nodes)
    )
    return (
        f'<svg viewBox="0 0 1200 640" preserveAspectRatio="xMidYMid slice">'
        f'<g stroke="{ink}" stroke-width="1" fill="none">{lines}</g>{dots}</svg>'
    )


def document_outline():
    s = ""
    for x, y in ((60, 40), (420, 110), (780, 40)):
        w, h = 300, 420
        s += f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="none" stroke="#12314F" stroke-width="1.5"/>'
        s += f'<line x1="{x+26}" y1="{y+30}" x2="{x+w*0.42:.0f}" y2="{y+30}" stroke="#A8802C" stroke-width="3"/>'
        s += f'<line x1="{x+26}" y1="{y+42}" x2="{x+w-26}" y2="{y+42}" stroke="#12314F" stroke-width="1"/>'
        for i in range((h - 60) // 22):
            end = x + (w - 26 if i % 7 != 6 else int(w * 0.55))
            s += f'<line x1="{x+26}" y1="{y+58+i*22}" x2="{end}" y2="{y+58+i*22}" stroke="#12314F" stroke-width="1.4"/>'
    for i in range(24):
        s += f'<line x1="16" y1="{20+i*26}" x2="{40 if i % 4 == 0 else 30}" y2="{20+i*26}" stroke="#12314F" stroke-width="1"/>'
    return f'<svg viewBox="0 0 1200 640" preserveAspectRatio="xMidYMid slice">{s}</svg>'


def journal_columns():
    s = ""
    for cx, cy, rows in ((70, 90, 18), (320, 90, 18), (880, 300, 14)):
        for i in range(rows):
            end = cx + (120 if i % 9 == 8 else 210)
            s += f'<line x1="{cx}" y1="{cy+i*17}" x2="{end}" y2="{cy+i*17}" stroke="#12314F" stroke-width="1.4"/>'
    s += '<g transform="translate(640,90)"><line x1="0" y1="0" x2="0" y2="130" stroke="#12314F" stroke-width="1.5"/>'
    s += '<line x1="0" y1="130" x2="230" y2="130" stroke="#12314F" stroke-width="1.5"/>'
    for i, h in enumerate([46, 74, 30, 96, 58, 84, 40]):
        s += f'<rect x="{16+i*30}" y="{130-h}" width="16" height="{h}" fill="{"#A8802C" if i == 3 else "#12314F"}"/>'
    s += "</g>"
    s += '<g transform="translate(120,400)"><line x1="0" y1="0" x2="0" y2="150" stroke="#12314F" stroke-width="1.5"/>'
    s += '<line x1="0" y1="150" x2="260" y2="150" stroke="#12314F" stroke-width="1.5"/>'
    s += '<line x1="10" y1="140" x2="250" y2="26" stroke="#A8802C" stroke-width="2" stroke-dasharray="7 5"/>'
    for cx, cy in [(26, 128), (52, 120), (78, 104), (104, 96), (130, 82), (156, 70), (182, 58), (208, 44), (234, 34), (66, 112), (144, 88)]:
        s += f'<circle cx="{cx}" cy="{cy}" r="4" fill="#12314F"/>'
    s += "</g>"
    for x, y, t in ((560, 330, "[12]"), (470, 560, "[7]"), (1010, 150, "[31]"), (760, 600, "[4]")):
        s += f'<text x="{x}" y="{y}" fill="#12314F" font-family="Georgia,serif" font-size="26">{t}</text>'
    return f'<svg viewBox="0 0 1200 640" preserveAspectRatio="xMidYMid slice">{s}</svg>'


def page_stack():
    s = ""
    for i in range(8):
        w = 34 + (i % 3) * 12
        x = 70 + i * 62
        h = 210 + (i % 4) * 26
        s += f'<rect x="{x}" y="{430-h}" width="{w}" height="{h}" fill="none" stroke="#12314F" stroke-width="1.5"/>'
        s += f'<line x1="{x+8}" y1="{430-h+22}" x2="{x+w-8}" y2="{430-h+22}" stroke="#A8802C" stroke-width="2.5"/>'
        s += f'<line x1="{x+8}" y1="418" x2="{x+w-8}" y2="418" stroke="#12314F" stroke-width="1.5"/>'
    s += '<line x1="50" y1="432" x2="640" y2="432" stroke="#12314F" stroke-width="2.5"/>'
    s += ('<g transform="translate(760,150)" fill="none" stroke="#12314F" stroke-width="2">'
          '<path d="M0 190 C 60 150, 140 150, 200 190 L 200 40 C 140 0, 60 0, 0 40 Z"/>'
          '<line x1="200" y1="40" x2="200" y2="190"/>'
          '<path d="M200 190 C 260 150, 340 150, 400 190 L 400 40 C 340 0, 260 0, 200 40 Z"/>')
    for i in range(5):
        s += f'<line x1="30" y1="{64+i*22}" x2="172" y2="{54+i*22}" stroke-width="1.3"/>'
        s += f'<line x1="228" y1="{54+i*22}" x2="370" y2="{64+i*22}" stroke-width="1.3"/>'
    s += "</g>"
    return f'<svg viewBox="0 0 1200 640" preserveAspectRatio="xMidYMid slice">{s}</svg>'


def campus_arcade():
    s = ""
    for i in range(7):
        x = 120 + i * 130
        s += (f'<path d="M{x} 430 L{x} 280 A 48 48 0 0 1 {x+96} 280 L{x+96} 430" '
              f'fill="none" stroke="#12314F" stroke-width="1.8"/>')
    s += '<path d="M60 250 L620 250 L620 236 L340 130 L60 236 Z" fill="none" stroke="#12314F" stroke-width="2"/>'
    s += '<line x1="40" y1="432" x2="1160" y2="432" stroke="#12314F" stroke-width="2.5"/>'
    s += ('<g transform="translate(900,0)" fill="none" stroke="#12314F">'
          '<path d="M20 300 A 110 110 0 0 1 240 300" stroke-width="2"/>'
          '<line x1="20" y1="300" x2="240" y2="300" stroke-width="2"/>'
          '<line x1="130" y1="190" x2="130" y2="150" stroke="#A8802C" stroke-width="2.5"/>'
          '<rect x="30" y="300" width="200" height="130" stroke-width="1.8"/></g>')
    s += '<g stroke="#12314F" stroke-width="1.2">'
    for i in range(6):
        s += f'<line x1="{420-i*70}" y1="640" x2="{540-i*18}" y2="440"/>'
    for i in range(4):
        s += f'<line x1="{470-i*60}" y1="{470+i*46}" x2="{640+i*60}" y2="{470+i*46}"/>'
    s += "</g>"
    return f'<svg viewBox="0 0 1200 640" preserveAspectRatio="xMidYMid slice">{s}</svg>'


def signal_arcs():
    s = '<g fill="none" stroke="#12314F" stroke-width="1.5">'
    for i, r in enumerate((70, 150, 230, 310, 390, 470)):
        dash = ' stroke-dasharray="6 8"' if i % 2 else ""
        s += f'<circle cx="180" cy="330" r="{r}"{dash}/>'
    for i, r in enumerate((60, 130, 200, 270)):
        dash = ' stroke-dasharray="6 8"' if i % 2 else ""
        s += f'<circle cx="1020" cy="220" r="{r}"{dash}/>'
    s += "</g>"
    s += '<circle cx="180" cy="330" r="9" fill="#A8802C"/><circle cx="1020" cy="220" r="7" fill="#12314F"/>'
    s += '<path d="M180 330 C 460 180, 740 400, 1020 220" fill="none" stroke="#A8802C" stroke-width="2" stroke-dasharray="10 8"/>'
    return f'<svg viewBox="0 0 1200 640" preserveAspectRatio="xMidYMid slice">{s}</svg>'


MOTIFS = {
    "network": citation_network,
    "document": document_outline,
    "journal": journal_columns,
    "book": page_stack,
    "campus": campus_arcade,
    "signal": signal_arcs,
}


def motif(name, opacity=0.06):
    return f'<div class="motif" style="opacity:{opacity}" aria-hidden="true">{MOTIFS[name]()}</div>'


def motif_light(opacity=0.09):
    return f'<div class="motif" style="opacity:{opacity}" aria-hidden="true">{citation_network(light=True)}</div>'


def hero_span():
    piers = [(92, "Research"), (292, "Knowledge"), (492, "Publication"), (692, "Success")]
    deck = 288
    s = '<g stroke="#12314F" stroke-opacity="0.14" stroke-width="1">'
    for i, y in enumerate((336, 356, 376, 396)):
        dash = "3 12" if i % 2 else "30 16"
        s += f'<line x1="{40+i*26}" y1="{y}" x2="{744-i*26}" y2="{y}" stroke-dasharray="{dash}"/>'
    s += "</g>"
    s += (f'<path d="M52 {deck} C 210 96, 574 96, 732 {deck}" fill="none" stroke="url(#deckgrad)" '
          f'stroke-width="2.5" stroke-linecap="round" class="span-path" style="--dash:820"/>')
    s += (f'<line x1="52" y1="{deck}" x2="732" y2="{deck}" stroke="#12314F" stroke-width="3" '
          f'stroke-linecap="round" class="span-path" style="--dash:700;animation-delay:160ms"/>')
    s += '<g stroke="#12314F" stroke-opacity="0.3" stroke-width="1.2">'
    for i, x in enumerate((132, 192, 252, 332, 392, 452, 532, 592, 652)):
        t = (x - 52) / 680
        y = 288 - 4 * 192 * t * (1 - t) * 0.98
        s += (f'<line x1="{x}" y1="{deck}" x2="{x}" y2="{y+6:.1f}" class="span-node" '
              f'style="animation-delay:{700+i*40}ms"/>')
    s += "</g>"

    glyphs = [
        ('<rect x="6" y="0" width="56" height="74"/><line x1="16" y1="16" x2="42" y2="16" stroke="#A8802C" stroke-width="3"/>'
         '<line x1="16" y1="30" x2="52" y2="30" stroke-width="1.4"/><line x1="16" y1="42" x2="52" y2="42" stroke-width="1.4"/>'
         '<line x1="16" y1="54" x2="38" y2="54" stroke-width="1.4"/>'),
        ('<circle cx="34" cy="24" r="5" fill="#12314F" stroke="none"/><circle cx="10" cy="52" r="4" fill="#12314F" stroke="none"/>'
         '<circle cx="58" cy="52" r="4" fill="#12314F" stroke="none"/><circle cx="34" cy="72" r="4" fill="#A8802C" stroke="none"/>'
         '<path d="M34 24 L10 52 M34 24 L58 52 M10 52 L34 72 M58 52 L34 72 M10 52 L58 52" stroke-width="1.3"/>'),
        ('<line x1="8" y1="4" x2="8" y2="74"/><line x1="8" y1="74" x2="64" y2="74"/>'
         '<rect x="16" y="46" width="10" height="28" fill="#12314F" stroke="none"/>'
         '<rect x="32" y="30" width="10" height="44" fill="#12314F" stroke="none"/>'
         '<rect x="48" y="14" width="10" height="60" fill="#A8802C" stroke="none"/>'),
        ('<path d="M6 74 L6 40 A 28 28 0 0 1 62 40 L62 74"/><line x1="6" y1="74" x2="62" y2="74"/>'
         '<line x1="34" y1="18" x2="34" y2="74" stroke-width="1.3"/><circle cx="34" cy="12" r="4" fill="#A8802C" stroke="none"/>'),
    ]

    for i, (x, label) in enumerate(piers):
        s += f'<g class="span-node" style="animation-delay:{900+i*170}ms">'
        s += f'<line x1="{x}" y1="{deck}" x2="{x}" y2="334" stroke="#12314F" stroke-width="2.5"/>'
        s += f'<circle cx="{x}" cy="{deck}" r="5" fill="#A8802C"/>'
        s += f'<g transform="translate({x-34},178)" stroke="#12314F" stroke-width="1.8" fill="none">{glyphs[i]}</g>'
        s += (f'<text class="span-label" x="{x}" y="368" text-anchor="middle" font-size="14" '
              f'font-weight="500" fill="#475669" font-family="var(--sans)">{label}</text></g>')

    return (
        '<svg class="hero-span" viewBox="0 0 784 420" role="img" aria-label="A bridge whose four piers '
        'represent research, knowledge, publication and academic success, connected by a single span.">'
        '<defs><linearGradient id="deckgrad" x1="0" y1="0" x2="1" y2="0">'
        '<stop offset="0%" stop-color="#12314F" stop-opacity="0.35"/>'
        '<stop offset="45%" stop-color="#2B4A8B"/><stop offset="100%" stop-color="#A8802C"/>'
        f'</linearGradient></defs>{s}</svg>'
        # Text inside the viewBox scales with the drawing and lands near 6px on
        # a phone, so narrow screens get real HTML labels underneath instead.
        '<ol class="span-labels" aria-hidden="true">'
        + "".join(
            f'<li>{label}{"<span>&rarr;</span>" if i < len(piers) - 1 else ""}</li>'
            for i, (_x, label) in enumerate(piers)
        )
        + "</ol>"
    )


def book_mockup():
    covers = [
        (["Advances in", "Structural", "Reliability"], "RESEARCH MONOGRAPH", "#12314F", "#A8802C", "#FFFFFF"),
        (["Applied", "Research", "Methodology"], "TEXTBOOK", "#F4F6F9", "#2B4A8B", "#0B1B2B"),
        (["Interdisciplinary", "Perspectives", "in Policy"], "EDITED VOLUME", "#2B4A8B", "#A8802C", "#FFFFFF"),
    ]
    s = ('<defs><filter id="bookshadow" x="-25%" y="-15%" width="150%" height="140%">'
         '<feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#0B1B2B" flood-opacity="0.18"/>'
         "</filter></defs>")
    for i, (title, kind, fill, band, text) in enumerate(covers):
        x = 40 + i * 224
        y = 24 + (-10 if i == 1 else 0)
        w, h = 168, 244
        s += f'<g filter="url(#bookshadow)">'
        s += f'<rect x="{x-12}" y="{y+6}" width="12" height="{h}" fill="{fill}" opacity="0.72"/>'
        s += f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}"/>'
        s += f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="none" stroke="#0B1B2B" stroke-opacity="0.14"/>'
        s += f'<rect x="{x+22}" y="{y+30}" width="52" height="3" fill="{band}"/>'
        for li, line in enumerate(title):
            s += (f'<text x="{x+22}" y="{y+74+li*26}" fill="{text}" font-family="var(--serif)" '
                  f'font-size="20" font-weight="600">{e(line)}</text>')
        s += f'<line x1="{x+22}" y1="{y+168}" x2="{x+w-22}" y2="{y+168}" stroke="{text}" stroke-opacity="0.28"/>'
        s += (f'<text x="{x+22}" y="{y+190}" fill="{text}" fill-opacity="0.72" font-family="var(--sans)" '
              f'font-size="10.5" letter-spacing="1.6">{kind}</text>')
        s += (f'<g transform="translate({x+22},{y+h-46})" opacity="0.85">'
              f'<path d="M0 14 C 5 4, 21 4, 26 14" fill="none" stroke="{text}" stroke-width="1.6" stroke-linecap="round"/>'
              f'<line x1="0" y1="14" x2="26" y2="14" stroke="{text}" stroke-width="1.6" stroke-linecap="round"/>'
              f'<circle cx="13" cy="6.2" r="2.4" fill="{band}"/></g></g>')
    s += '<line x1="10" y1="292" x2="710" y2="292" stroke="#0B1B2B" stroke-opacity="0.16" stroke-width="2"/>'
    return f'<svg class="book-mockup" viewBox="0 0 720 320" role="img" aria-label="Three academic book covers in the SetuVidya house style.">{s}</svg>'


def logo(invert=False):
    """The supplied artwork, used as-is. Height fixed, width follows the source,
    so the logo is never stretched. On the navy header a white plate keeps the
    navy half of the mark legible."""
    src = DATA["brand"].get("logo", "")
    alt = DATA["brand"].get("logoAlt", "SetuVidya Consultancy")
    asset = ROOT / "public" / src.lstrip("/")
    if not src or not asset.exists():
        return f'<a class="logo" href="#/">{e(DATA["brand"]["name"])}</a>'
    # The file's own bytes, unresampled and never re-encoded: resizing through
    # PIL and saving as JPEG is what made the header logo soft.
    raw = asset.read_bytes()
    mime = "image/svg+xml" if asset.suffix.lower() == ".svg" else "image/png"
    uri = f"data:{mime};base64," + base64.b64encode(raw).decode()
    return (f'<a class="logo{" invert" if invert else ""}" href="#/" '
            f'aria-label="SetuVidya Consultancy, home">'
            f'<img class="logo-img" src="{uri}" alt="{e(alt)}" width="2022" height="778">'
            f'</a>')


# ------------------------------------------------------- published books ---

_IMG_CACHE = {}


def data_uri(rel_path, width=700, quality=80):
    """Embed a book page as a data URI so the preview stays a single file.

    Downscaled from the full-resolution originals in public/books/, which are
    what the Next.js build serves.
    """
    if not rel_path:
        return ""
    key = (rel_path, width, quality)
    if key in _IMG_CACHE:
        return _IMG_CACHE[key]
    src = ROOT / "public" / rel_path.lstrip("/")
    if not src.exists():
        return ""
    try:
        from PIL import Image
        raw = Image.open(src)
        # JPEG has no alpha, so a transparent logo would come out on black.
        # Anything with transparency stays PNG.
        has_alpha = raw.mode in ("RGBA", "LA") or "transparency" in raw.info
        h = round(raw.height * width / raw.width)
        buf = io.BytesIO()
        if has_alpha:
            im = raw.convert("RGBA").resize((width, h), Image.LANCZOS)
            im.save(buf, "PNG", optimize=True)
            uri = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()
        else:
            im = raw.convert("RGB").resize((width, h), Image.LANCZOS)
            im.save(buf, "JPEG", quality=quality, optimize=True)
            uri = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()
    except Exception:
        uri = "data:image/jpeg;base64," + base64.b64encode(src.read_bytes()).decode()
    _IMG_CACHE[key] = uri
    return uri


def book_portfolio():
    """Ten slots; only entries with both a title and a front image render."""
    pf = DATA["pages"]["bookPublication"]["portfolio"]
    books = [b for b in pf["books"] if b["title"] and b["frontImage"]]
    if not books:
        return ""

    cards = ""
    for i, b in enumerate(books):
        meta = ""
        if b["coAuthor"]:
            meta += f'<div><span class="bk-k">Co-author</span> {e(b["coAuthor"])}</div>'
        bits = [x for x in (b["year"], b["publisher"]) if x]
        if bits:
            meta += f'<div class="bk-muted">{e(" · ".join(bits))}</div>'
        if b["isbn"]:
            meta += f'<div class="bk-muted"><span class="bk-k">ISBN</span> {e(b["isbn"])}</div>'
        sub = f'<p class="bk-sub">{e(b["subtitle"])}</p>' if b["subtitle"] else ""
        price_line = price_block(b)
        cards += f'''
<li><article class="bk-card">
  <button type="button" class="bk-open" data-book="{i}"
    aria-label="View {e(b["title"])}, front cover and author page">
    <img src="{data_uri(b["frontImage"])}" alt="{e(b["frontAlt"])}" loading="lazy" decoding="async">
    <span class="bk-hint" aria-hidden="true">{e(pf["viewLabel"])}</span>
  </button>
  <div class="bk-meta">
    <h3>{e(b["title"])}</h3>{sub}
    <div class="bk-author">{e(b["author"])}</div>
    {meta}
    <div class="bk-buy-row">
      {price_line}
      <button type="button" class="bk-buy" data-buy="{e(b["id"])}">{e(COMMERCE["labels"]["buy"])}</button>
    </div>
  </div>
</article></li>'''

    payload = json.dumps([
        {
            "title": b["title"], "author": b["author"], "coAuthor": b["coAuthor"],
            "year": b["year"], "publisher": b["publisher"], "isbn": b["isbn"],
            "mrp": b["mrp"] if pf.get("displayMrp") else "",
            "front": data_uri(b["frontImage"]), "back": data_uri(b["backImage"]),
            "frontAlt": b["frontAlt"], "backAlt": b["backAlt"],
        }
        for b in books
    ])

    return f'''
<section class="section surface bordered" id="published-books">
  <div class="shell">
    {heading(pf["kicker"], pf["title"], pf["intro"])}
    <ul class="bk-grid">{cards}</ul>
  </div>
  <script type="application/json" id="bk-data">{payload}</script>
</section>

<div class="bk-lightbox" id="bk-lightbox" hidden>
  <div class="bk-scrim" data-bk-close></div>
  <div class="bk-dialog" role="dialog" aria-modal="true" aria-labelledby="bk-title">
    <div class="bk-head">
      <div class="bk-headtext">
        <h3 id="bk-title"></h3>
        <p id="bk-byline"></p>
      </div>
      <button type="button" class="bk-close" data-bk-close aria-label="Close">&times;</button>
    </div>
    <div class="bk-tabs" role="tablist" aria-label="Book view">
      <button type="button" role="tab" class="bk-tab" data-side="front" aria-selected="true">Front cover</button>
      <button type="button" role="tab" class="bk-tab" data-side="back" aria-selected="false">About the author</button>
    </div>
    <div class="bk-body">
      <img id="bk-img" alt="">
      <dl class="bk-details" id="bk-details"></dl>
    </div>
    <div class="bk-nav">
      <button type="button" id="bk-prev">&larr; Previous</button>
      <p id="bk-count" aria-live="polite"></p>
      <button type="button" id="bk-next">Next &rarr;</button>
    </div>
  </div>
</div>'''


# ---------------------------------------------------- mega-menu icons ------

_NAV_ICONS = {
    # Simplified line icons matching the lucide set used in the React build:
    # file-search, scroll-text, book-open-text, landmark.
    "research": (
        '<path d="M4 2h8l4 4v6"/><path d="M12 2v4h4"/>'
        '<path d="M4 2v18a1 1 0 0 0 1 1h5"/>'
        '<circle cx="15" cy="16" r="4"/><path d="M18.5 19.5 21.5 22.5"/>'
    ),
    "publication": (
        '<path d="M17 3H6a2 2 0 0 0-2 2v13"/>'
        '<path d="M4 18a3 3 0 0 0 3 3h11a2 2 0 0 0 2-2V8"/>'
        '<path d="M20 8h-3a2 2 0 0 1-2-2V3"/>'
        '<path d="M8 8h5"/><path d="M8 12h6"/><path d="M8 16h4"/>'
    ),
    "book": (
        '<path d="M12 7v14"/>'
        '<path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>'
    ),
    "admission": (
        '<path d="M4 22h16"/><path d="M6 18v-8"/><path d="M10 18v-8"/>'
        '<path d="M14 18v-8"/><path d="M18 18v-8"/>'
        '<path d="M12 2 2 8h20z"/>'
    ),
}


def nav_icon(key):
    """Inline SVG for a mega-menu card. Decorative: the label carries meaning."""
    paths = _NAV_ICONS.get(key)
    if not paths:
        return ""
    return (
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" '
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'
        f"{paths}</svg>"
    )


# ------------------------------------------------------ research domains ---

_DOMAIN_ICONS = {
    "management": '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/>',
    "humanities": ('<path d="M16 6H3"/><path d="M16 12H3"/><path d="M11 18H3"/>'
                   '<path d="M18 9v12"/><path d="m15 12 3-3 3 3"/>'),
    "science": ('<circle cx="12" cy="12" r="1.6"/>'
                '<path d="M20.2 20.2c1.6-1.6.4-6-2.7-9.1S10.4 6.2 8.8 7.8s-.4 6 2.7 9.1 7.1 4.9 8.7 3.3Z"/>'
                '<path d="M3.8 20.2c-1.6-1.6-.4-6 2.7-9.1S13.6 6.2 15.2 7.8s.4 6-2.7 9.1-7.1 4.9-8.7 3.3Z"/>'),
    "technical": ('<rect x="4" y="4" width="16" height="16" rx="2"/>'
                  '<rect x="9" y="9" width="6" height="6"/>'
                  '<path d="M9 2v2"/><path d="M15 2v2"/><path d="M9 20v2"/><path d="M15 20v2"/>'
                  '<path d="M2 9h2"/><path d="M2 15h2"/><path d="M20 9h2"/><path d="M20 15h2"/>'),
}


def domain_icon(key):
    paths = _DOMAIN_ICONS.get(key, "")
    if not paths:
        return ""
    return ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" '
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'
            f'{paths}</svg>')


def research_domains():
    """Four disclosure cards. Hidden content lives in a real panel wired with
    aria-expanded / aria-controls, so nothing is hover-only."""
    dm = DATA["pages"]["researchThesis"].get("domains")
    if not dm:
        return ""
    VISIBLE = 6
    cards = ""
    for i, c in enumerate(dm["categories"]):
        shown = c["subjects"][:VISIBLE]
        hidden = c["subjects"][VISIBLE:]
        pid = f"rd-panel-{c['id']}"
        chips = "".join(f'<li class="rd-chip">{e(s)}</li>' for s in shown)
        more = f'<li class="rd-more">+{len(hidden)} more</li>' if hidden else ""
        hidden_chips = ("".join(f'<li class="rd-chip">{e(s)}</li>' for s in hidden))
        hidden_block = f'<ul class="rd-chips rd-extra">{hidden_chips}</ul>' if hidden else ""
        tools = ""
        if c.get("tools"):
            tool_chips = "".join(f'<li class="rd-chip rd-tool">{e(t)}</li>' for t in c["tools"])
            tools = (f'<h4 class="rd-label">{e(c["toolsLabel"])}</h4>'
                     f'<ul class="rd-chips">{tool_chips}</ul>')
        scope = f'<p class="rd-scope">{e(c["scopeNote"])}</p>' if c.get("scopeNote") else ""
        cards += f'''
<li class="reveal"><article class="rd-card">
  <span class="rd-icon" aria-hidden="true">{domain_icon(c["icon"])}</span>
  <h3>{e(c["title"])}</h3>
  <p class="rd-intro">{e(c["intro"])}</p>
  <h4 class="rd-label">{e(dm["subjectsLabel"])}</h4>
  <ul class="rd-chips">{chips}{more}</ul>
  <div class="rd-panel" id="{pid}" hidden>{hidden_block}{tools}{scope}</div>
  <button type="button" class="rd-toggle" aria-expanded="false" aria-controls="{pid}"
    data-expand="{e(dm["expandLabel"])}" data-collapse="{e(dm["collapseLabel"])}">
    <span class="rd-toggle-text">{e(dm["expandLabel"])}</span>
    <svg class="rd-chev" width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
  </button>
</article></li>'''

    cta = dm["cta"]
    return f'''
<section class="section surface bordered" id="research-domains">{motif("document", .03)}
  <div class="shell">
    {heading(dm["kicker"], dm["title"], dm["subtitle"])}
    <ul class="rd-grid">{cards}</ul>
    <div class="rd-note reveal"><p>{e(dm["note"])}</p></div>
    <div class="rd-cta reveal">
      <div><h3>{e(cta["title"])}</h3><p>{e(cta["body"])}</p></div>
      <a class="btn btn-primary btn-lg" href="#{cta["href"]}">{e(cta["label"])} <span aria-hidden="true">&rarr;</span></a>
    </div>
  </div>
</section>'''


# --------------------------------------------------- understanding a thesis -

def thesis_anatomy():
    """Seven numbered chapters, single-open accordion (same pattern as the FAQ).
    Collapsed rows show only the numeral and the chapter name."""
    an = DATA["pages"]["researchThesis"].get("anatomy")
    if not an:
        return ""

    items = ""
    for i, c in enumerate(an["chapters"]):
        pid = f"ta-panel-{c['id']}"
        bid = f"ta-btn-{c['id']}"
        is_open = i == 0
        body = "".join(f'<p class="ta-p">{e(p)}</p>' for p in c["body"])

        examples = ""
        if c.get("examples"):
            rows = "".join(
                f'<li class="ta-ex"><p class="ta-ex-label">{e(x["label"])}</p>'
                f'<p class="ta-ex-text">{e(x["text"])}</p></li>'
                for x in c["examples"])
            examples = f'<ul class="ta-examples">{rows}</ul>'

        points = ""
        if c.get("points"):
            lis = "".join(f'<li><span class="ta-dot" aria-hidden="true"></span>{e(p)}</li>'
                          for p in c["points"])
            points = (f'<h4 class="ta-label">{e(c.get("pointsLabel",""))}</h4>'
                      f'<ul class="ta-points">{lis}</ul>')

        tools = ""
        if c.get("tools"):
            chips = "".join(f'<li class="rd-chip rd-tool">{e(t)}</li>' for t in c["tools"])
            tools = (f'<h4 class="ta-label">{e(c.get("toolsLabel",""))}</h4>'
                     f'<ul class="rd-chips">{chips}</ul>')

        note = f'<p class="ta-note">{e(c["note"])}</p>' if c.get("note") else ""
        label = f'<span class="ta-tag">{e(c["label"])}</span>' if c.get("label") else ""

        items += f'''
<li class="ta-item" id="{c["id"]}"{' data-open' if is_open else ''}>
  <h3>
    <button type="button" class="ta-btn" id="{bid}" aria-controls="{pid}"
      aria-expanded="{'true' if is_open else 'false'}">
      <span class="ta-num" aria-hidden="true">{i + 1:02d}</span>
      <span class="ta-head"><span class="ta-title">{e(c["title"])}</span>{label}</span>
      <span class="ta-icon" aria-hidden="true"></span>
    </button>
  </h3>
  <div class="ta-panel" id="{pid}" role="region" aria-labelledby="{bid}"{'' if is_open else ' hidden'}>
    <div class="ta-inner">{body}{examples}{points}{tools}{note}</div>
  </div>
</li>'''

    cta = an["cta"]
    return f'''
<section class="section bordered" id="understanding-your-thesis">{motif("document", .03)}
  <div class="shell">
    {heading(an["kicker"], an["title"], an["subtitle"])}
    <ol class="ta-list">{items}</ol>
    <div class="ta-cta reveal">
      <div><h3>{e(cta["title"])}</h3><p>{e(cta["body"])}</p></div>
      <a class="btn btn-primary btn-lg" href="#{cta["href"]}">{e(cta["label"])} <span aria-hidden="true">&rarr;</span></a>
    </div>
  </div>
</section>'''


# ------------------------------------------------ universities & institutions

def institution_marquee(section_id="institutions", subtitle=None, bordered=False):
    """Continuous logo marquee. The list renders twice and the track slides by
    exactly -50%, so the loop closes seamlessly. The duplicate strip is
    aria-hidden and its links are taken out of the tab order.

    Reused on more than one page: `section_id` keeps anchors unique, since the
    preview holds every page in a single document."""
    ins = DATA.get("institutions")
    if not ins:
        return ""
    items = [i for i in ins["items"] if i.get("name") and i.get("logo") and i.get("url")]
    if not items:
        return ""

    def tile(it, dup):
        attrs = ' tabindex="-1" aria-hidden="true"' if dup else (
            f' aria-label="{e(it["name"])}, opens the official website in a new tab"')
        alt = "" if dup else e(it.get("alt") or f'{it["name"]} logo')
        return (f'<li><a class="im-tile" href="{e(it["url"])}" target="_blank" '
                f'rel="noopener noreferrer"{attrs}>'
                f'<span class="im-logo">'
                f'<img src="{logo_uri(it["logo"])}" alt="{alt}" loading="lazy" decoding="async">'
                f'</span>'
                f'<span class="im-name">{e(it["name"])}</span></a></li>')

    def strip(dup):
        a = ' aria-hidden="true" role="presentation"' if dup else ""
        return f'<ul class="im-strip"{a}>' + "".join(tile(i, dup) for i in items) + "</ul>"

    cls = "section tight bordered" if bordered else "section tight"
    return f'''
<section class="{cls}" id="{section_id}">
  <div class="shell">
    {heading(ins["kicker"], ins["title"], subtitle or ins["subtitle"], center=True)}
  </div>
  <div class="im-marquee" role="region" aria-label="{e(ins["title"])}">
    <span class="im-fade im-fade-l" aria-hidden="true"></span>
    <span class="im-fade im-fade-r" aria-hidden="true"></span>
    <div class="im-track" style="--im-duration:{ins["speedSeconds"]}s">{strip(False)}{strip(True)}</div>
  </div>
  <div class="shell">
  </div>
</section>'''


def logo_uri(rel_path):
    """Embed an institution logo so the preview stays a single file.
    Downscaled from the full-resolution asset the Next.js build serves."""
    key = ("logo", rel_path)
    if key in _IMG_CACHE:
        return _IMG_CACHE[key]
    src = ROOT / "public" / rel_path.lstrip("/")
    if not src.exists():
        return ""
    from PIL import Image
    im = Image.open(src)
    fmt = "PNG" if im.mode in ("RGBA", "P") and im.format == "PNG" else "JPEG"
    h = 130
    w = max(1, round(im.width * h / im.height))
    im = im.resize((w, h), Image.LANCZOS)
    buf = io.BytesIO()
    if fmt == "PNG":
        im.save(buf, "PNG", optimize=True)
        mime = "image/png"
    else:
        im.convert("RGB").save(buf, "JPEG", quality=88, optimize=True)
        mime = "image/jpeg"
    uri = f"data:{mime};base64," + base64.b64encode(buf.getvalue()).decode()
    _IMG_CACHE[key] = uri
    return uri


# --------------------------------------------------------------- commerce ---

COMMERCE = DATA["commerce"]


def money(amount):
    """Formats a configured amount, or returns None. Never invents a figure."""
    if not isinstance(amount, (int, float)) or isinstance(amount, bool):
        return None
    return f'{COMMERCE["currencySymbol"]}{amount:,.0f}'


def unit_price(b):
    """Mirrors unitPrice() in lib/commerce.ts: derived from mrp + discount, so
    the preview and the app can never disagree on an amount."""
    if isinstance(b.get("price"), (int, float)) and not isinstance(b.get("price"), bool):
        return b["price"]
    mrp = b.get("mrp")
    if not isinstance(mrp, (int, float)) or isinstance(mrp, bool):
        return None
    disc = b.get("discountPercent")
    if not isinstance(disc, (int, float)) or isinstance(disc, bool):
        return mrp
    return round(mrp * (1 - disc / 100))


def price_block(b, big=False):
    """MRP struck through, discount badge, selling price."""
    price = unit_price(b)
    text = money(price)
    if not text:
        return f'<p class="bk-price-tbc">{e(COMMERCE["priceUnavailableLabel"])}</p>'
    mrp = b.get("mrp")
    extra = ""
    if isinstance(mrp, (int, float)) and price is not None and mrp > price:
        extra = f'<span class="pb-mrp">{money(mrp)}</span>'
        disc = b.get("discountPercent")
        if isinstance(disc, (int, float)):
            suffix = DATA["pages"]["bookPublication"]["portfolio"].get("discountLabelSuffix", "OFF")
            extra += f'<span class="pb-badge">{disc:g}% {e(suffix)}</span>'
    cls = "pb pb-lg" if big else "pb"
    return f'<div class="{cls}"><span class="pb-now">{text}</span>{extra}</div>'


def book_commerce():
    """Buy dialog, cart, checkout and confirmation. Mirrors the React flow so
    the same behaviour can be exercised in the preview."""
    pf = DATA["pages"]["bookPublication"]["portfolio"]
    products = [
        {
            "id": b["id"], "title": b["title"], "subtitle": b.get("subtitle", ""),
            "author": b["author"], "coAuthor": b.get("coAuthor", ""),
            "publisher": b.get("publisher", ""), "year": b.get("year", ""),
            "isbn": b.get("isbn", ""), "price": unit_price(b), "mrp": b.get("mrp"),
            "discountPercent": b.get("discountPercent"),
            "priceHtml": price_block(b, big=True),
            "available": bool(b.get("available")),
            "front": data_uri(b["frontImage"], width=360, quality=78),
            "frontAlt": b.get("frontAlt", ""),
        }
        for b in pf["books"] if b["title"] and b["frontImage"]
    ]

    cfg = {
        "products": products,
        "currencySymbol": COMMERCE["currencySymbol"],
        "priceUnavailable": COMMERCE["priceUnavailableLabel"],
        "totalUnavailable": COMMERCE["totalUnavailableLabel"],
        "shipping": COMMERCE["shipping"],
        "payment": COMMERCE["payment"],
        "labels": COMMERCE["labels"],
        "confirmation": COMMERCE["confirmation"],
        "states": COMMERCE["states"]["india"],
        "whatsapp": "".join(ch for ch in DATA["contact"]["whatsapp"] if ch.isdigit()),
    }

    return f'''
<script type="application/json" id="cm-data">{json.dumps(cfg)}</script>
<p class="sr-only" id="cm-live" role="status" aria-live="polite"></p>
<button type="button" id="cm-cart-btn" class="cm-cart-btn" hidden>
  {e(COMMERCE["labels"]["cart"])} <span class="cm-count" id="cm-count">0</span>
</button>
<div class="cm-overlay" id="cm-overlay" hidden>
  <div class="cm-scrim" data-cm-close></div>
  <div class="cm-panel" id="cm-panel" role="dialog" aria-modal="true" aria-label="Cart">
    <div class="cm-head">
      <h2 id="cm-title">Cart</h2>
      <button type="button" class="cm-close" data-cm-close aria-label="Close">&times;</button>
    </div>
    <div class="cm-body" id="cm-body"></div>
    <div class="cm-foot" id="cm-foot"></div>
  </div>
</div>'''
