---
title: "Local debugging with DevTools and netlify dev"
type: tutorial
sources:
  - "[[security-audit-and-hardening-recommendations]]"
  - "[[hardening-walkthrough-applying-each-audit-fix]]"
tags: [browser-devtools, netlify, api-security]
created: 2026-04-18
updated: 2026-04-18
status: draft
reading_order: 2
---

# Local debugging with DevTools and netlify dev

## Before you read this

You'll get the most out of this if you've already:

- Cloned this repo and have it on your machine
- Have Node.js and the Netlify CLI installed (`npm install -g netlify-cli`)
- Have linked the site to your Netlify account (`netlify link`)
- Have opened browser DevTools before — even just to poke around

You don't need to have debugged anything yet. That's what this is for.

---

## Getting the project running locally

Before you can debug anything, you need the local server running.

```bash
netlify dev
```

That's it. The CLI will:

1. Authenticate to your Netlify account
2. Pull environment variables from the Netlify dashboard
3. Start a local static file server
4. Start the serverless function runtime
5. Sit in front of both on port 8888

Visit `http://localhost:8888/this-page-does-not-exist` in your browser. You should see the HAP 404 page load and display a roast. If that works, you're ready to debug.

> **Important:** always use port 8888, never 3999. The CLI runs the static server internally on 3999, but 8888 is where the function runtime and redirects live. Hitting 3999 directly means functions and headers won't work.

---

## A quick word on serverless functions

This app has a backend — the `insult.mjs` file in `netlify/functions/` — but there's no server process to start, no Express app, no database. Instead, Netlify runs individual functions on demand, each as its own isolated process, and tears them down when the request is done. That's what "serverless" means in practice: you write a function, the platform handles everything else.

Locally, `netlify dev` simulates that: when your browser fetches `/.netlify/functions/insult`, the CLI spins up a Node process, runs the function, and returns the response. The function's `console.log` calls print in the terminal, not the browser. This is the key thing to internalize:

- **Server-side logs → terminal**
- **Client-side logs → browser DevTools Console**

When something goes wrong, knowing which side the problem is on tells you where to look first.

---

## The two-window setup

Open two windows side by side:

- **Window 1 — Terminal:** `netlify dev` running and visible. The output scrolls when you reload, so you want to see it in real time.
- **Window 2 — Browser:** `http://localhost:8888/this-page-does-not-exist` with DevTools open (`Cmd+Opt+I` on macOS, `F12` on Windows/Linux). Pin DevTools to the right side of the window, not the bottom — you want the page and the panel both visible.

In DevTools, you'll use four tabs:

- **Network** — every HTTP request the page makes, with status, headers, and response bodies
- **Console** — client-side JavaScript errors and `console.log` from `js/404.mjs`
- **Issues** — security and policy issues the browser surfaces (CSP violations live here)
- **Sources** — set breakpoints to step through client code line by line

---

## Reading `netlify dev` output

Here's what healthy startup output looks like, explained line by line:

```text
⬥ Injecting environment variable values for all scopes
```

The CLI pulled env vars from the Netlify dashboard and merged them into `process.env` for the local function runtime. If `GROQ_API_KEY` is set in the dashboard, it's now in scope.

```text
⬥ Loaded function insult
```

The CLI scanned `netlify/functions/`, found `insult.mjs`, and registered it at `/.netlify/functions/insult`. If you rename the file or break its `export default`, this line disappears or becomes an error.

```text
⬥ Static server listening to 3999
⬥ Local dev server ready: http://localhost:8888
```

Two ports. Static files on 3999, everything else on 8888. Use 8888.

```text
⬥ Rewrote URL to /404.html
```

A request came in for a path that didn't match any file. The redirect rule in `netlify.toml` rewrote the response to serve `404.html` with a 404 status. This line means your custom 404 page is being served correctly.

```text
Request from ::1: GET /.netlify/functions/insult?t=1776525327814
Response with status 200 in 312 ms.
```

A request hit the function. `::1` is IPv6 localhost. The `?t=...` is a cache-buster added by `js/404.mjs`. A 200 means success.

### What the function's own logs look like

Any `console.log`, `console.warn`, or `console.error` in `insult.mjs` appears here, interleaved with the request lines:

- `SITE_URL is not set in production env. Insult function will return 500.` — should never appear under `netlify dev`; if it does, your CLI may need updating
- `Groq API returned 429` — Groq rate-limited the request; the function falls back to a hardcoded insult and still returns 200
- `Groq response missing expected content shape.` — Groq returned 200 but with unexpected JSON; same fallback behavior

