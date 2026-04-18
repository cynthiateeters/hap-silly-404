---
title: "CORS is hard and everyone hates it"
type: tutorial
sources:
  - "[[hardening-walkthrough-applying-each-audit-fix]]"
  - "[[local-debugging-with-devtools-and-netlify-dev]]"
tags: [api-security, browser-devtools, netlify]
created: 2026-04-18
updated: 2026-04-18
status: draft
reading_order: 1
---

# CORS is hard and everyone hates it

## Before you read this

You'll get the most out of this if you've already:

- Made at least one `fetch()` call from a browser and seen it succeed
- Seen a CORS error in the DevTools console (red text, mentions `Access-Control-Allow-Origin`)
- Looked at the Network tab in DevTools at least once — you don't need to understand everything there, just know it exists

You don't need to understand servers deeply. This report uses the `insult.mjs` serverless function in this repo as a running example, but all the concepts apply to any API you call from a browser.

---

## Why CORS feels like punishment

A typical first encounter:

1. You wrote a working backend.
2. You wrote a working frontend.
3. You open the frontend in a browser, it calls the backend, and the console fills with red:

   ```text
   Access to fetch at 'https://api.example.com/data' from origin
   'http://localhost:5173' has been blocked by CORS policy: No
   'Access-Control-Allow-Origin' header is present on the requested resource.
   ```

4. You search the error. Five Stack Overflow answers say five different things. One says add `Access-Control-Allow-Origin: *`. You do it. It works. You feel like you cheated and you're not sure why.

That's the universal experience. The rest of this report exists so you understand what actually happened in that sequence.

---

## The problem CORS is solving

Browsers run code from many websites in the same process. When you visit `evil.com`, JavaScript on that page can issue HTTP requests to _any_ URL — including `bank.com`. Without protection, that script could read your account balance, because _your_ browser holds _your_ session cookie for `bank.com`. The server can't tell the request came from `evil.com` rather than from you directly.

The **same-origin policy (SOP)** is the browser's defense. By default, JavaScript on `evil.com` _can_ send a request to `bank.com`, but it cannot _read the response_. Fire and forget, no snooping.

That default is too strict for the modern web — legitimate cross-origin APIs exist. **CORS is the controlled relaxation of the same-origin policy.** It lets the _server_ opt in to specific _origins_ reading its responses. The browser enforces the rule; the server provides the configuration.

Two things follow from this:

1. **CORS is a browser thing.** Curl, Postman, your Python script — none of them check or care about CORS headers. CORS exists to protect users _from JavaScript running in their browser_.
2. **CORS is the server's permission to the browser.** It controls whether JS may _read_ a response. It does not prevent the request from being sent.

---

## Origin: the only word you really need

An "origin" is the combination of `scheme + host + port`. These are all different origins:

- `http://localhost:8888` ≠ `http://localhost:3000` (different port)
- `http://localhost:8888` ≠ `https://localhost:8888` (different scheme)
- `https://hap-silly-404.netlify.app` ≠ `https://www.hap-silly-404.netlify.app` (different host)

When JavaScript on origin A fetches from origin B (anything not exactly equal to A), that's a cross-origin request. The browser will send it, but won't let A's JavaScript read the response unless B's response includes CORS headers granting permission.

In this repo, `404.html` is loaded from `http://localhost:8888` (in dev) or `https://hap-silly-404.netlify.app` (in production). The fetch goes to `/.netlify/functions/insult` — a relative URL — which resolves to the same origin as the page. **That's a same-origin request, not cross-origin.**

So why does this repo set CORS headers at all? Because the function endpoint is also publicly callable from _any_ origin — without restriction, any other site could call it from a browser and drain your Groq quota. Setting `Access-Control-Allow-Origin` to your own origin is a "no" to everyone else's browser code trying to use your function.

This is a subtler CORS scenario: **same-origin in normal use, blocking cross-origin abuse.** CORS isn't only "I'm calling someone else's API" — it's also "I'm preventing other people's pages from calling mine."

---

## A glossary you can actually use

CORS suffers from terrible naming. Here's what the spec words actually mean:

| Spec word                      | Plain meaning                                                                                            |
| ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Origin                         | `scheme + host + port` — the thing requests are "from"                                                   |
| Cross-origin                   | Request from one origin to a different one                                                               |
| Same-origin                    | Request to the same origin — CORS doesn't apply                                                          |
| Preflight                      | Browser sends a preliminary `OPTIONS` request to check if the real request is allowed, before sending it |
| Simple request                 | GET/HEAD/POST with common headers — skips preflight                                                      |
| Credentials                    | Cookies, HTTP auth, client certs                                                                         |
| `Access-Control-Allow-Origin`  | "Browser, JS from this origin may read this response"                                                    |
| `Access-Control-Allow-Methods` | "Browser, you may use these HTTP methods"                                                                |
| `Access-Control-Allow-Headers` | "Browser, you may send these custom request headers"                                                     |
| `Vary: Origin`                 | "Cache: don't reuse this response for a different origin"                                                |

The naming is bad because five headers all start with `Access-Control-Allow-`, which sounds like authorization but is really permission grants from server to browser. "Simple request" is neither simple to memorize nor simple in practice. "Preflight" sounds like aviation safety — which is roughly right, but the docs rarely say plainly "we send an OPTIONS request first."

---

## The five errors you'll actually see

### 1. "No 'Access-Control-Allow-Origin' header is present"

