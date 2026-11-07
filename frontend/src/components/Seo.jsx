import { useEffect } from "react";
import { BASE, OG_IMAGE, graph } from "@/data/seo";

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

function setJsonLd(nodes) {
  let el = document.getElementById("page-jsonld");
  if (!nodes || !nodes.length) { if (el) el.remove(); return; }
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = "page-jsonld";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(graph(nodes));
}

// Keeps head tags in sync during client-side navigation; the build prerender writes the same tags statically.
export default function Seo({ title, description, path = "/", jsonLd, noindex }) {
  const key = JSON.stringify(jsonLd || null);
  useEffect(() => {
    const canonical = `${BASE}${path === "/" ? "" : path}`;
    document.title = title;
    setMeta("name", "description", description);
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    setLink("canonical", canonical);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", canonical);
    setMeta("property", "og:image", OG_IMAGE);
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setJsonLd(jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, path, key, noindex]);
  return null;
}
