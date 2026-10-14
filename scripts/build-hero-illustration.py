#!/usr/bin/env python3
"""
Build public/hero-illustration.svg — the home hero scene.

Flat vector, drawn entirely from the SetuVidya palette. No photographs, no
generated imagery, and deliberately no facial features: the figures read as
scholars without depicting any identifiable person.

Run: python3 scripts/build-hero-illustration.py
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "hero-illustration.svg"

INK = "#0B1B2B"
NAVY = "#12314F"
INDIGO = "#2B4A8B"
INDIGO_LIFT = "#385DA8"
BRASS = "#A8802C"
BRASS_SOFT = "#C6A04E"
SURFACE = "#F4F6F9"
PAPER = "#FFFFFF"
RULE = "#DDE3EA"
MUTED = "#5F6E80"

# Warm mid-tones. Varied across the group rather than a single default.
SKIN = ["#B8825C", "#A26A45", "#C08E66", "#96603E"]
HAIR = ["#2A1D16", "#1F1712", "#33241A", "#241A13"]

W, H = 1200, 840
FLOOR = 726


def shelf(x, y, w, seed):
    """A run of book spines on a shelf."""
    out = [f'<rect x="{x}" y="{y + 96}" width="{w}" height="7" rx="2" fill="{NAVY}" opacity="0.35"/>']
    colours = [NAVY, INDIGO, BRASS, INDIGO_LIFT, MUTED]
    cx = x + 6
    i = seed
    while cx < x + w - 14:
        bw = 12 + (i * 7) % 14
        bh = 62 + (i * 11) % 30
        col = colours[i % len(colours)]
        out.append(
            f'<rect x="{cx}" y="{y + 96 - bh}" width="{bw}" height="{bh}" rx="2" '
            f'fill="{col}" opacity="0.55"/>'
        )
        if bh > 74:
            out.append(
                f'<rect x="{cx + 3}" y="{y + 96 - bh + 10}" width="{bw - 6}" height="3" '
                f'fill="{PAPER}" opacity="0.5"/>'
            )
        cx += bw + 3
        i += 1
    return "".join(out)


def document(kind):
    """The item a figure is holding, drawn in local coordinates."""
    if kind == "thesis":
        body = (
            f'<rect x="-52" y="-118" width="104" height="136" rx="4" fill="{PAPER}" '
            f'stroke="{RULE}" stroke-width="2"/>'
            f'<rect x="-52" y="-118" width="10" height="136" rx="4" fill="{NAVY}" opacity="0.85"/>'
            f'<rect x="-30" y="-96" width="58" height="5" rx="2" fill="{BRASS}"/>'
        )
        lines = "".join(
            f'<rect x="-30" y="{-78 + i * 13}" width="{56 - (i % 3) * 14}" height="3.5" '
            f'rx="1.75" fill="{MUTED}" opacity="0.45"/>'
            for i in range(6)
        )
        return body + lines

    if kind == "bound":
        # Warm cover: an indigo book on an indigo shirt disappears.
        return (
            f'<rect x="-46" y="-112" width="92" height="126" rx="5" fill="{BRASS}"/>'
            f'<rect x="-46" y="-112" width="11" height="126" rx="5" fill="#8A6A21"/>'
            f'<rect x="-24" y="-88" width="50" height="4" rx="2" fill="{PAPER}" opacity="0.85"/>'
            f'<rect x="-24" y="-74" width="34" height="4" rx="2" fill="{PAPER}" opacity="0.6"/>'
            f'<rect x="-24" y="-20" width="50" height="3" rx="1.5" fill="{PAPER}" opacity="0.4"/>'
        )

    if kind == "paper":
        chart = (
            f'<rect x="-28" y="-64" width="12" height="26" rx="2" fill="{INDIGO}" opacity="0.75"/>'
            f'<rect x="-11" y="-76" width="12" height="38" rx="2" fill="{NAVY}" opacity="0.8"/>'
            f'<rect x="6" y="-88" width="12" height="50" rx="2" fill="{BRASS}"/>'
        )
        lines = "".join(
            f'<rect x="-32" y="{-26 + i * 12}" width="{62 - (i % 2) * 20}" height="3.5" '
            f'rx="1.75" fill="{MUTED}" opacity="0.45"/>'
            for i in range(3)
        )
        return (
            f'<rect x="-46" y="-112" width="92" height="128" rx="4" fill="{PAPER}" '
            f'stroke="{RULE}" stroke-width="2"/>'
            f'<rect x="-32" y="-98" width="44" height="5" rx="2.5" fill="{BRASS}"/>'
            + chart + lines
        )

    # stack of books held against the hip
    out = []
    for i, col in enumerate([NAVY, INDIGO, BRASS, INDIGO_LIFT]):
        y = -34 - i * 21
        out.append(
            f'<rect x="{-50 + (i % 2) * 4}" y="{y}" width="100" height="18" rx="3" fill="{col}"/>'
            f'<rect x="{-44 + (i % 2) * 4}" y="{y + 6}" width="56" height="3" rx="1.5" '
            f'fill="{PAPER}" opacity="0.5"/>'
        )
    return "".join(out)


def figure(x, scale, skin, hair, shirt, kind, hair_style, sleeve):
    """One scholar. Faces carry no features by design."""
    s = []
    s.append(f'<g transform="translate({x},{FLOOR}) scale({scale})">')

    # contact shadow
    s.append(f'<ellipse cx="0" cy="6" rx="82" ry="10" fill="{INK}" opacity="0.08"/>')

    # legs
    s.append(f'<rect x="-40" y="-124" width="34" height="124" rx="15" fill="{NAVY}"/>')
    s.append(f'<rect x="6" y="-124" width="34" height="124" rx="15" fill="{NAVY}"/>')
    s.append(f'<rect x="-44" y="-13" width="42" height="15" rx="7.5" fill="{INK}"/>')
    s.append(f'<rect x="2" y="-13" width="42" height="15" rx="7.5" fill="{INK}"/>')

    # torso
    s.append(
        f'<path d="M-52 -286 q0 -24 24 -30 l56 0 q24 6 24 30 l0 166 l-104 0 z" fill="{shirt}"/>'
    )
    s.append(f'<path d="M-15 -316 l15 19 l15 -19 z" fill="{PAPER}" opacity="0.9"/>')

    # upper arms down the sides
    s.append(f'<rect x="-70" y="-282" width="22" height="100" rx="11" fill="{sleeve}"/>')
    s.append(f'<rect x="48" y="-282" width="22" height="100" rx="11" fill="{sleeve}"/>')

    # the item sits in front of the body
    s.append(f'<g transform="translate(0,-128)">{document(kind)}</g>')

    # forearms and hands drawn last, so they read as coming around the item
    s.append(f'<rect x="-72" y="-196" width="34" height="21" rx="10.5" fill="{sleeve}"/>')
    s.append(f'<rect x="38" y="-196" width="34" height="21" rx="10.5" fill="{sleeve}"/>')
    s.append(f'<circle cx="-44" cy="-171" r="12" fill="{skin}"/>')
    s.append(f'<circle cx="44" cy="-171" r="12" fill="{skin}"/>')
    s.append(f'<rect x="-56" y="-186" width="18" height="30" rx="9" fill="{sleeve}"/>')
    s.append(f'<rect x="38" y="-186" width="18" height="30" rx="9" fill="{sleeve}"/>')

    # short neck, head sitting close to the collar
    s.append(f'<rect x="-12" y="-334" width="24" height="22" rx="11" fill="{skin}"/>')
    s.append(f'<circle cx="0" cy="-358" r="36" fill="{skin}"/>')

    if hair_style == "short":
        s.append(f'<path d="M-36 -364 q4 -36 36 -36 q32 0 36 36 q-12 -17 -36 -17 q-24 0 -36 17 z" fill="{hair}"/>')
    elif hair_style == "long":
        s.append(f'<path d="M-38 -362 q0 -40 38 -40 q38 0 38 40 l0 50 q-9 8 -15 0 l0 -44 '
                 f'q-9 -13 -23 -13 q-13 0 -23 13 l0 44 q-6 8 -15 0 z" fill="{hair}"/>')
    elif hair_style == "bun":
        s.append(f'<circle cx="0" cy="-402" r="14" fill="{hair}"/>')
        s.append(f'<path d="M-36 -362 q4 -38 36 -38 q32 0 36 38 q-13 -15 -36 -15 q-23 0 -36 15 z" fill="{hair}"/>')
    else:  # wavy
        s.append(f'<path d="M-38 -360 q2 -42 38 -42 q36 0 38 42 q-8 -6 -13 -15 q-10 9 -25 9 '
                 f'q-15 0 -25 -9 q-5 9 -13 15 z" fill="{hair}"/>')

    s.append("</g>")
    return "".join(s)


def build():
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
        f'width="{W}" height="{H}" role="img" '
        f'aria-labelledby="hero-illus-title hero-illus-desc">',
        '<title id="hero-illus-title">Scholars in a university library</title>',
        '<desc id="hero-illus-desc">A flat illustration of four scholars standing together in a '
        'library, each holding academic work: a bound thesis, a research monograph, a research '
        'paper with a results chart, and a stack of books. Bookshelves and a tall window sit '
        'behind them. The figures are stylised and depict no identifiable person.</desc>',
        "<defs>",
        f'<linearGradient id="win" x1="0" y1="0" x2="0" y2="1">'
        f'<stop offset="0%" stop-color="{PAPER}"/>'
        f'<stop offset="100%" stop-color="{SURFACE}"/></linearGradient>',
        f'<linearGradient id="floorfade" x1="0" y1="0" x2="0" y2="1">'
        f'<stop offset="0%" stop-color="{SURFACE}"/>'
        f'<stop offset="100%" stop-color="{PAPER}"/></linearGradient>',
        '<clipPath id="frame"><rect x="0" y="0" width="1200" height="900" rx="10"/></clipPath>',
        "</defs>",
        '<g clip-path="url(#frame)">',
        f'<rect width="{W}" height="{H}" fill="{SURFACE}"/>',
        f'<rect y="{FLOOR - 20}" width="{W}" height="{H - FLOOR + 20}" fill="url(#floorfade)"/>',
    ]

    # window, right
    parts.append(f'<rect x="742" y="72" width="392" height="536" rx="8" fill="url(#win)" '
                 f'stroke="{RULE}" stroke-width="3"/>')
    for gx in (872, 1002):
        parts.append(f'<rect x="{gx}" y="72" width="3" height="536" fill="{RULE}"/>')
    parts.append(f'<rect x="742" y="340" width="392" height="3" fill="{RULE}"/>')
    # a hint of foliage beyond the glass
    parts.append(f'<circle cx="820" cy="300" r="58" fill="{INDIGO}" opacity="0.07"/>')
    parts.append(f'<circle cx="960" cy="250" r="44" fill="{INDIGO}" opacity="0.06"/>')
    parts.append(f'<circle cx="1070" cy="320" r="52" fill="{INDIGO}" opacity="0.05"/>')

    # bookcase, left
    parts.append(f'<rect x="56" y="96" width="360" height="516" rx="6" fill="{PAPER}" '
                 f'stroke="{RULE}" stroke-width="3"/>')
    for row in range(4):
        parts.append(shelf(74, 112 + row * 124, 324, row * 3 + 1))

    # faint citation network, tying the scene to the site motif
    nodes = [(180, 92), (470, 60), (620, 150), (700, 74), (330, 58), (560, 250), (250, 210)]
    for i, (nx, ny) in enumerate(nodes):
        parts.append(f'<circle cx="{nx}" cy="{ny}" r="{3 if i % 2 else 4}" fill="{NAVY}" opacity="0.16"/>')
    for a, b in [(0, 4), (4, 1), (1, 2), (2, 3), (0, 6), (6, 5), (5, 2)]:
        parts.append(
            f'<line x1="{nodes[a][0]}" y1="{nodes[a][1]}" x2="{nodes[b][0]}" y2="{nodes[b][1]}" '
            f'stroke="{NAVY}" stroke-width="1.2" opacity="0.13"/>'
        )

    # floor line
    parts.append(f'<line x1="0" y1="{FLOOR}" x2="{W}" y2="{FLOOR}" stroke="{RULE}" stroke-width="3"/>')

    # the group
    parts.append(figure(302, 0.93, SKIN[0], HAIR[0], NAVY, "thesis", "short", INK))
    parts.append(figure(487, 1.00, SKIN[2], HAIR[2], INDIGO, "bound", "long", NAVY))
    parts.append(figure(672, 0.96, SKIN[1], HAIR[1], INDIGO_LIFT, "paper", "wavy", INDIGO))
    parts.append(figure(853, 0.91, SKIN[3], HAIR[3], NAVY, "books", "bun", INK))

    parts.append("</g></svg>")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("".join(parts), encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)}  ({OUT.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    build()
