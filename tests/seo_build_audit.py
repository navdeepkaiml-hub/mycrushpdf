"""Static SEO audit of the production build (/app/frontend/build)."""
import glob, json, os, re
from html.parser import HTMLParser

B = "/app/frontend/build"
files = sorted(glob.glob(f"{B}/**/*.html", recursive=True))
titles = {}
problems = []
for f in files:
    h = open(f).read()
    rel = os.path.relpath(f, B)
    t = re.findall(r"<title[^>]*>(.*?)</title>", h, re.S)
    desc = re.findall(r'<meta[^>]+name="description"', h)
    canon = re.findall(r'<link[^>]+rel="canonical"[^>]*href="([^"]+)"', h)
    og = re.findall(r'property="og:image"', h)
    ld = re.findall(r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>', h, re.S)
    types = []
    for s in ld:
        try:
            j = json.loads(s)
            g = j.get("@graph", [j])
            types += [x.get("@type") for x in g]
        except Exception as e:
            problems.append(f"{rel}: invalid JSON-LD {e}")
    root = re.search(r'<div id="root">(.*)</div>\s*(<script|</body>)', h, re.S)
    body = root.group(1) if root else ""
    h1 = len(re.findall(r"<h1", body)); links = len(re.findall(r"<a ", body))
    txt = len(re.sub(r"<[^>]+>", " ", body).split())
    titles.setdefault(t[0] if t else None, []).append(rel)
    print(f"{rel:45} t={len(t)} d={len(desc)} c={len(canon)} og={len(og)} h1={h1} a={links} words={txt} ld={types} canon={canon[:1]}")
    if len(t) != 1 or len(desc) != 1 or len(canon) != 1 or not og or h1 < 1 or links < 5 or txt < 50:
        problems.append(f"{rel}: meta/body issue")
    if rel != "index.html" and "BreadcrumbList" not in types and rel != "404.html":
        problems.append(f"{rel}: no BreadcrumbList")
dups = {k: v for k, v in titles.items() if len(v) > 1}
print("dup titles:", dups)
print("PROBLEMS:", problems)
sm = open(f"{B}/sitemap.xml").read()
locs = re.findall(r"<loc>(.*?)</loc>", sm)
print("sitemap urls:", len(locs), "admin present:", any("admin" in l for l in locs))
print("robots:", open(f"{B}/robots.txt").read())
for f in ["favicon.ico", "favicon-16x16.png", "favicon-32x32.png", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "og-image.png", "logo.svg", "logo-mark.svg", "manifest.json", "pdf.worker.min.js"]:
    print(f, os.path.exists(f"{B}/{f}"))
from PIL import Image
print("og size:", Image.open(f"{B}/og-image.png").size)
