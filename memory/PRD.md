# mycrushpdf.com — PRD

## Problem statement
Secure, fast, SEO-friendly online PDF utility platform. Phase 1 tools with real server-side processing (PyMuPDF, pypdf, Pillow), homepage with drag-and-drop, blog (5 articles), legal/privacy pages, contact, FAQ, protected admin dashboard. Preview uses the existing React (CRA) app plus FastAPI and MongoDB. Production plan: Firebase Hosting, optional Cloud Run (not activated). Budget-constrained user.

## Architecture
- backend: FastAPI (server.py, pdf_processing.py, storage.py, auth.py, db.py), JWT cookie auth, slowapi rate limits, 60-min file expiry (cleanup every 60s)
- frontend: React + Tailwind + Shadcn, Seo component (client-side meta/JSON-LD), static sitemap.xml/robots.txt/ads.txt in public/
- firebase.json: public=build, SPA fallback, /api/** → Cloud Run (only if created)

## Implemented
- 2026-06: Phase 1 tools (Merge, Compress, Split, Remove Pages, Organize, JPG to PDF), admin, blog, legal, SEO, deployment docs
- 2026-06 (QA pass): ProcessingError→400 handler; safe page-spec parsing (non-numeric, reversed and huge ranges); real image recompression in Compress with levels that differ; oversize error shown in UI; CORS credentials disabled for wildcard; lockout keyed by email; rate limiter uses proxy IP; no hardcoded admin password; mobile menu lists Phase 1 tools; static SEO files; firebase public dir fixed. Tests: 48/48 backend, all UI flows pass (iteration_2).

## Backlog
- P1: Rotate PDF and PDF to Word (backend endpoints exist, not QA'd), prerendering for crawlers, wire the admin SEO tab to the pages
- P2: OCR, Word to PDF, PDF to JPG, Protect PDF; AdSense activation once a Publisher ID is available; separate 'rejected' from 'failed' stats
