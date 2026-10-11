# Konjo Production — website

React + Vite + React Router, GSAP/ScrollTrigger, and React Three Fiber (Three.js + Drei). Email is sent by a Vercel serverless function using Resend.

## Routes
`/` Home (pointer-depth photo composition → bounded pinned scroll into selected work) · `/work` (Photography / Films, category filters) · `/work/:slug` (project + gallery viewer) · `/studio` (3D Studio Explorer with 2D fallback) · `/services` · `/about` · `/contact`

## Run locally
```bash
npm install
npm run dev        # front end only (http://localhost:5173) — the contact form needs the API, see below
npm run build      # production build → dist/
npm run preview    # serve the production build
```
To run the front end **and** `/api/inquiry` together locally, use `npx vercel dev` (after `vercel link`) with a `.env.local` copied from `.env.example`.

## Deploy (Vercel)
1. Push the project to a Git repo and import it at vercel.com (framework: Vite — build `npm run build`, output `dist`). `vercel.json` already makes direct visits to React routes work and leaves `/api/*` alone.
2. Add the environment variables below in **Project → Settings → Environment Variables** and redeploy.

## Email delivery setup (required — not yet configured)
The form posts to `api/inquiry.js`, which validates on the server, applies a honeypot and a per-IP limit (5 per 10 min, per serverless instance), then asks Resend to send the email. It reports success **only if Resend accepts the message**; with no configuration it returns 503 and the form shows a failure message.

1. Create an account at https://resend.com and **add and verify a sending domain** you control (add the DNS records Resend gives you). Gmail addresses cannot be used as the sender.
2. Create an API key.
3. Set in Vercel (see `.env.example`):
   - `RESEND_API_KEY` — your key
   - `RESEND_FROM` — e.g. `Konjo Website <inquiries@your-verified-domain.com>`
   - `INQUIRY_TO` — optional; defaults to `konjoproduction@gmail.com`
4. Redeploy, submit the form once from the live site, and confirm the message reaches konjoproduction@gmail.com with Reply-To set to the visitor.

## Photos
`public/photos/<project>/<id>-{t,m,l}.webp` are 520 / 1000 / 1600 px WebP versions generated from the original uploads by `scripts/prepare-photos.py` (it also writes `src/data/manifest.json`). To regenerate from the originals: `pip install pillow && python3 scripts/prepare-photos.py /path/to/originals` (folders: `serg`, `vending machine`, `solomon`, `dagmawi babi`, `yonas moh`). Mapping: serg → Wedding Portraits · vending_machine → Launch Ceremony · solomon → Tech Festival · dagmawi_babi → Tech Meetup · yonas_moh → Campus Tech Event. Near-duplicate frames and four collage images were left out.

## Structure
`api/` serverless function · `src/pages` routes · `src/components` layout, viewer, 2D explorer · `src/three` Studio scene (lazy-loaded) · `src/data` projects, films, services · `src/styles/global.css`.

## Content notes
Photo descriptions only state what the photographs show. Reels are listed by category and are never presented as belonging to a particular photo project. Films play on Instagram (optional click-to-load Instagram embed, plus a direct link). Replace a film card with a hosted video file later in `src/pages/Work.jsx` (`FilmCard`).
