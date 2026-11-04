# mycrushpdf — Deployment Guide

This repo runs in the Emergent preview as **React (CRA) + FastAPI + MongoDB**.
The code is structured so it exports cleanly to the target production stack:
**Vite + TypeScript frontend on Firebase Hosting** and **FastAPI backend on Google
Cloud Run**, wired together through a Firebase Hosting `/api` rewrite.

> Nothing here activates paid resources. Enable billing yourself when ready.

---

## 1. Architecture

```
Browser ──> Firebase Hosting (static Vite build of the React app)
                │
                ├── /api/**        ─ rewrite ─> Cloud Run (FastAPI, PyMuPDF/pypdf/Pillow)
                ├── /sitemap.xml   ─ rewrite ─> Cloud Run
                ├── /robots.txt    ─ rewrite ─> Cloud Run
                └── /ads.txt       ─ rewrite ─> Cloud Run
Metadata (stats, contact messages, config) ─> MongoDB Atlas (or Firestore, see §6)
Uploaded files ─> temporary disk / bucket on Cloud Run, auto-deleted ≤ 60 min
```

Firebase Hosting rewrites have a **60-second timeout**. All Phase 1 tools finish
well under this; the backend also caps processing at 55s and returns job IDs +
a download endpoint so large jobs never depend on one long-held HTTP request.

---

## 2. Frontend: export to Vite + TypeScript

The preview uses CRA for stability. For production:

1. Scaffold a Vite + TS app: `npm create vite@latest mycrushpdf -- --template react-ts`
2. Copy `src/` from this repo into the Vite app. Rename page/component files to
   `.tsx` (the code is plain React and compiles as-is; add types incrementally).
3. Keep the `@/` import alias by adding to `vite.config.ts`:
   ```ts
   import path from "path";
   export default defineConfig({
     resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
   });
   ```
4. Replace `process.env.REACT_APP_BACKEND_URL` with `import.meta.env.VITE_BACKEND_URL`.
   In production this should be **empty / same-origin** so calls go to `/api/...`
   and are served by the Hosting rewrite (no CORS needed).
5. SEO: install `react-helmet-async` and move the logic in `components/Seo.jsx`
   into Helmet tags, then add a prerender step (e.g. `vite-plugin-prerender` or
   `react-snap`) for the public routes listed in `server.py` so crawlers receive
   static metadata. Build with `vite build` → outputs to `dist/`.

Build & test:
```bash
npm install
npm run build        # outputs dist/
npm run preview      # local production preview
```

---

## 3. Firebase Hosting setup

```bash
npm install -g firebase-tools
firebase login
firebase init hosting        # public dir = build (current CRA app: `yarn build`) — change to dist only after the optional Vite migration
```

> Zero-cost note: Firebase Hosting (Spark plan) serves the static site, sitemap.xml, robots.txt and ads.txt for free from `frontend/public`. The PDF tools need the Python backend; the `/api/**` rewrite to Cloud Run only takes effect if you later create that service (Cloud Run requires the Blaze plan). Nothing paid is activated by this config.

`firebase.json` is already provided at the repo root with:
- SPA fallback to `index.html`
- `/api/**`, `/sitemap.xml`, `/robots.txt`, `/ads.txt` rewrites to the Cloud Run service
- long-cache headers for static assets + security headers

Deploy:
```bash
firebase deploy --only hosting
```

### Custom domain + SSL
1. Firebase Console → Hosting → Add custom domain → `mycrushpdf.com` (and `www`).
2. Add the TXT/A records Firebase shows at your DNS provider.
3. Firebase auto-provisions a free SSL certificate once DNS verifies (HTTPS).

### Google Search Console
- Add `https://mycrushpdf.com` as a property.
- Verify via the DNS TXT record **or** by uploading the HTML verification file to
  the Vite `public/` folder so it ships in `dist/`.
- Submit `https://mycrushpdf.com/sitemap.xml`.

---

## 4. Backend: Google Cloud Run (preferred)

A production `Dockerfile` is in `backend/`. It binds to `$PORT` (Cloud Run sets it).

```bash
gcloud auth login
gcloud config set project <YOUR_PROJECT_ID>

# Build & push with Cloud Build
gcloud builds submit backend --tag gcr.io/<PROJECT_ID>/mycrushpdf-api

# Deploy (service id MUST match firebase.json → mycrushpdf-api)
gcloud run deploy mycrushpdf-api \
  --image gcr.io/<PROJECT_ID>/mycrushpdf-api \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 1Gi --cpu 1 --timeout 60 \
  --set-env-vars "MONGO_URL=<ATLAS_URL>,DB_NAME=mycrushpdf,CORS_ORIGINS=https://mycrushpdf.com,JWT_SECRET=<SECRET>,ADMIN_EMAIL=<EMAIL>,ADMIN_PASSWORD=<PW>,FILE_RETENTION_MINUTES=60"
```

Requires billing enabled on the GCP project. Do **not** enable it without authorization.

---

## 5. Backend: alternative host (no Cloud Run billing)

If Cloud Run billing is off, deploy the same Docker image to any container host
(Render, Railway, Fly.io, a VPS). Then point Firebase at it by replacing the
`run:` rewrite blocks in `firebase.json` with a destination to that URL, e.g.:

```json
{ "source": "/api/**", "destination": "https://mycrushpdf-api.onrender.com/api/**" }
```
(Or proxy at the DNS/app layer.) Keep `CORS_ORIGINS=https://mycrushpdf.com` set on
the backend. Everything else is identical.

---

## 6. Database: MongoDB now, Firestore later

The data layer is isolated in `backend/db.py` behind a `Repository` class — routes
never touch the driver directly. To move to Firestore:
- Implement a `FirestoreRepository` with the same method names (see
  `FIRESTORE_MIGRATION.md`) and swap the `repo = ...` line.
- Firestore stores only metadata: `tool_stats`, `contact_messages`, `site_config`,
  `jobs` (pointers, never file contents), `users` (admin).
- **Uploaded PDF/image contents are never written to Firestore.**

Admin auth in production can also use **Firebase Authentication**: verify the
Firebase ID token server-side and check a custom `admin` claim instead of the JWT
in `auth.py`. See `FIRESTORE_MIGRATION.md`.

---

## 7. File cleanup safeguard (storage lifecycle)

Primary cleanup: the backend deletes each job's file on expiry (≤ 60 min) and on
a background sweep every 5 minutes. If you store temp files in a GCS bucket, add a
lifecycle rule as a second safeguard:
```json
{ "rule": [{ "action": {"type": "Delete"}, "condition": {"age": 1} }] }
```
Apply with `gsutil lifecycle set lifecycle.json gs://<bucket>`.

---

## 8. Secrets

- Never commit `.env`. Use `backend/.env.example` as the template.
- Set secrets as Cloud Run env vars (or Secret Manager) and as Firebase Hosting
  does not need backend secrets.
- Rotate `JWT_SECRET` and `ADMIN_PASSWORD` before launch.

## 9. Production checklist
- [ ] Vite build serves and routes correctly (`npm run preview`)
- [ ] `/api/` reachable through the Hosting rewrite
- [ ] Custom domain verified, HTTPS active
- [ ] `sitemap.xml`, `robots.txt` reachable at the domain root
- [ ] Admin password & JWT secret rotated
- [ ] ads.txt left unconfigured until a real AdSense publisher ID exists
