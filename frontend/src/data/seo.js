// Single source for page metadata and JSON-LD, used by pages and the build-time prerender.
export const BASE = "https://mycrushpdf.com";
export const OG_IMAGE = `${BASE}/og-image.png`;

export const PAGE_META = {
  home: {
    path: "/",
    title: "Free Online PDF Tools – Merge, Compress & Convert | mycrushpdf",
    description: "Use free online PDF tools to merge, compress, split, organize and convert PDF files. Files are processed in your browser, with no signup required.",
  },
  allTools: {
    path: "/all-tools",
    title: "All PDF Tools – Merge, Compress, Split & Convert | mycrushpdf",
    description: "Browse every free mycrushpdf tool: merge, compress, split, remove pages, organize, rotate and convert JPG to PDF, all running in your browser.",
  },
  blog: {
    path: "/blog",
    title: "PDF Guides & Tips – mycrushpdf Blog",
    description: "Practical guides on merging, compressing, splitting, converting and organizing PDF files, written by the mycrushpdf editorial team.",
  },
  faq: {
    path: "/faq",
    title: "FAQ – Frequently Asked Questions | mycrushpdf",
    description: "Answers to common questions about mycrushpdf: pricing, file limits, browser-based processing, supported formats and devices.",
  },
  contact: {
    path: "/contact-us",
    title: "Contact Us – mycrushpdf",
    description: "Get in touch with the mycrushpdf team with questions, feedback or bug reports about our free online PDF tools.",
  },
};

export const HOME_FAQS = [
  { q: "Is mycrushpdf free to use?", a: "Yes. All tools on mycrushpdf are free to use and no account is required." },
  { q: "Are my files uploaded to a server?", a: "No. Merge, Compress, Split, Remove Pages, Organize, Rotate and JPG to PDF run inside your browser, so your files stay on your device." },
  { q: "What are the file limits?", a: "Each file can be up to 10 MB and 500 pages. JPG to PDF accepts up to 20 JPG or PNG images per batch." },
  { q: "Do I need to install anything?", a: "No. The tools work in any modern browser on desktop, tablet and phone." },
  { q: "Can I process password-protected PDFs?", a: "Not yet. Please remove the password with the software you used to set it, then try again." },
];

export const GENERAL_FAQS = [
  ...HOME_FAQS,
  { q: "Which browsers are supported?", a: "Current versions of Chrome, Edge, Firefox and Safari on desktop and mobile. Very old browsers may not support in-browser PDF processing." },
  { q: "Why is my compressed PDF not selectable anymore?", a: "Recommended and Strong compression turn pages into optimized images. Choose Less compression if you need selectable text." },
  { q: "Will more tools be added?", a: "Yes. We plan to add more tools in future releases and will only list a tool once it works." },
];

const org = { "@type": "Organization", "@id": `${BASE}/#organization`, name: "mycrushpdf", url: BASE, logo: `${BASE}/icon-512.png` };

export const ld = {
  home: () => [
    org,
    { "@type": "WebSite", "@id": `${BASE}/#website`, name: "mycrushpdf", url: BASE, publisher: { "@id": `${BASE}/#organization` } },
    faq(HOME_FAQS),
  ],
  breadcrumbs: (items) => ({
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((it, i) => ({
      "@type": "ListItem", position: i + 1, name: it.name, item: `${BASE}${it.path === "/" ? "" : it.path}`,
    })),
  }),
  tool: (t) => ({
    "@type": "WebApplication",
    name: `${t.name} – mycrushpdf`,
    url: `${BASE}/${t.slug}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (web browser)",
    browserRequirements: "Requires a modern web browser with JavaScript enabled",
    isAccessibleForFree: true,
    description: t.seoDescription,
    publisher: { "@id": `${BASE}/#organization` },
  }),
  article: (a) => ({
    "@type": "BlogPosting",
    headline: a.title,
    description: a.description,
    datePublished: a.published || a.updated,
    dateModified: a.updated,
    author: { "@type": "Organization", name: "mycrushpdf Editorial Team", url: `${BASE}/about-us` },
    publisher: org,
    mainEntityOfPage: `${BASE}/blog/${a.slug}`,
    image: OG_IMAGE,
  }),
  faq,
};

function faq(list) {
  return {
    "@type": "FAQPage",
    mainEntity: list.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export const graph = (nodes) => ({ "@context": "https://schema.org", "@graph": nodes.filter(Boolean) });
