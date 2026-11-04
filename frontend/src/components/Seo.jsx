import { useEffect } from "react";

const SITE = "mycrushpdf";
const BASE = "https://mycrushpdf.com";

function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setJsonLd(id, data) {
  let el = document.getElementById(id);
  if (data) {
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
  } else if (el) {
    el.remove();
  }
}

// Client-side SEO head manager. The production Vite build uses react-helmet-async
// + a prerender step (see DEPLOYMENT.md) so crawlers receive static metadata.
export default function Seo({ title, description, path = "/", image, jsonLd, noindex }) {
  useEffect(() => {
    const fullTitle = title || `${SITE} — All Your PDF Tools in One Place`;
    const canonical = `${BASE}${path === "/" ? "" : path}`;
    document.title = fullTitle;
    setMeta("name", "description", description);
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    setLink("canonical", canonical);
    // Open Graph
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", canonical);
    setMeta("property", "og:site_name", SITE);
    if (image) setMeta("property", "og:image", image);
    // Twitter
    setMeta("name", "twitter:card", image ? "summary_large_image" : "summary");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    if (image) setMeta("name", "twitter:image", image);
    setJsonLd("page-jsonld", jsonLd);
  }, [title, description, path, image, jsonLd, noindex]);

  return null;
}