When debugging, add temporary `console.log` calls in the function and watch them appear here. Remove them before committing.

### Status codes at a glance

| Status | Meaning in this app                           |
| ------ | --------------------------------------------- |
| 200    | Success — JSON with insult and source         |
| 403    | Origin check rejected the request             |
| 405    | Wrong HTTP method (function only accepts GET) |
| 429    | Rate limit exceeded                           |
| 500    | `SITE_URL` missing in a non-dev environment   |

Any other status — a 404 on the function path, a 502 — usually means a syntax error prevented the function from loading, or the URL is wrong.

---

## DevTools quick tour for this app

### Network tab

Reload the 404 page with DevTools open. You should see roughly this sequence of requests:

| Name                       | Status | Type       |
| -------------------------- | ------ | ---------- |
| `this-page-does-not-exist` | 404    | document   |
| `style.css`                | 200    | stylesheet |
| `404.css`                  | 200    | stylesheet |
| `404.mjs`                  | 200    | script     |
| `insult?t=…`               | 200    | fetch      |
| `hap-...` (Cloudinary)     | 200    | image      |

The 404 on the document is **expected** — the URL doesn't exist, so the server returns 404 and the redirect rule serves `404.html`. The browser logs "Failed to load resource" for it. That message is harmless.

Click any row to inspect it. The sub-tabs that matter:

- **Headers** — request and response headers. This is where you check CORS, CSP, content-type, and status.
- **Preview / Response** — the response body. For the function, use Preview to see parsed JSON.
- **Timing** — connection time, time to first byte, download time. Useful when something is slow.

### Console tab

Client-side JavaScript errors land here. Common entries for this app:

- `Failed to load resource: 404` on the document — expected, ignore it
- `Failed to load resource: 500` on the function — not expected; check the `netlify dev` terminal for the cause
- `Refused to apply style ... MIME type 'text/html'` — a stylesheet `<link>` is pointing to a URL that returned an error page; usually a path typo
- `Uncaught TypeError: Cannot read properties of null` from `404.mjs` — a `querySelector` returned null, usually because an `id` in the HTML was changed without updating the script

### Issues tab

Security and policy issues the browser surfaces:

- **CSP violations** appear here with messages like `Refused to load the image ... because it violates ... img-src`. Each entry names the directive and the blocked resource. Under a temporary `Content-Security-Policy-Report-Only` deployment the same message is prefixed with `[Report Only]`.
- Deprecated API warnings.
- Cookie / SameSite issues.

The repo's current CSP is enforcing (`Content-Security-Policy` in `netlify.toml`), so violations block the resource. When you test a new directive by temporarily deploying `Content-Security-Policy-Report-Only`, the Issues tab is your main monitoring surface for the 24–48 hours before promoting to enforcing mode.

### Sources tab — setting a breakpoint

When the function returns 200 but the page renders wrong, the bug is in the client. To step through `js/404.mjs`:

1. Open DevTools → Sources
2. In the file tree, expand `localhost:8888 → js → 404.mjs`
3. Click a line number to set a breakpoint (try the line after `await response.json()`)
4. Reload or click "Generate a new roast" — execution pauses at the breakpoint
5. Hover variables to inspect their values; the right panel shows the call stack and scope

This is faster than adding `console.log` everywhere.

---

## Walkthroughs of real problems

### Problem 1 — Function returns 500

**What you see in the browser:** Network tab shows `insult?t=...` with status 500. The page shows the fallback message.

**How to diagnose:**

1. Switch to the `netlify dev` terminal. Look for this log line before the 500:

   ```text
   SITE_URL is not set in production env. Insult function will return 500.
   ```

2. If you see it: `NETLIFY_DEV` isn't being injected. Stop and restart `netlify dev` from the project root. If the problem persists, update the Netlify CLI.

3. If you don't see it: the 500 is from somewhere else. Add `console.log` calls in `insult.mjs` to narrow it down.

---

### Problem 2 — CSP violation

**What you see in DevTools:** Issues tab shows entries like `Refused to load the image 'https://example.com/foo.jpg' because it violates ... img-src`. Under a temporary Report-Only deployment the message is prefixed with `[Report Only]` and the resource still loads.

**How to diagnose:**

