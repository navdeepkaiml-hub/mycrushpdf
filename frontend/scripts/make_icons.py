# Generates favicons, PWA icons and the OG image from the SVG brand mark.
import io
from pathlib import Path
import cairosvg
from PIL import Image

PUB = Path(__file__).resolve().parent.parent / "public"
mark = (PUB / "logo-mark.svg").read_bytes()


def png(size):
    return Image.open(io.BytesIO(cairosvg.svg2png(bytestring=mark, output_width=size, output_height=size))).convert("RGBA")


for name, size in [("favicon-16x16.png", 16), ("favicon-32x32.png", 32), ("apple-touch-icon.png", 180),
                   ("icon-192.png", 192), ("icon-512.png", 512)]:
    png(size).save(PUB / name, optimize=True)
png(64).save(PUB / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

inner = mark.decode().split(">", 1)[1].rsplit("</svg>", 1)[0]
chips = ["Merge", "Compress", "Split", "Remove pages", "Organize", "JPG to PDF"]
x, chip_svg = 120, ""
for c in chips:
    w = 22 + len(c) * 13
    chip_svg += f'<rect x="{x}" y="470" width="{w}" height="52" rx="26" fill="#FFFFFF" stroke="#DCDDF7" stroke-width="2"/>' \
                f'<text x="{x + w / 2}" y="503" text-anchor="middle" font-size="22" font-weight="600" fill="#111827">{c}</text>'
    x += w + 14
og = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" font-family="FreeSans, Arial, sans-serif">
<rect width="1200" height="630" fill="#F8FAFF"/>
<circle cx="1080" cy="80" r="260" fill="#5146E5" fill-opacity="0.07"/>
<g transform="translate(120,110) scale(2)">{inner}</g>
<text x="290" y="185" font-size="64" font-weight="700" fill="#111827">mycrush<tspan fill="#5146E5">pdf</tspan></text>
<text x="120" y="330" font-size="58" font-weight="700" fill="#111827">Everything you need to</text>
<text x="120" y="400" font-size="58" font-weight="700" fill="#111827">work with PDFs</text>
{chip_svg}
</svg>'''
cairosvg.svg2png(bytestring=og.encode(), write_to=str(PUB / "og-image.png"), output_width=1200, output_height=630)
print("icons generated")
