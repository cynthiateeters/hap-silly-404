# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A static site deployed on Netlify with a custom 404 page that fetches a passive-aggressive roast from a Netlify serverless function. The function calls the Groq API (free tier, `llama-3.3-70b-versatile`) and falls back to hardcoded insults if the API is unavailable.

## Architecture

- `index.html` — landing page explaining the site
- `404.html` — the main attraction; fetches `/.netlify/functions/insult` on load, picks a random HAP pose from Cloudinary
- `css/style.css` — shared styles for both pages; all colors use `hsl()` via CSS custom properties prefixed `--hap-*`
- `netlify/functions/insult.mjs` — ES module serverless function (Netlify Functions v2); returns `{ insult, source }` JSON
- `netlify.toml` — sets publish root to `.`, functions directory, and the wildcard 404 redirect

## Environment variables

Set in the Netlify dashboard under Site configuration → Environment variables. Local dev pulls them via `ntl dev`.

- `GROQ_API_KEY` — required for live roasts. Without it, the function returns a hardcoded fallback insult.
- `GROQ_MODEL` — optional; defaults to `llama-3.3-70b-versatile`.
- `SITE_URL` — required **in production only**; canonical site origin used for the CORS allowlist and the function's origin check. Set to `https://hap-silly-404.netlify.app` (or your site's URL). For local `ntl dev`, the function auto-detects `NETLIFY_DEV=true` and defaults to `http://localhost:8888`, so no local configuration is needed.

A non-secret override is supported for unusual local setups: `SITE_URL=http://localhost:9000 ntl dev` lets you run on a different port. Never put secrets like `GROQ_API_KEY` in a local `.env` — those live in the Netlify dashboard.

## Local development

```bash
netlify dev
```

This starts a local server with functions support. Visit `http://localhost:8888/this-page-does-not-exist` to trigger the 404 page.

## Docs and reports

- `docs/` — student-facing tutorials; ships with the repo and is tracked in git. Add new teaching content here.
- `reports/` — instructor working documents; gitignored, never committed. The security audit and other reference material live here.

## HAP poses

Poses are served from Cloudinary (`res.cloudinary.com/cynthia-teeters`) under `canvas/hap/`. The 404 page picks randomly from four pose IDs defined in the `HAP_POSES` array in `404.html`. To add a pose, upload the image to Cloudinary at the correct path and add an entry to that array.
