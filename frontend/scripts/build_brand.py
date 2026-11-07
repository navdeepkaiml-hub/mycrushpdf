# Builds the mycrushpdf brand: outlined-wordmark SVG logos, symbol, favicons, PWA icons and OG image.
# Usage: python3 scripts/build_brand.py /path/to/PlusJakartaSans[wght].ttf
import io
import sys
from pathlib import Path

import cairosvg
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from PIL import Image

PUB = Path(__file__).resolve().parent.parent / "public"
BRAND = PUB / "brand"
BRAND.mkdir(exist_ok=True)

PURPLE, NAVY, WHITE, LILAC = "#5146E5", "#111827", "#FFFFFF", "#8F88FF"

# Split-page mark on a 64-unit grid: a document with a clipped corner, divided by a rising diagonal gap.
UPPER = "M12 41V12a6 6 0 0 1 6-6h20l14 14v1z"
LOWER = "M12 47l40-20v25a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6z"


def symbol_paths(top, bottom):
    return f'<path d="{UPPER}" fill="{top}"/><path d="{LOWER}" fill="{bottom}"/>'


def outline_text(font, text, size, tracking):
    gs, cmap = font.getGlyphSet(), font.getBestCmap()
    scale = size / font["head"].unitsPerEm
    x, paths = 0.0, []
    for ch in text:
        name = cmap[ord(ch)]
        pen = SVGPathPen(gs)
        gs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, x, 0)))
        paths.append(pen.getCommands())
        x += gs[name].width * scale + tracking
    return paths, x - tracking


font = instantiateVariableFont(TTFont(sys.argv[1]), {"wght": 600})
glyphs, text_w = outline_text(font, "mycrushpdf", 34, -0.4)
SPLIT = len("mycrush")
TX, BASE = 76, 43
W = round(TX + text_w + 2)


def logo(top, bottom, word, accent, label):
    a = "".join(glyphs[:SPLIT])
    b = "".join(glyphs[SPLIT:])
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} 64" width="{W}" height="64" role="img" aria-label="{label}">'
            f'<title>{label}</title>{symbol_paths(top, bottom)}'
            f'<g transform="translate({TX} {BASE})"><path d="{a}" fill="{word}"/><path d="{b}" fill="{accent}"/></g></svg>\n')


def symbol(top, bottom, size=64, bg=None, pad=0):
    inner = 64 + pad * 2
    rect = f'<rect x="{-pad}" y="{-pad}" width="{inner}" height="{inner}" fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-pad} {-pad} {inner} {inner}" width="{size}" height="{size}" role="img" aria-label="mycrushpdf">'
            f'<title>mycrushpdf</title>{rect}{symbol_paths(top, bottom)}</svg>\n')


files = {
    "mycrushpdf-logo.svg": logo(PURPLE, NAVY, NAVY, PURPLE, "mycrushpdf"),
    "mycrushpdf-logo-light.svg": logo(PURPLE, NAVY, NAVY, PURPLE, "mycrushpdf"),
    "mycrushpdf-logo-dark.svg": logo(LILAC, WHITE, WHITE, LILAC, "mycrushpdf"),
    "mycrushpdf-logo-black.svg": logo("#000000", "#000000", "#000000", "#000000", "mycrushpdf"),
    "mycrushpdf-logo-white.svg": logo(WHITE, WHITE, WHITE, WHITE, "mycrushpdf"),
    "mycrushpdf-symbol.svg": symbol(PURPLE, NAVY),
    "mycrushpdf-symbol-mono.svg": symbol(PURPLE, PURPLE),
}
for name, svg in files.items():
    (BRAND / name).write_text(svg)


def render(svg, size):
    return Image.open(io.BytesIO(cairosvg.svg2png(bytestring=svg.encode(), output_width=size, output_height=size))).convert("RGBA")


# Favicons: single-colour symbol, transparent, slightly enlarged so it fills small tabs.
fav = symbol(PURPLE, PURPLE, pad=-4)
render(fav, 16).save(PUB / "favicon-16x16.png", optimize=True)
render(fav, 32).save(PUB / "favicon-32x32.png", optimize=True)
render(fav, 256).save(PUB / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
(PUB / "favicon.svg").write_text(fav)
# Home-screen icons need an opaque background (iOS/Android fill transparency with black).
tile = symbol(PURPLE, NAVY, bg=WHITE, pad=14)
for name, size in [("apple-touch-icon.png", 180), ("icon-192.png", 192), ("icon-512.png", 512)]:
    render(tile, size).convert("RGB").save(PUB / name, optimize=True)

# Open Graph image.
og = (f'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">'
      f'<rect width="1200" height="630" fill="#F8FAFF"/>'
      f'<g transform="translate(120 120) scale(1.6)">{files["mycrushpdf-logo.svg"].split(">", 1)[1].split("</title>", 1)[1].rsplit("</svg>", 1)[0]}</g>'
      f'<g transform="translate(120 360)"><path d="{"".join(outline_text(font, "Everything you need to", 58, -0.8)[0])}" fill="{NAVY}"/></g>'
      f'<g transform="translate(120 432)"><path d="{"".join(outline_text(font, "work with PDFs", 58, -0.8)[0])}" fill="{NAVY}"/></g>'
      f'<rect x="120" y="490" width="96" height="8" rx="4" fill="{PURPLE}"/></svg>')
cairosvg.svg2png(bytestring=og.encode(), write_to=str(PUB / "og-image.png"), output_width=1200, output_height=630)

# QC sheet (not shipped): symbol at 16/32/64/128 on white, light gray, navy and purple.
if len(sys.argv) > 2:
    sheet = Image.new("RGB", (4 * 260, 4 * 160), "white")
    for r, bg in enumerate(["#FFFFFF", "#F1F5F9", NAVY, PURPLE]):
        dark = bg in (NAVY, PURPLE)
        s = symbol(WHITE if bg == PURPLE else (LILAC if dark else PURPLE), WHITE if dark else NAVY)
        for c, size in enumerate([16, 32, 64, 128]):
            cell = Image.new("RGB", (260, 160), bg)
            im = render(s, size)
            cell.paste(im, ((260 - size) // 2, (160 - size) // 2), im)
            sheet.paste(cell, (c * 260, r * 160))
    sheet.save(sys.argv[2])
print("brand built:", ", ".join(files))