1. Read the directive name — that tells you which source list to widen.
2. Decide if the blocked resource is intentional. If yes, widen the directive in `netlify.toml`. If no, fix the code loading it.
3. In the repo's enforcing CSP, the browser blocks the resource outright. If you're testing a new directive in Report-Only mode, the resource still loads and the message is only a warning — until you promote to enforcing.
4. Hard-reload (`Cmd+Shift+R`) after every `netlify.toml` edit. Headers are aggressively cached.

---

### Problem 3 — CORS rejection

**What you see in the browser:**

```text
Access to fetch at 'http://localhost:8888/.netlify/functions/insult'
from origin 'http://localhost:3000' has been blocked by CORS policy:
The 'Access-Control-Allow-Origin' header has a value 'http://localhost:8888'
that is not equal to the supplied origin.
```

**How to diagnose:**

1. The error message tells you exactly what's wrong: origin mismatch.
2. Network → click the function row → Headers. Compare:
   - **Request Headers → Origin** — where the request came from
   - **Response Headers → Access-Control-Allow-Origin** — what the server allows
3. If they don't match, check the `SITE_URL` configuration in `insult.mjs` and the Netlify dashboard.

For a deeper explanation of why this happens, see `[[cors-is-hard-and-everyone-hates-it]]`.

---

### Problem 4 — Rate limit (429)

**What you see:** function row shows 429. Page falls back to the canned roast.

**How to diagnose:**

1. Click the row → Headers → look for `Retry-After`.
2. Wait the indicated number of seconds, then try again.
3. If you're consistently hitting 429s during development, temporarily increase `windowLimit` in `insult.mjs`. Revert before committing — the tight limit is intentional in production.

---

### Problem 5 — Origin check rejection (403)

**What you see:** function row shows 403. Response body: `{"error":"Forbidden."}`.

**How to diagnose:**

1. Network → request row → Headers. Check **Origin** and **Referer** in the request headers — one must match `allowedOrigin`.
2. Most common cause: calling the function directly with curl without setting an Origin header:

   ```bash
   # This fails (no Origin header):
   curl -i http://localhost:8888/.netlify/functions/insult

   # This works:
   curl -i -H "Origin: http://localhost:8888" \
     http://localhost:8888/.netlify/functions/insult
   ```

3. Real browsers always send `Origin` for fetch calls, so the 404 page itself never hits this.

---

### Problem 6 — Groq API failure with silent fallback

**What you see:** the page shows a roast, but it sounds canned. Network shows 200.

**How to diagnose:**

1. Click the function row → Preview. Check `"source"` in the JSON. If it says `"fallback"` instead of `"groq"`, the live API path failed.
2. Switch to the `netlify dev` terminal and look for:
   - `Groq API returned 401` — bad or expired API key; rotate it in the Netlify dashboard
   - `Groq API returned 429` — Groq rate-limited the request; wait or reduce frequency
   - `Groq API returned 5xx` — Groq is down; check their status page
   - `Groq response missing expected content shape.` — the response shape changed; add `console.log(JSON.stringify(data))` before the parse to inspect it

---

## Common gotchas

- **Hitting port 3999 instead of 8888.** Static files load but the function returns 404. Always use 8888.
- **Stale cache.** Hard-reload (`Cmd+Shift+R`) after editing HTML, CSS, or `netlify.toml`. Or check "Disable cache" in the Network tab while DevTools is open.
- **Stale env vars.** If you change a value in the Netlify dashboard, stop `netlify dev` (Ctrl-C) and restart. The CLI fetches env vars at startup and caches them for the session.
- **A browser extension interfering.** Open the page in a private/incognito window with extensions disabled to rule this out.
- **Works locally but fails in production.** Shell exports and local `.env` files don't deploy. Anything required in production must be in the Netlify dashboard under Site configuration → Environment variables.

---

## Debugging order

When something breaks, resist the urge to start changing code immediately. This order works:

1. **Read the symptom.** What status code? What error message? Which file?
2. **Check the `netlify dev` terminal first** if the symptom is a non-200 from the function. The function logs the _cause_; the browser only sees the _result_.
3. **Check DevTools Network → Headers** for HTTP-shaped problems (status codes, CORS, CSP, content-type).
4. **Check DevTools Console** for client-side JavaScript errors.
5. **Check DevTools Issues** for security and policy violations.
6. **Add temporary `console.log` calls** in the function or the client to narrow further. Remove before committing.
7. **Reproduce in a clean tab** (incognito, no extensions, hard reload) to rule out caching or extension interference.

The single most useful skill is knowing which surface to check first for which symptom. The walkthroughs above are your cheat sheet until that becomes second nature.
