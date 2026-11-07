# mycrushpdf.com — PRD

## Problem statement
A secure, fast, SEO-friendly online PDF utility platform with a premium brand. It must stay deployable on Firebase Hosting's free Spark plan, with no paid services. The user is budget-constrained.

## Architecture (as of 2026-06)
- Frontend: React (CRA + craco) + Tailwind. PDF tools run **in the browser** (src/lib/pdfTools.js, using pdf-lib, PDF.js and JSZip, loaded lazily). Limits: 10 MB per file, 20 images per batch, 500 pages.
- SEO: src/data/seo.js holds page metadata and JSON-LD builders. `yarn build` runs scripts/prerender.js, which writes 24 route HTML files (head + crawlable body + JSON-LD), 404.html/app.html (noindex) and sitemap.xml.
- Brand: "split page" mark (a document with a clipped corner, divided by a rising diagonal gap). Assets live in public/brand/*.svg (logo, light, dark, black, white, symbol, symbol-mono), plus favicon.svg/.ico/16/32, apple-touch-icon, icon-192/512 and og-image.png. The wordmark is Plus Jakarta Sans 600 converted to outlines. Regenerate with scripts/build_brand.py <font.ttf>.
- Backend (FastAPI + MongoDB, optional and not on Spark): admin dashboard, contact inbox, /api/stats usage counts. The old /api/tools/* endpoints are unused by the frontend.
- firebase.json: public=build, cleanUrls, only /admin/** rewritten to app.html, security headers.

## Implemented
- Phase 1 MVP: 6 tools, admin, blog (5 articles), legal pages, deployment docs
- QA pass: error handling, compression fix, security hardening (iterations 1–2)
- Search-ready pages, head-only prerender (iteration 3)
- 2026-06 Redesign + browser tools + technical SEO (iterations 4–5 at 100%):
  - New logo and icon set, header with an accessible dropdown, footer, homepage with 10 sections, richer tool pages
  - All 7 tools (Merge, Compress, Split, Remove, Organize, Rotate, JPG to PDF) moved to the browser
  - Exact upload-limit messages
  - Security & File Privacy page; legal text updated to match browser processing
  - Prerendered body content, JSON-LD @graph (Organization, WebSite, WebApplication, FAQPage, BreadcrumbList, BlogPosting), auto sitemap, real 404, source maps off
  - PDF to Word hidden (needs a server)

## Backlog
- P1: 5 new blog articles (deferred by the user); cookie consent banner before GA4/AdSense; admin SEO tab not wired to pages
- P2: PDF to Word in the browser (limited) or other new tools; organize duplicate-page warning; Lighthouse audit on the deployed site; WebP for images; separate admin labels for hidden tools
