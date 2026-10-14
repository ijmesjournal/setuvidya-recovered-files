#!/usr/bin/env python3
"""
Render public/og-default.png and public/apple-touch-icon.png from the brand
tokens, so the share image never drifts from the site.

Run:  python3 scripts/generate-og.py

Fonts: point SERIF and SANS at Source Serif 4 and IBM Plex Sans if you have
them installed locally; the fallbacks below just keep the script runnable.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"

INK = (11, 27, 43)
WHITE = (255, 255, 255)
BRASS = (168, 128, 44)
MUTED = (168, 180, 196)

SERIF_CANDIDATES = [
    "/usr/share/fonts/truetype/google-fonts/SourceSerif4-SemiBold.ttf",
    "/usr/share/fonts/truetype/google-fonts/Lora-Variable.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
]
SANS_CANDIDATES = [
    "/usr/share/fonts/truetype/google-fonts/IBMPlexSans-Regular.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]


def load(candidates, size):
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def bridge(draw, cx, cy, span, weight, colour, node_colour):
    """The brand mark: a span on two piers with a node at the crown."""
    half = span / 2
    steps = 64
    points = []
    for i in range(steps + 1):
        t = i / steps
        x = cx - half + span * t
        y = cy - (4 * (span * 0.42) * t * (1 - t))
        points.append((x, y))
    draw.line(points, fill=colour, width=weight, joint="curve")
    draw.line([(cx - half, cy), (cx + half, cy)], fill=colour, width=weight)
    drop = span * 0.22
    draw.line([(cx - half, cy), (cx - half, cy + drop)], fill=colour, width=weight)
    draw.line([(cx + half, cy), (cx + half, cy + drop)], fill=colour, width=weight)
    r = span * 0.13
    crown = cy - span * 0.42
    draw.ellipse([cx - r, crown - r, cx + r, crown + r], fill=node_colour)


def make_og():
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), INK)
    d = ImageDraw.Draw(img)

    # faint span lines across the field
    for offset, alpha in ((0, 26), (44, 18), (88, 12)):
        pts = []
        for i in range(81):
            t = i / 80
            x = W * t
            y = 430 + offset - (4 * 180 * t * (1 - t))
            pts.append((x, y))
        d.line(pts, fill=(255, 255, 255, alpha), width=1)

    bridge(d, 122, 200, 62, 3, WHITE, BRASS)

    name_font = load(SERIF_CANDIDATES, 40)
    d.text((182, 176), "SetuVidya Consultancy", font=name_font, fill=WHITE)

    head_font = load(SERIF_CANDIDATES, 60)
    d.text((92, 268), "Bridging Research, Knowledge", font=head_font, fill=WHITE)
    d.text((92, 344), "& Academic Success", font=head_font, fill=WHITE)

    d.rectangle([92, 438, 180, 442], fill=BRASS)

    sub_font = load(SANS_CANDIDATES, 25)
    d.text(
        (92, 482),
        "Thesis  ·  Publication  ·  Book Publication  ·  University Admission",
        font=sub_font,
        fill=MUTED,
    )

    img.save(PUBLIC / "og-default.png", optimize=True)
    print("wrote public/og-default.png")


def make_icon():
    S = 180
    img = Image.new("RGB", (S, S), INK)
    d = ImageDraw.Draw(img)
    bridge(d, S / 2, S * 0.62, S * 0.56, 8, WHITE, BRASS)
    img.save(PUBLIC / "apple-touch-icon.png", optimize=True)
    print("wrote public/apple-touch-icon.png")


if __name__ == "__main__":
    make_og()
    make_icon()
