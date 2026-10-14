#!/usr/bin/env python3
"""
Book Publication candidate: the five real covers, photographed-desk styling.

Every cover is pasted from its own file in public/books/ and only scaled,
perspective-mapped, lit and shadowed. No artwork, title, author, Hindi text,
ISBN, imprint or typography is altered, and nothing is drawn from memory.

No text, logos, badges or claims are added anywhere in the frame.

Run: python3 scripts/build-book-feature.py
Writes: public/book-feature-candidate.jpg   (NOT wired to the site)
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
BOOKS = ROOT / "public" / "books"
OUT = ROOT / "public" / "book-feature-candidate.jpg"

W, H = 1700, 900
HORIZON = 556                      # where the backdrop meets the desk


def find_coeffs(dest, src):
    m = []
    for (dx, dy), (sx, sy) in zip(dest, src):
        m.append([dx, dy, 1, 0, 0, 0, -sx * dx, -sx * dy])
        m.append([0, 0, 0, dx, dy, 1, -sy * dx, -sy * dy])
    a = [r[:] + [v] for r, v in zip(m, [c for p in src for c in p])]
    n = 8
    for i in range(n):
        p = max(range(i, n), key=lambda r: abs(a[r][i]))
        a[i], a[p] = a[p], a[i]
        piv = a[i][i]
        a[i] = [v / piv for v in a[i]]
        for r in range(n):
            if r != i and a[r][i]:
                f = a[r][i]
                a[r] = [v - f * w for v, w in zip(a[r], a[i])]
    return [a[i][n] for i in range(n)]


def warp(img, quad, size):
    """quad = [top-left, top-right, bottom-right, bottom-left] of the target."""
    src = [(0, 0), (img.width, 0), (img.width, img.height), (0, img.height)]
    return img.convert("RGBA").transform(
        size, Image.PERSPECTIVE, find_coeffs(quad, src), Image.BICUBIC)


def cover(slug):
    path = BOOKS / f"{slug}-front.jpg"
    if not path.exists():
        raise SystemExit(f"missing cover asset: {path}")
    return Image.open(path).convert("RGB")


def poly(canvas, pts, fill, blur=0):
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).polygon(pts, fill=fill)
    if blur:
        layer = layer.filter(ImageFilter.GaussianBlur(blur))
    canvas.alpha_composite(layer)


def ellipse(canvas, box, fill, blur):
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).ellipse(box, fill=fill)
    canvas.alpha_composite(layer.filter(ImageFilter.GaussianBlur(blur)))


def build():
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    d = ImageDraw.Draw(canvas)

    # ------------------------------------------------- seamless backdrop
    # A plain studio sweep. No shelving, no blurred band.
    for y in range(HORIZON):
        t = (y / HORIZON) ** 0.85
        d.line([(0, y), (W, y)], fill=(
            int(96 + 118 * t), int(88 + 112 * t), int(80 + 104 * t)))

    glow = Image.new("L", (W, H), 0)
    ImageDraw.Draw(glow).ellipse([220, -320, 1420, 640], fill=120)
    warm = Image.new("RGBA", (W, H), (255, 240, 214, 255))
    warm.putalpha(glow.filter(ImageFilter.GaussianBlur(230)))
    canvas.alpha_composite(warm)

    # ------------------------------------------------------------- desk
    for y in range(HORIZON, H):
        t = (y - HORIZON) / (H - HORIZON)
        d.line([(0, y), (W, y)], fill=(
            int(118 - 54 * t), int(84 - 40 * t), int(54 - 28 * t)))
    grain = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grain)
    for i in range(70):
        y = HORIZON + i * 5
        gd.line([(0, y), (W, y + (i % 4) - 2)], fill=(72, 48, 28, 24))
    canvas.alpha_composite(grain.filter(ImageFilter.GaussianBlur(1.6)))
    # soft pool of light on the surface
    pool = Image.new("L", (W, H), 0)
    ImageDraw.Draw(pool).ellipse([100, HORIZON - 30, 1600, H + 140], fill=74)
    sheen = Image.new("RGBA", (W, H), (255, 228, 186, 255))
    sheen.putalpha(pool.filter(ImageFilter.GaussianBlur(170)))
    canvas.alpha_composite(sheen)

    # ------------------------------------------------------------ books
    # slug, left x, baseline, height, spine depth, spine colour, light falloff
    # Baselines and heights vary so the row reads as staggered depth, and the
    # order below draws back-to-front.
    layout = [
        ("digital-yug-bal-man",     721, 730, 400, 21, (28, 40, 60), 0.07),
        ("physical-chemistry",      421, 756, 440, 25, (20, 38, 92), 0.02),
        ("bhavnatmak-buddhimatta",  996, 760, 430, 24, (206, 200, 188), 0.10),
        ("organic-chemistry",       100, 786, 474, 28, (26, 64, 34), 0.00),
        ("pariksha-tanav",         1290, 790, 466, 27, (198, 190, 176), 0.15),
    ]

    for slug, x, base, height, depth, spine, falloff in layout:
        img = cover(slug)
        width = round(height * img.width / img.height)
        top = base - height

        # contact shadow: tight and dark right under the book
        ellipse(canvas, [x - depth - 6, base - 12, x + width + 10, base + 26],
                (18, 11, 6, 150), 13)
        # cast shadow thrown away from the key light
        poly(canvas, [(x - depth, base - 8), (x + width, base - 4),
                      (x + width + 84, base + 44), (x - depth + 26, base + 38)],
             (22, 14, 8, 78), blur=22)

        # spine, receding to the left
        poly(canvas, [(x - depth, top + 11), (x, top), (x, base), (x - depth, base - 9)],
             spine + (255,))

        face = [(x, top), (x + width, top + 6), (x + width, base + 6), (x, base)]
        canvas.alpha_composite(warp(img, face, (W, H)))

        # page edge along the top
        poly(canvas, [(x, top), (x + width, top + 6),
                      (x + width - 6, top + 1), (x + 5, top - 5)],
             (230, 224, 211, 255))

        # soft sheen across the cover, brighter toward the key light
        sh = Image.linear_gradient("L").rotate(90, expand=True).resize((width, height))
        sheen_img = Image.new("RGB", (width, height), (255, 250, 238))
        sheen_layer = warp(sheen_img, face, (W, H))
        mask = warp(sh.convert("RGB"), face, (W, H)).convert("L")
        sheen_layer.putalpha(mask.point(lambda v: int(v * 0.16)))
        canvas.alpha_composite(sheen_layer)

        # gentle falloff for books further from the light
        if falloff:
            shade_img = Image.new("RGB", (width, height), (28, 22, 16))
            shade_layer = warp(shade_img, face, (W, H))
            shade_layer.putalpha(
                warp(Image.new("L", (width, height), 255).convert("RGB"), face, (W, H))
                .convert("L").point(lambda v: int(v * falloff)))
            canvas.alpha_composite(shade_layer)

        # short reflection in the polished surface
        refl = img.resize((width, round(height * 0.2)), Image.BICUBIC) \
                  .transpose(Image.FLIP_TOP_BOTTOM).convert("RGBA")
        fade = Image.linear_gradient("L").resize(refl.size).point(lambda v: int((255 - v) * 0.17))
        refl.putalpha(fade)
        canvas.alpha_composite(refl, (x, base + 3))

    # ------------------------------------------------------- final grade
    vig = Image.new("L", (W, H), 0)
    ImageDraw.Draw(vig).ellipse([-240, -170, W + 240, H + 170], fill=255)
    vig = vig.filter(ImageFilter.GaussianBlur(180)).point(lambda v: 255 - v)
    shade = Image.new("RGBA", (W, H), (20, 13, 7, 255))
    shade.putalpha(vig.point(lambda v: int(v * 0.46)))
    canvas.alpha_composite(shade)

    flat = canvas.convert("RGB")
    flat = ImageEnhance.Contrast(flat).enhance(1.05)
    flat = ImageEnhance.Color(flat).enhance(1.06)
    flat.save(OUT, "JPEG", quality=92, optimize=True, progressive=True)
    print(f"wrote {OUT.relative_to(ROOT)}  {W}x{H}  {OUT.stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    build()
