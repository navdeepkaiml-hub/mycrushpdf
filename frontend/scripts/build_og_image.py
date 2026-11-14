# Builds public/og-image.png (1200x630) for Open Graph / Twitter cards.
# Uses only the project's own logo and brand colours (see build_brand.py); no external assets.
# Fonts: Inter (SIL OFL) for text. Run: python3 scripts/build_og_image.py
# Note: scripts/build_brand.py also writes og-image.png; run this script afterwards if you re-run it.
from pathlib import Path

import cairosvg

PUB = Path(__file__).resolve().parent.parent / "public"
PURPLE, NAVY, INK, MUTED = "#5146E5", "#111827", "#0F172A", "#475569"

logo = (PUB / "brand" / "mycrushpdf-logo.svg").read_text()
logo_inner = logo.split("</title>", 1)[1].rsplit("</svg>", 1)[0]  # 274x64 logo, wordmark already outlined
UPPER = "M12 41V12a6 6 0 0 1 6-6h20l14 14v1z"
LOWER = "M12 47l40-20v25a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6z"

chips = ["Merge", "Compress", "Split", "Rotate", "JPG to PDF"]
x, chip_svg = 80, ""
for c in chips:
    w = int(len(c) * 13.4 + 44)
    chip_svg += (
        f'<rect x="{x}" y="500" width="{w}" height="52" rx="26" fill="#FFFFFF" stroke="#DDE0FF" stroke-width="2"/>'
        f'<text x="{x + w / 2}" y="534" text-anchor="middle" font-family="Inter" font-weight="600" font-size="24" fill="{PURPLE}">{c}</text>'
    )
    x += w + 14

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FAFBFF"/><stop offset="1" stop-color="#E9EBFF"/></linearGradient>
  <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E4E6FF"/><stop offset="1" stop-color="#D3D6FF"/></linearGradient>
</defs>
<rect width="1200" height="630" fill="url(#bg)"/>
<circle cx="960" cy="285" r="235" fill="url(#glow)"/>
<circle cx="960" cy="285" r="165" fill="#FFFFFF" fill-opacity="0.55"/>
<g transform="translate(832 157) scale(4)"><path d="{UPPER}" fill="{PURPLE}"/><path d="{LOWER}" fill="{NAVY}"/></g>
<g transform="translate(80 62) scale(1.15)">{logo_inner}</g>
<text x="80" y="262" font-family="Inter" font-weight="700" font-size="84" letter-spacing="-2" fill="{INK}">Free Online</text>
<text x="80" y="352" font-family="Inter" font-weight="700" font-size="84" letter-spacing="-2" fill="{PURPLE}">PDF Tools</text>
<text x="80" y="418" font-family="Inter" font-weight="500" font-size="30" fill="{MUTED}">Merge, compress, split, rotate and convert PDFs.</text>
{chip_svg}
<text x="1120" y="590" text-anchor="end" font-family="Inter" font-weight="500" font-size="22" fill="#64748B">mycrushpdf.web.app</text>
</svg>'''

cairosvg.svg2png(bytestring=svg.encode(), write_to=str(PUB / "og-image.png"), output_width=1200, output_height=630)
print("wrote", PUB / "og-image.png")
