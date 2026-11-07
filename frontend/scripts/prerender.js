// Post-build: writes build/<route>.html with per-page title, description, canonical and JSON-LD.
const fs = require("fs");
const path = require("path");
const { TOOLS } = require("../src/data/tools");
const { ARTICLES } = require("../src/data/blog");
const { LEGAL_PAGES } = require("../src/data/legal");

const BASE = "https://mycrushpdf.com";
const BUILD = path.join(__dirname, "..", "build");
const template = fs.readFileSync(path.join(BUILD, "index.html"), "utf8");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const pages = [
  { path: "/", title: "mycrushpdf — All Your PDF Tools in One Place", description: "Merge, compress, split and convert PDF documents with simple, fast and secure online tools. Free to use, no signup required.", jsonLd: { "@context": "https://schema.org", "@type": "WebSite", name: "mycrushpdf", url: BASE } },
  { path: "/all-tools", title: "All PDF Tools — Merge, Compress, Split, Convert | mycrushpdf", description: "Browse every free online PDF tool from mycrushpdf: merge, compress, split, remove pages, organize, JPG to PDF, PDF to Word and rotate." },
  { path: "/blog", title: "PDF Guides & Tips — mycrushpdf Blog", description: "Practical, original guides on merging, compressing, splitting, converting and organizing PDF files. Learn to work smarter with documents." },
  { path: "/faq", title: "FAQ — Frequently Asked Questions | mycrushpdf", description: "Answers to common questions about mycrushpdf: pricing, file limits, privacy, supported formats, browsers and upcoming tools." },
  { path: "/contact-us", title: "Contact Us — mycrushpdf", description: "Get in touch with the mycrushpdf team. Send us your questions, feedback or support requests and we'll get back to you." },
  ...TOOLS.map((t) => ({
    path: `/${t.slug}`, title: t.seoTitle, description: t.seoDescription,
    jsonLd: { "@context": "https://schema.org", "@type": "SoftwareApplication", name: `${t.name} — mycrushpdf`, applicationCategory: "UtilitiesApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: t.seoDescription },
  })),
  ...Object.entries(LEGAL_PAGES).map(([k, p]) => ({ path: `/${k}`, title: p.seoTitle, description: p.seoDescription })),
  ...ARTICLES.map((a) => ({
    path: `/blog/${a.slug}`, title: `${a.title} | mycrushpdf`, description: a.description,
    jsonLd: { "@context": "https://schema.org", "@type": "Article", headline: a.title, description: a.description, datePublished: a.updated, dateModified: a.updated, author: { "@type": "Organization", name: "mycrushpdf Editorial Team" }, publisher: { "@type": "Organization", name: "mycrushpdf" }, mainEntityOfPage: `${BASE}/blog/${a.slug}` },
  })),
];

function render(p) {
  const url = `${BASE}${p.path === "/" ? "" : p.path}`;
  const t = esc(p.title);
  const d = esc(p.description);
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${t}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${d}"/>`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${t}"/>`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${d}"/>`);
  const extra = [
    `<link rel="canonical" href="${url}"/>`,
    `<meta property="og:url" content="${url}"/>`,
    `<meta name="robots" content="index, follow"/>`,
    `<meta name="twitter:title" content="${t}"/>`,
    `<meta name="twitter:description" content="${d}"/>`,
    p.jsonLd ? `<script type="application/ld+json" id="page-jsonld">${JSON.stringify(p.jsonLd).replace(/</g, "\\u003c")}</script>` : "",
  ].join("");
  return html.replace("</head>", `${extra}</head>`);
}

for (const p of pages) {
  const file = p.path === "/" ? "index.html" : `${p.path.slice(1)}.html`;
  const out = path.join(BUILD, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, render(p));
}
console.log(`Prerendered ${pages.length} pages`);
