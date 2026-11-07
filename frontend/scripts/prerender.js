// Post-build: writes build/<route>.html with page-specific head tags, crawlable body content and JSON-LD, plus sitemap.xml.
const fs = require("fs");
const path = require("path");
const { TOOLS } = require("../src/data/tools");
const { ARTICLES } = require("../src/data/blog");
const { LEGAL_PAGES } = require("../src/data/legal");
const { BASE, PAGE_META, HOME_FAQS, GENERAL_FAQS, ld, graph } = require("../src/data/seo");

const BUILD = path.join(__dirname, "..", "build");
const template = fs.readFileSync(path.join(BUILD, "index.html"), "utf8");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const a = (href, text) => `<a href="${href}">${esc(text)}</a>`;
const list = (items) => `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
const faqHtml = (faqs) => `<h2>Frequently asked questions</h2>${faqs.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join("")}`;
const crumbs = (items) => `<nav aria-label="Breadcrumb">${[a("/", "Home"), ...items.map((i) => (i.path ? a(i.path, i.name) : esc(i.name)))].join(" › ")}</nav>`;
const toolLinks = list(TOOLS.map((t) => a(`/${t.slug}`, t.name)));

const LEGAL_LINKS = [["/about-us", "About Us"], ["/contact-us", "Contact"], ["/privacy-policy", "Privacy Policy"], ["/terms-and-conditions", "Terms of Service"], ["/cookie-policy", "Cookie Policy"], ["/disclaimer", "Disclaimer"], ["/security", "Security & File Privacy"], ["/blog", "Blog"], ["/faq", "FAQ"], ["/all-tools", "All PDF Tools"]];
const shell = (main) =>
  `<header><a href="/">mycrushpdf</a><nav aria-label="Main">${a("/merge-pdf", "Merge PDF")} ${a("/compress-pdf", "Compress PDF")} ${a("/split-pdf", "Split PDF")} ${a("/jpg-to-pdf", "JPG to PDF")} ${a("/all-tools", "All Tools")} ${a("/blog", "Blog")}</nav></header>` +
  `<main style="max-width:48rem;margin:0 auto;padding:2rem 1rem;min-height:100vh">${main}</main>` +
  `<footer><h2>PDF Tools</h2>${toolLinks}${list(LEGAL_LINKS.map(([h, t]) => a(h, t)))}<p>© ${new Date().getFullYear()} mycrushpdf. All rights reserved.</p></footer>`;

const block = (b) => {
  if (b.type === "h2") return `<h2>${esc(b.text)}</h2>`;
  if (b.type === "ul" || b.type === "ol") return `<${b.type}>${b.items.map((i) => `<li>${esc(i)}</li>`).join("")}</${b.type}>`;
  return b.text ? `<p>${esc(b.text)}</p>` : "";
};

const pages = [
  { ...PAGE_META.home, jsonLd: ld.home(),
    body: `<h1>Everything you need to work with PDFs</h1><p>Merge, compress, split, organize and convert PDF files with simple online tools that run right in your browser. No account required, and your files are not uploaded to our servers.</p><h2>Popular PDF tools</h2>${list(TOOLS.map((t) => `${a(`/${t.slug}`, t.name)} – ${esc(t.tagline)}`))}<h2>Helpful PDF guides</h2>${list(ARTICLES.map((x) => a(`/blog/${x.slug}`, x.title)))}${faqHtml(HOME_FAQS)}` },
  { ...PAGE_META.allTools, crumbs: [{ name: "All Tools", path: "/all-tools" }],
    body: `<h1>All PDF Tools</h1><p>Every mycrushpdf tool, free and processed in your browser.</p>${list(TOOLS.map((t) => `${a(`/${t.slug}`, t.name)} – ${esc(t.tagline)}`))}` },
  { ...PAGE_META.blog, crumbs: [{ name: "Blog", path: "/blog" }],
    body: `<h1>PDF Guides &amp; Tips</h1>${ARTICLES.map((x) => `<article><h2>${a(`/blog/${x.slug}`, x.title)}</h2><p>${esc(x.description)}</p></article>`).join("")}` },
  { ...PAGE_META.faq, crumbs: [{ name: "FAQ", path: "/faq" }], extraLd: [ld.faq(GENERAL_FAQS)],
    body: `<h1>Frequently Asked Questions</h1>${faqHtml(GENERAL_FAQS)}` },
  { ...PAGE_META.contact, crumbs: [{ name: "Contact Us", path: "/contact-us" }],
    body: `<h1>Contact Us</h1><p>Have a question, found a bug, or want to suggest a feature? Use the contact form on this page.</p>` },
  ...TOOLS.map((t) => ({
    path: `/${t.slug}`, title: t.seoTitle, description: t.seoDescription,
    crumbs: [{ name: "All Tools", path: "/all-tools" }, { name: t.name, path: `/${t.slug}` }],
    extraLd: [ld.tool(t), ld.faq(t.faqs)],
    body: `<h1>${esc(t.name)}</h1><p>${esc(t.intro)}</p><h2>How to use ${esc(t.name)}</h2><ol>${t.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>` +
      `<h2>Supported formats</h2><p>${esc(t.formats)}</p><h2>Limits</h2><p>${esc(t.limitations)}</p><h2>When to use it</h2><p>${esc(t.example)}</p>` +
      `<h2>Privacy and processing</h2><p>${esc(t.name)} runs in your web browser. Your files are processed on your device and are not uploaded to our servers.</p>${faqHtml(t.faqs)}` +
      `<h2>Related PDF tools</h2>${list((t.related || []).map((s) => TOOLS.find((x) => x.slug === s)).filter(Boolean).map((r) => a(`/${r.slug}`, r.name)))}`,
  })),
  ...Object.entries(LEGAL_PAGES).map(([k, p]) => ({
    path: `/${k}`, title: p.seoTitle, description: p.seoDescription, crumbs: [{ name: p.title, path: `/${k}` }],
    body: `<h1>${esc(p.title)}</h1>${p.updated ? `<p>Last updated: ${p.updated}</p>` : ""}${p.sections.map((s) => `${s.h ? `<h2>${esc(s.h)}</h2>` : ""}${s.p.map((x) => `<p>${esc(x)}</p>`).join("")}`).join("")}`,
  })),
  ...ARTICLES.map((x) => ({
    path: `/blog/${x.slug}`, title: `${x.title} | mycrushpdf`, description: x.description, lastmod: x.updated,
    crumbs: [{ name: "Blog", path: "/blog" }, { name: x.title, path: `/blog/${x.slug}` }], extraLd: [ld.article(x)],
    body: `<article><h1>${esc(x.title)}</h1><p>By mycrushpdf Editorial Team · Updated ${x.updated}</p>${x.body.map(block).join("")}</article>`,
  })),
];

function render(p) {
  const url = `${BASE}${p.path === "/" ? "" : p.path}`;
  const t = esc(p.title);
  const d = esc(p.description);
  const nodes = p.jsonLd || [...(p.extraLd || []), ld.breadcrumbs(p.crumbs || [])];
  const head = [
    `<link rel="canonical" href="${url}"/>`,
    `<meta property="og:url" content="${url}"/>`,
    `<meta name="twitter:title" content="${t}"/>`,
    `<meta name="twitter:description" content="${d}"/>`,
    `<script type="application/ld+json" id="page-jsonld">${JSON.stringify(graph(nodes)).replace(/</g, "\\u003c")}</script>`,
  ].join("");
  const body = shell((p.crumbs ? crumbs(p.crumbs.slice(0, -1).concat({ name: p.crumbs[p.crumbs.length - 1].name })) : "") + p.body);
  return template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${t}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${d}"/>`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${t}"/>`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${d}"/>`)
    .replace("</head>", `${head}</head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}

const titles = new Set();
for (const p of pages) {
  if (titles.has(p.title)) throw new Error(`Duplicate title: ${p.title}`);
  titles.add(p.title);
  const file = p.path === "/" ? "index.html" : `${p.path.slice(1)}.html`;
  const out = path.join(BUILD, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, render(p));
}

// SPA fallback for unknown and admin routes: generic head, noindex, no canonical.
fs.writeFileSync(path.join(BUILD, "app.html"), template.replace('<meta name="robots" content="index, follow" />', '<meta name="robots" content="noindex" />'));

const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages
  .map((p) => `  <url><loc>${BASE}${p.path === "/" ? "/" : p.path}</loc><lastmod>${p.lastmod || today}</lastmod></url>`)
  .join("\n")}\n</urlset>\n`;
fs.writeFileSync(path.join(BUILD, "sitemap.xml"), sitemap);
fs.writeFileSync(path.join(__dirname, "..", "public", "sitemap.xml"), sitemap);
console.log(`Prerendered ${pages.length} pages + sitemap.xml`);
