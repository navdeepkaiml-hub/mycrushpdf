# mycrushpdf – Deployment Guide (Firebase Hosting, free Spark plan)

## Architecture
- The site is a React app (CRA + craco). `yarn build` creates `frontend/build/`, then `scripts/prerender.js` writes one HTML file for every public route. Each file has its own title, description, canonical URL, Open Graph tags, JSON-LD and crawlable content. The script also writes `sitemap.xml`.
- All public PDF tools (Merge, Compress, Split, Remove Pages, Organize, Rotate, JPG to PDF) run **in the browser** (pdf-lib, PDF.js, JSZip). No server is needed, so the site works on the free Spark plan.
- The optional FastAPI backend (`/backend`) only powers the admin dashboard, the contact form inbox and anonymous usage counts. It is **not** deployed on Spark. Without it:
  - the contact form shows the support email instead of sending;
  - usage counting is silently skipped;
  - `/admin` will not work.

## Deploy (no billing required)
```bash
cd frontend
yarn install
yarn build                      # prints "Prerendered N pages + sitemap.xml"
cd ..
npm install -g firebase-tools
firebase login
firebase use --add              # select your Firebase project
firebase deploy --only hosting
```
`firebase.json` serves `frontend/build` with `cleanUrls`, so `/merge-pdf` serves `merge-pdf.html`. Unknown routes fall back to `app.html`, which has `noindex`.

> Do not upgrade to the Blaze plan or enable Cloud Run. The configuration does not need them.

## Before going live
1. Firebase console → Hosting → Add custom domain `mycrushpdf.com`. Then add `www.mycrushpdf.com` and choose **Redirect to mycrushpdf.com**. This gives one canonical host with HTTPS certificates managed by Firebase.
2. Fill the `[CONFIG: …]` placeholders in `frontend/src/data/legal.js` (`BUSINESS`) with real information, or leave them unused. They are not shown publicly.
3. Confirm `support@mycrushpdf.com` is a working inbox, or change `CONTACT_EMAIL` in `legal.js`.
4. Optional: replace `public/og-image.png` and all logo/favicon files by running `python3 frontend/scripts/build_brand.py <PlusJakartaSans[wght].ttf>` (free font from Google Fonts) after any logo change.

## Google Search Console
1. Go to https://search.google.com/search-console and choose **Add property → Domain**, then enter `mycrushpdf.com`.
2. Add the TXT record Google gives you at your DNS provider and click **Verify**. Do not paste a verification code into the code unless you choose the HTML-tag method.
3. Open **Sitemaps** and submit `https://mycrushpdf.com/sitemap.xml`.
4. Use **URL Inspection** on `/`, `/merge-pdf` and `/compress-pdf`, then click **Request indexing**.
5. Check **Pages** (indexing status), **Core Web Vitals** and **Performance** (queries, clicks, CTR) weekly.

## Bing Webmaster Tools
1. Go to https://www.bing.com/webmasters and choose **Import from Google Search Console** (fastest), or verify by DNS.
2. Open **Sitemaps** and submit `https://mycrushpdf.com/sitemap.xml`.

## Analytics (optional)
Google Analytics 4 is **not** installed. If you add it, first add a consent banner and update the Privacy and Cookie policies. No tracking IDs are hard-coded.

## AdSense readiness
- `public/ads.txt` is a placeholder. Once approved, replace it with `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0` using your real publisher ID.
- `AdSlot` renders nothing until a publisher ID is configured. Ads are never placed next to upload or download controls.
- A consent management platform (Google's CMP in AdSense is free) is required for EEA/UK visitors before serving ads.

## Optional backend (paid hosting, not needed for the tools)
`backend/Dockerfile` can run on any container host if you later want the admin dashboard and contact inbox. Add an `/api/**` rewrite to that host in `firebase.json` only after it exists.