The server didn't include the header at all. Either CORS isn't configured, or the request hit an error path that bypassed the CORS middleware.

**Fix:** make the server include the header on _every_ response, including errors. In `insult.mjs`, every `new Response(...)` — the 405, 403, 500, and success paths — all include `CORS_HEADERS`.

### 2. "The value 'X' is not equal to the supplied origin 'Y'"

The server set the header to a specific origin that doesn't match the page's origin. Common cause: `SITE_URL` is set to the production URL but you're testing locally.

**Fix:** return the _requesting_ origin after validating it against an allowlist, or use the dev-default pattern in `insult.mjs` so local dev gets `http://localhost:8888` automatically.

### 3. "Response to preflight doesn't pass access control check"

The `OPTIONS` preflight came back without the right headers or returned a non-2xx status. The real request never goes out.

**Fix:** handle `OPTIONS` explicitly and return `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`, and a 200 status.

### 4. "Cross-Origin Read Blocking (CORB) blocked cross-origin response"

Different from CORS. CORB is the browser deciding a response shouldn't be passed to the page based on its content type. Usually means loading JSON via a `<script>` tag.

**Fix:** use `fetch` for JSON, not `<script>`.

### 5. "Refused to connect because it violates Content Security Policy: connect-src"

This is a **CSP error, not a CORS error** — they look similar enough to confuse people. CSP is about what destinations the _page_ may connect to. CORS is about whether the _server_ permits the read. You can have a successful CORS exchange that CSP then blocks.

**Fix:** widen `connect-src` in the CSP header in `netlify.toml`.

---

## Why `Access-Control-Allow-Origin: *` is the wrong easy answer

It works, mostly. It's in half the tutorials. And it's almost always wrong.

- **It defeats the point.** `*` is "any website on the internet." If you wanted that, you wanted a public unauthenticated endpoint, not CORS configuration.
- **It's incompatible with credentials.** If your endpoint ever uses cookies or auth headers, the browser will silently refuse to send them when ACAO is `*` — and you'll spend hours debugging phantom 401s.
- **It invites quota abuse.** This repo calls the Groq API. With `*`, any website could use your function as a free Groq proxy.
- **It hides intent.** A specific origin value is documentation. `*` tells the next reader nothing about which origins should have access.

The right answer: list the origins you actually trust. For most projects that's one production origin and one local dev origin.

---

## Two scenarios, two playbooks

### Scenario A — you're calling someone else's API

The server either allows your origin or it doesn't. If it doesn't, **you cannot fix this from the browser.** No amount of frontend code will help.

What you can do: write a thin server-side proxy. Your backend calls the third-party API server-to-server (where CORS doesn't apply) and re-exposes the result on your own origin. This is exactly what `insult.mjs` does for Groq — CORS only needs to be solved once, on your own function.

### Scenario B — you control the API

You can set the headers however you want. The minimum policy that works:

```js
const ALLOWED_ORIGINS = new Set(["https://your-prod-site.example", "http://localhost:8888"]);

const origin = request.headers.get("origin");
const acao = ALLOWED_ORIGINS.has(origin) ? origin : null;

const headers = {
  "Content-Type": "application/json",
  ...(acao ? { "Access-Control-Allow-Origin": acao, Vary: "Origin" } : {}),
};
```

This repo uses a simpler variant — one production origin from `SITE_URL` with a dev fallback. The trade-off is you can't easily support multiple production domains. For class projects, that's fine.

---

## Debugging checklist

When you see a CORS error, work through this in order:

- [ ] Read the full error message — it almost always names the exact header that's wrong or missing
- [ ] Open the Network tab and find the failing request
- [ ] Check **Request Headers → Origin** — what origin does the browser think the page is on?
- [ ] Check **Response Headers → Access-Control-Allow-Origin** — what did the server send?
- [ ] Do they match exactly? (scheme, host, port — all three)
- [ ] Is there an `OPTIONS` request just before the failing one? If so, click it — did it return 200 with CORS headers? If not, preflight failed
- [ ] Try the same request with `curl` — if curl succeeds but the browser fails, that confirms it's a CORS issue, not an API issue
- [ ] If everything looks right, check for typos in the header value and extra whitespace

---

## Try it in this repo

**Goal:** deliberately trigger a CORS error, then fix it.

1. Start the local server: `netlify dev`
2. Open `http://localhost:8888/this-page-does-not-exist` — confirm the insult loads.
3. Open `insult.mjs` and change `NETLIFY_DEV` branch to return `https://definitely-not-your-origin.example` as the `Access-Control-Allow-Origin` value instead of the real one.
4. Reload the 404 page. You should see a CORS error in the console.
5. Open DevTools → Network → click the `insult` request → Headers. Find both the `Origin` request header and the `Access-Control-Allow-Origin` response header. See the mismatch.
6. Revert your change. Confirm the insult loads again.

That round trip — introduce the error, read the headers, understand the mismatch, fix it — is the core of every CORS debugging session you'll ever have.

---

## The three things to remember

1. **CORS is the server granting the browser permission to let JS read a response.** Not authentication, not request authorization — just "browser, you may show this to that origin's JavaScript."
2. **CORS only matters in browsers.** If it works in curl but fails in the browser, it's almost always CORS.
3. **Specific origins, not wildcards.** Set `Access-Control-Allow-Origin` to exactly the origin you want, and use `Vary: Origin` if it's dynamic. The wildcard is a footgun.

Everything else is mechanics. The mechanics are annoying. The model is small.
