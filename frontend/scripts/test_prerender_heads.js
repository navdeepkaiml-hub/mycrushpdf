// Validates prerendered heads in build/ against source Seo props (run: node -r sucrase/register/js scripts/test_prerender_heads.js)
const fs = require("fs");
const path = require("path");
const { TOOLS } = require("../src/data/tools");
const { ARTICLES } = require("../src/data/blog");
const { LEGAL_PAGES } = require("../src/data/legal");
const SRC = path.join(__dirname, "..", "src", "pages");
const BUILD = path.join(__dirname, "..", "build");
const BASE = "https://mycrushpdf.com";
const unesc = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#x27;/g, "'").replace(/&amp;/g, "&");
function seoFromComponent(file) {
  const src = fs.readFileSync(path.join(SRC, file), "utf8");
  const m = src.match(/<Seo[\s\S]*?title="([^"]+)"[\s\S]*?description="([^"]+)"/);
  return { title: m[1], description: m[2] };
}
const expected = [
  { file: "index.html", path: "/", ...seoFromComponent("Home.jsx"), ld: true },
  { file: "all-tools.html", path: "/all-tools", ...seoFromComponent("AllTools.jsx") },
  { file: "blog.html", path: "/blog", ...seoFromComponent("Blog.jsx") },
  { file: "faq.html", path: "/faq", ...seoFromComponent("FaqPage.jsx") },
  { file: "contact-us.html", path: "/contact-us", ...seoFromComponent("Contact.jsx") },
  ...TOOLS.map((t) => ({ file: `${t.slug}.html`, path: `/${t.slug}`, title: t.seoTitle, description: t.seoDescription, ld: true })),
  ...Object.entries(LEGAL_PAGES).map(([k, p]) => ({ file: `${k}.html`, path: `/${k}`, title: p.seoTitle, description: p.seoDescription })),
  ...ARTICLES.map((a) => ({ file: `blog/${a.slug}.html`, path: `/blog/${a.slug}`, title: `${a.title} | mycrushpdf`, description: a.description, ld: true })),
];
let fail = 0;
const seen = { t: new Set(), d: new Set(), c: new Set() };
for (const e of expected) {
  const f = path.join(BUILD, e.file);
  if (!fs.existsSync(f)) { console.log("MISSING", e.file); fail++; continue; }
  const h = fs.readFileSync(f, "utf8");
  const head = h.split("</head>")[0];
  const titles = [...head.matchAll(/<title>([\s\S]*?)<\/title>/g)];
  const descs = [...head.matchAll(/<meta name="description" content="([^"]*)"/g)];
  const canons = [...head.matchAll(/<link rel="canonical" href="([^"]*)"/g)];
  const lds = [...head.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  const errs = [];
  if (titles.length !== 1) errs.push(`titles=${titles.length}`);
  if (descs.length !== 1) errs.push(`descs=${descs.length}`);
  if (canons.length !== 1) errs.push(`canon=${canons.length}`);
  if (titles[0] && unesc(titles[0][1]) !== e.title) errs.push(`title mismatch: ${titles[0][1]} vs ${e.title}`);
  if (descs[0] && unesc(descs[0][1]) !== e.description) errs.push(`desc mismatch`);
  const url = BASE + (e.path === "/" ? "" : e.path);
  if (canons[0] && canons[0][1] !== url) errs.push(`canon mismatch ${canons[0][1]}`);
  if (e.ld) {
    if (lds.length !== 1) errs.push(`ld count=${lds.length}`);
    else { try { JSON.parse(lds[0][1]); } catch (x) { errs.push("ld invalid JSON"); } }
  }
  for (const [k, v] of [["t", titles[0]?.[1]], ["d", descs[0]?.[1]], ["c", canons[0]?.[1]]]) {
    if (seen[k].has(v)) errs.push(`duplicate ${k}`); seen[k].add(v);
  }
  if (errs.length) { fail++; console.log("FAIL", e.file, errs.join("; ")); } else console.log("OK  ", e.file);
}
console.log(`${expected.length - fail}/${expected.length} passed`);
process.exit(fail ? 1 : 0);
